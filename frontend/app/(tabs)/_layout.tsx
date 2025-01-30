import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSelector } from '@/redux/hooks';
import React from 'react';
import { COLORS, FONTS } from '@/theme';
import { isUserAdmin } from '@/types';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const { user } = useAppSelector(state => state.auth);
  const { isDark } = useAppSelector(state => state.theme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? COLORS.darkBackground : COLORS.white,
          borderTopColor: isDark ? COLORS.darkSecondary : COLORS.border,
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
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
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

      <Tabs.Screen
        name="news/[id]"
        options={{
          href: null,
          tabBarButton: () => null,
        }}
      />

      {user && isUserAdmin(user) && (
        <Tabs.Screen
          name="admin"
          options={{
            href: null,
            tabBarButton: () => null,
          }}
        />
      )}
    </Tabs>
  );
} 