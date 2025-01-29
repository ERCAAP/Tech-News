import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NewsFeed } from '@/components/news/NewsFeed';
import { useAppSelector } from '@/redux/hooks';
import { COLORS } from '@/theme';

export default function FavoritesScreen() {
  const { favorites } = useAppSelector(state => state.news);

  return (
    <View style={styles.container}>
      <NewsFeed news={favorites} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
}); 