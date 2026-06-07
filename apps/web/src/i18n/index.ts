import i18n, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

// `initImmediate` is a valid runtime option but absent from i18next v26 types;
// widen the local type so init runs synchronously (deterministic in tests).
const options: InitOptions & { initImmediate?: boolean } = {
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  initImmediate: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
};

void i18n.use(initReactI18next).init(options);

export default i18n;
