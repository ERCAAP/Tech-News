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
    width: Dimensions.get('window').width * 0.8,
    height: 300,
    marginHorizontal: 10,
  },
  animatedContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  coverContainer: {
    width: '100%',
    height: 180,
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
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
}); 