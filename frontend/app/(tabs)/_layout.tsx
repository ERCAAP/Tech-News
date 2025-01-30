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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 0,
          left: 20,
          right: 20,
          elevation: 0,
          borderRadius: 15,
          height: 60,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={100}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 15,
            }}
          />
        ),
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
        name="news/[id]"
        options={{
          tabBarButton: () => null,
        }}
      />

      {user && isUserAdmin(user) && (
        <Tabs.Screen
          name="admin"
          options={{
            tabBarButton: () => null,
          }}
        />
      )}
    </Tabs>
  );
} 