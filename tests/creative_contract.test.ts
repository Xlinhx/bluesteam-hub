import { describe, it, expect } from 'vitest';
import { normalizeCreativeConfig, validateCreativeConfig } from '../packages/contracts/src/creative';

describe('Creative content round trip', () => {
  it('reads legacy outline and palette aliases without using the cover as the drawing', () => {
    const value = normalizeCreativeConfig('drawing', { lineartUrl: '/outline.png', suggestedColors: ['#123456'], untouched: 7 });
    expect(value.outlineUrl).toBe('/outline.png');
    expect(value.suggestedPalette).toEqual(['#123456']);
    expect(value.untouched).toBe(7);
    expect(normalizeCreativeConfig('drawing', {}).outlineUrl).toBeUndefined();
  });
  it('preserves an intentionally empty scene and transforms through JSON', () => {
    expect(normalizeCreativeConfig('habitat', { items: [] }).items).toEqual([]);
    const items = [{ id: 'a', assetId: 'seagrass-tall', type: 'seagrass', nameVi: 'Cỏ', nameEn: 'Grass', x: -1.2, z: .8, rotation: Math.PI / 4, scale: 1.2 }];
    expect(normalizeCreativeConfig('habitat', JSON.parse(JSON.stringify({ items }))).items).toEqual(items);
  });
  it('validates publishable capabilities and points to the broken field', () => {
    expect(validateCreativeConfig('drawing', { blankPaper: true })).toEqual([]);
    expect(validateCreativeConfig('drawing', {}).some(e => e.field === 'outlineUrl')).toBe(true);
    expect(validateCreativeConfig('habitat', { items: [{ x: 100 }] }).some(e => e.field.startsWith('items'))).toBe(true);
    expect(validateCreativeConfig('drawing', { outlineUrl: '/a.png', suggestedPalette: ['invalid'] }).some(e => e.field === 'suggestedPalette')).toBe(true);
  });
});
