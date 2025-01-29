import { Request, Response } from 'express';
import { News } from '../models/News';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { Types } from 'mongoose';

// Tüm haberleri getir
export const getAllNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.find().populate('author', 'firstName lastName');
  
  res.status(200).json({
    status: 'success',
    results: news.length,
    data: { news }
  });
});

// Tek haber getir
export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.findById(req.params.id).populate('author', 'firstName lastName');
  
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
  const news = await News.create({
    ...req.body,
    author: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: { news }
  });
});

// Haber güncelle
export const updateNews = asyncHandler(async (req: Request, res: Response) => {
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

// Favori ekle/çıkar
export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const user = await req.user.populate('favoriteNews');
  const newsId = req.params.id;

  const index = user.favoriteNews.findIndex((id: Types.ObjectId) => id.toString() === newsId);
  
  if (index === -1) {
    user.favoriteNews.push(newsId);
  } else {
    user.favoriteNews.splice(index, 1);
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    data: { favoriteNews: user.favoriteNews }
  });
}); 