import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeStrategy } from '../types/variant';
import { applyThemeVariables } from './tokens';

interface ThemeContextType {
  theme: ThemeStrategy;
  setTheme: (theme: ThemeStrategy) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({
  children,
  initialTheme = 'editorial',
}: {
  children: React.ReactNode;
  initialTheme?: ThemeStrategy;
}) {
  const [theme, setThemeState] = useState<ThemeStrategy>(() => {
    const saved =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem('ocean-demo:v1:variant')
        : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.theme === 'editorial' || parsed.theme === 'tactile') {
          return parsed.theme;
        }
      } catch {
        // fallback
      }
    }
    return initialTheme;
  });

  const setTheme = (newTheme: ThemeStrategy) => {
    setThemeState(newTheme);
    applyThemeVariables(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'editorial' ? 'tactile' : 'editorial');
  };

  useEffect(() => {
    applyThemeVariables(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
