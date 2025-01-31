import React, { useEffect } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchNews } from '@/redux/slices/newsSlice';
import { COLORS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { NewsFeed } from '@/components/news/NewsFeed';
import { CategoryCard } from '@/components/categories/CategoryCard';

const CATEGORIES = [
  { id: 'AI', title: 'Artificial Intelligence', icon: 'psychology' as const },
  { id: 'TECHNOLOGY', title: 'Technology', icon: 'devices' as const },
  { id: 'APP', title: 'Applications', icon: 'apps' as const }
];

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { news, isLoading } = useAppSelector(state => state.news);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = () => {
    dispatch(fetchNews());
  };

  const getNewsCountByCategory = (categoryId: string) => {
    return news.filter(item => item.category === categoryId).length;
  };

  if (isLoading && !news.length) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Kategori Listesi */}
      <View style={styles.categoriesSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={category.icon}
              newsCount={getNewsCountByCategory(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Haber Listesi */}
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