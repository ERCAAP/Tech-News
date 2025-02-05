import express from 'express';
import { authController } from '../controllers/auth';
import { protect } from '../middleware/auth';

const router = express.Router();

// Debug için route'ları logla
router.use((req, res, next) => {
  console.log('Auth Route:', req.method, req.url, req.body);
  next();
});

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/me', protect, authController.getMe);
router.patch('/profile', protect, authController.updateProfile);
router.get('/favorite-news', protect, authController.getFavoriteNews);

// Debug - mevcut route'ları göster
const routes = router.stack
  .filter((r: any) => r.route)
  .map((r: any) => ({
    path: r.route.path,
    methods: Object.keys(r.route.methods).map(m => m.toUpperCase())
  }));

console.log('Available Auth Routes:', JSON.stringify(routes, null, 2));

export default router; 