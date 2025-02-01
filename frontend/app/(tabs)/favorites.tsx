import React, { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { NewsCard } from '@/components/NewsCard';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { Loading } from '@/components/common/Loading';
import { COLORS } from '@/theme';
import { getFavoriteNews } from '../../redux/slices/newsSlice';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { NewsItem } from '@/types';

function FavoritesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { favorites, isLoading, error } = useSelector((state: RootState) => state.news);
  const router = useRouter();

  const loadFavorites = useCallback(async () => {
    if (!user?.token) {
      console.log('No user token, redirecting to login...');
      router.push('/auth/login');
      return;
    }

    try {
      console.log('Loading favorites for user:', {
        userId: user._id,
        email: user.email,
        favoriteCount: user.favoriteNews?.length || 0
      });
      
      const result = await dispatch(getFavoriteNews(user.token)).unwrap();
      console.log('Favorites loaded:', {
        count: result.length,
        favorites: result
      });
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, [dispatch, user, router]);

  useEffect(() => {
    if (user?.token) {
      console.log('Loading favorites for user:', {
        userId: user._id,
        email: user.email,
        favoriteCount: user.favoriteNews?.length || 0
      });
      loadFavorites();
    }
  }, [user, loadFavorites]);

  useEffect(() => {
    console.log('Current favorites state:', {
      count: favorites.length,
      favorites: favorites.map(f => ({
        id: f._id,
        title: f.title,
        category: f.category
      }))
    });
  }, [favorites]);

  const renderItem = useCallback(({ item }: { item: NewsItem }) => (
    <NewsCard news={item} />
  ), []);

  if (isLoading) return <Loading />;

  if (error) {
    console.error('Favorites error:', error);
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>Hata: {error}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Favoriler',
          headerShown: true
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz favori haber eklenmemiş</Text>
            </View>
          )}
          contentContainerStyle={[
            styles.listContainer,
            !favorites.length && styles.emptyListContainer
          ]}
          onRefresh={loadFavorites}
          refreshing={isLoading}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center'
  }
});

export default FavoritesScreen; 