import { API_URL } from '../config';

export function getImageUrl(path?: string): string {
  if (!path) return '';
  
  // [IMAGE:] formatını temizle
  const cleanPath = path.replace(/\[IMAGE:|]/g, '').trim();
  
  // Eğer path zaten tam URL ise direkt döndür
  if (cleanPath.startsWith('http')) {
    return cleanPath;
  }
  
  // API_URL ile birleştir
  return `${API_URL}${cleanPath}`;
} 