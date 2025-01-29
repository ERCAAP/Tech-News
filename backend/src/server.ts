import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { connectDB } from './config/database';
import { errorHandler } from './utils/errorHandler';
import { logger } from './utils/logger';
import routes from './routes';

// Load environment variables
import '@config/loadEnv';

const app = express();
const port = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS)
});
app.use(limiter);

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 