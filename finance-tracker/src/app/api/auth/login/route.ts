import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Get credentials from environment variables
    const validUsername = process.env.AUTH_USERNAME;
    const validPassword = process.env.AUTH_PASSWORD;

    if (!validUsername || !validPassword) {
      return NextResponse.json(
        { error: 'Authentication not configured' },
        { status: 500 }
      );
    }

    // Verify credentials
    if (username === validUsername && password === validPassword) {
      // Create a simple session token (in production, use JWT or proper session management)
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');

      // Set HTTP-only cookie
      const cookieStore = await cookies();
      cookieStore.set('auth-token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}