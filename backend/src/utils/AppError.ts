export class AppError extends Error {
  status: string;
  statusCode: number;
  code?: string;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static fromAWSError(error: any): AppError {
    if (error.code === 'ConditionalCheckFailedException') {
      return new AppError('Resource conflict', 409, error.code);
    }
    if (error.code === 'ResourceNotFoundException') {
      return new AppError('Resource not found', 404, error.code);
    }
    if (error.code === 'ValidationException') {
      return new AppError(error.message, 400, error.code);
    }
    if (error.code === 'AccessDeniedException') {
      return new AppError('Access denied', 403, error.code);
    }
    return new AppError('Service unavailable', 503, error.code);
  }
} 