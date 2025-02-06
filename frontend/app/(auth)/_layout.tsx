import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from '@/theme';
import { StatusBar } from 'react-native';

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
  }, [colorScheme]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        statusBarColor: COLORS.background,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="paywall" />
    </Stack>
  );
} 