import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { createMotionScope } from './motionScope';
import { interactiveMotion, placementFrames } from './interactiveMotion';

export function useInteractiveMotionScope() {
  const scope = useRef<ReturnType<typeof createMotionScope> | null>(null);
  useLayoutEffect(() => {
    const current = createMotionScope(); scope.current = current;
    const cancel = () => current.cancel();
    const hidden = () => { if (document.hidden) cancel(); };
    window.addEventListener('resize', cancel);
    document.addEventListener('visibilitychange', hidden);
    return () => { current.dispose(); scope.current = null; window.removeEventListener('resize', cancel); document.removeEventListener('visibilitychange', hidden); };
  }, []);
  return scope;
}

/** Feedback on the sound icon acknowledges the request; it does not imply audio is playing. */
export function useInteractiveAudioMotion(root: RefObject<HTMLElement | null>) {
  const scope = useInteractiveMotionScope();
  useEffect(() => {
    const host = root.current;
    const clicked = (event: MouseEvent) => {
      const button = event.target instanceof Element ? event.target.closest('button') : null;
      if (!event.detail || !button || button.disabled || !button.getAttribute('aria-label')?.startsWith('Nghe')) return;
      if (button.closest('.interactive-activity-motion') && !host?.matches('.interactive-activity-motion')) return;
      scope.current?.play(button.querySelector('svg'), [{scale:'1'},{scale:'1.12',offset:.35},{scale:'1'}], {duration:220,easing:interactiveMotion.settle});
    };
    host?.addEventListener('click', clicked);
    return () => host?.removeEventListener('click', clicked);
  }, [root, scope]);
}

/** Animate only the newly placed animal, from its actual tray position to its actual habitat. */
export function usePlacementMotion(root: RefObject<HTMLElement | null>, placed: Record<string,string>, paused: boolean) {
  const scope = useInteractiveMotionScope();
  const origins = useRef(new Map<string, DOMRect>());
  useLayoutEffect(() => {
    if (paused) { scope.current?.cancel(); origins.current.clear(); return; }
    for (const [id, rect] of origins.current) {
      if (!placed[id]) continue;
      const resident = [...(root.current?.querySelectorAll<HTMLImageElement>('[data-resident-id]') || [])].find(el => el.dataset.residentId === id);
      if (resident) {
        const travel = placementFrames(rect, resident.getBoundingClientRect());
        if (travel) scope.current?.play(resident, travel.frames, {duration:travel.duration,easing:interactiveMotion.travel});
      }
      origins.current.delete(id);
    }
    if (!Object.keys(placed).length) { scope.current?.cancel(); origins.current.clear(); }
  }, [placed, paused, root, scope]);
  return (id: string) => {
    const button = [...(root.current?.querySelectorAll<HTMLElement>('[data-sorting-object]') || [])].find(el => el.dataset.sortingObject === id);
    const image = button?.querySelector('img');
    if (image) origins.current.set(id, image.getBoundingClientRect());
  };
}
