import { CloudWatch } from 'aws-sdk';
import { Request, Response, NextFunction } from 'express';

const cloudWatch = new CloudWatch({
  region: process.env.AWS_REGION
});

export const cloudWatchLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const params = {
      MetricData: [
        {
          MetricName: 'APIRequestDuration',
          Value: duration,
          Unit: 'Milliseconds',
          Dimensions: [
            {
              Name: 'Endpoint',
              Value: `${req.method} ${req.path}`
            }
          ]
        }
      ],
      Namespace: 'TechNews/API'
    };

    cloudWatch.putMetricData(params).promise()
      .catch(error => console.error('CloudWatch logging error:', error));
  });

  next();
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
}; 