import { Request, Response } from 'express';
import { News } from '../models/News';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';
import { upload } from '../utils/upload';
import path from 'path';

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
  try {
    logger.info('Request body:', req.body);
    logger.info('Request files:', req.files);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Ana görsel URL'i
    let imageUrl = '';
    if (files?.coverImage?.[0]) {
      const filename = files.coverImage[0].filename;
      imageUrl = `${process.env.BASE_URL}/uploads/${filename}`; // Tam URL kullan
    }

    // İçerik görselleri
    let contentImages: string[] = [];
    if (files?.contentImage0) {
      contentImages = files.contentImage0.map(file => 
        `${process.env.BASE_URL}/uploads/${file.filename}`
      );
    }

    // İçeriği düzenle ve görselleri ekle
    let content = req.body.content;
    contentImages.forEach((imageUrl, index) => {
      content = content.replace(
        `[IMAGE-${index}]`,
        `<img src="${imageUrl}" alt="Content image ${index + 1}" style="max-width: 100%; height: auto;" />`
      );
    });

    // Kategoriyi düzelt
    let category = req.body.category;
    if (category) {
      category = category.charAt(0).toUpperCase() + category.slice(1);
      if (category.toLowerCase() === 'ai') {
        category = 'AI';
      }
    }

    const newsData = {
      title: req.body.title,
      displayTitle: req.body.displayTitle || req.body.title,
      content: content,
      summary: req.body.content.substring(0, 200),
      category: category || 'General',
      author: req.user._id,
      imageUrl,
      contentImages,
      status: 'published'
    };

    logger.info('Creating news with data:', newsData);

    const news = await News.create(newsData);
    await news.populate('author', 'firstName lastName');

    return res.status(201).json({
      status: 'success',
      data: { news }
    });

  } catch (error: any) {
    // Detaylı hata loglaması
    logger.error('Create news error details:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Haber oluşturulurken bir hata oluştu',
      details: error.message
    });
  }
});

// Haber güncelle
export const updateNews = asyncHandler(async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let updateData = { ...req.body };

    // Ana görsel güncelleme
    if (files && files['image'] && files['image'][0]) {
      updateData.imageUrl = `/uploads/${files['image'][0].filename}`;
    }

    // İçerik görselleri güncelleme
    if (files && files['contentImages']) {
      updateData.contentImages = files['contentImages'].map(file => `/uploads/${file.filename}`);
    }

    // Tags array'ini parse et
    if (updateData.tags) {
      updateData.tags = JSON.parse(updateData.tags);
    }

    // Boolean değerleri düzelt
    if (updateData.isHighlighted) {
      updateData.isHighlighted = updateData.isHighlighted === 'true';
    }

    const news = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('author', 'firstName lastName');

    if (!news) {
      throw new AppError('News not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { news }
    });
  } catch (error: any) {
    logger.error('Error updating news:', error);
    throw new AppError(error?.message || 'Error updating news', 500);
  }
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