import { useLayoutEffect, useRef, type RefObject } from 'react';
import { createMotionScope, motionTiming } from '../../../shared/ui/motion/motionScope';
import { choreographEntry, choreographAuth, choreographPublicArrival } from './publicMotionScenes';

function layoutTop(element: HTMLElement) {
  let top = 0, current: HTMLElement | null = element;
  while (current) { top += current.offsetTop; current = current.offsetParent as HTMLElement | null; }
  return top;
}

/** Choreography stays local to the public journey; the DOM is always usable at rest. */
export function usePublicMotion(root: RefObject<HTMLElement | null>, scene: 'landing' | 'entry' | 'auth', state = '') {
  const entered = useRef<string | null>(null);
  const fieldPositions = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const scope = createMotionScope(media);
    const first = entered.current === null || entered.current === state;
    entered.current = state;
    let interrupted = false;
    let stopScene: (() => void) | undefined;
    const arrivedThroughTransition = !!document.documentElement.dataset.publicJourney;
    const enterScene = () => {
      if (interrupted || !element.isConnected || media.matches) return;
      // The snapshot already delivered the artwork and content at their final positions.
      if (arrivedThroughTransition) stopScene = choreographPublicArrival(element, scope);
      else if (scene === 'entry') stopScene = choreographEntry(element, scope);
      else if (scene === 'auth') choreographAuth(element, scope, first);
    };
    const enterWhenReady = () => {
      if (document.documentElement.dataset.publicJourney) document.addEventListener('bluesteam:public-arrived', enterScene, { once: true });
      else enterScene();
    };
    const play = (selector: string, frames: Keyframe[], duration: number, delay = 0) => {
      element.querySelectorAll(selector).forEach(target => scope.play(target, frames, {
        duration, delay, easing: motionTiming.settle, fill: 'backwards',
      }));
    };
    let observer: IntersectionObserver | undefined;
    let layoutObserver: ResizeObserver | undefined;
    const measureFields = () => {
      element.querySelectorAll<HTMLElement>('.account-field').forEach(field => {
        const id = field.querySelector('input')?.id;
        // Include positioned ancestors: the centered form itself moves as rows change.
        if (id) fieldPositions.current.set(id, layoutTop(field));
      });
    };
    if (scene === 'landing') {
      const compact = matchMedia('(max-width: 600px)').matches;
      play('.shell-spiral', [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], compact ? 2600 : 780);
      play('.landing-hero-art', [{ opacity: .3, clipPath: compact ? 'inset(0 0 14% 0)' : 'inset(0 0 0 16%)' }, { opacity: 1, clipPath: 'inset(0)' }], compact ? 2000 : 850, 100);
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(entries => entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer?.unobserve(entry.target);
          if (media.matches) return;
          if (entry.target.classList.contains('landing-discover') || entry.target.classList.contains('landing-jelly-scene')) {
            play('.landing-jelly-scene', [{ clipPath: 'inset(0 0 16% 0)', opacity: .65 }, { clipPath: 'inset(0)', opacity: 1 }], compact ? 1800 : 700);
            if (compact) {
              element.querySelectorAll<SVGPathElement>('.jellyfish-study path:not([stroke-dasharray])').forEach((path, index) => {
                const length = path.getTotalLength();
                scope.play(path, [{ strokeDasharray: `${length}`, strokeDashoffset: length }, { strokeDasharray: `${length}`, strokeDashoffset: 0 }], {
                  duration: 2400, delay: 200 + index * 45, easing: motionTiming.settle, fill: 'backwards',
                });
              });
              return;
            }
            // The study and its labels converge across the desktop composition;
            // stacked mobile content stays in place so scrolling never chases text.
            const image = element.querySelector('.landing-jelly-scene')?.getBoundingClientRect();
            const copy = element.querySelector('.landing-discover-copy')?.getBoundingClientRect();
            const beside = image && copy && copy.left >= image.left + image.width * .6;
            play('.landing-discover-copy', [{ transform: `translateX(${beside ? -12 : 0}px)`, opacity: .65 }, { transform: 'none', opacity: 1 }], 480);
          } else if (entry.target.classList.contains('landing-discover-copy')) {
            play('.landing-discover-copy', [{ opacity: .65 }, { opacity: 1 }], 1400);
          } else if (entry.target.classList.contains('landing-together')) {
            if (compact) play('.landing-knowledge-object', [{ clipPath: 'inset(0 0 18% 0)', opacity: .6 }, { clipPath: 'inset(0)', opacity: 1 }], 1800);
            play('.landing-connection path', [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], compact ? 2400 : 800, compact ? 400 : 0);
          }
        }), { threshold: .18 });
        element.querySelectorAll(compact ? '.landing-jelly-scene, .landing-discover-copy, .landing-together' : '.landing-discover, .landing-together').forEach(target => observer?.observe(target));
      }
    } else if (scene === 'entry') {
      enterWhenReady();
    } else {
      enterWhenReady();
      // Existing fields follow their measured positions when registration adds rows.
      element.querySelectorAll<HTMLElement>('.account-field').forEach(field => {
        const id = field.querySelector('input')?.id;
        if (!id) return;
        const destination = layoutTop(field);
        const source = fieldPositions.current.get(id);
        if (source !== undefined && !first && !document.documentElement.dataset.publicJourney && !field.classList.contains('account-field--extra')) {
          const distance = source - destination;
          if (Math.abs(distance) > 1) scope.play(field, [
            { transform: `translateY(${distance}px)` }, { transform: 'none' },
          ], { duration: 600, easing: motionTiming.settle });
        }
        fieldPositions.current.set(id, destination);
      });
      if ('ResizeObserver' in window) {
        layoutObserver = new ResizeObserver(measureFields);
        const content = element.querySelector('.account-content');
        if (content) layoutObserver.observe(content);
      }
    }

    // Decorative drift uses one frame per pointer update and never React state.
    let frame = 0;
    const driftTargets = [...element.querySelectorAll<HTMLElement>('[data-artwork-drift]')];
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      driftTargets.forEach(target => {
        target.style.removeProperty('--drift-x'); target.style.removeProperty('--drift-y');
      });
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || media.matches || document.hidden) return;
      const target = event.currentTarget as HTMLElement;
      const { clientX, clientY } = event;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = target.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const travel = Math.min(14, bounds.width * .012);
        target.style.setProperty('--drift-x', `${(Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width)) - .5) * travel}px`);
        target.style.setProperty('--drift-y', `${(Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height)) - .5) * travel * .7}px`);
      });
    };
    const settle = () => {
      interrupted = true;
      stopScene?.();
      scope.cancel(); reset();
      if (scene === 'auth') measureFields();
    };
    const settleLayout = () => {
      settle();
      // Responsive role rails also have CSS transitions; finish them at the new layout.
      element.getAnimations?.({ subtree: true }).forEach(animation => animation.cancel());
    };
    const preference = () => { if (media.matches) settleLayout(); };
    const hidden = () => { if (document.hidden) settleLayout(); };
    const keyboard = (event: KeyboardEvent) => { if (event.key === 'Tab') settle(); };
    driftTargets.forEach(target => {
      target.addEventListener('pointermove', move);
      target.addEventListener('pointerleave', reset);
      target.addEventListener('pointercancel', reset);
    });
    media.addEventListener('change', preference);
    window.addEventListener('resize', settleLayout);
    document.addEventListener('visibilitychange', hidden);
    document.addEventListener('keydown', keyboard);
    element.addEventListener('focusin', settle);
    return () => {
      interrupted = true;
      stopScene?.();
      document.removeEventListener('bluesteam:public-arrived', enterScene);
      observer?.disconnect(); layoutObserver?.disconnect(); scope.dispose(); reset();
      driftTargets.forEach(target => {
        target.removeEventListener('pointermove', move);
        target.removeEventListener('pointerleave', reset);
        target.removeEventListener('pointercancel', reset);
      });
      media.removeEventListener('change', preference);
      window.removeEventListener('resize', settleLayout);
      document.removeEventListener('visibilitychange', hidden);
      document.removeEventListener('keydown', keyboard);
      element.removeEventListener('focusin', settle);
    };
  }, [root, scene, state]);
}
