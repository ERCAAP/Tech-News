import { Express } from 'express-serve-static-core';
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
      };
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
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
  };
} 