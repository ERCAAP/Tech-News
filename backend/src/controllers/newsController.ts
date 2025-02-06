import { Request, Response } from 'express';
import { News, INews } from '../models/News';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { log } from '../utils/logger';
import { upload } from '../utils/upload';
import { uploadImage } from '../utils/imageUpload';
import { User } from '../models/User';
import { AuthRequest } from '../types/express';

// Get all news
export const getAllNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.findByCategory(req.query.category as string || 'all');

  res.status(200).json({
    status: 'success',
    results: news.length,
    data: { news }
  });
});

// Get news by ID
export const getNewsById = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.findById(req.params.id);

  if (!news) {
    throw new AppError('News not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { news }
  });
});

// Create news
export const createNews = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized - User not found', 401);
  }

  const newsData = {
    ...req.body,
    authorId: req.user.userId,
    category: req.body.category.toLowerCase().trim(),
    status: 'published',
  };

  const news = await News.create(newsData);

  res.status(201).json({
    status: 'success',
    data: { news }
  });
});

// Update news
export const updateNews = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const news = await News.findByIdAndUpdate(req.params.id, req.body);

  if (!news) {
    throw new AppError('News not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { news }
  });
});

// Delete news
export const deleteNews = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const deleted = await News.findByIdAndDelete(req.params.id);

  if (!deleted) {
    throw new AppError('News not found', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// View news
export const viewNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.findById(req.params.id);

  if (!news) {
    throw new AppError('News not found', 404);
  }

  const updatedNews = await News.findByIdAndUpdate(req.params.id, {
    views: {
      total: news.views.total + 1,
      unique: news.views.unique,
      last24Hours: news.views.last24Hours + 1
    }
  });

  res.status(200).json({
    status: 'success',
    data: { views: updatedNews?.views }
  });
});

// Toggle favorite
export const toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const newsId = req.params.id;
  const userId = req.user.userId;

  const news = await News.findById(newsId);
  if (!news) {
    throw new AppError('News not found', 404);
  }

  const isFavorited = news.favorites.includes(userId);

  const updatedNews = await News.findByIdAndUpdate(newsId, {
    favorites: isFavorited 
      ? news.favorites.filter(id => id !== userId)
      : [...news.favorites, userId],
    favoriteCount: isFavorited ? news.favoriteCount - 1 : news.favoriteCount + 1
  });

  res.status(200).json({
    status: 'success',
    data: {
      isFavorited: !isFavorited
    }
  });
});

// Get favorite news
export const getFavoriteNews = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const news = await News.findByFavorites(req.user.userId);

  res.status(200).json({
    status: 'success',
    results: news.length,
    data: { news }
  });
});

// Get news stats
export const getNewsStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await News.getStats();

  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

// Like/Unlike işlemleri
export const likeNews = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const userId = req.user.userId;
  const news = await News.findById(req.params.id);
  
  if (!news) {
    throw new AppError('News not found', 404);
  }

  const updatedNews = await News.findByIdAndUpdate(req.params.id, {
    likes: Array.from(new Set([...news.likes, userId]))
  });

  res.status(200).json({
    status: 'success',
    data: { news: updatedNews }
  });
});

export const unlikeNews = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const userId = req.user.userId;
  const news = await News.findById(req.params.id);

  if (!news) {
    throw new AppError('News not found', 404);
  }

  const updatedNews = await News.findByIdAndUpdate(req.params.id, {
    likes: news.likes.filter((likeId: string) => likeId !== userId)
  });

  res.status(200).json({
    status: 'success',
    data: { news: updatedNews }
  });
});

// Kullanıcının favori haber sayısını getir
export const getFavoriteCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const news = await News.findByFavorites(req.user.userId);
  const count = news.length;

  res.status(200).json({
    status: 'success',
    count
  });
});

// Favori durumunu kontrol et
export const checkFavoriteStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const newsId = req.params.id;
  const userId = req.user.userId;

  const news = await News.findById(newsId);
  if (!news) {
    throw new AppError('News not found', 404);
  }

  const isFavorited = news.favorites.includes(userId);

  res.status(200).json({
    status: 'success',
    data: {
      isFavorited
    }
  });
}); 