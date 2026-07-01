import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { newsAPI } from '@/services/api';
import { COLORS } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

// API tipi için interface ekleyelim
interface StatsData {
  totalViews: number;
  totalFavorites: number;
  totalNews: number;
}

export default function StatsScreen() {
  const { data: stats, isLoading } = useQuery<{ data: StatsData }>({
    queryKey: ['newsStats'],
    queryFn: () => newsAPI.getStats()
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Total Views</Text>
        <Text style={styles.statValue}>{stats?.data?.totalViews || 0}</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Total Favorites</Text>
        <Text style={styles.statValue}>{stats?.data?.totalFavorites || 0}</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Total News</Text>
        <Text style={styles.statValue}>{stats?.data?.totalNews || 0}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statTitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 8
  },
  statValue: {
    fontSize: 24,
    color: COLORS.dark,
    fontWeight: 'bold'
  }
}); 