import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { withInteractiveDesignSeed } from '../server/src/database/seeds/interactive-design';

describe('Interactive design seed', () => {
  it('replaces unavailable provider records while preserving entity keys, publication states and archive', () => {
    const source = JSON.parse(fs.readFileSync('server/seed-data/data.json', 'utf8'));
    const before = JSON.stringify(source);
    const data = withInteractiveDesignSeed(source);
    expect(JSON.stringify(source)).toBe(before);
    expect(withInteractiveDesignSeed(data)).toEqual(data);
    expect(data.reusableContent.models3d.map((m: any) => [m.sourceKey, m.visibility]))
      .toEqual(source.reusableContent.models3d.map((m: any) => [m.sourceKey, m.visibility]));
    for (const model of data.reusableContent.models3d) {
      expect(model.modelUid).toMatch(/^[a-f0-9]{32}$/);
      expect(model.modelUid).not.toBe(source.reusableContent.models3d.find((m: any) => m.sourceKey === model.sourceKey).modelUid);
      expect(model.canonicalUrl).toBe(`https://sketchfab.com/3d-models/${model.modelUid}`);
      expect(model.attribution.sourceUrl).toBe(model.canonicalUrl);
      expect(model.attribution.creator).not.toContain('BlueSTEAM');
      expect(['CC-BY-4.0', 'CC0-1.0']).toContain(model.attribution.license);
    }
    const game = data.reusableContent.activities.find((a: any) => a.sourceKey === 'activity:home-sorting');
    expect(game.config.objects).toHaveLength(6);
    for (const object of game.config.objects) {
      expect(fs.existsSync(`public${object.imageUrl}`)).toBe(true);
      for (const target of object.acceptedTargetIds) expect(game.config.targets.some((t: any) => t.id === target)).toBe(true);
    }
  });
});
