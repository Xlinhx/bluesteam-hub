import { useCallback, useEffect, useRef } from 'react';
import type { UsageContentRef, UsagePayload, UsageOpenResult } from '@bluesteam/contracts';
import { openInteractiveUsage, recordInteractiveUsage } from '../../api/interactiveUsage';
import { UsageQueue } from './UsageQueue';
export function getUsageVisitKey(ref:UsageContentRef){
  const key=`${ref.contentType}:${ref.contentId}:${ref.version}`;
  const current=window.history.state || {};
  if(current.interactiveVisit?.ref===key)return current.interactiveVisit.key as string;
  const visit=crypto.randomUUID();window.history.replaceState({...current,interactiveVisit:{ref:key,key:visit}},'');return visit;
}
export function useInteractiveUsage(contentRef:UsageContentRef|null,context:'standalone'|'preview',locationKey:string){
  const queue=useRef<UsageQueue|null>(null);
  const refKey=contentRef?`${contentRef.contentType}:${contentRef.contentId}:${contentRef.version}`:'';
  useEffect(()=>{
    if(!contentRef||context!=='standalone')return;
    const openKey=getUsageVisitKey(contentRef), storageKey=`bluesteam:usage:${openKey}`;
    let openPromise:Promise<UsageOpenResult>|null=null;
    const open=()=>{
      if(openPromise)return openPromise;
      try{const saved=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(saved&&new Date(saved.expiresAt).getTime()>Date.now())return Promise.resolve(saved as UsageOpenResult);}catch{/* storage unavailable */}
      openPromise=openInteractiveUsage({...contentRef,openKey}).then(run=>{try{sessionStorage.setItem(storageKey,JSON.stringify(run));}catch{}return run;}).catch(error=>{openPromise=null;throw error;});return openPromise;
    };
    const next=new UsageQueue(open,(run,event)=>recordInteractiveUsage(run.runId,run.token,event));queue.current=next;next.start();
    return()=>{next.stop();if(queue.current===next)queue.current=null;};
  },[refKey,context,locationKey]);
  return useCallback((payload:UsagePayload)=>queue.current?.record(payload),[]);
}
