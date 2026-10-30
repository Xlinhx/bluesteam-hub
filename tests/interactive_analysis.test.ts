import { describe, expect, it } from 'vitest';
import { buildUsageAnalysis, type UsageAnalysisEvent } from '../server/src/interactive-usage/analysis/usage-analysis';

const snapshot = { kind: 'game', templateKey: 'sorting', config: {
  objects: [{ id: 'horse', label: 'Cá ngựa', acceptedTargetIds: ['grass'] }, { id: 'star', label: 'Sao biển', acceptedTargetIds: ['reef', 'grass'] }],
  targets: [{ id: 'reef', label: 'Rạn san hô' }, { id: 'grass', label: 'Cỏ biển' }],
} };
function answer(runId: string, answerId: string, second = 0): UsageAnalysisEvent {
  return { id: `${runId}-${second}`, receivedAt: `2026-10-25T00:00:0${second}Z`, runId, itemId: 'horse',
    snapshot, payload: { type: 'game_answer', itemId: 'horse', answerId }, result: { label: 'Cá ngựa', correct: answerId === 'grass' } };
}
describe('mechanic-specific usage analysis', () => {
  it('keeps the first recorded answer per run/item, including correct answers and zero-answer items', () => {
    const analysis = buildUsageAnalysis({ kind: 'game', snapshot, events: [answer('a', 'grass', 1), answer('b', 'grass'), answer('a', 'reef')] });
    expect(analysis?.type).toBe('game_first_answer');
    if (analysis?.type !== 'game_first_answer') throw new Error('wrong analysis');
    expect(analysis.items[0]).toMatchObject({ id: 'horse', answeredRuns: 2, firstIncorrectRuns: 1, answers: [{ id: 'reef', count: 1 }, { id: 'grass', count: 1 }] });
    expect(analysis.items[1]).toMatchObject({ id: 'star', answeredRuns: 0, firstIncorrectRuns: 0 });
  });
  it('uses historical snapshot labels and keeps two activities of one template independent', () => {
    const other = { ...snapshot, config: { objects: [{ id: 'bottle', label: 'Chai nhựa', acceptedTargetIds: ['bin'] }], targets: [{ id: 'bin', label: 'Thùng rác' }] } };
    const result = buildUsageAnalysis({ kind: 'game', snapshot: other, events: [] });
    expect(result?.type === 'game_first_answer' && result.items.map(x => x.label)).toEqual(['Chai nhựa']);
    expect(buildUsageAnalysis({ kind: 'game', snapshot: { kind: 'game', templateKey: 'invented' }, events: [] })).toBeNull();
  });
  it('counts visited steps once per run without summing steps into people or mixing choice events', () => {
    const sim = { kind: 'simulation', templateKey: 'plastic-journey', runtimeDefinition: { version: 1, steps: [{ id: 'shore', label: 'Trên bờ' }, { id: 'drift', label: 'Theo dòng nước' }] } };
    const events = ['shore', 'shore', 'drift'].map((stepId, i) => ({ ...answer('a', 'reef', i), snapshot: sim, itemId: stepId, payload: { type: 'simulation_step' as const, stepId }, result: { label: stepId } }));
    expect(buildUsageAnalysis({ kind: 'simulation', snapshot: sim, events })).toMatchObject({ type: 'simulation_steps', interactedRuns: 1, steps: [{ id: 'shore', visitedRuns: 1 }, { id: 'drift', visitedRuns: 1 }] });
  });
  it('selects first choices separately from step visits and uses a separate denominator per scene', () => {
    const sim = { kind: 'simulation', templateKey: 'my-action', runtimeDefinition: { version: 1, steps: [{ id: 'action', label: 'Bé chọn cách nào?', choices: [{ id: 'bin', label: 'Bỏ vào thùng' }] }] } };
    const visit = { ...answer('a', 'reef'), snapshot: sim, itemId: 'action', payload: { type: 'simulation_step' as const, stepId: 'action' }, result: { label: 'Bé chọn cách nào?' } };
    const choice = { ...visit, id: 'choice', receivedAt: '2026-10-25T00:00:01Z', payload: { type: 'simulation_choice' as const, stepId: 'action', choiceId: 'bin' } };
    expect(buildUsageAnalysis({ kind: 'simulation', snapshot: sim, events: [visit, choice] })).toMatchObject({ type: 'simulation_choices', steps: [{ answeredRuns: 1, choices: [{ count: 1 }] }] });
    const story = { kind: 'scenario', templateKey: 'scenario', config: { scenes: [{ id: 'one', title: 'Cảnh một', choices: [{ id: 'pick', label: 'Nhặt rác' }] }, { id: 'two', title: 'Cảnh hai', choices: [{ id: 'bin', label: 'Bỏ vào thùng' }] }] } };
    const scene = (runId: string, sceneId: string, choiceId: string) => ({ ...answer(runId, 'reef'), itemId: sceneId, snapshot: story, payload: { type: 'scenario_choice' as const, sceneId, choiceId }, result: { label: sceneId } });
    expect(buildUsageAnalysis({ kind: 'scenario', snapshot: story, events: [scene('a', 'one', 'pick'), scene('b', 'one', 'pick'), scene('a', 'two', 'bin')] })).toMatchObject({ type: 'scenario_choices', scenes: [{ answeredRuns: 2 }, { answeredRuns: 1 }] });
  });
  it('leaves unsupported 3D interaction unavailable and preserves missing daily coverage', () => {
    expect(buildUsageAnalysis({ kind: 'model3d', events: [], daily: [{ localDate: '2026-10-25', opens: null }] })).toEqual({ type: 'model_opens', definitionVersion: 1, interactionStatus: 'not_collected', daily: [{ localDate: '2026-10-25', opens: null }] });
  });
});
