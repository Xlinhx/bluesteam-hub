import { describe, expect, it } from 'vitest';
import { usageOpenSchema, usageInteractionSchema, parseUsageFilter, csvCell } from '../packages/contracts/src/interactive-usage';

describe('Standalone usage contracts', () => {
  it('rejects unknown fields, client scores and mismatched payloads', () => {
    const open = { contentType: 'activity', contentId: '00000000-0000-4000-8000-000000000001', version: 1, openKey: '00000000-0000-4000-8000-000000000002' };
    expect(usageOpenSchema.safeParse(open).success).toBe(true);
    expect(usageOpenSchema.safeParse({ ...open, score: 100 }).success).toBe(false);
    const event = { clientEventId: open.openKey, payload: { type: 'game_answer', itemId: 'fish', answerId: 'reef' } };
    expect(usageInteractionSchema.safeParse(event).success).toBe(true);
    expect(usageInteractionSchema.safeParse({ ...event, payload: { ...event.payload, isCorrect: true } }).success).toBe(false);
    expect(usageInteractionSchema.safeParse({ ...event, payload: { type: 'simulation_step', choiceId: 'a' } }).success).toBe(false);
  });
  it('uses a half-open local-calendar period and rejects invalid ranges', () => {
    const f = parseUsageFilter({ kind: 'game', from: '2026-10-01T00:00:00+07:00', to: '2026-10-31T00:00:00+07:00' }, new Date('2026-10-25T12:00:00Z'));
    expect(f.from).toBe('2026-09-30T17:00:00.000Z');
    expect(f.timezone).toBe('Asia/Saigon');
    expect(() => parseUsageFilter({ kind: 'unknown' })).toThrow();
    expect(() => parseUsageFilter({ from: '2026-10-03T00:00:00Z', to: '2026-10-01T00:00:00Z' })).toThrow();
    expect(() => parseUsageFilter({ from: '2020-01-01T00:00:00Z', to: '2026-10-01T00:00:00Z' })).toThrow();
  });
  it('escapes csv cells, including formula prefixes and newlines', () => {
    expect(csvCell('=2+2')).toBe('"\'=2+2"');
    expect(csvCell('a,"b"\nc')).toBe('"a,""b""\nc"');
  });
});
