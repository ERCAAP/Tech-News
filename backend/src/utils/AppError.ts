export class AppError extends Error {
  status: string;
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static fromAWSError(error: any): AppError {
    switch (error.name) {
      case 'ConditionalCheckFailedException':
        return new AppError('Resource already exists or condition check failed', 409);
      case 'ResourceNotFoundException':
        return new AppError('Resource not found', 404);
      case 'ValidationException':
        return new AppError('Invalid input data', 400);
      case 'AccessDeniedException':
        return new AppError('Access denied', 403);
      default:
        return new AppError('AWS service error', 503);
    }
  }
} 