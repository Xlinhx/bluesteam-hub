import { ArrowRight, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UsageMetric, UsageReport, UsageRow } from '@bluesteam/contracts';
import { ActivityThumbnail } from '@/shared/activities/ActivityThumbnail';
import { SearchField } from '@/shared/ui/controls/SearchField';
import { interactiveContentLabel } from '@/shared/data/interactiveArtwork';
import { UsageDaily } from './UsageDaily';
import { UsageTrendOverview } from './UsageTrendOverview';
import { summarizeUsageTrend } from './usageTrend';

export function UsageSummary({ metrics }: { metrics: Array<[string, UsageMetric | number | null]> }) {
  return <div className="usage-summary" style={{ gridTemplateColumns: `repeat(${metrics.length},minmax(0,1fr))` }}>
    {metrics.map(([label, metric]) => { const structured = typeof metric === 'object' && metric !== null, value = structured ? metric.value : metric; return <div key={label}><strong>{value === null ? '—' : value.toLocaleString('vi-VN')}</strong><span>{label}</span>{structured && metric.coverage === 'partial' && <small>Dữ liệu một phần</small>}</div>; })}
  </div>;
}
export function UsageOverview({ report, onSelectContent, onSearch, onExplain }: { report: UsageReport; onSelectContent: (row: UsageRow) => void; onSearch: (q: string) => void; onExplain: () => void }) {
  const [search, setSearch] = useState(report.meta.filter.q || '');
  useEffect(() => setSearch(report.meta.filter.q || ''), [report.meta.filter.q]);
  const today = new Date(new Date(report.meta.filter.asOf).getTime() + 7 * 3600000).toISOString().slice(0, 10);
  const trend = summarizeUsageTrend(report.daily, today, report.meta.availableFrom);
  const caption = trend ? `${trend.current} lượt trong 7 ngày gần đây · ${trend.previous} lượt trong 7 ngày trước. Không gồm hôm nay.` : 'Đang tích lũy dữ liệu để so sánh hai kỳ 7 ngày đầy đủ.';
  return <>
    <UsageSummary metrics={[[ 'Lượt mở', report.summary.opens ], ['Lượt có tương tác', report.summary.interactedRuns], ['Hoạt động đã dùng', report.summary.usedActivities]]}/>
    <div className="usage-analysis-layout"><UsageDaily days={report.daily} caption={caption}/><UsageTrendOverview report={report} onExplain={onExplain}/></div>
    <section className="usage-activity-list"><header><h2>Hoạt động trong kỳ</h2><form onSubmit={event => { event.preventDefault(); onSearch(search.trim()); }}>
      <SearchField type="text" label="Tìm trong số liệu hoạt động" placeholder="Tìm hoạt động…" value={search} onChange={setSearch}
        onClear={() => { setSearch(''); onSearch(''); }}
        trailingAction={<button className="ui-search-submit" aria-label="Tìm hoạt động trong kỳ" type="submit"><ArrowRight size={18} aria-hidden="true"/></button>}/>
    </form></header>
      {report.rows.map(row => <article className="usage-activity-row" key={row.contentId}><ActivityThumbnail content={{ id: row.contentId, coverUrl: row.coverUrl }} kind={row.kind} variant="row"/><div className="usage-activity-row__title"><h3>{row.title}</h3><span className="usage-badge">{interactiveContentLabel(row.contentId, row.kind)}</span></div><p>{row.opens} lượt mở{row.interactedRuns !== null && ` · ${row.interactedRuns} có tương tác`}</p><button className="usage-button" onClick={() => onSelectContent(row)}><Eye size={18}/>Xem chi tiết</button></article>)}
    </section>
  </>;
}
