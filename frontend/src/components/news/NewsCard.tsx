import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { NewsItem } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';
import { COLORS, FONTS, SHADOWS } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toggleFavorite } from '@/redux/slices/newsSlice';
import { router } from 'expo-router';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const { wp, hp } = useResponsive();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const handlePress = () => {
    router.push(`/news/${news.id}`);
  };

  const handleFavorite = () => {
    if (user) {
      dispatch(toggleFavorite(news.id));
    } else {
      router.push('/(auth)/login');
    }
  };

  return (
    <Pressable 
      style={[styles.container, { minHeight: hp('20%') }]}
      onPress={handlePress}
    >
      {news.imageUrl && (
        <Image 
          source={{ uri: news.imageUrl }} 
          style={[styles.image, { height: hp('25%') }]}
          resizeMode="cover"
        />
      )}
      <View style={[styles.content, { padding: wp('4%') }]}>
        <View style={styles.header}>
          <Text style={styles.category}>{news.category}</Text>
          <Pressable onPress={handleFavorite}>
            <MaterialIcons
              name={news.isFavorited ? "favorite" : "favorite-border"}
              size={24}
              color={news.isFavorited ? COLORS.danger : COLORS.gray}
            />
          </Pressable>
        </View>
        <Text style={styles.title}>{news.title}</Text>
        <Text style={styles.author}>By {news.author}</Text>
        <Text style={styles.date}>
          {new Date(news.publishedAt).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  image: {
    width: '100%',
  },
  content: {
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
}); 