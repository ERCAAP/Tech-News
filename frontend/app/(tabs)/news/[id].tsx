import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';
import { Loading } from '@/components/common/Loading';
import { getImageUrl } from '@/utils/imageHelper';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const { news, isLoading } = useAppSelector(state => state.news);
  
  const newsItem = news.find(item => item._id === id);

  // Debug için haber detaylarını logla
  React.useEffect(() => {
    if (newsItem) {
      console.log('📰 News Detail Loaded:', {
        id: newsItem._id,
        title: newsItem.title,
        hasImage: !!newsItem.imageUrl,
        imageUrl: newsItem.imageUrl ? getImageUrl(newsItem.imageUrl) : 'No image',
        contentLength: newsItem.content.length
      });
    }
  }, [newsItem]);

  // İçerikteki resimleri ve metinleri ayrıştır
  const renderContent = (content: string) => {
    console.log('📝 Parsing content:', {
      length: content.length,
      hasImages: content.includes('[IMAGE:')
    });

    return content.split('\n').map((part, index) => {
      // [IMAGE:/uploads/...] formatındaki resimleri bul
      const imageMatch = part.match(/\[IMAGE:(.*?)\]/);
      
      if (imageMatch) {
        const imagePath = imageMatch[1];
        const fullImageUrl = getImageUrl(imagePath);
        
        console.log('🖼️ Found content image:', {
          index,
          path: imagePath,
          fullUrl: fullImageUrl
        });
        
        return (
          <View key={`image-${index}`} style={styles.contentImageContainer}>
            <Image 
              source={{ uri: fullImageUrl }} 
              style={styles.contentImage}
              resizeMode="cover"
              onError={(error) => console.error('❌ Image load error:', error.nativeEvent.error)}
              onLoad={() => console.log('✅ Content image loaded:', fullImageUrl)}
            />
          </View>
        );
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
      {newsItem.imageUrl && (
        <Image 
          source={{ uri: getImageUrl(newsItem.imageUrl) }} 
          style={[styles.image, { height: screenHeight * 0.3 }]}
          resizeMode="cover"
          onError={(error) => console.error('❌ Header image load error:', error.nativeEvent.error)}
          onLoad={() => console.log('✅ Header image loaded:', newsItem.imageUrl)}
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
}); 
