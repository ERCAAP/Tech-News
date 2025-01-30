import { Stack } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { ReduxProvider } from '@/providers/ReduxProvider';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '@/redux/slices/authSlice';

function RootLayoutContent() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);

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