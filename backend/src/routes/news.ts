import { Router } from 'express';
import { newsController } from '../controllers/news';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Protected routes
router.post('/:id/favorite', authMiddleware, newsController.addToFavorites);
router.delete('/:id/favorite', authMiddleware, newsController.removeFromFavorites);
router.post('/:id/view', authMiddleware, newsController.incrementViews);

// Admin routes
router.patch('/:id', authMiddleware, newsController.updateNews);
router.get('/stats', authMiddleware, newsController.getStats);

// Debug - mevcut route'ları göster
const routes = router.stack
  .filter((r: any) => r.route)
  .map((r: any) => ({
    path: r.route.path,
    methods: Object.keys(r.route.methods).map(m => m.toUpperCase())
  }));

console.log('Available News Routes:', JSON.stringify(routes, null, 2));

export default router; 