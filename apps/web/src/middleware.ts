import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('PERSISTECH360_SESSION');
  const path = request.nextUrl.pathname;

  // NOTE: This middleware is merely a UX/navigation barrier.
  // It is NOT a security boundary. True security and authorization
  // is enforced by the NestJS backend via HTTP-Only cookies and Guards.
  // This just prevents unauthenticated users from seeing blank/broken pages.
  if (!sessionCookie && (path.startsWith('/app') || path.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (sessionCookie && path === '/auth/login') {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  if (path === '/') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/app', request.url));
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
