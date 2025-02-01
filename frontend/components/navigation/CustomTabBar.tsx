import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { MaterialIcons } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { BlurView } from 'react-native-blur';
import { COLORS } from '@/theme';
import { API_URL } from '../utils/api';

export default function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Favori sayısını getir
  useEffect(() => {
    if (user?._id) {
      fetchFavoriteCount();
    }
  }, [user?._id, pathname]);

  const fetchFavoriteCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/news/favorites/count`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFavoriteCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching favorite count:', error);
    }
  };

  const handlePress = (tab) => {
    router.push(tab.name);
  };

  const isActive = (name) => {
    return pathname === name;
  };

  const tabs = [
    { name: '/(tabs)/home', label: 'Home', icon: 'home' },
    { name: '/(tabs)/favorites', label: 'Favorites', icon: 'favorite' },
    { name: '/(tabs)/profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <BlurView intensity={80} tint="light" style={styles.blur}>
        <View style={styles.content}>
          {tabs.map((tab) => {
            const isSelected = isActive(tab.name);
            
            // Favorites tab için badge göster
            const showBadge = tab.name === '/(tabs)/favorites' && favoriteCount > 0;
            
            return (
              <TouchableOpacity
                key={tab.name}
                style={[styles.tab, isSelected && styles.activeTab]}
                onPress={() => handlePress(tab)}
              >
                <Animated.View style={[
                  styles.iconContainer,
                  isSelected && styles.activeIconContainer,
                ]}>
                  <MaterialIcons
                    name={tab.icon as any}
                    size={24}
                    color={isSelected ? COLORS.white : COLORS.gray}
                  />
                  {showBadge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{favoriteCount}</Text>
                    </View>
                  )}
                </Animated.View>
                <Text style={[
                  styles.label,
                  isSelected && styles.activeLabel
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
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