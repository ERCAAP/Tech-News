import express from 'express';
import { register, login, getMe } from '../controllers/authController';

const router = express.Router();

// /api/v1/auth/... şeklinde olacak
router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);

export default router; 