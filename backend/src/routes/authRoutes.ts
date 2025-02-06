import express, { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { convertToAuthRequest } from '../middleware/convertToAuthRequest';
import { AuthRequest } from '../types/express';

const router = express.Router();
const authController = new AuthController();

// Test route
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Auth routes are working' });
});

// Public routes
router.post('/register', (req: Request, res: Response, next: NextFunction) => {
  authController.register(req as AuthRequest, res, next);
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  authController.login(req as AuthRequest, res, next);
});

// Protected routes
router.use(auth);
router.use(convertToAuthRequest);

router.get('/profile', (req: Request, res: Response, next: NextFunction) => {
  authController.getProfile(req as AuthRequest, res, next);
});

router.patch('/profile', (req: Request, res: Response, next: NextFunction) => {
  authController.updateProfile(req as AuthRequest, res, next);
});

export default router; 