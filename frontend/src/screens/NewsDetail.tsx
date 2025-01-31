import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { NewsItem, NewsState } from '@/types';
import { getImageUrl } from '@/utils/imageHelper';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const { news, isLoading } = useAppSelector((state: { news: NewsState }) => state.news);
  
  const newsItem: NewsItem | undefined = news.find(item => item._id === id);

  // Enhanced logging when news article is opened
  React.useEffect(() => {
    if (newsItem) {
      // Check for images in content
      const hasContentImages = newsItem.content.includes('[IMAGE:');
      const imageUrls = newsItem.content.match(/\[IMAGE:(.*?)\]/g)?.map(img => img.replace('[IMAGE:', '').replace(']', ''));

      console.log('📱 News Article Opened:', {
        id: newsItem._id,
        title: newsItem.title,
        author: `${newsItem.author.firstName} ${newsItem.author.lastName}`,
        category: newsItem.category || 'Uncategorized',
        hasHeaderImage: !!newsItem.imageUrl,
        hasContentImages,
        numberOfContentImages: imageUrls?.length || 0,
        contentImages: imageUrls || [],
        contentLength: newsItem.content.length,
        openedAt: new Date().toISOString(),
        deviceTime: new Date().toLocaleString(),
      });

      // You might want to send this to your analytics service here
      // analytics.logEvent('news_article_opened', { ... })
    } else {
      console.warn('⚠️ Attempted to open non-existent news article:', id);
    }
  }, [newsItem, id]);

  // İçerikteki resimleri ve metinleri ayrıştır
  const renderContent = (content: string) => {
    // Debug için içeriği kontrol et
    console.log('📝 Content to render:', {
      rawContent: content,
      length: content.length,
      hasImages: content.includes('[IMAGE:'),
    });
    
    return content.split('\n').map((part, index) => {
      // [IMAGE:/uploads/...] formatındaki resimleri bul
      const imageMatch = part.match(/\[IMAGE:(.*?)\]/);
      
      if (imageMatch) {
        const imagePath = imageMatch[1];
        console.log('🖼️ Found image in content:', {
          index,
          imagePath,
          fullMatch: imageMatch[0],
        });
        
        return (
          <View key={`image-${index}`} style={styles.contentImageContainer}>
            <Image
              source={{ uri: getImageUrl(imagePath) }}
              style={styles.contentImage}
              resizeMode="cover"
              onError={(error) => console.error('❌ Image load error:', error.nativeEvent.error)}
              onLoad={() => console.log('✅ Image loaded successfully:', imagePath)}
            />
          </View>
        );
      }

      // Text parçalarını logla
      if (part.trim()) {
        console.log('📄 Text part:', {
          index,
          text: part.trim().substring(0, 50) + '...',
        });
      }

      return part.trim() ? (
        <Text key={`text-${index}`} style={styles.contentText}>
          {part}
        </Text>
      ) : null;
    });
  };

  if (isLoading) return <Loading />;
  if (!newsItem) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Kapak resmi */}
      {newsItem.imageUrl && (
        <Image 
          source={{ uri: getImageUrl(newsItem.imageUrl) }} 
          style={[styles.image, { height: screenHeight * 0.3 }]}
          resizeMode="cover"
        />
      )}
      
      <View style={[styles.content, { padding: screenWidth * 0.04 }]}>
        <Text style={styles.title}>{newsItem.title}</Text>
        <Text style={styles.author}>
          By {`${newsItem.author.firstName} ${newsItem.author.lastName}`}
        </Text>
        <Text style={styles.date}>
          {new Date(newsItem.createdAt).toLocaleDateString()}
        </Text>

        {/* İçeriği render et */}
        {renderContent(newsItem.content)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width: '100%',
  },
  content: {
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 16,
  },
  contentImageContainer: {
    marginVertical: 16,
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  contentText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
    lineHeight: 24,
    marginTop: 8,
  },
}); 
