const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authMiddleware, authController.getMe);
router.patch('/update-profile', authMiddleware, authController.updateProfile);
router.patch('/update-password', authMiddleware, authController.updatePassword);

module.exports = router; 