import express, { Request, Response, NextFunction } from 'express';
import { NewsController } from '../controllers/newsController';
import { auth } from '../middleware/auth';
import { convertToAuthRequest } from '../middleware/convertToAuthRequest';
import { AuthRequest } from '../types/express';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();
const newsController = new NewsController();

// CRUD Operations
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  return newsController.getAllNews(req as any, res, next);
});

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  return newsController.getNews(req as any, res, next);
});

// Protected routes
router.use(auth as express.RequestHandler);
router.use(convertToAuthRequest);

// Admin middleware
const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  isAdmin(req as any, res, next);
};

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  return newsController.create(req as any, res, next);
});

router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  return newsController.update(req as any, res, next);
});

router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  return newsController.deleteNews(req as any, res, next);
});

// Additional routes
router.get('/category/:category', (req: Request, res: Response, next: NextFunction) => {
  return newsController.getNewsByCategory(req as any, res, next);
});

router.post('/:id/view', (req: Request, res: Response, next: NextFunction) => {
  return newsController.updateReadingProgress(req as any, res, next);
});

router.get('/:id/similar', (req: Request, res: Response, next: NextFunction) => {
  return newsController.getSimilarNews(req as any, res, next);
});

router.post('/:id/share', (req: Request, res: Response, next: NextFunction) => {
  return newsController.shareNews(req as any, res, next);
});

// Favorites
router.post('/:id/favorites', (req: Request, res: Response, next: NextFunction) => {
  return newsController.addToFavorites(req as any, res, next);
});

router.delete('/:id/favorites', (req: Request, res: Response, next: NextFunction) => {
  return newsController.removeFromFavorites(req as any, res, next);
});

router.get('/:id/favorites/status', (req: Request, res: Response, next: NextFunction) => {
  return newsController.checkFavoriteStatus(req as any, res, next);
});

// Admin routes
router.use(adminMiddleware);

export default router; 