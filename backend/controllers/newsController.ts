import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { News } from '../models/News';
import { User } from '../models/User';
import { sendNotification } from '../services/notificationService';

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

export const createNews = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      content, 
      category,
      notification 
    } = req.body;

    const news = new News({
      title,
      content,
      category,
      author: req.user._id
    });

    await news.save();

    // Bildirim gönderme
    if (notification?.enabled) {
      await sendNotification({
        title: notification.title || title,
        message: notification.message || content.substring(0, 30) + '...',
        data: {
          newsId: news._id,
          type: 'news'
        }
      });
    }

    res.status(201).json({
      status: 'success',
      data: { news }
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateNews = async (req: Request, res: Response) => {
  try {
    console.log('\n=== Update News Request ===');
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

    // Önce haberin var olup olmadığını kontrol et
    const existingNews = await News.findById(id);
    if (!existingNews) {
      console.log('News not found with ID:', id);
      return res.status(404).json({
        status: 'error',
        message: 'Haber bulunamadı'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Kategori kontrolü ve dönüşümü
    if (updateData.category) {
      console.log('Original category:', updateData.category);
      updateData.category = updateData.category.toLowerCase().replace(/\s+/g, '-');
      console.log('Transformed category:', updateData.category);
    }

    console.log('Final update data:', updateData);

    const updatedNews = await News.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true,
        runValidators: true 
      }
    ).populate('author', 'firstName lastName');

    console.log('Update result:', updatedNews);

    if (!updatedNews) {
      console.log('Update failed for ID:', id);
      return res.status(404).json({
        status: 'error',
        message: 'Haber güncellenemedi'
      });
    }

    console.log('News updated successfully');
    res.json({
      status: 'success',
      data: { news: updatedNews }
    });

  } catch (error: any) {
    console.error('=== Update News Error ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(400).json({
      status: 'error',
      message: error.message || 'Haber güncellenirken bir hata oluştu'
    });
  }
};

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