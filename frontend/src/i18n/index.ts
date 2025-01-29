import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import all locales
import authEN from './locales/auth/en.json';
import authTR from './locales/auth/tr.json';
import commonEN from './locales/common/en.json';
import commonTR from './locales/common/tr.json';

const resources = {
  en: {
    auth: authEN,
    common: commonEN
  },
  tr: {
    auth: authTR,
    common: commonTR
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale.split('-')[0], // Cihaz dilini al
    fallbackLng: 'en',
    ns: ['auth', 'common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 