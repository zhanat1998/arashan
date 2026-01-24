import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Ката болсо логинге кайтуу
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
  }

  // Response түзүү (cookie коюу үчүн)
  const response = NextResponse.redirect(new URL('/', requestUrl.origin));

  // Cookie'лерди response'го коюу үчүн Supabase client
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
            // Cookie options оптималдаштыруу
            response.cookies.set(name, value, {
              ...options,
              // Vercel/production үчүн маанилүү
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

  try {
    // Exchange code for session
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);

    if (authError) {
      console.error('Exchange code error:', authError);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(authError.message)}`, requestUrl.origin)
      );
    }

    if (data.user) {
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // Create profile if it doesn't exist
      if (!existingProfile) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
          avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '',
          coins: 100, // Welcome bonus
        });
      }
    }
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(new URL('/auth/login?error=callback_failed', requestUrl.origin));
  }

  return response;
}
