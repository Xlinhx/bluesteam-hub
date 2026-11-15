import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { Compass, Minus, Plus } from 'lucide-react';
import { cameraZoom, project, type Camera, type MapSize, type Point } from './worldMap';

type MapControls = { camera: Camera; size: MapSize };
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
const length = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function LearningMap({ art, terrain, focus, mobileFocus, focusKey, paused, tone, children, locate, overview = false }: {
  art: string; terrain: MapSize; focus: Point; mobileFocus?: Point; tone: string; focusKey: string; paused: boolean;
  children: (controls: MapControls) => ReactNode; locate: (x: number, y: number) => void;
  overview?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const initialized = useRef(false);
  const pointers = useRef(new Map<number, Point>());
  const [size, setSize] = useState<MapSize>({ width: 0, height: 0 });
  const [camera, setCamera] = useState<Camera>({ ...focus, zoom: .4 });
  const current = useRef(camera);
  const [moving, setMoving] = useState(false);
  const [photo, setPhoto] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry, setRetry] = useState(0);
  const [foreground, setForeground] = useState(false);
  const fit = Math.max(size.width / terrain.width, size.height / terrain.height, .01);
  const apply = (next: Camera) => {
    const marginX = Math.min(terrain.width / 2, size.width / (2 * next.zoom));
    const marginY = Math.min(terrain.height / 2, size.height / (2 * next.zoom));
    current.current = { ...next, x: clamp(next.x, marginX, terrain.width - marginX), y: clamp(next.y, marginY, terrain.height - marginY) };
    setCamera(current.current);
    locate(current.current.x, current.current.y);
  };
  const fly = (point: Point, zoom: number) => {
    cancelAnimationFrame(frame.current);
    const from = current.current;
    const destination = { ...point, zoom: clamp(zoom, fit, Math.max(fit, size.width > 720 ? 1.45 : 1.2)) };
    if (reduceMotion()) { setMoving(false); apply(destination); return; }
    setMoving(true);
    const begin = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min((now - begin) / 720, 1);
      const t = elapsed * elapsed * (3 - 2 * elapsed);
      apply({
        x: from.x + (destination.x - from.x) * t,
        y: from.y + (destination.y - from.y) * t,
        zoom: from.zoom * (destination.zoom / from.zoom) ** t,
      });
      if (elapsed < 1) frame.current = requestAnimationFrame(tick);
      else setMoving(false);
    };
    frame.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize(previous => previous.width === width && previous.height === height ? previous : { width, height });
    });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame.current); };
  }, []);

  useEffect(() => {
    if (!size.width) return;
    const widthAtEntry = tone === 'dunes' ? 4350 : 3050;
    const entryZoom = overview
      ? Math.max(fit * 1.12, size.height / (terrain.height * .43))
      : Math.max(fit * (tone === 'depth' ? 1.2 : 1), size.width / Math.min(terrain.width, widthAtEntry));
    const opening = size.width <= 720 ? mobileFocus ?? focus : focus;
    if (initialized.current) fly(opening, entryZoom);
    else {
      initialized.current = true;
      apply({ ...opening, zoom: entryZoom });
    }
    return () => cancelAnimationFrame(frame.current);
  }, [focusKey, size]);

  const zoomAt = (point: Point, zoom: number) => apply(cameraZoom(current.current, size, point, clamp(zoom, fit, Math.max(fit, size.width > 720 ? 1.45 : 1.2))));
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      cancelAnimationFrame(frame.current);
      setMoving(false);
      if (overview && !event.ctrlKey && !event.metaKey) {
        const view = current.current;
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? size.height : 1;
        apply({ ...view, x: view.x + (event.shiftKey ? event.deltaY : event.deltaX) * unit / view.zoom,
          y: view.y + (event.shiftKey ? 0 : event.deltaY) * unit / view.zoom });
        return;
      }
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) {
        const view = current.current;
        const distance = (event.deltaX || event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? size.width : 1);
        apply({ ...view, x: view.x + distance / view.zoom });
        return;
      }
      const rect = element.getBoundingClientRect();
      zoomAt({ x: event.clientX - rect.left, y: event.clientY - rect.top },
        current.current.zoom * Math.exp(-clamp(event.deltaY, -160, 160) * (event.deltaMode ? .032 : .0025)));
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [size, overview]);

  const pointerPosition = (event: PointerEvent) => {
    const rect = root.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  function move(event: PointerEvent) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const next = pointerPosition(event);
    const other = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)?.[1];
    if (other) zoomAt(midpoint(previous, other), current.current.zoom * length(next, other) / Math.max(length(previous, other), 1));
    const offset = other ? midpoint(next, other) : next;
    const priorOffset = other ? midpoint(previous, other) : previous;
    const view = current.current;
    apply({ ...view, x: view.x - (offset.x - priorOffset.x) / view.zoom, y: view.y - (offset.y - priorOffset.y) / view.zoom });
    pointers.current.set(event.pointerId, next);
  }

  const origin = project({ x: 0, y: 0 }, camera, size);
  useEffect(() => {
    const update = () => setForeground(document.hidden);
    document.addEventListener('visibilitychange', update);
    update();
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  const center = { x: size.width / 2, y: size.height / 2 };
  const outline = {
    left: 100 * (camera.x - size.width / (2 * camera.zoom)) / terrain.width + '%',
    top: 100 * (camera.y - size.height / (2 * camera.zoom)) / terrain.height + '%',
    width: 100 * size.width / (camera.zoom * terrain.width) + '%',
    height: 100 * size.height / (camera.zoom * terrain.height) + '%',
  };
  return <div ref={root} className="learning-world-stage learning-map-world" data-overview={overview} data-photo={photo} data-paused={paused || foreground} data-moving={moving} data-tone={tone}
    style={{ '--parallax-x': (camera.x - focus.x) * -.075 + 'px', '--parallax-y': (camera.y - focus.y) * -.05 + 'px' } as CSSProperties}
    data-camera={camera.x.toFixed(1) + ',' + camera.y.toFixed(1) + ',' + camera.zoom.toFixed(3)}>
    <div className="learning-map-terrain" data-scene-art={art} style={{ width: terrain.width, height: terrain.height,
      transform: `translate3d(${origin.x}px,${origin.y}px,0) scale(${camera.zoom})` }}>
      <img className="learning-map-art" src={art + (retry ? '?retry=' + retry : '')} alt="" draggable={false}
        onLoad={() => setPhoto('ready')} onError={() => setPhoto('error')} />
      <div className="learning-map-water" aria-hidden="true"/>
    </div>
    <div className="learning-habitat-parallax" aria-hidden="true"><i/><i/></div>
    <div className="learning-world-gesture learning-map-gesture" tabIndex={0} role="group" aria-label="Camera bản đồ"
      onPointerDown={event => {
        if (event.button !== 0 || pointers.current.size >= 2) return;
        cancelAnimationFrame(frame.current);
        setMoving(false);
        event.currentTarget.setPointerCapture(event.pointerId);
        pointers.current.set(event.pointerId, pointerPosition(event));
      }} onPointerMove={move}
      onLostPointerCapture={event => pointers.current.delete(event.pointerId)}
      onPointerCancel={event => pointers.current.delete(event.pointerId)}
      onKeyDown={event => {
        const delta: Record<string, Point> = { ArrowLeft: { x: -80, y: 0 }, ArrowRight: { x: 80, y: 0 }, ArrowUp: { x: 0, y: -80 }, ArrowDown: { x: 0, y: 80 } };
        if (event.key in delta) {
          event.preventDefault();
          cancelAnimationFrame(frame.current);
          setMoving(false);
          const { x, y } = delta[event.key];
          apply({ ...camera, x: camera.x + x / camera.zoom, y: camera.y + y / camera.zoom });
        } else if (event.key === '+' || event.key === '-') {
          event.preventDefault();
          zoomAt(center, camera.zoom * (event.key === '+' ? 1.35 : 1 / 1.35));
        }
      }}/>
    {size.width > 0 && photo === 'ready' && children({ camera, size })}
    <div className="learning-map-controls" style={{ '--overview-aspect': terrain.width / terrain.height } as CSSProperties}>
      <button className="learning-map-overview" aria-label="Di chuyển theo bản đồ nhỏ"
        onClick={event => {
          const rect = event.currentTarget.getBoundingClientRect();
          const point = event.detail ? { x: (event.clientX - rect.left) / rect.width * terrain.width,
            y: (event.clientY - rect.top) / rect.height * terrain.height } : focus;
          fly(point, camera.zoom);
        }}>
        <img src={art} alt=""/><i style={outline as CSSProperties}/>
      </button>
      {!overview && <div className="learning-map-zoom"><Compass size={24} aria-hidden="true"/>
        <button aria-label="Phóng to" onClick={() => { cancelAnimationFrame(frame.current); setMoving(false); zoomAt(center, camera.zoom * 1.35); }}><Plus size={18}/></button>
        <button aria-label="Thu nhỏ" onClick={() => { cancelAnimationFrame(frame.current); setMoving(false); zoomAt(center, camera.zoom / 1.35); }}><Minus size={18}/></button>
      </div>}
    </div>
    {photo === 'loading' && <div className="learning-world-image-error learning-world-image-loading" role="status">Đang mở cảnh…</div>}
    {photo === 'error' && <div className="learning-world-image-error" role="status">Cảnh chưa tải được <button onClick={() => { setPhoto('loading'); setRetry(n => n + 1); }}>Thử lại</button></div>}
  </div>;
}
