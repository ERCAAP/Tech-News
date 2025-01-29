import { Router } from 'express';
import { login, register, getMe, updatePassword } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect); // Bundan sonraki tüm routelar için auth gerekir
router.get('/me', getMe);
router.patch('/update-password', updatePassword);

export default router; 