import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/theme';
import { format } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = width - (CARD_MARGIN * 2);

const CATEGORIES = [
  'Technology',
  'AI',
  'App'
] as const;

interface Author {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  contentImages?: string[];
  category?: string;
  author: Author;
  createdAt: string;
}

interface NewsCardProps {
  news: NewsItem;
  onPress: () => void;
  index?: number;
}

export function NewsCard({ news, onPress, index = 0 }: NewsCardProps) {
  if (!news || !news.author) return null;

  // İçerikteki resim URL'lerini bul ve göster
  const renderContent = (content: string) => {
    const contentParts = content.split('\n');
    return contentParts.map((part, idx) => {
      // [IMAGE:url] formatındaki resimleri bul
      const imageMatch = part.match(/\[IMAGE:(.*?)\]/);
      if (imageMatch) {
        const imageUrl = imageMatch[1];
        return (
          <Image
            key={`image-${idx}`}
            source={{ uri: `http://10.0.2.2:3000${imageUrl}` }}
            style={styles.contentImage}
            resizeMode="cover"
          />
        );
      }
      // Normal metin
      return part.trim() ? (
        <Text key={`text-${idx}`} style={styles.contentText}>
          {part}
        </Text>
      ) : null;
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {news.imageUrl && (
          <Image
            source={{ uri: `http://10.0.2.2:3000${news.imageUrl}` }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.overlay}>
          <View style={styles.content}>
            {news.category && (
              <View style={styles.categoryContainer}>
                <Text style={styles.category}>{news.category}</Text>
              </View>
            )}
            
            <Text style={styles.title} numberOfLines={2}>
              {news.title || 'Untitled'}
            </Text>

            <View style={styles.footer}>
              <View style={styles.authorContainer}>
                {news.author.avatar ? (
                  <Image
                    source={{ uri: news.author.avatar }}
                    style={styles.authorAvatar}
                  />
                ) : (
                  <View style={styles.authorAvatarPlaceholder}>
                    <Text style={styles.authorInitials}>
                      {`${news.author.firstName?.[0] || ''}${news.author.lastName?.[0] || ''}`}
                    </Text>
                  </View>
                )}
                <Text style={styles.authorName}>
                  {`${news.author.firstName || ''} ${news.author.lastName || ''}`}
                </Text>
              </View>

              <View style={styles.metaContainer}>
                <MaterialIcons name="access-time" size={14} color={COLORS.lightGray} />
                <Text style={styles.date}>
                  {format(new Date(news.createdAt || new Date()), 'dd MMM yyyy')}
                </Text>
              </View>
            </View>

            <View style={styles.contentContainer}>
              {renderContent(news.content)}
            </View>
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
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    padding: 16,
  },
  categoryContainer: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  category: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 12,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorInitials: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  authorName: {
    color: COLORS.lightGray,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    color: COLORS.lightGray,
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginLeft: 4,
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
  contentContainer: {
    marginTop: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.dark,
    marginVertical: 4,
  },
}); 