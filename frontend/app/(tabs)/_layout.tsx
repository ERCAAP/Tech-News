import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSelector } from '@/redux/hooks';
import React from 'react';
import { COLORS } from '@/theme';
import { isUserAdmin } from '@/types';

export default function TabLayout() {
  const { user } = useAppSelector(state => state.auth);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="favorite" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="news/[id]"
        options={{
          tabBarButton: () => null,
          title: 'News Detail'
        }}
      />

      {user && isUserAdmin(user) && (
        <Tabs.Screen
          name="admin"
          options={{
            tabBarButton: () => null,
            title: 'Admin Panel'
          }}
        />
      )}
    </Tabs>
  );
} 