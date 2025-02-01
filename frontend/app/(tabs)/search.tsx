import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { useAppSelector } from '@/redux/hooks';
import { NewsCard } from '@/components/news/NewsCard';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NewsItem } from '@/types';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { news } = useAppSelector(state => state.news);
  
  const filteredNews = news.filter((item: NewsItem) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.content.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search news..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray}
        />
        {searchQuery.length > 0 && (
          <MaterialIcons
            name="close"
            size={24}
            color={COLORS.gray}
            onPress={() => setSearchQuery('')}
          />
        )}
      </View>
      
      <FlatList
        data={filteredNews}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.newsCard}>
            <NewsCard news={item} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
  listContent: {
    padding: 16,
  },
  newsCard: {
    marginBottom: 16,
  },
}); 