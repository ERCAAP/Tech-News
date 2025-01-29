import { Request, Response } from 'express';
import { News } from '../models/News';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { Types } from 'mongoose';

// Tüm haberleri getir
export const getAllNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.find().sort('-createdAt');
  res.status(200).json({
    status: 'success',
    data: { news }
  });
});

// Tek haber getir
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

// Haber oluştur
export const createNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.create({
    ...req.body,
    author: req.user._id,
    imageUrl: req.file?.path
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
    { ...req.body, imageUrl: req.file?.path },
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

export const likeNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
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
  const news = await News.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
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