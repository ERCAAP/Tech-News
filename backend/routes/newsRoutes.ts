import express, { Request, Response, NextFunction } from 'express';
import { auth, isAdmin } from '../middleware/auth';
import { 
  getAllNews, 
  createNews, 
  viewNews, 
  toggleFavorite,
  getUserFavorites,
  updateNews,
  deleteNews,
} from '../controllers/newsController';

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

// Route handlers
router.get('/', getAllNews);
router.post('/', auth, createNews);

// Admin routeları - sadece admin erişebilir
router.put('/:id', auth, isAdmin, updateNews);
router.delete('/:id', auth, isAdmin, deleteNews);

// Favori routeları
router.post('/:id/favorite', auth, toggleFavorite);
router.get('/user/favorites', auth, getUserFavorites);

// Görüntülenme routeı
router.post('/:id/view', auth, viewNews);

export default router; 