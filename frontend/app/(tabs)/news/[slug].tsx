import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, ToastAndroid } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { getImageUrl } from '@/utils/imageHelper';
import { MaterialIcons } from '@expo/vector-icons';
import { viewNews, toggleFavorite, deleteNews } from '@/redux/slices/newsSlice';
import { NewsItem } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EditNewsModal } from 'components/admin/EditNewsModal';

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
  const newsItem = news.find((item: NewsItem) => {
    const newsWithSlug = item as NewsItem & { slug?: string };
    return newsWithSlug.slug === slug;
  });

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    if (!newsItem) {
      router.replace('/(tabs)');
      return;
    }

    if (user) {
      dispatch(viewNews(newsItem._id));
    }
  }, [newsItem?._id]);

  const handleFavoritePress = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to favorite news');
      return;
    }
    
    if (!newsItem) {
      console.log('Favorite Press - No news item found');
      return;
    }

    console.log('Favorite Press - Attempting to toggle favorite for:', {
      newsId: newsItem._id,
      userId: user._id,
      currentFavorites: newsItem.favorites
    });

    try {
      const result = await dispatch(toggleFavorite(newsItem._id)).unwrap();
      console.log('Favorite Press - Toggle result:', result);
      
      ToastAndroid.show(
        newsItem?.favorites?.users?.includes(user._id)
          ? 'Removed from favorites'
          : 'Added to favorites',
        ToastAndroid.SHORT
      );

    } catch (error) {
      console.error('Favorite Press - Error:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleDelete = async () => {
    if (!newsItem) return;
    
    Alert.alert(
      'Delete News',
      'Are you sure you want to delete this news?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteNews(newsItem._id)).unwrap();
              ToastAndroid.show('News deleted successfully', ToastAndroid.SHORT);
              router.replace('/(tabs)');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete news');
            }
          }
        }
      ]
    );
  };

  function renderContent(content: string) {
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
  }

  if (!newsItem) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Admin Kontrolleri */}
      {user?.role === 'admin' && (
        <View style={styles.adminControls}>
          <TouchableOpacity 
            style={styles.adminButton}
            onPress={() => setIsEditModalVisible(true)}
          >
            <MaterialIcons name="edit" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.adminButton}
            onPress={handleDelete}
          >
            <MaterialIcons name="delete" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Modal */}
      {newsItem && (
        <EditNewsModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          news={newsItem}
        />
      )}

      {user?.role === 'admin' && (
        <View style={styles.viewCountContainer}>
          <MaterialIcons name="visibility" size={20} color={COLORS.gray} />
          <Text style={styles.viewCountText}>
            {isValidViews(newsItem?.views) ? formatViewCount(newsItem.views) : '0'}
          </Text>
        </View>
      )}

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={true}
        bounces={true}
        contentContainerStyle={{
          paddingBottom: 100
        }}
      >
        {renderContent(newsItem.content)}
      </ScrollView>

      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={handleFavoritePress}
      >
        <MaterialIcons 
          name={newsItem?.favorites?.users?.includes(user?._id) ? 'favorite' : 'favorite-border'} 
          size={24} 
          color={COLORS.primary} 
        />
        <Text style={styles.favoriteCount}>
          {newsItem?.favorites?.count || 0}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentImageContainer: {
    width: '100%',
    height: 200,
    marginVertical: 16,
  },
  contentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  contentText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    marginBottom: 16,
    lineHeight: 24,
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  viewCountText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  favoriteCount: {
    marginLeft: 4,
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  adminControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 4,
  },
  adminButton: {
    padding: 8,
    marginHorizontal: 4,
  },
}); 