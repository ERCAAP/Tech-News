import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { NewsItem } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';
import { COLORS, FONTS, SHADOWS } from '@/theme';
import React from 'react';

interface NewsCardProps {
  news: NewsItem;
  onPress?: () => void;
}

export function NewsCard({ news, onPress }: NewsCardProps) {
  const { wp, hp } = useResponsive();

  return (
    <Pressable 
      style={[
        styles.container,
        { 
          minHeight: hp('20%'),
          marginHorizontal: wp('4%'),
          marginVertical: hp('1%'),
        }
      ]}
      onPress={onPress}
    >
      {news.imageUrl && (
        <Image 
          source={{ uri: news.imageUrl }} 
          style={[styles.image, { height: hp('25%') }]}
          resizeMode="cover"
        />
      )}
      <View style={[styles.content, { padding: wp('4%') }]}>
        <Text style={styles.title}>{news.title}</Text>
        <Text style={styles.author}>By {news.author}</Text>
        <Text style={styles.date}>
          {new Date(news.publishedAt).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  image: {
    width: '100%',
  },
  content: {
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
}); 