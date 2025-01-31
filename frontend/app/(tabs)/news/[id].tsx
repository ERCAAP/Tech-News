import React from 'react';
import { View, ScrollView, Image, StyleSheet } from 'react-native';
import { Text } from '@/components/common/Text';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { RenderHTML } from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import type { NewsItem } from '@/types/news';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { news, isLoading } = useAppSelector(state => ({
    news: state.news.news.find(n => n._id === id),
    isLoading: state.news.isLoading
  }));

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!news) {
    return <Text>News not found</Text>;
  }

  const renderContent = () => {
    return (
      <RenderHTML 
        source={{ html: news.content }} 
        contentWidth={width}
        tagsStyles={{
          img: {
            width: '100%',
            height: 200,
            resizeMode: 'cover',
            marginVertical: 10,
            borderRadius: 8,
          }
        }}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      {news.coverImage && (
        <Image 
          source={{ uri: news.coverImage }} 
          style={styles.coverImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{news.displayTitle || news.title}</Text>
        <Text style={styles.date}>
          {new Date(news.timestamp).toLocaleDateString()}
        </Text>
        <View style={styles.body}>
          {renderContent()}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  coverImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginBottom: 16,
  },
  body: {
    marginTop: 16,
  },
}); 