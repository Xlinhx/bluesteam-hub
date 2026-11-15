import './creative-navigation.css';
import { isProfileScene } from './oceanNavigation';
type Snapshot={finished:Promise<unknown>;ready:Promise<unknown>;updateCallbackDone:Promise<unknown>;skipTransition:()=>void};
type MotionDocument=Pick<Document,'documentElement'|'querySelector'|'addEventListener'|'removeEventListener'>&{startViewTransition?:(update:()=>void|Promise<void>)=>Snapshot};
let active:Snapshot|undefined,revision=0,cleanup:()=>void=()=>{};
export function creativeSceneKey(url:string){
 const [path,search='']=url.split('?'),q=new URLSearchParams(search);
 if(path==='/teacher/creative')return `teacher:${q.get('tab')||'sea'}:${q.get('session')||''}:${q.get('submission')||''}:${q.get('content')||''}:${q.get('version')||''}`;
 if(!/^\/creative(?:\/|$)/.test(path))return null;
 return path+(path==='/creative/coloring'?':'+(q.get('resource')||''):'');
}
function waitForCreative(doc:MotionDocument,key:string){
 if(typeof MutationObserver==='undefined')return Promise.resolve();
 return new Promise<void>(resolve=>{
  let timer:ReturnType<typeof setTimeout>,observer:MutationObserver;
  const done=()=>{clearTimeout(timer);observer?.disconnect();resolve();};
  const selector=key.startsWith('teacher:')?(key.split(':')[3]?'.ct-review-main':key.split(':')[1]==='coloring'?(key.split(':')[4]?'.ct-coloring-detail':'.ct-coloring-table,.creative-empty'):key.split(':')[2]?'.ct-sea-console-card':'.ct-active-sea,.ct-sea-empty-hero'):key.startsWith('/creative/drawing')?'.creative-drawing-workspace canvas':key.startsWith('/creative/habitat')?'.creative-habitat-workspace canvas':key.startsWith('/creative/scan')?'.scan-capture,.scan-compare-surface':key.startsWith('/creative/coloring')?'.resource-library':'.creative-hub-content';
  const check=()=>{if(doc.querySelector(selector))done();};
  observer=new MutationObserver(check);observer.observe(doc.documentElement,{subtree:true,childList:true});timer=setTimeout(done,550);check();
 });
}
/** Own only meaningful creative navigation. Filters and direct editing stay immediate. */
export function transitionCreativeScene(from:string,to:string,commit:()=>void,reduced:boolean,doc:MotionDocument|undefined,direction:'forward'|'back'='forward'){
 const fromKey=creativeSceneKey(from),toKey=creativeSceneKey(to);
 if(!fromKey&&!toKey)return false;
 if(fromKey===toKey){commit();return true;}
 const version=++revision;active?.skipTransition();active=undefined;cleanup();cleanup=()=>{};
 if ((!fromKey || !toKey) && [from, to].some(url => isProfileScene(url.split('?')[0]))) return false;
 if(!fromKey||!toKey||reduced||!doc?.startViewTransition){commit();return true;}
 const data=doc.documentElement.dataset;data.creativeJourney=direction;
 data.creativeAudience=toKey.startsWith('teacher:')?'teacher':'learner';
 data.creativeDestination=toKey.startsWith('teacher:')?(toKey.split(':')[3]?'review':toKey.split(':')[1]==='coloring'?'report':'sea'):toKey.split('/')[2]?.split(':')[0]||'hub';
 let committed=false;
 const update=()=>{if(version!==revision||committed)return;committed=true;commit();return waitForCreative(doc,toKey);};
 const interrupt=()=>active?.skipTransition();
 const clear=()=>{doc.removeEventListener('pointerdown',interrupt,true);doc.removeEventListener('keydown',interrupt,true);delete data.creativeJourney;delete data.creativeAudience;delete data.creativeDestination;};
 cleanup=clear;
 try{
  const snapshot=doc.startViewTransition(update);active=snapshot;
  doc.addEventListener('pointerdown',interrupt,true);doc.addEventListener('keydown',interrupt,true);
  void snapshot.ready.catch(()=>{});void snapshot.updateCallbackDone.catch(()=>{update();});
  void snapshot.finished.catch(()=>{}).then(()=>{if(version===revision){clear();active=undefined;cleanup=()=>{};}});
 }catch{update();clear();}
 return true;
}
