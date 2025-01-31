import { Request, Response } from 'express';
import { News } from '../models/News';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';
import { upload } from '../utils/upload';
import { uploadImage } from '../utils/imageUpload';

// Multer request interface'ini düzelt
interface MulterRequest extends Request {
  files: {
    [key: string]: Express.Multer.File[];
  };
  user: {
    _id: string;
    role: string;
  };
}

// Tüm haberleri getir
export const getAllNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.find()
    .sort('-createdAt')
    .populate('author', 'firstName lastName');

  console.log('Sending news:', news); // Debug için

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
    const { title, displayTitle, content, category, imageUrl } = req.body;
    const files = (req as MulterRequest).files;
    
    console.log('Request body:', req.body);
    console.log('Received files:', files);

    // Cover image işleme
    let coverImagePath = '';
    if (imageUrl) {
      coverImagePath = imageUrl;
      console.log('Using imageUrl as coverImage:', coverImagePath);
    } else if (files?.coverImage?.[0]) {
      const coverImageFile = files.coverImage[0];
      coverImagePath = `/uploads/${coverImageFile.filename}`;
      console.log('Using uploaded file as coverImage:', coverImagePath);
    }

    // İçerik resimleri işleme
    let contentImages: string[] = [];
    let updatedContent = content;

    if (files?.contentImages) {
      contentImages = files.contentImages.map(file => {
        const path = `/uploads/${file.filename}`;
        console.log('Processing content image:', {
          originalName: file.originalname,
          filename: file.filename,
          path: path
        });
        return path;
      });

      contentImages.forEach(imagePath => {
        updatedContent = updatedContent.replace('[IMAGE]', `[IMAGE:${imagePath}]`);
      });
    }

    const newsData = {
      title,
      displayTitle: displayTitle || title,
      content: updatedContent,
      category: category.toUpperCase(),
      coverImage: coverImagePath,
      imageUrl: coverImagePath,
      contentImages,
      author: (req as MulterRequest).user._id,
      summary: content.substring(0, 200),
      status: 'published'
    };

    console.log('Creating news with data:', newsData);

    const news = await News.create(newsData);
    const populatedNews = await News.findById(news._id)
      .populate('author', 'firstName lastName');

    res.status(201).json({
      status: 'success',
      data: { news: populatedNews }
    });

  } catch (error: any) {
    logger.error('Create news error:', error);
    throw new AppError(error?.message || 'Failed to create news', 500);
  }
});

// Haber güncelle
export const updateNews = asyncHandler(async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    let updateData = { ...req.body };
    let contentImages: string[] = [];

    // Cover image güncelleme
    if (files?.coverImage?.[0]) {
      updateData.imageUrl = `/uploads/${files.coverImage[0].filename}`;
    }

    // Content images güncelleme
    if (files?.contentImages) {
      contentImages = files.contentImages.map(file => `/uploads/${file.filename}`);
      let contentWithImages = updateData.content;
      
      contentImages.forEach(imagePath => {
        contentWithImages = contentWithImages.replace('[IMAGE]', `[IMAGE:${imagePath}]`);
      });
      
      updateData.content = contentWithImages;
      updateData.contentImages = contentImages; // Content image URL'lerini güncelle
    }

    // Kategoriyi büyük harfe çevir
    if (updateData.category) {
      updateData.category = updateData.category.toUpperCase();
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