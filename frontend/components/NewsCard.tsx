import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { NewsItem } from '@/types';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { getImageUrl } from '../utils/api';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const { user } = useAuth();
  
  const handlePress = () => {
    router.push({
      pathname: "/news/[id]",
      params: { id: news._id }
    });
  };

  // Görüntüleme sayısı
  const viewCount = news.views?.total || 0;

  // Favori kontrolü - favorites array'ini kontrol et
  const isFavorited = news.favorites?.includes(user?._id);
  const favoriteCount = news.favorites?.length || 0;

  const handleFavorite = async (e: any) => {
    e.stopPropagation(); // Card'a tıklamayı engelle
    try {
      const response = await fetch(`${API_URL}/api/v1/news/${news._id}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Frontend state'ini güncelle
        news.favorites = isFavorited 
          ? news.favorites?.filter(id => id !== user?._id)
          : [...(news.favorites || []), user?._id];
      }
    } catch (error) {
      console.error('Favorite error:', error);
    }
  };

  return (
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
        <Text style={styles.title} numberOfLines={2}>
          {news.title}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.authorInfo}>
            <MaterialIcons name="person" size={16} color={COLORS.gray} />
            <Text style={styles.authorName}>
              {news.author.firstName} {news.author.lastName}
            </Text>
          </View>
          <View style={styles.stats}>
            <MaterialIcons name="visibility" size={16} color={COLORS.gray} />
            <Text style={styles.statsText}>{viewCount}</Text>
            <TouchableOpacity 
              onPress={handleFavorite}
              style={{ marginLeft: 8 }}
            >
              <MaterialIcons 
                name={isFavorited ? "favorite" : "favorite-border"} 
                size={16} 
                color={isFavorited ? COLORS.primary : COLORS.gray} 
              />
            </TouchableOpacity>
            <Text style={styles.statsText}>{favoriteCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ... styles remain the same 