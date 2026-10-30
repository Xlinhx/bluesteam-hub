import type { UsageOpenInput, UsageOpenResult, UsageInteractionInput, UsageFilter, UsageContentRef, UsageReport, UsageDetail } from '@bluesteam/contracts';
import { apiRequest, getApiBaseUrl, ApiClientError } from './client';
export function openInteractiveUsage(input: UsageOpenInput, signal?:AbortSignal){return apiRequest<UsageOpenResult>('/api/v1/interactive-usage/runs',{method:'POST',body:JSON.stringify(input),signal});}
export function recordInteractiveUsage(runId:string,token:string,input:UsageInteractionInput,signal?:AbortSignal){return apiRequest<{accepted:true;duplicate:boolean}>(`/api/v1/interactive-usage/runs/${encodeURIComponent(runId)}/interactions`,{method:'POST',headers:{'x-usage-token':token},body:JSON.stringify(input),signal});}
function query(filter:Partial<UsageFilter>){const params=new URLSearchParams();for(const [key,value] of Object.entries(filter))if(value)params.set(key,String(value));return params;}
export function fetchInteractiveUsage(filter:Partial<UsageFilter>,cursor?:string,signal?:AbortSignal){const p=query(filter);if(cursor)p.set('cursor',cursor);return apiRequest<UsageReport>(`/api/v1/teacher/interactive-usage?${p}`,{signal});}
export function fetchInteractiveUsageDetail(ref:UsageContentRef,filter:UsageFilter,signal?:AbortSignal){return apiRequest<UsageDetail>(`/api/v1/teacher/interactive-usage/contents/${ref.contentId}?${query({...filter,...ref} as UsageFilter)}`,{signal});}
export async function exportInteractiveUsage(filter:UsageFilter & {version?:number},signal?:AbortSignal):Promise<Blob>{
  const response=await fetch(`${getApiBaseUrl()}/api/v1/teacher/interactive-usage/export.csv?${query(filter)}`,{credentials:'include',signal});
  if(!response.ok)throw new ApiClientError(response.status,'USAGE_EXPORT_FAILED','Chưa xuất được số liệu. Cô thử lại nhé.');
  if(!response.headers.get('content-type')?.includes('text/csv'))throw new Error('Máy chủ chưa trả về file số liệu.');
  return response.blob();
}
