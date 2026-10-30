import { useLayoutEffect, useRef } from 'react';
import { BarChart3, Eye } from 'lucide-react';
import { useInteractiveMotionScope } from '@/shared/ui/motion/useInteractiveMotion';
import { interactiveMotion } from '@/shared/ui/motion/interactiveMotion';

export function InteractiveViewSwitch({usage,onChange}:{usage:boolean;onChange:(usage:boolean)=>void}) {
  const root=useRef<HTMLElement>(null),marker=useRef<HTMLSpanElement>(null),pointer=useRef(false);
  const previous=useRef<{left:number;width:number}|null>(null);
  const scope=useInteractiveMotionScope();
  useLayoutEffect(()=>{
    const measure=(animate:boolean)=>{
      const selected=root.current?.querySelector<HTMLElement>('[aria-pressed=true]'),track=marker.current;
      if(!selected||!track)return;
      const next={left:selected.offsetLeft,width:selected.offsetWidth},old=previous.current;
      if(!animate&&old?.left===next.left&&old.width===next.width)return;
      const visual=track.getBoundingClientRect(),destination=selected.getBoundingClientRect();
      track.style.left=`${next.left}px`;track.style.width=`${next.width}px`;
      if(animate&&old&&pointer.current)scope.current?.play(track,[{translate:`${visual.left-destination.left}px 0px`,scale:`${visual.width/destination.width} 1`},{translate:'0px 0px',scale:'1 1'}],{duration:420,easing:interactiveMotion.settle});
      else scope.current?.cancel();
      previous.current=next;pointer.current=false;
    };
    measure(true);
    const observer=new ResizeObserver(()=>measure(false));
    if(root.current)observer.observe(root.current);
    return()=>observer.disconnect();
  },[usage,scope]);
  return <nav ref={root} className="curated-interactive__views" aria-label="Chế độ thư viện"><span ref={marker} className="interactive-view-current" aria-hidden="true"/><button aria-pressed={!usage} onClick={event=>{pointer.current=event.detail>0;onChange(false);}}><Eye size={20}/>Hoạt động</button><button aria-pressed={usage} onClick={event=>{pointer.current=event.detail>0;onChange(true);}}><BarChart3 size={20}/>Xu hướng</button></nav>;
}
