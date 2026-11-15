import { SearchField } from '@/shared/ui/controls/SearchField';
import { ArrowLeft, BookOpen, Check, Compass, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useRouter } from '../../../app/router';
import { type OceanItem, type OceanZone, oceanApi, oceanPath, useOceanData } from '../../../shared/api/learnerOcean';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import { OceanListen } from '../../../shared/ui/media/OceanListen';
import { useLocalIdentity } from '../../../shared/ui/identity/useLocalIdentity';
import { useMovingMarker } from '../../../shared/ui/motion/useMovingMarker';
import { LearningDive } from './LearningDive';
import { LearningWorld } from './LearningWorld';
import './learning.css';

const LearningModel = lazy(() => import('./LearningModel').then(module => ({default:module.LearningModel})));

type ItemPage = { items: OceanItem[]; nextCursor: string | null };

export function LearningPage({ legacy = false }: { legacy?: boolean }) {
  const { query } = useRouter();
  if (legacy || ['intro', 'index', 'expedition', 'organism', 'model'].includes(query.view)) {
    return <LegacyLearningPage legacy={legacy}/>;
  }
  return <LearnerShell activeNav="learning"><LearningWorld/></LearnerShell>;
}

function LegacyLearningPage({ legacy }: { legacy: boolean }) {
  const { query, navigate } = useRouter();
  const identity = useLocalIdentity();
  const axes = useOceanData<{ version:string; zones: OceanZone[] }>('zones');
  const axis = query.axis === 'horizontal' || (legacy && query.mode === 'horizontal') ? 'horizontal' : 'vertical';
  const zones = axes.data?.zones.filter(zone => zone.axis === axis) ?? [];
  const zone = zones.find(z => z.id === query.zone) ?? zones[0];
  const view = zone?.id === query.zone && ['intro','index','expedition','organism','model'].includes(query.view) ? query.view : 'zones';
  const mapMarker = useMovingMarker<HTMLDivElement>(`${view}:${zone?.id ?? ''}`, axis === 'vertical' ? 'y' : 'x', 490, 'glide');
  const go = (next: string, changes: Record<string,string | undefined> = {}) => {
    oceanAudio.stop();
    navigate('/learning', { query: { axis, zone:zone?.id, view:next, ...changes } });
  };
  const back = (next: string) => go(next, { group:query.group, q:query.q, status:query.status, selected:query.selected, cursor:query.cursor });
  const openedId = view === 'organism' || view === 'expedition' || view === 'model' ? query.selected : undefined;
  const [diveReaderId, setDiveReaderId] = useState<string>();
  const detail = useOceanData<OceanItem>(openedId ? 'items/' + encodeURIComponent(openedId) : null, identity.id);
  const item = detail.data?.zone === zone?.id && detail.data?.kind === 'species' ? detail.data : undefined;
  const withDive = view === 'expedition' || (view === 'organism' && item?.id === diveReaderId);

  useEffect(() => () => oceanAudio.stop(), []);
  useEffect(() => {
    if (!openedId || (view !== 'expedition' && view !== 'organism')) setDiveReaderId(undefined);
  }, [openedId,view]);
  return <LearnerShell activeNav="learning">
    <div className="learning-page">
      {axes.error && <section className="learning-paper" role="alert">{axes.error} <button onClick={axes.reload}>Thử lại</button></section>}
      {axes.loading && <p className="learning-paper" role="status">Đang mở bản đồ…</p>}
      {zone && view === 'zones' && <div className="learning-map">
        <section className="learning-map-menu">
          <span className="learning-kicker"><Compass size={18}/> Học tập</span>
          <h1>Chọn đường khám phá</h1>
          <div className="learning-axes" aria-label="Trục khám phá">
            <button aria-pressed={axis === 'vertical'} onClick={() => go('zones',{axis:'vertical',zone:undefined})}>Theo chiều dọc</button>
            <button aria-pressed={axis === 'horizontal'} onClick={() => go('zones',{axis:'horizontal',zone:undefined})}>Theo chiều ngang</button>
          </div>
          <ol className={'learning-zones learning-zones--' + axis}>
            {zones.map(entry => <li key={entry.id}><button aria-pressed={entry.id===zone.id} onClick={event => {
              if (entry.id !== zone.id) mapMarker.prepare(event.detail > 0);
              go('zones', { zone: entry.id });
            }}><span/>{entry.title}</button></li>)}
          </ol>
          <button className="learning-primary" onClick={() => go('intro')}>Vào {zone.title.toLocaleLowerCase('vi')}</button>
        </section>
        <div className={'learning-map-art learning-map-art--' + axis + ' learning-map-chart'}>
          <div className="learning-map-coast" aria-hidden="true" />
          <div ref={mapMarker.marker} data-motion-marker className="learning-map-marker" style={axis === 'vertical' ? { top: ((zones.indexOf(zone)+0.5) / zones.length * 100) + '%' } : { left: 'clamp(15%, ' + ((zones.indexOf(zone)+0.5) / zones.length * 100) + '%, 85%)' }}>
            <span className="learning-map-beacon" aria-hidden="true"/>{zone.title}
          </div>
          <label className="learning-map-slider">Di chuyển trên bản đồ
            <input aria-label="Chọn vùng trên bản đồ" aria-valuetext={zone.title} type="range" min={0} max={zones.length-1}
              value={zones.indexOf(zone)} onChange={event => navigate('/learning', { replace:true, query:{ axis,zone:zones[Number(event.target.value)]?.id } })}/>
          </label>
        </div>
      </div>}
      {zone && view === 'intro' && <ZoneIntro key={zone.id} zone={zone} onBack={() => go('zones')} onNext={() => go('index')}/>}
      {zone && view === 'index' && <SpeciesIndex zone={zone} scope={identity.id} open={(id, dive) => go(dive ? 'expedition' : 'organism',
        { group:query.group, q:query.q, status:query.status, selected:id, cursor:query.cursor })} back={() => go('intro')}/>}
      {zone && (view === 'organism' || view === 'expedition' || view === 'model') && <>
        {detail.loading && <p className="learning-paper" role="status">Đang mở thẻ sinh vật…</p>}
        {detail.error && <section className="learning-paper" role="alert">{detail.error} <button onClick={detail.reload}>Thử lại</button> <button onClick={() => back('index')}>Mục lục</button></section>}
        {!detail.loading && !detail.error && !item && <section className="learning-paper">Bé hãy chọn sinh vật trong vùng này. <button onClick={() => back('index')}>Mục lục</button></section>}
        {item && view === 'model' && (item.id === 'upper-5'
          ? <Suspense fallback={<p className="learning-paper" role="status">Đang mở phòng quan sát…</p>}><LearningModel onBack={() => back('organism')}/></Suspense>
          : <p className="learning-paper">Sinh vật này chưa có mô hình. <button onClick={() => back('organism')}>Về thẻ</button></p>)}
        {item && view !== 'model' && <div className={withDive && view === 'organism' ? 'learning-notebook' : undefined}>
          {withDive && <LearningDive key={item.id} item={item} zone={zone} behindNotebook={view==='organism'}
            onRead={() => {setDiveReaderId(item.id); back('organism');}} onBack={() => back('index')}/>}
          {view === 'organism' && <OrganismReader key={identity.id + ':' + item.id} item={item} onBack={() => back('index')}
            onDive={() => back('expedition')} onModel={() => back('model')}/>}
        </div>}
      </>}
    </div>
  </LearnerShell>;
}

function ZoneIntro({ zone, onBack, onNext }: { zone:OceanZone; onBack:()=>void; onNext:()=>void }) {
  const [show, setShow] = useState(true);
  return <section className="learning-intro learning-paper">
    <button className="learning-back" onClick={onBack}><ArrowLeft size={18}/> Bản đồ</button>
    <div className="learning-intro-grid"><div>
      <span className="learning-kicker">Giới thiệu vùng</span><h1>{zone.title}</h1>
      {zone.depth && <p><strong>Độ sâu</strong> · {zone.depth}</p>}
      {zone.distance && <p><strong>Cách bờ</strong> · {zone.distance}</p>}
      <p>{zone.intro || 'Tài liệu nguồn có danh sách sinh vật cho vùng này.'}</p>
      <div className="learning-actions">
        {zone.intro && <OceanListen text={zone.title + '. ' + zone.intro} recording={zone.audio} label="Nghe giới thiệu"/>}
        <button aria-expanded={show} onClick={() => setShow(value => !value)}><Eye size={18}/> {show ? 'Ẩn hình minh họa' : 'Xem giới thiệu'}</button>
      </div>
      <button className="learning-primary" onClick={onNext}>Chọn nhóm sinh vật</button>
    </div>{show && <div role="img" aria-label={'Cảnh minh họa ' + zone.title} className={'learning-map-art learning-map-art--' + zone.axis}/>}</div>
  </section>;
}

function SpeciesIndex({ zone, scope, open, back }: { zone:OceanZone; scope:string; open:(id:string,dive?:boolean)=>void; back:()=>void }) {
  const { query, setQuery } = useRouter();
  const group = query.group || '';
  const [draft, setDraft] = useState(query.q || '');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [restoreFocus, setRestoreFocus] = useState<HTMLButtonElement | null>(null);
  useEffect(() => setDraft(query.q || ''), [query.q]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft.trim() !== (query.q || '')) setQuery({ q:draft.trim() || null, selected:null, cursor:null }, {replace:true});
    }, 300);
    return () => clearTimeout(timer);
  }, [draft, query.q, setQuery]);
  const groups = useOceanData<{items:{ name:string; count:number }[]}>(oceanPath('groups',{ zone:zone.id }));
  const result = useOceanData<ItemPage>(group ? oceanPath('items',{ zone:zone.id, group, q:query.q,status:query.status,cursor:query.cursor }) : null, scope);
  const selected = result.data?.items.find(item => item.id === query.selected);
  const selectGroup = (name:string) => { setSheetOpen(false); setQuery({group:name || null, selected:null,cursor:null}); };
  return <section className="learning-paper learning-index">
    <button className="learning-back" onClick={back}><ArrowLeft size={18}/> {zone.title}</button>
    <h1>{group ? 'Chọn sinh vật' : 'Chọn nhóm sinh vật'}</h1>
    {groups.error && <p role="alert">{groups.error} <button onClick={groups.reload}>Thử lại</button></p>}
    {groups.loading && <p role="status">Đang mở các nhóm…</p>}
    {groups.data?.items.length === 0 && <p>Excel có phần giới thiệu cho vùng này. Danh sách sinh vật đang để trống theo nguồn.</p>}
    {Boolean(groups.data?.items.length) && <div className="learning-index-grid">
      <aside aria-label="Nhóm sinh vật">
        <label className="learning-mobile-groups">Nhóm sinh vật<select className="ui-filter-control" value={group} onChange={event => selectGroup(event.target.value)}>
          <option value="">Chọn nhóm</option>{groups.data?.items.map(entry => <option key={entry.name}>{entry.name}</option>)}
        </select></label>
        <div className="learning-desktop-groups">{groups.data?.items.map(entry => <button className="ui-filter-control" key={entry.name} aria-pressed={entry.name===group} onClick={() => selectGroup(entry.name)}>{entry.name}<small>{entry.count}</small></button>)}</div>
      </aside>
      <div>
        {group ? <>
          <SearchField className="learning-search" type="text" label="Tìm sinh vật" value={draft} onChange={setDraft}/>
          <label>Tiến trình <select className="ui-filter-control" value={query.status || ''} onChange={e => setQuery({status:e.target.value || null,cursor:null,selected:null})}><option value="">Tất cả trạng thái</option><option value="learned">Đã ghi vào sổ</option><option value="new">Chưa ghi vào sổ</option></select></label>
          {result.loading && <p role="status">Đang tìm sinh vật…</p>}
          {result.error && <p role="alert">{result.error} <button onClick={result.reload}>Thử lại</button></p>}
          {result.data?.items.length === 0 && <p>Chưa tìm thấy sinh vật phù hợp.</p>}
          <ul className="learning-species-list">{result.data?.items.map(item => <li key={item.id}>
            <button aria-pressed={item.id===selected?.id} onClick={event => { setRestoreFocus(event.currentTarget); setSheetOpen(true); setQuery({selected:item.id}); }}>
              {item.image && <img src={item.image} loading="lazy" alt=""/>}<strong>{item.title}</strong>{item.learned && <span className="learning-learned"><Check size={15}/> Đã ghi vào sổ</span>}
            </button>
          </li>)}</ul>
          <div className="learning-actions">{query.cursor && <button onClick={() => setQuery({cursor:null,selected:null})}>Trang đầu</button>}
            {result.data?.nextCursor && <button onClick={() => { setSheetOpen(false); setQuery({cursor:result.data!.nextCursor,selected:null}); }}>Trang tiếp theo</button>}</div>
        </> : <p>Bé chọn một nhóm để xem các sinh vật trong vùng.</p>}
      </div>
      <aside className={'learning-preview' + (sheetOpen ? ' learning-preview--open' : '')} aria-label="Xem trước sinh vật">
        {selected ? <>
          <button className="learning-preview-close" onClick={() => {setSheetOpen(false); restoreFocus?.focus();}}>Đóng</button>
          <h2>{selected.title}</h2>{selected.image && <img src={selected.image} alt={selected.title}/>}
          <OceanListen text={selected.title} recording={selected.audio} label="Nghe tên"/>
          {selected.id === 'upper-2' && <button className="learning-primary" onClick={() => open(selected.id,true)}><Eye size={18}/> Quan sát trong vùng</button>}
          <button onClick={() => open(selected.id)}><BookOpen size={18}/> Mở thẻ sinh vật</button>
        </> : <p>Chọn một sinh vật để xem trước.</p>}
      </aside>
    </div>}
  </section>;
}

function OrganismReader({ item, onBack, onDive, onModel }: { item:OceanItem; onBack:()=>void; onDive:()=>void; onModel:()=>void }) {
  const { navigate } = useRouter();
  const [state, setState] = useState(item.learned ? 'learned' : 'new');
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  async function save() {
    setError(''); setState('saving');
    try { await oceanApi('studied/' + item.id,{method:'POST'}); setState('learned'); }
    catch (failure) { setError((failure as Error).message); setState('new'); }
  }
  return <section className="learning-paper learning-reader">
    <button className="learning-back" onClick={onBack}><ArrowLeft size={18}/> Mục lục</button>
    <header><span className="learning-kicker">Sổ thám hiểm</span><h1>{item.title}</h1><p>{item.group}</p></header>
    <div className="learning-reader-grid"><div>
      {!!item.images?.length && <>
        <div className="learning-actions" aria-label="Thu phóng ảnh">
          <button aria-label="Thu nhỏ ảnh" disabled={zoom===1} onClick={() => setZoom(value => value-.5)}><ZoomOut size={20}/></button>
          <output aria-live="polite">{Math.round(zoom*100)}%</output>
          <button aria-label="Phóng to ảnh" disabled={zoom===3} onClick={() => setZoom(value => value+.5)}><ZoomIn size={20}/></button>
        </div>
        <div className="learning-reader-photos" tabIndex={zoom > 1 ? 0 : undefined} aria-label={'Ảnh ' + item.title}>
          {item.images.map((url,index) => <img key={url} src={url} alt={item.title + ' · ' + (index+1)}
            style={{width:zoom*100+'%', maxHeight:zoom > 1 ? 'none' : undefined}} loading={index ? 'lazy' : 'eager'}/>)}
        </div>
      </>}
    </div><div>
      <OceanListen text={item.title} recording={item.audio} label="Nghe tên"/>
      {item.facts?.map((fact,index) => <article key={index}><h2>{fact.label}</h2><p>{fact.text}</p><OceanListen text={fact.text} recording={fact.audio} label={'Nghe ' + fact.label.toLowerCase()}/></article>)}
      {error && <p role="alert">{error} <button onClick={() => navigate('/profile')}>Mở hồ sơ</button></p>}
      <div className="learning-actions">
        {state === 'learned' ? <span className="learning-learned" role="status"><Check/> ĐÃ GHI VÀO SỔ</span> :
          <button className="learning-primary" disabled={state === 'saving'} onClick={() => void save()}>{state === 'saving' ? 'Đang ghi…' : 'Ghi vào sổ'}</button>}
        {item.id === 'upper-2' && <button onClick={onDive}>Bơi tiếp</button>}
        {item.id === 'upper-5' && <button onClick={onModel}>Quan sát 3D</button>}
      </div>
    </div></div>
  </section>;
}
