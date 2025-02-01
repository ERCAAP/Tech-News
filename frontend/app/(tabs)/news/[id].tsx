import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, ToastAndroid } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { getImageUrl } from '@/utils/imageHelper';
import { MaterialIcons } from '@expo/vector-icons';
import { viewNews, toggleFavorite } from '@/redux/slices/newsSlice';
import { NewsItem } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const { news } = useAppSelector(state => state.news);
  const newsItem = news.find((item: NewsItem) => item._id === id);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(viewNews(id));
    }
  }, [id, dispatch]);

  const handleFavoritePress = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to favorite news');
      return;
    }
    
    if (!id || typeof id !== 'string') {
      return;
    }
    
    try {
      setIsLoading(true);
      await dispatch(toggleFavorite(id)).unwrap();
      
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


  if (!newsItem) {
    return <Loading />;
  }

  const coverImageUrl = newsItem.imageUrl ? getImageUrl(newsItem.imageUrl) : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {isAdmin && (
        <View style={styles.viewCountContainer}>
          <MaterialIcons name="visibility" size={20} color={COLORS.gray} />
          <Text style={styles.viewCountText}>
            {typeof newsItem.views === 'number' ? newsItem.views : 0}
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
              disabled={isLoading}
            >
              <MaterialIcons 
                name={newsItem?.favorites?.users?.includes(user?._id ?? '') ? 'favorite' : 'favorite-border'} 
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

        {isAdmin && (
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <MaterialIcons name="visibility" size={16} color={COLORS.gray} />
              <Text style={styles.statText}>
                {typeof newsItem.views === 'number' ? `${newsItem.views} görüntülenme` : '0 görüntülenme'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="favorite" size={16} color={COLORS.gray} />
              <Text style={styles.statText}>
                {`${newsItem.favorites?.count || 0} favori`}
              </Text>
            </View>
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
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
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
  stats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statText: {
    marginLeft: 4,
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
}); 
