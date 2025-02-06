import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';

type AsyncFunction = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 