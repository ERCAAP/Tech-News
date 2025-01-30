import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { useResponsive } from '@/hooks/useResponsive';
import { COLORS, FONTS } from '@/theme';
import { Loading } from '@/components/common/Loading';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const { wp, hp } = useResponsive();
  const { news, isLoading } = useAppSelector(state => state.news);
  
  const newsItem = news.find(item => item.id === id);

  if (isLoading) return <Loading />;
  if (!newsItem) return null;

  return (
    <ScrollView style={styles.container}>
      {newsItem.imageUrl && (
        <Image 
          source={{ uri: newsItem.imageUrl }} 
          style={[styles.image, { height: hp('30%') }]}
          resizeMode="cover"
        />
      )}
      <View style={[styles.content, { padding: wp('4%') }]}>
        <Text style={styles.title}>{newsItem.title}</Text>
        <Text style={styles.author}>By {newsItem.author}</Text>
        <Text style={styles.date}>
          {new Date(newsItem.publishedAt).toLocaleDateString()}
        </Text>
        <Text style={styles.content}>{newsItem.content}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width: '100%',
  },
  content: {
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 16,
  },
}); 