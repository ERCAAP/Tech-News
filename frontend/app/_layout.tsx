import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="(auth)" 
            options={{ headerShown: false }} 
          />
        </Stack>
      </SafeAreaProvider>
    </Provider>
  );
} 