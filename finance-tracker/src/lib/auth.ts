import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from './supabase';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

export class AuthService {
  private static readonly JWT_SECRET = (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('CRITICAL: JWT_SECRET environment variable is not set');
    }
    return secret;
  })();
  private static readonly BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
  private static readonly MAX_USERS = parseInt(process.env.MAX_USERS || '5');

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '24h'
    });
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch {
      return null;
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  static async createUser(userData: {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
  }): Promise<{ user: User | null; error: string | null }> {
    try {
      // Check if user limit is reached
      const { count } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (count && count >= this.MAX_USERS) {
        return { user: null, error: 'Maximum user limit reached' };
      }

      // Check if username or email already exists
      const existingUser = await this.getUserByUsername(userData.username);
      if (existingUser) {
        return { user: null, error: 'Username already exists' };
      }

      const existingEmail = await this.getUserByEmail(userData.email);
      if (existingEmail) {
        return { user: null, error: 'Email already exists' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          username: userData.username,
          email: userData.email,
          password_hash: passwordHash,
          role: userData.role || 'user',
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data as User, error: null };
    } catch {
      return { user: null, error: 'Failed to create user' };
    }
  }

  static async authenticateUser(username: string, password: string): Promise<{
    user: User | null;
    token: string | null;
    error: string | null;
  }> {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) {
        return { user: null, token: null, error: 'Invalid credentials' };
      }

      if (user.status !== 'active') {
        return { user: null, token: null, error: 'Account is not active' };
      }

      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return { user: null, token: null, error: 'Invalid credentials' };
      }

      // Update last login
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Generate token
      const token = this.generateToken({
        userId: user.id,
        username: user.username,
        role: user.role
      });

      return { user, token, error: null };
    } catch {
      return { user: null, token: null, error: 'Authentication failed' };
    }
  }

  static async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as User[];
  }

  static async deleteUser(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch {
      return { success: false, error: 'Failed to delete user' };
    }
  }

  static async updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ status })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch {
      return { success: false, error: 'Failed to update user status' };
    }
  }
}