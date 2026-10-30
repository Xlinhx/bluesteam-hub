import { galleryGeometry, travelDuration } from './homeMotionGeometry';

/** Set geometry before React changes the selected slide; CSS retargets from its current frame. */
export function prepareHomeGallery(root: HTMLElement | null, index: number, keyboard: boolean) {
  const gallery = root?.querySelector<HTMLElement>('.home-feature-gallery');
  const target = root?.querySelectorAll('.home-selector')[index];
  if (!gallery || !target) return;
  const previous = root?.querySelector('.home-selector[aria-selected=true]');
  const rect = target.getBoundingClientRect();
  const old = previous?.getBoundingClientRect() || rect;
  const geometry = galleryGeometry(gallery.getBoundingClientRect(), rect);
  if (!geometry) return;
  const distance = Math.hypot(rect.left - old.left, rect.top - old.top);
  gallery.style.setProperty('--home-gallery-origin', `${geometry.originX}% ${geometry.originY}%`);
  gallery.style.setProperty('--home-gallery-angle', `${geometry.angle}deg`);
  gallery.style.setProperty('--home-gallery-duration', keyboard ? '0ms' : `${travelDuration(distance, 'learner')}ms`);
}
