import { Request } from 'express';
import { Multer } from 'multer';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Multer {
      File: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
} 