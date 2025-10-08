import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, confirmPassword } = await request.json();

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Strong password requirements: min 8 chars, uppercase, lowercase, and number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error: 'Password must be at least 8 characters and include uppercase, lowercase, and number'
        },
        { status: 400 }
      );
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '12345678', 'password123', 'admin123', 'qwerty123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      return NextResponse.json(
        { error: 'Password is too common. Please choose a stronger password' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Create user
    const { user, error } = await AuthService.createUser({
      username,
      email,
      password
    });

    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Return success (don't include sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
        // password_hash excluded for security
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if signup is available (based on user limit)
export async function GET() {
  try {
    const users = await AuthService.getAllUsers();
    const activeUsers = users.filter(user => user.status === 'active');
    const maxUsers = parseInt(process.env.MAX_USERS || '5');

    return NextResponse.json({
      signupAvailable: activeUsers.length < maxUsers,
      activeUsers: activeUsers.length,
      maxUsers,
      message: activeUsers.length >= maxUsers
        ? 'Maximum user limit reached. Contact admin for access.'
        : 'Signup is available'
    });
  } catch (error) {
    console.error('Signup check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}