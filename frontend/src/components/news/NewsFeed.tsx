import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { NewsCard } from './NewsCard';
import { NewsItem } from '@/types';
import { COLORS } from '@/theme';

interface NewsFeedProps {
  news: NewsItem[];
  refreshControl?: React.ReactElement;
}

export function NewsFeed({ news, refreshControl }: NewsFeedProps) {
  const renderNewsCard = ({ item, index }: { item: NewsItem; index: number }) => (
    <NewsCard
      news={item}
      index={index}
      isVisible={true}
    />
  );

  return (
    <FlatList
      data={news}
      renderItem={renderNewsCard}
      keyExtractor={item => item._id}
      horizontal
      showsHorizontalScrollIndicator={false}
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
}); 