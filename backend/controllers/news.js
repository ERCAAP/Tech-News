const News = require('../models/News');
const User = require('../models/User');

// Haber görüntüleme sayısını artır
exports.incrementViews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const news = await News.findById(newsId);
    
    if (!news) {
      return res.status(404).json({
        status: 'error',
        message: 'News not found'
      });
    }

    await news.incrementViews();

    res.json({
      status: 'success',
      data: { views: news.views }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Haberi favorilere ekle
exports.addToFavorites = async (req, res) => {
  try {
    const newsId = req.params.id;
    const userId = req.user._id;

    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({
        status: 'error',
        message: 'News not found'
      });
    }

    await news.addToFavorites(userId);

    // Kullanıcının favorilerine de ekle; User modelinde favoriteNews alanı olduğundan emin olun.
    await User.findByIdAndUpdate(userId, { $addToSet: { favoriteNews: newsId } });

    res.json({
      status: 'success',
      data: {
        favoriteCount: news.favoriteCount,
        isFavorited: true
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
    const userId = req.user._id;

    // Favorilerden çıkarma işlemi
    await User.findByIdAndUpdate(userId, { $pull: { favoriteNews: newsId } });

    res.json({
      status: 'success',
      message: 'Removed from favorites'
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Haberi güncelle (admin için)
exports.updateNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const { title, content, category, imageUrl, contentImages } = req.body;
    
    // Form data işleme
    const updateData = {
      title,
      content,
      category,
      updatedAt: Date.now()
    };

    // Yeni kapak resmi varsa ekle
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    // İçerik resimleri varsa ekle
    if (contentImages) {
      updateData.contentImages = contentImages;
    }

    const news = await News.findByIdAndUpdate(
      newsId,
      updateData,
      { 
        new: true,
        runValidators: true // Validasyonları çalıştır
      }
    ).populate('author', 'firstName lastName');

    if (!news) {
      return res.status(404).json({
        status: 'error',
        message: 'News not found'
      });
    }

    res.json({
      status: 'success',
      data: { news }
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update news'
    });
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