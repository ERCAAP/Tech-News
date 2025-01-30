import { Stack } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { ReduxProvider } from '@/providers/ReduxProvider';
import React from 'react';

function RootLayoutContent() {
  const { token } = useAppSelector(state => state.auth);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen 
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
      ) : (
        <Stack.Screen 
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
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