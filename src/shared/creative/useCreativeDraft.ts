import {useEffect,useRef,useState} from 'react';
import type {CreativeArtwork} from './creativeStorage';
import {CreativeDraftWriter} from './creativeDraftWriter';

/** Serial writes keep progress, completion and teacher delivery independent. */
export function useCreativeDraft({id,getArtwork,disabled=false}:{id:string;getArtwork:()=>CreativeArtwork;disabled?:boolean}){
 const read=useRef(getArtwork);read.current=getArtwork;
 const revision=useRef(0),created=useRef(Date.now()),dirty=useRef(false),completing=useRef(false);
 const writer=useRef(new CreativeDraftWriter(id));
 const pendingCount=useRef(0);
 const [finishing,setFinishing]=useState(false);
 const [saving,setSaving]=useState(false),[saveMessage,setSaveMessage]=useState(''),[completed,setCompleted]=useState(false);
 useEffect(()=>{
  if(disabled)return;
  const unload=(e:BeforeUnloadEvent)=>{if(dirty.current){e.preventDefault();e.returnValue='';}};
  const leave=(e:Event)=>{const target=(e as CustomEvent<{url?:string}>).detail?.url;if(target){const url=new URL(target,location.origin);if(url.pathname===location.pathname&&(url.searchParams.get('id')||url.searchParams.get('draft'))===id)return;}if(dirty.current&&!window.confirm('Có tiến trình chưa lưu. Rời trang và bỏ thay đổi?'))e.preventDefault();};
  window.addEventListener('beforeunload',unload);window.addEventListener('bluesteam:before-navigate',leave);
  return()=>{window.removeEventListener('beforeunload',unload);window.removeEventListener('bluesteam:before-navigate',leave);};
 },[id,disabled]);
 const restore=(art:CreativeArtwork)=>{writer.current.restore(art);created.current=art.createdAt;revision.current=art.editVersion||0;dirty.current=false;setCompleted(art.isDraft!==true);};
 const changed=()=>{if(completing.current||writer.current.completed)return;dirty.current=true;revision.current++;setSaveMessage('Có thay đổi chưa lưu');};
 const persist=async(finish:boolean,requirePreview:boolean)=>{
  if(disabled||completing.current)return false;
  if(writer.current.completed)return true;
  if(finish){completing.current=true;setFinishing(true);}
  pendingCount.current++;setSaving(true);
  try{
   const current=read.current();
   const art=await writer.current.write(current,{finish,requirePreview,createdAt:created.current,editVersion:revision.current});
   if(art.editVersion===revision.current)dirty.current=false;
   if(finish)setCompleted(true);setSaveMessage(finish?'Đã hoàn thành và lưu vào Hồ sơ':'Đã lưu tiến trình trên thiết bị');return true;
  }catch(e){setSaveMessage(e instanceof Error?e.message:'Chưa lưu được. Giữ trang mở và thử lại.');return false;}
  finally{if(finish){completing.current=false;setFinishing(false);}pendingCount.current--;setSaving(pendingCount.current>0);}
 };
 const saveProgress=()=>persist(false,false);
 return {restore,changed,saveProgress,complete:()=>persist(true,true),save:(requirePreview=true)=>persist(false,requirePreview),saving,finishing,isFinishing:()=>completing.current,saveMessage,completed,isDirty:()=>dirty.current};
}
