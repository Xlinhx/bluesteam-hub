import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../../shared/api/client';
import type { ResourceDto } from '../../../shared/api/catalog';
import { ResourceObservation } from '../../../shared/ui/media/ResourceObservation';
import { ResourceRenderer } from '../../../shared/ui/media/ResourceRenderer';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import { ResourceDialog } from './ResourceDialog';

export function ResourcePreview({resource,onClose}:{resource:ResourceDto;onClose:()=>void}) {
  const [history,setHistory]=useState([resource]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const request=useRef<AbortController|null>(null);
  const active=history[history.length-1];
  useEffect(()=>()=>{request.current?.abort();oceanAudio.stop();},[]);
  const open=async(id:string)=>{
    request.current?.abort();const abort=new AbortController();request.current=abort;setLoading(true);setError('');oceanAudio.stop();
    try{const next=await apiRequest<ResourceDto>(`/api/v1/teacher/resources/${id}`,{signal:abort.signal});if(!abort.signal.aborted)setHistory(prev=>[...prev,next]);}
    catch(err){if(!abort.signal.aborted)setError(err instanceof Error?err.message:'Chưa mở được học liệu.');}
    finally{if(!abort.signal.aborted)setLoading(false);}
  };
  const drawing=(template:string)=>window.open(`/creative/drawing?template=${encodeURIComponent(template)}`,'_blank','noopener,noreferrer');
  return <ResourceDialog title="Xem học liệu" onClose={onClose} wide className="resource-preview-dialog"><div className="resource-preview-body">
    {history.length>1 && <button className="resource-preview-back" type="button" disabled={loading} onClick={()=>{oceanAudio.stop();setHistory(prev=>prev.slice(0,-1));setError('');}}><ArrowLeft size={20}/>Quay lại {history[history.length-2].title}</button>}
    {loading && <p role="status">Đang mở học liệu…</p>}{error && <p role="alert" className="resource-form-error">{error}</p>}
    <div className="resource-detail-page resource-preview-stage" aria-busy={loading}>{active.kind==='flashcard'||active.kind==='image'?<ResourceObservation key={active.id} resource={active} related={(active.related||[]).filter(item=>item.kind==='flashcard'||item.kind==='image')} onOpen={id=>void open(id)} onOpenDrawing={drawing}/>:<ResourceRenderer key={active.id} resource={active} onSelectVariant={(id,kind,template)=>{if(kind==='coloring'&&template)drawing(template);else void open(id);}} onOpenDrawing={drawing}/>}</div>
  </div></ResourceDialog>;
}
