import {useEffect,useRef,useState} from 'react';
import './resource-seascape.css';
import {ResourceSurface} from './ResourceSurface';
import {createMotionScope} from '../motion/motionScope';

/** Generated transparent watercolor stays at the edges; live content owns the centre. */
export function ResourceSeascape({tone,sceneKey='overview'}:{tone:'learner'|'teacher'|'detail';sceneKey?:string}) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const layers=ref.current?.querySelectorAll('.resource-seascape-art,.resource-seascape-current');
  if(media.matches || document.activeElement?.matches(':focus-visible') || ref.current?.parentElement?.dataset.resourceInput==='keyboard')return;
  const scope=createMotionScope(media);
  [...(layers||[])].forEach((layer,index)=>scope.play(layer,[
   {opacity:0,transform:`translateY(${index?0:12}px)`},{opacity:getComputedStyle(layer).opacity,transform:'translateY(0)'}
  ],{duration:tone==='teacher'?380:760,delay:index*60,easing:'cubic-bezier(.22,1,.36,1)'}));
  const host=ref.current?.parentElement;
  const covered=(event:Event)=>{if(event.target instanceof Element && event.target.closest('button[aria-haspopup="dialog"]'))scope.cancel();};
  host?.addEventListener('click',covered,true);
  return()=>{host?.removeEventListener('click',covered,true);scope.dispose();};
 },[tone,sceneKey]);
 return <div ref={ref} className="resource-seascape" data-resource-scene={tone} aria-hidden="true">
  {tone==='detail' && <ResourceSurface variant="observation"/>}
  <div className="resource-seascape-wash"/><div className="resource-seascape-art"/>
  <svg className="resource-seascape-current" viewBox="0 0 1440 140" preserveAspectRatio="none"><path d="M-20 83C200 10 310 134 520 76S860 5 1060 73 1300 112 1460 36"/><path d="M-20 98C200 25 310 149 520 91S860 20 1060 88 1300 127 1460 51"/></svg>
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
