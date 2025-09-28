import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Simple password protection
  const basicAuth = request.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    // Your login credentials
    const validUser = 'admin'
    const validPassword = 'SecureFinance2025!'

    if (user === validUser && pwd === validPassword) {
      return NextResponse.next()
    }
  }

  // Return 401 with WWW-Authenticate header to trigger browser login prompt
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Finance Tracker", charset="UTF-8"',
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}