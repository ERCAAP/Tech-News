import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { router } from 'expo-router';

export default function Layout() {
  useEffect(() => {
    // Deep Link'leri dinle
    const subscription = Linking.addEventListener('url', (event) => {
      const { path, queryParams } = Linking.parse(event.url);
      
      // URL'den news ID'sini çıkar
      const match = path?.match(/^news\/([^/]+)$/);
      if (match) {
        const newsId = match[1];
        // News detay sayfasına yönlendir
        router.push(`/news/${newsId}`);
      }
    });

    // Initial URL'i kontrol et
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const { path } = Linking.parse(initialUrl);
        const match = path?.match(/^news\/([^/]+)$/);
        if (match) {
          const newsId = match[1];
          router.push(`/news/${newsId}`);
        }
      }
    };

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  return <Stack />;
} 