import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchNews } from '@/redux/slices/newsSlice';
import { COLORS, FONTS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { NewsFeed } from '@/components/news/NewsFeed';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsItem } from '@/types';

interface Category {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const CATEGORIES: Category[] = [
  { id: 'AI', title: 'Artificial Intelligence', icon: 'psychology' },
  { id: 'APP', title: 'Applications', icon: 'apps' },
  { id: 'TECHNOLOGY', title: 'Technology', icon: 'devices' },
];

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { news } = useAppSelector(state => state.news);
  const [isLoading, setIsLoading] = useState(false);

  const loadNews = useCallback(async () => {
    setIsLoading(true);
    try {
      await dispatch(fetchNews()).unwrap();
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Get trending news (most viewed in last 24h)
  const trendingNews = useMemo(() => {
    return [...news]
      .sort((a, b) => ((b.views?.last24Hours ?? 0) - (a.views?.last24Hours ?? 0)))
      .slice(0, 3);
  }, [news]);

  // Group news by category
  const newsByCategory = useMemo(() => {
    return CATEGORIES.reduce((acc, category) => {
      acc[category.id] = news
        .filter(item => item.category === category.id)
        .slice(0, 3);
      return acc;
    }, {} as Record<string, NewsItem[]>);
  }, [news]);

  const handleViewAllCategory = (categoryId: string) => {
    router.push({
      pathname: "/category/[id]",
      params: { id: categoryId }
    });
  };

  if (isLoading && news.length === 0) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Trending Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Now</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {trendingNews.map((item) => (
            <View key={item._id} style={styles.trendingCard}>
              <NewsCard news={item} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Category Sections */}
      {CATEGORIES.map(category => (
        <View key={category.id} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleContainer}>
              <MaterialIcons name={category.icon} size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>{category.title}</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => handleViewAllCategory(category.id)}
            >
              <MaterialIcons name="add-circle-outline" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {newsByCategory[category.id]?.length > 0 ? (
              newsByCategory[category.id].map((item) => (
                <View key={item._id} style={styles.categoryCard}>
                  <NewsCard news={item} />
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No news in this category</Text>
            )}
          </ScrollView>
        </View>
      ))}

      {/* Recent News Feed */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest News</Text>
        <NewsFeed news={news.slice(0, 30)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginLeft: 8,
  },
  viewAllButton: {
    padding: 8,
    opacity: 0.6,
  },
  trendingCard: {
    width: 300,
    marginHorizontal: 8,
  },
  categoryCard: {
    width: 250,
    marginHorizontal: 8,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    fontSize: 14,
    marginLeft: 16,
  },
});
