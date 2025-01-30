import { Express } from 'express-serve-static-core';
import { Request } from 'express';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
} 