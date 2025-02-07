import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';

type AsyncFunction<T = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = <T = Request>(fn: AsyncFunction<T>) => {
  return function (req: Request, res: Response, next: NextFunction) {
    fn(req as T, res, next).catch(next);
  };
}; 