import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSelector } from '@/redux/hooks';
import React from 'react';
import { COLORS, FONTS } from '@/theme';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const { isDark } = useAppSelector(state => state.theme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? COLORS.darkBackground : COLORS.white,
          borderTopColor: isDark ? COLORS.darkSecondary : COLORS.border,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDark ? COLORS.white : COLORS.gray,
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen
        name="news/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="create-news"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
} 