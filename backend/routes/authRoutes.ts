import express from 'express';
import { login, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Test route
router.get('/test', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Auth routes are working' });
});

// Public routes
router.post('/login', login);

// Protected routes
router.use(protect);
router.patch('/profile', updateProfile);

export default router; 