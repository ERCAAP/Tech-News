import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
import newsRoutes from './routes/news';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug için route'ları logla
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/news', newsRoutes);

// Route bulunamadığında
app.use((req, res, next) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message
  });
});

export default app; 