import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, Keyboard, Platform } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { useAppSelector } from '@/redux/hooks';
import { NewsCard } from '@/components/news/NewsCard';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NewsItem } from '@/types';
import { debounce } from 'lodash';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { news } = useAppSelector(state => state.news);
  
  // Debounced search for better performance
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setIsSearching(false);
    }, 300),
    []
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setIsSearching(true);
    debouncedSearch(text);
  };

  const handleClear = () => {
    setSearchQuery('');
    Keyboard.dismiss();
  };
  
  const filteredNews = news.filter((item: NewsItem) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.content.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  });

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {searchQuery.length > 0 ? (
        <>
          <MaterialIcons name="search-off" size={48} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>
            Try different keywords or check your spelling
          </Text>
        </>
      ) : (
        <>
          <MaterialIcons name="search" size={48} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>Search News</Text>
          <Text style={styles.emptyText}>
            Enter keywords to find relevant news
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={22} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search news..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={COLORS.gray}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <MaterialIcons
            name="close"
            size={22}
            color={COLORS.gray}
            onPress={handleClear}
            style={styles.clearIcon}
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
        contentContainerStyle={[
          styles.listContent,
          filteredNews.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={renderEmptyState}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.dark,
    padding: 0,
  },
  clearIcon: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyList: {
    flex: 1,
  },
  newsCard: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 