import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from '@/theme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? COLORS.darkBackground : COLORS.background,
        },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen 
        name="register"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
} 