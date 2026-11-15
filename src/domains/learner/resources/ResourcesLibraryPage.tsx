import { SearchField } from '@/shared/ui/controls/SearchField';
import { ResourceCurrent, ResourceSeascape } from '../../../shared/ui/visuals/ResourceSeascape';
import { focusDialogTrigger } from '../../../shared/ui/overlays/nativeDialogFocus';
import {ResourceGroupHeading} from './ResourceGroupHeading';
import { ResourceGroupGallery } from './ResourceGroupGallery';
import { ResourceWaterGarden } from './ResourceWaterGarden';
import { cropImageStyle } from '../../../shared/ui/visuals/resourceCoverCrop';
import './resources-catalog.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Layers, Volume2, Printer, PencilLine, Ellipsis, Home, ChevronRight, UserRound } from 'lucide-react';
import { useRouter } from '../../../app/router';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import { fetchPublicResources, type ResourceDto } from '../../../shared/api/catalog';
import { fetchResourceGroups, fetchResourceGroupById, type ResourceGroup } from '../../../shared/api/resourceGroups';
import { MediaTile } from '../../../shared/ui/catalog/MediaTile';
import { CatalogToolbar } from '../../../shared/ui/catalog/CatalogToolbar';
import { ResourceGroupChooser } from './ResourceGroupChooser';
import { rememberCatalog, peekCatalogReturn, takeCatalogReturn } from './catalogReturnState';
import {ColoringResourceTile} from './ColoringResourceTile';
import { getColoringGroupAsset, getColoringGroupIllustration } from './coloringVisuals';
import {LearnerCreativeBackdrop} from '../components/creative/LearnerCreativeBackdrop';
import './coloring-catalog.css';
import { useCatalogMotion } from './useCatalogMotion';
import { useOceanChoreography } from '../../../shared/ui/motion/useOceanChoreography';
import { CatalogPagination, RESOURCE_PAGE_SIZE } from '../../../shared/ui/catalog/CatalogPagination';
import { getResourceFormat } from '../../../shared/ui/catalog/sourceResourceFormats';
import { ResourceFormatNav, SourceLibraryContent } from './SourceLibraryPage';
import { SourceCatalogItem } from './SourceCatalogItem';
import { useResourceBookmarks } from './useResourceBookmarks';
import welcomeNarration from './resource-narration.json';

export function ResourcesLibraryPage() {
  const { query, navigate, currentPath } = useRouter();
  const creativeCatalog = currentPath === '/creative/coloring';
  const groupId = query.group;
  const sourceView = !creativeCatalog && !groupId && Boolean(
    query.kind === 'reef' || query.kind === 'collection' || query.habitat || query.item || query.source === '1');
  const format = getResourceFormat(query.kind);
  const returnState = useRef<ReturnType<typeof takeCatalogReturn>>(null);
  const initializedReturn = useRef(false);
  const filtered = Boolean(groupId || query.q || query.saved || query.kind || creativeCatalog);
  const [groups, setGroups] = useState<ResourceGroup[]>([]);
  const [focusedGroup, setFocusedGroup] = useState<ResourceGroup | null>(null);
  const [groupTotal, setGroupTotal] = useState(0);
  const [items, setItems] = useState<ResourceDto[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(query.q || '');
  const { saved, toggleSaved } = useResourceBookmarks();
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [choosingGroup, setChoosingGroup] = useState(false);
  const kind = creativeCatalog ? 'coloring' : query.kind || 'all';
  const groupPage = /^\d{1,9}$/.test(query.catalogPage ?? '') ? Math.max(1, Number(query.catalogPage)) : 1;
  const resourcePage = /^\d{1,9}$/.test(query.resourcePage ?? '') ? Math.max(1, Number(query.resourcePage)) : 1;
  const discovery = !sourceView && !filtered;
  const selected = groups.find(g => g.id === groupId) || (focusedGroup?.id === groupId ? focusedGroup : null);
  const savedIds = Object.keys(saved).filter(id => saved[id]);
  const savedSignature = savedIds.join(',');
  const savedFilterSignature = query.saved ? savedSignature : '';
  const catalogKey = [creativeCatalog?'creative':'resources',groupId || '',kind,query.q || '',query.saved || '',query.saved ? savedSignature : '',query.capability||'all',filtered ? resourcePage : groupPage,query.cursor || '',query.before || ''].join('|');
  const initialSignature = useRef(`${catalogKey}|${savedSignature}`);
  if (!initializedReturn.current) { returnState.current = peekCatalogReturn(catalogKey); initializedReturn.current = true; }
  const [history,setHistory] = useState<Array<string|undefined>>(()=>peekCatalogReturn(catalogKey)?.history || [undefined]);
  const previousKey=useRef(catalogKey);
  const pendingScroll = useRef<number | null>(null);
  const motionRoot = useRef<HTMLDivElement>(null);
  useEffect(() => oceanAudio.subscribe(speaking => {
    if (speaking) motionRoot.current?.querySelectorAll('audio').forEach(track => track.pause());
  }), []);
  const restoredCatalog = useRef(Boolean(returnState.current));
  const page = filtered ? creativeCatalog ? history.length : resourcePage : groupPage;
  const restoredScene = useRef({ key: catalogKey, page });
  useOceanChoreography(motionRoot, 'library', restoredCatalog.current && restoredScene.current.key === catalogKey && restoredScene.current.page === page);
  useCatalogMotion(motionRoot, filtered ? catalogKey : 'resource-groups', page, sourceView || loading, restoredCatalog.current);
  useEffect(()=>{if(creativeCatalog && previousKey.current!==catalogKey){previousKey.current=catalogKey;setHistory([undefined]);}},[catalogKey,creativeCatalog]);
  const patchQuery = (patch: Record<string, string | null>) => navigate(creativeCatalog ? '/creative/coloring' : '/resources', { preserveQuery: true, query: {resourcePage:null,cursor:null,before:null,...patch} });
  const openGroups = () => navigate('/resources', { query: { catalogPage: groupPage > 1 ? String(groupPage) : null } });

  useEffect(() => { setSearch(query.q || ''); }, [query.q]);
  useEffect(() => {
    if (sourceView) return;
    const timer = setTimeout(() => {
      if (search.trim() !== (query.q || '')) patchQuery({ q: search.trim() || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sourceView]);

  useEffect(() => {
    if (sourceView) return;
    const abort = new AbortController();
    const previous = returnState.current;
    if (previous?.key === catalogKey && initialSignature.current === `${catalogKey}|${savedSignature}`) {
      takeCatalogReturn(catalogKey);
      returnState.current = null;
      setGroups(previous.groups); setFocusedGroup(previous.focusedGroup); setGroupTotal(previous.groupTotal);
      setItems(previous.items); setCursor(previous.cursor); setTotal(previous.total); setLoading(false);
      pendingScroll.current = previous.scrollY;
      return () => abort.abort();
    }
    returnState.current = null;
    setError(''); setLoading(true); setItems([]); setCursor(null);
    if (!filtered) {
      const cursor = groupPage > 1 ? String((groupPage - 1) * RESOURCE_PAGE_SIZE) : undefined;
      fetchResourceGroups({ limit: RESOURCE_PAGE_SIZE, cursor }, abort.signal).then(page => {
        if (abort.signal.aborted) return;
        setGroups(page.items);
        setGroupTotal(page.total);
        if (!page.items.length && groupPage > 1) {
          const last = Math.ceil(page.total / RESOURCE_PAGE_SIZE);
          navigate('/resources', {replace:true,preserveQuery:true,query:{catalogPage:last > 1 ? String(last) : null}});
        }
      }).catch(err => { if (!abort.signal.aborted) setError(err.message); })
        .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    } else {
      if (groupId && focusedGroup?.id !== groupId && !groups.some(group => group.id === groupId)) fetchResourceGroupById(groupId, false, abort.signal).then(group => { if (!abort.signal.aborted) setFocusedGroup(group); }).catch(err => { if (!abort.signal.aborted) setError(err.message); });
      if (creativeCatalog && !groups.length) fetchResourceGroups({limit:3}, abort.signal).then(page => { if (!abort.signal.aborted) setGroups(page.items); }).catch(() => { /* Resource request below reports availability. */ });
      fetchPublicResources({ library:!creativeCatalog && !query.saved, capability:query.capability==='screen'||query.capability==='print'?query.capability:'all',groupId, kind, q: query.q, savedIds: query.saved ? savedIds : undefined,
        cursor: creativeCatalog ? history.at(-1) : query.cursor, before:creativeCatalog ? undefined : query.before,
        page:creativeCatalog || query.cursor || query.before ? undefined : resourcePage, limit: creativeCatalog ? 6 : RESOURCE_PAGE_SIZE }, abort.signal)
        .then(result => {
          if (abort.signal.aborted) return;
          setItems(result.items); setCursor(result.nextCursor); setTotal(result.total);
          if (!result.items.length && history.length > 1) setHistory(prev=>prev.slice(0,-1));
          if (!result.items.length && resourcePage > 1 && !creativeCatalog) {
            const last = Math.ceil(result.total / RESOURCE_PAGE_SIZE);
            navigate('/resources', {replace:true,preserveQuery:true,query:{resourcePage:last > 1 ? String(last) : null,cursor:null,before:null}});
          }
        })
        .catch(err => { if (!abort.signal.aborted) setError(err.message); })
        .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    }
    return () => abort.abort();
  }, [sourceView, groupId, kind, query.q, query.saved, query.capability, query.cursor, query.before, savedFilterSignature, retry, history, groupPage, resourcePage]);

  useEffect(() => {
    if (loading || pendingScroll.current === null) return;
    const frame = requestAnimationFrame(() => {
      if (pendingScroll.current !== null) window.scrollTo({top:pendingScroll.current,behavior:'instant'});
      pendingScroll.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [loading]);

  const goToPage = (number: number) => {
    const value = number > 1 ? String(number) : null;
    patchQuery(filtered ? {resourcePage:value} : {catalogPage:value});
  };
  const openResource = (id: string) => {
    rememberCatalog({key:catalogKey,groups,focusedGroup,groupTotal,items,cursor,total,history,scrollY:window.scrollY});
    navigate(`/resources/${id}`, { query: { group: groupId, kind: query.kind, q: query.q, saved: query.saved, capability:query.capability,
      catalogPage:query.catalogPage,resourcePage:query.resourcePage,cursor:query.cursor,before:query.before } });
  };
  const tile = (item: Pick<ResourceDto, 'id' | 'title' | 'kind' | 'coverUrl'>) => <MediaTile
    key={item.id} id={item.id} variant="resource-catalog" title={item.title} kind={item.kind}
    imageUrl={item.coverUrl} bookmarked={Boolean(saved[item.id])}
    onOpen={() => openResource(item.id)}
    onToggleBookmark={() => toggleSaved(item.id)}
    onSpeak={() => oceanAudio.speak(item.title, { profile: 'learner-resource' })} />;

  const catalog = useMemo(() => <>
      <h1 className="sr-only">{creativeCatalog ? "Tranh tô màu" : "Học liệu"}</h1>
      {creativeCatalog && <nav className="coloring-breadcrumb" aria-label="Đường dẫn"><button onClick={()=>navigate('/creative')}><Home size={16}/>Sáng tạo</button><ChevronRight size={13}/><span>Tranh tô màu</span></nav>}
      {!groupId && !creativeCatalog && <section aria-label="Giới thiệu học liệu" className="resources-banner resource-discovery-banner resource-ocean-banner">
        <div className="resources-banner-art" aria-hidden="true"><img src="/assets/learner-worlds/resource-hero-turtle.webp" alt="" fetchPriority="high"/></div>
        <div className="resource-banner-content"><button className="resource-listen" aria-label="Nghe giới thiệu học liệu" onClick={() => void oceanAudio.playNarration(welcomeNarration.audio, welcomeNarration.text, { profile: 'learner-resource' })}><Volume2 size={24}/></button><h2>Nghe · Xem · Khám phá</h2><p>Thế giới đại dương kỳ thú đang chờ bạn!</p></div>
      </section>}
      {!creativeCatalog && (!groupId || format) && <ResourceFormatNav active={format?.[0]}
        onSelect={value => {
          if (sourceView) navigate('/resources', {query:{kind:value},preserveQuery:false});
          else patchQuery({kind:query.kind === value ? null : value});
        }}/>}
      {!sourceView && <div className="resource-search-row" role="group" aria-label="Lọc học liệu">
        <SearchField className="resource-search" value={search} onChange={setSearch} placeholder={creativeCatalog ? 'Tìm tranh…' : 'Tìm học liệu'} label={creativeCatalog ? 'Tìm tranh' : 'Tìm học liệu'}/>
        {!creativeCatalog && <button data-ocean-action="group" className="resource-group-select" aria-haspopup="dialog" aria-label="Chọn nhóm học liệu"
          onClick={event => { focusDialogTrigger(event.currentTarget); setChoosingGroup(true); }}>
          <Layers size={22}/><span>{selected?.title || 'Chọn nhóm học liệu'}</span>
        </button>}
        <button className={`resource-control${creativeCatalog ? '' : ' source-filter-bookmark'}`} aria-pressed={Boolean(query.saved)} onClick={() => patchQuery({ saved: query.saved ? null : '1' })}><Bookmark size={22} aria-hidden="true"/> Đã lưu</button>
      </div>}
      {sourceView ? <>
        <SourceLibraryContent/>
      </> : <>
      {groupId && !creativeCatalog && <ResourceGroupHeading key={groupId} group={selected}/>}
      <div className="resource-section-heading">
        <h2>{creativeCatalog?'Chọn tranh để tô':groupId ? 'Trong nhóm này' : query.saved ? 'Học liệu đã lưu' : query.q ? 'Kết quả tìm kiếm' : format?.[1] || 'Khám phá theo nhóm'}</h2>
        {creativeCatalog && <button data-ocean-action="group" className="resource-group-select" aria-haspopup="dialog" onClick={event => { focusDialogTrigger(event.currentTarget); setChoosingGroup(true); }}><Layers size={22}/>Chọn nhóm tranh</button>}
      </div>
      {creativeCatalog&&<><div className="coloring-quick-groups">{groups.slice(0,3).map((g,index)=><button key={g.id} aria-pressed={groupId===g.id} onClick={()=>patchQuery({group:g.id})}><img src={getColoringGroupIllustration(g.title) || g.coverUrl || getColoringGroupAsset(index)} style={!getColoringGroupIllustration(g.title) && g.coverUrl ? cropImageStyle(g.coverCrop) : undefined} alt=""/><strong>{g.title}</strong></button>)}<button onClick={event=>{focusDialogTrigger(event.currentTarget);setChoosingGroup(true);}}><Ellipsis/><strong>Xem tất cả nhóm</strong></button></div><div className="coloring-capabilities" role="group" aria-label="Cách tô màu"><h3>{selected?.title||'Tất cả tranh'} <small>{total} tranh{selected?' trong nhóm':''}</small></h3>{[['screen','Tô trên màn hình'],['print','Có bản in']].map(([id,label])=><button className="resource-control" data-capability={id} key={id} aria-pressed={(query.capability||'all')===id} onClick={()=>patchQuery({capability:query.capability===id?null:id})}>{id==='screen'?<PencilLine size={16}/>:id==='print'?<Printer size={16}/>:null}{label}</button>)}</div></>}
      {filtered && !creativeCatalog && <>
        <button data-ocean-action="group" className="resource-back" onClick={openGroups}><ArrowLeft size={20}/> Các nhóm học liệu</button>
        {groupId && kind==='visual' && <CatalogToolbar role="learner" activeFormat={kind} onSelectFormat={value => patchQuery({ kind: value })}/>}
        <p className="resource-count">{total} học liệu</p>
      </>}
      {error && <div className="resource-error" role="alert">{error} <button onClick={() => setRetry(r => r+1)}>Thử lại</button></div>}
      {loading ? <p role="status" className="resource-empty">Đang mở thư viện…</p> : filtered ?
        items.length ? <div className={format && !creativeCatalog ? 'resource-tile-grid source-result-grid' : 'resource-tile-grid'} aria-label="Danh sách học liệu" data-layout={format?.[0]}>{items.map((item,index)=>creativeCatalog?<ColoringResourceTile key={item.id} resource={item} index={index} onOpen={()=>{rememberCatalog({key:catalogKey,groups,focusedGroup,groupTotal,items,cursor,total,history,scrollY:window.scrollY});navigate(`/creative/coloring/${item.id}`,{query:{...query}});}} onDraw={template=>{rememberCatalog({key:catalogKey,groups,focusedGroup,groupTotal,items,cursor,total,history,scrollY:window.scrollY});navigate('/creative/drawing',{query:{...query,template,fromCreative:'1'}});}}/> : format ? <SourceCatalogItem key={item.id}
          entry={{id:item.id,title:item.title,kind:kind === 'download' ? kind : item.kind,
            image:item.coverUrl ?? undefined, file:kind === 'download' ? item.content.downloadUrl || item.mediaUrl || undefined : item.mediaUrl ?? undefined}}
          saved={Boolean(saved[item.id])} onSave={() => toggleSaved(item.id)} onOpen={() => openResource(item.id)}/> : tile(item))}</div> : !error && <p className="resource-empty"><span>{query.saved && !savedIds.length ? 'Bé chưa lưu học liệu nào.' : format && !query.q && !groupId ? 'Chưa có học liệu trong mục này.' : 'Chưa có học liệu phù hợp.'}</span> <button onClick={() => creativeCatalog ? patchQuery({group:null,q:null,saved:null,capability:null}) : openGroups()}>Xem các nhóm</button></p>
        : groups.length
          ? <ResourceGroupGallery groups={groups} onOpen={id => patchQuery({group:id})} />
          : !error && <p className="resource-empty">Thư viện đang được chuẩn bị.</p>}
      {creativeCatalog ? (page>1 || cursor) && <nav className="resource-more resource-page-navigation" aria-label="Phân trang học liệu">
        <button disabled={loading || page===1} onClick={()=>setHistory(prev=>prev.slice(0,-1))}><ArrowLeft size={22}/>Trang trước</button>
        <span role="status">Trang {page}</span>
        <button disabled={loading || !cursor} onClick={()=>setHistory(prev=>[...prev,cursor!])}>Trang sau<ArrowRight size={22}/></button>
      </nav> : <CatalogPagination page={page} total={filtered ? total : groupTotal} loading={loading} onPage={goToPage}
        label={filtered ? 'Phân trang học liệu' : 'Phân trang nhóm'}/>}
      {creativeCatalog&&<button className="coloring-profile-link" onClick={()=>navigate('/profile')}><UserRound size={17}/>Tác phẩm đã hoàn thành ở Hồ sơ <ArrowRight size={17}/></button>}
      </>}
  </>, [creativeCatalog, format, sourceView, groupId, search, query, kind, groups, selected, focusedGroup, groupTotal, items, cursor, total, loading, error, history, page, saved, catalogKey, navigate]);
  return <LearnerShell activeNav={creativeCatalog ? "creative" : "resources"}>
    <div ref={motionRoot} className={`resource-library ${creativeCatalog?'learner-creative-page coloring-resource-library':'resource-library-ocean'}`} data-group-view={Boolean(groupId)} data-source-view={sourceView} data-discovery={discovery}
      onPlay={event => {
        if (!(event.target instanceof HTMLAudioElement)) return;
        oceanAudio.stop();
        event.currentTarget.querySelectorAll('audio').forEach(track => { if (track !== event.target) track.pause(); });
      }}>{creativeCatalog?<LearnerCreativeBackdrop variant="catalog"/>:<><ResourceSeascape tone="learner"/>{!discovery && <ResourceWaterGarden/>}<ResourceCurrent/></>}{catalog}
    </div>
    {choosingGroup && !sourceView && <ResourceGroupChooser onClose={() => setChoosingGroup(false)} onChoose={id => {
      setChoosingGroup(false);
      patchQuery({group:id});
    }}/>}
  </LearnerShell>;
}
