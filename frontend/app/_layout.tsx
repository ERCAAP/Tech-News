import { Stack } from 'expo-router';
import { ReduxProvider } from '@/providers/ReduxProvider';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { Tabs } from 'expo-router/tabs';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ReduxProvider>
            <Stack 
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen 
                name="category/[id]" 
                options={{
                  animation: 'slide_from_right',
                  presentation: 'card',
                }}
              />
              <Stack.Screen name="privacy" />
              <Stack.Screen name="terms" />
            </Stack>
          </ReduxProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
} 