import { Request, Response, NextFunction } from 'express';
import { News, INews } from '../models/News';
import { User } from '../models/User';
import { DynamoDBService } from '../services/dynamoDBService';
import { S3Service } from '../services/s3Service';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { CloudWatch } from '@aws-sdk/client-cloudwatch';
import { uploadFile } from '../utils/upload';
import { uploadImage, validateImageFile } from '../utils/imageUpload';

export class NewsController {
  getAllNews = asyncHandler(async (req: Request, res: Response) => {
    const news = await News.findByCategory(req.query.category as string || 'all');

    res.status(200).json({
      status: 'success',
      results: news.length,
      data: { news }
    });
  });

  getNews = asyncHandler(async (req: Request, res: Response) => {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      throw new AppError('News not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { news }
    });
  });

  createNews = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  updateNews = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  deleteNews = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      return next(new AppError('News not found', 404));
    }

    await News.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  viewNews = asyncHandler(async (req: Request, res: Response) => {
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

  toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  getFavoriteNews = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  getNewsStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await News.getStats();

    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  });

  likeNews = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  unlikeNews = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  getFavoriteCount = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  checkFavoriteStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
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
} 