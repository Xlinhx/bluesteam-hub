import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import type {ScanMotion} from './scanDocument';
import {CREATIVE_SEA_ENVIRONMENTS as SEA_ENVIRONMENTS} from '@bluesteam/contracts';
import {createMotionScope} from '../../ui/motion/motionScope';
import {creativeMotion,seaCreatureLayout} from '../../ui/motion/creativeMotion';
import './seaMotion.css';
export function ScannedCreatureStage({creatures,environment='reef',paused=false}:{creatures:{id:string;src:string;motion:ScanMotion;alias?:string}[];environment?:string;paused?:boolean}){
 const visible=creatures.slice(0,40),root=useRef<HTMLDivElement>(null),known=useRef<Set<string>|null>(null);
 const [size,setSize]=useState({width:800,height:340}),[hidden,setHidden]=useState(()=>typeof document!=='undefined'&&document.hidden);
 const [reduced,setReduced]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const scope=useRef<ReturnType<typeof createMotionScope>|null>(null);
 const env=SEA_ENVIRONMENTS.find(e=>e.id===environment)||SEA_ENVIRONMENTS[0];
 const [water,setWater]=useState(env.preview),waterRef=useRef<HTMLImageElement>(null),waterChanged=useRef(false);
 useLayoutEffect(()=>{
  const host=root.current;if(!host)return;const current=createMotionScope();scope.current=current;
  const resize=()=>{const r=host.getBoundingClientRect();if(r.width&&r.height)setSize(old=>old.width===r.width&&old.height===r.height?old:{width:r.width,height:r.height});current.cancel();};
  resize();const observer=new ResizeObserver(resize);observer.observe(host);
  const visibility=()=>{setHidden(document.hidden);if(document.hidden)current.cancel();};
  const media=window.matchMedia('(prefers-reduced-motion: reduce)'),change=()=>{setReduced(media.matches);if(media.matches)current.cancel();};
  document.addEventListener('visibilitychange',visibility);media.addEventListener('change',change);
  return()=>{observer.disconnect();current.dispose();scope.current=null;document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',change);};
 },[]);
 useEffect(()=>{
  let active=true;const bitmap=new Image();bitmap.src=env.preview;
  void bitmap.decode().then(()=>{if(active){waterChanged.current=water!==env.preview;setWater(env.preview);}}).catch(()=>{});
  return()=>{active=false;};
 },[env.preview]);
 useLayoutEffect(()=>{
  if(waterChanged.current&&waterRef.current){scope.current?.play(waterRef.current,[{opacity:0},{opacity:1}],{duration:850,easing:creativeMotion.water});waterChanged.current=false;}
 },[water]);
 useLayoutEffect(()=>{
  const ids=new Set(visible.map(c=>c.id));
  if(known.current&&!paused&&!hidden)for(const figure of root.current?.querySelectorAll<HTMLElement>('[data-sea-creature]')||[]){
   if(known.current.has(figure.dataset.seaCreature||''))continue;
   const image=figure.querySelector('img');
   scope.current?.play(image,[{opacity:0,translate:`0px ${-Math.min(24,figure.clientWidth*.25)}px`,scale:'.9'},{opacity:1,translate:'0px 0px',scale:'1'}],{duration:780,easing:creativeMotion.settle});
  }
  known.current=ids;
 },[creatures,paused,hidden]);
 const stopped=paused||hidden||reduced;
 useEffect(()=>{if(stopped)scope.current?.cancel();},[stopped]);
 return <div ref={root} className="scanned-creature-stage creative-water-stage" data-environment={environment} style={{backgroundColor:env.color}} data-paused={stopped}>
  <img ref={waterRef} className="creative-water-backdrop" src={water} alt="" aria-hidden="true"/>
  <div className="scan-stage-rays" aria-hidden="true"/>
  {visible.map((c,i)=>{const p=seaCreatureLayout(size.width,size.height,i,visible.length,c.motion);return <figure key={c.id} data-sea-creature={c.id} className={`scan-creature scan-motion-${c.motion}`} style={{left:p.x,top:p.y,width:p.width,height:p.height,'--sea-drift-x':p.travelX+'px','--sea-drift-y':p.travelY+'px',animationName:c.motion==='floor'?'creative-sea-floor':c.motion==='float'?'creative-sea-float':'creative-sea-swim',animationDelay:`-${i*1.7}s`,animationDuration:`${14+i%8}s`} as CSSProperties}><img style={{height:p.width}} src={c.src} alt={c.alias?`Tranh của ${c.alias}`:'Con vật của bé'}/>{c.alias&&<figcaption>{c.alias}</figcaption>}</figure>;})}
  {!creatures.length&&<p className="scan-stage-empty">Biển đang chờ những người bạn do bé vẽ.</p>}
 </div>;
}
