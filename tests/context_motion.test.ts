import { describe, expect, it, vi } from 'vitest';
import { createMotionScope, rectTransform } from '../src/shared/ui/motion/motionScope';

describe('context motion lifecycle', () => {
  function fixture(reduced = false) {
    const listeners = new Set<() => void>();
    const media = { matches: reduced, addEventListener: (_: string, fn: () => void) => listeners.add(fn), removeEventListener: (_: string, fn: () => void) => listeners.delete(fn) };
    const animations: { cancel: ReturnType<typeof vi.fn>; finished: Promise<void> }[] = [];
    const element = { animate: vi.fn(() => { const a = { cancel: vi.fn(), finished: new Promise<void>(() => {}) }; animations.push(a); return a; }) };
    return { media, listeners, animations, element: element as unknown as HTMLElement, change: () => listeners.forEach(fn => fn()) };
  }
  it('replaces motion on the same object and releases listeners on disposal', () => {
    const f = fixture(), scope = createMotionScope(f.media as unknown as MediaQueryList);
    scope.play(f.element, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    scope.play(f.element, [{ opacity: .5 }, { opacity: 1 }], { duration: 120 });
    expect(f.animations[0].cancel).toHaveBeenCalledOnce();
    scope.dispose();
    expect(f.animations[1].cancel).toHaveBeenCalledOnce();
    expect(f.listeners.size).toBe(0);
  });
  it('cancels running motion when reduced motion changes and skips future motion', () => {
    const f = fixture(), scope = createMotionScope(f.media as unknown as MediaQueryList);
    scope.play(f.element, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    f.media.matches = true; f.change();
    expect(f.animations[0].cancel).toHaveBeenCalledOnce();
    expect(scope.play(f.element, [], { duration: 200 })).toBeNull();
    expect(f.animations.length).toBe(1);
    scope.dispose();
  });
  it('keeps content usable without WAAPI or after disposal', () => {
    const f = fixture(true), scope = createMotionScope(f.media as unknown as MediaQueryList);
    expect(scope.play(f.element, [], {})).toBeNull();
    f.media.matches = false;
    expect(scope.play({} as HTMLElement, [], {})).toBeNull();
    scope.dispose();
    expect(scope.play(f.element, [], {})).toBeNull();
  });
  it('maps actual source geometry to the destination and rejects hidden rectangles', () => {
    expect(rectTransform({ left: 20, top: 40, width: 100, height: 80 }, { left: 200, top: 100, width: 400, height: 320 })).toBe('translate(-180px, -60px) scale(0.25, 0.25)');
    expect(rectTransform({ left: 0, top: 0, width: 0, height: 80 }, { left: 0, top: 0, width: 400, height: 320 })).toBeNull();
  });
});
