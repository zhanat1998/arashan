import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ============================================
  // 1. КООПСУЗДУК HEADERS
  // ============================================
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' blob: https: http:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Server версиясын жашыруу
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  // ============================================
  // 2. ADMIN/SELLER КОРГОО
  // ============================================
  const { pathname } = request.nextUrl;

  // Корголуучу жолдор
  const protectedPaths = ['/admin', '/seller'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    // Supabase client түзүү
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
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Session текшерүү
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Логинге багыттоо
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin үчүн кошумча текшерүү
    if (pathname.startsWith('/admin')) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!user || user.role !== 'admin') {
        // Уруксат жок
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Seller үчүн текшерүү (shop/create баракчасын кошпогондо)
    if (pathname.startsWith('/seller') && !pathname.startsWith('/seller/shop/create')) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
        // Уруксат жок - дүкөн ачуу барагына
        return NextResponse.redirect(new URL('/seller/shop/create', request.url));
      }
    }
  }

  // ============================================
  // 3. RATE LIMITING HEADERS (API үчүн)
  // ============================================
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Policy', 'authenticated');
  }

  return response;
}

// Middleware иштей турган жолдор
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};