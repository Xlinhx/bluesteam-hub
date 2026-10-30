import { MOTION } from './homeMotionGeometry';
import { createMotionScope as createObjectMotion } from '../motion/motionScope';

// Survives route unmounts: keyboard navigation must not start a pointer intro.
let input: 'pointer' | 'keyboard' = 'pointer';

/** Owns only its own timelines. CSS always contains the usable final state. */
export function createMotionScope(root: HTMLElement) {
  const doc = root.ownerDocument, win = doc.defaultView!;
  const media = win.matchMedia('(prefers-reduced-motion: reduce)');
  const objects = createObjectMotion(media);
  let disposed = false;
  const allowed = () => !disposed && !media.matches && !doc.hidden && input !== 'keyboard';
  const stop = () => objects.cancel();
  const keyboard = () => { input = 'keyboard'; root.dataset.motionInput = input; stop(); };
  const pointer = () => { input = 'pointer'; root.dataset.motionInput = input; stop(); };
  const visibility = () => { if (doc.hidden) stop(); };
  const preference = () => { root.dataset.motion = media.matches ? 'reduced' : 'ready'; stop(); };
  root.dataset.motionInput = input;
  root.dataset.motion = media.matches ? 'reduced' : 'ready';
  doc.addEventListener('keydown', keyboard, true);
  doc.addEventListener('pointerdown', pointer, true);
  doc.addEventListener('visibilitychange', visibility);
  win.addEventListener('resize', stop);
  media.addEventListener('change', preference);
  return {
    allowed, stop,
    play(element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) {
      if (!allowed() || typeof element.animate !== 'function') return;
      const animation = objects.play(element, frames, { easing: MOTION.respond, fill: 'both', ...options });
      if (!animation) return;
      animation.onfinish = () => animation.cancel();
      return animation;
    },
    dispose() {
      disposed = true; objects.dispose();
      doc.removeEventListener('keydown', keyboard, true);
      doc.removeEventListener('pointerdown', pointer, true);
      doc.removeEventListener('visibilitychange', visibility);
      win.removeEventListener('resize', stop);
      media.removeEventListener('change', preference);
    },
  };
}
