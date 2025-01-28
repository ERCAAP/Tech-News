import { FlatList, StyleSheet } from 'react-native';
import { NewsCard } from './NewsCard';
import { NewsItem } from '@/types';
import React from 'react';

interface NewsFeedProps {
  news: NewsItem[];
}

export function NewsFeed({ news }: NewsFeedProps) {
  return (
    <FlatList
      data={news}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NewsCard news={item} />}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
}); 