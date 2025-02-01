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
import fs from 'fs';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tech-news';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected:', mongoose.connection.host);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // Tüm route'ları göster
      const routes = app._router.stack
        .filter((r: any) => r.route)
        .map((r: any) => ({
          path: r.route.path,
          methods: r.route.methods
        }));
      
      console.log('Available Routes:', routes);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

export default app; 