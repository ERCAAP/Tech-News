import { Router } from 'express';
import authRoutes from './authRoutes';
import newsRoutes from './newsRoutes';
import userRoutes from './userRoutes';

const router = Router();

// API versiyonlama
const v1Router = Router();

// Routes
v1Router.use('/auth', authRoutes);
v1Router.use('/news', newsRoutes);
v1Router.use('/users', userRoutes);

// Ana router'a v1'i ekle
router.use('/v1', v1Router);

export default router; 