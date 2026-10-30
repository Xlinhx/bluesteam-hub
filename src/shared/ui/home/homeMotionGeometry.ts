/** Home geometry is read once per transition, never in a render/frame loop. */
export type MotionRect = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;

export const MOTION = {
  press: 100, feedback: 160, select: 220, panel: 280, discover: 640,
  respond: 'cubic-bezier(.22,1,.36,1)',
  travel: 'cubic-bezier(.32,.72,0,1)',
} as const;

export function anchorVector(target: MotionRect, anchor: MotionRect, limit = 18) {
  const x = anchor.left + anchor.width / 2 - target.left - target.width / 2;
  const y = anchor.top + anchor.height / 2 - target.top - target.height / 2;
  const distance = Math.hypot(x, y);
  const ratio = distance ? Math.min(limit / distance, 1) : 0;
  return { x: x * ratio, y: y * ratio };
}

export function travelDuration(distance: number, role: 'learner' | 'teacher') {
  return Math.round(Math.min(role === 'teacher' ? 420 : 780, (role === 'teacher' ? 220 : 480) + Math.sqrt(Math.max(0, distance)) * 9));
}

export function galleryGeometry(gallery: MotionRect, thumbnail: MotionRect) {
  if (![gallery.width, gallery.height, thumbnail.width, thumbnail.height].every(n => Number.isFinite(n) && n > 0)) return null;
  const centerX = thumbnail.left + thumbnail.width / 2;
  return {
    originX: Math.min(85, Math.max(15, (centerX - gallery.left) / gallery.width * 100)),
    originY: Math.max(100, (thumbnail.top + thumbnail.height / 2 - gallery.top) / gallery.height * 100),
    angle: Math.min(14, Math.max(6, Math.atan2(thumbnail.width, gallery.height) * 180 / Math.PI * .4)),
  };
}
