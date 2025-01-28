import { Redirect } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import React from 'react';

export default function Index() {
  const { user } = useAppSelector(state => state.auth);

  // Kullanıcı giriş yapmamışsa login ekranına yönlendir
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Kullanıcı giriş yapmışsa ana ekrana yönlendir
  return <Redirect href="/(tabs)" />;
}
