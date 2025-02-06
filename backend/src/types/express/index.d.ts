import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        groups?: string[];
      };
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    groups?: string[];
  };
} 