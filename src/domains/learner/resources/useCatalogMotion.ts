import { useEffect, useRef, type RefObject } from 'react';
import { createMotionScope, motionTiming } from '../../../shared/ui/motion/motionScope';

/** Paging has a direction; search replaces content without moving the controls. */
export function useCatalogMotion(root: RefObject<HTMLElement | null>, key: string, page: number, loading: boolean, restored: boolean) {
  const previous = useRef({ key, page });
  useEffect(() => {
    if (loading) return;
    const old = previous.current;
    previous.current = { key, page };
    if (restored && old.key === key && old.page === page) return;
    const scope = createMotionScope();
    const direction = old.key === key && old.page !== page ? Math.sign(page - old.page) : 0;
    const content = root.current?.querySelector('.resource-group-list, .resource-tile-grid[aria-label]');
    scope.play(content, [{ opacity: .65, transform: `translateX(${direction * Math.min(32, (root.current?.clientWidth || 400) * .035)}px)` }, { opacity: 1, transform: 'none' }], { duration: direction ? 620 : 420, easing: motionTiming.settle });
    return () => scope.dispose();
  }, [root, key, page, loading, restored]);
}
