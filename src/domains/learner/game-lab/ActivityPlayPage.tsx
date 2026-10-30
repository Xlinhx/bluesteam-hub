import { useCallback, useEffect, useState } from 'react';
import { useRouter } from '../../../app/router';
import { ActivityShell } from '../../../shared/shells/ActivityShell';
import { ActivityExperience } from '../../../shared/activities/ActivityExperience';
import { ACTIVITY_TEMPLATE_REGISTRY } from '../../../shared/activities/registry';
import { useInteractiveUsage } from '../../../shared/activities/usage/useInteractiveUsage';
import { fetchPublicActivityById, fetchPublicModelById, type ActivityDto, type Model3DDto } from '../../../shared/api/catalog';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import type { SketchfabViewerStatus } from '../../../shared/ui/media/SketchfabViewer';

export function ActivityPlayPage({ id, isModel = false }: { id: string; isModel?: boolean }) {
  const { query, navigate, currentPath } = useRouter();
  const requestKey = `${isModel ? 'model' : 'activity'}:${id}`;
  const [loaded,setLoaded]=useState<{key:string;item:ActivityDto|Model3DDto}|null>(null);
  const item = loaded?.key === requestKey ? loaded.item : null;
  const [modelReadyKey,setModelReadyKey]=useState('');
  const [error,setError]=useState<string|null>(null);
  const [retry,setRetry]=useState(0);
  const [restart,setRestart]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();setLoaded(null);setError(null);setModelReadyKey('');
    const request=isModel?fetchPublicModelById(id,controller.signal):fetchPublicActivityById(id,controller.signal);
    request.then(value=>{if(!controller.signal.aborted)setLoaded({key:requestKey,item:value});}).catch(err=>{if(!controller.signal.aborted)setError(err.message||'Hoạt động chưa sẵn sàng.');});
    return()=>{controller.abort();oceanAudio.stop();};
  },[id,isModel,retry]);
  const modelKey = item ? `${item.id}:${item.version}` : '';
  const onModelStatus = useCallback((status:SketchfabViewerStatus) => setModelReadyKey(status === 'ready' ? modelKey : ''), [modelKey]);
  const ready=item&&(isModel ? modelReadyKey === modelKey : 'kind' in item && Boolean(ACTIVITY_TEMPLATE_REGISTRY[item.templateKey]));
  const record=useInteractiveUsage(ready?{contentType:isModel?'model3d':'activity',contentId:item!.id,version:item!.version}:null,'standalone',currentPath+':'+restart);
  const back=()=>navigate(query.returnTo?.startsWith('/interactive')&&!query.returnTo.startsWith('//')?query.returnTo:`/interactive?kind=${isModel?'model3d':item&&'kind' in item?item.kind:'game'}`);
  const onRestart=()=>{const state={...window.history.state};delete state.interactiveVisit;window.history.replaceState(state,'');setRestart(n=>n+1);};
  if(item)return <ActivityExperience key={item.id+':'+restart} content={item} context="standalone" onBack={back} onUsageInteraction={record} onRestart={onRestart} onModelStatus={onModelStatus}/>;
  return <ActivityShell title="Đang mở hoạt động…" variant="light" onBack={back}>
    {error?<div role="alert" className="p-12 text-center"><h2>Chưa mở được hoạt động</h2><p>{error}</p><button className="min-h-14 rounded-full px-8 bg-[#15586E] text-white" onClick={()=>setRetry(n=>n+1)}>Thử lại</button></div>:<p role="status" className="p-12 text-center">Đang mở đại dương…</p>}
  </ActivityShell>;
}
