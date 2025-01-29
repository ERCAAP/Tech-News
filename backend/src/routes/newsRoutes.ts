import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
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

router
  .route('/')
  .get(getAllNews)
  .post(protect, restrictTo('admin'), upload.single('image'), createNews);

router
  .route('/:id')
  .get(getNewsById)
  .put(protect, restrictTo('admin'), upload.single('image'), updateNews)
  .delete(protect, restrictTo('admin'), deleteNews);

router.route('/:id/like').post(protect, likeNews).delete(protect, unlikeNews);

export default router; 