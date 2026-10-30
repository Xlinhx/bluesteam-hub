import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('keeps the interactive visual tokens scoped and shared by the seascape', () => {
  const css = readFileSync('src/shared/theme/interactive-tokens.css', 'utf8');
  expect(css).toContain('.interactive-seascape');
  expect(css).not.toMatch(/:root\s*\{/);
  for (const name of ['ink', 'muted', 'teal', 'teal-hover', 'paper', 'panel', 'aqua', 'border', 'sand']) {
    expect(css).toContain(`--interactive-${name}:`);
  }
  expect(readFileSync('src/shared/ui/visuals/InteractiveSeascape.tsx', 'utf8')).toContain('interactive-tokens.css');
});

it('does not add a separate learner wallpaper or unsupported type weights', () => {
  const css = readFileSync('src/domains/learner/game-lab/game-lab.css', 'utf8');
  expect(css).not.toContain('ocean_split_beach.jpg');
  expect(css).not.toMatch(/font-weight:\s*(650|850)\b/);
});
