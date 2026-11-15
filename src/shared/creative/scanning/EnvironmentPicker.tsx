import { SearchField } from '@/shared/ui/controls/SearchField';
import {useId,useState} from 'react';
import {Check,ChevronDown,ChevronLeft,ChevronRight} from 'lucide-react';
import {SCAN_ENVIRONMENTS} from './scanDocument';
import './environmentPicker.css';
export interface SeaEnvironment {id:string;title:string;color:string;preview:string}
export const SEA_ENVIRONMENTS:readonly SeaEnvironment[]=SCAN_ENVIRONMENTS;
const PAGE_SIZE=6;
/** One bounded, searchable catalogue for teacher and learner. */
export function EnvironmentPicker({value,onChange,disabled=false,compact=false,environments=SEA_ENVIRONMENTS}:{value:string;onChange:(id:string)=>void;disabled?:boolean;compact?:boolean;environments?:readonly SeaEnvironment[]}){
 const [expanded,setExpanded]=useState(!compact),[q,setQ]=useState(''),[page,setPage]=useState(0);const id=useId();
 const selected=environments.find(e=>e.id===value),normalize=(s:string)=>s.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
 const filtered=environments.filter(e=>normalize(e.title).includes(normalize(q.trim()))),pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)),current=Math.min(page,pages-1);
 return <div className="sea-environment-picker">
  {compact&&<button type="button" className="sea-environment-trigger ui-filter-control" disabled={disabled} aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(v=>!v)}>{selected&&<img src={selected.preview} alt=""/>}<span>{selected?.title||'Chọn môi trường'}</span><ChevronDown size={19} aria-hidden="true"/></button>}
  {expanded&&<div id={id} className="sea-environment-catalog"><SearchField className="sea-environment-search" label="Tìm môi trường" placeholder="Tìm môi trường…" disabled={disabled} value={q} onChange={value=>{setQ(value);setPage(0);}}/>
   <div className="sea-environment-grid">{filtered.slice(current*PAGE_SIZE,(current+1)*PAGE_SIZE).map(e=><button type="button" key={e.id} data-environment-option={e.id} disabled={disabled} aria-pressed={value===e.id} onClick={()=>{onChange(e.id);if(compact)setExpanded(false);}}><img src={e.preview} alt="" loading="lazy"/><span>{e.title}<i>{value===e.id&&<Check size={14}/>}</i></span></button>)}</div>
   {!filtered.length&&<p className="sea-environment-empty">Không tìm thấy môi trường. Thử từ khóa khác.</p>}
   <div className="sea-environment-pagination"><small>Đang chọn: {selected?.title||'Chưa chọn'}</small>{pages>1&&<div><button type="button" aria-label="Trang môi trường trước" disabled={disabled||!current} onClick={()=>setPage(current-1)}><ChevronLeft size={18}/></button><span>Trang {current+1} / {pages}</span><button type="button" aria-label="Trang môi trường sau" disabled={disabled||current+1>=pages} onClick={()=>setPage(current+1)}><ChevronRight size={18}/></button></div>}</div>
  </div>}
 </div>;
}
