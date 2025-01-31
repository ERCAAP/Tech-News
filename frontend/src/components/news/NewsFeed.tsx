import React from 'react';
import { View, StyleSheet, FlatList, Dimensions, Image, Text, TouchableOpacity } from 'react-native';
import { NewsItem } from '@/types';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { router } from 'expo-router';

interface NewsFeedProps {
  news: NewsItem[];
  refreshControl?: React.ReactElement;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const CATEGORIES = [
  'Technology',
  'AI',
  'App'
] as const;

export function NewsFeed({ news, refreshControl }: NewsFeedProps) {
  const handleNewsPress = (newsItem: NewsItem) => {
    router.push(`/news/${newsItem._id}`);
  };

  const renderNewsItem = ({ item }: { item: NewsItem }) => {
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleNewsPress(item)}
        activeOpacity={0.9}
      >
        {item.imageUrl && (
          <Image
            source={{ uri: `http://10.0.2.2:3000${item.imageUrl}` }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.content}>
          {item.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{item.category}</Text>
            </View>
          )}
          
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.footer}>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {`${item.author.firstName} ${item.author.lastName}`}
              </Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={news}
      renderItem={renderNewsItem}
      keyExtractor={item => item._id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadowStyle,
  },
  image: {
    width: '100%',
    height: 200,
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
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
}); 