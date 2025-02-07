import { Request, Response, NextFunction } from 'express';
import { News, INews } from '../models/News';
import { User } from '../models/User';
import { sendNotification } from '../services/notificationService';
import { DynamoDBService } from '../services/dynamoDBService';
import { S3Service } from '../services/s3Service';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { CloudWatch } from '@aws-sdk/client-cloudwatch';
import { uploadImage, validateImageFile } from '../utils/imageUpload';

const cloudWatch = new CloudWatch({
  region: process.env.AWS_REGION
});

interface ViewRecord {
  viewKey: string;
  newsId: string;
  userId: string;
  viewedAt: string;
}

interface ViewsData {
  total: number;
  unique: number;
  history: Array<{ userId: string; timestamp: string }>;
  last24Hours: number;
}

// Helper function to validate ID
function validateId(id: string | undefined): string {
  if (!id) throw new Error('Invalid ID');
  return id;
}

// Get all news
export const getAllNews = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const news = await News.scan();

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
export const createNews = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.userId) {
    return next(new AppError('Unauthorized', 401));
  }

  let imageUrl: string | undefined;
  if (req.file) {
    validateImageFile(req.file);
    imageUrl = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
  }

  const newsData: INews = {
    newsId: uuidv4(),
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    authorId: req.user.userId,
    status: 'published',
    imageUrl,
    tags: req.body.tags || [],
    views: {
      total: 0,
      unique: 0,
      history: [],
      last24Hours: 0
    },
    shareCount: 0,
    likes: [],
    favorites: [],
    favoriteCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const news = await News.create(newsData);

  res.status(201).json({
    status: 'success',
    data: { news }
  });
});

// Update news
export const updateNews = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.userId) {
    return next(new AppError('Unauthorized', 401));
  }

  const newsId = req.params.id;
  const news = await News.findById(newsId);

  if (!news) {
    return next(new AppError('News not found', 404));
  }

  let imageUrl = news.imageUrl;
  if (req.file) {
    validateImageFile(req.file);
    // Delete old image if exists
    if (imageUrl) {
      const oldKey = imageUrl.split('/').pop() || '';
      const s3Service = req.app.locals.s3Service;
      if (s3Service) {
        await s3Service.deleteFile(oldKey);
      }
    }

    // Upload new image
    imageUrl = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
  }

  const updatedNews = await News.update(newsId, {
    ...req.body,
    imageUrl,
    updatedAt: new Date().toISOString()
  });

  res.status(200).json({
    status: 'success',
    data: { news: updatedNews }
  });
});

// Delete news
export const deleteNews = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.userId) {
    return next(new AppError('Unauthorized', 401));
  }

  const news = await News.findById(req.params.id);
  if (!news) {
    return next(new AppError('News not found', 404));
  }

  await News.delete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// View news
export const viewNews = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const news = await News.findById(req.params.id);
  if (!news) {
    return next(new AppError('News not found', 404));
  }

  const now = new Date().toISOString();
  const userId = req.user?.userId || 'anonymous';

  // Define default views
  const defaultViews: ViewsData = {
    total: 0,
    unique: 0,
    history: [],
    last24Hours: 0
  };

  // Get current views with safe type assertion
  const currentViews: ViewsData = {
    total: news.views?.total ?? defaultViews.total,
    unique: news.views?.unique ?? defaultViews.unique,
    history: news.views?.history ?? defaultViews.history,
    last24Hours: news.views?.last24Hours ?? defaultViews.last24Hours
  };

  // Create updated views
  const updatedViews: ViewsData = {
    total: currentViews.total + 1,
    unique: currentViews.unique,
    history: [...currentViews.history, { userId, timestamp: now }],
    last24Hours: currentViews.last24Hours + 1
  };

  // Update the news document
  const updatedNews = await News.update(req.params.id, {
    views: updatedViews
  });

  res.status(200).json({
    status: 'success',
    data: { views: updatedViews }
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
  const updatedFavorites = isFavorited 
    ? news.favorites.filter(id => id !== userId)
    : [...news.favorites, userId];

  const updatedNews = await News.update(newsId, {
    favorites: updatedFavorites,
    favoriteCount: updatedFavorites.length
  });

  res.status(200).json({
    status: 'success',
    data: {
      isFavorited: !isFavorited,
      favoriteCount: updatedNews?.favoriteCount
    }
  });
});

// Like/Unlike news
export const likeNews = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const newsId = req.params.id;
  const userId = req.user.userId;

  const news = await News.findById(newsId);
  if (!news) {
    throw new AppError('News not found', 404);
  }

  const updatedLikes = Array.from(new Set([...news.likes, userId]));
  const updatedNews = await News.update(newsId, {
    likes: updatedLikes
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

  const newsId = req.params.id;
  const userId = req.user.userId;

  const news = await News.findById(newsId);
  if (!news) {
    throw new AppError('News not found', 404);
  }

  const updatedLikes = news.likes.filter(id => id !== userId);
  const updatedNews = await News.update(newsId, {
    likes: updatedLikes
  });

  res.status(200).json({
    status: 'success',
    data: { news: updatedNews }
  });
});

export class NewsController {
  private readonly dbService: DynamoDBService;
  private readonly s3Service: S3Service;

  constructor() {
    this.dbService = new DynamoDBService();
    this.s3Service = new S3Service();
  }

  getAllNews = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const news = await News.scan();
    res.status(200).json({
      status: 'success',
      results: news.length,
      data: { news }
    });
  });

  getNewsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const news = await News.query('category', category);
    
    res.status(200).json({
      status: 'success',
      results: news.length,
      data: { news }
    });
  });

  getNews = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const news = await News.findById(req.params.id);
    if (!news) {
      return next(new AppError('News not found', 404));
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
    } catch (err) {
      const error = err as Error;
      console.error('List news error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  deleteNews = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
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
    } catch (err) {
      const error = err as Error;
      console.error('Delete news error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Benzer haberleri getir
  getSimilarNews = asyncHandler(async (req: Request, res: Response) => {
    const news = await News.findById(req.params.id);
    if (!news) {
      throw new AppError('News not found', 404);
    }

    const similarNews = await News.query('category', news.category);
    const filtered = similarNews.filter(item => item.newsId !== news.newsId)
      .slice(0, 3);

    res.status(200).json({
      status: 'success',
      data: { news: filtered }
    });
  });

  // Haberi paylaş
  shareNews = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { platform } = req.body;

    const news = await News.findById(id);
    if (!news) {
      throw new AppError('News not found', 404);
    }

    const updatedNews = await News.update(id, {
      shareCount: (news.shareCount || 0) + 1,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      status: 'success',
      message: `News shared on ${platform}`,
      data: { news: updatedNews }
    });
  });

  // Okuma geçmişine ekle
  updateReadingProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const { completed } = req.body;
    const userId = req.user.userId;

    const user = await this.dbService.update(
      process.env.DYNAMODB_USERS_TABLE!,
      { userId },
      {
        $push: {
          readingHistory: {
            newsId: id,
            readAt: new Date().toISOString(),
            completedReading: completed
          }
        }
      }
    );

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });

  // Favoriye ekleme
  addToFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const newsId = req.params.id;
    const userId = req.user.userId;

    const news = await News.findById(newsId);
    if (!news) {
      throw new AppError('News not found', 404);
    }

    if (!news.favorites.includes(userId)) {
      const updatedNews = await News.update(newsId, {
        favorites: [...news.favorites, userId],
        favoriteCount: news.favoriteCount + 1
      });

      res.status(200).json({
        status: 'success',
        data: { news: updatedNews }
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'News already in favorites'
      });
    }
  });

  // Favoriden çıkarma
  removeFromFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const newsId = req.params.id;
    const userId = req.user.userId;

    const news = await News.findById(newsId);
    if (!news) {
      throw new AppError('News not found', 404);
    }

    if (news.favorites.includes(userId)) {
      const updatedNews = await News.update(newsId, {
        favorites: news.favorites.filter(id => id !== userId),
        favoriteCount: news.favoriteCount - 1
      });

      res.status(200).json({
        status: 'success',
        data: { news: updatedNews }
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'News not in favorites'
      });
    }
  });

  // Favori durumunu kontrol etme
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
      data: { isFavorited }
    });
  });

  // Create news
  create = asyncHandler<AuthRequest>(async (req, res) => {
    if (!req.user?.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    let imageUrl: string | undefined;
    if (req.file) {
      validateImageFile(req.file);
      imageUrl = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const newsData: INews = {
      newsId: uuidv4(),
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      authorId: req.user.userId,
      status: 'published',
      imageUrl,
      tags: req.body.tags || [],
      views: {
        total: 0,
        unique: 0,
        history: [],
        last24Hours: 0
      },
      shareCount: 0,
      likes: [],
      favorites: [],
      favoriteCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const news = await News.create(newsData);
    res.status(201).json({
      status: 'success',
      data: { news }
    });
  });

  // Update news
  update = asyncHandler<AuthRequest>(async (req, res) => {
    if (!req.user?.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const newsId = req.params.id;
    const news = await News.findById(newsId);

    if (!news) {
      return next(new AppError('News not found', 404));
    }

    let imageUrl = news.imageUrl;
    if (req.file) {
      validateImageFile(req.file);
      if (imageUrl) {
        const oldKey = imageUrl.split('/').pop() || '';
        if (this.s3Service) {
          await this.s3Service.deleteFile(oldKey);
        }
      }

      imageUrl = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const updatedNews = await News.update(newsId, {
      ...req.body,
      imageUrl,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      status: 'success',
      data: { news: updatedNews }
    });
  });

  // Get favorite news
  getFavoriteNews = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const news = await News.findByFavorites(req.user.userId);
    res.status(200).json({
      status: 'success',
      results: news.length,
      data: { news }
    });
  });

  // Get favorite count
  getFavoriteCount = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const news = await News.findByFavorites(req.user.userId);
    res.status(200).json({
      status: 'success',
      data: { count: news.length }
    });
  });

  // Get news stats
  getNewsStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const stats = await News.getStats();
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  });
} 

function next(arg0: AppError): any {
  throw new Error('Function not implemented.');
}
