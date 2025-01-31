import { Platform } from 'react-native';

const API_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000'
});

export const getImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  
  console.log('Original image path:', path);
  
  // Eğer tam URL ise direkt kullan
  if (path.startsWith('http')) {
    console.log('Using full URL:', path);
    return path;
  }
  
  // Değilse API URL'i ile birleştir
  const fullUrl = `${API_URL}${path}`;
  console.log('Generated full URL:', fullUrl);
  return fullUrl;
}; 