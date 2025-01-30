import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { NewsCard } from './NewsCard';
import { NewsItem } from '@/types';
import { COLORS } from '@/theme';
import { router } from 'expo-router';

interface NewsFeedProps {
  news: NewsItem[];
}

export function NewsFeed({ news }: NewsFeedProps) {
  const handleNewsPress = (newsItem: NewsItem) => {
    router.push(`/news/${newsItem._id}`);
  };

  return (
    <FlatList
      data={news}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <NewsCard 
          news={item} 
          onPress={() => handleNewsPress(item)}
        />
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