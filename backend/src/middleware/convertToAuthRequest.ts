import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';

export function convertToAuthRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  (req as AuthRequest).user = req.user;
  next();
} 