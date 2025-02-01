import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { getImageUrl } from '@/utils/imageHelper';
import { MaterialIcons } from '@expo/vector-icons';
import { viewNews, toggleFavorite } from '@/redux/slices/newsSlice';
import { NewsItem } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';

// Type guard'ı güncelleyelim
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

// Görüntülenme sayısını formatlayan yardımcı fonksiyon
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
  const id = typeof params.id === 'string' ? params.id : params.id[0];
  
  const dispatch = useAppDispatch();
  const { news, isLoading } = useAppSelector(state => state.news);
  const { user } = useAppSelector(state => state.auth);
  const newsItem = news.find((item: NewsItem) => item._id === id);

  useEffect(() => {
    if (id) {
      dispatch(viewNews(id));
    }
  }, [id]);

  const handleFavoritePress = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to favorite news');
      return;
    }
    
    try {
      await dispatch(toggleFavorite(id)).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const renderContent = (content: string) => {
    if (!content) return null;

    return content.split('\n').map((part, index) => {
      // [IMAGE:/uploads/...] formatındaki resimleri bul
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
        {coverImageUrl ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: coverImageUrl }}
              style={styles.coverImage}
              resizeMode="cover"
              onError={() => console.warn('Cover image load error:', coverImageUrl)}
            />
            <View style={styles.overlay} />
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{newsItem.category}</Text>
            </View>
          </View>
        ) : null}
        
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{newsItem.title}</Text>
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
          </View>
          
          <View style={styles.authorContainer}>
            <MaterialIcons name="person" size={20} color={COLORS.primary} />
            <Text style={styles.author}>
              {`${newsItem.author.firstName} ${newsItem.author.lastName}`}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.date}>
              {new Date(newsItem.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {renderContent(newsItem.content)}
        </View>

        {user?.role === 'admin' && newsItem?.views && isValidViews(newsItem.views) && (
          <View style={[styles.statsContainer, { marginBottom: 16 }]}>
            <Text style={styles.statsText}>
              Views: {newsItem.views.total} (Unique: {newsItem.views.unique})
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    flex: 1,
    marginRight: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  author: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginLeft: 8,
  },
  dot: {
    marginHorizontal: 8,
    color: COLORS.gray,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  contentImageContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentImage: {
    width: '100%',
    height: 200,
  },
  contentText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    lineHeight: 24,
    marginVertical: 8,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  favoriteCount: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginLeft: 4,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statsText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
  viewCountContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1000,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewCountText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
}); 
