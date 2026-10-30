export interface UsagePeriod { from: string; to: string }
const DAY = 86400000;
const localDay = (date: Date) => new Date(date.getTime() + 7 * 3600000).toISOString().slice(0, 10);

export function usagePeriodFilter(period: UsagePeriod) {
  const date = (value: string) => {
    const parsed = new Date(`${value}T00:00:00+07:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime()) || localDay(parsed) !== value) throw new Error('Chọn khoảng ngày hợp lệ, tối đa 366 ngày.');
    return parsed;
  };
  const from = date(period.from), last = date(period.to);
  if (last < from || last.getTime() - from.getTime() > 365 * DAY) throw new Error('Chọn khoảng ngày hợp lệ, tối đa 366 ngày.');
  return { from: from.toISOString(), to: new Date(last.getTime() + DAY).toISOString() };
}

export function resolveUsagePeriod(query: { from?: string; to?: string; range?: string }, now = new Date()): UsagePeriod {
  if (query.from && query.to) {
    const period = { from: query.from, to: query.to };
    try { usagePeriodFilter(period); return period; } catch { /* Invalid deep links use the default period. */ }
  }
  if (query.range === '14') return { from: localDay(new Date(now.getTime() - 14 * DAY)), to: localDay(new Date(now.getTime() - DAY)) };
  return { from: localDay(new Date(now.getTime() - (query.range === '7' ? 6 : 29) * DAY)), to: localDay(now) };
}
