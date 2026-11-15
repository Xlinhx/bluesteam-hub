import {useEffect,useRef,useState} from 'react';
import './resource-seascape.css';
import {ResourceSurface} from './ResourceSurface';

/** Scene layer shared by the resource library and detail pages. */
export function ResourceSeascape({tone}:{tone:'learner'|'teacher'|'detail'}) {
 return <div className="resource-seascape" data-resource-scene={tone} aria-hidden="true">
  {tone==='detail' && <ResourceSurface variant="observation"/>}
  {tone==='teacher' && <div className="resource-seascape-wash"/>}
 </div>;
}

/** A short current starts exactly where a pointer opens a collection. Keyboard stays immediate. */
export function ResourceCurrent() {
 const ref=useRef<HTMLDivElement>(null);
 const [pulse,setPulse]=useState<{x:number;y:number;token:number}|null>(null);
 useEffect(()=>{
  const host=ref.current?.parentElement;const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const click=(event:MouseEvent)=>{
   if(host)host.dataset.resourceInput=event.detail===0?'keyboard':'pointer';
   if(media.matches || event.detail===0)return;
   const target=(event.target as Element).closest<HTMLButtonElement>('button[data-ocean-action]');
   if(!target || target.disabled)return;
   // A native modal's backdrop would cover this page-level pulse immediately.
   if(target.getAttribute('aria-haspopup')==='dialog')return;
   setPulse({x:event.clientX,y:event.clientY,token:performance.now()});
  };
  const stop=()=>setPulse(null);
  const keyboard=()=>{if(host)host.dataset.resourceInput='keyboard';setPulse(null);host?.querySelectorAll('.resource-seascape').forEach(layer=>layer.getAnimations({subtree:true}).forEach(animation=>animation.cancel()));};
  host?.addEventListener('click',click,true);host?.addEventListener('keydown',keyboard,true);media.addEventListener('change',stop);
  return()=>{host?.removeEventListener('click',click,true);host?.removeEventListener('keydown',keyboard,true);media.removeEventListener('change',stop);};
 },[]);
 useEffect(()=>{if(!pulse)return;const timer=setTimeout(()=>setPulse(null),680);return()=>clearTimeout(timer);},[pulse]);
 return <div ref={ref} className="resource-current-feedback" aria-hidden="true">{pulse && <svg key={pulse.token} className="resource-current-pulse" viewBox="0 0 160 160" style={{left:pulse.x-80,top:pulse.y-80}}><circle cx="80" cy="80" r="34"/><circle cx="80" cy="80" r="48"/><path d="M32 88Q56 62 80 85T130 78"/></svg>}</div>;
}
