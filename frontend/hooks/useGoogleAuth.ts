import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { useAppDispatch } from '@/redux/hooks';
import { socialLogin } from '@/redux/slices/authSlice';
import { router } from 'expo-router';
import { authConfig } from '../config/auth-config';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: authConfig.googleClientId.expo,
    iosClientId: authConfig.googleClientId.ios,
    redirectUri: makeRedirectUri({
      scheme: 'technews'
    })
  });

  const signIn = async () => {
    try {
      setIsLoading(true);
      const result = await promptAsync();
      
      if (result?.type === 'success' && result.authentication?.accessToken) {
        const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
        });
        const userInfo = await response.json();
        
        await dispatch(socialLogin({
          provider: 'google',
          token: result.authentication.accessToken,
        })).unwrap();
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
  };
} 