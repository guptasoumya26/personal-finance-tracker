import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email?: string;
}

/**
 * Get the current authenticated user from the request
 * Returns null if no valid authentication is found
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const authToken = request.cookies.get('auth-token');
  console.log('getCurrentUser - authToken present:', !!authToken);
  if (!authToken) return null;

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    console.log('getCurrentUser - JWT_SECRET present:', !!jwtSecret);
    const payload = jwt.verify(authToken.value, jwtSecret) as any;
    console.log('getCurrentUser - JWT payload:', payload);

    if (payload && payload.userId) {
      const user = await AuthService.getUserById(payload.userId);
      console.log('getCurrentUser - user from DB:', user ? { id: user.id, username: user.username } : null);
      if (user && user.status === 'active') {
        return {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email
        };
      }
    }
  } catch (error) {
    console.log('getCurrentUser - JWT verification failed:', error);
    // Legacy authentication removed - database reset invalidated old tokens
    // Users need to login again with fresh JWT tokens
  }

  return null;
}

/**
 * Middleware function to require authentication
 * Returns user if authenticated, throws error if not
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Middleware function to require admin role
 * Returns user if admin, throws error if not
 */
export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await requireAuth(request);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}

/**
 * Create a standardized error response for authentication failures
 */
export function createAuthErrorResponse(error: Error, status: number = 401) {
  return Response.json(
    { error: error.message },
    { status }
  );
}