import {useEffect,useState} from 'react';
import {apiRequest} from '../../../../shared/api/client';
export function ColoringTemplatePreview({id,version,large=false}:{id:string;version:number|null;large?:boolean}){
 const [src,setSrc]=useState(''),[missing,setMissing]=useState(false);
 useEffect(()=>{let active=true;setSrc('');setMissing(false);const builtin:Record<string,string>={'builtin:turtle':'turtle','builtin:octopus':'octopus','builtin:coral':'coral'};
  if(builtin[id]&&version===1)setSrc(`/assets/generated/craft/${builtin[id]}_coloring_lineart.jpg`);
  else if(/^[a-f0-9-]{36}$/.test(id))void apiRequest<any>('/api/v1/creative-templates/'+id).then(t=>{if(active){if((t.publishedVersion||t.version)!==version){setMissing(true);return;}setSrc(t.payload.outlineUrl||t.previewUrl||'');}}).catch(()=>{if(active)setMissing(true);});return()=>{active=false;};
 },[id,version]);
 return src?<img className={large?'ct-large-template':''} src={src} alt={large?'Mẫu tranh được sử dụng':''}/>:<span className={large?'ct-large-template ct-template-unavailable':'ct-blank-paper'} aria-hidden={!large}>{large&&(missing?'Ảnh mẫu của phiên bản này không còn công khai.':'Trang giấy trắng')}</span>;
}
