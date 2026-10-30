import { useLayoutEffect, useRef, type RefObject } from 'react';
import { useInteractiveMotionScope } from '../../ui/motion/useInteractiveMotion';
import { interactiveMotion } from '../../ui/motion/interactiveMotion';

export function useComparisonMotion(root:RefObject<HTMLElement|null>, comparing:boolean) {
  const scope=useInteractiveMotionScope();
  useLayoutEffect(()=>{
    scope.current?.cancel();
    if(!comparing)return;
    const mobile=window.matchMedia('(max-width:767px)').matches;
    root.current?.querySelectorAll<HTMLElement>('[data-comparison-image]').forEach((image,index)=>{
      scope.current?.play(image,[{clipPath:mobile?'inset(0 0 100% 0)':index===0?'inset(0 0 0 100%)':'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:mobile?520:720,easing:interactiveMotion.settle});
    });
  },[comparing,root,scope]);
}

export function useWaypointMotion(marker:RefObject<HTMLElement|null>, waypoint:number, playing:boolean) {
  const previous=useRef<{left:number;top:number}|null>(null), scope=useInteractiveMotionScope();
  useLayoutEffect(()=>{
    const element=marker.current;if(!element)return;
    const translated=getComputedStyle(element).translate.split(' ').map(value=>parseFloat(value)||0);
    const tx=translated[0]||0,ty=translated[1]||0;
    const bounds=element.getBoundingClientRect(),next={left:bounds.left-tx,top:bounds.top-ty},old=previous.current;
    scope.current?.cancel();
    if(playing&&old){
      const x=old.left+tx-next.left,y=old.top+ty-next.top;
      scope.current?.play(element,[{translate:`${x}px ${y}px`},{translate:'0px 0px'}],{duration:Math.min(500,240+Math.hypot(x,y)*.5),easing:interactiveMotion.travel});
    }
    previous.current=next;
  },[waypoint,playing,marker,scope]);
}

export function useScenarioMotion(image:RefObject<HTMLElement|null>, scene:string|undefined) {
  const previous=useRef(scene),scope=useInteractiveMotionScope();
  useLayoutEffect(()=>{
    if(previous.current!==scene){scope.current?.play(image.current,[{opacity:.6,translate:'0px 10px'},{opacity:1,translate:'0px 0px'}],{duration:560,easing:interactiveMotion.settle});previous.current=scene;}
  },[scene,image,scope]);
}
