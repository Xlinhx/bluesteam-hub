import type { UsageReport } from '@bluesteam/contracts';

/** Stable visual-QA fixture; browser intercepts may use this without affecting production reports. */
export const VISUAL_USAGE_FIXTURE_14_DAYS: UsageReport['daily'] = [
  [12, 1, 1], [13, 1, 1], [14, 2, 1], [15, 0, 0], [16, 1, 1], [17, 2, 1], [18, 1, 1],
  [19, 1, 1], [20, 2, 1], [21, 1, 1], [22, 2, 2], [23, 1, 1], [24, 2, 1], [25, 1, 1],
].map(([day, opens, interactedRuns]) => ({ localDate: `2026-10-${String(day).padStart(2, '0')}`, opens, interactedRuns }));
