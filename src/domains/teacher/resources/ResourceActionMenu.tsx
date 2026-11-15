import { useEffect, useRef, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';

/** Native disclosure with a viewport-positioned panel that clears table overflow. */
export function ResourceActionMenu({label,children}: {label:string;children:ReactNode}) {
  const ref=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{
    const dismiss=(event:Event)=>{if(!ref.current?.contains(event.target as Node))ref.current?.removeAttribute('open');};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape' && ref.current?.open){event.preventDefault();event.stopPropagation();ref.current.open=false;ref.current.querySelector('summary')?.focus();}};
    const scroll=()=>{if(ref.current)ref.current.open=false;};
    document.addEventListener('pointerdown',dismiss);
    document.addEventListener('keydown',escape,true);
    window.addEventListener('scroll',scroll,true);
    return()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape,true);window.removeEventListener('scroll',scroll,true);};
  },[]);
  return <details ref={ref} className="resource-action-menu" onToggle={e=>{
    if(!e.currentTarget.open)return;
    const bounds=e.currentTarget.querySelector('summary')!.getBoundingClientRect();
    const panel=e.currentTarget.querySelector('div')!;
    e.currentTarget.style.setProperty('--menu-top',`${Math.max(8,Math.min(bounds.bottom+6,window.innerHeight-panel.offsetHeight-8))}px`);
    e.currentTarget.style.setProperty('--menu-left',`${Math.max(8,Math.min(bounds.right-210,window.innerWidth-218))}px`);
  }}><summary className="ui-filter-control" aria-label={label}><MoreHorizontal size={22}/></summary><div className="ui-option-panel" onClick={e=>{if((e.target as HTMLElement).closest('button') && ref.current){ref.current.open=false;ref.current.querySelector('summary')?.focus({preventScroll:true});}}}>{children}</div></details>;
}
