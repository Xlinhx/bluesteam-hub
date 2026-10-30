import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { fetchTeacherResources, type ResourceDto } from '../../../shared/api/catalog';
import { ResourceDialog } from './ResourceDialog';
import { ResourceSearch, ResourceSelect, FORMAT_OPTIONS } from './ResourceControls';
import { ResourceKind, RESOURCE_KIND_LABELS } from './ResourceKind';

export function ResourcePicker({ title = 'Thêm vào nhóm', groupTitle, excludeId, existingIds = [], groupId, initialKind = 'all', onClose, onChoose }: { title?: string; groupTitle?: string; excludeId?: string; existingIds?: string[]; groupId?: string; initialKind?: string; onClose: () => void; onChoose: (items: ResourceDto[]) => Promise<void> }) {
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState(initialKind==='flashcard'?'visual':initialKind);
  const [items, setItems] = useState<ResourceDto[]>([]);
  const [selected, setSelected] = useState<Record<string, ResourceDto>>({});
  const [cursor, setCursor] = useState<string | null>(null);
  const [history,setHistory] = useState<Array<string|undefined>>([undefined]);
  const [total,setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(()=>{setHistory([undefined]);},[search,kind,groupId]);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true); setError('');
    const timer = setTimeout(() => {
      fetchTeacherResources({ q: search, kind:kind==='all'?'supported':kind, membershipGroupId:groupId,cursor:history[history.length-1],limit:6 }, abort.signal).then(page => { if (!abort.signal.aborted) { setItems(page.items);setTotal(page.total); setCursor(page.nextCursor); } })
        .catch(err => { if (!abort.signal.aborted) setError(err.message); })
        .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    }, 250);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [search,kind,retry,groupId,history]);
  const count=Object.keys(selected).length;
  return <ResourceDialog title={title} subtitle={groupTitle} onClose={onClose} busy={busy} drawer className="resource-picker-dialog">{requestClose => <><div className="resource-form-body resource-picker-body">
    <div className="resource-picker-filters"><ResourceSearch autoFocus label="Tìm học liệu trong kho" placeholder="Tìm học liệu…" value={search} onChange={setSearch}/><ResourceSelect label="Định dạng học liệu" value={kind} onChange={setKind} options={[{value:'all',label:'Định dạng'},...FORMAT_OPTIONS.map(o=>o.value==='flashcard'?{...o,value:'visual'}:o)]} format/></div>
    <div className="resource-picker-selection"><span aria-live="polite">Đã chọn {count}</span><button type="button" disabled={!count || busy} onClick={()=>setSelected({})}>Bỏ chọn</button></div>
    <div className="resource-picker-list" aria-busy={loading}>{(error?[]:items).filter(i => i.id!==excludeId && i.kind!=='worksheet').map(item => <label key={item.id} className="resource-picker-item" data-existing={Boolean(item.isGroupMember || existingIds.includes(item.id))}><input type="checkbox" disabled={busy || loading || item.isGroupMember || existingIds.includes(item.id)} checked={Boolean(selected[item.id]) || item.isGroupMember || existingIds.includes(item.id)} onChange={e => setSelected(prev => { const next={...prev}; if(e.target.checked)next[item.id]=item; else delete next[item.id]; return next; })}/>{item.coverUrl ? <img src={item.coverUrl} alt=""/> : <span className="resource-picker-no-cover" aria-hidden="true"><ResourceKind kind={item.kind} iconOnly/></span>}<span><strong>{item.title}</strong><small>{RESOURCE_KIND_LABELS[item.kind] || item.kind}</small></span>{(item.isGroupMember || existingIds.includes(item.id)) && <small className="resource-existing-label">{groupId?'Đã trong nhóm':'Đã liên kết'}</small>}</label>)}</div>
    {loading && <p role="status">Đang tải…</p>}{!loading && !error && !items.length && <p>Chưa có học liệu phù hợp.</p>}
    <div className="teacher-resource-pagination resource-picker-pagination"><span>{total?`${(history.length-1)*6+1}–${Math.min(history.length*6,total)} / ${total}`:'0 học liệu'}</span><div><button aria-label="Trang học liệu trước" disabled={loading || busy || history.length===1} onClick={()=>setHistory(prev=>prev.slice(0,-1))}><ArrowLeft size={20}/></button><button aria-label="Trang học liệu sau" disabled={loading || busy || !cursor} onClick={()=>setHistory(prev=>[...prev,cursor!])}><ArrowRight size={20}/></button></div></div>
    {error && <p className="resource-form-error" role="alert">{error} <button onClick={() => setRetry(r=>r+1)}>Thử lại</button></p>}
  </div><footer><span className="resource-field-hint">Học liệu gốc được giữ nguyên.</span><button onClick={requestClose} disabled={busy}>Hủy</button><button data-resource-transfer className="resource-primary" disabled={busy || !count} onClick={async () => {setBusy(true);setError('');try{await onChoose(Object.values(selected));}catch(err){setError(err instanceof Error ? err.message:'Chưa lưu được lựa chọn.');}finally{setBusy(false);}}}>{busy ? 'Đang thêm…' : `Thêm ${count} học liệu`}</button></footer></>}</ResourceDialog>;
}
