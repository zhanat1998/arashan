import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  createRateLimitKey,
  getClientIP,
  RATE_LIMIT_CONFIGS,
  isValidPhone,
  normalizePhone,
  sendOTPSMS
} from '@/lib/security';

// POST /api/auth/send-otp - SMS код жөнөтүү
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  try {
    const body = await request.json();
    const { phone } = body;

    // 1. Телефон валидация
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({
        error: 'Туура эмес телефон номери',
        code: 'INVALID_PHONE'
      }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

    // 2. Rate limiting - SMS спам коргоо
    const rateLimitKey = createRateLimitKey('sms', normalizedPhone, ip);
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.sms);

    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: `Өтө көп аракет. ${Math.ceil(rateLimit.retryAfterSeconds! / 60)} мүнөттөн кийин кайталаңыз`,
        code: 'RATE_LIMITED',
        retryAfter: rateLimit.retryAfterSeconds
      }, {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds)
        }
      });
    }

    // 3. OTP жөнөтүү
    const result = await sendOTPSMS(normalizedPhone);

    if (!result.success) {
      return NextResponse.json({
        error: result.error || 'SMS жөнөтүүдө ката',
        code: 'SMS_FAILED'
      }, { status: 500 });
    }

    // 4. Ийгиликтүү жооп
    return NextResponse.json({
      success: true,
      message: 'Код жөнөтүлдү',
      phone: normalizedPhone.slice(0, 8) + '****', // Маскаланган номер
      expiresIn: 300, // 5 мүнөт
      attemptsRemaining: rateLimit.remaining
    });

  } catch (err: any) {
    console.error('Send OTP error:', err);

    return NextResponse.json({
      error: 'Серверде ката кетти',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}