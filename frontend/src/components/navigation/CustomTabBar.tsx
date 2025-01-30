import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { isUserAdmin } from '@/types';
import * as Haptics from 'expo-haptics';

interface TabBarProps {
  state: any;
  navigation: any;
}

const { width } = Dimensions.get('window');

export default function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector(state => state.auth);

  if (pathname === '/register'|| pathname === '/login') {
    return null;
  }

  const tabs = [
    { name: '/(tabs)', label: 'Home', icon: 'home' },
    { name: '/(tabs)/favorites', label: 'Favorites', icon: 'favorite' },
    ...(isUserAdmin(user) ? [
      { name: '/(tabs)/admin', label: 'Write', icon: 'edit' }
    ] : []),
    { name: '/(tabs)/profile', label: 'Profile', icon: 'person' },
  ];

  const isActive = (path: string) => {
    if (path === '/(tabs)' && pathname === '/(tabs)/index') return true;
    return pathname.startsWith(path);
  };

  const handlePress = async (tab: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tab.name === '/(tabs)') {
      router.push('/');
    } else {
      router.push(tab.name as any);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <BlurView intensity={90} tint="light" style={styles.blur}>
        <View style={styles.content}>
          {tabs.map((tab) => {
            const active = isActive(tab.name);

            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => handlePress(tab)}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <Animated.View style={[
                  styles.iconContainer,
                  active && styles.activeIconContainer,
                ]}>
                  <MaterialIcons
                    name={tab.icon as any}
                    size={24}
                    color={active ? COLORS.white : COLORS.gray}
                  />
                </Animated.View>
                <Text
                  style={[
                    styles.label,
                    { color: active ? COLORS.primary : COLORS.gray },
                  ]}
                >
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
    width: width,
  },
  blur: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
    transform: [{ scale: 1 }],
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
    fontFamily: FONTS.medium,
    marginTop: 4,
  },
}); 