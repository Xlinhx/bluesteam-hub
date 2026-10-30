import { useEffect, useRef } from 'react';
import { createMotionScope, motionTiming } from '../../../shared/ui/motion/motionScope';

/** Capture only the committing control, including controls inside a modal. */
export function ResourceMotion({ groupId, success, targetGroup, actionId }: { groupId: string; success: string; targetGroup: string; actionId: number }) {
  const root = useRef<HTMLDivElement>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const host = root.current?.closest('.teacher-resource-library');
    const commit = (event: Event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>('button[data-resource-transfer]');
      if (!button || button.disabled) return;
      const rect = button.getBoundingClientRect();
      origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };
    host?.addEventListener('click', commit, true);
    return () => host?.removeEventListener('click', commit, true);
  }, []);
  useEffect(() => {
    if (!success || !targetGroup) return;
    const scope = createMotionScope();
    const host = root.current?.closest('.teacher-resource-library');
    const group = [...(host?.querySelectorAll<HTMLElement>('[data-group-id]') || [])].find(node => node.dataset.groupId === targetGroup);
    const destination = group?.querySelector('.teacher-group-count') || host?.querySelector(targetGroup === groupId ? '.teacher-resource-title h2' : '.resource-save-notice');
    const start = origin.current; origin.current = null;
    const rect = destination?.getBoundingClientRect();
    let resized: (() => void) | undefined;
    if (rect && start && rect.bottom > 0 && rect.top < innerHeight) {
      const endX = rect.left + rect.width / 2, endY = rect.top + rect.height / 2;
      const dx = endX - start.x, dy = endY - start.y;
      scope.play(root.current?.querySelector('.resource-transfer-token'), [
        { transform: `translate(${start.x}px, ${start.y}px)`, opacity: 0, offset: 0 },
        { transform: `translate(${start.x + dx * .45}px, ${start.y + dy * .45 - Math.min(48, Math.abs(dx) * .12)}px)`, opacity: 1, offset: .45 },
        { transform: `translate(${endX}px, ${endY}px)`, opacity: 0, offset: 1 },
      ], { duration: 480, easing: motionTiming.settle });
      resized = () => scope.cancel();
      window.addEventListener('resize', resized);
      window.addEventListener('scroll', resized, true);
    }
    scope.play(destination, [{ outline: '0px solid transparent' }, { outline: '3px solid #68aeb5', offset: .6 }, { outline: '0px solid transparent' }], { duration: 540 });
    return () => { scope.dispose(); if (resized) { window.removeEventListener('resize', resized); window.removeEventListener('scroll', resized, true); } };
  }, [success, targetGroup, groupId, actionId]);
  return <div ref={root} className="resource-motion" aria-hidden="true"><span className="resource-transfer-token">✓</span></div>;
}
