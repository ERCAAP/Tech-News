import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController';
import { upload, logUploadedFiles } from '../utils/upload';
import { AppError } from '../utils/AppError';

const router = express.Router();

// Public routes
router.get('/', getAllNews);
router.get('/:id', getNewsById);

// Admin routes
router.post('/', 
  protect,
  restrictTo('admin'),
  logUploadedFiles,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 }
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

// Upload endpoint'i ekle
router.post('/upload', 
  protect, 
  restrictTo('admin'),
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      
      res.status(200).json({
        status: 'success',
        imageUrl
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: error.status,
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'An unexpected error occurred'
        });
      }
    }
  }
);

export default router; 