import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;

  // If no password is configured, leave open for frictionless local use
  if (!appPassword) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Always allow static files, images, favicon, login page, and login API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname === '/login' ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = request.cookies.get('shoppulse_auth')?.value;
  const isAuthorized = authCookie && authCookie === Buffer.from(appPassword).toString('base64');

  // Also support HTTP Basic Auth if provided
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Basic ')) {
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
    const providedPass = credentials.split(':')[1] || credentials.split(':')[0];
    if (providedPass === appPassword) {
      return NextResponse.next();
    }
  }

  if (!isAuthorized) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
