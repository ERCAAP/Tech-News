// Haber görüntüleme sayısını artır
exports.incrementViews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const news = await News.findByIdAndUpdate(
      newsId,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json({ status: 'success', data: { views: news.views } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Haberi favorilere ekle
exports.addToFavorites = async (req, res) => {
  try {
    const newsId = req.params.id;
    const userId = req.user.id;

    const news = await News.findByIdAndUpdate(
      newsId,
      { $addToSet: { favorites: userId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteNews: newsId } }
    );

    res.json({ 
      status: 'success', 
      data: { 
        favoriteCount: news.favorites.length 
      } 
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Haberi favorilerden çıkar
exports.removeFromFavorites = async (req, res) => {
  try {
    const newsId = req.params.id;
    const userId = req.user.id;

    const news = await News.findByIdAndUpdate(
      newsId,
      { $pull: { favorites: userId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      { $pull: { favoriteNews: newsId } }
    );

    res.json({ 
      status: 'success', 
      data: { 
        favoriteCount: news.favorites.length 
      } 
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Haberi güncelle (admin için)
exports.updateNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const updates = req.body;
    
    const news = await News.findByIdAndUpdate(
      newsId,
      { ...updates, updatedAt: Date.now() },
      { new: true }
    );

    res.json({ status: 'success', data: { news } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// İstatistikleri getir (admin için)
exports.getStats = async (req, res) => {
  try {
    const stats = await News.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalFavorites: { $sum: { $size: '$favorites' } },
          totalNews: { $sum: 1 }
        }
      }
    ]);

    res.json({ 
      status: 'success', 
      data: stats[0] 
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
}; 