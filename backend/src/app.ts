import express from 'express';
import cors from 'cors';
import newsRoutes from './routes/newsRoutes';
import authRoutes from './routes/authRoutes';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/news', newsRoutes);

// Statik dosya servisi için
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

export default app; 