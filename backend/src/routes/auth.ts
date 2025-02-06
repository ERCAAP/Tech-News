import express from 'express';
import { authController } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Debug için route'ları logla
router.use((req, res, next) => {
  console.log('Auth Route:', req.method, req.url, req.body);
  next();
});

// Public routes
router.post('/api/v1/auth/login', authController.login);
router.post('/api/v1/auth/register', authController.register);

// Protected routes
router.get('/api/v1/auth/me', authenticate, authController.getMe);
router.patch('/api/v1/auth/profile', authenticate, authController.updateProfile);
router.get('/api/v1/auth/favorite-news', authenticate, authController.getFavoriteNews);

// Debug - mevcut route'ları göster
const routes = router.stack
  .filter((r: any) => r.route)
  .map((r: any) => ({
    path: r.route.path,
    methods: Object.keys(r.route.methods).map(m => m.toUpperCase())
  }));

console.log('Available Auth Routes:', JSON.stringify(routes, null, 2));

export default router; 