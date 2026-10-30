import { describe, it, expect, vi } from 'vitest';
import { isOceanScene, isInteractiveScene, transitionOceanScene } from '../src/shared/ui/motion/oceanNavigation';

describe('ocean scene navigation', () => {
  it('owns Interactive catalogs and activity routes without claiming unrelated routes', async () => {
    for (const path of ['/interactive', '/interactive/activities/fish', '/teacher/interactive']) expect(isInteractiveScene(path)).toBe(true);
    expect(isInteractiveScene('/interactive-other')).toBe(false);
    const done=Promise.resolve(), dataset:Record<string,string>={};
    const commit=vi.fn();
    const doc={documentElement:{dataset},startViewTransition:vi.fn((update:()=>void)=>{update();return {finished:done,ready:done,updateCallbackDone:done,skipTransition:vi.fn()};})};
    transitionOceanScene('/interactive','/interactive/activities/fish',commit,false,doc as any);
    expect(dataset.interactiveJourney).toBe('forward');expect(commit).toHaveBeenCalledOnce();
    await done;await Promise.resolve();expect(dataset.interactiveJourney).toBeUndefined();
  });
  it('identifies resource and profile concepts without claiming other domains', () => {
    expect(isOceanScene('/resources/abc')).toBe(true);
    expect(isOceanScene('/profile')).toBe(true);
    expect(isOceanScene('/teacher/resources')).toBe(true);
    for (const path of ['/home', '/interactive', '/creative', '/teacher', '/resources-other']) expect(isOceanScene(path)).toBe(false);
  });
  it('commits synchronously for reduced motion, other routes and unsupported browsers', () => {
    const commit = vi.fn();
    transitionOceanScene('/resources', '/profile', commit, false, undefined);
    expect(commit).toHaveBeenCalledOnce();
    const start = vi.fn();
    transitionOceanScene('/resources', '/profile', commit, true, { documentElement: { dataset: {} }, startViewTransition: start } as any);
    transitionOceanScene('/home', '/interactive', commit, false, { documentElement: { dataset: {} }, startViewTransition: start } as any);
    expect(start).not.toHaveBeenCalled();
    expect(commit).toHaveBeenCalledTimes(3);
  });
  it('commits once inside the browser snapshot update and marks the scene direction', async () => {
    const commit = vi.fn(), dataset: Record<string, string> = {};
    const done = Promise.resolve();
    const doc = { documentElement: { dataset }, startViewTransition: vi.fn((update: () => void) => { update(); return { finished: done, updateCallbackDone: done, ready: done, skipTransition: vi.fn() }; }) };
    transitionOceanScene('/resources', '/profile', commit, false, doc as any, 'back');
    expect(commit).toHaveBeenCalledOnce();
    expect(dataset.oceanTransition).toBe('back');
    await done; await Promise.resolve();
    expect(dataset.oceanTransition).toBeUndefined();
  });
  it('ignores an outdated snapshot callback when the user navigates again', () => {
    const updates: (() => void)[] = [], skip = vi.fn();
    const pending = new Promise(() => {});
    const doc = { documentElement: { dataset: {} }, startViewTransition: (update: () => void) => { updates.push(update); return { finished: pending, ready: pending, updateCallbackDone: pending, skipTransition: skip }; } };
    const first = vi.fn(), second = vi.fn();
    transitionOceanScene('/resources', '/profile', first, false, doc as any);
    transitionOceanScene('/resources', '/resources/abc', second, false, doc as any);
    updates[0](); updates[1]();
    expect(first).not.toHaveBeenCalled(); expect(second).toHaveBeenCalledOnce();
    expect(skip).toHaveBeenCalled();
  });
});
