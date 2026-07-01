import React from 'react';
import { FlatList, StyleProp, ViewStyle } from 'react-native';
import { NewsItem } from '@/types';
import { NewsCard } from './NewsCard';

interface NewsFeedProps {
  news: NewsItem[];
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function NewsFeed({ news, contentContainerStyle }: NewsFeedProps) {
  return (
    <FlatList
      data={news}
      renderItem={({ item }) => <NewsCard news={item} />}
      keyExtractor={(item) => item._id}
      contentContainerStyle={contentContainerStyle}
    />
  );
} 