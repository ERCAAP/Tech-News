import { Express } from 'express-serve-static-core';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        sub: string;
        groups?: string[];
        [key: string]: any;
      };
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
} 