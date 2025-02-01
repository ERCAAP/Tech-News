import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import * as newsController from '../controllers/newsController';
import { upload, logUploadedFiles } from '../utils/upload';
import { AppError } from '../utils/AppError';

const router = express.Router();

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Protected routes
router.use(protect);

// User routes
router.post('/:id/view', newsController.viewNews);
router.post('/:id/favorite', newsController.toggleFavorite);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', newsController.createNews);
router.patch('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);
router.get('/stats', newsController.getNewsStats);

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