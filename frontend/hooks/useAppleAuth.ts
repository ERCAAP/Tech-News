import * as AppleAuthentication from 'expo-apple-authentication';
import { useState } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { socialLogin } from '@/redux/slices/authSlice';
import { router } from 'expo-router';

export function useAppleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const signIn = async () => {
    try {
      setIsLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      await dispatch(socialLogin({
        provider: 'apple',
        token: credential.identityToken,
      })).unwrap();
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // Kullanıcı işlemi iptal etti
      } else {
        console.error('Apple sign in error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
  };
} 