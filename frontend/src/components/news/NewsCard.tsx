import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { NewsItem } from '@/types';
import Animated, { FadeIn, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { getImageUrl } from '@/utils/imageHelper';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface NewsCardProps {
  news: NewsItem;
  index?: number;
  isVisible?: boolean;
}

export function NewsCard({ news, index = 0, isVisible = false }: NewsCardProps) {
  const router = useRouter();
  
  if (!news || !news.author) return null;

  const imageUrl = news.imageUrl ? getImageUrl(news.imageUrl) : '';

  // Animasyon stilini useAnimatedStyle ile tanımla
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(isVisible ? 1 : 0.7),
      transform: [
        {
          translateY: withSpring(0)
        }
      ]
    };
  });

  const handlePress = () => {
    router.push(`/news/${news._id}`);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeIn.delay(index * 100)}
        style={[styles.animatedContainer, animatedStyle]}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={handlePress}
          activeOpacity={0.95}
        >
          <View style={styles.coverContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.coverImage}
                resizeMode="cover"
                onError={() => console.warn('Image load error:', imageUrl)}
              />
            ) : (
              <View style={styles.defaultCover}>
                <MaterialIcons name="article" size={32} color={COLORS.gray} />
              </View>
            )}
            
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
              <View style={styles.authorInfo}>
                <MaterialIcons name="person" size={16} color={COLORS.gray} />
                <Text style={styles.authorText}>
                  {`${news.author.firstName} ${news.author.lastName}`}
                </Text>
              </View>
              <Text style={styles.date}>
                {new Date(news.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width * 0.7,
    height: 240,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  animatedContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  coverContainer: {
    width: '100%',
    height: 130,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
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
    top: 8,
    left: 8,
    backgroundColor: COLORS.dark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 11,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
  },
  content: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 4,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginLeft: 3,
  },
  date: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
}); 