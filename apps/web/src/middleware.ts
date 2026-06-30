import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('PERSISTECH360_SESSION');
  const path = request.nextUrl.pathname;

  // Protect /app and /admin routes
  if (path.startsWith('/app') || path.startsWith('/admin')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Redirect root to /app if logged in, else to /auth/login
  if (path === '/') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/app', request.url));
    } else {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/app/:path*', '/admin/:path*'],
};
