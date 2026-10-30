import { describe, expect, it } from 'vitest';
import { validateGameForPublish } from '../packages/contracts/src/game-validation';

const valid = () => ({ instructionText: 'Chạm chọn bạn rồi chạm nơi sống.', targets: [{ id: 'reef', label: 'Rạn san hô', bounds: { x: .05, y: .5, width: .4, height: .3 } }, { id: 'grass', label: 'Cỏ biển', bounds: { x: .55, y: .5, width: .4, height: .3 } }], objects: [{ id: 'fish', label: 'Cá hề', imageUrl: '/fish.png', acceptedTargetIds: ['reef'] }, { id: 'star', label: 'Sao biển', imageUrl: '/star.png', acceptedTargetIds: ['reef', 'grass'] }] });
describe('Publish requires playable game content', () => {
  it('accepts multiple correct habitats and legacy items/zones aliases', () => {
    expect(validateGameForPublish('sorting', valid())).toEqual([]);
    const { targets: zones, objects: items, ...rest } = valid();
    expect(validateGameForPublish('sorting', { ...rest, zones, items })).toEqual([]);
  });
  it('reports every incomplete object and out-of-bounds region without silently repairing them', () => {
    const config = valid();
    config.objects[0].acceptedTargetIds = [];
    config.targets[1].bounds.width = .8;
    expect(validateGameForPublish('sorting', config).map(issue => issue.path)).toEqual(expect.arrayContaining(['targets.1.bounds', 'objects.0.acceptedTargetIds']));
    expect(config.objects[0].acceptedTargetIds).toEqual([]);
  });
  it('rejects non-finite bounds, duplicate IDs and dangling targets', () => {
    const config = valid(); config.targets[0].bounds.x = NaN; config.objects[1].id = 'fish'; config.objects[0].acceptedTargetIds = ['missing'];
    expect(validateGameForPublish('sorting', config).length).toBeGreaterThanOrEqual(3);
  });
  it('rejects overlapping regions while allowing regions that only share an edge', () => {
    const config = valid();config.targets[1].bounds.x = .2;
    expect(validateGameForPublish('sorting',config).some(issue => issue.path === 'targets.1.bounds')).toBe(true);
    config.targets[1].bounds.x = .45;
    expect(validateGameForPublish('sorting',config)).toEqual([]);
  });
  it('limits matching and choice content to the supported child interaction sizes', () => {
    expect(validateGameForPublish('matching', { pairs: [] }).length).toBeGreaterThan(0);
    expect(validateGameForPublish('choice', { questions: [{ id: 'q', promptText: 'Ai?', correctOptionId: 'absent', options: [{ id: 'a', label: 'Cá' }, { id: 'b', label: 'Cua' }] }] }).some(issue => issue.path.endsWith('correctOptionId'))).toBe(true);
  });
});
