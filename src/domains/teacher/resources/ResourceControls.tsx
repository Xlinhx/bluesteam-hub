import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { ResourceKind } from './ResourceKind';
import './resource-ocean-controls.css';

export const FORMAT_OPTIONS = [
  {value:'flashcard',label:'Thẻ hình'}, {value:'video',label:'Video'},
  {value:'audio',label:'Âm thanh'}, {value:'coloring',label:'Tranh tô màu'}, {value:'poster',label:'Poster'},
];
export const VISIBILITY_OPTIONS = [{value:'published',label:'Đang hiện'},{value:'hidden',label:'Đã ẩn'}];

export function CoralMark({className=''}:{className?:string}) {
  return <svg className={`resource-coral ${className}`} viewBox="0 0 64 64" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path pathLength="1" d="M32 60V33m0 11L17 33V20m15 15 16-13V8M17 28 7 20v-9m10 12 9-9V6m22 13 10-7V4M32 54l20-13V30M17 20V8M32 33l-3-10"/><path d="m12 43 6 4m31 7 7-3"/></g></svg>;
}

export function ResourceSearch({value,onChange,label,placeholder,autoFocus=false}:{value:string;onChange:(value:string)=>void;label:string;placeholder?:string;autoFocus?:boolean}) {
  return <label className="resource-search ocean-search"><Search size={20}/><input type="search" autoFocus={autoFocus} aria-label={label} placeholder={placeholder || label} value={value} onChange={e=>onChange(e.target.value)}/>{value && <button type="button" aria-label={`Xóa ${label.toLowerCase()}`} onClick={()=>onChange('')}><X size={17}/></button>}<svg viewBox="0 0 64 8" className="resource-search-wave" aria-hidden="true"><path d="M1 4q8-5 16 0t16 0 16 0 15 0" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></label>;
}

export function ResourceSelect({value,onChange,label,options,format=false,disabled=false}:{value:string;onChange:(value:string)=>void;label:string;options:Array<{value:string;label:string;icon?:ReactNode}>;format?:boolean;disabled?:boolean}) {
  const id=useId();
  const trigger=useRef<HTMLButtonElement>(null);
  const panel=useRef<HTMLDivElement>(null);
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(0);
  const typed=useRef({text:'',at:0});
  const current=options.find(option=>option.value===value);
  const close=(restore=false)=>{setOpen(false);if(restore)trigger.current?.focus();};
  useEffect(()=>{
    if(!open)return;
    const element=panel.current;
    const place=()=>{
      if(!element || !trigger.current)return;
      const r=trigger.current.getBoundingClientRect();
      const width=Math.min(Math.max(r.width,230),window.innerWidth-24);
      const below=window.innerHeight-r.bottom-12;
      const above=r.top-12;
      const up=below<240 && above>below;
      Object.assign(element.style,{width:`${width}px`,left:`${Math.max(12,Math.min(r.left,window.innerWidth-width-12))}px`,maxHeight:`${Math.max(96,Math.min(300,up?above:below))}px`,top:up?'auto':`${r.bottom+6}px`,bottom:up?`${window.innerHeight-r.top+6}px`:'auto',transformOrigin:up?'bottom left':'top left'});
    };
    place();
    element?.showPopover();
    const outside=(event:PointerEvent)=>{if(!element?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node))close();};
    const scroll=(event:Event)=>{
      if(element?.contains(event.target as Node))return;
      const bounds=trigger.current?.getBoundingClientRect();
      if(!bounds || bounds.bottom<12 || bounds.top>window.innerHeight-12)close();
      else place();
    };
    document.addEventListener('pointerdown',outside,true);
    document.addEventListener('scroll',scroll,true);
    window.addEventListener('resize',place);
    return()=>{element?.hidePopover();document.removeEventListener('pointerdown',outside,true);document.removeEventListener('scroll',scroll,true);window.removeEventListener('resize',place);};
  },[open]);
  const keyDown=(event:React.KeyboardEvent)=>{
    if(event.key==='Tab'){close();return;}
    if(event.key==='Escape' && open){event.preventDefault();event.stopPropagation();close(true);return;}
    if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(event.key)){
      event.preventDefault();
      if(!open){setActive(Math.max(0,options.findIndex(option=>option.value===value)));setOpen(true);return;}
      if(event.key==='Enter'||event.key===' '){onChange(options[active].value);close(true);return;}
      const next=event.key==='Home'?0:event.key==='End'?options.length-1:(active+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;
      setActive(next);panel.current?.querySelectorAll('[role=option]')[next]?.scrollIntoView({block:'nearest'});return;
    }
    if(event.key.length===1 && !event.ctrlKey && !event.metaKey){
      const now=Date.now();typed.current={text:(now-typed.current.at<700?typed.current.text:'')+event.key.toLocaleLowerCase('vi'),at:now};
      const next=options.findIndex(option=>option.label.toLocaleLowerCase('vi').startsWith(typed.current.text));
      if(next>=0){setActive(next);setOpen(true);}
    }
  };
  return <span className="ocean-select"><button ref={trigger} type="button" role="combobox" aria-label={label} aria-expanded={open} aria-controls={`${id}-list`} aria-haspopup="listbox" aria-activedescendant={open?`${id}-${active}`:undefined} disabled={disabled} onKeyDown={keyDown} onClick={()=>{setActive(Math.max(0,options.findIndex(option=>option.value===value)));setOpen(v=>!v);}}>{format && current && (value==='visual'||FORMAT_OPTIONS.some(option=>option.value===value)) && <ResourceKind kind={value} iconOnly/>}<span>{current?.label || label}</span><ChevronDown size={18}/></button><div ref={panel} popover="manual" id={`${id}-list`} role="listbox" aria-label={label} className="ocean-select-options">{options.map((option,index)=><div key={option.value} id={`${id}-${index}`} role="option" aria-selected={value===option.value} data-active={active===index} onPointerMove={()=>setActive(index)} onPointerDown={e=>e.preventDefault()} onClick={event=>{event.preventDefault();event.stopPropagation();onChange(option.value);close(true);}}>{option.icon || (format && (option.value==='visual'||FORMAT_OPTIONS.some(o=>o.value===option.value))?<ResourceKind kind={option.value} iconOnly/>:null)}<span>{option.label}</span>{value===option.value && <Check size={18}/>}</div>)}</div></span>;
}
