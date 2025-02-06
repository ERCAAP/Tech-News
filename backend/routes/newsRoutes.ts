import express from 'express';
import { NewsController } from '../controllers/newsController';
import { auth, isAdmin } from '../middleware/auth';
import multer from 'multer';

const router = express.Router();
const newsController = new NewsController();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes
router.get('/', newsController.listNews);
router.get('/:newsId', newsController.getNews);

// Protected routes
router.use(auth);
router.post('/', upload.single('image'), newsController.createNews);
router.put('/:newsId', upload.single('image'), newsController.updateNews);
router.delete('/:newsId', newsController.deleteNews);

// Admin routes
router.use(isAdmin);
// Add admin-specific routes here if needed

export default router; 