import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllNews,
  getNews,
  createNews,
  updateNews,
  deleteNews,
  toggleFavorite
} from '../controllers/newsController';

const router = Router();

// Public routes
router.get('/', getAllNews);
router.get('/:id', getNews);

// Protected routes
router.use(protect);
router.post('/favorite/:id', toggleFavorite);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', createNews);
router.patch('/:id', updateNews);
router.delete('/:id', deleteNews);

export default router; 