import { Request, Response } from 'express';
import { News } from '../models/News';
import { User } from '../models/User';
import mongoose from 'mongoose';

export const newsController = {
  getAllNews: async (req: Request, res: Response) => {
    try {
      const news = await News.find()
        .populate('author', 'firstName lastName')
        .sort({ createdAt: -1 });

      res.json({
        status: 'success',
        data: { news }
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  getNewsById: async (req: Request, res: Response) => {
    try {
      const news = await News.findById(req.params.id)
        .populate('author', 'firstName lastName');

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
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  addToFavorites: async (req: Request, res: Response) => {
    try {
      const newsId = req.params.id;
      const userId = new mongoose.Types.ObjectId(req.user._id);

      const news = await News.findById(newsId);
      if (!news) {
        return res.status(404).json({
          status: 'error',
          message: 'News not found'
        });
      }

      await news.addToFavorites(userId);

      await User.findByIdAndUpdate(userId, {
        $addToSet: { favoriteNews: newsId }
      });

      res.json({
        status: 'success',
        data: {
          favoriteCount: news.favoriteCount,
          isFavorited: true
        }
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  removeFromFavorites: async (req: Request, res: Response) => {
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

      await news.removeFromFavorites(userId);

      // Kullanıcının favorilerinden çıkar
      await User.findByIdAndUpdate(userId, {
        $pull: { favoriteNews: newsId }
      });

      res.json({
        status: 'success',
        data: {
          favoriteCount: news.favoriteCount,
          isFavorited: false
        }
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  incrementViews: async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  updateNews: async (req: Request, res: Response) => {
    try {
      const newsId = req.params.id;
      const updates = req.body;
      
      const news = await News.findByIdAndUpdate(
        newsId,
        { ...updates, updatedAt: Date.now() },
        { new: true }
      );

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
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  getStats: async (req: Request, res: Response) => {
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
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}; 