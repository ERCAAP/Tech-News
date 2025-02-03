import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreUserSession } from '@/redux/slices/authSlice';
import { AppDispatch } from '@/redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import OneSignal from 'react-native-onesignal';
import Constants from 'expo-constants';

export default function App({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeApp = async () => {
      await dispatch(restoreUserSession());
      const isTutorialCompleted = await AsyncStorage.getItem('isTutorialCompleted');
      
      if (!isTutorialCompleted) {
        router.replace('/(tutorial)/welcome');
      }
    };

    initializeApp();
  }, [dispatch]);

  // App başlangıcında
  OneSignal.setAppId(Constants.expoConfig?.extra?.oneSignalAppId);

  return children;
} 