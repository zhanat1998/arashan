import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  createRateLimitKey,
  getClientIP,
  RATE_LIMIT_CONFIGS,
  isValidPhone,
  isValidOTP,
  normalizePhone,
  verifyOTP,
  getOTPTimeRemaining
} from '@/lib/security';

// POST /api/auth/verify-otp - SMS кодду текшерүү
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  try {
    const body = await request.json();
    const { phone, code } = body;

    // 1. Input валидация
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({
        error: 'Туура эмес телефон номери',
        code: 'INVALID_PHONE'
      }, { status: 400 });
    }

    if (!code || !isValidOTP(code)) {
      return NextResponse.json({
        error: 'Код 6 цифрадан турушу керек',
        code: 'INVALID_OTP_FORMAT'
      }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

    // 2. Rate limiting
    const rateLimitKey = createRateLimitKey('otp-verify', normalizedPhone, ip);
    const rateLimit = checkRateLimit(rateLimitKey, {
      maxAttempts: 5,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: `Өтө көп аракет. ${Math.ceil(rateLimit.retryAfterSeconds! / 60)} мүнөттөн кийин кайталаңыз`,
        code: 'RATE_LIMITED'
      }, { status: 429 });
    }

    // 3. OTP текшерүү
    const result = verifyOTP(normalizedPhone, code);

    if (!result.success) {
      return NextResponse.json({
        error: result.error,
        code: 'INVALID_OTP',
        attemptsRemaining: result.attemptsRemaining
      }, { status: 400 });
    }

    // 4. Ийгиликтүү
    return NextResponse.json({
      success: true,
      message: 'Телефон тастыкталды',
      verified: true
    });

  } catch (err: any) {
    console.error('Verify OTP error:', err);

    return NextResponse.json({
      error: 'Серверде ката кетти',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}

// GET /api/auth/verify-otp - OTP статусун текшерүү
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone || !isValidPhone(phone)) {
    return NextResponse.json({
      error: 'Туура эмес телефон номери'
    }, { status: 400 });
  }

  const normalizedPhone = normalizePhone(phone);
  const timeRemaining = getOTPTimeRemaining(normalizedPhone);

  return NextResponse.json({
    hasActiveOTP: timeRemaining !== null,
    timeRemaining
  });
}