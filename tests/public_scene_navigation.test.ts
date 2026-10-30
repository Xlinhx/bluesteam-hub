import { describe, expect, it, vi } from 'vitest';
import { transitionOceanScene } from '../src/shared/ui/motion/oceanNavigation';

describe('public journey snapshots', () => {
  it('preserves an outgoing entry scene until login commits inside the native snapshot', async () => {
    const commit = vi.fn(), dataset: Record<string, string> = {};
    let update = () => {};
    let finish = () => {};
    const finished = new Promise<void>(resolve => { finish = resolve; });
    const doc = { documentElement: { dataset }, startViewTransition: vi.fn((callback: () => void) => {
      update = callback; return { finished, updateCallbackDone: Promise.resolve(), ready: Promise.resolve(), skipTransition: vi.fn() };
    }) };
    transitionOceanScene('/entry', '/login', commit, false, doc as any);
    expect(doc.startViewTransition).toHaveBeenCalledOnce();
    expect(commit).not.toHaveBeenCalled();
    expect(dataset.publicJourney).toBe('forward');
    update(); expect(commit).toHaveBeenCalledOnce();
    finish(); await finished; await Promise.resolve(); await Promise.resolve();
    expect(dataset.publicJourney).toBeUndefined();
  });
  it('keeps public navigation immediate with reduced motion or missing snapshot support', () => {
    const commit = vi.fn(), startViewTransition = vi.fn();
    transitionOceanScene('/entry', '/login', commit, true, { documentElement: { dataset: {} }, startViewTransition } as any);
    transitionOceanScene('/login', '/entry', commit, false, undefined, 'back');
    expect(commit).toHaveBeenCalledTimes(2);
    expect(startViewTransition).not.toHaveBeenCalled();
  });
});
