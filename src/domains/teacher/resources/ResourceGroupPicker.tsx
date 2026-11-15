import { CatalogPagination, RESOURCE_PAGE_SIZE } from '../../../shared/ui/catalog/CatalogPagination';
import { useEffect, useState } from 'react';
import { Check, Waves } from 'lucide-react';
import { fetchResourceGroups, type ResourceGroup } from '../../../shared/api/resourceGroups';
import { cropImageStyle } from '../../../shared/ui/visuals/resourceCoverCrop';
import { ResourceSearch } from './ResourceControls';

export function ResourceGroupPicker({selectedIds,onToggle,onClose,excludeId}:{selectedIds:string[];onToggle:(group:ResourceGroup)=>void;onClose?:()=>void;excludeId?:string}) {
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);
  const [items,setItems]=useState<ResourceGroup[]>([]);
  const [total,setTotal]=useState(0);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    const abort=new AbortController();setLoading(true);setError('');
    const timer=setTimeout(()=>void fetchResourceGroups({teacher:true,ownedOnly:true,q:search,cursor:String((page - 1) * RESOURCE_PAGE_SIZE),limit:RESOURCE_PAGE_SIZE},abort.signal).then(result=>{
      if(!abort.signal.aborted){setItems(result.items);setTotal(result.total);setPage(Math.min(page, Math.max(1, Math.ceil(result.total / RESOURCE_PAGE_SIZE))));}
    }).catch(err=>{if(!abort.signal.aborted)setError(err.message);}).finally(()=>{if(!abort.signal.aborted)setLoading(false);}),200);
    return()=>{clearTimeout(timer);abort.abort();};
  },[search,page,retry]);
  return <section className="teacher-group-picker" aria-label="Chọn nhóm cho học liệu">
    <ResourceSearch label="Tìm nhóm để gắn học liệu" placeholder="Tìm nhóm…" value={search} onChange={value=>{setSearch(value);setPage(1);}} autoFocus/>
    <div className="teacher-group-picker-list" aria-busy={loading}>{!error && items.filter(group=>!group.isSeed && group.id!==excludeId).map(group=><button type="button" key={group.id} aria-pressed={selectedIds.includes(group.id)} disabled={loading} onClick={()=>onToggle(group)}><span className="teacher-group-picker-cover">{group.coverUrl?<img src={group.coverUrl} alt="" style={cropImageStyle(group.coverCrop)}/>:<Waves/>}</span><span>{group.title}</span><span className="teacher-group-picker-check">{selectedIds.includes(group.id) && <Check size={18}/>}</span></button>)}</div>
    {loading && <p role="status">Đang tìm nhóm…</p>}{error && <p role="alert">{error} <button type="button" onClick={()=>setRetry(n=>n+1)}>Thử lại</button></p>}
    {!loading && !error && !items.some(group=>!group.isSeed && group.id!==excludeId) && <p>Chưa có nhóm phù hợp.</p>}
    <CatalogPagination label="Phân trang chọn nhóm" compact page={page} total={total} loading={loading || Boolean(error)} onPage={setPage}/>
    {onClose && <div className="teacher-group-picker-footer"><button type="button" onClick={onClose}>Xong</button></div>}
  </section>;
}
