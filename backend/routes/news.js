const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const newsController = require('../controllers/news');
const authMiddleware = require('../middleware/auth');

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Çoklu dosya yükleme için middleware
const uploadFields = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'contentImages', maxCount: 10 }
]);

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Protected routes
router.post('/:id/favorite', authMiddleware, newsController.addToFavorites);
router.delete('/:id/favorite', authMiddleware, newsController.removeFromFavorites);
router.post('/:id/view', authMiddleware, newsController.incrementViews);

// Admin routes
router.get('/stats', [authMiddleware], newsController.getStats);

// Haber güncelleme route'u - hem PUT hem PATCH'i destekle
router.put('/:id', authMiddleware, newsController.updateNews);  // PUT için
router.patch('/:id', authMiddleware, newsController.updateNews); // PATCH için

module.exports = router; 