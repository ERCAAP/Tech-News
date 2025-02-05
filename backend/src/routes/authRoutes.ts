import express from 'express';
import * as authController from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Test route
router.get('/test', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Auth routes are working' });
});

// Public routes
router.post('/check-email', authController.checkEmail);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/send-verification', authController.sendVerificationCode);
router.post('/verify-code', authController.verifyCode);

// Protected routes
router.use(protect);
router.patch('/profile', authController.updateProfile);
router.get('/me', authController.getMe);
router.patch('/update-password', authController.updatePassword);

export default router; 