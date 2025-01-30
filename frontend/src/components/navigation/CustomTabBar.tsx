import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from 'react-native';
import { COLORS, FONTS } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

interface TabBarProps {
  state: any;
  navigation: any;
}

export default function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabs = [
    { name: 'index', label: 'Home', icon: 'home' },
    { name: 'favorites', label: 'Favorites', icon: 'favorite' },
    { name: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <BlurView intensity={80} tint="light" style={styles.blur}>
        <View style={styles.content}>
          {tabs.map((tab, index) => {
            const isFocused = state.index === index;

            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => navigation.navigate(tab.name)}
                style={styles.tab}
              >
                <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                  <MaterialIcons
                    name={tab.icon as any}
                    size={24}
                    color={isFocused ? COLORS.white : COLORS.gray}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    { color: isFocused ? COLORS.primary : COLORS.gray },
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
  },
  blur: {
    margin: 8,
    marginBottom: Platform.OS === 'ios' ? 16 : 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
}); 