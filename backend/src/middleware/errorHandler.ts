import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { log } from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  log.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Default error
  let error = {
    status: 'error',
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  };

  // Handle specific errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
  }

  // Handle AWS errors
  if (err.name === 'ConditionalCheckFailedException') {
    return res.status(409).json({
      status: 'error',
      message: 'Resource already exists or condition check failed'
    });
  }

  if (err.name === 'ResourceNotFoundException') {
    return res.status(404).json({
      status: 'error',
      message: 'Resource not found'
    });
  }

  if (err.name === 'ValidationException') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid input data'
    });
  }

  if (err.name === 'AccessDeniedException') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  // Send error response
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json(error);
}; 