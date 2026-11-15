import { useEffect, useRef, useState } from 'react';
import { Volume2, ArrowRight, RotateCcw, ChevronLeft, Compass, Waves } from 'lucide-react';
import { useRouter } from '../../../app/router';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import { InteractiveWorlds, resolveInteractiveKind } from '../../../shared/ui/navigation/InteractiveWorlds';
import { SearchField } from '../../../shared/ui/controls/SearchField';
import { fetchInteractiveActivitiesPage, fetchPublicModels, type ActivityDto, type Model3DDto } from '../../../shared/api/catalog';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import { fetchInteractiveGroups, type InteractiveGroup } from '../../../shared/api/interactiveGroups';
import { ActivityCatalogCard, type CatalogActivity } from './ActivityCatalogCard';
import './game-lab.css';
import { InteractiveSeascape } from '../../../shared/ui/visuals/InteractiveSeascape';

export function GameLabPage() {
  const { query, currentPath, setQuery, navigate } = useRouter();
  const kind = resolveInteractiveKind(query.kind || (currentPath.includes('simulations') ? 'simulation' : currentPath.endsWith('/3d') || currentPath === '/3d' ? 'model3d' : 'game'));
  const [search, setSearch] = useState(query.q || '');
  const [items, setItems] = useState<Array<ActivityDto | Model3DDto>>([]);
  const [total, setTotal] = useState(0);
  const [groups, setGroups] = useState<InteractiveGroup[]>([]);
  const [groupCursor, setGroupCursor] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const generation = useRef(0);
  useEffect(() => { setSearch(query.q || ''); }, [query.q]);
  useEffect(() => {
    const version = ++generation.current;
    const controller = new AbortController();
    setLoading(true); setMoreLoading(false); setError(null); setItems([]); setCursor(null);
    const params = { q: query.q, groupId: query.groupId, limit: 9 };
    const request = kind === 'model3d' ? fetchPublicModels(params, controller.signal) : fetchInteractiveActivitiesPage({ ...params, kind }, controller.signal);
    Promise.all([request,fetchInteractiveGroups(kind,false,undefined,controller.signal)]).then(([page,groupPage]) => {
      if (version !== generation.current || controller.signal.aborted) return;
      setItems(page.items); setTotal(page.total); setCursor(page.nextCursor);
      setGroups(groupPage.items); setGroupCursor(groupPage.nextCursor);
    }).catch(err => {
      if (!controller.signal.aborted && version === generation.current) setError(err?.message || 'Không thể tải hoạt động. Bé thử lại nhé.');
    }).finally(() => { if (version === generation.current && !controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [kind, query.q, query.groupId, retry]);
  const loadMore = async () => {
    if (!cursor || moreLoading) return;
    const version = generation.current;
    setMoreLoading(true); setError(null);
    try {
      const params = { q: query.q, groupId: query.groupId, limit: 9, cursor };
      const page = kind === 'model3d' ? await fetchPublicModels(params) : await fetchInteractiveActivitiesPage({ ...params, kind });
      if (version !== generation.current) return;
      setItems(prev => [...prev, ...page.items.filter(item => !prev.some(p => p.id === item.id))]);
      setCursor(page.nextCursor); setTotal(page.total);
    } catch { if (version === generation.current) setError('Chưa tải thêm được. Bé thử lại nhé.'); }
    finally { if (version === generation.current) setMoreLoading(false); }
  };
  const loadMoreGroups = async () => {
    if (!groupCursor || moreLoading) return;
    const version = generation.current;
    setMoreLoading(true); setError(null);
    try {
      const page = await fetchInteractiveGroups(kind,false,groupCursor);
      if (version !== generation.current) return;
      setGroups(previous => [...previous,...page.items.filter(item => !previous.some(group => group.id === item.id))]);
      setGroupCursor(page.nextCursor);
    } catch { if (version === generation.current) setError('Chưa tải thêm được nhóm. Bé thử lại nhé.'); }
    finally { if (version === generation.current) setMoreLoading(false); }
  };
  const openItem = (item: CatalogActivity) => {
    if (item.templateKey === 'water-column') {
      navigate('/learning', {query:{axis:'vertical'}});
      return;
    }
    navigate(`/interactive/${kind === 'model3d' ? 'models' : 'activities'}/${item.id}`, { query: { returnTo: `/interactive?${new URLSearchParams({ kind, ...(query.groupId ? { groupId: query.groupId } : {}), ...(query.view ? { view: query.view } : {}), ...(query.q ? { q: query.q } : {}) })}` } });
  };
  const showGroups = query.view !== 'all' && !query.groupId && !query.q && groups.length > 0;
  return <LearnerShell activeNav="interactive"><InteractiveSeascape scene={`${kind}:${query.groupId||''}:${query.q||''}:${query.view||''}`} audience="learner" className="ocean-play-catalog">
    <section className="ocean-play-catalog__gateway" aria-labelledby="interactive-title">
      <div className="ocean-play-catalog__intro">
        <div><h1 id="interactive-title">Chơi và khám phá</h1><p>Bé muốn khám phá điều gì?</p></div>
        <button className="ocean-audio-button" aria-label="Nghe hướng dẫn trang Tương tác" onClick={() => oceanAudio.speak('Bé chọn Khám phá 3D để xoay và ngắm sinh vật biển. Chọn Trò chơi để ghép hình và tìm nhà cho các bạn. Chọn Mô phỏng để thử xem biển thay đổi ra sao. Chọn Tình huống để quyết định cách giúp đại dương. Bé chọn hoạt động yêu thích rồi chạm Chơi ngay nhé.')}><Volume2 /></button>
      </div>
      <InteractiveWorlds listen value={kind} onChange={next => navigate('/interactive', { query: { kind: next, q: query.q, view: query.view } })} />
      {(kind === 'simulation' || kind === 'model3d') && <button className="learning-back" onClick={() => navigate('/learning', {query:{}})}><Compass size={20}/> Khám phá các vùng biển trong Học tập <ArrowRight size={17}/></button>}
      <div className="ocean-catalog-toolbar">
        <form className="ocean-play-search" onSubmit={event => { event.preventDefault(); setQuery({ q: search.trim() || null, cursor: null }); }}>
          <SearchField type="text" label="Tìm hoạt động" placeholder="Tìm hoạt động…" value={search} onChange={setSearch}
            onClear={() => { setSearch(''); setQuery({ q: null, cursor: null }); }}
            trailingAction={<button className="ui-search-submit" type="submit" aria-label="Tìm"><ArrowRight size={18} aria-hidden="true"/></button>}/>
        </form>
        <select className="ui-filter-control" aria-label="Chọn nhóm hoạt động" value={query.groupId || (query.view === 'all' ? '__all' : '')} onChange={event => { const value = event.target.value; setQuery({groupId: value && value !== '__all' ? value : null, view: value === '__all' ? 'all' : null, cursor:null}); }}>
          <option value="">Tất cả nhóm</option><option value="__all">Tất cả hoạt động</option>
          {groups.map(group => <option key={group.id} value={group.id}>{group.title}</option>)}
          {query.groupId && !groups.some(group => group.id === query.groupId) && <option value={query.groupId}>Nhóm đang chọn</option>}
        </select>
        {!loading && !error && <p className="ocean-catalog-count">{total} hoạt động</p>}
      </div>
    </section>
    <section className="ocean-play-catalog__results" aria-label="Danh sách hoạt động" aria-busy={loading}>
      {query.groupId && <div className="ocean-group-heading"><button onClick={() => setQuery({groupId:null})}><ChevronLeft/>Về các nhóm</button><h2>{groups.find(group => group.id === query.groupId)?.title || 'Nhóm hoạt động'}</h2></div>}
      {error && <div className="ocean-catalog-message" role="alert"><p>{error}</p><button onClick={() => showGroups && groupCursor ? void loadMoreGroups() : items.length ? void loadMore() : setRetry(n => n + 1)}><RotateCcw size={20} />Thử lại</button></div>}
      {loading ? <div className="ocean-activity-grid" aria-label="Đang tải hoạt động">{[0, 1, 2].map(n => <div key={n} className="ocean-activity-skeleton" />)}</div> : showGroups ? <>{groups.map(group => <section key={group.id} className="ocean-activity-group" aria-label={group.title}><div className="ocean-group-heading">{group.title === 'Ngôi nhà đại dương' ? <Compass size={32} aria-hidden="true"/> : <Waves size={32} aria-hidden="true"/>}<h2>{group.title}</h2><button className="ocean-audio-button" aria-label={`Nghe nhóm ${group.title}`} onClick={() => oceanAudio.speak(group.title)}><Volume2 size={21}/></button><button className="ocean-group-open" onClick={() => setQuery({groupId:group.id})}>Mở nhóm<ArrowRight/></button></div><div className="ocean-activity-grid">{group.previews.map(item => <ActivityCatalogCard key={item.id} item={item} kind={kind} onOpen={() => openItem(item)}/>)}</div></section>)}{groupCursor && <div className="ocean-catalog-more"><button disabled={moreLoading} onClick={() => void loadMoreGroups()}>Xem thêm nhóm</button></div>}</> : !items.length && !error ? <div className="ocean-catalog-message"><h2>{query.q ? 'Chưa tìm thấy hoạt động' : query.groupId ? 'Nhóm chưa có hoạt động đang hiển thị' : 'Chưa có hoạt động trong khu này'}</h2><p>Bé có thể chọn khu khác hoặc tìm tên hoạt động nhé.</p>{query.q && <button onClick={() => setQuery({ q: null, topics: null, topic: null })}>Xem tất cả trong khu này</button>}</div> : <div className="ocean-activity-grid">{items.map(item => <ActivityCatalogCard key={item.id} item={item} kind={kind} onOpen={() => openItem(item)}/>)}</div>}
      {cursor && !loading && !showGroups && <div className="ocean-catalog-more"><button disabled={moreLoading} onClick={() => void loadMore()}>{moreLoading ? 'Đang tải…' : 'Xem thêm'}</button></div>}
    </section>
  </InteractiveSeascape></LearnerShell>;
}
