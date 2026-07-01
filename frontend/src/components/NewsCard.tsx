import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toggleFavorite } from '@/redux/slices/newsSlice';
import { COLORS } from '@/theme';
import { router } from 'expo-router';
import { NewsItem } from '@/types';

interface NewsCardProps {
  news: NewsItem;
  onPress?: () => void;
}

export function NewsCard({ news }: NewsCardProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const isFavorited = news.favorites?.users?.includes(user?._id ?? '');

  const handleFavorite = async () => {
    try {
      if (news._id) {
        await dispatch(toggleFavorite(news._id)).unwrap();
      }
    } catch (error) {
      console.error('Favorite error:', error);
    }
  };

  return (
    <View style={styles.card}>
      {/* ... diğer card içeriği ... */}
      <TouchableOpacity onPress={handleFavorite}>
        <MaterialIcons
          name={isFavorited ? "favorite" : "favorite-border"}
          size={24}
          color={isFavorited ? COLORS.primary : COLORS.gray}
        />
      </TouchableOpacity>
      {user?.role === 'admin' && (
        <TouchableOpacity 
          onPress={() => {
            router.push({
              pathname: '/(admin)/edit-news/[id]' as const,
              params: { id: news._id }
            });
          }}
          style={styles.editButton}
        >
          <MaterialIcons name="edit" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    // Add other card styles
  },
  editButton: {
    padding: 8,
    // Add other button styles
  }
}); 