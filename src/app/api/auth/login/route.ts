import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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

  // Response object - cookies коюу үчүн
  let response = NextResponse.json({ success: true });

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

    // 3. Supabase client - cookies response'го коюлат
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                path: '/',
              });
            });
          },
        },
      }
    );

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

    // 7. Коопсуз жооп - cookies менен кайтаруу
    const finalResponse = NextResponse.json({
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

    // Supabase cookies'ти акыркы response'го көчүрүү
    response.cookies.getAll().forEach(cookie => {
      finalResponse.cookies.set(cookie.name, cookie.value, {
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
      });
    });

    return finalResponse;

  } catch (err: any) {
    console.error('Login error:', err);

    return NextResponse.json({
      error: 'Серверде ката кетти',
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
}