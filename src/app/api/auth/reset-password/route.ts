import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  checkRateLimit,
  clearRateLimit,
  createRateLimitKey,
  getClientIP,
  RATE_LIMIT_CONFIGS,
  isValidPhone,
  normalizePhone,
  isOTPVerified,
  clearOTP,
  checkPasswordStrength
} from '@/lib/security';

// POST /api/auth/reset-password - SMS код менен сырсөз өзгөртүү
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  try {
    const body = await request.json();
    const { phone, code, newPassword } = body;

    // 1. Rate limiting
    const rateLimitKey = createRateLimitKey('resetPassword', ip);
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.passwordReset);

    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: `Өтө көп аракет. ${Math.ceil(rateLimit.retryAfterSeconds! / 60)} мүнөттөн кийин кайталаңыз`,
        code: 'RATE_LIMITED'
      }, { status: 429 });
    }

    // 2. Валидация
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({
        error: 'Туура эмес телефон номери',
        code: 'INVALID_PHONE'
      }, { status: 400 });
    }

    if (!newPassword) {
      return NextResponse.json({
        error: 'Жаңы сырсөз керек',
        code: 'MISSING_PASSWORD'
      }, { status: 400 });
    }

    // 3. Сырсөз күчүн текшерүү
    const passwordStrength = checkPasswordStrength(newPassword);
    if (!passwordStrength.isValid) {
      return NextResponse.json({
        error: passwordStrength.errors[0],
        code: 'WEAK_PASSWORD'
      }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

    // 4. OTP тастыкталганын текшерүү
    if (!isOTPVerified(normalizedPhone)) {
      return NextResponse.json({
        error: 'Телефон тастыкталган эмес. Биринчи код алыңыз.',
        code: 'PHONE_NOT_VERIFIED'
      }, { status: 400 });
    }

    // 5. Колдонуучуну табуу
    const supabase = await createServerSupabaseClient();

    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email')
      .eq('phone', normalizedPhone)
      .single();

    if (findError || !user) {
      return NextResponse.json({
        error: 'Бул номер менен колдонуучу табылган жок',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    // 6. Supabase Admin API менен сырсөз өзгөртүү
    // Эскертүү: Бул service_role key талап кылат
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);

      // Эгер admin API жок болсо, башка жол
      // Колдонуучуга email жөнөтүү
      if (user.email) {
        await supabase.auth.resetPasswordForEmail(user.email, {
          redirectTo: `${request.headers.get('origin')}/auth/reset-password`
        });

        return NextResponse.json({
          success: true,
          message: 'Email\'ге шилтеме жөнөтүлдү',
          method: 'email'
        });
      }

      return NextResponse.json({
        error: 'Сырсөздү өзгөртүүдө ката',
        code: 'UPDATE_FAILED'
      }, { status: 500 });
    }

    // 7. OTP тазалоо
    clearOTP(normalizedPhone);
    clearRateLimit(rateLimitKey);

    return NextResponse.json({
      success: true,
      message: 'Сырсөз ийгиликтүү өзгөртүлдү!'
    });

  } catch (err: any) {
    console.error('Reset password error:', err);

    return NextResponse.json({
      error: 'Серверде ката кетти',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}