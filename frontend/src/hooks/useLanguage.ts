import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(async (language: 'en' | 'tr') => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [i18n]);

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    isRTL: i18n.dir() === 'rtl'
  };
}; 