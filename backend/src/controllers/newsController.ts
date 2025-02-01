import { Request, Response } from 'express';
import { News } from '../models/News';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';
import { upload } from '../utils/upload';
import { uploadImage } from '../utils/imageUpload';

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
export const createNews = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  // Kategoriyi büyük harfe çevir
  const newsData = {
    ...req.body,
    author: req.user.id,
    category: req.body.category?.toUpperCase(),
    // Özet yoksa içeriğin ilk 200 karakterini kullan
    summary: req.body.summary || req.body.content.substring(0, 197) + '...'
  };

  try {
    const news = await News.create(newsData);

    res.status(201).json({
      status: 'success',
      data: { news }
    });
  } catch (error: any) {
    // Validasyon hatalarını daha anlaşılır hale getir
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      throw new AppError(`Validasyon hatası: ${errors.join(', ')}`, 400);
    }
    throw error;
  }
});

// Haber güncelle
export const updateNews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const news = await News.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!news) {
    throw new AppError('News not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { news }
  });
});

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
export const viewNews = asyncHandler(async (req: AuthRequest, res: Response) => {
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
export const toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  const news = await News.findById(req.params.id);
  if (!news) {
    throw new AppError('News not found', 404);
  }

  // ObjectId'ye çevir
  const userId = new Types.ObjectId(req.user.id);
  
  // favorites array'inde ObjectId olarak ara
  const isFavorited = news.favorites.some(id => id.equals(userId));
  
  const update = isFavorited
    ? { $pull: { favorites: userId } }
    : { $addToSet: { favorites: userId } };

  const updatedNews = await News.findByIdAndUpdate(
    req.params.id,
    {
      ...update,
      $inc: { favoriteCount: isFavorited ? -1 : 1 }
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      isFavorited: !isFavorited,
      favorites: updatedNews?.favorites || [],
      favoriteCount: updatedNews?.favoriteCount || 0
    }
  });
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
export const likeNews = asyncHandler(async (req: AuthRequest, res: Response) => {
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

export const unlikeNews = asyncHandler(async (req: AuthRequest, res: Response) => {
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
export const getFavoriteCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
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