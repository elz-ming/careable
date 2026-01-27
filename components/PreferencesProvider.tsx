'use client';

import * as React from 'react';
import type { LanguagePreference, FontSize, Theme } from '@/lib/supabase/model';
import { getTranslations, type Translations } from '@/lib/i18n/translations';
import { updateLanguage, updateFontSize, updateTheme } from '@/app/actions/preferences';

export interface UserPreferences {
  language: LanguagePreference;
  fontSize: FontSize;
  theme: Theme;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  translations: Translations;
  setLanguage: (lang: LanguagePreference) => Promise<void>;
  setFontSize: (size: FontSize) => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  isLoading: boolean;
}

const PreferencesContext = React.createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({
  children,
  initialPreferences
}: {
  children: React.ReactNode;
  initialPreferences: UserPreferences;
}) {
  const [preferences, setPreferences] = React.useState<UserPreferences>(initialPreferences);
  const [isLoading, setIsLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const translations = React.useMemo(() => getTranslations(preferences.language), [preferences.language]);

  // Prevent hydration mismatch by only running after mount
  React.useEffect(() => {
    setMounted(true);
    
    // Apply theme immediately on mount to override system preference
    const root = document.documentElement;
    if (initialPreferences.theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Apply theme to document
  React.useEffect(() => {
    if (!mounted) return;
    
    console.log('🎨 [THEME EFFECT] Running theme effect');
    console.log('🎨 [THEME EFFECT] preferences.theme:', preferences.theme);
    console.log('🎨 [THEME EFFECT] mounted:', mounted);
    
    const root = document.documentElement;
    console.log('🎨 [THEME EFFECT] Before - classList:', root.classList.toString());
    console.log('🎨 [THEME EFFECT] Before - colorScheme:', root.style.colorScheme);
    
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      console.log('🎨 [THEME EFFECT] Applied DARK theme');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      console.log('🎨 [THEME EFFECT] Applied LIGHT theme');
    }
    
    console.log('🎨 [THEME EFFECT] After - classList:', root.classList.toString());
    console.log('🎨 [THEME EFFECT] After - colorScheme:', root.style.colorScheme);
    console.log('🎨 [THEME EFFECT] After - background:', window.getComputedStyle(root).backgroundColor);
  }, [preferences.theme, mounted]);

  // Apply font size to document
  React.useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.setAttribute('data-font-size', preferences.fontSize);
    
    // Apply font scale CSS variable
    const fontScales = {
      small: '0.875',  // 87.5% - 14px base
      medium: '1',     // 100% - 16px base
      large: '1.125'   // 112.5% - 18px base
    };
    root.style.setProperty('--font-scale', fontScales[preferences.fontSize]);
  }, [preferences.fontSize, mounted]);

  const setLanguage = React.useCallback(async (lang: LanguagePreference) => {
    // Optimistic update - change UI immediately
    setPreferences(prev => ({ ...prev, language: lang }));
    
    // Save to database in background
    try {
      await updateLanguage(lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }, []);

  const setFontSize = React.useCallback(async (size: FontSize) => {
    // Optimistic update - change UI immediately
    setPreferences(prev => ({ ...prev, fontSize: size }));
    
    // Save to database in background
    try {
      await updateFontSize(size);
    } catch (error) {
      console.error('Failed to save font size preference:', error);
    }
  }, []);

  const setTheme = React.useCallback(async (theme: Theme) => {
    console.log('🌙 [SET_THEME] Called with theme:', theme);
    console.log('🌙 [SET_THEME] Current preferences:', preferences);
    
    // Optimistic update - change UI immediately
    setPreferences(prev => {
      console.log('🌙 [SET_THEME] Updating from:', prev.theme, '→', theme);
      return { ...prev, theme };
    });
    
    // Save to database in background
    try {
      await updateTheme(theme);
      console.log('🌙 [SET_THEME] Saved to database');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [preferences]);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        translations,
        setLanguage,
        setFontSize,
        setTheme,
        isLoading
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = React.useContext(PreferencesContext);
  if (!context) {
    // Return default context for pages without provider
    return {
      preferences: {
        language: 'en' as LanguagePreference,
        fontSize: 'medium' as FontSize,
        theme: 'light' as Theme
      },
      translations: getTranslations('en'),
      setLanguage: async () => {},
      setFontSize: async () => {},
      setTheme: async () => {},
      isLoading: false
    };
  }
  return context;
}

export function useTranslations() {
  const { translations } = usePreferences();
  return translations;
}
