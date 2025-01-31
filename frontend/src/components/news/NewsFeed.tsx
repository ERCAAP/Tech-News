import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Image, Text, TouchableOpacity } from 'react-native';
import { NewsItem } from '@/types';
import { COLORS, FONTS, shadowStyle } from '@/theme';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface NewsFeedProps {
  news: NewsItem[];
}

const { width } = Dimensions.get('window');
const FEATURED_HEIGHT = 200;
const SLIDER_HEIGHT = 250;
const GRID_ITEM_WIDTH = (width - 48) / 2;

export function NewsFeed({ news }: NewsFeedProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  
  // En çok okunan haberi al (örnek olarak ilk haber)
  const featuredNews = news[0];
  
  // Görseli olan haberleri filtrele
  const newsWithImages = news.filter(item => item.imageUrl);
  
  // Diğer haberler
  const otherNews = news.filter(item => !item.imageUrl);

  const handleNewsPress = (newsItem: NewsItem) => {
    router.push(`/news/${newsItem._id}`);
  };

  const renderFeaturedNews = () => (
    <TouchableOpacity 
      style={styles.featuredContainer}
      onPress={() => handleNewsPress(featuredNews)}
    >
      <Image 
        source={{ uri: featuredNews.imageUrl }} 
        style={styles.featuredImage}
      />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredBadge}>
          <MaterialIcons name="trending-up" size={16} color={COLORS.white} />
          <Text style={styles.featuredBadgeText}>Most Read Today</Text>
        </View>
        <Text style={styles.featuredTitle}>{featuredNews.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderImageSlider = () => (
    <View style={styles.sliderContainer}>
      <FlatList
        data={newsWithImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const slideIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveSlide(slideIndex);
        }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.slideItem}
            onPress={() => handleNewsPress(item)}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.slideImage} />
            <View style={styles.slideOverlay}>
              <Text style={styles.slideTitle}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item._id}
      />
      <View style={styles.pagination}>
        {newsWithImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeSlide && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderGridItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => handleNewsPress(item)}
    >
      <Text style={styles.gridItemTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.gridItemCategory}>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={otherNews}
      numColumns={2}
      ListHeaderComponent={
        <>
          {featuredNews && renderFeaturedNews()}
          {newsWithImages.length > 0 && renderImageSlider()}
        </>
      }
      renderItem={renderGridItem}
      keyExtractor={item => item._id}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.gridRow}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  featuredContainer: {
    height: FEATURED_HEIGHT,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadowStyle,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    justifyContent: 'space-between',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  featuredBadgeText: {
    color: COLORS.white,
    marginLeft: 4,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  featuredTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  sliderContainer: {
    height: SLIDER_HEIGHT,
    marginBottom: 16,
  },
  slideItem: {
    width: width - 32,
    height: SLIDER_HEIGHT - 20,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadowStyle,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  slideTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    ...shadowStyle,
  },
  gridItemTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    marginBottom: 8,
  },
  gridItemCategory: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
  },
}); 