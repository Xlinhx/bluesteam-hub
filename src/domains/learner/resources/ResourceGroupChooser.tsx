import { cropImageStyle } from '../../../shared/ui/visuals/resourceCoverCrop';
import { useEffect, useRef, useState } from 'react';
import { Search, Waves, X } from 'lucide-react';
import { fetchResourceGroups, type ResourceGroup } from '../../../shared/api/resourceGroups';
import { useOverlayMotion } from '../../../shared/ui/motion/useOverlayMotion';
import { nativeDialogFocus } from '../../../shared/ui/overlays/nativeDialogFocus';

export function ResourceGroupChooser({ onChoose, onClose }: { onChoose: (id: string) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef(typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null);
  const requestClose = useOverlayMotion(dialog, onClose);
  const request = useRef<AbortController | null>(null);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<ResourceGroup[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [history,setHistory]=useState<Array<string|undefined>>([undefined]);
  useEffect(() => {
    const previousFocus = returnFocus.current;
    const previousOverflow = document.body.style.overflow;
    const modal = dialog.current;
    document.body.style.overflow = 'hidden';
    modal?.showModal();
    return () => { modal?.close(); document.body.style.overflow = previousOverflow; if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    const abort = new AbortController(); request.current = abort;
    setLoading(true); setError(''); setItems([]); setCursor(null);
    const timer = setTimeout(() => {
      fetchResourceGroups({ q: search.trim(), cursor:history[history.length-1], limit: 6 }, abort.signal).then(page => {
        if (!abort.signal.aborted) { setItems(page.items); setCursor(page.nextCursor); }
      }).catch(err => { if (!abort.signal.aborted) setError(err.message); })
        .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    }, 200);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [search, retry, history]);
  const more=()=>{if(cursor && !loading)setHistory(prev=>[...prev,cursor]);};
  return <dialog ref={dialog} className="resource-group-chooser" aria-labelledby="group-chooser-title" onCancel={event => { event.preventDefault(); requestClose(); }} onClick={event => { if (event.target === dialog.current) requestClose(); }}>
    <header><h2 id="group-chooser-title">Bé muốn khám phá nhóm nào?</h2><button aria-label="Đóng chọn nhóm" onClick={requestClose}><X /></button></header>
    <label className="resource-search"><Search /><input ref={nativeDialogFocus} type="search" aria-label="Tìm nhóm học liệu" placeholder="Tìm nhóm…" value={search} onChange={event => {setSearch(event.target.value);setHistory([undefined]);}} /></label>
    <div className="resource-group-choices">{items.map(group => <button key={group.id} data-ocean-action="group" onClick={() => onChoose(group.id)}>
      <span>{group.coverUrl ? <img src={group.coverUrl} alt="" style={cropImageStyle(group.coverCrop)}/> : <Waves />}</span><strong>{group.title}</strong>
    </button>)}</div>
    {loading && <p role="status">Đang tìm nhóm…</p>}
    {!loading && !items.length && !error && <p>Chưa tìm thấy nhóm. Bé thử tên khác nhé.</p>}
    {error && <p role="alert">{error} <button onClick={() => setRetry(value => value+1)}>Thử lại</button></p>}
    {(cursor || history.length>1) && <nav className="resource-page-navigation" aria-label="Phân trang chọn nhóm"><button className="resource-control" disabled={loading||history.length===1} onClick={()=>setHistory(prev=>prev.slice(0,-1))}>Nhóm trước</button><span>Lượt {history.length}</span><button className="resource-control" disabled={loading||!cursor} onClick={more}>Nhóm khác</button></nav>}
  </dialog>;
}
