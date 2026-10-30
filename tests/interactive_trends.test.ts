import { expect, it } from 'vitest';
import { summarizeUsageTrend } from '../src/domains/teacher/interactive/usageTrend';
import { VISUAL_USAGE_FIXTURE_14_DAYS } from '../e2e/fixtures/interactive-visual';

it('keeps the visual comparison fixture deterministic at 18 opens and 14 interactions', () => {
  expect(VISUAL_USAGE_FIXTURE_14_DAYS).toHaveLength(14);
  expect(VISUAL_USAGE_FIXTURE_14_DAYS.reduce((sum, day) => sum + (day.opens ?? 0), 0)).toBe(18);
  expect(VISUAL_USAGE_FIXTURE_14_DAYS.reduce((sum, day) => sum + (day.interactedRuns ?? 0), 0)).toBe(14);
});

it('compares complete calendar days with equal periods and excludes today', () => {
  const days = Array.from({length:15}, (_, i) => ({localDate:`2026-10-${String(i+1).padStart(2,'0')}`,opens:i===14?1000:i<7?2:4,interactedRuns:1}));
  expect(summarizeUsageTrend(days, '2026-10-15', '2026-10-01T00:00:00+07:00')).toMatchObject({current:28,previous:14,change:100,days:7});
});
it('does not invent trends from missing coverage or a zero baseline', () => {
  const days = Array.from({length:14}, (_, i) => ({localDate:`2026-10-${String(i+1).padStart(2,'0')}`,opens:0,interactedRuns:0}));
  expect(summarizeUsageTrend(days, '2026-10-15', '2026-10-01T00:00:00+07:00')?.change).toBeNull();
  expect(summarizeUsageTrend(days, '2026-10-15', '2026-10-02T12:00:00+07:00')).toBeNull();
  expect(summarizeUsageTrend(days.slice(0,7), '2026-10-15', '2026-10-01T00:00:00+07:00')).toBeNull();
  expect(summarizeUsageTrend(days.map((d,i)=>({...d,opens:i===3?null:0})), '2026-10-15', '2026-10-01T00:00:00+07:00')).toBeNull();
});
