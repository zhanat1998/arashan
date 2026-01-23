import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  checkRateLimit,
  clearRateLimit,
  createRateLimitKey,
  getClientIP,
  RATE_LIMIT_CONFIGS,
  validateRegisterInput,
  checkPasswordStrength,
  isOTPVerified,
  clearOTP
} from '@/lib/security';

// POST /api/auth/register - Коопсуз регистрация
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  try {
    const body = await request.json();
    const { email, password, fullName, phone, role } = body;

    // 1. Rate limiting текшерүү
    const rateLimitKey = createRateLimitKey('register', ip);
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.register);

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

    // 2. Input валидация
    const validation = validateRegisterInput({
      email: email?.trim(),
      phone: phone?.trim(),
      password,
      fullName: fullName?.trim()
    });

    if (!validation.isValid) {
      return NextResponse.json({
        error: validation.errors,
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    // 3. Сырсөз күчүн текшерүү
    const passwordStrength = checkPasswordStrength(password);
    if (!passwordStrength.isValid) {
      return NextResponse.json({
        error: {
          password: passwordStrength.errors[0]
        },
        passwordStrength: {
          score: passwordStrength.score,
          errors: passwordStrength.errors,
          suggestions: passwordStrength.suggestions
        },
        code: 'WEAK_PASSWORD'
      }, { status: 400 });
    }

    // 4. Телефон верификациясын текшерүү (эгер берилсе)
    if (validation.sanitized.phone) {
      // Production'до SMS верификация текшерүү
      // if (!isOTPVerified(validation.sanitized.phone)) {
      //   return NextResponse.json({
      //     error: { phone: 'Телефон номерин тастыктаңыз' },
      //     code: 'PHONE_NOT_VERIFIED'
      //   }, { status: 400 });
      // }
    }

    // 5. Supabase менен регистрация
    const supabase = await createServerSupabaseClient();

    // Email мурунтан барбы текшерүү
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validation.sanitized.email)
      .single();

    if (existingUser) {
      return NextResponse.json({
        error: { email: 'Бул email мурунтан катталган' },
        code: 'EMAIL_EXISTS'
      }, { status: 400 });
    }

    // Колдонуучу түзүү
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validation.sanitized.email,
      password,
      options: {
        data: {
          full_name: validation.sanitized.fullName,
          phone: validation.sanitized.phone,
          role: role === 'seller' ? 'seller' : 'client'
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError);

      if (authError.message.includes('already registered')) {
        return NextResponse.json({
          error: { email: 'Бул email мурунтан катталган' },
          code: 'EMAIL_EXISTS'
        }, { status: 400 });
      }

      return NextResponse.json({
        error: { general: 'Катталууда ката кетти' },
        code: 'AUTH_ERROR'
      }, { status: 500 });
    }

    // 6. Колдонуучу профилин түзүү
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: validation.sanitized.email,
          full_name: validation.sanitized.fullName || null,
          phone: validation.sanitized.phone || null,
          role: role === 'seller' ? 'seller' : 'client',
          coins: 100, // Саламдашуу бонусу
          is_verified: false,
          created_at: new Date().toISOString(),
          registration_ip: ip
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // 7. Саламдашуу купонун берүү
      try {
        const { data: welcomeCoupon } = await supabase
          .from('coupons')
          .select('id')
          .eq('code', 'WELCOME10')
          .single();

        if (welcomeCoupon) {
          await supabase
            .from('user_coupons')
            .insert({
              user_id: authData.user.id,
              coupon_id: welcomeCoupon.id
            });
        }
      } catch (couponError) {
        console.error('Coupon error:', couponError);
      }

      // 8. Телефон верификациясын тазалоо
      if (validation.sanitized.phone) {
        clearOTP(validation.sanitized.phone);
      }
    }

    // 9. Rate limit тазалоо
    clearRateLimit(rateLimitKey);

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user?.id,
        email: authData.user?.email
      },
      message: 'Катталуу ийгиликтүү! 100 монета жана WELCOME10 купону берилди!',
      bonuses: {
        coins: 100,
        coupon: 'WELCOME10'
      }
    }, {
      status: 201,
      headers: {
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (err: any) {
    console.error('Register error:', err);

    return NextResponse.json({
      error: { general: 'Серверде ката кетти' },
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}