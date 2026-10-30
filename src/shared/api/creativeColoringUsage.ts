import {apiRequest,getApiBaseUrl} from './client';
import type {ColoringReport} from '@bluesteam/contracts';
export const coloringReport=(query:URLSearchParams,signal?:AbortSignal)=>apiRequest<ColoringReport>('/api/v1/teacher/creative-coloring-usage?'+query,{signal});
export async function exportColoringReport(query:URLSearchParams){const res=await fetch(getApiBaseUrl()+'/api/v1/teacher/creative-coloring-usage/export.csv?'+query,{credentials:'include'});if(!res.ok)throw Error('Chưa xuất được số liệu. Thử lại.');const url=URL.createObjectURL(await res.blob());const a=document.createElement('a');a.href=url;a.download='khao-sat-to-mau.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
