import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import config from './config/loadEnv';
import { errorHandler } from './utils/errorHandler';
import { logger } from './utils/logger';
import routes from './routes';
import authRoutes from './routes/authRoutes';
import newsRoutes from './routes/newsRoutes';
import connectDB from './config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:19006', 'http://localhost:19000', 'http://localhost:19001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS)
});
app.use(limiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/news', newsRoutes);

// Statik dosya servisi
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling
app.use(errorHandler);

// Server'ı başlat
const startServer = async () => {
  try {
    await connectDB(); // Önce database'e bağlan
    
    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

export default app; 