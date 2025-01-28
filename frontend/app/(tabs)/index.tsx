import { View } from 'react-native';
import { NewsFeed } from '@/components/news/NewsFeed';
import { useAppSelector } from '../../src/redux/hooks';
import React from 'react';

export default function HomeScreen() {
  const { news } = useAppSelector((state: { news: any; }) => state.news);

  return (
    <View style={{ flex: 1 }}>
      <NewsFeed news={news} />
    </View>
  );
} 