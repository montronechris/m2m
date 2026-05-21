// src/middleware.ts (o src/proxy.ts se lo usi come middleware)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // 🟢 CART PROTECTION
  if (pathname.startsWith('/cart')) {
    const sessionCookie = request.cookies.get('tavolarapida_session');
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 🟢 ADMIN/KITCHEN PROTECTION
  if (pathname.startsWith('/admin')) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 🔴 NON LOGGATO → redirect con NextResponse
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

// ✅ Config per far sì che Next.js tratti questo file come middleware
export const config = {
  matcher: ['/admin/:path*', '/cart'],
};