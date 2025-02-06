import app from './app';
import dotenv from 'dotenv';
import { initializeAWS } from '../config/aws';
import { logger } from './utils/logger';

dotenv.config();

// Initialize AWS services
initializeAWS();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`API URL: http://localhost:${PORT}/api/v1`);
}); 