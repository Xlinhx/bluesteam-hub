import { describe, expect, it } from 'vitest';
import { anchorVector, travelDuration, galleryGeometry } from '../src/shared/ui/home/homeMotionGeometry';
import { createMotionScope } from '../src/shared/ui/home/homeMotionScope';

describe('motion geometry', () => {
  it('follows actual centers, bounds movement, and adapts when a row becomes a column', () => {
    const card = { left: 400, top: 200, width: 100, height: 80 };
    const horizontal = anchorVector(card, { ...card, left: 0 });
    expect(horizontal).toEqual({ x: -18, y: 0 });
    const stacked = anchorVector(card, { ...card, top: 0 });
    expect(stacked).toEqual({ x: 0, y: -18 });
    expect(anchorVector(card, card)).toEqual({ x: 0, y: 0 });
    const diagonal = anchorVector(card, { ...card, left: 0, top: 0 });
    expect(Math.hypot(diagonal.x, diagonal.y)).toBeCloseTo(18);
  });
  it('keeps frequent teacher actions short and bounds long trips', () => {
    expect(travelDuration(20, 'teacher')).toBeLessThan(travelDuration(20, 'learner'));
    expect(travelDuration(100000, 'teacher')).toBe(420);
    expect(travelDuration(100000, 'learner')).toBe(780);
  });
  it('anchors the gallery to the actual selected thumbnail on desktop and stacked layouts', () => {
    const desktop = galleryGeometry({ left: 600, top: 100, width: 800, height: 400 }, { left: 350, top: 520, width: 300, height: 120 });
    expect(desktop.originY).toBeGreaterThan(100);
    expect(desktop.originX).toBeGreaterThanOrEqual(15);
    const mobile = galleryGeometry({ left: 12, top: 80, width: 366, height: 220 }, { left: 250, top: 480, width: 100, height: 100 });
    expect(mobile.originX).toBeGreaterThan(desktop.originX);
    expect(mobile.angle).toBeLessThanOrEqual(14);
    expect(galleryGeometry({ left: 0, top: 0, width: 0, height: 0 }, { left: 0, top: 0, width: 0, height: 0 })).toBeNull();
  });
});

function fixture() {
  const media = Object.assign(new EventTarget(), { matches: false });
  const doc = Object.assign(new EventTarget(), { hidden: false, activeElement: null });
  const win = Object.assign(new EventTarget(), { matchMedia: () => media });
  Object.assign(doc, { defaultView: win });
  const root = Object.assign(new EventTarget(), { ownerDocument: doc, dataset: {} });
  const animations: Array<{ cancel: ReturnType<typeof import('vitest').vi.fn>; onfinish?: () => void; oncancel?: () => void }> = [];
  const target = { animate: () => {
    const animation = { cancel: vi.fn(() => animation.oncancel?.()), finished: new Promise<void>(() => {}), onfinish: undefined as (() => void) | undefined, oncancel: undefined as (() => void) | undefined };
    animations.push(animation); return animation;
  }};
  return { media, doc, win, root: root as unknown as HTMLElement, target: target as unknown as HTMLElement, animations };
}
import { vi } from 'vitest';

describe('scoped motion lifetime', () => {
  it('replaces an in-flight animation on the same element without accumulating timelines', () => {
    const f = fixture(), scope = createMotionScope(f.root);
    scope.play(f.target, [{ opacity: .8 }, { opacity: 1 }], { duration: 160 });
    scope.play(f.target, [{ opacity: .9 }, { opacity: 1 }], { duration: 160 });
    expect(f.animations[0].cancel).toHaveBeenCalledOnce();
    scope.dispose();
    expect(f.animations[1].cancel).toHaveBeenCalledOnce();
    scope.play(f.target, [], { duration: 160 });
    expect(f.animations).toHaveLength(2);
  });
  it('settles immediately for reduced motion, keyboard, resize and hidden documents', () => {
    const f = fixture(), scope = createMotionScope(f.root);
    scope.play(f.target, [{ opacity: .8 }, { opacity: 1 }], { duration: 160 });
    f.media.matches = true; f.media.dispatchEvent(new Event('change'));
    expect(f.animations[0].cancel).toHaveBeenCalledOnce();
    scope.play(f.target, [], { duration: 160 });
    expect(f.animations).toHaveLength(1);
    f.media.matches = false; f.doc.dispatchEvent(new Event('keydown'));
    scope.play(f.target, [], { duration: 160 });
    expect(f.animations).toHaveLength(1);
    f.doc.dispatchEvent(new Event('pointerdown'));
    scope.play(f.target, [], { duration: 160 });
    f.win.dispatchEvent(new Event('resize'));
    expect(f.animations[1].cancel).toHaveBeenCalledOnce();
    f.doc.hidden = true;
    scope.play(f.target, [], { duration: 160 });
    expect(f.animations).toHaveLength(2);
    scope.dispose();
  });
  it('shows the final CSS state after finish and supports browsers without WAAPI', () => {
    const f = fixture(), scope = createMotionScope(f.root);
    scope.play(f.target, [{ opacity: .8 }, { opacity: 1 }], { duration: 160 });
    f.animations[0].onfinish?.();
    expect(f.animations[0].cancel).toHaveBeenCalledOnce();
    expect(() => scope.play({} as HTMLElement, [], { duration: 160 })).not.toThrow();
    scope.dispose();
  });
});
