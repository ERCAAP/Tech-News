import { Request, Response, NextFunction } from 'express';
import { CloudWatch } from 'aws-sdk';

const cloudWatch = new CloudWatch({
  region: process.env.AWS_REGION
});

export const errorHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Log error to CloudWatch
  const params = {
    MetricData: [
      {
        MetricName: 'ApplicationError',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          {
            Name: 'ErrorType',
            Value: error.name || 'UnknownError'
          }
        ]
      }
    ],
    Namespace: 'TechNews/Errors'
  };

  try {
    await cloudWatch.putMetricData(params).promise();
  } catch (cwError) {
    console.error('CloudWatch logging error:', cwError);
  }

  res.status(error.status || 500).json({
    status: 'error',
    message: error.message || 'Internal server error'
  });
}; 