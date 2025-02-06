import dotenv from 'dotenv';
import { app } from './app';
import { initializeAWS } from './config/aws';
import { log } from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize AWS
initializeAWS();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  log.info(`Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  log.error('UNHANDLED REJECTION! Shutting down...', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  log.error('UNCAUGHT EXCEPTION! Shutting down...', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  process.exit(1);
}); 