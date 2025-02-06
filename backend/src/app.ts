import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initializeAWS } from './config/aws';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import newsRoutes from './routes/newsRoutes';
import { cloudWatchLogger } from './utils/logger';

// Initialize AWS configuration
initializeAWS();

const app = express();

// Middleware
app.use(morgan('dev')); // Request logging
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cloudWatchLogger);

// Test route
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/news', newsRoutes);

// Error handling
app.use(errorHandler);

// Route not found handler
app.use((req: express.Request, res: express.Response) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

export default app; 