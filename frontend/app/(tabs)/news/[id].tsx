import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { COLORS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const { news, isLoading } = useAppSelector(state => state.news);
  
  const newsItem = news.find(item => item._id === id);

  if (isLoading) return <Loading />;
  if (!newsItem) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <RenderHtml
          contentWidth={width}
          source={{ html: newsItem.content }}
          tagsStyles={{
            img: {
              width: '100%',
              height: 'auto',
              marginVertical: 10,
            }
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
}); 