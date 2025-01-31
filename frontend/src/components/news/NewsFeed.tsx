import React from 'react';
import { View, StyleSheet, SectionList, Dimensions, Image, Text, TouchableOpacity } from 'react-native';
import { NewsItem } from '@/types';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { router } from 'expo-router';

interface NewsFeedProps {
  news: NewsItem[];
  refreshControl?: React.ReactElement;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export function NewsFeed({ news, refreshControl }: NewsFeedProps) {
  // Haberleri kategorilere göre grupla
  const groupedNews = React.useMemo(() => {
    const groups = news.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, NewsItem[]>);

    return Object.entries(groups).map(([title, data]) => ({
      title,
      data
    }));
  }, [news]);

  const handleNewsPress = (newsItem: NewsItem) => {
    router.push(`/news/${newsItem._id}`);
  };

  const renderItem = ({ item }: { item: NewsItem }) => (
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

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SectionList
      sections={groupedNews}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={item => item._id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      stickySectionHeadersEnabled={false}
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
  sectionHeader: {
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
}); 