import {useEffect,useRef} from 'react';
import {apiRequest} from '../../api/client';
import {CreativeColoringQueue} from './CreativeColoringQueue';
import type {ImmutableContentSnapshot} from '../contentSnapshot';
import type {ColoringEvent} from '@bluesteam/contracts';
export function useCreativeColoringUsage(snapshot:ImmutableContentSnapshot,enabled:boolean){
 const queue=useRef<CreativeColoringQueue|null>(null);
 useEffect(()=>{if(!enabled||snapshot.contentVersion<1)return;let cancelled=false,timer:ReturnType<typeof setTimeout>|undefined,attempt=0;const state=history.state||{};
 const visit=state.creativeColoringVisit?.contentId===snapshot.contentId?state.creativeColoringVisit:{id:crypto.randomUUID(),contentId:snapshot.contentId};
 history.replaceState({...state,creativeColoringVisit:visit},'');const openKey=visit.id;
 let run:Promise<{runId:string;token:string}>|null=null;
 const source={contentId:['turtle','octopus','coral','blank'].includes(snapshot.contentId)?'builtin:'+snapshot.contentId:snapshot.contentId,contentVersion:snapshot.contentVersion,title:snapshot.title};
 const q=new CreativeColoringQueue(async events=>{for(let retry=0;retry<3;retry++){try{run||=apiRequest('/api/v1/creative-coloring-usage/runs',{method:'POST',body:JSON.stringify({openKey,contentRef:source})});let r;try{r=await run;}catch(e){run=null;throw e;}await apiRequest(`/api/v1/creative-coloring-usage/runs/${r.runId}/events`,{method:'POST',participantToken:r.token,body:JSON.stringify({events})});return;}catch(e){if(retry===2)throw e;await new Promise(resolve=>setTimeout(resolve,500*2**retry));}}});queue.current=q;
 const tick=async()=>{try{run||=apiRequest('/api/v1/creative-coloring-usage/runs',{method:'POST',body:JSON.stringify({openKey,contentRef:source})});await run;await q.flush();}catch{run=null;}if(!cancelled&&++attempt<3)timer=setTimeout(tick,2000*attempt);};void tick();
 const flush=()=>void q.flush();window.addEventListener('pagehide',flush);window.addEventListener('online',flush);return()=>{cancelled=true;clearTimeout(timer);window.removeEventListener('pagehide',flush);window.removeEventListener('online',flush);void q.flush();if(queue.current===q)queue.current=null;};
 },[enabled,snapshot.contentId,snapshot.contentVersion]);
 return (type:ColoringEvent['type'],tool?:ColoringEvent['tool'],input?:string)=>{const q=queue.current;q?.record(type,tool,['mouse','touch','pen'].includes(input||'')?input as ColoringEvent['input']:type==='tool_used'?'unknown':undefined);void q?.flush();};
}
