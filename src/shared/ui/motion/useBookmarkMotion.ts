import { useEffect, useRef } from 'react';
import { createMotionScope, motionTiming } from './motionScope';

export function useBookmarkMotion(saved: boolean, identity: string) {
  const button = useRef<HTMLButtonElement>(null);
  const previous = useRef({ saved, identity });
  useEffect(() => {
    const old = previous.current; previous.current = { saved, identity };
    if (old.identity !== identity || old.saved === saved) return;
    const scope = createMotionScope();
    const animation = scope.play(button.current?.querySelector('svg'), [{ transform: `translateY(${saved ? -5 : 3}px)` }, { transform: 'none' }], { duration: saved ? 240 : motionTiming.respond, easing: motionTiming.settle });
    const host = button.current?.closest('.resource-library,.learner-profile,.teacher-resource-library');
    const covered = (event: Event) => { if (event.target instanceof Element && event.target.closest('button[aria-haspopup="dialog"]')) scope.cancel(); };
    const detach = () => host?.removeEventListener('click', covered, true);
    if (animation) { host?.addEventListener('click', covered, true); void animation.finished.then(detach, detach); }
    return () => { detach(); scope.dispose(); };
  }, [saved, identity]);
  return button;
}
