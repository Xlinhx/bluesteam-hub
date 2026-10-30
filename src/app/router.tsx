import {transitionCreativeScene} from '../shared/ui/motion/creativeNavigation';
import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { IAStrategy, ThemeStrategy, VariantId } from '../shared/types/variant';
import { demoStore } from '../shared/realtime/demoStore';
import { flushSync } from 'react-dom';
import { isOceanScene, isInteractiveScene, transitionOceanScene } from '../shared/ui/motion/oceanNavigation';
import '../shared/ui/motion/ocean-navigation.css';

export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

export const ROUTE_ALIASES: Record<string, string> = {
  '/student': '/home',
  '/student/home': '/home',
  '/teacher/lessons': '/teacher',
  '/teacher/curriculum': '/teacher',
};

export function resolveRouteDomain(pathname: string): 'public' | 'learner' | 'teacher' | 'showcase' {
  if (pathname.startsWith('/teacher')) return 'teacher';
  if (pathname.startsWith('/showcase') || pathname.startsWith('/concepts')) return 'showcase';
  if (
    pathname === '/' ||
    pathname.startsWith('/entry') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  ) {
    return 'public';
  }
  return 'learner';
}

export interface RouterContextType {
  currentPath: string;
  currentRoute: string;
  params: Record<string, string>;
  query: Record<string, string>;
  navigate: (
    path: string,
    options?: {
      replace?: boolean;
      query?: Record<string, string | null | undefined>;
      preserveQuery?: boolean;
    },
  ) => void;
  setQuery: (
    updates: Record<string, string | null | undefined>,
    options?: { replace?: boolean },
  ) => void;
  ia: IAStrategy;
  theme: ThemeStrategy;
  variantId: VariantId;
  setIA: (ia: IAStrategy) => void;
  setTheme: (theme: ThemeStrategy) => void;
  setVariant: (variantId: VariantId) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function parseQuery(search: string): Record<string, string> {
  const params: Record<string, string> = {};
  const query = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  query.forEach((val, key) => {
    params[key] = val;
  });
  return params;
}

export function RouterProvider({
  children,
  initialRoute,
}: {
  children: React.ReactNode;
  initialRoute?: string;
}) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (initialRoute) {
      const [p] = initialRoute.split('?');
      return p || '/';
    }
    return typeof window !== 'undefined' && window.location?.pathname
      ? window.location.pathname
      : '/';
  });

  const [search, setSearch] = useState<string>(() => {
    if (initialRoute) {
      const idx = initialRoute.indexOf('?');
      return idx >= 0 ? initialRoute.slice(idx) : '';
    }
    return typeof window !== 'undefined' && window.location?.search
      ? window.location.search
      : '';
  });

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
      variantId:
        newIA === 'journey'
          ? theme === 'editorial'
            ? 'v1'
            : 'v2'
          : newIA === 'explore'
          ? theme === 'editorial'
            ? 'v3'
            : 'v4'
          : theme === 'editorial'
          ? 'v5'
          : 'v6',
      ia: newIA,
      theme,
    });
  };

  const setTheme = (newTheme: ThemeStrategy) => {
    setThemeState(newTheme);
    demoStore.setVariant({
      variantId:
        ia === 'journey'
          ? newTheme === 'editorial'
            ? 'v1'
            : 'v2'
          : ia === 'explore'
          ? newTheme === 'editorial'
            ? 'v3'
            : 'v4'
          : newTheme === 'editorial'
          ? 'v5'
          : 'v6',
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

  const navigate = (
    newPath: string,
    options?: {
      replace?: boolean;
      query?: Record<string, string | null | undefined>;
      preserveQuery?: boolean;
    },
  ) => {
    const [rawPathPart, inlineSearch] = newPath.split('?');
    const pathPart = ROUTE_ALIASES[rawPathPart] || rawPathPart || '/';
    const inlineParams = inlineSearch ? parseQuery('?' + inlineSearch) : {};

    const sameDomain = resolveRouteDomain(pathPart) === resolveRouteDomain(currentPath);
    const baseQuery =
      options?.preserveQuery && sameDomain ? query : {};

    const targetQuery: Record<string, string> = {
      ...baseQuery,
      ...inlineParams,
    };
    if (options?.query) {
      for (const [k, v] of Object.entries(options.query)) {
        if (v === null || v === undefined || v === '') {
          delete targetQuery[k];
        } else {
          targetQuery[k] = String(v);
        }
      }
    }

    const searchStr = new URLSearchParams(targetQuery).toString();
    let url = pathPart;
    if (searchStr) {
      url += `?${searchStr}`;
    }

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && url !== `${window.location.pathname}${window.location.search}` && !window.dispatchEvent(new CustomEvent('bluesteam:before-navigate', { cancelable: true,detail:{url} }))) return;

    const commitRoute = () => {
    if (typeof window !== 'undefined' && window.history) {
      if (options?.replace) {
          window.history.replaceState({}, '', url);
      } else {
        window.history.pushState({}, '', url);
      }
      if(pathPart!==currentPath||!isInteractiveScene(pathPart))window.scrollTo?.({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
    setCurrentPath(pathPart);
    setSearch(searchStr ? `?${searchStr}` : '');
    };
    if(transitionCreativeScene(`${currentPath}${search}`,url,()=>flushSync(commitRoute),typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,typeof document==='undefined'?undefined:document))return;
    const native = (isOceanScene(currentPath) || isOceanScene(pathPart) || (isInteractiveScene(currentPath) && isInteractiveScene(pathPart))) && typeof document !== 'undefined' && 'startViewTransition' in document;
    transitionOceanScene(currentPath, pathPart, () => native ? flushSync(commitRoute) : commitRoute(), typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, typeof document === 'undefined' ? undefined : document);
  };

  const setQuery = (
    updates: Record<string, string | null | undefined>,
    options?: { replace?: boolean },
  ) => {
    const next: Record<string, string> = { ...query };
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === undefined || v === '') {
        delete next[k];
      } else {
        next[k] = String(v);
      }
    }
    const searchStr = new URLSearchParams(next).toString();
    const url = searchStr ? `${currentPath}?${searchStr}` : currentPath;
    if (typeof window !== 'undefined' && window.history) {
      if (options?.replace ?? true) {
        window.history.replaceState(window.history.state || {}, '', url);
      } else {
        window.history.pushState({}, '', url);
      }
    }
    setSearch(searchStr ? `?${searchStr}` : '');
  };

  if (typeof window !== 'undefined') {
    (window as any).__navigate = navigate;
  }

  const acceptedLocation=useRef(`${currentPath}${search}`);
  acceptedLocation.current=`${currentPath}${search}`;
  useEffect(() => {
    const handlePopState = () => {
      if(typeof window.dispatchEvent==='function' && !window.dispatchEvent(new CustomEvent('bluesteam:before-navigate',{cancelable:true}))){window.history.pushState({},'',acceptedLocation.current);return;}
      const path = window.location.pathname || '/', search = window.location.search || '';
      if(transitionCreativeScene(acceptedLocation.current,`${path}${search}`,()=>flushSync(()=>{setCurrentPath(path);setSearch(search);}),window.matchMedia('(prefers-reduced-motion: reduce)').matches,document,'back'))return;
      transitionOceanScene(acceptedLocation.current.split('?')[0], path, () => flushSync(() => { setCurrentPath(path); setSearch(search); }), window.matchMedia('(prefers-reduced-motion: reduce)').matches, document, 'back');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const routeParams = useMemo(() => {
    const patterns = [
      '/teacher/interactive/games/:activityId/edit',
      '/teacher/interactive/games/:activityId',
      '/teacher/interactive/scenarios/:activityId/edit',
      '/teacher/interactive/scenarios/:activityId',
      '/resources/flashcard/:cardId',
      '/resources/print/:printId',
      '/resources/media/:mediaId',
      '/resources/video/:mediaId',
      '/resources/:resourceId',
      '/3dmodel/:creature',
      '/present/:experienceId',
      '/teacher/lesson/:lessonId',
      '/teacher/unit/:unitId',
      '/student/unit/:unitId',
      '/student/experience/:experienceId',
    ];
    for (const pattern of patterns) {
      const m = matchRoute(pattern, currentPath);
      if (m.matches) {
        return m.params;
      }
    }
    return {};
  }, [currentPath]);

  return (
    <RouterContext.Provider
      value={{
        currentPath,
        currentRoute: currentPath,
        params: routeParams,
        query,
        navigate,
        setQuery,
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
export function matchRoute(
  pattern: string,
  currentPath: string,
): { matches: boolean; params: Record<string, string> } {
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
