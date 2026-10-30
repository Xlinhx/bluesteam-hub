import { useEffect, useId, useRef, useState } from 'react';
import type { UsageReport } from '@bluesteam/contracts';

export function UsageDaily({ days, title = 'Lượt dùng theo ngày', caption }: { days: UsageReport['daily']; title?: string; caption?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);
  const id = useId();
  useEffect(() => {
    if (!host.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => setWidth(Math.max(280, Math.floor(entries[0].contentRect.width))));
    observer.observe(host.current); return () => observer.disconnect();
  }, []);
  const weekly = days.length > 30;
  const buckets = weekly ? Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => {
    const group = days.slice(index * 7, index * 7 + 7);
    const sum = (key: 'opens' | 'interactedRuns') => group.some(day => day[key] === null) ? null : group.reduce((n, day) => n + day[key]!, 0);
    return { localDate: group[0].localDate, opens: sum('opens'), interactedRuns: sum('interactedRuns') };
  }) : days;
  const interactions = buckets.some(day => day.interactedRuns !== null);
  const peak = Math.max(1, ...buckets.flatMap(day => [day.opens || 0, day.interactedRuns || 0]));
  const step = peak <= 4 ? 1 : Math.ceil(peak / 4), max = Math.ceil(peak / step) * step;
  const height = width < 600 ? 184 : 136, left = 30, top = 12, bottom = height - 34, plot = bottom - top;
  const band = (width - left - 12) / Math.max(1, buckets.length), bar = Math.min(18, band * (interactions ? .32 : .6));
  const labelStride = Math.max(1, Math.ceil(buckets.length / (width < 600 ? 3 : 14)));
  const dateLabel = (date: string) => date.slice(8, 10) + '/' + date.slice(5, 7);
  return <section className="usage-daily-panel usage-surface">
    <header><h2>{weekly ? 'Lượt dùng theo tuần' : title}</h2><div className="usage-chart-legend"><span><i/>Lượt mở</span>{interactions && <span><i/>Có tương tác</span>}</div></header>
    <div ref={host} className="usage-daily-chart">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-labelledby={id}>
        <title id={id}>{title}. {weekly ? 'Mỗi nhóm gồm tối đa bảy ngày.' : 'Số lượt trong từng ngày.'} Xem bảng dữ liệu phía dưới.</title>
        {Array.from({ length: Math.round(max / step) + 1 }, (_, index) => { const value = index * step, y = bottom - value / max * plot; return <g key={value}><line x1={left} x2={width - 8} y1={y} y2={y} stroke="#dce7ed"/><text x={left - 8} y={y + 4} textAnchor="end" fontSize="12" fill="#54778b">{value}</text></g>; })}
        {buckets.map((day, index) => {
          const x = left + band * index + band / 2;
          return <g key={day.localDate}>{(['opens', ...(interactions ? ['interactedRuns'] as const : [])] as const).map((key, series) => {
            const value = day[key], bx = x + (interactions ? series === 0 ? -bar - 1 : 1 : -bar / 2);
            return value === null ? <line key={key} x1={bx} x2={bx + bar} y1={bottom - 2} y2={bottom - 2} stroke="#8faab9" strokeDasharray="2 2"><title>{day.localDate}: chưa thu thập</title></line> :
              <rect key={key} x={bx} y={bottom - value / max * plot} width={bar} height={value / max * plot} rx="3" fill={series ? '#85e0ed' : '#0798b4'} tabIndex={0} aria-label={`${day.localDate}: ${value} ${series ? 'lượt có tương tác' : 'lượt mở'}`}><title>{day.localDate}: {value} {series ? 'lượt có tương tác' : 'lượt mở'}</title></rect>;
          })}{(index % labelStride === 0 || index === buckets.length - 1) && <text x={x} y={height - 10} textAnchor="middle" fontSize="12" fill="#54778b">{dateLabel(day.localDate)}</text>}</g>;
        })}
      </svg>
    </div>{caption && <p className="usage-chart-caption">{caption}</p>}
    <details className="usage-chart-table"><summary>Xem bảng dữ liệu{weekly ? ' theo ngày (biểu đồ nhóm 7 ngày)' : ''}</summary><div><table><thead><tr><th scope="col">Ngày</th><th scope="col">Lượt mở</th>{interactions && <th scope="col">Có tương tác</th>}</tr></thead><tbody>{days.map(day => <tr key={day.localDate}><th scope="row">{dateLabel(day.localDate)}</th><td>{day.opens ?? 'Chưa thu thập'}</td>{interactions && <td>{day.interactedRuns ?? 'Chưa thu thập'}</td>}</tr>)}</tbody></table></div></details>
  </section>;
}
