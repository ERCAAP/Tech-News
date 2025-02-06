import { upload } from './upload';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImage(file: Buffer, originalName: string, mimeType: string): Promise<string> {
  // Validate mime type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.');
  }

  // Validate file size
  if (file.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds limit. Maximum size is 5MB.');
  }

  return upload(file, originalName, mimeType);
}

export function validateImageFile(file: Express.Multer.File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds limit. Maximum size is 5MB.');
  }
} 