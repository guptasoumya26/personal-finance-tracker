import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get('auth-token');

  if (!authToken) {
    // Redirect to login page if not authenticated
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Try JWT verification first
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const payload = jwt.verify(authToken.value, jwtSecret);

    if (payload && typeof payload === 'object' && 'userId' in payload) {
      // JWT token is valid, proceed
      return NextResponse.next();
    }
  } catch (jwtError) {
    // JWT verification failed, try legacy token format
    try {
      const tokenData = Buffer.from(authToken.value, 'base64').toString();
      const [username, timestamp] = tokenData.split(':');

      if (!username || !timestamp) {
        throw new Error('Invalid token format');
      }

      // Check if legacy token is not older than 24 hours
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (tokenAge > maxAge) {
        throw new Error('Token expired');
      }

      // Legacy token is valid, proceed
      return NextResponse.next();
    } catch (legacyError) {
      // Both JWT and legacy token verification failed
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // Should not reach here, but redirect to login as fallback
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  const response = NextResponse.redirect(url);
  response.cookies.delete('auth-token');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - but we'll handle auth routes separately
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};