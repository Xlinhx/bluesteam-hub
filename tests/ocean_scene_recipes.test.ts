import { expect, it } from 'vitest';
import { oceanSceneCue } from '../src/shared/ui/motion/oceanSceneRecipes';

it('keeps teacher rows stable while learner images follow their spatial anchor', () => {
  const geometry = { dx: 300, dy: 90, compact: false, opacity: '1' };
  const teacher = oceanSceneCue('teacher', 'image', geometry);
  const learner = oceanSceneCue('library', 'image', geometry);
  expect(teacher.frames.every(frame => !frame.transform)).toBe(true);
  expect(learner.frames[0].transform).toContain('perspective');
  expect(teacher.duration).toBeLessThan(learner.duration);
  expect(teacher.easing).not.toBe(learner.easing);
});
it('gives collection artworks a paper-settling motion and details a focus reveal', () => {
  const geometry = { dx: -220, dy: 50, compact: false, opacity: '.85' };
  const profile = oceanSceneCue('profile', 'image', geometry);
  const detail = oceanSceneCue('detail', 'image', geometry);
  expect(profile.frames[0].transform).toContain('rotate(');
  expect(detail.frames[0].clipPath).toBeDefined();
  expect(detail.frames[0].transform).toBeUndefined();
  expect(profile.frames.at(-1)?.opacity).toBe('.85');
});
it('reduces mobile travel, bounds geometric delays and never clips functional controls', () => {
  const far = { dx: 100000, dy: 100000, compact: false, opacity: '1' };
  const desktop = oceanSceneCue('library', 'image', far);
  const mobile = oceanSceneCue('library', 'image', { ...far, compact: true });
  expect(desktop.delay).toBeLessThanOrEqual(300);
  expect(mobile.duration).toBeLessThan(desktop.duration);
  for (const scene of ['teacher', 'library', 'profile', 'detail'] as const) {
    const tools = oceanSceneCue(scene, 'tools', far);
    expect(tools.frames.every(frame => !frame.transform && !frame.clipPath)).toBe(true);
  }
});

it('choreographs portrait mobile surfaces as a rising tide and keeps illustrations expressive', () => {
  const geometry = { dx: 120, dy: 80, compact: true, opacity: '.52' };
  const surface = oceanSceneCue('library', 'surface', geometry);
  expect(surface.frames[0].clipPath).toBe('inset(82% 0 0 0 round 36px)');
  const illustration = oceanSceneCue('library', 'illustration', geometry);
  expect(illustration.duration).toBeGreaterThanOrEqual(1000);
  expect(illustration.frames[0].transform).toContain('rotate(');
  expect(illustration.frames.at(-1)?.opacity).toBe('.52');
  expect(illustration.duration).toBeGreaterThan(oceanSceneCue('library', 'image', geometry).duration);
  const teacher = oceanSceneCue('teacher', 'illustration', geometry);
  expect(teacher.duration).toBeLessThan(illustration.duration);
});
