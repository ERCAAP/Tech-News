import express, { Request, Response, NextFunction } from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import * as newsController from '../controllers/newsController';
import { upload, logUploadedFiles } from '../utils/upload';
import { AppError } from '../utils/AppError';

// Request tipini genişlet
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
    [key: string]: any;
  };
}

const router = express.Router();

// Debug için tüm requestleri logla
router.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('\n=== News Route Handler ===');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  console.log('User:', req.user);
  console.log('========================\n');
  next();
});

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Protected routes
router.use(protect);

// CRUD Operations
router.route('/')
  .get(newsController.getAllNews)
  .post(newsController.createNews);

router.route('/:id')
  .get(newsController.getNewsById)
  .put(newsController.updateNews)
  .patch(newsController.updateNews)
  .delete(newsController.deleteNews);

// Diğer protected routes
router.post('/:id/view', newsController.viewNews);
router.post('/:id/favorite', newsController.toggleFavorite);
router.get('/user/favorites', newsController.getFavoriteNews);
// Admin only routes
router.use(restrictTo('admin') as express.RequestHandler);
router.get('/favorites/count', newsController.getFavoriteCount);
router.get('/stats', newsController.getNewsStats);

// Upload endpoint'i ekle
router.post('/upload', 
  protect, 
  restrictTo('admin') as express.RequestHandler,
  upload.single('image'),
  async (req: AuthenticatedRequest, res: Response) => {
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