import express, { Request, Response, NextFunction } from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { NewsController } from '../controllers/newsController';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types/express';
import multer from 'multer';

const router = express.Router();
const newsController = new NewsController();

// Debug için tüm requestleri logla
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log('\n=== News Route Handler ===');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  console.log('User:', req.user);
  console.log('========================\n');
  next();
});

// Public routes
router.get('/', (req: Request, res: Response, next: NextFunction) => 
  newsController.getAllNews(req as AuthRequest, res, next)
);

router.get('/:id', (req: Request, res: Response, next: NextFunction) => 
  newsController.getNews(req as AuthRequest, res, next)
);

// Protected routes
router.use(protect);

// CRUD Operations
router.route('/')
  .get((req: Request, res: Response, next: NextFunction) => 
    newsController.getAllNews(req as AuthRequest, res, next)
  )
  .post((req: Request, res: Response, next: NextFunction) => 
    newsController.createNews(req as AuthRequest, res, next)
  );

router.route('/:id')
  .get((req: Request, res: Response, next: NextFunction) => 
    newsController.getNews(req as AuthRequest, res, next)
  )
  .put((req: Request, res: Response, next: NextFunction) => 
    newsController.updateNews(req as AuthRequest, res, next)
  )
  .patch((req: Request, res: Response, next: NextFunction) => 
    newsController.updateNews(req as AuthRequest, res, next)
  )
  .delete((req: Request, res: Response, next: NextFunction) => 
    newsController.deleteNews(req as AuthRequest, res, next)
  );

// Diğer protected routes
router.post('/:id/view', (req: Request, res: Response, next: NextFunction) => 
  newsController.viewNews(req as AuthRequest, res, next)
);

router.post('/:id/favorite', (req: Request, res: Response, next: NextFunction) => 
  newsController.toggleFavorite(req as AuthRequest, res, next)
);

router.get('/user/favorites', (req: Request, res: Response, next: NextFunction) => 
  newsController.getFavoriteNews(req as AuthRequest, res, next)
);

// Admin only routes
router.use(restrictTo('admin'));

router.get('/favorites/count', (req: Request, res: Response, next: NextFunction) => 
  newsController.getFavoriteCount(req as AuthRequest, res, next)
);

router.get('/stats', (req: Request, res: Response, next: NextFunction) => 
  newsController.getNewsStats(req as AuthRequest, res, next)
);

// Upload endpoint'i ekle
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post('/upload', 
  protect, 
  restrictTo('admin'),
  upload.single('image'),
  async (req: AuthRequest, res: Response) => {
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