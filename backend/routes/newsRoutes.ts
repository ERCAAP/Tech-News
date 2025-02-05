import express from 'express';
import { protect } from '../src/middleware/auth';
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  viewNews,
  getSimilarNews,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
} from '../src/controllers/newsController';

const router = express.Router();

// Public routes
router.get('/', getAllNews);
router.get('/:id/similar', getSimilarNews);
router.post('/:id/view', viewNews);

// Favori işlemleri
router.get('/:id/favorite', protect, checkFavoriteStatus);
router.post('/:id/favorite', protect, addToFavorites);
router.delete('/:id/favorite', protect, removeFromFavorites);

// Admin işlemleri
router.post('/', protect, createNews);
router.put('/:id', protect, updateNews);
router.delete('/:id', protect, deleteNews);

export default router; 