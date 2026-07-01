import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { NewsCard } from '@/components/news/NewsCard';
import { Stack } from 'expo-router';
import { CustomHeader } from '../../components/navigation/CustomHeader';


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
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <CustomHeader title={`${id} News`} />
        </View>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 80, // Header için üst boşluk ekledik
    paddingBottom: 80, // Bottom bar için alt boşluk
  },
  cardWrapper: {
    marginBottom: 16,
    width: '100%', // Kartların tam genişlikte olmasını sağlar
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    fontSize: 16,
    marginTop: 32,
  },
}); 