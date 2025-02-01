import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToFavorites, removeFromFavorites } from '@/redux/slices/newsSlice';

export function NewsCard({ news, onPress }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const isFavorited = news.favorites.includes(user?._id);

  const handleFavorite = async () => {
    try {
      if (isFavorited) {
        await dispatch(removeFromFavorites(news._id)).unwrap();
      } else {
        await dispatch(addToFavorites(news._id)).unwrap();
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
          onPress={() => router.push(`/admin/edit-news/${news._id}`)}
          style={styles.editButton}
        >
          <MaterialIcons name="edit" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
} 