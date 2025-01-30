import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Header } from '@/components/common/Header';
import { NewsFeed } from '@/components/news/NewsFeed';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useEffect } from 'react';
import { fetchNews } from '@/redux/slices/newsSlice';
import { COLORS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { NewsCard } from '@/components/news/NewsCard';
import { FloatingButton } from '@/components/common/FloatingButton';
import { useRouter } from 'expo-router';
import { isUserAdmin } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const { news, isLoading } = useAppSelector(state => state.news);
  const { isDark } = useAppSelector(state => state.theme);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  const handleNewsPress = (id: string) => {
    router.push(`/news/${id}`);
  };

  const handleCreatePress = () => {
    router.push('/create-news');
  };

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
      <FlatList
        data={news}
        renderItem={({ item }) => (
          <NewsCard
            news={item}
            onPress={() => handleNewsPress(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Admin için Haber Ekleme Butonu */}
      {user && isUserAdmin(user) && (
        <FloatingButton
          icon="add"
          onPress={handleCreatePress}
          position="bottomRight"
          darkMode={isDark}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
  },
}); 