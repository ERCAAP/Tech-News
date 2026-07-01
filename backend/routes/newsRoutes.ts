import express, { Request, Response, NextFunction } from 'express';
import { auth, isAdmin } from '../middleware/auth';
import { 
  getAllNews, 
  createNews, 
  updateNews,
  deleteNews,
  viewNews,
  getSimilarNews,
  shareNews,
  updateReadingProgress,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
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

// Debug için tüm requestleri logla
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log('\n=== Incoming News Request ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('Headers:', {
    authorization: req.headers.authorization ? 'Present' : 'Missing',
    contentType: req.headers['content-type']
  });
  console.log('========================\n');
  next();
});

// Public routes
router.get('/', getAllNews);

// Protected routes
router.use(protect); // Auth middleware

// NOT: Önceki route tanımlarını kaldırıp, sadece bir tane update route'u bırakıyoruz
router.route('/:id')
  .put(updateNews)
  .patch(updateNews)
  .delete(deleteNews);

// Diğer routelar
router.post('/', createNews);
router.get('/:id/similar', getSimilarNews);
router.post('/:id/share', shareNews);
router.post('/:id/view', viewNews);
router.post('/:id/reading-progress', updateReadingProgress);
router.post('/:id/favorite', addToFavorites);
router.delete('/:id/favorite', removeFromFavorites);
router.get('/:id/favorite', checkFavoriteStatus);

export default router; 