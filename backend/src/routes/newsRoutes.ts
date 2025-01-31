import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController';
import { upload } from '../utils/upload';

const router = express.Router();

// Public routes
router.get('/', getAllNews);
router.get('/:id', getNewsById);

// Admin routes
router.post('/', 
  protect,
  restrictTo('admin'),
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImage0', maxCount: 10 }
  ]),
  createNews
);

router.put('/:id',
  protect, 
  restrictTo('admin'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 }
  ]),
  updateNews
);

router.delete('/:id', protect, restrictTo('admin'), deleteNews);

export default router; 