import { Router } from 'express';
import { authController } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Debug için route'ları logla
router.use((req, res, next) => {
  console.log('Auth Route:', req.method, req.url);
  next();
});

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.patch('/profile', authMiddleware, authController.updateProfile);
router.get('/favorites', authMiddleware, authController.getFavoriteNews);

// Debug - mevcut route'ları göster
const routes = router.stack
  .filter((r: any) => r.route)
  .map((r: any) => ({
    path: r.route.path,
    methods: Object.keys(r.route.methods).map(m => m.toUpperCase())
  }));

console.log('Available Auth Routes:', JSON.stringify(routes, null, 2));

export default router; 