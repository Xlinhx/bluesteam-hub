import {useEffect,useState} from 'react';
import {ArrowRight,PencilLine,FileImage,Printer} from 'lucide-react';
import {apiRequest} from '../../../shared/api/client';
import type {CreativeTemplateDto,ResourceDto} from '../../../shared/api/catalog';
import {resolveTemplateReference} from '../../../shared/creative/templateReference';
import { getColoringPreviewAsset } from './coloringVisuals';

export function ColoringResourceTile({resource,onOpen,onDraw,index=0}:{resource:ResourceDto;onOpen:()=>void;onDraw:(template:string)=>void;index?:number}){
  const [template,setTemplate]=useState<CreativeTemplateDto|null>(null),[error,setError]=useState(''),[previewFailed,setPreviewFailed]=useState(false);
  const key=resource.content.drawingTemplateKey;
  useEffect(()=>{
    if(!key)return;
    const controller=new AbortController();setTemplate(null);setError('');
    resolveTemplateReference(key).then(id=>apiRequest<CreativeTemplateDto>(`/api/v1/creative-templates/${id}`,{signal:controller.signal})).then(t=>{if(!controller.signal.aborted)setTemplate(t);}).catch(e=>{if(!controller.signal.aborted)setError(e.message);});
    return()=>controller.abort();
  },[key]);
  const outline=template?.payload?.outlineUrl;
  const preview=typeof outline==='string'?outline:getColoringPreviewAsset(resource,index);
  useEffect(()=>setPreviewFailed(false),[preview]);
  return <article className="coloring-resource-tile">
    <button className="coloring-resource-preview" aria-label={`Xem tranh: ${resource.title}`} onClick={onOpen}>
      {preview&&!previewFailed?<img src={preview} alt={resource.title} loading="lazy" onError={()=>{setPreviewFailed(true);setError('Chưa tải được ảnh xem trước. Mở chi tiết để thử lại.');}}/>:<span><FileImage size={42}/>{error?error:template?.payload?.blankPaper?'Trang giấy sáng tạo với tem biển':key?'Đang mở nét mẫu…':'Xem chi tiết học liệu'}</span>}
    </button>
    <footer><h3>{resource.title.replace(/^Tranh tô màu:\s*/,'')}</h3>{key&&template?<button className="coloring-draw-button" aria-label={`Tô tranh: ${resource.title}`} onClick={()=>onDraw(key)}><PencilLine size={17}/>Tô tranh</button>:<button className="coloring-detail-button" onClick={onOpen}>Xem <ArrowRight size={17}/></button>}{resource.mediaUrl&&<button className="coloring-print-button" aria-label={`Mở bản in: ${resource.title}`} onClick={onOpen}><Printer size={18}/></button>}</footer>
  </article>;
}
