const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Protected routes
router.post('/:id/favorite', authMiddleware, newsController.addToFavorites);
router.delete('/:id/favorite', authMiddleware, newsController.removeFromFavorites);
router.post('/:id/view', authMiddleware, newsController.incrementViews);

// Admin routes
router.patch('/:id', [authMiddleware /*, adminMiddleware */], newsController.updateNews);
router.get('/stats', [authMiddleware /*, adminMiddleware */], newsController.getStats);

module.exports = router; 