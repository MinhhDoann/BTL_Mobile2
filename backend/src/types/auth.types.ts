import { Request } from 'express';

export interface User {
  user_id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  password_hash?: string;
  avatar_url?: string | null;
  is_premium?: number | boolean;
  created_at?: string;
}

export interface PublicUser {
  user_id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Session {
  userId: number;
  expires: number;
}

export interface LoginAttempt {
  count: number;
  expires: number;
}

export interface AuthRequest extends Request {
  user?: PublicUser;
  sessionKey?: string;
}
