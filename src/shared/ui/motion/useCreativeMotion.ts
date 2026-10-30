import {useEffect,useRef} from 'react';
import {createMotionScope} from './motionScope';
import {creativeMotion,creativeTravel} from './creativeMotion';
import './creative-motion.css';
type Scene='teacher'|'hub'|'scan'|'drawing'|'habitat';

/** Context-specific choreography; never moves a drawing canvas or the 3D workspace. */
export function useCreativeMotion<T extends HTMLElement=HTMLDivElement>(scene:Scene){
 const root=useRef<T|null>(null);
 useEffect(()=>{
  const host=root.current;if(!host)return;
  const scope=createMotionScope(),seen=new WeakSet<Element>(),values=new WeakMap<Element,string>();
  // The route snapshot already owns this entrance, including asynchronous page data.
  // Replaying element entrances afterwards produces a visible second arrival.
  const routeOwnsEntrance=!!document.documentElement.dataset.creativeJourney;
  let disposed=false,frame=0,keyboard=false,origin:DOMRect|null=null,hadCompleteButton=false,revision=0;
  const playing=new Map<Element,Animation>();
  host.dataset.creativeMotionHost=scene;
  const play=(el:Element|null,frames:Keyframe[],duration:number,delay=0)=>{
   if(!el||keyboard||document.hidden||!el.isConnected)return;
   const animation=scope.play(el,frames,{duration,delay,easing:creativeMotion.settle,fill:'backwards'});
   if(animation){playing.set(el,animation);void animation.finished.catch(()=>{}).finally(()=>{if(playing.get(el)===animation)playing.delete(el);});}
  };
  const visible=(el:Element)=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight;};
  const show=async(el:Element,initial:boolean)=>{
   const version=revision;
   if(el instanceof HTMLImageElement)await el.decode().catch(()=>{});
   if(disposed||version!==revision||!visible(el))return;
   if(document.documentElement.dataset.creativeJourney)return;
   if(scene==='hub'&&routeOwnsEntrance)return;
   if(scene==='hub'){
    if(el.matches('.scan-life-fish-water')){
     const paper=host.querySelector('.scan-life-fish-paper');
     if(paper){const trip=creativeTravel(paper.getBoundingClientRect(),el.getBoundingClientRect(),'learner');if(trip)play(el,trip.frames,trip.duration);}
    }else if(el.matches('.creative-coloring-preview img'))play(el,[{clipPath:'inset(0 0 100% 0 round 8px)'},{clipPath:'inset(0 0 0 0 round 8px)'}],1000);
    else if(el.matches('.habitat-entry>img'))play(el,[{rotate:'-1deg',transformOrigin:'50% 100%'},{rotate:'0deg',transformOrigin:'50% 100%'}],1150);
   }
   if(el.matches('.scan-checker canvas')&&(el as HTMLElement).dataset.creativeReady!=='true')return;
   if(origin&&el.matches('.ct-scan-comparison figure:last-child img,.scan-checker canvas')){
    const trip=creativeTravel(origin,el.getBoundingClientRect(),scene==='teacher'?'teacher':'learner');origin=null;
    if(trip)play(el,trip.frames,trip.duration);
   }
   if(!initial&&hadCompleteButton&&el.matches('.creative-finished')){
    play(el.querySelector('svg'),[{scale:'.85',rotate:'-12deg'},{scale:'1.12',rotate:'0deg',offset:.55},{scale:'1',rotate:'0deg'}],650);
   }
   if(!initial&&el.matches('.sea-environment-catalog'))play(el,[{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0 0)'}],creativeMotion.disclose);
   if(!initial&&el.matches('.creative-submission-tile>img'))play(el,[{clipPath:'inset(0 100% 0 0 round 9px)'},{clipPath:'inset(0 0 0 0 round 9px)'}],220);
  };
  const layerSelector=scene==='teacher'?'.ct-sea-hero-art,.ct-sea-hero-copy,.ct-recent-sea,.ct-report-heading,.ct-report-metrics>div,.ct-template-paper,.ct-tools-panel,.ct-review-main,.ct-review-sidebar':scene==='hub'?'.creative-hub-heading h1,.creative-hub-heading p,.creative-hub-badge,.scan-entry>header,.coloring-entry>header,.scan-life-drawing,.scan-life-fish-paper,.scan-life-arrow,.scan-life-splash,.creative-resume,.habitat-entry-copy':scene==='scan'?'.scan-heading,.scan-capture-intro,.scan-crop-controls,.scan-source-paper,.scan-paper,.scan-transfer-footer,.scan-artwork-name':scene==='drawing'?'.drawing-toolbar,.drawing-palette,.creative-workspace-bar':'.creative-habitat-inspector,.habitat-recent-tray,.creative-workspace-bar';
  const layers=new WeakSet<Element>();
  const revealLayer=async(el:Element)=>{
   if(routeOwnsEntrance||document.documentElement.dataset.creativeJourney)return;
   const version=revision;if(el instanceof HTMLImageElement)await el.decode().catch(()=>{});
   if(disposed||keyboard||version!==revision||!visible(el))return;
   const rect=el.getBoundingClientRect(),mobile=innerWidth<700,teacher=scene==='teacher';
   const fromLeft=rect.left+rect.width/2<innerWidth/2;
   const distance=Math.min(teacher?18:30,rect.width*.06),delay=Math.min(teacher?160:280,Math.max(0,rect.top)*(teacher?.16:.28));
   if(el.matches('.ct-sea-hero-art'))play(el,[{clipPath:'inset(0 0 0 38% round 35px)',translate:'24px 0px',scale:'1.04'},{clipPath:'inset(0 round 0)',translate:'0px 0px',scale:'1'}],1400,80);
   else if(el.matches('.scan-life-drawing,.scan-life-fish-paper'))play(el,[{translate:`${fromLeft?-distance:distance}px 12px`,rotate:fromLeft?'-5deg':'4deg',transformOrigin:'50% 90%',opacity:.65},{translate:'0px 0px',rotate:'0deg',opacity:1}],1150,el.matches('.scan-life-fish-paper')?160:40);
   else if(el.matches('.scan-life-arrow,.scan-life-splash'))play(el,[{clipPath:'inset(0 100% 0 0)',opacity:0},{clipPath:'inset(0)',opacity:1}],900,el.matches('.scan-life-splash')?380:180);
   else if(el.matches('.creative-hub-heading h1'))play(el,[{clipPath:'inset(0 0 95% 0)',translate:'0px 14px'},{clipPath:'inset(0)',translate:'0px 0px'}],1050,60);
   else if(el.matches('.creative-hub-badge'))play(el,[{rotate:'-7deg',translate:'-10px -10px'},{rotate:'0deg',translate:'0px 0px'}],1250);
   else if(el.matches('.ct-tools-panel')){for(const [i,meter]of [...el.querySelectorAll('meter')].entries())play(meter,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0)'}],900,i*90);}
   else if(el.matches('.ct-template-paper,.scan-source-paper,.scan-paper,.ct-review-main'))play(el,[{clipPath:fromLeft?'inset(0 0 0 9% round 22px)':'inset(0 9% 0 0 round 22px)',translate:`${fromLeft?-distance:distance}px 0px`,opacity:.7},{clipPath:'inset(0 round 0)',translate:'0px 0px',opacity:1}],teacher?900:1100,delay);
   else play(el,[{translate:`0px ${mobile?8:distance*.6}px`,opacity:.45},{translate:'0px 0px',opacity:1}],teacher?760:1000,delay);
  };
  const layerObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){layerObserver.unobserve(entry.target);void revealLayer(entry.target);}},{threshold:.12});
  const visualSelector=scene==='hub'?'.scan-life-fish-water,.creative-coloring-preview img,.habitat-entry>img':scene==='teacher'?'.ct-scan-comparison figure:last-child img,.sea-environment-catalog,.creative-submission-tile>img':'.scan-checker canvas,.creative-finished,.sea-environment-catalog';
  const numbers='.ct-sea-counts dd,.creative-metrics strong,.ct-state';
  const scan=(initial=false)=>{
   host.querySelectorAll(layerSelector).forEach(el=>{if(!layers.has(el)){layers.add(el);layerObserver.observe(el);}});
   hadCompleteButton=hadCompleteButton||!!host.querySelector('.creative-complete-button');
   host.querySelectorAll(visualSelector).forEach(el=>{if(!seen.has(el)){seen.add(el);void show(el,initial);}});
   if(scene==='teacher')host.querySelectorAll(numbers).forEach(el=>{
    const value=el.textContent||'',prior=values.get(el);values.set(el,value);
    if(prior!==undefined&&prior!==value)play(el,[{color:'#008da4'},{color:getComputedStyle(el).color}],180);
   });
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;scan();});};
  scan(true);
  const observer=new MutationObserver(schedule);observer.observe(host,{childList:true,subtree:true,characterData:true});
  const pointer=(event:PointerEvent)=>{
   keyboard=false;const target=event.target instanceof Element?event.target:null;if(!target)return;
   revision++;
   for(const el of playing.keys())if(el===target||el.contains(target)||target.contains(el)){scope.cancel(el);playing.delete(el);}
   const tile=target.closest('.creative-submission-tile');
   if(tile)origin=tile.querySelector('img')?.getBoundingClientRect()||null;
   else if(target.closest('.scan-crop-controls button'))origin=host.querySelector('.scan-crop-preview img')?.getBoundingClientRect()||null;
  };
  const key=()=>{revision++;keyboard=true;scope.cancel();origin=null;};
  const cancel=()=>{revision++;scope.cancel();origin=null;};
  const hidden=()=>{host.dataset.creativeHidden=String(document.hidden);if(document.hidden)cancel();};
  host.dataset.creativeHidden=String(document.hidden);
  host.addEventListener('pointerdown',pointer,true);host.addEventListener('keydown',key,true);
  const focus=(event:FocusEvent)=>{const el=event.target;if(el instanceof Element)scope.cancel(el);};
  const ready=(event:Event)=>{if(event.target instanceof HTMLCanvasElement)void show(event.target,false);};
  host.addEventListener('focusin',focus);host.addEventListener('bluesteam:creative-image-ready',ready);
  window.addEventListener('resize',cancel);window.addEventListener('scroll',cancel,true);document.addEventListener('visibilitychange',hidden);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();layerObserver.disconnect();delete host.dataset.creativeMotionHost;delete host.dataset.creativeHidden;scope.dispose();host.removeEventListener('focusin',focus);host.removeEventListener('bluesteam:creative-image-ready',ready);host.removeEventListener('pointerdown',pointer,true);host.removeEventListener('keydown',key,true);window.removeEventListener('resize',cancel);window.removeEventListener('scroll',cancel,true);document.removeEventListener('visibilitychange',hidden);};
 },[scene]);
 return root;
}
