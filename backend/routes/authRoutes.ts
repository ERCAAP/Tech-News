import express from 'express';
import { AuthController } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();
const authController = new AuthController();

// Test route
router.get('/test', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Auth routes are working' });
});

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.use(auth);
router.get('/profile', authController.getProfile);
router.patch('/profile', authController.updateProfile);

export default router; 