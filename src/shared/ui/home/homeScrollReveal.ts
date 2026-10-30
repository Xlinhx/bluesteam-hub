import { homeChoreography, type HomeRole } from './homeChoreography';
import type { createMotionScope } from './homeMotionScope';

/** Offscreen mobile artwork gets one quiet arrival, without hiding content or moving controls. */
export function installHomeScrollReveal(root: HTMLElement, role: HomeRole, scope: ReturnType<typeof createMotionScope>) {
  const win = root.ownerDocument.defaultView!;
  if (win.innerWidth >= 768 || typeof win.IntersectionObserver !== 'function') return () => {};
  const media = win.matchMedia('(prefers-reduced-motion: reduce)');
  const pending = new Set<Element>();
  const observer = new win.IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < .15) continue;
      observer.unobserve(entry.target); pending.delete(entry.target);
      if (!scope.allowed()) continue;
      const image = entry.target.matches('img');
      scope.play(entry.target, image
        ? [{ scale: '1.045', translate: '0px 8px' }, { scale: '1', translate: '0px 0px' }]
        : [{ translate: '0px 8px', opacity: .55 }, { translate: '0px 0px', opacity: 1 }],
      { duration: image ? 950 : 650 });
    }
    if (!pending.size) observer.disconnect();
  }, { threshold: .15, rootMargin: '0px 0px -64px 0px' });
  // Background planes belong to the opening scene; observe only real content artwork/labels.
  for (const cue of homeChoreography(role)) {
    if (!/selector|domain|shortcut/.test(cue.selector) || cue.selector.includes('> svg')) continue;
    for (const element of root.querySelectorAll(cue.selector)) {
      const rect = element.getBoundingClientRect();
      if (rect.width && rect.height && rect.top >= win.innerHeight) {
        pending.add(element); observer.observe(element);
      }
    }
  }
  const disconnect = () => { observer.disconnect(); pending.clear(); };
  const preference = () => { if (media.matches) disconnect(); };
  media.addEventListener('change', preference);
  return () => { disconnect(); media.removeEventListener('change', preference); };
}
