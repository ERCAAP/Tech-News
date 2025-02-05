import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/auth';
import newsRoutes from '../routes/newsRoutes';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Statik dosyalar için uploads klasörünü ayarla
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global request logger
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Body:', req.body);
  console.log('========================\n');
  next();
});

// Test route
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/news', newsRoutes);

// Global hata yönetimi
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error:', err);

  // Status code kontrolü
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  return res.status(statusCode).json({
    status: status,
    message: err.message || 'Bir hata oluştu'
  });
});

export default app; 