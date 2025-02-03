import express, { Request, Response, NextFunction } from 'express';
import { auth, isAdmin } from '../middleware/auth';
import { 
  getAllNews, 
  createNews, 
  viewNews,
  updateNews,
  deleteNews,
  getNewsById,
  toggleFavorite,
  incrementViews,
} from '../controllers/newsController';
import { protect } from '../middleware/authMiddleware';

// Request tipini genişletelim
interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

const router = express.Router();

// Log middleware
router.use((req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('News Route - Incoming request:', {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    userId: req.user?._id
  });
  next();
});

// Public routes
router.get('/', getAllNews);
router.get('/:id', getNewsById);

// Protected routes
router.use(protect); // Tüm aşağıdaki route'lar için auth gerekli

// Route handlers
router.post('/', createNews);
router.put('/:id', updateNews);
router.patch('/:id', updateNews);
router.delete('/:id', deleteNews);

// Özel route'lar
router.post('/:id/favorite', toggleFavorite);
router.post('/:id/view', incrementViews);

// Admin routeları - sadece admin erişebilir
router.put('/:id', auth, isAdmin, updateNews);
router.delete('/:id', auth, isAdmin, deleteNews);

export default router; 