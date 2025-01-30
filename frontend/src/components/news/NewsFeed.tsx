import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { NewsCard } from './NewsCard';
import { NewsItem } from '@/types';
import { COLORS } from '@/theme';

interface NewsFeedProps {
  news: NewsItem[];
}

export function NewsFeed({ news }: NewsFeedProps) {
  return (
    <FlatList
      data={news}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <NewsCard news={item} />
      )}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
}); 