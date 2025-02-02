import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchNews } from '@/redux/slices/newsSlice';
import { COLORS, FONTS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsItem } from '@/types';

const { width } = Dimensions.get('window');
const CATEGORY_CARD_WIDTH = width * 0.75;
const SPACING = 20;

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
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Categories with News */}
      {CATEGORIES.map(category => (
        <View key={category.id} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryTitleContainer}>
              <MaterialIcons name={category.icon} size={24} color={COLORS.primary} />
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => handleViewAllCategory(category.id)}
            >
              <Text style={styles.moreText}>More</Text>
              <MaterialIcons name="arrow-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContent}
            style={styles.categoryScroll}
          >
            {newsByCategory[category.id]?.length > 0 ? (
              newsByCategory[category.id].map((item) => (
                <View key={item._id} style={styles.categoryNewsCard}>
                  <NewsCard news={item} />
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No news in this category</Text>
            )}
          </ScrollView>
        </View>
      ))}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  categorySection: {
    marginBottom: 32,
    paddingTop: 8,
  },
  categoryScroll: {
    marginTop: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginLeft: 8,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 8,
    borderRadius: 8,
  },
  moreText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginRight: 4,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryNewsCard: {
    width: CATEGORY_CARD_WIDTH,
    marginRight: SPACING,
    backgroundColor: 'transparent',
    marginVertical: 8,
  },
  emptyText: {
    width: CATEGORY_CARD_WIDTH,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    textAlign: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  bottomPadding: {
    height: Platform.OS === 'ios' ? 100 : 80,
  },
});
