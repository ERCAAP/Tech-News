import express from 'express';
import { socialLogin } from '../controllers/authController';

const router = express.Router();

// ... mevcut route'lar ...

router.post('/social-login', socialLogin);

export default router; 