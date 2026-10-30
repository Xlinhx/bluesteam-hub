/** One animation per object; underlying DOM always represents the final state. */
export function createMotionScope(media = window.matchMedia('(prefers-reduced-motion: reduce)')) {
  const active = new Map<Element, Animation>();
  let disposed = false;
  const cancel = (target?: Element) => {
    for (const [element, animation] of active) if (!target || element === target || element.contains(target)) { animation.cancel(); active.delete(element); }
  };
  const changed = () => { if (media.matches) cancel(); };
  media.addEventListener('change', changed);
  return {
    play(element: Element | null | undefined, frames: Keyframe[], options: KeyframeAnimationOptions) {
      if (!element) return null;
      active.get(element)?.cancel();
      active.delete(element);
      if (disposed || media.matches || typeof element.animate !== 'function') return null;
      const animation = element.animate(frames, options);
      active.set(element, animation);
      const release = () => { if (active.get(element) === animation) active.delete(element); };
      void animation.finished.then(release, release);
      return animation;
    },
    cancel,
    dispose() { disposed = true; cancel(); media.removeEventListener('change', changed); },
  };
}

type Rect = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
export function rectTransform(source: Rect, destination: Rect) {
  if (![source.width, source.height, destination.width, destination.height].every(n => Number.isFinite(n) && n > 0)) return null;
  return `translate(${source.left - destination.left}px, ${source.top - destination.top}px) scale(${source.width / destination.width}, ${source.height / destination.height})`;
}

export const motionTiming = {
  respond: 160,
  panel: 420,
  spatial: 680,
  settle: 'cubic-bezier(.22,1,.36,1)',
};
