const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

// Debug için route'ları logla
router.use((req, res, next) => {
  console.log('Auth Route:', req.method, req.url);
  next();
});

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.patch('/profile', authMiddleware, authController.updateProfile);
router.get('/favorites', authMiddleware, authController.getFavoriteNews);

// Debug - mevcut route'ları göster
console.log('Auth Routes:', router.stack.map(r => ({
  path: r.route?.path,
  methods: r.route?.methods
})));

module.exports = router; 