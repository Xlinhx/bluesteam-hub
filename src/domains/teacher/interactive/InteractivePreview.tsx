import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useInteractiveMotionScope } from '@/shared/ui/motion/useInteractiveMotion';
import { interactiveMotion } from '@/shared/ui/motion/interactiveMotion';
import {rectTransform} from '@/shared/ui/motion/motionScope';

/** The observation window opens from the actual preview trigger; gameplay never waits for it. */
export function InteractivePreview({title, version, source, onClose, children}: {title:string;version:number;source:HTMLElement|null;onClose:()=>void;children:(close:()=>void)=>ReactNode}) {
  const root = useRef<HTMLDivElement>(null), closing = useRef(false), alive = useRef(false);
  const flight=useRef<HTMLImageElement>(null);
  const origin=useRef((()=>{
    const image=source?.closest('.curated-card,.usage-activity-row')?.querySelector<HTMLImageElement>('.activity-thumbnail');
    return image?.complete&&image.naturalWidth?{src:image.currentSrc,rect:image.getBoundingClientRect()}:null;
  })());
  const keyboardEntry=useRef(Boolean(source?.matches(':focus-visible')));
  const scope = useInteractiveMotionScope();
  const callback = useRef(onClose); callback.current = onClose;
  const aperture = useCallback(() => {
    const rect = source?.isConnected ? source.getBoundingClientRect() : null;
    if (!rect || keyboardEntry.current || rect.bottom < 0 || rect.top > innerHeight) return null;
    const x = Math.max(0,Math.min(innerWidth,rect.left+rect.width/2));
    const y = Math.max(0,Math.min(innerHeight,rect.top+rect.height/2));
    const radius = Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
    return [`circle(${Math.max(24,Math.min(rect.width,rect.height)/2)}px at ${x}px ${y}px)`,`circle(${radius}px at ${x}px ${y}px)`];
  }, [source]);
  useLayoutEffect(() => {
    alive.current = true;
    const mobile=window.matchMedia('(max-width:767px)').matches;
    const frames = aperture();
    if (frames) scope.current?.play(root.current,[{clipPath:frames[0]},{clipPath:frames[1]}],{duration:mobile?620:interactiveMotion.preview,easing:interactiveMotion.settle});
    const destination=root.current?.querySelector<HTMLElement>('.sorting-ocean__scene,.sorting-journey__observation,.interactive-activity-motion');
    if(origin.current&&flight.current&&destination&&!keyboardEntry.current){
      const box=destination.getBoundingClientRect(),image=flight.current;
      const transform=rectTransform(origin.current.rect,box);
      Object.assign(image.style,{left:`${box.left}px`,top:`${box.top}px`,width:`${box.width}px`,height:`${box.height}px`});
      if(transform)scope.current?.play(image,[{transform,opacity:1,borderRadius:'20px'},{opacity:1,offset:.78},{transform:'none',opacity:0,borderRadius:'0px'}],{duration:mobile?820:1080,easing:'cubic-bezier(.42,0,.18,1)'});
    }
    return () => { alive.current=false; };
  }, [aperture,scope]);
  const close = useCallback((immediate=false) => {
    if (closing.current) return;
    closing.current = true;
    if(flight.current)scope.current?.cancel(flight.current);
    if(immediate){scope.current?.cancel();callback.current();return;}
    const frames = aperture();
    const visual=root.current?getComputedStyle(root.current).clipPath:'none';
    const animation = frames && root.current ? scope.current?.play(root.current,[{clipPath:visual==='none'?frames[1]:visual},{clipPath:frames[0]}],{duration:420,easing:interactiveMotion.travel,fill:'forwards'}) : null;
    if (!animation) { callback.current(); return; }
    void animation.finished.then(() => { if(alive.current) callback.current(); }, () => { if(alive.current) callback.current(); });
  }, [aperture,scope]);
  useEffect(() => {
    const app=document.getElementById('root'),previousInert=app?.inert;
    if(app)app.inert=true;
    const previous = document.body.style.overflow; document.body.style.overflow='hidden';root.current?.focus();
    const key = (event:KeyboardEvent) => {
      if(event.key==='Escape'){event.preventDefault();close(true);return;}
      if(event.key!=='Tab')return;
      const nodes=root.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,[tabindex="0"],iframe');
      if(!nodes?.length)return;
      const first=nodes[0],last=nodes[nodes.length-1];
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===root.current)){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',key);
    return () => { document.body.style.overflow=previous;if(app)app.inert=previousInert??false; document.removeEventListener('keydown',key);if(source?.isConnected)source.focus(); };
  }, [close,source]);
  return createPortal(<div className="curated-preview-layer"><div ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`Xem thử ${title}`} className="curated-preview"><div className="curated-preview__bar"><span>Xem thử bản hiện có · Phiên bản {version} · Không ghi nhận số liệu</span><button onClick={event=>close(event.detail===0)} aria-label="Đóng xem thử"><X/></button></div>{children(()=>close())}</div>{origin.current&&<img ref={flight} className="interactive-preview-flight" src={origin.current.src} alt="" aria-hidden="true"/>}</div>,document.body);
}
