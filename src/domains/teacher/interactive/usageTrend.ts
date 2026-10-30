import type { UsageReport } from '@bluesteam/contracts';

/** Compare the last two complete seven-day windows within the selected report. */
export function summarizeUsageTrend(daily: UsageReport['daily'], today: string, availableFrom: string) {
  const days = daily.filter(d => d.localDate < today).slice(-14);
  if (days.length !== 14 || days.some(d => d.opens === null)) return null;
  const start = new Date(`${days[0].localDate}T00:00:00+07:00`).getTime();
  if (start < new Date(availableFrom).getTime()) return null;
  if (days.some((d,i) => new Date(`${d.localDate}T00:00:00+07:00`).getTime() !== start + i * 86400000)) return null;
  const previous = days.slice(0,7).reduce((n,d) => n + d.opens!,0);
  const current = days.slice(7).reduce((n,d) => n + d.opens!,0);
  return { previous, current, change: previous > 0 ? Math.round((current-previous)/previous*100) : null, days:7, from:days[7].localDate, to:days[13].localDate };
}
