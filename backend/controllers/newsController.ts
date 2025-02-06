import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { News } from '../models/News';
import { User } from '../models/User';
import { sendNotification } from '../services/notificationService';
import { DynamoDBService } from '../services/dynamoDBService';
import { S3Service } from '../services/s3Service';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
// import { upload } from '../utils/upload';
// import { uploadImage } from '../utils/imageUpload';

// Helper function to convert string to ObjectId
function toObjectId(id: string | undefined): mongoose.Types.ObjectId {
  if (!id) throw new Error('Invalid ID');
  return new mongoose.Types.ObjectId(id);
}

export async function getAllNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    next(error);
  }
}

export class NewsController {
  private dbService: DynamoDBService;
  private s3Service: S3Service;

  constructor() {
    this.dbService = new DynamoDBService();
    this.s3Service = new S3Service();
  }

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

  getNews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      throw new AppError('News not found', 404);
    }

    // Update view count
    const userId = req.user?.userId;
    if (userId) {
      const viewKey = `${news._id}-${userId}`;
      const viewRecord = await this.dbService.get('NewsViews', { viewKey });
      
      if (!viewRecord) {
        await this.dbService.create('NewsViews', {
          viewKey,
          newsId: news._id,
          userId,
          viewedAt: new Date().toISOString()
        });

        await News.findByIdAndUpdate(news._id, {
          $inc: { 'views.total': 1, 'views.unique': 1 }
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: { news }
    });
  });

  listNews = async (req: Request, res: Response) => {
    try {
      const { category, lastEvaluatedKey } = req.query;

      const params: any = {
        TableName: process.env.DYNAMODB_NEWS_TABLE!,
        Limit: 10
      };

      if (category) {
        params.IndexName = 'CategoryDateIndex';
        params.KeyConditionExpression = 'category = :category';
        params.ExpressionAttributeValues = {
          ':category': category
        };
      }

      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = JSON.parse(lastEvaluatedKey as string);
      }

      const result = await this.dbService.query(params);
      res.json(result);
    } catch (error) {
      console.error('List news error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  updateNews = async (req: Request, res: Response) => {
    try {
      const { newsId } = req.params;
      const { title, content, category } = req.body;
      const file = req.file;

      const existingNews = await this.dbService.get(process.env.DYNAMODB_NEWS_TABLE!, {
        newsId
      });

      if (!existingNews) {
        return res.status(404).json({ error: 'News not found' });
      }

      let imageUrl = existingNews.imageUrl;
      if (file) {
        // Delete old image if exists
        if (existingNews.imageUrl) {
          const oldKey = existingNews.imageUrl.split('/').pop();
          await this.s3Service.deleteFile(oldKey);
        }

        // Upload new image
        const key = `news/${uuidv4()}-${file.originalname}`;
        imageUrl = await this.s3Service.uploadFile(
          file.buffer,
          key,
          file.mimetype
        );
      }

      const updates = {
        title: title || existingNews.title,
        content: content || existingNews.content,
        category: category || existingNews.category,
        imageUrl,
        updatedAt: new Date().toISOString()
      };

      const updatedNews = await this.dbService.update(
        process.env.DYNAMODB_NEWS_TABLE!,
        { newsId },
        updates
      );

      res.json(updatedNews);
    } catch (error) {
      console.error('Update news error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  deleteNews = async (req: Request, res: Response) => {
    try {
      const { newsId } = req.params;
      
      const existingNews = await this.dbService.get(process.env.DYNAMODB_NEWS_TABLE!, {
        newsId
      });

      if (!existingNews) {
        return res.status(404).json({ error: 'News not found' });
      }

      // Delete image from S3 if exists
      if (existingNews.imageUrl) {
        const key = existingNews.imageUrl.split('/').pop();
        await this.s3Service.deleteFile(key);
      }

      await this.dbService.delete(process.env.DYNAMODB_NEWS_TABLE!, { newsId });
      res.json({ message: 'News deleted successfully' });
    } catch (error) {
      console.error('Delete news error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  viewNews = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const news = await News.findById(req.params.id);
      if (!news) {
        res.status(404).json({ message: 'News not found' });
        return;
      }

      const userId = toObjectId(req.user.userId);
      
      // Son 24 saat içinde aynı kullanıcıdan görüntüleme var mı kontrol et
      const lastView = news.views.history.find(view => 
        view.userId.toString() === userId.toString() && 
        new Date(view.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );

      if (!lastView) {
        // Yeni görüntüleme ekle
        news.views.total += 1;
        news.views.history.push({
          userId,
          timestamp: new Date()
        });

        // Tekil görüntüleme sayısını güncelle
        const uniqueUserIds = new Set(news.views.history.map(v => v.userId.toString()));
        news.views.unique = uniqueUserIds.size;

        // Son 24 saatteki görüntülenmeleri hesapla
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        news.views.last24Hours = news.views.history.filter(
          view => view.timestamp > oneDayAgo
        ).length;

        await news.save();
      }

      res.json({
        status: 'success',
        data: { views: news.views }
      });
    } catch (error) {
      next(error);
    }
  };

  // Benzer haberleri getir
  getSimilarNews = async (req: Request, res: Response) => {
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
  shareNews = async (req: Request, res: Response) => {
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
  updateReadingProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { completed } = req.body;
      const userId = toObjectId(req.user.userId);

      await User.findByIdAndUpdate(userId, {
        $push: {
          readingHistory: {
            news: toObjectId(id),
            completedReading: completed
          }
        }
      });

      res.json({ message: 'Reading progress updated' });
    } catch (error) {
      next(error);
    }
  };

  // Favoriye ekleme
  addToFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      throw new AppError('News not found', 404);
    }

    if (!news.favorites.includes(toObjectId(req.user.userId))) {
      news.favorites.push(toObjectId(req.user.userId));
      news.favoriteCount += 1;
      await news.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Added to favorites'
    });
  });

  // Favoriden çıkarma
  removeFromFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      throw new AppError('News not found', 404);
    }

    const index = news.favorites.indexOf(toObjectId(req.user.userId));
    if (index > -1) {
      news.favorites.splice(index, 1);
      news.favoriteCount -= 1;
      await news.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Removed from favorites'
    });
  });

  // Favori durumunu kontrol etme
  checkFavoriteStatus = async (req: AuthRequest, res: Response) => {
    try {
      const newsId = req.params.id;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const news = await News.findById(newsId);
      if (!news) {
        return res.status(404).json({
          status: 'error',
          message: 'News not found'
        });
      }

      const isFavorited = news.favorites.includes(toObjectId(userId));

      res.json({
        status: 'success',
        data: {
          isFavorited,
          favoriteCount: news.favoriteCount
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  };

  // Like/Unlike işlemleri
  likeNews = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      throw new AppError('News not found', 404);
    }

    if (!news.likes.includes(toObjectId(req.user.userId))) {
      news.likes.push(toObjectId(req.user.userId));
      await news.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'News liked'
    });
  });

  unlikeNews = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      throw new AppError('News not found', 404);
    }

    const index = news.likes.indexOf(toObjectId(req.user.userId));
    if (index > -1) {
      news.likes.splice(index, 1);
      await news.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'News unliked'
    });
  });
} 