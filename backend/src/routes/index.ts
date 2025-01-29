import { Router } from 'express';
import authRoutes from './authRoutes';
import newsRoutes from './newsRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/news', newsRoutes);
router.use('/users', userRoutes);

export default router; 