import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useEffect } from 'react';
import { fetchNews } from '@/redux/slices/newsSlice';
import { COLORS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { NewsCard } from '@/components/news/NewsCard';
import { useRouter } from 'expo-router';
import { isUserAdmin } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector(state => state.auth);
  const { news, isLoading } = useAppSelector(state => state.news);

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
      <FlatList
        data={news}
        renderItem={({ item }) => (
          <NewsCard
            news={item}
            onPress={() => handleNewsPress(item._id)}
          />
        )}
        keyExtractor={item => item._id}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + 16 } // Safe area için üst padding
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Admin için Haber Ekleme Butonu */}
      {user && isUserAdmin(user) && (
        <TouchableOpacity
          style={[
            styles.addButton,
            { top: insets.top + 8 } // Safe area için üst margin
          ]}
          onPress={handleCreatePress}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add" size={28} color={COLORS.primary} />
        </TouchableOpacity>
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
  addButton: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 