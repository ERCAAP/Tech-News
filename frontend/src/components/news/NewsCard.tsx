import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { NewsItem } from '@/types';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getImageUrl } from '@/utils/imageHelper';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;

interface NewsCardProps {
  news: NewsItem;
  onPress: () => void;
  index?: number;
  isVisible?: boolean;
}

export function NewsCard({ news, onPress, index = 0, isVisible = false }: NewsCardProps) {
  if (!news || !news.author) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={[
        styles.container,
        { opacity: isVisible ? 1 : 0.7 }
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.coverContainer}>
          {news.coverImage ? (
            <Image
              source={{ uri: getImageUrl(news.coverImage) }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.defaultCover}>
              <MaterialIcons name="article" size={24} color={COLORS.gray} />
            </View>
          )}
          
          {/* Category Badge */}
          {news.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{news.category}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {news.title}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.date}>
              {new Date(news.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width * 0.75,
    marginHorizontal: 8,
    height: 250,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  coverContainer: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.border,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  defaultCover: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  content: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  date: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
}); 