import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

// Import all locales
import authEN from './locales/auth/en.json';
import authTR from './locales/auth/tr.json';
import commonEN from './locales/common/en.json';
import commonTR from './locales/common/tr.json';
import newsEN from './locales/news/en.json';
import newsTR from './locales/news/tr.json';

export const resources = {
  en: {
    auth: authEN,
    common: commonEN,
    news: newsEN,
  },
  tr: {
    auth: authTR,
    common: commonTR,
    news: newsTR,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale.split('-')[0],
    fallbackLng: 'en',
    ns: ['auth', 'common', 'news'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// RTL desteği için
I18nManager.allowRTL(i18n.dir() === 'rtl');
I18nManager.forceRTL(i18n.dir() === 'rtl');

export default i18n; 