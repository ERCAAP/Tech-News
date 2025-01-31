import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { NewsItem } from '@/types';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getImageUrl } from '@/utils/imageHelper';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = width - (CARD_MARGIN * 2);

interface NewsCardProps {
  news: NewsItem;
  onPress: () => void;
  index?: number;
}

export function NewsCard({ news, onPress, index = 0 }: NewsCardProps) {
  if (!news || !news.author) return null;

  // İçerikteki resimleri ve metinleri ayrıştır
  const renderContent = (content: string) => {
    return content.split('\n').map((part, index) => {
      // [IMAGE:/uploads/...] formatındaki resimleri bul
      const imageMatch = part.match(/\[IMAGE:(.*?)\]/);
      
      if (imageMatch) {
        const imageUrl = imageMatch[1];
        return (
          <View key={`image-${index}`} style={styles.contentImageContainer}>
            <Image
              source={{ uri: getImageUrl(imageUrl) }}
              style={styles.contentImage}
              resizeMode="cover"
            />
          </View>
        );
      }

      // Normal metin
      return part.trim() ? (
        <Text key={`text-${index}`} style={styles.contentText}>
          {part}
        </Text>
      ) : null;
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 200).springify()}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {news.imageUrl && (
          <View style={styles.coverImageContainer}>
            <Image
              source={{ uri: getImageUrl(news.imageUrl) }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.content}>
          {news.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{news.category}</Text>
            </View>
          )}
          
          <Text style={styles.title} numberOfLines={2}>
            {news.title}
          </Text>

          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {news.author.firstName} {news.author.lastName}
            </Text>
            <Text style={styles.date}>
              {new Date(news.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.contentContainer}>
            {renderContent(news.content)}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  coverImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.border,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  categoryContainer: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  category: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  authorName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
  },
  date: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  contentContainer: {
    gap: 8,
  },
  contentImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  contentImage: {
    width: '100%',
    height: '100%',
  },
  contentText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    lineHeight: 24,
  },
}); 