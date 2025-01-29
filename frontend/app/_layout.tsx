import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';
import '../src/i18n'; // i18n'i import edelim
import { COLORS } from '@/theme';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeAreaProvider>
    </Provider>
  );
} 