import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Origin verification for mutation requests (CSRF protection)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');

    // If origin is present, ensure it matches current host
    if (origin && host) {
      const originHost = origin.replace(/^https?:\/\//, '').split('/')[0];
      if (originHost !== host && !host.includes('localhost') && !originHost.includes('localhost')) {
        return new NextResponse('CSRF Forbidden: Origin mismatch', { status: 403 });
      }
    }
  }

  // 2. Protected routes check
  const isProtectedAdmin = pathname.startsWith('/admin');
  const isProtectedMyOrders = pathname.startsWith('/my-orders');
  const isProtectedDownload = pathname.startsWith('/api/download');

  if (isProtectedAdmin || isProtectedMyOrders || isProtectedDownload) {
    const hasToken = req.cookies.getAll().some((cookie) =>
      cookie.name.includes('session-token') ||
      cookie.name.includes('authjs') ||
      cookie.name.includes('next-auth')
    );

    if (!hasToken) {
      if (isProtectedDownload) {
        return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
      }
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // 3. Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/my-orders/:path*',
    '/api/download/:path*',
  ],
};
