export const viewNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Görüntülenme sayısını artır
    const viewsUpdate = await News.findByIdAndUpdate(
      id,
      {
        $inc: { 'views.total': 1 },
        ...(userId && { 
          $addToSet: { 'views.uniqueUsers': userId } 
        })
      },
      { new: true }
    );

    // Benzersiz kullanıcı sayısını hesapla
    const uniqueViews = viewsUpdate.views.uniqueUsers?.length || 0;

    return res.json({
      newsId: id,
      views: {
        total: viewsUpdate.views.total,
        unique: uniqueViews
      }
    });
  } catch (error) {
    console.error('View news error:', error);
    return res.status(500).json({ message: 'Failed to update views' });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Haberin var olup olmadığını kontrol et
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Kullanıcının var olup olmadığını kontrol et
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Favorilerde olup olmadığını kontrol et
    const isFavorited = news.favorites?.users?.includes(userId);
    
    if (isFavorited) {
      // Favorilerden kaldır
      await Promise.all([
        News.findByIdAndUpdate(id, {
          $pull: { 'favorites.users': userId },
          $inc: { 'favorites.count': -1 }
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { favorites: { news: id } }
        })
      ]);
    } else {
      // Favorilere ekle
      await Promise.all([
        News.findByIdAndUpdate(id, {
          $addToSet: { 'favorites.users': userId },
          $inc: { 'favorites.count': 1 }
        }),
        User.findByIdAndUpdate(userId, {
          $addToSet: { favorites: { news: id } }
        })
      ]);
    }

    // Güncel haber bilgisini döndür
    const updatedNews = await News.findById(id)
      .populate('favorites.users', 'firstName lastName');

    if (!updatedNews) {
      throw new Error('Failed to get updated news');
    }

    return res.json({
      newsId: id,
      favorites: {
        users: updatedNews.favorites?.users || [],
        count: updatedNews.favorites?.count || 0
      }
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({ 
      message: 'Failed to update favorite status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Kullanıcının favori haberlerini getiren endpoint
export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(userId)
      .populate({
        path: 'favorites.news',
        select: 'title slug imageUrl category createdAt author',
        populate: {
          path: 'author',
          select: 'firstName lastName'
        }
      })
      .select('favorites');

    return res.json({
      favorites: user?.favorites || []
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({ message: 'Failed to get favorites' });
  }
};

// Benzer haberleri getir
export const getSimilarNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    const similar = await News.find({
      category: news.category,
      _id: { $ne: news._id },
      status: 'published'
    })
    .sort({ publishedAt: -1 })
    .limit(3)
    .populate('author', 'firstName lastName');

    return res.json({ similar });
  } catch (error) {
    console.error('Get similar news error:', error);
    return res.status(500).json({ message: 'Failed to get similar news' });
  }
};

// Haberi paylaş
export const shareNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { platform } = req.body; // 'twitter', 'facebook', etc.

    await News.findByIdAndUpdate(id, {
      $inc: { shareCount: 1 }
    });

    return res.json({ message: 'Share count updated' });
  } catch (error) {
    console.error('Share news error:', error);
    return res.status(500).json({ message: 'Failed to update share count' });
  }
};

// Okuma geçmişine ekle
export const updateReadingProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    await User.findByIdAndUpdate(userId, {
      $push: {
        readingHistory: {
          news: id,
          completedReading: completed
        }
      }
    });

    return res.json({ message: 'Reading progress updated' });
  } catch (error) {
    console.error('Update reading progress error:', error);
    return res.status(500).json({ message: 'Failed to update reading progress' });
  }
}; 