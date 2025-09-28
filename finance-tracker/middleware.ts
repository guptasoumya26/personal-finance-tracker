import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page and auth API routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
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

  // Verify token is valid (basic check - in production use proper JWT verification)
  try {
    const tokenData = Buffer.from(authToken.value, 'base64').toString();
    const [username, timestamp] = tokenData.split(':');

    if (!username || !timestamp) {
      throw new Error('Invalid token format');
    }

    // Check if token is not older than 24 hours
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
      // Token expired, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('auth-token');
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    response.cookies.delete('auth-token');
    return response;
  }
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