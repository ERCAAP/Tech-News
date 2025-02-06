import multer from 'multer';
import { S3Service } from '../services/s3Service';
import { Request, Response, NextFunction } from 'express';

const s3Service = new S3Service();

// Use memory storage for temporary file handling
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.'));
  }
};

// Multer config
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload to S3
export const uploadToS3 = async (file: Express.Multer.File, folder: string = 'uploads'): Promise<string> => {
  try {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    const url = await s3Service.uploadFile(file.buffer, key, file.mimetype);
    return url;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Log uploaded files
export const logUploadedFiles = (req: Request, res: Response, next: Function) => {
  console.log('Uploaded files:', req.files);
  next();
}; 