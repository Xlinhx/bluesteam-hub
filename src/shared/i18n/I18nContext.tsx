import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SupportedLocale, I18nContextType } from './types';
import { TRANSLATIONS } from './translations';

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'ocean:v2:locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'vi' || stored === 'en') {
        return stored;
      }
    } catch {
      // Ignore localStorage error
    }
    return 'vi'; // Default Vietnamese for BlueSTEAM
  });

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // Ignore localStorage error
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = TRANSLATIONS[locale];
      if (dict && key in dict) {
        return dict[key];
      }
      // Fallback to vi if not in en
      if (locale !== 'vi' && TRANSLATIONS.vi[key]) {
        return TRANSLATIONS.vi[key];
      }
      return fallback || key;
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
