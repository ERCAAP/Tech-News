import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, ToastAndroid } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { getImageUrl } from '@/utils/imageHelper';
import { MaterialIcons } from '@expo/vector-icons';
import { viewNews, toggleFavorite } from '@/redux/slices/newsSlice';
import { NewsItem } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NewsViews {
  total: number;
  unique: number;
}

function isValidViews(views: any): views is NewsViews {
  return typeof views === 'object' && 
         views !== null && 
         'total' in views && 
         'unique' in views &&
         typeof views.total === 'number' &&
         typeof views.unique === 'number';
}

function formatViewCount(views: NewsViews | undefined): string {
  const count = views?.total || 0;
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export default function NewsDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const slug = typeof params.slug === 'string' ? params.slug : params.slug[0];
  
  const dispatch = useAppDispatch();
  const { news } = useAppSelector(state => state.news);
  const { user } = useAppSelector(state => state.auth);
  const newsItem = news.find((item: NewsItem) => item.slug === slug);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!newsItem) {
      router.replace('/(tabs)');
      return;
    }

    dispatch(viewNews(newsItem._id));
  }, [newsItem]);

  const handleFavoritePress = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to favorite news');
      return;
    }
    
    if (!newsItem) return;

    try {
      setIsLoading(true);
      await dispatch(toggleFavorite(newsItem._id)).unwrap();
      
      if (!newsItem?.favorites?.users?.includes(user._id)) {
        ToastAndroid.show('Added to favorites', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Removed from favorites', ToastAndroid.SHORT);
      }

    } catch (error) {
      console.error('Favorite error:', error);
      Alert.alert(
        'Error',
        typeof error === 'string' ? error : 'Failed to update favorite status'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: string) => {
    if (!content) return null;

    return content.split('\n').map((part, index) => {
      const imageMatch = part.match(/\[IMAGE:(.*?)\]/);
      
      if (imageMatch) {
        const imagePath = imageMatch[1];
        const fullImageUrl = getImageUrl(imagePath);
        
        return (
          <View key={`image-${index}`} style={styles.contentImageContainer}>
            <Image 
              source={{ uri: fullImageUrl }}
              style={styles.contentImage}
              resizeMode="cover"
              onError={() => console.warn('Content image load error:', fullImageUrl)}
            />
          </View>
        );
      }

      return part.trim() ? (
        <Text key={`text-${index}`} style={styles.contentText}>
          {part}
        </Text>
      ) : null;
    });
  };

  if (isLoading) return <Loading />;
  if (!newsItem) return null;

  const coverImageUrl = newsItem.imageUrl ? getImageUrl(newsItem.imageUrl) : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.viewCountContainer}>
        <MaterialIcons name="visibility" size={20} color={COLORS.gray} />
        <Text style={styles.viewCountText}>
          {isValidViews(newsItem?.views) ? formatViewCount(newsItem.views) : '0'}
        </Text>
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={true}
        bounces={true}
        contentContainerStyle={{
          paddingBottom: 100
        }}
      >
        {/* ... geri kalan JSX aynı ... */}
      </ScrollView>
    </SafeAreaView>
  );
}

// ... stiller aynı ... 