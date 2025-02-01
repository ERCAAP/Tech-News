import React, { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchNews } from '@/redux/slices/newsSlice';
import { COLORS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { NewsFeed } from '@/components/news/NewsFeed';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { MaterialIcons } from '@expo/vector-icons';

interface Category {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const CATEGORIES: Category[] = [
  { id: 'AI', title: 'Artificial Intelligence', icon: 'psychology' },
  { id: 'TECHNOLOGY', title: 'Technology', icon: 'devices' },
  { id: 'APP', title: 'Applications', icon: 'apps' },
];

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { news, isLoading } = useAppSelector(state => state.news);

  const loadNews = useCallback(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const newsCountByCategory = useMemo(() => {
    return CATEGORIES.reduce((acc, category) => {
      acc[category.id] = news.filter((item: { category: string; }) => item.category === category.id).length;
      return acc;
    }, {} as Record<string, number>);
  }, [news]);

  if (isLoading && news.length === 0) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map(category => (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={category.icon}
              newsCount={newsCountByCategory[category.id] || 0}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.newsSection}>
        <NewsFeed
          news={news}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadNews}
              colors={[COLORS.primary]}
            />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  categoriesSection: {
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    // Gölge ayarları iOS ve Android uyumlu olacak şekilde ayarlandı
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  newsSection: {
    flex: 1,
    marginTop: 16,
  },
});
