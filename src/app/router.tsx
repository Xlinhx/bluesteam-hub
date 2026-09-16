import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { IAStrategy, ThemeStrategy, VariantId } from '../domain/variant/types';
import { demoStore } from '../demo/storage/demoStore';

export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface RouterContextType {
  currentPath: string;
  params: Record<string, string>;
  query: Record<string, string>;
  navigate: (path: string, options?: { replace?: boolean; query?: Record<string, string> }) => void;
  ia: IAStrategy;
  theme: ThemeStrategy;
  variantId: VariantId;
  setIA: (ia: IAStrategy) => void;
  setTheme: (theme: ThemeStrategy) => void;
  setVariant: (variantId: VariantId) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

function parseQuery(search: string): Record<string, string> {
  const params: Record<string, string> = {};
  const query = new URLSearchParams(search);
  query.forEach((val, key) => {
    params[key] = val;
  });
  return params;
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [search, setSearch] = useState<string>(() => window.location.search || '');

  const query = useMemo(() => parseQuery(search), [search]);

  // Derive active IA and theme from query params or demoStore
  const [ia, setIAState] = useState<IAStrategy>(() => {
    if (query.ia === 'journey' || query.ia === 'explore' || query.ia === 'classroom') {
      return query.ia;
    }
    return demoStore.getVariant().ia;
  });

  const [theme, setThemeState] = useState<ThemeStrategy>(() => {
    if (query.theme === 'editorial' || query.theme === 'tactile') {
      return query.theme;
    }
    return demoStore.getVariant().theme;
  });

  const variantId: VariantId = useMemo(() => {
    if (ia === 'journey') return theme === 'editorial' ? 'v1' : 'v2';
    if (ia === 'explore') return theme === 'editorial' ? 'v3' : 'v4';
    return theme === 'editorial' ? 'v5' : 'v6';
  }, [ia, theme]);

  const setIA = (newIA: IAStrategy) => {
    setIAState(newIA);
    demoStore.setVariant({
      variantId: newIA === 'journey'
        ? (theme === 'editorial' ? 'v1' : 'v2')
        : newIA === 'explore'
        ? (theme === 'editorial' ? 'v3' : 'v4')
        : (theme === 'editorial' ? 'v5' : 'v6'),
      ia: newIA,
      theme,
    });
  };

  const setTheme = (newTheme: ThemeStrategy) => {
    setThemeState(newTheme);
    demoStore.setVariant({
      variantId: ia === 'journey'
        ? (newTheme === 'editorial' ? 'v1' : 'v2')
        : ia === 'explore'
        ? (newTheme === 'editorial' ? 'v3' : 'v4')
        : (newTheme === 'editorial' ? 'v5' : 'v6'),
      ia,
      theme: newTheme,
    });
  };

  const setVariant = (vId: VariantId) => {
    const iaMap: Record<VariantId, IAStrategy> = {
      v1: 'journey',
      v2: 'journey',
      v3: 'explore',
      v4: 'explore',
      v5: 'classroom',
      v6: 'classroom',
    };
    const themeMap: Record<VariantId, ThemeStrategy> = {
      v1: 'editorial',
      v2: 'tactile',
      v3: 'editorial',
      v4: 'tactile',
      v5: 'editorial',
      v6: 'tactile',
    };
    const newIA = iaMap[vId];
    const newTheme = themeMap[vId];
    setIAState(newIA);
    setThemeState(newTheme);
    demoStore.setVariant({ variantId: vId, ia: newIA, theme: newTheme });
  };

  const navigate = (newPath: string, options?: { replace?: boolean; query?: Record<string, string> }) => {
    const [pathPart, inlineSearch] = newPath.split('?');
    const inlineParams = inlineSearch ? parseQuery('?' + inlineSearch) : {};
    const targetQuery = { ...(options?.query ? {} : query), ...inlineParams, ...(options?.query || {}) };
    const searchStr = new URLSearchParams(targetQuery).toString();
    let url = pathPart;
    if (searchStr) {
      url += `?${searchStr}`;
    }

    if (options?.replace) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }
    setCurrentPath(pathPart);
    setSearch(searchStr ? `?${searchStr}` : '');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (typeof window !== 'undefined') {
    (window as any).__navigate = navigate;
  }

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearch(window.location.search || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider
      value={{
        currentPath,
        params: {},
        query,
        navigate,
        ia,
        theme,
        variantId,
        setIA,
        setTheme,
        setVariant,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

// Utility route matcher
export function matchRoute(pattern: string, currentPath: string): { matches: boolean; params: Record<string, string> } {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = currentPath.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return { matches: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1);
      params[paramName] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      return { matches: false, params: {} };
    }
  }

  return { matches: true, params };
}
