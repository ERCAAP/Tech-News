import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { log } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import newsRoutes from './routes/newsRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => log.info(message.trim())
    }
  }));
}

// Routes
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);

// Error handling
app.use(errorHandler);

export { app }; 