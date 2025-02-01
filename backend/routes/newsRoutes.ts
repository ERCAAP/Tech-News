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
router.get('/', (req: AuthRequest, res: Response, next: NextFunction) => getAllNews(req, res, next));
router.post('/', auth, (req: AuthRequest, res: Response, next: NextFunction) => createNews(req, res, next));

// Admin routeları - sadece admin erişebilir
router.put('/:id', auth, isAdmin, (req: AuthRequest, res: Response, next: NextFunction) => updateNews(req, res, next));
router.delete('/:id', auth, isAdmin, (req: AuthRequest, res: Response) => deleteNews(req, res));

// Favori routeları
router.post('/:id/favorite', auth, (req: AuthRequest, res: Response, next: NextFunction) => toggleFavorite(req, res, next));
router.get('/user/favorites', auth, (req: AuthRequest, res: Response) => getUserFavorites(req, res));

// Görüntülenme routeı
router.post('/:id/view', auth, (req: AuthRequest, res: Response, next: NextFunction) => viewNews(req, res, next));

export default router; 