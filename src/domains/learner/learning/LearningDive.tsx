import { ArrowLeft, Binoculars, Minus, Pause, Play, Plus, Waves } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { OceanItem, OceanZone } from '../../../shared/api/learnerOcean';
import { OceanListen } from '../../../shared/ui/media/OceanListen';

const bound = (value:number, min:number, max:number) => Math.min(max, Math.max(min, value));

export function LearningDive({ item, zone, behindNotebook, onBack, onRead }: {
  item:OceanItem; zone:OceanZone; behindNotebook:boolean; onBack:()=>void; onRead:()=>void;
}) {
  const [depth, setDepth] = useState(20);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({x:0,y:0});
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [observation, setObservation] = useState<'explore'|'observe'|'found'>('explore');
  const pointers = useRef(new Map<number,{x:number;y:number}>());
  const notebookTrigger = useRef<HTMLButtonElement>(null);
  const wasBehindNotebook = useRef(false);
  const active = !paused && !hidden && !behindNotebook;
  useEffect(() => {
    if (wasBehindNotebook.current && !behindNotebook) notebookTrigger.current?.focus();
    wasBehindNotebook.current = behindNotebook;
  }, [behindNotebook]);
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(() => {
    if (!active || observation !== 'observe') return;
    const timer = setTimeout(() => setObservation('found'), 2800);
    return () => clearTimeout(timer);
  }, [active, observation, offset, zoom, depth]);
  useEffect(() => {
    if (active && observation === 'explore' && zoom >= 1.45 && Math.abs(offset.x) < 95 && depth < 65) {
      const timer = setTimeout(() => setObservation('observe'), 1300);
      return () => clearTimeout(timer);
    }
  }, [active, observation, offset, zoom, depth]);

  function move(event:PointerEvent<HTMLDivElement>) {
    const start = pointers.current.get(event.pointerId);
    if (!start || !active) return;
    const other = [...pointers.current].find(([id]) => id !== event.pointerId)?.[1];
    const point = {x:event.clientX,y:event.clientY};
    if (other) {
      const previousDistance = Math.hypot(start.x-other.x,start.y-other.y);
      const distance = Math.hypot(point.x-other.x,point.y-other.y);
      if (previousDistance > 8) setZoom(value => bound(value * distance/previousDistance,0.85,1.9));
    } else {
      setOffset(value => ({x:bound(value.x + point.x-start.x,-150,150), y:bound(value.y + point.y-start.y,-70,70)}));
    }
    pointers.current.set(event.pointerId,point);
    if (observation === 'observe' && Math.hypot(point.x-start.x,point.y-start.y)>18) setObservation('explore');
  }
  return <section className="learning-dive" inert={behindNotebook} aria-hidden={behindNotebook || undefined}
    data-paused={!active} data-observing={observation === 'observe'}>
    <div className="learning-dive-scene" style={{filter:'brightness(' + (1-depth*0.006) + ')'}}>
      <div className="learning-dive-water" style={{transform:'translate(' + offset.x*0.22 + 'px,' + offset.y*0.2 + 'px) scale(1.14)'}}/>
      {item.id === 'upper-2' && <div className="learning-dive-dolphin" style={{transform:'translate(' + offset.x + 'px,' + (offset.y + (depth-20)*0.9) + 'px) scale(' + zoom + ')'}}>
        <img src="/assets/learner-worlds/bottlenose-dolphin.webp" alt=""/>
      </div>}
    </div>
    <div className="learning-dive-gesture" aria-hidden="true" onPointerDown={event => {
      if (!active) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    }} onPointerMove={move} onLostPointerCapture={event => pointers.current.delete(event.pointerId)} />
    <header className="learning-dive-top"><button onClick={onBack}><ArrowLeft size={18}/> Mục lục</button>
      <h1>{zone.title}</h1><button aria-label={paused ? 'Tiếp tục' : 'Tạm dừng'} onClick={() => setPaused(value => !value)}>{paused ? <Play/> : <Pause/>}</button></header>
    <div className="learning-dive-controls">
      <label><Waves size={18}/> Độ sâu <input type="range" min={0} max={100} value={depth} disabled={!active} onChange={e => setDepth(Number(e.target.value))}/></label>
      <div className="learning-actions" aria-label="Thu phóng"><button aria-label="Thu nhỏ" disabled={!active} onClick={() => setZoom(x => bound(x-0.15,0.85,1.9))}><Minus/></button>
        <span>Thu phóng</span><button aria-label="Phóng to" disabled={!active} onClick={() => setZoom(x => bound(x+0.15,0.85,1.9))}><Plus/></button></div>
    </div>
    <div className="learning-dive-caption">
      <h2>{observation === 'found' ? 'Cá heo phải ngoi lên mặt nước để thở' : 'Cá heo thở dưới nước được không?'}</h2>
      <p>{observation === 'observe' ? 'Giữ yên một chút để theo dõi cá heo.' : observation === 'found' ? 'Mở thẻ để xem điều bé vừa phát hiện.' : 'Kéo để nhìn quanh. Tiến lại gần hoặc chạm Quan sát.'}</p>
      {observation === 'found' ? <button ref={notebookTrigger} className="learning-primary" onClick={onRead}>Mở thẻ sinh vật</button> : <>
        <button className="learning-primary" disabled={!active || observation === 'observe'} onClick={() => {setOffset({x:0,y:0});setObservation('observe');}}><Binoculars size={18}/> Quan sát</button>
        {active && <OceanListen text="Cá heo thở dưới nước được không?" label="Nghe câu hỏi"/>}
      </>}
    </div>
  </section>;
}
