import { useLayoutEffect, useRef } from 'react';
import { createMotionScope } from './homeMotionScope';
import { homeChoreography, type HomeRole } from './homeChoreography';
import { useRouter } from '../../../app/router';
import { installHomeJourney } from './homeJourney';
import { installHomePointerDepth } from './homePointerDepth';
import { installHomeScrollReveal } from './homeScrollReveal';
import './home-motion.css';

type SessionStore = Pick<Storage, 'getItem' | 'setItem'>;
const SELECTION_KEY = 'bluesteam.home.selection.v1';
const openedWithoutStorage = new Set<HomeRole>();
function sessionStore(): SessionStore | undefined {
  try { return typeof window === 'undefined' ? undefined : window.sessionStorage; }
  catch { return undefined; }
}
export function readHomeSelection(store = sessionStore()): number {
  try { const value = store?.getItem(SELECTION_KEY); return value === '1' || value === '2' ? Number(value) : 0; }
  catch { return 0; }
}
export function saveHomeSelection(index: number, store = sessionStore()) {
  try { store?.setItem(SELECTION_KEY, String(index)); } catch { /* Private storage may be unavailable. */ }
}
export function hasSeenHomeEntrance(role: HomeRole, store = sessionStore()) {
  try { if (store) return store.getItem(`bluesteam.home.entrance.v3.${role}`) === 'seen'; } catch { /* Fall back to tab memory. */ }
  return openedWithoutStorage.has(role);
}
export function consumeHomeEntrance(role: HomeRole, store = sessionStore()) {
  try {
    if (store) {
      const key = `bluesteam.home.entrance.v3.${role}`;
      if (store.getItem(key) === 'seen') return false;
      store.setItem(key, 'seen'); return true;
    }
  } catch { /* The in-memory policy also works in private/blocked storage. */ }
  if (openedWithoutStorage.has(role)) return false;
  openedWithoutStorage.add(role); return true;
}

/** Layered artwork choreography never holds navigation or moves the interactive hit targets. */
export function useHomeEntrance(role: HomeRole) {
  const ref = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  const navigateRef = useRef(navigate); navigateRef.current = navigate;
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const scope = createMotionScope(root);
    const disposeJourney = installHomeJourney(root, (url, options) => navigateRef.current(url, options));
    const disposeDepth = installHomePointerDepth(root);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let settle = 0;
    let disposeReveal = () => {};
    const stop = () => {
      consumeHomeEntrance(role);
      scope.stop(); clearTimeout(settle);
      root.dataset.entrance = media.matches ? 'reduced' : 'interrupted';
    };
    // Defer only the decorative artwork, so StrictMode's discarded mount consumes nothing.
    const frame = requestAnimationFrame(() => {
      const first = !hasSeenHomeEntrance(role);
      if (media.matches) { consumeHomeEntrance(role); root.dataset.entrance = 'reduced'; return; }
      if (!scope.allowed()) { root.dataset.entrance = 'interrupted'; return; }
      root.dataset.entrance = first ? 'open' : 'return';
      const compact = innerWidth < 768;
      let end = 0;
      for (const cue of homeChoreography(role)) {
        // Returning home keeps its water/imagery continuity without replaying the title reveal.
        if (!first && !cue.selector.includes('home-water') && !cue.selector.includes('gallery-stage') && !cue.selector.includes('teacher-home-photo')) continue;
        const anchor = root.querySelector(cue.anchor)?.getBoundingClientRect();
        if (!anchor) continue;
        let index = 0;
        for (const element of root.querySelectorAll(cue.selector)) {
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height || rect.top >= innerHeight || rect.bottom <= 0) continue;
          const duration = first ? cue.duration * (compact ? .85 : 1) : 900;
          const delay = first ? (cue.delay || 0) + index++ * (cue.sequence || 0) : 0;
          scope.play(element, cue.frames(rect, anchor, compact), { duration, delay });
          end = Math.max(end, duration + delay);
        }
      }
      if (first) disposeReveal = installHomeScrollReveal(root, role, scope);
      settle = window.setTimeout(() => { consumeHomeEntrance(role); root.dataset.entrance = first ? 'settled' : 'return'; }, end + 30);
    });
    document.addEventListener('pointerdown', stop, true);
    document.addEventListener('keydown', stop, true);
    root.addEventListener('focusin', stop);
    window.addEventListener('resize', stop);
    media.addEventListener('change', stop);
    return () => {
      cancelAnimationFrame(frame); clearTimeout(settle); scope.dispose();
      disposeJourney();
      disposeDepth();
      disposeReveal();
      document.removeEventListener('pointerdown', stop, true);
      document.removeEventListener('keydown', stop, true);
      root.removeEventListener('focusin', stop);
      window.removeEventListener('resize', stop);
      media.removeEventListener('change', stop);
    };
  }, [role]);
  return ref;
}
