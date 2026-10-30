import { describe, expect, it, vi } from 'vitest';
import { homeChoreography } from '../src/shared/ui/home/homeChoreography';
import { journeyRadius } from '../src/shared/ui/home/homeJourney';
import { transitionOceanScene } from '../src/shared/ui/motion/oceanNavigation';

describe('Home expressive choreography', () => {
  for (const role of ['learner', 'teacher'] as const) {
    it(`${role} coordinates background, imagery, copy, labels and icons over distinct beats`, () => {
      const cues = homeChoreography(role);
      expect(cues.length).toBeGreaterThanOrEqual(9);
      expect(cues.some(cue => cue.selector.includes('home-water'))).toBe(true);
      expect(cues.some(cue => cue.selector.includes('h1') || cue.selector.includes('h2'))).toBe(true);
      expect(cues.some(cue => cue.selector.includes('svg'))).toBe(true);
      expect(Math.max(...cues.map(cue => cue.duration))).toBeGreaterThanOrEqual(1700);
      expect(Math.min(...cues.map(cue => cue.duration))).toBeLessThan(900);
    });
  }
  it('covers all viewport corners from the actual selected card, including edge origins', () => {
    expect(journeyRadius(0, 0, 1440, 900)).toBeCloseTo(Math.hypot(1440, 900));
    expect(journeyRadius(720, 450, 1440, 900)).toBeCloseTo(Math.hypot(720, 450));
    expect(journeyRadius(350, 700, 390, 844)).toBeGreaterThan(700);
  });
  it('commits inside an existing Home snapshot without starting a competing resource transition', () => {
    const commit = vi.fn(), startViewTransition = vi.fn();
    const dataset = { homeJourney: 'opening' };
    transitionOceanScene('/teacher', '/teacher/resources', commit, false, { documentElement: { dataset }, startViewTransition } as any);
    expect(commit).toHaveBeenCalledOnce();
    expect(startViewTransition).not.toHaveBeenCalled();
    expect(dataset.homeJourney).toBe('opening');
  });
  it('keeps a keyboard exit from Home instant even when the destination owns a snapshot', () => {
    const commit = vi.fn(), startViewTransition = vi.fn();
    transitionOceanScene('/teacher', '/teacher/resources', commit, false, { documentElement: { dataset: { homeJourney: 'instant' } }, startViewTransition } as any);
    expect(commit).toHaveBeenCalledOnce();
    expect(startViewTransition).not.toHaveBeenCalled();
  });
});
