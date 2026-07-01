import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { NewsItem } from '@/types';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const handlePress = () => {
    router.push({
      pathname: "/news/[id]",
      params: { id: news._id }
    });
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
    >
      <View style={styles.categoryTag}>
        <Text style={styles.categoryText}>{news.category}</Text>
      </View>
      
      <View style={styles.imageContainer}>
        {news.imageUrl ? (
          <Image
            source={{ uri: news.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="image" size={40} color={COLORS.lightGray} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {news.title}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.authorInfo}>
            <MaterialIcons name="person" size={16} color={COLORS.gray} />
            <Text style={styles.authorName}>
              {news.author.firstName} {news.author.lastName}
            </Text>
          </View>
          <View style={styles.stats}>
            <MaterialIcons name="visibility" size={16} color={COLORS.gray} />
            <Text style={styles.statsText}>
              {news.views?.total || 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary + '90',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 8,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginLeft: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginLeft: 4,
  },
}); 