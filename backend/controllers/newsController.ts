import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { News } from '../models/News';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

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

export async function createNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const news = new News({
      ...req.body,
      author: toObjectId(req.user._id)
    });
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    next(error);
  }
}

export async function updateNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!news) {
      res.status(404).json({ message: 'News not found' });
      return;
    }
    res.json(news);
  } catch (error) {
    next(error);
  }
}

export async function deleteNews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      res.status(404).json({ message: 'News not found' });
      return;
    }
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting news' });
  }
}

export async function viewNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      res.status(404).json({ message: 'News not found' });
      return;
    }
    
    const userId = toObjectId(req.user._id);
    if (!news.views.uniqueUsers.includes(userId)) {
      news.views.uniqueUsers.push(userId);
      news.views.total += 1;
      await news.save();
    }
    
    res.json(news);
  } catch (error) {
    next(error);
  }
}

export async function toggleFavorite(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      res.status(404).json({ message: 'News not found' });
      return;
    }

    const userId = toObjectId(req.user._id);
    const userIndex = news.favorites.users.findIndex(id => id.equals(userId));

    if (userIndex === -1) {
      news.favorites.users.push(userId);
      news.favorites.count += 1;
    } else {
      news.favorites.users.splice(userIndex, 1);
      news.favorites.count -= 1;
    }

    await news.save();
    res.json({
      newsId: news._id,
      favorites: {
        users: news.favorites.users,
        count: news.favorites.count
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update favorite status' });
  }
}

export async function getUserFavorites(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorites.news',
        populate: {
          path: 'author',
          select: 'firstName lastName'
        }
      });

    res.json({ favorites: user?.favorites || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get favorites' });
  }
}

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
export async function updateReadingProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { completed } = req.body;
    const userId = toObjectId(req.user._id);

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
} 