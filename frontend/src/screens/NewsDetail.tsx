import React from 'react';
import { ScrollView, Image, Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { format } from 'date-fns';
import { COLORS, FONTS } from '@/theme';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const { news } = useAppSelector((state: { news: { news: NewsItem[] } }) => state.news);
  const newsItem = news.find(item => item._id === id);

  const renderContent = (content: string) => {
    const contentParts = content.split('\n');
    return contentParts.map((part, idx) => {
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
      return part.trim() ? (
        <Text key={`text-${idx}`} style={styles.contentText}>
          {part}
        </Text>
      ) : null;
    });
  };

  if (!newsItem) return null;

  return (
    <ScrollView style={styles.container}>
      {newsItem.imageUrl && (
        <Image
          source={{ uri: `http://10.0.2.2:3000${newsItem.imageUrl}` }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{newsItem.title}</Text>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>
            {`${newsItem.author.firstName} ${newsItem.author.lastName}`}
          </Text>
          <Text style={styles.date}>
            {format(new Date(newsItem.createdAt), 'dd MMM yyyy')}
          </Text>
        </View>
        
        <View style={styles.contentContainer}>
          {renderContent(newsItem.content)}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  coverImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginVertical: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginLeft: 8,
  },
  contentContainer: {
    marginTop: 12,
  },
  contentImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginVertical: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    marginVertical: 4,
  },
}); 