import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useAppSelector } from '@/redux/hooks';
import { COLORS, FONTS } from '@/theme';

interface NewsStats {
  title: string;
  totalViews: number;
  uniqueViews: number;
  favoritesCount: number;
}

export function NewsStatsList() {
  const { stats, isLoading } = useAppSelector(state => state.news);

  if (isLoading) {
    return <Text style={styles.message}>Loading stats...</Text>;
  }

  if (!stats?.views) {
    return <Text style={styles.message}>No stats available</Text>;
  }

  // Transform the stats data into the format we need
  const statsData: NewsStats[] = [{
    title: "Overall Statistics",
    totalViews: stats.views.total,
    uniqueViews: stats.views.unique,
    favoritesCount: stats.favorites
  }];

  return (
    <ScrollView style={styles.container}>
      {statsData.map((item, index) => (
        <View key={index} style={styles.statItem}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Total Views</Text>
              <Text style={styles.statValue}>{item.totalViews}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Unique Views</Text>
              <Text style={styles.statValue}>{item.uniqueViews}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Favorites</Text>
              <Text style={styles.statValue}>{item.favoritesCount}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 24,
  },
  statItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
}); 