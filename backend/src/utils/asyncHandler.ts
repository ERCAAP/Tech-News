import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';

type AsyncFunction<T extends Request = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<any>;

export function asyncHandler<T extends Request = Request>(fn: AsyncFunction<T>) {
  return function (req: T, res: Response, next: NextFunction) {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
} 