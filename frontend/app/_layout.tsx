import { Stack } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { ReduxProvider } from '@/providers/ReduxProvider';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '@/redux/slices/authSlice';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomTabBar from '@/components/navigation/CustomTabBar';
import { View } from 'react-native';
import { usePathname } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';

const queryClient = new QueryClient();

function RootLayoutContent() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);
  const pathname = usePathname();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPassword = await AsyncStorage.getItem('userPassword');

      if (savedRememberMe === 'true' && savedEmail && savedPassword) {
        dispatch(login({ email: savedEmail, password: savedPassword })).unwrap()
          .catch(async (error) => {
            console.error('Auto login failed:', error);
            await AsyncStorage.setItem('rememberMe', 'false');
            await AsyncStorage.removeItem('userPassword');
          });
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const isAuthScreen = pathname?.startsWith('/(auth)');
  const shouldShowTabBar = token && user && !isAuthScreen;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="terms" options={{ presentation: 'modal' }} />
      </Stack>
      {shouldShowTabBar && !isAuthScreen && <CustomTabBar />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ReduxProvider>
            <RootLayoutContent />
          </ReduxProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
} 