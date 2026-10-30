import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { BLUESTEAM_V2_SCREENS, getV2ScreenByIndex, getV2ScreenByRoute } from '../src/domains/showcase/v2ScreensData';

describe('Showcase current references and retired variants', () => {
  it('keeps all 37 historical entries and their reference files available', () => {
    expect(BLUESTEAM_V2_SCREENS).toHaveLength(37);
    for (const screen of BLUESTEAM_V2_SCREENS) {
      expect(fs.existsSync(screen.screenshotPath)).toBe(true);
      if (screen.referencePath) expect(fs.existsSync(screen.referencePath)).toBe(true);
      expect(getV2ScreenByIndex(screen.index)).toBe(screen);
    }
    expect(getV2ScreenByRoute('/resources?showcase=1')?.route).toBe('/resources');
  });

  it('retires broken concept references and unused approval scripts', () => {
    for (const file of [
      'src/domains/showcase/registry.ts', 'src/domains/showcase/CompareMatrix.tsx',
      'src/domains/showcase/MockupModal.tsx', 'src/domains/showcase/ScreenCompareModal.tsx',
      'scripts/apply-manifest-verification.mjs', 'scripts/generate-visual-manifest.mjs',
      'src/shared/types/index.ts', 'src/shared/ui/buttons/CoralButton.tsx',
      'src/shared/ui/visuals/UnderwaterCaustics.tsx',
    ]) expect(fs.existsSync(file), file).toBe(false);
  });
});
