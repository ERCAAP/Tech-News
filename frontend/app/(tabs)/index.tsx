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
const CATEGORY_CARD_WIDTH = width * 0.7;
const SPACING = 16;

interface Category {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  description: string;
}

const CATEGORIES: Category[] = [
  { 
    id: 'ai', 
    title: 'Artificial Intelligence', 
    icon: 'psychology',
    description: 'Latest AI news and updates'
  },
  { 
    id: 'app', 
    title: 'Applications', 
    icon: 'apps',
    description: 'App development news'
  },
  { 
    id: 'technology', 
    title: 'Technology', 
    icon: 'devices',
    description: 'General technology news'
  }
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
      acc[category.id] = news.filter(item => {
        const newsCategory = item.category?.toLowerCase().trim();
        return newsCategory === category.id;
      }).slice(0, 3);
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
    paddingTop: 4,
  },
  categorySection: {
    marginBottom: 12,
    paddingTop: 4,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  moreText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryNewsCard: {
    width: CATEGORY_CARD_WIDTH,
    marginRight: 16,
    backgroundColor: 'transparent',
    marginVertical: 4,
  },
  emptyText: {
    width: CATEGORY_CARD_WIDTH,
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    textAlign: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  bottomPadding: {
    height: Platform.OS === 'ios' ? 100 : 80,
  },
});
