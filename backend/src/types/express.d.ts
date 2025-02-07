import { Express } from 'express-serve-static-core';
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { Multer } from 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email?: string;
        role: 'user' | 'admin';
        groups?: string[];
        sub?: string;
      };
      file?: Express.Multer.File;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    userId: string;
    email?: string;
    role: 'user' | 'admin';
    groups?: string[];
    sub?: string;
  };
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
} 