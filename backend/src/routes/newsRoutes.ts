import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  likeNews,
  unlikeNews,
} from '../controllers/newsController';
import { upload } from '../utils/upload';

const router = express.Router();

// Public routes
router.get('/', getAllNews);
router.get('/:id', getNewsById);

// Protected routes
router.use(protect);

// Admin only routes
router.post('/', restrictTo('admin'), upload.single('image'), createNews);
router.put('/:id', restrictTo('admin'), upload.single('image'), updateNews);
router.delete('/:id', restrictTo('admin'), deleteNews);

// User interaction routes
router.post('/:id/like', likeNews);
router.delete('/:id/like', unlikeNews);

export default router; 