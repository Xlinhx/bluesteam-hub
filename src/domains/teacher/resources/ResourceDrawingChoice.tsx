import {useEffect,useRef,useState} from 'react';
import {fetchPublicCreativeTemplates,type CreativeTemplateDto} from '../../../shared/api/catalog';
import {DRAWING_STARTERS} from '../../../shared/creative/useCreativeWorkspace';
import {apiRequest} from '../../../shared/api/client';
import {ResourceSearch} from './ResourceControls';

export function ResourceDrawingChoice({value,onChange,disabled}:{value:string;onChange:(value:string)=>void;disabled:boolean}){
 const [open,setOpen]=useState(false);const [search,setSearch]=useState('');
 const [items,setItems]=useState<CreativeTemplateDto[]>([]);const [cursor,setCursor]=useState<string|null>(null);
 const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [retry,setRetry]=useState(0);
 const moreRequest=useRef<AbortController|null>(null);
 const [selected,setSelected]=useState<CreativeTemplateDto|null>(null);
 useEffect(()=>{if(!value||DRAWING_STARTERS.some(t=>t.id===value)){setSelected(null);return;}const abort=new AbortController();apiRequest<CreativeTemplateDto>(`/api/v1/creative-templates/${encodeURIComponent(value)}`,{signal:abort.signal}).then(setSelected).catch(()=>{if(!abort.signal.aborted)setSelected(null);});return()=>abort.abort();},[value]);
 useEffect(()=>{if(!open)return;const abort=new AbortController();setLoading(true);setError('');setItems([]);setCursor(null);const timer=setTimeout(()=>{fetchPublicCreativeTemplates({kind:'drawing',q:search,limit:6},abort.signal).then(page=>{if(!abort.signal.aborted){setItems(page.items);setCursor(page.nextCursor);}}).catch(err=>{if(!abort.signal.aborted)setError(err.message);}).finally(()=>{if(!abort.signal.aborted)setLoading(false);});},250);return()=>{clearTimeout(timer);abort.abort();moreRequest.current?.abort();};},[open,search,retry]);
 const starter=DRAWING_STARTERS.find(t=>t.id===value);
 return <section className="resource-drawing-choice" data-editor-field="template" tabIndex={-1}><h3>Mẫu tô tương tác</h3><p className="resource-field-hint">Bé mở mẫu này trong xưởng tô màu. File bản in được quản lý riêng ở trên.</p>
  {value&&<div className="resource-template-selected">{(selected?.previewUrl||starter?.outlineUrl)&&<img src={selected?.previewUrl||starter?.outlineUrl} alt="Mẫu tô đã chọn"/>}<strong>{selected?.title||starter?.title||'Mẫu đã chọn'}</strong><button type="button" disabled={disabled} onClick={()=>onChange('')}>Bỏ mẫu</button></div>}
  <button className="resource-secondary" type="button" aria-expanded={open} disabled={disabled} onClick={()=>setOpen(v=>!v)}>{open?'Đóng danh sách mẫu':value?'Đổi mẫu tô':'Chọn mẫu tô'}</button>
  {open&&<div className="resource-drawing-options"><ResourceSearch label="Tìm mẫu tô" value={search} onChange={setSearch}/><div className="resource-template-grid">
   {DRAWING_STARTERS.filter(t=>t.title.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))).map(t=><button key={t.id} type="button" aria-pressed={value===t.id} onClick={()=>{onChange(t.id);setOpen(false);}}>{t.outlineUrl&&<img src={t.outlineUrl} alt=""/>}<span>{t.title}</span></button>)}
   {items.map(t=><button key={t.id} type="button" aria-pressed={value===t.id} onClick={()=>{setSelected(t);onChange(t.id);setOpen(false);}}>{t.previewUrl&&<img src={t.previewUrl} alt=""/>}<span>{t.title}</span></button>)}
  </div>{loading&&<p role="status">Đang tìm mẫu tô…</p>}{error&&<p role="alert">{error} <button type="button" onClick={()=>setRetry(v=>v+1)}>Thử lại</button></p>}{!loading&&!error&&!items.length&&<p>Không có thêm mẫu đã xuất bản phù hợp.</p>}
  {cursor&&!error&&<button type="button" className="resource-secondary" disabled={loading} onClick={async()=>{const abort=new AbortController();moreRequest.current=abort;setLoading(true);setError('');try{const page=await fetchPublicCreativeTemplates({kind:'drawing',q:search,cursor,limit:6},abort.signal);if(abort.signal.aborted)return;setItems(prev=>[...prev,...page.items.filter(t=>!prev.some(p=>p.id===t.id))]);setCursor(page.nextCursor);}catch(err){if(!abort.signal.aborted)setError(err instanceof Error?err.message:'Chưa tải được mẫu.');}finally{if(!abort.signal.aborted)setLoading(false);}}}>Các mẫu khác</button>}</div>}
 </section>;
}
