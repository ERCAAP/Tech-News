import { CloudWatch } from 'aws-sdk';
import winston from 'winston';

const cloudWatch = new CloudWatch({
  region: process.env.AWS_REGION
});

// Create Winston logger with CloudWatch transport
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Log to CloudWatch
export const logToCloudWatch = async (
  logGroupName: string,
  logStreamName: string,
  message: string,
  level: string = 'INFO'
) => {
  try {
    const params = {
      logGroupName,
      logStreamName,
      logEvents: [
        {
          message: JSON.stringify({
            level,
            message,
            timestamp: new Date().toISOString()
          }),
          timestamp: Date.now()
        }
      ]
    };

    await cloudWatch.putLogEvents(params).promise();
  } catch (error) {
    console.error('CloudWatch logging error:', error);
    // Fall back to console logging
    console.log(level, message);
  }
};

// Override logger methods to also log to CloudWatch
const originalInfo = logger.info;
logger.info = function(message: string) {
  originalInfo.call(this, message);
  logToCloudWatch('TechNews', 'API', message, 'INFO');
};

const originalError = logger.error;
logger.error = function(message: string) {
  originalError.call(this, message);
  logToCloudWatch('TechNews', 'API', message, 'ERROR');
}; 