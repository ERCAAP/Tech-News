import { Stack } from 'expo-router';
import { ReduxProvider } from '@/providers/ReduxProvider';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';

const queryClient = new QueryClient();

function LayoutContent() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ReduxProvider>
            <View style={{ flex: 1 }}>
              <LayoutContent />
            </View>
          </ReduxProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
} 