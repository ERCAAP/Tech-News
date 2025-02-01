import express from 'express';
import { auth } from '../middleware/auth';
import { 
  getAllNews, 
  createNews, 
  viewNews, 
  toggleFavorite,
  getUserFavorites,
} from '../controllers/newsController';

const router = express.Router();

// Log middleware ekleyelim
router.use((req, res, next) => {
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

// Temel routelar
router.get('/', getAllNews);
router.post('/', auth, createNews);

// Favori routeları
router.post('/:id/favorite', auth, toggleFavorite); // URL'i düzelttik
router.get('/user/favorites', auth, getUserFavorites);

// Görüntülenme routeı
router.post('/:id/view', auth, viewNews);

export default router; 