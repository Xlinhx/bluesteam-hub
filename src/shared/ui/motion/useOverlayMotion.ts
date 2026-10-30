import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { createMotionScope, motionTiming, rectTransform } from './motionScope';

/** Closing is interruptible and never holds up saves or navigation by a parent. */
export function useOverlayMotion(panel: RefObject<HTMLElement | null>, onClose: () => void, options: { drawer?: boolean; source?: HTMLElement | null; preview?: string; fullScreen?: boolean; profile?: 'creative-sea' } = {}) {
  const close = useRef(onClose); close.current = onClose;
  const settings = useRef(options); settings.current = options;
  const scope = useRef<ReturnType<typeof createMotionScope> | null>(null);
  const closing = useRef(false);
  const alive = useRef(false);
  const frames = useCallback((): { element: HTMLElement; frames: Keyframe[] } | null => {
    const host = panel.current;
    if (!host) return null;
    const { source, preview, drawer, fullScreen,profile } = settings.current;
    if(profile==='creative-sea')return {element:host,frames:[{clipPath:'inset(5% 0 5% 0 round 20px)'},{clipPath:'inset(0 0 0 0 round 20px)'}]};
    const target = preview ? host.querySelector<HTMLElement>(preview) : null;
    if (source?.isConnected && target) {
      const rect = source.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const transform = rectTransform(rect, target.getBoundingClientRect());
        if (transform) return { element: target, frames: [{ transform, transformOrigin: 'top left', opacity: .7 }, { transform: 'none', transformOrigin: 'top left', opacity: 1 }] };
      }
    }
    return { element: host, frames: fullScreen ? [{ opacity: .6 }, { opacity: 1 }] : [{ opacity: .6, transform: drawer ? `translateX(${Math.min(host.clientWidth * .1, 40)}px)` : 'translateY(12px)' }, { opacity: 1, transform: 'none' }] };
  }, [panel]);
  useEffect(() => {
    alive.current = true; closing.current = false;
    const current = createMotionScope(); scope.current = current;
    const frame = requestAnimationFrame(() => {
      if (closing.current) return;
      const motion = frames();
      if (motion) current.play(motion.element, motion.frames, { duration: settings.current.profile==='creative-sea'?520:settings.current.preview ? motionTiming.spatial : motionTiming.panel, easing: motionTiming.settle });
    });
    const resized = () => current.cancel();
    window.addEventListener('resize', resized);
    return () => { alive.current = false; cancelAnimationFrame(frame); current.dispose(); window.removeEventListener('resize', resized); };
  }, [frames]);
  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const host = panel.current;
    const visual = settings.current.preview ? host?.querySelector<HTMLElement>(settings.current.preview) || host : host;
    const computed = visual ? getComputedStyle(visual) : null;
    // Snapshot values, then release the entrance before measuring layout geometry.
    // getBoundingClientRect includes the animated scale/translation otherwise.
    const initial = computed ? { opacity: computed.opacity, transform: computed.transform, transformOrigin: computed.transformOrigin,...(settings.current.profile==='creative-sea'?{clipPath:computed.clipPath}:{}) } : {};
    scope.current?.cancel();
    const motion = frames();
    const animation = motion && scope.current?.play(motion.element, [motion.element === visual ? initial : { opacity: getComputedStyle(motion.element).opacity }, motion.frames[0]], { duration: settings.current.profile==='creative-sea'?340:settings.current.preview ? 480 : 300, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    if (!animation) { closing.current = false; close.current(); return; }
    const finish = () => {
      if (!alive.current) return;
      // A consumer may refuse closing while saving. Restore its usable CSS state.
      animation.cancel(); closing.current = false; close.current();
    };
    void animation.finished.then(finish, finish);
  }, [frames, panel]);
  return Object.assign(requestClose, { isClosing: () => closing.current });
}
