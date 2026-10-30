import {useEffect,useRef,useState,type ReactNode} from 'react';
import {X} from 'lucide-react';
import {createMotionScope} from '../ui/motion/motionScope';
import './creativeToolPanel.css';

/** A paper-side panel on desktop, a focus-contained sheet on a phone. */
export function CreativeToolPanel({title,open,onClose,children,className='',alwaysDesktop=false}:{title:string;open:boolean;onClose:()=>void;children:ReactNode;className?:string;alwaysDesktop?:boolean}) {
  const [mobile,setMobile]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(max-width:800px)').matches);
  useEffect(()=>{const media=window.matchMedia('(max-width:800px)');const update=()=>setMobile(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  const panel=useRef<HTMLElement>(null);
  const [retained,setRetained]=useState(open);
  const motion=useRef<ReturnType<typeof createMotionScope>|null>(null);
  useEffect(()=>{motion.current=createMotionScope();return()=>motion.current?.dispose();},[]);
  useEffect(()=>{
    const element=panel.current;if(!element)return;
    let alive=true,frame=0;
    const current=getComputedStyle(element);
    const interrupted=element.getAnimations().length>0;
    const start=interrupted?{transform:current.transform,opacity:current.opacity}:undefined;
    motion.current?.cancel();
    // The permanently visible desktop library does not open or close as a sheet.
    if(!element.closest('.learner-creative-page')||(alwaysDesktop&&!mobile)){setRetained(open);return;}
    const folded={transform:mobile?'translateY(100%)':'translateX(28px)',opacity:mobile?'.8':'0'};
    if(open){
      setRetained(true);
      frame=requestAnimationFrame(()=>{motion.current?.play(element,[start||folded,{transform:'none',opacity:1}],{duration:mobile?580:460,easing:'cubic-bezier(.22,1,.36,1)'});});
    }else if(retained){
      const animation=motion.current?.play(element,[start||{transform:'none',opacity:1},folded],{duration:mobile?280:220,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
      const finish=()=>{if(alive){animation?.cancel();setRetained(false);}};
      if(animation)void animation.finished.then(finish,finish);else finish();
    }
    return()=>{alive=false;cancelAnimationFrame(frame);};
  },[open,mobile,alwaysDesktop]);
  const close=useRef(onClose);close.current=onClose;
  useEffect(()=>{
    if(!open)return;
    const previous=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;
    const scrollY=window.scrollY;
    if(mobile){
      const workspace=panel.current?.closest('.creative-workspace');
      const surface=workspace?.querySelector<HTMLElement>('[data-testid="drawing-canvas"],[data-testid="habitat-board"]');
      if(surface)window.scrollTo({top:window.scrollY+surface.getBoundingClientRect().top-100,behavior:'instant'});
      document.body.style.overflow='hidden';
    }
    panel.current?.querySelector<HTMLElement>('button,input')?.focus({preventScroll:true});
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();close.current();}
      if(!mobile||event.key!=='Tab')return;
      const nodes=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')||[]).filter(n=>n.getClientRects().length);
      const first=nodes[0],last=nodes.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',key);
    return()=>{if(mobile){document.body.style.overflow=overflow;window.scrollTo({top:scrollY,behavior:'instant'});}document.removeEventListener('keydown',key);previous?.focus({preventScroll:true});};
  },[open,mobile]);
  return <div className={`creative-tool-panel-host ${open||retained?'is-open':''} ${alwaysDesktop?'always-desktop':''} ${className}`} inert={!open&&retained&&!(alwaysDesktop&&!mobile)}>
    <button className="creative-tool-scrim" aria-label="Đóng bảng công cụ" tabIndex={-1} onClick={onClose}/>
    <aside ref={panel} className="creative-tool-panel" role={open?'dialog':undefined} aria-modal={open&&mobile?true:undefined} aria-label={title}>
      <header className="creative-tool-panel-heading"><h2>{title}</h2><button type="button" aria-label="Đóng" onClick={onClose}><X size={22}/></button></header>
      {(open||retained||alwaysDesktop)&&children}
    </aside>
  </div>;
}
