import React, { useEffect } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchNews } from '@/redux/slices/newsSlice';
import { COLORS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { NewsFeed } from '@/components/news/NewsFeed';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { news, isLoading } = useAppSelector(state => state.news);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = () => {
    dispatch(fetchNews());
  };

  if (isLoading && !news.length) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <NewsFeed 
        news={news} 
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadNews}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
}); 