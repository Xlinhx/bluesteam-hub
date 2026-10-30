import { expect, it } from 'vitest';
import { resolveUsagePeriod, usagePeriodFilter } from '../src/domains/teacher/interactive/usagePeriod';

it('restores the URL period and uses Vietnam calendar days across reloads', () => {
  const now = new Date('2026-10-24T18:00:00Z');
  expect(resolveUsagePeriod({}, now)).toEqual({ from: '2026-09-26', to: '2026-10-25' });
  expect(resolveUsagePeriod({ from: '2026-10-01', to: '2026-10-07' }, now)).toEqual({ from: '2026-10-01', to: '2026-10-07' });
  expect(usagePeriodFilter({ from: '2026-10-01', to: '2026-10-07' })).toEqual({ from: '2026-09-30T17:00:00.000Z', to: '2026-10-07T17:00:00.000Z' });
});

it('rejects impossible, reversed or oversized periods without a date conversion crash', () => {
  for (const period of [{ from: '2026-02-30', to: '2026-03-02' }, { from: '', to: '2026-01-01' }, { from: '2026-10-02', to: '2026-10-01' }, { from: '2024-01-01', to: '2026-10-25' }]) {
    expect(() => usagePeriodFilter(period)).toThrow();
    expect(resolveUsagePeriod(period, new Date('2026-10-25T00:00:00Z'))).toEqual({ from: '2026-09-26', to: '2026-10-25' });
  }
});
it('offers fourteen complete days ending yesterday without changing the legacy presets', () => {
  const now = new Date('2026-10-26T08:00:00+07:00');
  expect(resolveUsagePeriod({ range: '14' }, now)).toEqual({ from: '2026-10-12', to: '2026-10-25' });
  expect(resolveUsagePeriod({ range: '7' }, now)).toEqual({ from: '2026-10-20', to: '2026-10-26' });
});
