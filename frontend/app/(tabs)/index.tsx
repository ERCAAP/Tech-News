import { View, StyleSheet } from 'react-native';
import { Header } from '@/components/common/Header';
import { NewsFeed } from '@/components/news/NewsFeed';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useEffect } from 'react';
import { fetchNews } from '@/redux/slices/newsSlice';
import { COLORS } from '@/theme';
import { Loading } from '@/components/common/Loading';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { news, isLoading } = useAppSelector(state => state.news);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Tech News" 
        rightIcon="search"
        onRightPress={() => {/* TODO: Implement search */}}
      />
      <NewsFeed news={news} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
}); 