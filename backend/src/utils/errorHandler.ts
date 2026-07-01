import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { logger } from './logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  logger.error('Unexpected error:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
}; 