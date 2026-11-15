import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Download, Info, RefreshCw, CloudOff, Compass } from 'lucide-react';
import type { UsageKind, UsageReport, UsageRow, UsageDetail } from '@bluesteam/contracts';
import { fetchInteractiveUsage, fetchInteractiveUsageDetail, exportInteractiveUsage } from '@/shared/api/interactiveUsage';
import { useRouter } from '@/app/router';
import { resolveUsagePeriod, usagePeriodFilter } from './usagePeriod';
import { UsageOverview, UsageSummary } from './UsageOverview';
import { UsageActivityDetail } from './UsageActivityDetail';

export function TeacherUsagePanel({ kind, contentId, q, onPreview }: { kind: UsageKind; contentId?: string; q?: string; onPreview: (row: UsageRow) => void }) {
  const { query, setQuery } = useRouter();
  const period = resolveUsagePeriod(query);
  const [from, setFrom] = useState(period.from), [to, setTo] = useState(period.to);
  const [custom, setCustom] = useState(Boolean(query.from));
  const [periodError, setPeriodError] = useState('');
  const [report, setReport] = useState<UsageReport | null>(null), [detail, setDetail] = useState<UsageDetail | null>(null);
  const [loading, setLoading] = useState(true), [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(''), [detailError, setDetailError] = useState(''), [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false), [retry, setRetry] = useState(0), [detailRetry, setDetailRetry] = useState(0);
  const actionRequest = useRef<AbortController | null>(null), definition = useRef<HTMLDetailsElement>(null);
  const overviewScroll = useRef(0);
  const selected = report?.rows.find(row => row.contentId === contentId);
  const requestedVersion = Number(query.version);
  const version = selected?.availableVersions.includes(requestedVersion) ? requestedVersion : selected?.defaultVersion || 1;

  useEffect(() => { setFrom(period.from); setTo(period.to); setCustom(Boolean(query.from)); setPeriodError(''); }, [period.from, period.to, query.from]);
  useEffect(() => {
    actionRequest.current?.abort();
    const abort = new AbortController();
    setReport(null); setDetail(null); setLoading(true); setError(''); setBusy(false); setActionError('');
    fetchInteractiveUsage({ kind, q, contentId, ...usagePeriodFilter(period), timezone: 'Asia/Saigon' }, undefined, abort.signal)
      .then(data => { if (!abort.signal.aborted) setReport(data); })
      .catch(err => { if (!abort.signal.aborted) setError(err.status >= 500 || err instanceof TypeError ? 'Kết nối đang gián đoạn. Cô thử lại nhé.' : err.message || 'Chưa tải được số liệu.'); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => { abort.abort(); actionRequest.current?.abort(); };
  }, [kind, q, contentId, period.from, period.to, retry]);
  useEffect(() => {
    setDetail(null); setDetailError('');
    if (!selected || !report) { setDetailLoading(false); return; }
    const abort = new AbortController(); setDetailLoading(true);
    fetchInteractiveUsageDetail({ contentType: selected.contentType, contentId: selected.contentId, version }, report.meta.filter, abort.signal)
      .then(data => { if (!abort.signal.aborted) setDetail(data); })
      .catch(err => { if (!abort.signal.aborted) setDetailError(err.message || 'Chưa tải được chi tiết.'); })
      .finally(() => { if (!abort.signal.aborted) setDetailLoading(false); });
    return () => abort.abort();
  }, [selected?.contentId, version, report, detailRetry]);
  useEffect(() => {
    if (!contentId && report && overviewScroll.current) window.scrollTo({ top: overviewScroll.current, behavior: 'instant' });
  }, [contentId, report]);
  const download = async () => {
    if (!report || busy) return;
    const abort = new AbortController(); actionRequest.current = abort; setBusy(true); setActionError('');
    try {
      const blob = await exportInteractiveUsage({ ...report.meta.filter, ...(selected ? { version } : {}) }, abort.signal);
      if (abort.signal.aborted) return;
      const url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = `bluesteam-so-lieu-${kind}.csv`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { if (!abort.signal.aborted) setActionError(err instanceof Error ? err.message : 'Chưa xuất được số liệu.'); }
    finally { if (!abort.signal.aborted) setBusy(false); }
  };
  const more = async () => {
    if (!report?.nextCursor || busy) return;
    const abort = new AbortController(); actionRequest.current = abort; setBusy(true); setActionError('');
    try {
      const page = await fetchInteractiveUsage(report.meta.filter, report.nextCursor, abort.signal);
      if (!abort.signal.aborted) setReport(old => old ? { ...old, rows: [...old.rows, ...page.rows.filter(row => !old.rows.some(existing => existing.contentId === row.contentId))], nextCursor: page.nextCursor } : page);
    } catch { if (!abort.signal.aborted) setActionError('Chưa tải thêm được số liệu. Cô thử lại nhé.'); }
    finally { if (!abort.signal.aborted) setBusy(false); }
  };
  const explain = () => { if (definition.current) { definition.current.open = true; definition.current.scrollIntoView({ block: 'center', behavior: 'instant' }); } };
  const available = report?.summary.opens.value !== null;
  const toolbar = <div className="usage-toolbar-wrap">
    <div className="usage-toolbar"><label className="usage-period-select"><CalendarDays size={22}/><span className="sr-only">Khoảng thời gian</span><select className="ui-filter-control" aria-label="Khoảng thời gian" value={custom ? 'custom' : query.range === '7' ? '7' : query.range === '14' ? '14' : '30'} onChange={event => { if (event.target.value === 'custom') setCustom(true); else { setCustom(false); setQuery({ from: null, to: null, range: event.target.value === '30' ? null : event.target.value }); } }}>
      <option value="30">30 ngày gần đây</option><option value="14">14 ngày gần đây</option><option value="7">7 ngày gần đây</option><option value="custom">Chọn khoảng ngày</option></select></label>
      {selected && selected.availableVersions.length > 1 && <label className="usage-version-select"><span className="sr-only">Phiên bản</span><select className="ui-filter-control" aria-label="Phiên bản" value={version} onChange={event => setQuery({version:event.target.value})}>{selected.availableVersions.map(value => <option key={value} value={value}>Phiên bản {value}</option>)}</select></label>}
      <span className="usage-scope">Toàn hệ thống</span><button className="usage-button usage-export" disabled={!report || busy || loading || Boolean(error) || !available || !report.rows.length} onClick={() => void download()} aria-label="Xuất số liệu"><Download size={20}/><span>{busy ? 'Đang xử lí…' : 'Xuất số liệu'}</span></button>
    </div>
    {custom && <form className="usage-custom-period" onSubmit={event => { event.preventDefault(); try { usagePeriodFilter({from,to}); setPeriodError(''); setQuery({from,to,range:null}); setRetry(value=>value+1); } catch(err) { setPeriodError(err instanceof Error ? err.message : 'Cô chọn lại ngày nhé.'); } }}>
      <label>Từ ngày<input className="ui-field" type="date" aria-label="Từ ngày" value={from} required onChange={event=>setFrom(event.target.value)}/></label><label>Đến ngày<input className="ui-field" type="date" aria-label="Đến ngày" value={to} min={from} required onChange={event=>setTo(event.target.value)}/></label><button className="usage-button usage-button--primary" type="submit">Áp dụng</button>
    </form>}
    {periodError && <p className="usage-inline-error" role="alert">{periodError}</p>}
    <p className="usage-scope-note"><Info size={16}/>Số lượt sử dụng · Không phải số học sinh.{query.range==='14' && !custom && <span> Không gồm hôm nay.</span>}</p>
  </div>;
  return <section className="teacher-usage" aria-label="Số liệu sử dụng">
    {actionError && <p className="usage-inline-error" role="alert">{actionError}</p>}
    {selected && !loading && !error ? <UsageActivityDetail row={selected} detail={detail} loading={detailLoading} error={detailError} onRetry={()=>setDetailRetry(value=>value+1)} onBack={()=>setQuery({contentId:null,version:null})} onPreview={()=>onPreview(selected)} toolbar={toolbar}/> : <>
      {toolbar}
      {loading || error || !report?.rows.length ? <>
        <UsageSummary metrics={[[ 'Lượt mở', loading||error?null:report?.summary.opens??null ],['Lượt có tương tác',loading||error?null:report?.summary.interactedRuns??null],['Hoạt động đã dùng',loading||error?null:report?.summary.usedActivities??null]]}/>
        <div className={`usage-state usage-surface ${error?'usage-state--error':''}`} role={error?'alert':'status'}>
          {loading ? <><Compass size={44}/><h2>Đang tải số liệu…</h2></> : error ? <><CloudOff size={64}/><h2>Chưa tải được số liệu</h2><p>{error}</p><button className="usage-button usage-button--primary" onClick={()=>setRetry(value=>value+1)}><RefreshCw size={20}/>Thử lại</button><p className="usage-help">Bộ lọc đang chọn được giữ nguyên.</p></> : <>
            <Compass size={64}/><h2>{report?.summary.opens.value===null?'Chưa thu thập trong khoảng này':q?'Chưa có hoạt động phù hợp':'Chưa có lượt sử dụng'}</h2>
            <p>{report?.summary.opens.value===null ? `Hệ thống bắt đầu hỗ trợ ghi nhận từ ${new Date(report.meta.availableFrom).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}. Dấu — không có nghĩa là 0.` : 'Cô có thể chọn khoảng ngày khác hoặc xem các hoạt động làm sẵn.'}</p>
            <button className="usage-button usage-button--primary" onClick={()=>setCustom(true)}>Đổi khoảng ngày</button>
          </>}
          {!loading && <button className="usage-button" onClick={()=>setQuery({view:null,contentId:null,version:null})}>Xem hoạt động</button>}
        </div>
      </> : <><UsageOverview report={report} onExplain={explain} onSelectContent={row=>{overviewScroll.current=window.scrollY;setQuery({contentId:row.contentId,version:null});window.scrollTo({top:0,behavior:'instant'});}} onSearch={value=>setQuery({q:value||null,contentId:null})}/>{report.nextCursor && <div className="curated-more"><button className="usage-button" disabled={busy} onClick={()=>void more()}>Xem thêm hoạt động</button></div>}</>}
    </>}
    {report && !error && <><details className="usage-definition" ref={definition}><summary><Info size={18}/>Cách tính số liệu</summary><p>Số liệu tổng hợp không định danh trên toàn hệ thống triển khai, chỉ gồm lượt dùng trực tiếp, không gồm cô xem thử. Một lượt có tương tác đã thực hiện ít nhất một thao tác được ghi nhận. Đây là số lượt sử dụng, không phải số học sinh hay kết quả đánh giá học tập. Chưa thu thập số liệu hoàn thành.</p><p>Bắt đầu hỗ trợ ghi nhận từ {new Date(report.meta.availableFrom).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}. {kind==='model3d' && 'Khám phá 3D hiện chỉ ghi nhận lượt mở; dấu — không phải 0.'}</p></details><p className="usage-updated">Cập nhật đến {new Date(report.meta.filter.asOf).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})} · Không gồm cô xem thử.</p></>}
  </section>;
}