import { Info } from 'lucide-react';
import type { UsageReport } from '@bluesteam/contracts';
export function UsageTrendOverview({ report, onExplain }: { report: UsageReport; onExplain: () => void }) {
  const opens = report.summary.opens.value, interactions = report.summary.interactedRuns.value;
  return <aside className="usage-reading usage-surface"><h2>Đọc số liệu</h2>
    <strong className="usage-reading__number">{interactions === null || opens === null ? '—' : `${interactions} / ${opens}`}</strong>
    <p>{interactions === null ? 'Chưa thu thập thao tác tương tác.' : 'lượt mở có thao tác được ghi nhận.'}</p>
    <p>Cần xem từng hoạt động để hiểu lựa chọn và cách khám phá.</p>
    <button className="usage-button" onClick={onExplain}><Info size={20}/>Cách tính số liệu</button>
    <div className="usage-reading__decoration" aria-hidden="true"><img src="/assets/generated/profile/avatar-clownfish.webp" alt="" className="usage-reading__art"/><img src="/assets/generated/interactive/v5/right-lower.webp" alt="" className="usage-reading__reef"/></div>
  </aside>;
}
