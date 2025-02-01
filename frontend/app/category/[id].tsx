import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { NewsCard } from '@/components/news/NewsCard';
import { Header } from '@/components/common/Header';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const { news } = useAppSelector(state => state.news);

  // Filter news by category and last 7 days
  const categoryNews = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return news.filter(item => 
      item.category === id && 
      new Date(item.createdAt) > sevenDaysAgo
    );
  }, [news, id]);

  return (
    <View style={styles.container}>
      <Header title={`${id} News`} showBack />
      <FlatList
        data={categoryNews}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <NewsCard news={item} />
          </View>
        )}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No news in this category for the last 7 days
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    fontSize: 16,
    marginTop: 32,
  },
}); 