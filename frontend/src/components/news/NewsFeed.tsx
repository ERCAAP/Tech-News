import React from 'react';
import { View, FlatList, StyleSheet, ViewToken, Text } from 'react-native';
import { NewsCard } from './NewsCard';
import { NewsItem } from '@/types';
import { router } from 'expo-router';
import { COLORS, FONTS } from '@/theme';

interface NewsFeedProps {
  news: NewsItem[];
  refreshControl?: React.ReactElement;
}

export function NewsFeed({ news, refreshControl }: NewsFeedProps) {
  const [viewableItems, setViewableItems] = React.useState<ViewToken[]>([]);

  // Haberleri kategorilere göre grupla
  const groupedNews = React.useMemo(() => {
    const categories = ['AI', 'APP', 'TECHNOLOGY'];
    return categories.map(category => ({
      category,
      data: news.filter(item => 
        item.category?.toUpperCase() === category || 
        (!item.category && category === 'TECHNOLOGY') // Kategorisi olmayanlar TECHNOLOGY'de
      )
    }));
  }, [news]);

  const onViewableItemsChanged = React.useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    setViewableItems(viewableItems);
  }, []);

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }).current;

  const renderItem = React.useCallback(({ item, index }: { item: NewsItem; index: number }) => {
    const isViewable = viewableItems.some(viewableItem => viewableItem.item._id === item._id);
    return (
      <NewsCard
        news={item}
        onPress={() => router.push(`/news/${item._id}`)}
        index={index}
        isVisible={isViewable}
      />
    );
  }, [viewableItems]);

  const renderCategory = ({ item: { category, data } }: { item: { category: string; data: NewsItem[] } }) => {
    if (data.length === 0) return null;

    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{category}</Text>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToAlignment="center"
          decelerationRate="fast"
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={true}
          contentContainerStyle={styles.newsContainer}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={groupedNews}
      renderItem={renderCategory}
      keyExtractor={item => item.category}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  newsContainer: {
    paddingHorizontal: 8,
  },
}); 