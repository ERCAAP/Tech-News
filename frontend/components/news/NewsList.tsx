import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { NewsItem as NewsItemType } from '@/types';
import { COLORS, FONTS } from '@/theme';
import { getImageUrl } from '@/utils/imageHelper';
import { MaterialIcons } from '@expo/vector-icons';

export function NewsItem({ item }: { item: NewsItemType }) {
  return (
    <Link href={`/news/${item.slug}`} asChild>
      <TouchableOpacity style={styles.container}>
        <Image 
          source={{ uri: getImageUrl(item.imageUrl) }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <View style={styles.footer}>
            <View style={styles.author}>
              <MaterialIcons name="person" size={16} color={COLORS.gray} />
              <Text style={styles.authorText}>
                {item.author.firstName} {item.author.lastName}
              </Text>
            </View>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  category: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  authorText: {
    marginLeft: 5,
  },
  date: {
    fontSize: 12,
    color: COLORS.gray,
  },
}); 