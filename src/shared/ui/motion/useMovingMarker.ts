import { useLayoutEffect, useRef } from 'react';
import { createMotionScope, motionTiming } from './motionScope';

/** Retarget a decorative marker from its current painted position after the selection commits. */
export function useMovingMarker<T extends HTMLElement = HTMLSpanElement>(selection: string | number, axis: 'x' | 'y', maximum: number, pace: 'responsive' | 'glide' = 'responsive') {
  const marker = useRef<T>(null);
  const source = useRef<DOMRect | null>(null);
  const scope = useRef<ReturnType<typeof createMotionScope> | null>(null);

  useLayoutEffect(() => {
    const motion = createMotionScope();
    scope.current = motion;
    const reset = () => { source.current = null; motion.cancel(); };
    window.addEventListener('resize', reset);
    return () => {
      window.removeEventListener('resize', reset);
      source.current = null;
      scope.current = null;
      motion.dispose();
    };
  }, []);

  useLayoutEffect(() => {
    const before = source.current;
    source.current = null;
    scope.current?.cancel();
    const node = marker.current;
    if (!before || !node) return;
    const after = node.getBoundingClientRect();
    const offset = axis === 'x' ? before.left - after.left : before.top - after.top;
    if (Math.abs(offset) < 1) return;
    const translate = axis === 'x' ? `${offset}px 0px` : `0px ${offset}px`;
    const glide = pace === 'glide';
    const duration = Math.min(maximum, glide ? 275 + Math.abs(offset) * .8 : motionTiming.respond + Math.abs(offset) * .55);
    scope.current?.play(node, [{ translate }, { translate: '0px 0px' }], {
      duration, easing: glide ? 'cubic-bezier(.33,.68,.23,1)' : motionTiming.settle,
    });
  }, [selection, axis, maximum, pace]);

  return {
    marker,
    prepare(pointer: boolean) {
      source.current = pointer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? marker.current?.getBoundingClientRect() ?? null : null;
    },
  };
}
