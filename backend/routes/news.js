// Haber görüntüleme ve favori routes
router.post('/:id/view', authMiddleware, newsController.incrementViews);
router.post('/:id/favorite', authMiddleware, newsController.addToFavorites);
router.delete('/:id/favorite', authMiddleware, newsController.removeFromFavorites);

// Admin routes
router.patch('/:id', [authMiddleware, adminMiddleware], newsController.updateNews);
router.get('/stats', [authMiddleware, adminMiddleware], newsController.getStats); 