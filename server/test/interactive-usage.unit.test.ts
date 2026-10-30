import { describe, expect, it } from 'vitest';
import { validateUsagePayload } from '../src/interactive-usage/interactive-usage.service.js';
const snapshot = { kind: 'game', templateKey: 'sorting', config: { objects: [{ id: 'fish', label: 'Cá', acceptedTargetIds: ['reef'] }], targets: [{ id: 'reef', label: 'Rạn san hô' }, { id: 'sand', label: 'Cát' }] } };
describe('Usage event authority', () => {
  it('validates canonical IDs and calculates correctness on the server', () => {
    expect(validateUsagePayload(snapshot, { type: 'game_answer', itemId: 'fish', answerId: 'reef' }).correct).toBe(true);
    expect(validateUsagePayload(snapshot, { type: 'game_answer', itemId: 'fish', answerId: 'sand' }).correct).toBe(false);
    expect(() => validateUsagePayload(snapshot, { type: 'game_answer', itemId: 'invented', answerId: 'reef' })).toThrow();
    expect(() => validateUsagePayload(snapshot, { type: 'scenario_choice', sceneId: 'x', choiceId: 'x' })).toThrow();
  });
  it('uses actual simulation step IDs, not the old four-step embed', () => {
    const sim = { kind: 'simulation', templateKey: 'plastic-journey', config: {} };
    expect(validateUsagePayload(sim, { type: 'simulation_step', stepId: 'microplastics' }).itemId).toBe('microplastics');
    expect(() => validateUsagePayload(sim, { type: 'simulation_step', stepId: 'stage-action' })).toThrow();
  });
});
