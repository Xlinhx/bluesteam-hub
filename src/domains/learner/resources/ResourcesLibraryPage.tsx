import { ResourceSeascape, ResourceCurrent } from '../../../shared/ui/visuals/ResourceSeascape';
import { focusDialogTrigger } from '../../../shared/ui/overlays/nativeDialogFocus';
import {ResourceGroupHeading} from './ResourceGroupHeading';
import {ResourceSurface} from '../../../shared/ui/visuals/ResourceSurface';
import { cropImageStyle } from '../../../shared/ui/visuals/resourceCoverCrop';
import './resources-catalog.css';
import '../../../shared/ui/catalog/resource-controls.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Layers, Search, Volume2, Waves, Printer, PencilLine, Ellipsis, Home, ChevronRight, UserRound } from 'lucide-react';
import { useRouter } from '../../../app/router';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import { fetchPublicResources, type ResourceDto } from '../../../shared/api/catalog';
import { fetchResourceGroups, fetchResourceGroupById, type ResourceGroup } from '../../../shared/api/resourceGroups';
import { CatalogToolbar } from '../../../shared/ui/catalog/CatalogToolbar';
import { MediaTile } from '../../../shared/ui/catalog/MediaTile';
import { ResourceGroupChooser } from './ResourceGroupChooser';
import { rememberCatalog, peekCatalogReturn, takeCatalogReturn } from './catalogReturnState';
import {ColoringResourceTile} from './ColoringResourceTile';
import { getColoringGroupAsset, getColoringGroupIllustration } from './coloringVisuals';
import {LearnerCreativeBackdrop} from '../components/creative/LearnerCreativeBackdrop';
import './coloring-catalog.css';
import { useCatalogMotion } from './useCatalogMotion';
import { useOceanChoreography } from '../../../shared/ui/motion/useOceanChoreography';
import { OceanCabinet } from '../../../shared/ui/visuals/OceanCabinet';

const SAVED_KEY = 'bluesteam_saved_resources_v2';
function readSaved(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '{}'); } catch { return {}; }
}

export function ResourcesLibraryPage() {
  const { query, navigate, currentPath } = useRouter();
  const creativeCatalog = currentPath === '/creative/coloring';
  const groupId = query.group;
  const returnState = useRef<ReturnType<typeof takeCatalogReturn>>(null);
  const initializedReturn = useRef(false);
  const filtered = Boolean(groupId || query.q || query.saved || query.kind==='coloring' || creativeCatalog);
  const [groups, setGroups] = useState<ResourceGroup[]>([]);
  const [focusedGroup, setFocusedGroup] = useState<ResourceGroup | null>(null);
  const [groupCursor, setGroupCursor] = useState<string | null>(null);
  const [items, setItems] = useState<ResourceDto[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(query.q || '');
  const [saved, setSaved] = useState<Record<string, boolean>>(readSaved);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [choosingGroup, setChoosingGroup] = useState(false);
  const kind = creativeCatalog ? 'coloring' : query.kind === 'image' || query.kind === 'flashcard' ? 'visual' : query.kind || 'visual';
  const selected = groups.find(g => g.id === groupId) || (focusedGroup?.id === groupId ? focusedGroup : null);
  const savedIds = Object.keys(saved).filter(id => saved[id]);
  const savedSignature = savedIds.join(',');
  const savedFilterSignature = query.saved ? savedSignature : '';
  const catalogKey = [creativeCatalog?'creative':'resources',groupId || '',kind,query.q || '',query.saved || '',query.saved ? savedSignature : '',query.capability||'all'].join('|');
  const initialSignature = useRef(`${catalogKey}|${savedSignature}`);
  if (!initializedReturn.current) { returnState.current = peekCatalogReturn(catalogKey); initializedReturn.current = true; }
  const [history,setHistory] = useState<Array<string|undefined>>(()=>peekCatalogReturn(catalogKey)?.history || [undefined]);
  const previousKey=useRef(catalogKey);
  const motionRoot = useRef<HTMLDivElement>(null);
  const restoredCatalog = useRef(Boolean(returnState.current));
  const restoredScene = useRef({ key: catalogKey, page: history.length });
  useOceanChoreography(motionRoot, 'library', restoredCatalog.current && restoredScene.current.key === catalogKey && restoredScene.current.page === history.length);
  useCatalogMotion(motionRoot, catalogKey, history.length, loading, restoredCatalog.current);
  useEffect(()=>{if(previousKey.current!==catalogKey){previousKey.current=catalogKey;setHistory([undefined]);}},[catalogKey]);
  const patchQuery = (patch: Record<string, string | null>) => navigate(creativeCatalog ? '/creative/coloring' : '/resources', { preserveQuery: true, query: patch });

  useEffect(() => { setSearch(query.q || ''); }, [query.q]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() !== (query.q || '')) patchQuery({ q: search.trim() || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const abort = new AbortController();
    const previous = returnState.current;
    if (previous?.key === catalogKey && initialSignature.current === `${catalogKey}|${savedSignature}`) {
      takeCatalogReturn(catalogKey);
      returnState.current = null;
      setGroups(previous.groups); setFocusedGroup(previous.focusedGroup); setGroupCursor(previous.groupCursor);
      setItems(previous.items); setCursor(previous.cursor); setTotal(previous.total); setLoading(false);
      const frame = requestAnimationFrame(() => window.scrollTo({top:previous.scrollY,behavior:'instant' as ScrollBehavior}));
      return () => { cancelAnimationFrame(frame); abort.abort(); };
    }
    returnState.current = null;
    setError(''); setLoading(true); setItems([]); setCursor(null);
    if (!filtered) {
      fetchResourceGroups({ limit: 3, cursor: history[history.length-1] }, abort.signal).then(page => {
        setGroups(page.items); setGroupCursor(page.nextCursor);if(!page.items.length&&history.length>1)setHistory(prev=>prev.slice(0,-1));
      }).catch(err => { if (!abort.signal.aborted) setError(err.message); })
        .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    } else {
      if (groupId) fetchResourceGroupById(groupId, false, abort.signal).then(setFocusedGroup).catch(err => { if (!abort.signal.aborted) setError(err.message); });
      if (!groups.length) fetchResourceGroups({}, abort.signal).then(page => { setGroups(page.items); setGroupCursor(page.nextCursor); }).catch(() => { /* Resource request below reports availability. */ });
      fetchPublicResources({ capability:query.capability==='screen'||query.capability==='print'?query.capability:'all',groupId, kind, q: query.q, savedIds: query.saved ? savedIds : undefined, cursor: history[history.length-1], limit: kind==='coloring'?6:8 }, abort.signal)
        .then(page => { if (!abort.signal.aborted) { setItems(page.items); setCursor(page.nextCursor); setTotal(page.total);if(!page.items.length&&history.length>1)setHistory(prev=>prev.slice(0,-1)); } })
        .catch(err => { if (!abort.signal.aborted) setError(err.message); })
        .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    }
    return () => abort.abort();
  }, [groupId, kind, query.q, query.saved, query.capability, savedFilterSignature, retry, history]);

  const more = () => {
    const next=filtered?cursor:groupCursor;
    if(!loading && next)setHistory(prev=>[...prev,next]);
  };
  const turnBack=()=>{if(!loading)setHistory(prev=>prev.slice(0,-1));};
  const toggleSaved = (id: string) => setSaved(prev => {
    const next = { ...prev, [id]: !prev[id] };
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* Device storage may be full. */ }
    return next;
  });
  const tile = (item: Pick<ResourceDto, 'id' | 'title' | 'kind' | 'coverUrl'>) => <MediaTile
    key={item.id} id={item.id} variant="resource-catalog" title={item.title} kind={item.kind}
    imageUrl={item.coverUrl} bookmarked={Boolean(saved[item.id])}
    onOpen={() => {
      rememberCatalog({key:catalogKey,groups,focusedGroup,groupCursor,items,cursor,total,history,scrollY:window.scrollY});
      navigate(`/resources/${item.id}`, { query: { group: groupId || null, kind: query.kind || null, q: query.q || null, saved: query.saved || null,capability:query.capability||null } });
    }}
    onToggleBookmark={() => toggleSaved(item.id)} />;

  const catalog = useMemo(() => <>
      <h1 className="sr-only">{creativeCatalog ? "Tranh tô màu" : "Học liệu"}</h1>
      {kind==='coloring'&&<nav className="coloring-breadcrumb" aria-label="Đường dẫn"><button onClick={()=>navigate('/creative')}><Home size={16}/>Sáng tạo</button><ChevronRight size={13}/><span>Tranh tô màu</span></nav>}
      <div className="resource-search-row">
        <label className="resource-search"><Search size={21}/><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={kind==='coloring'?'Tìm tranh…':'Tìm học liệu'} aria-label={kind==='coloring'?'Tìm tranh':'Tìm học liệu'} /></label>
        <button className="resource-control" aria-pressed={Boolean(query.saved)} onClick={() => patchQuery({ saved: query.saved ? null : '1' })}><Bookmark size={22}/> Đã lưu</button>
      </div>
      {!groupId && kind!=='coloring' && <section aria-label="Giới thiệu học liệu" className="resources-banner resource-discovery-banner">
        <div className="resources-banner-art" aria-hidden="true"><OceanCabinet variant="discovery"/></div>
        <div className="resource-banner-content"><button className="resource-listen" aria-label="Nghe giới thiệu học liệu" onClick={() => oceanAudio.speak('Nghe, xem, khám phá. Chọn một nhóm để khám phá thế giới đại dương!')}><Volume2 size={24}/></button><h2>Nghe · Xem · Khám phá</h2><p>Thế giới đại dương kỳ thú đang chờ bạn!</p></div>
      </section>}
      {groupId && kind!=='coloring' && <ResourceGroupHeading key={groupId} group={selected}/>}
      <div className="resource-section-heading">
        <h2>{kind==='coloring'?'Chọn tranh để tô':groupId ? 'Trong nhóm này' : query.saved ? 'Học liệu đã lưu' : query.q ? 'Kết quả tìm kiếm' : 'Khám phá theo nhóm'}</h2>
        <button data-ocean-action="group" className="resource-group-select" aria-haspopup="dialog" onClick={event => { focusDialogTrigger(event.currentTarget); setChoosingGroup(true); }}><Layers size={22}/>{kind==='coloring'?'Chọn nhóm tranh':'Chọn nhóm học liệu'}</button>
      </div>
      {kind==='coloring'&&<><div className="coloring-quick-groups">{groups.slice(0,3).map((g,index)=><button key={g.id} aria-pressed={groupId===g.id} onClick={()=>patchQuery({group:g.id})}><img src={getColoringGroupIllustration(g.title) || g.coverUrl || getColoringGroupAsset(index)} style={!getColoringGroupIllustration(g.title) && g.coverUrl ? cropImageStyle(g.coverCrop) : undefined} alt=""/><strong>{g.title}</strong></button>)}<button onClick={event=>{focusDialogTrigger(event.currentTarget);setChoosingGroup(true);}}><Ellipsis/><strong>Xem tất cả nhóm</strong></button></div><div className="coloring-capabilities" role="group" aria-label="Cách tô màu"><h3>{selected?.title||'Tất cả tranh'} <small>{total} tranh{selected?' trong nhóm':''}</small></h3>{[['screen','Tô trên màn hình'],['print','Có bản in']].map(([id,label])=><button className="resource-control" data-capability={id} key={id} aria-pressed={(query.capability||'all')===id} onClick={()=>patchQuery({capability:query.capability===id?null:id})}>{id==='screen'?<PencilLine size={16}/>:id==='print'?<Printer size={16}/>:null}{label}</button>)}</div></>}
      {filtered && kind!=='coloring' && <><button data-ocean-action="group" className="resource-back" onClick={() => navigate('/resources')}><ArrowLeft size={20}/> Các nhóm học liệu</button><CatalogToolbar role="learner" activeFormat={kind} onSelectFormat={(value: string) => patchQuery({ kind: value })}/><p className="resource-count">{total} học liệu</p></>}
      {error && <div className="resource-error" role="alert">{error} <button onClick={() => setRetry(r => r+1)}>Thử lại</button></div>}
      {loading ? <p role="status" className="resource-empty">Đang mở thư viện…</p> : filtered ?
        items.length ? <div className="resource-tile-grid" aria-label="Danh sách học liệu">{items.map((item,index)=>kind==='coloring'?<ColoringResourceTile key={item.id} resource={item} index={index} onOpen={()=>{rememberCatalog({key:catalogKey,groups,focusedGroup,groupCursor,items,cursor,total,history,scrollY:window.scrollY});navigate(`${creativeCatalog ? '/creative/coloring' : '/resources'}/${item.id}`,{query:{...query}});}} onDraw={template=>{rememberCatalog({key:catalogKey,groups,focusedGroup,groupCursor,items,cursor,total,history,scrollY:window.scrollY});navigate('/creative/drawing',{query:{...query,template,...(creativeCatalog ? {fromCreative:'1'} : {})}});}}/>:tile(item))}</div> : !error && <p className="resource-empty">Chưa có học liệu phù hợp. <button onClick={() => creativeCatalog ? patchQuery({group:null,q:null,saved:null,capability:null}) : navigate('/resources')}>Xem các nhóm</button></p>
        : <div className="resource-group-list">{groups.map((g,index) => <section key={g.id} className="resource-group-section" aria-labelledby={`group-${g.id}`}>
          <ResourceSurface variant={(['shelf-lagoon','shelf-sandbank','shelf-inlet'] as const)[index%3]}/>
          <button data-ocean-action="group" className="resource-group-portrait" aria-label={`Mở nhóm ${g.title}`} onClick={() => patchQuery({ group: g.id })}>{g.coverUrl ? <img src={g.coverUrl} alt="" style={cropImageStyle(g.coverCrop)}/> : <Waves size={38}/>}</button>
          <div className="resource-group-content"><header><h3 id={`group-${g.id}`}>{g.title}</h3><button data-ocean-action="group" onClick={() => patchQuery({ group: g.id })}>Mở nhóm <ArrowRight size={22}/></button></header><div className="resource-tile-grid">{g.previews.map(tile)}</div>{!g.previews.length && <p>Nhóm này đang được chuẩn bị.</p>}</div>
        </section>)}{!groups.length && !error && <p className="resource-empty">Thư viện đang được chuẩn bị.</p>}</div>}
      {(history.length>1 || (filtered?cursor:groupCursor)) && <nav className="resource-more resource-page-navigation" aria-label="Phân trang học liệu">
        <button disabled={loading || history.length===1} onClick={turnBack}><ArrowLeft size={22}/>Trang trước</button>
        <span role="status">Trang {history.length}</span>
        <button disabled={loading || !(filtered?cursor:groupCursor)} onClick={more}>{filtered?'Trang sau':'Nhóm khác'}<ArrowRight size={22}/></button>
      </nav>}
      {kind==='coloring'&&<button className="coloring-profile-link" onClick={()=>navigate('/profile')}><UserRound size={17}/>Tác phẩm đã hoàn thành ở Hồ sơ <ArrowRight size={17}/></button>}
  </>, [creativeCatalog, groupId, search, query, kind, groups, selected, focusedGroup, groupCursor, items, cursor, total, loading, error, history, saved, catalogKey, navigate]);
  return <LearnerShell activeNav={creativeCatalog ? "creative" : "resources"}>
    <div ref={motionRoot} className={`resource-library ${kind==='coloring'?'learner-creative-page coloring-resource-library':''}`} data-group-view={Boolean(groupId)}>{kind==='coloring'?<LearnerCreativeBackdrop variant="catalog"/>:<><ResourceSeascape tone="learner" sceneKey={groupId || 'overview'}/><ResourceCurrent/></>}{catalog}
    </div>
    {choosingGroup && <ResourceGroupChooser onClose={() => setChoosingGroup(false)} onChoose={id => { setChoosingGroup(false); patchQuery({group:id,kind:kind==='coloring'?'coloring':null,q:null,saved:null}); }}/>}
  </LearnerShell>;
}
