import { createMotionScope } from '../motion/motionScope';

/** Mobile uses compositor layers instead of allocating full-resolution page snapshots. */
export function startHomeMobileJourney(doc: Document, update: () => Promise<void>, x: number, y: number) {
  const win = doc.defaultView!;
  const scope = createMotionScope(win.matchMedia('(prefers-reduced-motion: reduce)'));
  let skipped = false;
  const animations: Animation[] = [];
  const updateCallbackDone = Promise.resolve().then(update);
  const ready = updateCallbackDone.then(() => {
    if (skipped || doc.hidden) return;
    const surface = doc.querySelector<HTMLElement>('.bluesteam-role-shell main,.account-page,.bluesteam-activity-shell');
    if (!surface) return;
    const play = (element: Element, frames: Keyframe[], duration: number, delay = 0) => {
      const animation = scope.play(element, frames, { duration, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
      if (animation) animations.push(animation);
    };
    // The interactive surface keeps its final geometry throughout the arrival.
    play(surface, [{ opacity: .65 }, { opacity: 1 }], 480);
    const visible = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < win.innerHeight;
    };
    const images = [...surface.querySelectorAll('img')].filter(visible).slice(0, 4);
    images.forEach((image, index) => {
      const rect = image.getBoundingClientRect();
      const direction = rect.left + rect.width / 2 < x ? -1 : 1;
      play(image, [{ scale: '1.035', translate: `${direction * 8}px ${rect.top < y ? -5 : 5}px`, opacity: .7 },
        { scale: '1', translate: '0px 0px', opacity: 1 }], 800, index * 55);
    });
    [...surface.querySelectorAll('h1,h2')].filter(visible).slice(0, 2).forEach((heading, index) => {
      play(heading, [{ translate: '0px 6px', opacity: .8 }, { translate: '0px 0px', opacity: 1 }], 280, index * 35);
    });
  });
  const finished = ready.then(async () => { await Promise.all(animations.map(animation => animation.finished.catch(() => {}))); }).finally(() => scope.dispose());
  return {
    updateCallbackDone, ready, finished,
    skipTransition() { skipped = true; scope.dispose(); },
  };
}
