import express from 'express';
import { NewsController } from '../controllers/newsController';
import { auth } from '../middleware/auth';
import { S3Service } from '../services/s3Service';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();
const newsController = new NewsController();
const s3Service = new S3Service();

// Public routes
router.get('/', (req, res, next) => newsController.getAllNews(req, res, next));
router.get('/:id', (req, res, next) => newsController.getNews(req, res, next));

// Protected routes
router.use(auth);

// CRUD Operations
router.post('/', (req, res, next) => newsController.createNews(req, res, next));
router.put('/:id', (req, res, next) => newsController.updateNews(req, res, next));
router.delete('/:id', (req, res, next) => newsController.deleteNews(req, res, next));

// Additional routes
router.get('/category/:category', (req, res, next) => newsController.getNewsByCategory(req, res, next));
router.post('/:id/view', (req, res, next) => newsController.viewNews(req, res, next));
router.get('/:id/similar', (req, res, next) => newsController.getSimilarNews(req, res, next));
router.post('/:id/share', (req, res, next) => newsController.shareNews(req, res, next));

// Favorites
router.post('/:id/favorites', (req, res, next) => newsController.addToFavorites(req, res, next));
router.delete('/:id/favorites', (req, res, next) => newsController.removeFromFavorites(req, res, next));
router.get('/:id/favorites/status', (req, res, next) => newsController.checkFavoriteStatus(req, res, next));

// Admin routes
router.use(isAdmin);

export default router; 