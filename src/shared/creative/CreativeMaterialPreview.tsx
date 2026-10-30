import {useEffect,useRef} from 'react';
import {drawMarineStamp,type MarineStampType} from './drawing_engine';
import {HABITAT_ASSET_PALETTE} from './habitatTypes';
const stamps:MarineStampType[]=['starfish','shell','bubble','coral','turtle','fish'];
export function CreativeMaterialPreview({material,className=''}:{material:{title?:string;kind?:string;mediaUrl?:string;payload?:Record<string,any>};className?:string}){
  const canvas=useRef<HTMLCanvasElement>(null);
  const stamp=material.payload?.stampId as MarineStampType;
  const url=material.mediaUrl || Object.values(HABITAT_ASSET_PALETTE).flat().find(a=>a.id===material.payload?.assetId)?.thumbnailUrl;
  useEffect(()=>{const ctx=canvas.current?.getContext('2d');if(ctx){ctx.clearRect(0,0,120,120);if(stamps.includes(stamp))drawMarineStamp(ctx,{x:60,y:60},stamp,'#17657a',1);}},[stamp,url]);
  return url?<img className={className} src={url} alt={material.title || ''}/>:<canvas ref={canvas} className={className} width={120} height={120} role="img" aria-label={material.title || 'Con dấu'}/>;
}
