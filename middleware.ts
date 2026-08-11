import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Check NextAuth / Auth.js session token cookie dynamically across all environments
    const hasToken = req.cookies.getAll().some((cookie) =>
      cookie.name.includes('session-token') ||
      cookie.name.includes('authjs') ||
      cookie.name.includes('next-auth')
    );

    if (!hasToken) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
