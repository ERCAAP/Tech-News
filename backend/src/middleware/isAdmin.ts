import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { AppError } from '../src/utils/AppError';

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Not authorized as admin', 403));
  }
  next();
} 