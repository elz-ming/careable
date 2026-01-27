import type { LanguagePreference } from '@/lib/supabase/model';
import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import ms from '@/locales/ms.json';

const translations = {
  en,
  zh,
  ms
};

export function getTranslations(lang: LanguagePreference = 'en') {
  return translations[lang] || translations.en;
}

export type TranslationKey = keyof typeof en;
export type Translations = typeof en;
