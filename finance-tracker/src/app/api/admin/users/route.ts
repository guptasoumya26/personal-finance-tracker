import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth';
import jwt from 'jsonwebtoken';

async function getCurrentUser(request: NextRequest) {
  const authToken = request.cookies.get('auth-token');
  if (!authToken) return null;

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const payload = jwt.verify(authToken.value, jwtSecret) as any;
    if (payload && payload.userId) {
      return await AuthService.getUserById(payload.userId);
    }
  } catch {
    // Try legacy token
    try {
      const tokenData = Buffer.from(authToken.value, 'base64').toString();
      const [username] = tokenData.split(':');
      const legacyUsername = process.env.AUTH_USERNAME;
      if (username === legacyUsername) {
        return { username, role: 'admin', legacy: true };
      }
    } catch {
      // Ignore legacy token errors
    }
  }
  return null;
}

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const users = await AuthService.getAllUsers();
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      last_login: user.last_login
    }));

    return NextResponse.json({ users: sanitizedUsers });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (currentUser.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const { success, error } = await AuthService.deleteUser(userId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: error || 'Failed to delete user' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Admin user DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update user status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { userId, status } = await request.json();

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      );
    }

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active or inactive' },
        { status: 400 }
      );
    }

    // Prevent admin from deactivating themselves
    if (currentUser.id === userId && status === 'inactive') {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    const { success, error } = await AuthService.updateUserStatus(userId, status);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: error || 'Failed to update user status' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Admin user PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}