import { Stack } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { ReduxProvider } from '@/providers/ReduxProvider';
import React from 'react';

function RootLayoutContent() {
  const { token } = useAppSelector(state => state.auth);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!token ? (
        // Auth stack
        <>
          <Stack.Screen name="(auth)/login" options={{ title: 'Login' }} />
          <Stack.Screen name="(auth)/register" options={{ title: 'Register' }} />
        </>
      ) : (
        // App stack
        <Stack.Screen name="(tabs)" options={{ title: 'Home' }} />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ReduxProvider>
      <RootLayoutContent />
    </ReduxProvider>
  );
} 