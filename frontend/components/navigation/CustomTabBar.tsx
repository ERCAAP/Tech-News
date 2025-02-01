import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePathname, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Icon tiplerini tanımla
type IconName = 'newspaper' | 'favorite' | 'search' | 'person';

interface TabItem {
  name: string;
  label: string;
  icon: IconName;
}

export default function CustomTabBar() {
  const pathname = usePathname();
  const { favorites } = useSelector((state: RootState) => state.news);
  const favoriteCount = favorites.length;

  const tabs: TabItem[] = [
    { name: '/(tabs)', label: 'News', icon: 'newspaper' },
    { name: '/(tabs)/favorites', label: 'Favorites', icon: 'favorite' },
    { name: '/(tabs)/search', label: 'Search', icon: 'search' },
    { name: '/(tabs)/profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname?.startsWith(tab.name);
        const isFavoriteTab = tab.name === '/(tabs)/favorites';
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => router.push(tab.name)}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={isActive ? COLORS.primary : COLORS.gray}
            />
            {isFavoriteTab && favoriteCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{favoriteCount}</Text>
              </View>
            )}
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blur: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: COLORS.primary,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeLabel: {
    color: COLORS.primary,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
}); 