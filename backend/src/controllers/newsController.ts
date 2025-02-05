import { Request, Response } from 'express';
import { News } from '../models/News';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';
import { upload } from '../utils/upload';
import { uploadImage } from '../utils/imageUpload';
import { User } from '../models/User';
import mongoose from 'mongoose';

// Request tipini genişlet
interface AuthRequest extends Request {
  user?: {
    id: string;
    _id: string; // MongoDB ID için
    role: string;
  };
}

// Multer request interface'ini düzelt
interface MulterRequest extends Request {
  files: {
    [key: string]: Express.Multer.File[];
  };
  user: {
    _id: string;
    role: string;
  };
}

// Tüm haberleri getir
export const getAllNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.find()
    .sort('-createdAt')
    .populate('author', 'firstName lastName');

  res.status(200).json({
    status: 'success',
    results: news.length,
    data: { news }
  });
});

// Tek haber getir
export const getNewsById = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.findById(req.params.id)
    .populate('author', 'firstName lastName');

  if (!news) {
    throw new AppError('News not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { news }
  });
});
// Haber oluştur
export const createNews = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Create News Request:', {
      body: req.body,
      user: req.user
    });

    if (!req.user?._id) {
      throw new AppError('Unauthorized - User not found', 401);
    }

    // Kategoriyi normalize et ve gerekli alanları hazırla
    const newsData = {
      ...req.body,
      author: req.user._id,
      category: req.body.category.toLowerCase().trim(),
      summary: req.body.summary || req.body.content.substring(0, 197) + '...',
      status: 'published',
      publishedAt: new Date()
    };

    console.log('Creating news with data:', newsData);

    const news = await News.create(newsData);
    const populatedNews = await News.findById(news._id)
      .populate('author', 'firstName lastName');

    res.status(201).json({
      status: 'success',
      data: { news: populatedNews }
    });
  } catch (error: any) {
    console.error('Create news error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      throw new AppError(`Validation error: ${errors.join(', ')}`, 400);
    }
    throw error;
  }
});

// Haber güncelle
export const updateNews = async (req: Request, res: Response) => {
  try {
    console.log('\n=== Update News Handler ===');
    console.log('ID:', req.params.id);
    console.log('Update Data:', req.body);
    console.log('User:', (req as any).user);

    const { id } = req.params;
    
    // ID kontrolü
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ID format:', id);
      return res.status(400).json({
        status: 'error',
        message: 'Geçersiz haber ID formatı'
      });
    }

    // Kategoriyi normalize et
    if (req.body.category) {
      req.body.category = req.body.category.toLowerCase().trim();
    }

    console.log('Final update data:', req.body);

    const updatedNews = await News.findByIdAndUpdate(
      id,
      { $set: req.body },
      { 
        new: true,
        runValidators: true 
      }
    ).populate('author', 'firstName lastName');

    if (!updatedNews) {
      console.log('News not found with ID:', id);
      return res.status(404).json({
        status: 'error',
        message: 'Haber bulunamadı'
      });
    }

    console.log('News updated successfully:', updatedNews._id);
    res.json({
      status: 'success',
      data: { news: updatedNews }
    });

  } catch (error: any) {
    console.error('Update News Error:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(400).json({
      status: 'error',
      message: error.message || 'Haber güncellenirken bir hata oluştu'
    });
  }
};

// Haber sil
export const deleteNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.findByIdAndDelete(req.params.id);

  if (!news) {
    throw new AppError('News not found', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
// Görüntülenme sayısını artır
export const viewNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!news) {
    throw new AppError('News not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { views: news.views }
  });
});
// Favorilere ekle/çıkar
export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  const newsId = req.params.id;
  const userId = new Types.ObjectId(req.user.id);

  const news = await News.findById(newsId);
  if (!news) {
    throw new AppError('News not found', 404);
  }

  // Favori durumunu kontrol et
  const user = await User.findById(userId);
  const isFavorited = user?.favoriteNews.includes(news._id);

  // User modelini güncelle
  await User.findByIdAndUpdate(
    userId,
    {
      [isFavorited ? '$pull' : '$addToSet']: { favoriteNews: news._id }
    },
    { new: true }
  );

  // News modelini güncelle
  const updatedNews = await News.findByIdAndUpdate(
    newsId,
    {
      [isFavorited ? '$pull' : '$addToSet']: { favorites: userId },
      $inc: { favoriteCount: isFavorited ? -1 : 1 }
    },
    { new: true }
  );

  console.log('Toggle favorite result:', { isFavorited, userId, newsId }); // Debug için log

  res.status(200).json({
    status: 'success',
    data: {
      isFavorited: !isFavorited,
      favorites: updatedNews?.favorites || [],
      favoriteCount: updatedNews?.favoriteCount || 0
    }
  });
});
// Kullanıcının favori haberlerini getir
export const getFavoriteNews = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    console.log('User favorite news IDs:', user.favoriteNews); // Debug için

    const news = await News.find({
      '_id': { $in: user.favoriteNews }
    }).populate('author', 'firstName lastName');

    console.log('Found favorite news:', news); // Debug için

    res.status(200).json({
      status: 'success',
      results: news.length,
      data: {
        news
      }
    });
  } catch (error) {
    console.error('Get Favorite News Error:', error);
    throw new AppError('Failed to get favorite news', 500);
  }
});

// İstatistikleri getir
export const getNewsStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await News.aggregate([
    {
      $group: {
        _id: null,
        totalNews: { $sum: 1 },
        totalViews: { $sum: '$views' },
        avgViews: { $avg: '$views' },
        totalFavorites: { $sum: { $size: '$favorites' } }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats: stats[0] }
  });
});

// Like/Unlike işlemleri
export const likeNews = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  const userId = new Types.ObjectId(req.user._id);
  
  const news = await News.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: userId } },
    { new: true }
  );

  if (!news) {
    throw new AppError('News not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { news }
  });
});

export const unlikeNews = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  const userId = new Types.ObjectId(req.user._id);

  const news = await News.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: userId } },
    { new: true }
  );

  if (!news) {
    throw new AppError('News not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { news }
  });
});
// Kullanıcının favori haber sayısını getir
export const getFavoriteCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  const count = await News.countDocuments({
    favorites: req.user.id
  });

  res.status(200).json({
    status: 'success',
    count
  });
});
// Favori durumunu kontrol et
export const checkFavoriteStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  const newsId = req.params.id;
  const userId = new Types.ObjectId(req.user.id);

  const news = await News.findById(newsId);
  if (!news) {
    throw new AppError('News not found', 404);
  }

  const isFavorited = news.favorites.some(id => id.equals(userId));

  res.status(200).json({
    status: 'success',
    data: {
      isFavorited
    }
  });
});

// Favorilere ekle
export const addToFavorites = async (req: Request & { user?: any }, res: Response) => {
  try {
    const newsId = req.params.id;
    const userId = req.user?._id;

    console.log('Add to favorites - User:', req.user); // Debug için

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Giriş yapmanız gerekiyor'
      });
    }

    const news = await News.findByIdAndUpdate(
      newsId,
      {
        $addToSet: { favorites: userId },
        $inc: { favoriteCount: 1 }
      },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({
        status: 'error',
        message: 'Haber bulunamadı'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        isFavorited: true,
        favoriteCount: news.favoriteCount,
        favorites: news.favorites
      }
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Favorilere eklenirken bir hata oluştu'
    });
  }
};

// Favorilerden çıkar
export const removeFromFavorites = async (req: Request & { user?: any }, res: Response) => {
  try {
    const newsId = req.params.id;
    const userId = req.user?._id;

    console.log('Remove from favorites - User:', req.user); // Debug için

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Giriş yapmanız gerekiyor'
      });
    }

    const news = await News.findByIdAndUpdate(
      newsId,
      {
        $pull: { favorites: userId },
        $inc: { favoriteCount: -1 }
      },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({
        status: 'error',
        message: 'Haber bulunamadı'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        isFavorited: false,
        favoriteCount: news.favoriteCount,
        favorites: news.favorites
      }
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Favorilerden çıkarılırken bir hata oluştu'
    });
  }
};

// Benzer haberleri getir
export const getSimilarNews = async (req: Request, res: Response) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        status: 'error',
        message: 'Haber bulunamadı'
      });
    }

    const similarNews = await News.find({
      category: news.category,
      _id: { $ne: news._id }
    })
    .limit(3)
    .populate('author', 'firstName lastName');

    res.status(200).json({
      status: 'success',
      data: { news: similarNews }
    });
  } catch (error) {
    console.error('Get similar news error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Benzer haberler getirilirken bir hata oluştu'
    });
  }
}; 