import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/theme';
import { NewsItem } from '@/types';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useFavoriteStatus } from '@/hooks/useFavoriteStatus';
import { useQueryClient } from '@tanstack/react-query';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { getFavoriteNews } from '@/redux/slices/newsSlice';
import { api } from '@/services/api';
import { API_URL } from '@/utils/api';

interface NewsCardProps {
  news: NewsItem;
}

function getImageUrl(url: string) {
  return url.startsWith('http') ? url : `${API_URL}${url}`;
}

export function NewsCard({ news }: NewsCardProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  const { data: isFavorited } = useFavoriteStatus(news._id);
  const isAdmin = user?.role === 'admin';
  const dispatch = useDispatch<AppDispatch>();
  
  const handlePress = () => {
    router.push({
      pathname: "/news/[id]",
      params: { id: news._id }
    });
  };

  // Görüntüleme sayısı
  const viewCount = news.views?.total || 0;

  // Favori kontrolü
  const favoriteCount = news.favorites?.count || 0;

  const handleFavorite = async (e: any) => {
    e.stopPropagation();
    
    if (!user?.token) {
      console.log('User not authenticated, redirecting to login...');
      router.push('/auth/login');
      return;
    }

    try {
      console.log('Toggling favorite for news:', news._id);
      const response = await api.post(`/news/${news._id}/favorite`, null, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.status === 'success') {
        console.log('Favorite toggle response:', response.data);
        // Favori durumunu güncelle
        await queryClient.invalidateQueries({ queryKey: ['favoriteStatus', news._id] });
        // Redux state'i güncelle
        if (user.token) {
          dispatch(getFavoriteNews(user.token));
        }
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
    }
  };

  return (
    <Animated.View 
      entering={FadeIn} 
      layout={Layout.springify()}
      style={styles.container}
    >
      <TouchableOpacity 
        style={styles.container}
        onPress={handlePress}
      >
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{news.category}</Text>
        </View>
        
        <View style={styles.imageContainer}>
          {news.imageUrl ? (
            <Image
              source={{ uri: getImageUrl(news.imageUrl) }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialIcons name="image" size={40} color={COLORS.lightGray} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {news.title}
            </Text>
            <TouchableOpacity 
              onPress={handleFavorite}
              style={styles.favoriteButton}
            >
              <MaterialIcons 
                name={isFavorited ? "favorite" : "favorite-border"} 
                size={24} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <View style={styles.authorInfo}>
              <MaterialIcons name="person" size={16} color={COLORS.gray} />
              <Text style={styles.authorName}>
                {news.author.firstName} {news.author.lastName}
              </Text>
            </View>
            {isAdmin && (
              <View style={styles.stats}>
                <MaterialIcons name="visibility" size={16} color={COLORS.gray} />
                <Text style={styles.statsText}>{viewCount}</Text>
                <Text style={styles.statsText}>{favoriteCount} favorites</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryTag: {
    backgroundColor: COLORS.primary,
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    marginLeft: 5,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginLeft: 5,
    marginRight: 10,
    fontSize: 12,
    color: COLORS.gray,
  },
}); 