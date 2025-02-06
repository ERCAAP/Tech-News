import { S3Service } from '../services/s3Service';
import { AppError } from './AppError';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Dosya doğrulama fonksiyonu
export function validateImageFile(file: Express.Multer.File): void {
  if (!file) {
    throw new AppError('No file provided', 400);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new AppError('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.', 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError('File size exceeds limit. Maximum size is 5MB.', 400);
  }
}

// Resim yükleme fonksiyonu
export async function uploadImage(
  file: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  try {
    const s3Service = new S3Service();
    const key = `uploads/${Date.now()}-${originalName}`;
    
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new AppError('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.', 400);
    }

    const url = await s3Service.uploadFile(file, key, mimeType);
    return url;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to upload image', 500);
  }
}

// Resim silme fonksiyonu
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const s3Service = new S3Service();
    const key = imageUrl.split('/').pop();
    
    if (!key) {
      throw new AppError('Invalid image URL', 400);
    }

    await s3Service.deleteFile(key);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete image', 500);
  }
}

// Resim URL'sini oluşturma fonksiyonu
export async function getSignedImageUrl(key: string): Promise<string> {
  try {
    const s3Service = new S3Service();
    return await s3Service.getSignedUrl(key);
  } catch (error) {
    throw new AppError('Failed to generate signed URL', 500);
  }
} 