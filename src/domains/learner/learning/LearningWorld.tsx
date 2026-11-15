import { ArrowLeft, BookOpen, Check, Hand, Info, Microscope, Pause, Play, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from '../../../app/router';
import { type OceanItem, type OceanItemPage, type OceanZone, oceanApi, oceanPath, useOceanData } from '../../../shared/api/learnerOcean';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import { useLocalIdentity } from '../../../shared/ui/identity/useLocalIdentity';
import { OceanListen } from '../../../shared/ui/media/OceanListen';
import { LearningMap } from './LearningMap';
import { WorldCatalog, WorldItemTile, WorldReader } from './LearningWorldCatalog';
import { buildHabitatPoints, clusterPoints, depthBands, depthLabels, depthOverviewFocus, depthOverviewSize, destinations, displayNames, habitatCrossReferences, habitatNames, habitatScene, observationAnchors, project, type HabitatPoint, type Point } from './worldMap';
import { horizontalRegions, overviewArt, resolveLearningStop, verticalRegions, type WorldAxis } from './worldRoutes';
import './learning-world.css';
import './learning-map.css';
import './learning-panels.css';

function useMapSpecies(scope: string) {
  const [state, setState] = useState<{ items: OceanItem[]; error?: string }>({ items: [] });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ items: [] });
    async function load() {
      const items: OceanItem[] = [];
      let cursor: string | undefined;
      do {
        const result = await oceanApi<OceanItemPage>(oceanPath('items', { kind: 'species', allZones: '1', cursor }), { signal: controller.signal });
        items.push(...result.items);
        cursor = result.nextCursor ?? undefined;
      } while (cursor && !controller.signal.aborted);
      if (!controller.signal.aborted) setState({ items });
    }
    void load().catch(error => { if (!controller.signal.aborted) setState({ items: [], error: (error as Error).message }); });
    return () => controller.abort();
  }, [scope, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}

export function LearningWorld() {
  const { query, navigate } = useRouter();
  const identity = useLocalIdentity();
  const zones = useOceanData<{ zones: OceanZone[] }>('zones');
  const species = useMapSpecies(identity.id);
  const location = resolveLearningStop(query.spot ?? query.zone);
  const axis = location?.axis ?? (query.axis === 'vertical' ? 'vertical' : 'horizontal');
  const stop = query.view === 'world' ? location?.stop : undefined;
  const region = stop ? location?.region : undefined;
  const zone = zones.data?.zones.find(candidate => candidate.id === stop?.zone);
  const world = useMemo(() => buildHabitatPoints(species.items), [species.items]);
  const scene = region && habitatScene(axis, region.id);
  const regionStops = region?.stops.map(entry => entry.id);
  const localPoints = [...world.filter(point => regionStops?.includes(point.scene)), ...habitatCrossReferences(world, region?.id ?? '')];
  const focusPoint = localPoints.find(point => point.id === query.organism);
  const groups = Array.from(new Set(localPoints.map(point => point.group)));
  const [group, setGroup] = useState('');
  const [cameraStop, setCameraStop] = useState<string>();
  const [overviewDepth, setOverviewDepth] = useState('shallow');
  const catalogStop = region?.stops.find(entry => entry.id === cameraStop) ?? stop;
  const catalogZone = zones.data?.zones.find(candidate => candidate.id === catalogStop?.zone);
  const [introOpen, setIntroOpen] = useState(false);
  const [catalog, setCatalog] = useState(false);
  const [paused, setPaused] = useState(false);
  const [learned, setLearned] = useState(new Set<string>());
  const [observation, setObservation] = useState<{ label: string; members: HabitatPoint<OceanItem>[]; anchor: Point; sample?: boolean; all?: boolean }>();
  const [travel, setTravel] = useState<{ art: string; frame?: DOMRect; direction: 'arrive' | 'return'; aim: Point; target: string; id: number }>();
  const stage = useRef<HTMLElement>(null);
  const motion = useRef<AbortController | null>(null);
  const revision = useRef(0);
  useEffect(() => {
    const cancel = () => { motion.current?.abort(); setTravel(undefined); };
    window.addEventListener('popstate', cancel);
    return () => { window.removeEventListener('popstate', cancel); motion.current?.abort(); };
  }, []);
  const [readerSide, setReaderSide] = useState<'left' | 'right'>('right');
  const returnFocus = useRef<HTMLElement | null>(null);
  const activeItem = query.organism;
  const destinationLayer = travel && resolveLearningStop(travel.target)?.region.id;
  const intro = stop?.intro?.text || zone?.intro || '';
  const recording = stop?.intro?.audio || zone?.audio;
  const art = scene?.art ?? overviewArt[axis];

  useEffect(() => { setLearned(new Set()); }, [identity.id]);
  useEffect(() => {
    setGroup('');
    setIntroOpen(false);
    setObservation(undefined);
    return () => oceanAudio.stop();
  }, [region?.id, stop?.id]);

  function stopTravel() {
    motion.current?.abort();
    setTravel(undefined);
  }

  function go(next: WorldAxis, spot?: string) {
    oceanAudio.stop();
    setCatalog(false);
    setObservation(undefined);
    stopTravel();
    const target = spot && resolveLearningStop(spot);
    const commit = () => navigate('/learning', { query: { axis: next, view: spot ? 'world' : undefined, spot }, preserveQuery: false });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || next !== axis || !target && !region || target && target.region.id === region?.id) {
      commit();
      return;
    }
    const abort = new AbortController();
    motion.current = abort;
    const destination = target ? habitatScene(next, target.region.id).art : overviewArt[next];
    const aim = destinations[target ? target.region.id : region?.id ?? ''] ?? { x: 1600, y: 900 };
    const image = new Image();
    image.src = destination;
    const rect = stage.current?.getBoundingClientRect();
    const source = stage.current?.querySelector<HTMLImageElement>('.learning-map-world .learning-map-art')?.getBoundingClientRect();
    const frame = source && rect ? new DOMRect(source.x - rect.x, source.y - rect.y, source.width, source.height) : undefined;
    setTravel({ art, frame, direction: target ? 'arrive' : 'return', aim, target: spot ?? 'map', id: ++revision.current });
    const until = (ms: number) => new Promise<void>(resolve => {
      const finish = () => { window.clearTimeout(timer); abort.signal.removeEventListener('abort', finish); resolve(); };
      const timer = window.setTimeout(finish, ms);
      abort.signal.addEventListener('abort', finish, { once: true });
    });
    void Promise.all([until(380), Promise.race([image.decode().catch(() => {}), until(1150)])]).then(() => {
      if (abort.signal.aborted) return;
      commit();
      void until(530).then(() => { if (!abort.signal.aborted) setTravel(undefined); });
    });
  }

  function openItem(id: string, side: typeof readerSide = 'right') {
    stopTravel();
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    oceanAudio.stop();
    setReaderSide(side);
    navigate('/learning', { query: { axis, spot: query.spot ?? stop?.id, view: stop ? 'world' : undefined, organism: id }, preserveQuery: false });
  }

  function closeItem() {
    oceanAudio.stop();
    navigate('/learning', { replace: true, query: { axis, spot: query.spot ?? stop?.id, view: stop ? 'world' : undefined }, preserveQuery: false });
    requestAnimationFrame(() => returnFocus.current?.focus({ preventScroll: true }));
  }

  return <section ref={stage} className="learning-world learning-map" aria-label="Học tập" data-axis={axis} data-spot={stop?.id ?? 'map'}
    data-library={catalog} data-reader={Boolean(activeItem)} data-point-count={localPoints.length} onKeyDown={event => {
      if (event.key !== 'Escape') return;
      if (travel) stopTravel();
      else if (activeItem) closeItem();
      else if (observation) setObservation(undefined);
      else if (introOpen) { oceanAudio.stop(); setIntroOpen(false); }
      else if (catalog) setCatalog(false);
      else setGroup('');
    }}>
    <h1 className="sr-only">{stop?.title ?? 'Chọn đường khám phá'}</h1>
    {!stop && axis === 'horizontal' && <div key={axis} className="learning-world-stage learning-map-atlas" data-tone="coast">
      <AtlasImage art={art} axis={axis}/>
      {axis === 'horizontal' && <div className="learning-map-markers learning-map-flycam">
        {horizontalRegions.map((entry, index) => {
          const point = destinations[entry.id];
          return <button key={entry.id} type="button" className="learning-map-destination learning-world-pill"
            style={{ left: point.x / 32 + '%', top: point.y / 18 + '%', '--destination-order': index } as CSSProperties}
            onClick={() => go(axis, entry.id)}>{entry.title}</button>;
        })}
      </div>}
    </div>}
    {!stop && axis === 'vertical' && <LearningMap key="depth-overview" art={art} terrain={depthOverviewSize} focus={depthOverviewFocus}
      overview focusKey="depth-overview" tone="depth" paused={paused}
      locate={(_x, y) => setOverviewDepth(verticalRegions[Math.min(4, Math.floor(y / depthOverviewSize.height * 5))].id)}>{({ camera, size }) => <div className="learning-map-markers learning-depth-destinations">
        {verticalRegions.map((entry, index) => {
          const position = project({ x: depthOverviewSize.width * .34, y: depthOverviewSize.height * depthBands[index] / 100 }, camera, size);
          if (position.x < 30 || position.x > size.width - 230 || position.y < 88 || position.y > size.height - 70) return null;
          return <button key={entry.id} className="learning-map-destination learning-world-pill" style={{ left: position.x, top: position.y }}
            onClick={() => go(axis, entry.id)}>{entry.title}</button>;
        })}
      </div>}</LearningMap>}
    {stop && scene && <LearningMap key={region?.id} art={art} terrain={scene.size} focus={scene.focus(stop.id)}
      mobileFocus={focusPoint ? scene.position(focusPoint, focusPoint.scene) : stop.id === 'middle' ? scene.position({ x: 1248, y: 900 }, stop.id) : undefined}
      focusKey={stop.id} tone={stop.tone} locate={x => setCameraStop(scene.stopAt(x).id)}
      paused={paused || Boolean(activeItem)}>{({ camera, size }) => {
      const mobile = size.width < 720;
      const visible = ({ x, y }: Point) => x >= 21 && y >= (mobile ? 82 : 58) && x <= size.width - 20 && y <= size.height - 25;
      const selectedPoints = localPoints.filter(point => !group || point.group === group);
      const sitePoints = new Map<string, HabitatPoint<OceanItem>[]>();
      for (const point of selectedPoints) {
        const key = point.scene + '/' + point.habitat;
        const members = sitePoints.get(key) ?? [];
        members.push(point);
        sitePoints.set(key, members);
      }
      const individual = (item: HabitatPoint<OceanItem>, position: Point) => {
        const selected = item.id === activeItem;
        const studied = item.learned || learned.has(item.id);
        const name = displayNames[item.id] ?? item.title;
        return <button key={item.id} type="button" className="learning-map-point" style={{ left: position.x, top: position.y }}
          aria-label={name} data-selected={selected} data-featured={item.featured} data-learned={studied}
          onClick={() => openItem(item.id, position.x > size.width * .66 ? 'left' : 'right')}>
          <i>{studied && <Check size={9} strokeWidth={4}/>}</i>{(selected || item.featured) && <span>{name}</span>}
        </button>;
      };
      return <div className="learning-map-markers">
        {[...sitePoints.values()].flatMap(members => {
          const first = members[0];
          const sample = first.habitat === 'wet-sample';
          const anchoredGroup = sample || first.habitat === 'grasses';
          const projected = (point: Point) => project(scene.position(point, first.scene), camera, size);
          const originals = members.filter(point => point.featured || point.id === activeItem).flatMap(point => {
            const position = projected(point);
            return visible(position) ? [individual(point, position)] : [];
          });
          const remaining = members.filter(point => !point.featured && point.id !== activeItem);
          if (remaining.length === 0) return originals;
          if (!anchoredGroup && (group || camera.zoom > .74 || remaining.length === 1)) {
            return [...originals, ...clusterPoints(remaining, camera.zoom).flatMap(cluster => {
              const position = projected(cluster);
              if (!visible(position)) return [];
              if (cluster.members.length === 1) return [individual(cluster.members[0], position)];
              return [<button key={cluster.members[0].id} type="button" className="learning-map-cluster" style={{ left: position.x, top: position.y }}
                aria-label={'Khám phá ' + cluster.members.length + ' sinh vật'} onClick={() => {
                  setObservation({ label: habitatNames[first.habitat], members: cluster.members, anchor: scene.position(cluster, first.scene) });
                }}>{cluster.members.length}</button>];
            })];
          }
          const local = observationAnchors[first.habitat] ?? { x: remaining.reduce((sum, point) => sum + point.x, 0) / remaining.length,
            y: remaining.reduce((sum, point) => sum + point.y, 0) / remaining.length };
          const anchor = scene.position(local, first.scene);
          const position = project(anchor, camera, size);
          if (!visible(position)) return originals;
          const label = habitatNames[first.habitat];
          return [...originals, <button key={first.scene + '/' + first.habitat} type="button"
            className={sample ? 'learning-map-sample' : 'learning-map-group-pin'} style={{ left: position.x, top: position.y }}
            aria-label={label} aria-expanded={observation?.label === label} data-featured={anchoredGroup}
            onClick={() => { setIntroOpen(false); setCatalog(false); setObservation(observation?.label === label ? undefined : { label, members: remaining, anchor, sample }); }}>
            {sample ? <Microscope size={16}/> : <i/>}<span>{label}</span>
          </button>];
        })}
        {observation && (() => {
          const anchor = project(observation.anchor, camera, size);
          if (!visible(anchor)) return null;
          const left = Math.max(mobile ? 132 : 150, Math.min(size.width - (mobile ? 132 : 150), anchor.x));
          return <section key={observation.label} className="learning-habitat-observation" data-sample={Boolean(observation.sample)}
            data-below={anchor.y < (observation.sample ? 395 : 236) && anchor.y < size.height * .55}
            data-expanded={Boolean(observation.all)} aria-label={observation.sample ? 'Kính quan sát mẫu cát ẩm' : observation.label}
            style={{ left, top: anchor.y, '--anchor-offset': anchor.x - left + 'px' } as CSSProperties}>
            <header><h2>{observation.sample ? 'Dưới kính hiển vi' : observation.label}</h2>
              <button type="button" aria-label="Đóng quan sát" onClick={() => setObservation(undefined)}><X size={17}/></button></header>
            {observation.sample && <img className="learning-habitat-lens" src="/assets/learner-worlds/learning/habitat-sand-sample.webp" alt="Minh họa giun tròn len giữa các hạt cát"/>}
            {observation.sample && <small className="learning-habitat-lens-credit">Minh họa qua kính</small>}
            <div className="learning-habitat-observation-items">{(observation.all ? observation.members : observation.members.slice(0, 2)).map(item =>
              <WorldItemTile item={item} key={item.id} learned={item.learned || learned.has(item.id)} open={() => openItem(item.id, anchor.x > size.width * .66 ? 'left' : 'right')}/>)}</div>
            {observation.members.length > 2 && <button className="learning-habitat-all" type="button" onClick={() => setObservation({ ...observation, all: !observation.all })}>
              {observation.all ? 'Thu gọn' : `Xem tất cả (${observation.members.length})`}</button>}
          </section>;
        })()}
      </div>;
    }}</LearningMap>}
    {travel && <div className="learning-habitat-travel" key={travel.id} data-direction={travel.direction} data-target={travel.target}
      style={{ '--entry-x': travel.aim.x / 32 + '%', '--entry-y': travel.aim.y / 18 + '%' } as CSSProperties} aria-hidden="true">
      <img src={travel.art} alt="" style={travel.frame && { position: 'absolute', left: travel.frame.x, top: travel.frame.y,
        width: travel.frame.width, height: travel.frame.height, maxWidth: 'none' }}/><i/>
    </div>}
    <div className="learning-world-toolbar learning-map-toolbar">
      {!stop ? <><div className="learning-world-tabs" aria-label="Trục khám phá">
        <button aria-pressed={axis === 'horizontal'} onClick={() => go('horizontal')}>Chiều ngang</button>
        <button aria-pressed={axis === 'vertical'} onClick={() => go('vertical')}>Chiều dọc</button>
      </div><button className="learning-world-pill" aria-expanded={catalog} onClick={() => setCatalog(true)}><BookOpen size={17}/> Mục lục</button></> :
      <div className="learning-map-local">
        <div className="learning-world-location">
          <button className="learning-world-pill" onClick={() => go(axis)}><ArrowLeft size={16}/> {axis === 'vertical' ? 'Mặt cắt' : 'Toàn bản đồ'}</button>
            <span>{region?.title}{localPoints.length > 0 && <small>{localPoints.length} sinh vật</small>}</span>

        </div>
        <div className="learning-world-local-actions">
          <button className="learning-world-pill" onClick={() => { setCatalog(false); setObservation(undefined); setIntroOpen(value => !value); }} aria-expanded={introOpen}><Info size={16}/> Giới thiệu</button>
          <button className="learning-world-pill" aria-expanded={catalog} onClick={() => { setIntroOpen(false); setObservation(undefined); setCatalog(value => !value); }}><BookOpen size={16}/> Mục lục</button>
        </div>
        {groups.length > 0 && <label className="learning-map-group"><span>Nhóm sinh vật</span>
          <select value={group} onChange={event => setGroup(event.target.value)}><option value="">Tất cả nhóm</option>
            {groups.map(name => <option key={name}>{name}</option>)}</select>
        </label>}
      </div>}
    </div>
    {axis === 'vertical' && <nav className="learning-world-depth" data-local={Boolean(stop)} aria-label="Tầng nước biển">
      {verticalRegions.map((entry, index) => <div className="learning-world-depth-row" key={entry.id} data-approaching={destinationLayer === entry.id}
        style={{ '--depth-y': `${depthBands[index]}%`, '--depth-index': index } as CSSProperties}><button
        aria-current={(region?.id ?? overviewDepth) === entry.id ? 'location' : undefined} onClick={() => go(axis, entry.id)}>
        <span>{entry.title}</span><small>{depthLabels[index]}</small></button></div>)}
    </nav>}
    {!stop && axis === 'horizontal' && <nav className="learning-map-mobile-regions" aria-label="Khu vực ven biển">
      {horizontalRegions.map(entry => <button key={entry.id} className="learning-world-pill" onClick={() => go(axis, entry.id)}>{entry.title}</button>)}
    </nav>}
    {(stop || axis === 'vertical') && <><button className="learning-world-pause learning-world-pill" aria-label={paused ? 'Tiếp tục cảnh' : 'Tạm dừng cảnh'}
      onClick={() => setPaused(value => !value)}>{paused ? <Play size={17}/> : <Pause size={17}/>}</button>
      <div className="learning-world-explore learning-map-explore"><span><Hand size={16}/> Kéo để khám phá</span>
        {region && region.stops.length > 1 && <nav aria-label="Điểm khám phá">
          {region.stops.map(entry => <button key={entry.id} aria-current={(region.stops.some(candidate => candidate.id === cameraStop) ? cameraStop : stop?.id) === entry.id ? 'location' : undefined}
            onClick={() => go(axis, entry.id)}>{entry.title}</button>)}</nav>}
      </div></>}
    {species.error && <div className="learning-world-status" role="alert">{species.error} <button onClick={species.retry}>Thử lại</button></div>}
    {catalog && <div className="learning-world-library" data-reading={Boolean(activeItem)}>
      <WorldCatalog key={group + ':' + catalogZone?.id} selected={activeItem} initialGroup={group} zone={catalogZone?.id} place={catalogZone?.title} regionTitle={region?.title}
        scope={identity.id} learned={learned} openItem={openItem} close={() => setCatalog(false)} />
      {activeItem && <div className="learning-library-detail"><WorldReader key={activeItem} id={activeItem} scope={identity.id} inCatalog place={region?.title}
        habitat={focusPoint && habitatNames[focusPoint.habitat]}
        learned={learned.has(activeItem)} close={closeItem} save={id => setLearned(previous => new Set([...previous, id]))}
        observe={entry => navigate('/learning', { query: { axis: 'vertical', zone: entry.zone, selected: entry.id,
          view: entry.id === 'upper-5' ? 'model' : 'expedition' }, preserveQuery: false })}/></div>}
    </div>}
    {introOpen && <section className="learning-world-reader" aria-label="Giới thiệu vùng">
      <header><h2>{stop?.title}</h2><button aria-label="Đóng giới thiệu" onClick={() => { oceanAudio.stop(); setIntroOpen(false); }}><X size={22}/></button></header>
      {(zone?.depth || zone?.distance) && <p>{[zone.depth, zone.distance].filter(Boolean).join(' · ')}</p>}
      <p>{intro || 'Kéo camera để quan sát địa hình trong khu vực.'}</p>
      {intro && <OceanListen text={intro} recording={recording} label="Nghe giới thiệu"/>}
      {stop?.id === 'offshore' && <button className="learning-world-pill" onClick={() => go('vertical', 'middle')}>Khám phá Vùng nước giữa</button>}
      {stop?.id === 'deep-sea' && <button className="learning-world-pill" onClick={() => go('vertical', 'deep')}>Khám phá Vùng nước sâu</button>}
    </section>}
    {activeItem && !catalog && <div className="learning-map-reader" data-side={readerSide}>
      <WorldReader key={activeItem} id={activeItem} scope={identity.id} learned={learned.has(activeItem)} close={closeItem} place={region?.title}
        habitat={focusPoint && habitatNames[focusPoint.habitat]}
        save={id => setLearned(previous => new Set([...previous, id]))}
        observe={entry => navigate('/learning', { query: { axis: 'vertical', zone: entry.zone, selected: entry.id,
          view: entry.id === 'upper-5' ? 'model' : 'expedition' }, preserveQuery: false })}/>
    </div>}
  </section>;
}

function AtlasImage({ art, axis }: { art: string; axis: WorldAxis }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  return <div className="learning-atlas-image" data-photo={state} data-axis={axis}>
    <img className="learning-map-art" src={art + (attempt ? '?retry=' + attempt : '')} alt="" draggable={false}
      onLoad={() => setState('ready')} onError={() => setState('error')}/>
    <i aria-hidden="true"/>
    {state === 'loading' && <div className="learning-world-image-error learning-world-image-loading" role="status">Đang mở bản đồ…</div>}
    {state === 'error' && <div className="learning-world-image-error" role="status">Bản đồ chưa tải được <button onClick={() => { setState('loading'); setAttempt(value => value + 1); }}>Thử lại</button></div>}
  </div>;
}
