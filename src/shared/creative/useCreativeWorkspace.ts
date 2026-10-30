import { useEffect, useState } from 'react';
import { normalizeCreativeConfig } from '@bluesteam/contracts';
import { creativeStorage, type CreativeArtwork } from './creativeStorage';
import { apiRequest } from '../api/client';
import type { CreativeTemplateDto } from '../api/catalog';
import type { ImmutableContentSnapshot } from './contentSnapshot';
import { DEFAULT_HABITAT_ITEMS } from './habitatTypes';
import {resolveTemplateReference} from './templateReference';

export const DRAWING_STARTERS = [
  {id:'blank',title:'Trang giấy trắng',outlineUrl:''},
  {id:'turtle',title:'Rùa Xanh',outlineUrl:'/assets/generated/craft/turtle_coloring_lineart.jpg'},
  {id:'octopus',title:'Bạch tuộc',outlineUrl:'/assets/generated/craft/octopus_coloring_lineart.jpg'},
  {id:'coral',title:'Rạn san hô',outlineUrl:'/assets/generated/craft/coral_coloring_lineart.jpg'},
];
export function useCreativeWorkspace(kind:'drawing'|'habitat', query:Record<string,string|undefined>) {
  const [value,setValue]=useState<{snapshot:ImmutableContentSnapshot;artwork?:CreativeArtwork}|null>(null);
  const [error,setError]=useState('');
  const [reload,setReload]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();setValue(null);setError('');
    const load=async()=>{
      const artwork=query.id||query.draft?await creativeStorage.getArtworkById((query.id||query.draft)!):null;
      if(query.id&&!artwork)throw Error('Không tìm thấy tác phẩm trên thiết bị này.');
      if(artwork&&artwork.type!==kind)throw Error('Tác phẩm này dùng công cụ khác.');
      if(artwork?.sourceSnapshot){if(controller.signal.aborted)return;setValue({artwork,snapshot:artwork.sourceSnapshot});return;}
      const templateId=query.template||artwork?.drawingData?.template||'blank';
      const starter=DRAWING_STARTERS.find(t=>t.id===templateId)||DRAWING_STARTERS[0];
      let title=artwork?.title||(kind==='drawing'?starter.title:'Nơi sống của bé');
      let config:Record<string,any>=artwork?.templateConfig|| (kind==='drawing'?{outlineUrl:starter.outlineUrl,blankPaper:!starter.outlineUrl}:{items:DEFAULT_HABITAT_ITEMS});
      let sourceId=kind==='habitat'&&templateId==='blank'?'builtin:habitat-default':templateId,sourceVersion=artwork?0:1;
      if(!artwork?.templateConfig && !DRAWING_STARTERS.some(t=>t.id===templateId)){
        const resolved=await resolveTemplateReference(templateId);
        const template=await apiRequest<CreativeTemplateDto>(`/api/v1/creative-templates/${resolved}`,{signal:controller.signal});
        if(template.kind!==kind)throw Error('Mẫu này dùng công cụ khác.');
        title=artwork?.title||template.title;config=normalizeCreativeConfig(kind,template.payload);
        sourceId=template.id;sourceVersion=template.publishedVersion||template.version;
      }
      if(artwork?.habitatData)config={...config,items:artwork.habitatData.items};
      if(controller.signal.aborted)return;
      setValue({artwork:artwork||undefined,snapshot:{contentType:'creative_template',contentId:sourceId,title,kind,templateKey:kind,thumbnailUrl:'',narrationUrl:config.narrationUrl||null,config,contentVersion:sourceVersion,capturedAt:new Date().toISOString()}});
    };
    void load().catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Chưa mở được tác phẩm.');});
    return()=>controller.abort();
  },[kind,query.id,query.draft,query.template,reload]);
  return {value,error,retry:()=>setReload(n=>n+1)};
}
