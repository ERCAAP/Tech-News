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
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Protected routes
router.use(auth);
router.get('/profile', (req, res, next) => authController.getProfile(req, res, next));
router.patch('/profile', (req, res, next) => authController.updateProfile(req, res, next));

export default router; 