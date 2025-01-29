import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NewsItem } from '@/types';
import { COLORS, FONTS, SHADOWS } from '@/theme';
import { formatDate } from '@/utils/date';

interface NewsCardProps {
  news: NewsItem;
  onPress?: () => void;
}

export function NewsCard({ news, onPress }: NewsCardProps) {
  const authorName = `${news.author.firstName} ${news.author.lastName}`;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {news.imageUrl && (
        <Image 
          source={{ uri: news.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <Text style={styles.category}>{news.category}</Text>
        <Text style={styles.title}>{news.title}</Text>
        <Text style={styles.excerpt} numberOfLines={2}>
          {news.content}
        </Text>
        
        <View style={styles.footer}>
          <View>
            <Text style={styles.author}>{authorName}</Text>
            <Text style={styles.date}>{formatDate(news.createdAt)}</Text>
          </View>
          <View style={styles.stats}>
            <MaterialIcons name="favorite" size={16} color={COLORS.primary} />
            <Text style={styles.statsText}>{news.likes}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  category: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.medium,
    marginBottom: 8,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  excerpt: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  date: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginLeft: 4,
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
}); 