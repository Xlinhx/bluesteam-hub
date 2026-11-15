import { SearchField } from '@/shared/ui/controls/SearchField';
import { CatalogPagination, RESOURCE_PAGE_SIZE } from '../../../shared/ui/catalog/CatalogPagination';
import { cropImageStyle } from '../../../shared/ui/visuals/resourceCoverCrop';
import { useEffect, useRef, useState } from 'react';
import { Waves, X } from 'lucide-react';
import { fetchResourceGroups, type ResourceGroup } from '../../../shared/api/resourceGroups';
import { useOverlayMotion } from '../../../shared/ui/motion/useOverlayMotion';
import { nativeDialogFocus } from '../../../shared/ui/overlays/nativeDialogFocus';

export function ResourceGroupChooser({ onChoose, onClose }: {
  onChoose: (id: string) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef(typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null);
  const requestClose = useOverlayMotion(dialog, onClose);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<ResourceGroup[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const previousFocus = returnFocus.current;
    const previousOverflow = document.body.style.overflow;
    const modal = dialog.current;
    document.body.style.overflow = 'hidden';
    modal?.showModal();
    return () => { modal?.close(); document.body.style.overflow = previousOverflow; if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true); setError(''); setItems([]);
    const timer = setTimeout(() => {
      fetchResourceGroups({q:search.trim(),cursor:String((page - 1) * RESOURCE_PAGE_SIZE),limit:RESOURCE_PAGE_SIZE}, abort.signal).then(result => {
        if (!abort.signal.aborted) {
          setItems(result.items); setTotal(result.total);
          setPage(Math.min(page, Math.max(1, Math.ceil(result.total / RESOURCE_PAGE_SIZE))));
        }
      }).catch(err => { if (!abort.signal.aborted) setError(err.message); })
        .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    }, 200);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [search, retry, page]);
  return <dialog ref={dialog} className="resource-group-chooser" aria-labelledby="group-chooser-title" onCancel={event => { event.preventDefault(); requestClose(); }} onClick={event => { if (event.target === dialog.current) requestClose(); }}>
    <header><h2 id="group-chooser-title">Bé muốn khám phá nhóm nào?</h2><button aria-label="Đóng chọn nhóm" onClick={requestClose}><X /></button></header>
    <SearchField className="resource-search" ref={nativeDialogFocus} label="Tìm nhóm học liệu" placeholder="Tìm nhóm…" value={search} onChange={value => {setSearch(value);setPage(1);}}/>
    <div className="resource-group-choices">{items.map(group => <button key={group.id} data-ocean-action="group"
      onClick={() => onChoose(group.id)}>
      <span>{group.coverUrl ? <img src={group.coverUrl} alt="" style={group.coverCrop && cropImageStyle(group.coverCrop)}/> : <Waves />}</span>
      <div><strong>{group.title}</strong></div>
    </button>)}</div>
    {loading && <p role="status">Đang tìm nhóm…</p>}
    {!loading && !items.length && !error && <p>Chưa tìm thấy nhóm. Bé thử tên khác nhé.</p>}
    {error && <p role="alert">{error} <button onClick={() => setRetry(value => value+1)}>Thử lại</button></p>}
    <CatalogPagination label="Phân trang chọn nhóm" page={page} total={total} loading={loading || Boolean(error)} onPage={setPage}/>
  </dialog>;
}
