import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';

const app = express();

// Middleware
app.use(morgan('dev')); // Request logging
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Routes
app.use('/api/v1/auth', authRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// Route not found handler
app.use((req: express.Request, res: express.Response) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

export default app; 