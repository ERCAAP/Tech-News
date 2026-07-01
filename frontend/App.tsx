import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreUserSession } from '@/redux/slices/authSlice';
import { AppDispatch } from '@/redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import OneSignal from 'react-native-onesignal';
import type {
  NotificationReceivedEvent,
  NotificationOpenedEvent
} from 'react-native-onesignal';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import axios from 'axios';

export default function App({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeApp = async () => {
      SplashScreen.preventAutoHideAsync(); // Splash screen'i göster
      try {
        await dispatch(restoreUserSession());
        const isTutorialCompleted = await AsyncStorage.getItem('isTutorialCompleted');
        
        if (!isTutorialCompleted) {
          router.replace('/(tutorial)/welcome');
        }

        // Deep Linking
        const handleDeepLink = (url: string | null) => {
          if (url) {
            const { path, queryParams } = Linking.parse(url);
            //console.log("Deep Link:", path, queryParams); // Debug için

            if (path === 'news' && queryParams?.id) {
              router.push(`/news/${queryParams.id}`);
            } else if (path) { // Eğer sadece /news ise, news listesine yönlendir
              router.push(`/${path}`);
            }
          }
        };

        // Uygulama açıkken gelen linkler
        const subscription = Linking.addEventListener('url', ({ url }) => {
          handleDeepLink(url);
        });

        // Uygulama kapalıyken gelen ilk link
        Linking.getInitialURL().then(handleDeepLink);
        // OneSignal Initialization
        const oneSignalAppId = Constants.expoConfig?.extra?.oneSignalAppId || '';
        if (!oneSignalAppId) {
          console.warn("OneSignal App ID is not configured. Notifications may not work properly.");
        } else {
          OneSignal.initialize(oneSignalAppId);
        }

        // OneSignal Event Handlers (v5 API)
        OneSignal.Notifications.addEventListener('opened', (event: NotificationOpenedEvent) => {
          console.log("OneSignal: notification opened:", event.notification);
          // Bildirim açıldığında yapılacak işlemler (örneğin, belirli bir ekrana yönlendirme)
          if (event.notification.additionalData && event.notification.additionalData.newsId) {
            router.push(`/news/${event.notification.additionalData.newsId}`);
          }
        });

        OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: NotificationReceivedEvent) => {
          console.log("OneSignal: notification will show in foreground:", event.notification);
          const notification = event.notification;

          // İsteğe bağlı: Bildirimi özelleştirme
          // notification.additionalData = { ...notification.additionalData, customKey: 'customValue' };

          // Bildirimi göster
          event.complete(notification);
        });

        return () => {
          subscription.remove();
          // Event listener'ları temizle
          OneSignal.Notifications.removeEventListener('opened');
          OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
        };

      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        SplashScreen.hideAsync(); // Yükleme bitti, splash screen'i gizle
      }
    };

    initializeApp();
  }, [dispatch]);

  return children;
}

interface NewsData {
  title: string;
  content: string;
  category: string; // Make sure category is correctly typed
  image?: string; // Assuming image is a file URI or similar
}

const createNews = async (newsData: NewsData) => {
  try {
    // 1. Image Handling (Improved with expo-image-manipulator)
    let imageUrl = '';
    if (newsData.image) {
      // Use expo-image-manipulator for consistent results
      console.log("Original image URI:", newsData.image); // Log original URI
      const manipResult = await manipulateAsync(
        newsData.image,
        [], // No actions, just using for format conversion
        { compress: 0.7, format: SaveFormat.JPEG } // Or SaveFormat.PNG if appropriate
      );

      imageUrl = await uploadImage(manipResult.uri, newsData.category); // Pass category
      console.log("Uploaded image URL:", imageUrl); // Log the URL
      if (!imageUrl) { // Check for upload failure
        throw new Error("Image upload failed");
      }
    }

    // 2. Create News Data (after successful image upload)
    const finalNewsData = {
      title: newsData.title,
      content: newsData.content,
      category: newsData.category,
      imageUrl: imageUrl, // Use the URL from the upload
    };

    // 3. Send News Data (using the correct URL and method)
    const newsResponse = await axios.post('/news', finalNewsData, {
      headers: {
        'Content-Type': 'application/json', // Important for the main news data
      },
    });

    console.log('API Response:', newsResponse);

    if (newsResponse.status !== 201) {
      throw new Error(`Failed to create news: ${newsResponse.data}`);
    }

    return newsResponse.data.data; // Assuming successful response

  } catch (error: any) {
    console.error('Error creating news:', error);
    throw error; // Re-throw to handle upstream
  }
};

const uploadImage = async (imageUri: string, category: string) => {
  console.log(`Uploading image for category: ${category}`); // Log the category
  try {
    const formData = new FormData();
    // Get filename from URI
    const filename = imageUri.split('/').pop() || 'image.jpg'; // Fallback name

    // Infer MIME type (more robust method)
    const mimeType = getMimeType(filename);

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: mimeType, // Use the inferred MIME type
    } as any); // Cast to any to bypass type checking (temporary workaround)

    // Add category to the form data *if the backend expects it*
    // **Conditional Category Append:**  Only add if the backend needs it for upload.
    // Replace `YOUR_BACKEND_NEEDS_CATEGORY_FOR_UPLOAD` with a boolean check,
    // or remove the `if` statement entirely if the backend *always* needs it.
    //if (YOUR_BACKEND_NEEDS_CATEGORY_FOR_UPLOAD) {
      formData.append('category', category);
    //}

    const uploadResponse = await axios.post('/news/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Correct header for file uploads
      },
    });

    console.log('Upload API Response:', uploadResponse); // More specific log

    if (uploadResponse.status !== 201) {
      throw new Error(`Failed to upload image: ${uploadResponse.data}`);
    }

    return uploadResponse.data.data.imageUrl; // Get URL from response (adjust as needed)

  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`); // More informative error
  }
};

// Helper function to get MIME type
function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    // Add other cases as needed
    default:
      return 'application/octet-stream'; // Default binary type
  }
}