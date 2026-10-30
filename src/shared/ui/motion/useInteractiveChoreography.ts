import { useEffect, useRef, type RefObject } from 'react';
import { useInteractiveMotionScope } from './useInteractiveMotion';
import { interactiveMotion } from './interactiveMotion';

/** Reveal a section when it is actually visible, including asynchronously loaded cards. */
export function useInteractiveChoreography(root: RefObject<HTMLElement|null>, scene: string) {
  const scope=useInteractiveMotionScope();
  const keyboard=useRef(false);
  // A category change reuses the header and worlds. Reveal only new result nodes.
  const revealed=useRef(new WeakSet<Element>());
  useEffect(()=>{
    const key=()=>{keyboard.current=true;},pointer=()=>{keyboard.current=false;};
    document.addEventListener('keydown',key);document.addEventListener('pointerdown',pointer);
    return ()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',pointer);};
  },[]);
  useEffect(()=>{
    const host=root.current;if(!host)return;
    scope.current?.cancel();
    let disposed=false;
    const seen=revealed.current;
    const learner=host.dataset.audience==='learner';
    const mobile=window.matchMedia('(max-width:767px)').matches;
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left);
      visible.forEach(async(entry,index)=>{
        observer.unobserve(entry.target);
        if(keyboard.current||document.documentElement.dataset.interactiveJourney)return;
        const element=entry.target as HTMLElement;
        const card=element.matches('.curated-card,.ocean-activity-card');
        const art=element.matches('.interactive-world__art');
        // Loading a bitmap must not consume its entrance while it is still invisible.
        if(art||card)await Promise.all([...element.querySelectorAll('img')].map(image=>image.decode().catch(()=>{})));
        if(disposed||!element.isConnected||keyboard.current||document.hidden||document.documentElement.dataset.interactiveJourney)return;
        const bounds=element.getBoundingClientRect();
        if(bounds.bottom<=0||bounds.top>=innerHeight)return;
        const side=entry.boundingClientRect.left+entry.boundingClientRect.width/2<innerWidth/2?-1:1;
        const duration=art?(mobile?760:learner?1050:850):card?(mobile?620:learner?820:680):mobile?480:600;
        const delay=Math.min(index*(art?mobile?65:95:50),mobile?130:art?285:195);
        scope.current?.play(element,[
          {opacity:0,translate:art?`${side*(mobile?8:18)}px ${mobile?14:26}px`:`0px ${card?mobile?14:24:8}px`,rotate:art?`${side*(mobile?1.5:3)}deg`:'0deg',scale:art?'.96':'1'},
          {opacity:1,translate:'0px 0px',rotate:'0deg',scale:'1'},
        ],{duration,delay,easing:interactiveMotion.settle,fill:'backwards'});
      });
    },{threshold:.08});
    const scan=()=>host.querySelectorAll('.curated-interactive__intro,.ocean-play-catalog__intro,.interactive-world__art,.curated-interactive__filters,.ocean-catalog-toolbar,.curated-card,.ocean-activity-card,.usage-summary,.usage-daily-panel,.usage-reading,.usage-activity-row').forEach(element=>{
      if(!seen.has(element)){seen.add(element);observer.observe(element);}
    });
    scan();const mutations=new MutationObserver(scan);mutations.observe(host,{childList:true,subtree:true});
    return ()=>{disposed=true;observer.disconnect();mutations.disconnect();scope.current?.cancel();};
  },[root,scene,scope]);
}
