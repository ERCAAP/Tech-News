import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { CloudWatch } from 'aws-sdk';
import { logger } from './logger';

const cloudWatch = new CloudWatch({
  region: process.env.AWS_REGION
});

export const errorHandler = async (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details to CloudWatch
  const errorDetails = {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  };

  try {
    const params = {
      MetricData: [
        {
          MetricName: 'ApplicationError',
          Value: 1,
          Unit: 'Count',
          Dimensions: [
            {
              Name: 'ErrorType',
              Value: err instanceof AppError ? 'AppError' : 'UnhandledError'
            },
            {
              Name: 'Path',
              Value: req.path
            }
          ]
        }
      ],
      Namespace: 'TechNews/Errors'
    };

    await cloudWatch.putMetricData(params).promise();
    logger.error(JSON.stringify(errorDetails));
  } catch (cloudWatchError) {
    console.error('CloudWatch logging failed:', cloudWatchError);
  }

  // Send response
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.statusCode
    });
  }

  // For unhandled errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    code: 500
  });
}; 