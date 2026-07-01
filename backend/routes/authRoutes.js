const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// ... diğer routelar ...

// Favori haberleri getirme route'u - protect middleware'i ile korunuyor
router.get('/favorites', protect, authController.getFavoriteNews);

module.exports = router; 