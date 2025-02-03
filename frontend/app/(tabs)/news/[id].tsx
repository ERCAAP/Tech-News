import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { getImageUrl } from '@/utils/imageHelper';
import { MaterialIcons } from '@expo/vector-icons';
import { viewNews, deleteNews } from '@/redux/slices/newsSlice';
import { NewsItem } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function NewsDetailScreen() {
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const { news } = useAppSelector(state => state.news);
  const newsItem = news.find((item: NewsItem) => item._id === id);
  const [urlPreviews, setUrlPreviews] = useState<{ [key: string]: { title: string; imageUrl: string } }>({});
  const [processedUrls, setProcessedUrls] = useState<Set<string>>(new Set());
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(viewNews(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    const loadUrlPreviews = async () => {
      if (!newsItem?.content) return;

      const lines = newsItem.content.split('\n');
      const urlPattern = /^https?:\/\/[^\s]+$/;

      for (const line of lines) {
        if (urlPattern.test(line.trim())) {
          const url = line.trim();
          if (!processedUrls.has(url) && !urlPreviews[url]) {
            setProcessedUrls(prev => new Set(prev).add(url));
            const preview = await handleUrlPreview(url);
            if (preview) {
              setUrlPreviews(prev => ({
                ...prev,
                [url]: preview
              }));
            }
          }
        }
      }
    };

    loadUrlPreviews();
  }, [newsItem?.content]);

  const handleUrlPreview = async (url: string) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
                       html.match(/<title[^>]*>([^<]*)<\/title>/);
      
      const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/) ||
                       html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"/);

      return {
        title: titleMatch?.[1] || 'Untitled',
        imageUrl: imageMatch?.[1] || '',
      };
    } catch (error) {
      console.log('Error fetching URL metadata:', error);
      return null;
    }
  };

  const renderContent = (content: string) => {
    if (!content) return null;

    return content.split('\n').map((part, index) => {
      const imageMatch = part.match(/\[IMAGE:(.*?)\]/);
      if (imageMatch) {
        const imagePath = imageMatch[1];
        const fullImageUrl = getImageUrl(imagePath);
        
        return (
          <View key={`image-${index}`} style={styles.contentImageContainer}>
            <Image 
              source={{ uri: fullImageUrl }}
              style={styles.contentImage}
              resizeMode="cover"
              onError={() => console.warn('Content image load error:', fullImageUrl)}
            />
          </View>
        );
      }

      const urlPattern = /^https?:\/\/[^\s]+$/;
      if (urlPattern.test(part.trim())) {
        const url = part.trim();
        const preview = urlPreviews[url];
        
        if (preview) {
          return (
            <TouchableOpacity
              key={`url-${index}`}
              style={styles.urlPreviewContainer}
              onPress={() => Linking.openURL(url)}
              activeOpacity={0.8}
            >
              {preview.imageUrl && (
                <Image 
                  source={{ uri: preview.imageUrl }} 
                  style={styles.urlPreviewImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.urlPreviewContent}>
                <Text style={styles.urlPreviewTitle} numberOfLines={2}>
                  {preview.title || url}
                </Text>
                <Text style={styles.urlText} numberOfLines={1}>
                  {url}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }
        
        return (
          <TouchableOpacity
            key={`url-${index}`}
            onPress={() => Linking.openURL(url)}
          >
            <Text style={styles.urlText}>
              {url}
            </Text>
          </TouchableOpacity>
        );
      }

      return part.trim() ? (
        <Text key={`text-${index}`} style={styles.contentText}>
          {part}
        </Text>
      ) : null;
    });
  };

  const handleEdit = () => {
    router.push(`/news/edit/${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete News",
      "Are you sure you want to delete this news item? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteNews(id));
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete news item");
            }
          }
        }
      ]
    );
  };

  if (!newsItem) {
    return <Loading />;
  }

  const coverImageUrl = newsItem.imageUrl ? getImageUrl(newsItem.imageUrl) : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {isAdmin && (
        <View style={styles.adminControls}>
          <View style={styles.viewCountContainer}>
            <MaterialIcons name="visibility" size={20} color={COLORS.gray} />
            <Text style={styles.viewCountText}>
              {typeof newsItem.views === 'number' ? newsItem.views : 0}
            </Text>
          </View>
          
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={handleEdit}
            >
              <MaterialIcons name="edit" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.adminButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <MaterialIcons name="delete" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={true}
        bounces={true}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80
        }}
      >
        {coverImageUrl ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: coverImageUrl }}
              style={styles.coverImage}
              resizeMode="cover"
              onError={() => console.warn('Cover image load error:', coverImageUrl)}
            />
            <View style={styles.overlay} />
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{newsItem.category}</Text>
            </View>
          </View>
        ) : null}
        
        <View style={styles.content}>
          <Text style={styles.title}>{newsItem.title}</Text>
          
          <View style={styles.authorContainer}>
            <MaterialIcons name="person" size={20} color={COLORS.primary} />
            <Text style={styles.author}>
              {`${newsItem.author.firstName} ${newsItem.author.lastName}`}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.date}>
              {new Date(newsItem.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {renderContent(newsItem.content)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    flex: 1,
    marginRight: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  author: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginLeft: 8,
  },
  dot: {
    marginHorizontal: 8,
    color: COLORS.gray,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  contentImageContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentImage: {
    width: '100%',
    height: 200,
  },
  contentText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    lineHeight: 24,
    marginVertical: 8,
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewCountText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statText: {
    marginLeft: 4,
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  urlPreviewContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urlPreviewImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  urlPreviewContent: {
    padding: 16,
  },
  urlPreviewTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  adminControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    gap: 8,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  adminButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
}); 
