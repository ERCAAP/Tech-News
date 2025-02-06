import { Request, Response, NextFunction } from 'express';
import { AWSError } from 'aws-sdk';
import { AppError } from './AppError';
import { logger } from './logger';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: Error | AWSError) => {
      // Handle AWS specific errors
      if ('code' in error) {
        switch (error.code) {
          case 'ConditionalCheckFailedException':
            return next(new AppError('Resource conflict', 409));
          case 'ResourceNotFoundException':
            return next(new AppError('Resource not found', 404));
          case 'ValidationException':
            return next(new AppError(error.message, 400));
          case 'AccessDeniedException':
            return next(new AppError('Access denied', 403));
          default:
            logger.error(`AWS Error: ${error.code} - ${error.message}`);
            return next(new AppError('Service unavailable', 503));
        }
      }

      // Handle other errors
      next(error);
    });
  };
}; 