import { SearchField } from '@/shared/ui/controls/SearchField';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bookmark, Layers, Waves } from 'lucide-react';
import { useRouter } from '../../../app/router';
import { type OceanItem, type OceanItemPage, type OceanZone, oceanPath, useOceanData } from '../../../shared/api/learnerOcean';
import { CatalogPagination, RESOURCE_PAGE_SIZE } from '../../../shared/ui/catalog/CatalogPagination';
import { OptionPopover } from '../../../shared/ui/catalog/OptionPopover';
import { SourceCatalogItem } from './SourceCatalogItem';
import { SOURCE_RESOURCE_FORMATS as FORMATS, SOURCE_COLLECTION_TITLE } from '../../../shared/ui/catalog/sourceResourceFormats';
import { useCatalogMotion } from './useCatalogMotion';
import { useSourceBookmarks } from './useSourceBookmarks';
import './source-library.css';

export function ResourceFormatNav({ active, onSelect }: { active?: string; onSelect: (format: string) => void }) {
  return <nav className="source-formats" aria-label="Phân loại học liệu">
    {FORMATS.map(([key,label,Icon]) => <button type="button" key={key} aria-pressed={active === key} onClick={() => onSelect(key)}>
      <Icon size={24} aria-hidden="true"/><span>{label}</span>
    </button>)}
  </nav>;
}

let listReturn: { search: string; scrollY: number } | undefined;

export function SourceLibraryContent() {
  const { query, setQuery, navigate } = useRouter();
  const { saved, toggle } = useSourceBookmarks();
  const savedPageIndex = /^\d{1,9}$/.test(query.savedPage ?? '') ? Math.max(0, Number(query.savedPage) - 1) : 0;
  const savedPage = Math.min(savedPageIndex, Math.max(0, Math.ceil(saved.length / RESOURCE_PAGE_SIZE) - 1));
  const [text, setText] = useState(query.q || '');
  const isReef = query.kind === 'reef';
  const isCollection = query.kind === 'collection';
  const format = FORMATS.find(([key]) => key === query.kind) ?? FORMATS[0];
  const catalog = useOceanData<{zones: OceanZone[]}>(query.habitat || isReef ? 'zones' : null);
  const habitat = catalog.data?.zones.find(entry => entry.id === query.habitat);
  const kind = isReef || query.habitat ? 'species' : isCollection ? 'collection' : format[0];
  const zone = query.habitat || (isReef ? 'reef' : undefined);
  const allZones = kind !== 'species' && !zone ? '1' : undefined;
  const filters = {kind, zone, allZones};
  const groups = useOceanData<{items: {name: string; count: number}[]}>(query.saved ? null : oceanPath('groups', filters));
  const page = /^\d{1,9}$/.test(query.page ?? '') ? Math.max(1, Number(query.page)) : 1;
  const listPath = oceanPath('items', {...filters, group:query.shelf, q:query.q, page:String(page), limit:String(RESOURCE_PAGE_SIZE)});
  const list = useOceanData<OceanItemPage>(query.saved ? null : listPath);
  const heading = query.saved ? 'Học liệu đã lưu' : habitat?.title || (isReef ? 'Rạn san hô' : isCollection ? SOURCE_COLLECTION_TITLE : format[1]);
  const EmptyIcon = query.saved ? Bookmark : format[2];
  const count = groups.data && !query.q ? groups.data.items.reduce((total, group) =>
    !query.shelf || query.shelf === group.name ? total + group.count : total, 0) : undefined;
  const root = useRef<HTMLElement>(null);
  const initialSearch = useRef(typeof window === 'undefined' ? '' : window.location.search);
  const restore = useRef(listReturn?.search === initialSearch.current ? listReturn : undefined);
  useCatalogMotion(root, [kind, zone, query.shelf, query.q].join('|'), page, list.loading, Boolean(restore.current));
  useEffect(() => {
    if (list.loading || !restore.current) return;
    const { scrollY } = restore.current;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({top:scrollY,behavior:'instant'});
      restore.current = undefined;
      listReturn = undefined;
    });
    return () => cancelAnimationFrame(frame);
  }, [list.loading]);

  useEffect(() => { setText(query.q || ''); }, [query.q]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.trim() !== (query.q || '')) {
        setQuery({kind:query.kind || format[0],q:text.trim() || null,cursor:null,before:null,page:null});
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [text,query.q,query.kind,format,setQuery]);

  useEffect(() => {
    if (query.item) {
      navigate('/resources/' + encodeURIComponent(query.item), {
        replace:true, query:{...query,source:'1',item:null},
      });
    }
  }, [query,navigate]);

  function patch(values: Record<string, string | null>) {
    setQuery({cursor:null,before:null,page:null,savedPage:null,item:null,...values}, {replace:false});
  }

  function turnPage(number: number) {
    patch({page:number > 1 ? String(number) : null});
    root.current?.querySelector('h2')?.scrollIntoView({block:'start'});
  }

  function renderEntry(entry: OceanItem) {
    return <SourceCatalogItem key={entry.id} entry={entry} saved={saved.includes(entry.id)} onSave={() => toggle(entry.id)}
      onOpen={() => {
        listReturn = {search:window.location.search,scrollY:window.scrollY};
        navigate('/resources/' + encodeURIComponent(entry.id), {query:{...query,source:'1'}});
      }}/>;
  }

  const reefGroup = isReef ? query.fromGroup : undefined;
  const openGroups = () => navigate('/resources', {query:reefGroup ? {group:reefGroup} : {view:'catalog'}});

  return <section ref={root} className="learner-source-library" aria-label={heading}>
    <button className="resource-back source-back" type="button" onClick={openGroups}><ArrowLeft size={20} aria-hidden="true"/>
      {reefGroup ? 'Về nhóm Rạn san hô' : 'Các nhóm học liệu'}
    </button>
    <header className="source-section-heading">
      <div className="source-title"><h2>{query.shelf && !query.saved ? query.shelf : heading}</h2>
        {query.shelf && !query.saved && <span>{heading}</span>}
        {kind === 'flashcard' && count !== undefined && <span>{count} thẻ</span>}
      </div>
    <div className="source-filters" role="group" aria-label="Lọc học liệu"
      data-habitat={kind === 'species' && !query.saved} data-saved-only={Boolean(query.saved)}>
      {!query.saved && <>
        <SearchField className="source-filter-search" label="Tìm học liệu" value={text} onChange={setText}/>
        <OptionPopover className="source-filter-select"
          label="Nhóm học liệu" value={query.shelf || ''} icon={<Layers size={19} aria-hidden="true"/>}
          onChange={value => patch({shelf:value || null})} options={[
            {value:'',label:kind === 'download' ? 'Tất cả bộ tài liệu' : 'Tất cả nhóm'},
            ...(groups.data?.items.map(group => ({value:group.name,label:group.name,count:group.count})) ?? []),
          ]}/>
        {kind === 'species' && <OptionPopover className="source-filter-select source-filter-habitat"
          label="Tầng hoặc vùng biển theo Excel" value={zone || ''} icon={<Waves size={19} aria-hidden="true"/>}
          onChange={value => patch({habitat:value || null,kind:format[0],shelf:null})} options={[
            {value:'',label:'Tất cả vùng biển'},
            ...(['vertical','horizontal'] as const).flatMap(axis => catalog.data?.zones.filter(entry => entry.axis === axis)
              .map(entry => ({value:entry.id,label:entry.title,group:axis === 'vertical' ? 'Theo chiều dọc' : 'Theo chiều ngang'})) ?? []),
          ]}/>}
      </>}
      <button className="source-filter-bookmark" type="button" aria-pressed={Boolean(query.saved)} onClick={() => patch({saved:query.saved ? null : '1'})}><Bookmark size={20} aria-hidden="true"/> Đã lưu</button>
    </div>
    </header>
    {groups.error && <p className="resource-error" role="alert">{groups.error} <button onClick={groups.reload}>Thử lại</button></p>}
    {list.error && <p className="resource-error" role="alert">{list.error} <button onClick={list.reload}>Thử lại</button></p>}
    {list.loading && <p className="resource-empty" role="status">Đang mở học liệu…</p>}
    {list.data?.items.length === 0 && <div className="source-empty">
      <EmptyIcon size={34} strokeWidth={1.6} aria-hidden="true"/>
      <p>{query.q || query.shelf || page > 1 ? 'Chưa có học liệu phù hợp.' : 'Chưa có học liệu trong mục này.'}</p>
      {page > 1 ? <button onClick={() => patch({})}>Về trang đầu</button> :
        <button onClick={openGroups}>{reefGroup ? 'Về nhóm Rạn san hô' : 'Về các nhóm học liệu'}</button>}
    </div>}

    {query.saved ? <>
      <div className="resource-tile-grid source-result-grid" data-layout="saved">{saved.slice(savedPage * RESOURCE_PAGE_SIZE, (savedPage + 1) * RESOURCE_PAGE_SIZE).map(id =>
        <SavedResource key={id} id={id} render={renderEntry} onRemove={() => toggle(id)}/>)}
      </div>
      {!saved.length && <div className="source-empty"><Bookmark size={34} aria-hidden="true"/><p>Bé chưa lưu học liệu nào.</p></div>}
      <CatalogPagination label="Phân trang học liệu đã lưu" page={savedPage + 1} total={saved.length}
        onPage={number => setQuery({savedPage:number > 1 ? String(number) : null}, {replace:false})}/>
    </> : <>
      <div className="resource-tile-grid source-result-grid" data-layout={kind} aria-label="Danh sách học liệu">{list.data?.items.map(renderEntry)}</div>
      <CatalogPagination page={page} total={list.data?.total ?? 0} loading={list.loading} onPage={turnPage}/>
    </>}
  </section>;
}

function SavedResource({ id, render, onRemove }: { id: string; render: (item: OceanItem) => React.ReactNode; onRemove: () => void }) {
  const { data, error, errorStatus, reload } = useOceanData<OceanItem>('items/' + encodeURIComponent(id));
  if (errorStatus === 404) return <div className="resource-empty"><p>Học liệu này đã được gỡ khỏi thư viện.</p><button className="resource-control" onClick={onRemove}>Bỏ lưu</button></div>;
  if (error) return <div className="resource-error" role="alert">{error} <button onClick={reload}>Thử lại</button></div>;
  return data ? render(data) : null;
}
