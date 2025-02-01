import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { isUserAdmin } from '@/types';
import * as Haptics from 'expo-haptics';

export default function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector(state => state.auth);

  const tabs = [
    { name: '/(tabs)', label: 'News', icon: 'newspaper' },
    { name: '/(tabs)/favorites', label: 'Favorites', icon: 'favorite' },
    { name: '/(tabs)/search', label: 'Search', icon: 'search' },
    ...(isUserAdmin(user) ? [
      { name: '/(tabs)/admin', label: 'Write', icon: 'edit' }
    ] : []),
    { name: '/(tabs)/profile', label: 'Profile', icon: 'person' },
  ];

  const isActive = (path: string) => {
    if (path === '/(tabs)' && pathname === '/(tabs)/index') return true;
    return pathname?.startsWith(path);
  };

  const handlePress = async (tab: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tab.name === '/(tabs)') {
      router.push('/');
    } else {
      router.push(tab.name);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <BlurView intensity={80} tint="light" style={styles.blur}>
        <View style={styles.content}>
          {tabs.map((tab) => {
            const isSelected = isActive(tab.name);
            
            return (
              <TouchableOpacity
                key={tab.name}
                style={[
                  styles.tab,
                  isSelected && styles.activeTab
                ]}
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
    backgroundColor: 'transparent',
  },
  blur: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.1 }],
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  activeLabel: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
}); 