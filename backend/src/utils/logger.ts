import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import winston from 'winston';

const cloudWatchLogs = new CloudWatchLogs({
  region: process.env.AWS_REGION
});

const logGroupName = process.env.CLOUDWATCH_LOG_GROUP || 'TechNews';
const logStreamName = process.env.CLOUDWATCH_LOG_STREAM || 'API';

// Winston formatters
const formatters = {
  timestamp: winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  json: winston.format.json(),
  errors: winston.format.errors({ stack: true }),
  colorize: winston.format.colorize(),
  simple: winston.format.simple()
};

// CloudWatch transport
const cloudWatchTransport = new winston.transports.Console({
  format: winston.format.combine(
    formatters.timestamp,
    formatters.json
  ),
  log: async (info, callback) => {
    try {
      await cloudWatchLogs.putLogEvents({
        logGroupName,
        logStreamName,
        logEvents: [{
          timestamp: Date.now(),
          message: JSON.stringify(info)
        }]
      });
      callback();
    } catch (error) {
      console.error('CloudWatch logging error:', error);
      callback();
    }
  }
});

// Console transport for development
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    formatters.colorize,
    formatters.timestamp,
    formatters.simple
  )
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    formatters.timestamp,
    formatters.errors,
    formatters.json
  ),
  transports: [
    process.env.NODE_ENV === 'production' 
      ? cloudWatchTransport 
      : consoleTransport
  ]
});

// Export a simplified interface for common log levels
export const log = {
  info: (message: string, meta?: any) => logger.info({ message, ...meta }),
  error: (message: string, meta?: any) => logger.error({ message, ...meta }),
  warn: (message: string, meta?: any) => logger.warn({ message, ...meta }),
  debug: (message: string, meta?: any) => logger.debug({ message, ...meta })
}; 