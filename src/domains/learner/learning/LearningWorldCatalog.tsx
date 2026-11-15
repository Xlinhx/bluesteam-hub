import { ArrowLeft, Check, ChevronLeft, ChevronRight, Leaf, MapPin, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type OceanItem, type OceanItemPage, oceanApi, oceanPath, useOceanData } from '../../../shared/api/learnerOcean';
import { OceanListen } from '../../../shared/ui/media/OceanListen';
import { SearchField } from '../../../shared/ui/controls/SearchField';
import { worldItemPath, type WorldKind } from './worldRoutes';
import { habitatIllustrations, habitatSourcePhotoChoices, learningCardPhoto } from './world-photos';

export type WorldGroups = { items: { name: string; count: number }[] };
function itemPhoto(item: OceanItem) {
  const source = habitatSourcePhotoChoices[item.id];
  return learningCardPhoto(item.id)?.url || habitatIllustrations[item.id]?.url ||
    (source === null ? undefined : source === undefined ? item.image || item.images?.[0] : item.images?.[source]);
}

export function WorldItemTile({ item, learned, open, selected }: { item: OceanItem; learned: boolean; open: () => void; selected?: boolean }) {
  const image = itemPhoto(item);
  return <button className="learning-world-tile" aria-pressed={selected} onClick={open}>
    {item.foodChain ? <span className="learning-world-food-chain">{item.foodChain}</span>
      : image ? <img loading="lazy" src={image} alt="" /> : <span className="learning-world-no-photo">Chưa có ảnh</span>}
    <strong>{item.title}</strong>
    {learned && <span className="learning-world-studied"><Check size={13}/> ĐÃ HỌC</span>}
  </button>;
}

export function WorldCatalog({ zone, scope, initialGroup, place, regionTitle, learned, openItem, close, selected }: {
  zone?: string; scope: string; initialGroup: string; place?: string; regionTitle?: string; learned: Set<string>; openItem: (id: string) => void; close: () => void; selected?: string;
}) {
  const [kind, setKind] = useState<WorldKind>('species');
  const [group, setGroup] = useState(initialGroup);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const closeButton = useRef<HTMLButtonElement>(null);
  const all = !zone || kind === 'collection';
  const groups = useOceanData<WorldGroups>(oceanPath('groups', { zone: all ? undefined : zone, kind, allZones: all ? '1' : undefined }));
  const result = useOceanData<OceanItemPage>(worldItemPath(zone, kind, group, page, q, status), scope + ':' + learned.size);
  useEffect(() => { closeButton.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (search.trim() === q) return;
    const timer = setTimeout(() => { setQ(search.trim()); setPage(1); }, 200);
    return () => clearTimeout(timer);
  }, [search, q]);
  const total = result.data?.total ?? 0;
  const items = result.data?.items.slice(0, 6) ?? [];
  const heading = group ? group.replace(/^Động vật\s*–\s*/u, '') + (place && kind === 'species' ? ' ở ' + place : '')
    : kind === 'collection' ? 'Chuyên đề đại dương' : place ? 'Sinh vật ở ' + place : 'Mục lục sinh vật';
  const placeTitle = (regionTitle ?? place)?.replace(/^Khu vực\s+/u, '');
  const title = kind === 'collection' ? 'Học liệu' : placeTitle ? placeTitle[0].toLocaleUpperCase('vi') + placeTitle.slice(1) : 'Sinh vật biển';
  function changeKind(next: WorldKind) {
    setKind(next);
    setGroup('');
    setPage(1);
    setStatus('');
  }

  return <section className="learning-world-catalog" aria-label={heading}>
    <header>
      <h2>{title}</h2>
      {result.data && <small>{total} {kind === 'species' ? 'sinh vật' : 'học liệu'}</small>}
      <button ref={closeButton} aria-label="Đóng mục lục" onClick={close}><X size={22}/></button>
    </header>
    <div className="learning-world-filters">
      <SearchField label="Tìm sinh vật" type="text" value={search} onChange={setSearch} />
      <div className="learning-library-kind" role="group" aria-label="Học liệu">
        <button type="button" aria-pressed={kind === 'species'} onClick={() => changeKind('species')}>Sinh vật</button>
        <button type="button" aria-pressed={kind === 'collection'} onClick={() => changeKind('collection')}>Học liệu</button>
      </div>
      <label className="learning-library-group"><span className="sr-only">Nhóm</span><select value={group} onChange={event => { setGroup(event.target.value); setPage(1); }}>
        <option value="">Tất cả nhóm</option>
        {groups.data?.items.map(entry => <option key={entry.name} value={entry.name}>{entry.name} · {entry.count}</option>)}
      </select></label>
      {kind === 'species' && <label className="learning-library-status"><span className="sr-only">Tiến độ</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
        <option value="">Tiến độ</option><option value="learned">Đã học</option><option value="new">Chưa học</option>
      </select></label>}
    </div>
    <div className="learning-library-results" aria-busy={result.loading} inert={result.loading || undefined}>
      {result.loading && <p role="status">Đang mở danh sách…</p>}
      {result.error && <p role="alert">{result.error} <button onClick={result.reload}>Thử lại</button></p>}
      {groups.error && <p role="alert">Chưa tải được nhóm. <button onClick={groups.reload}>Thử lại</button></p>}
      {result.data && !items.length && <p>{q || status ? 'Chưa tìm thấy mục phù hợp.' : 'Vùng này có phần giới thiệu. Excel chưa có danh sách sinh vật riêng.'}</p>}
      <div className="learning-world-tray">{items.map(item => <WorldItemTile key={item.id} item={item} selected={selected === item.id}
        learned={item.learned || learned.has(item.id)} open={() => openItem(item.id)} />)}</div>
    </div>
    <div className="learning-world-pager" aria-label="Phân trang">
        <button aria-label="Trang trước" disabled={page === 1 || result.loading} onClick={() => setPage(value => value - 1)}><ChevronLeft size={21}/></button>
        <span aria-live="polite">{items.length ? `${(page - 1) * 6 + 1}–${(page - 1) * 6 + items.length} / ${total}` : '0'}</span>
        <button aria-label="Trang tiếp theo" disabled={page * 6 >= total || result.loading} onClick={() => setPage(value => value + 1)}><ChevronRight size={21}/></button>
    </div>
  </section>;
}

export function WorldReader({ id, scope, learned, save, close, observe, inCatalog = false, place, habitat }: {
  id: string; scope: string; learned: boolean; save: (id: string) => void; close: () => void; observe: (item: OceanItem) => void;
  inCatalog?: boolean; place?: string; habitat?: string;
}) {
  const detail = useOceanData<OceanItem>('items/' + encodeURIComponent(id), scope);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const title = useRef<HTMLHeadingElement>(null);
  const item = detail.data;
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [item?.id]);
  async function record() {
    if (saving || !item) return;
    setSaving(true);
    setError('');
    try { await oceanApi('studied/' + encodeURIComponent(item.id), { method: 'POST' }); save(item.id); }
    catch (failure) { setError((failure as Error).message); }
    finally { setSaving(false); }
  }
  const image = item && itemPhoto(item);
  const photoCredit = item && learningCardPhoto(item.id);
  const illustration = item && habitatIllustrations[item.id];
  const recordedFact = item?.facts?.find(fact => fact.label === 'Dành cho bé' && fact.audio)
    ?? item?.facts?.find(fact => fact.audio);
  const habitatBadge = habitat && <span className="learning-world-reader-habitat">{/cây|cỏ|phi lao|bụi/iu.test(habitat) ? <Leaf size={20}/> : <MapPin size={20}/>} {habitat}</span>;
  return <section className="learning-world-reader" aria-label={item?.title || 'Thẻ sinh vật'}>
    <header>
      {inCatalog && <button className="learning-world-reader-back" aria-label="Về mục lục" onClick={close}><ArrowLeft size={22}/></button>}
      <div className="learning-world-reader-heading">
        {!inCatalog && item && <p className="learning-world-reader-context">{[place, item.group.replace(/^(Động vật|Thực vật)\s*[–-]\s*/u, '')].filter(Boolean).join(' · ')}</p>}
        <h2 ref={title} tabIndex={-1}>{item?.title || 'Thẻ sinh vật'}</h2>
      </div>
      <button aria-label="Đóng thẻ sinh vật" onClick={close}><X size={22}/></button>
    </header>
    {detail.loading && <p role="status">Đang mở thẻ…</p>}
    {detail.error && <p role="alert">{detail.error} <button onClick={detail.reload}>Thử lại</button></p>}
    {item && <><div className="learning-world-reader-body">
      {image && <img className="learning-world-reader-photo" src={image} alt={item.title}/>}
      {illustration && <small className="learning-world-credit">{illustration.caption}</small>}
      {!image && item.kind === 'species' && <div className="learning-world-reader-photo learning-world-no-photo">Chưa có ảnh để quan sát</div>}
      {photoCredit && <small className="learning-world-credit">{photoCredit.depicts && <>{photoCredit.depicts} · </>}<a href={photoCredit.source} target="_blank" rel="noreferrer">{photoCredit.author ? `Ảnh của ${photoCredit.author}` : 'Nguồn ảnh'}</a> · <a href={photoCredit.licenseUrl} target="_blank" rel="noreferrer">{photoCredit.licenseName}</a>{photoCredit.cropped && ' · đã cắt ảnh'}</small>}
      <div className="learning-world-reader-observe">
        <OceanListen text={recordedFact?.spokenText ?? recordedFact?.text ?? [item.title, ...(item.facts?.map(fact => fact.text) ?? [])].join('. ')}
          recording={recordedFact?.audio ?? (!item.facts?.length ? item.audio : undefined)} label="Nghe" />
        {!inCatalog && habitatBadge}
      </div>
      {item.facts?.map((fact, index) => <article key={index}><h3>{fact.label}</h3><p>{fact.text}</p></article>)}
      {inCatalog && habitatBadge}
      {error && <p role="alert">{error}</p>}
      </div><div className="learning-world-reader-actions">
        {item.kind === 'species' && (item.learned || learned
          ? <span className="learning-world-studied" role="status"><Check size={18}/> ĐÃ HỌC</span>
          : <button className="learning-world-primary" disabled={saving} onClick={() => void record()}><span className="learning-world-reader-complete" aria-hidden="true"><Check size={17} strokeWidth={3}/></span>{saving ? 'Đang lưu…' : 'Đánh dấu đã học'}</button>)}
        {(item.id === 'upper-2' || item.id === 'upper-5') && <button onClick={() => observe(item)}>{item.id === 'upper-5' ? 'Quan sát 3D' : 'Quan sát cá heo'}</button>}
      </div>
    </>}
  </section>;
}
