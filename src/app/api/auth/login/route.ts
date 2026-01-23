import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  checkRateLimit,
  clearRateLimit,
  createRateLimitKey,
  getClientIP,
  RATE_LIMIT_CONFIGS,
  validateLoginInput,
  sanitizeInput
} from '@/lib/security';

// POST /api/auth/login - Коопсуз логин
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  try {
    const body = await request.json();
    const { email, phone, password } = body;

    // 1. Input валидация
    const validation = validateLoginInput({
      email: email?.trim(),
      phone: phone?.trim(),
      password
    });

    if (!validation.isValid) {
      return NextResponse.json({
        error: Object.values(validation.errors)[0],
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    const identifier = validation.sanitized.email || validation.sanitized.phone || '';

    // 2. Rate limiting текшерүү
    const rateLimitKey = createRateLimitKey('login', identifier, ip);
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.login);

    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: `Өтө көп аракет. ${Math.ceil(rateLimit.retryAfterSeconds! / 60)} мүнөттөн кийин кайталаңыз`,
        code: 'RATE_LIMITED',
        retryAfter: rateLimit.retryAfterSeconds
      }, {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.resetAt)
        }
      });
    }

    // 3. Supabase менен логин
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validation.sanitized.email || '',
      password
    });

    if (error) {
      // Туура эмес маалымат - бирок так айтпайбыз
      // (хакерлерге email бар/жок билдирбөө үчүн)
      return NextResponse.json({
        error: 'Email же сырсөз туура эмес',
        code: 'INVALID_CREDENTIALS',
        attemptsRemaining: rateLimit.remaining - 1
      }, {
        status: 401,
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining - 1)
        }
      });
    }

    // 4. Ийгиликтүү - rate limit тазалоо
    clearRateLimit(rateLimitKey);

    // 5. Колдонуучу профили жана дүкөн маалыматын алуу
    const [profileResult, shopResult] = await Promise.all([
      supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single(),
      supabase
        .from('shops')
        .select('id, name, logo')
        .eq('owner_id', data.user.id)
        .single()
    ]);

    // 6. Акыркы логин убактысын жаңыртуу
    await supabase
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
        last_login_ip: ip
      })
      .eq('id', data.user.id);

    // 7. Коопсуз жооп
    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        phone: data.user.phone
      },
      profile: profileResult.data,
      shop: shopResult.data,
      session: {
        access_token: data.session?.access_token,
        expires_at: data.session?.expires_at
      }
    }, {
      headers: {
        // Коопсуздук баштары
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });

  } catch (err: any) {
    console.error('Login error:', err);

    return NextResponse.json({
      error: 'Серверде ката кетти',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}