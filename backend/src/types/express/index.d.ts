import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: 'user' | 'admin';
        groups?: string[];
        sub?: string;
        _id?: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'user' | 'admin';
    groups?: string[];
    sub?: string;
    _id?: string;
  };
} 