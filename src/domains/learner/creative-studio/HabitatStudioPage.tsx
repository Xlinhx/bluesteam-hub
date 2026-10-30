import {useCreativeMotion} from '../../../shared/ui/motion/useCreativeMotion';
import {LearnerCreativeBackdrop} from '../components/creative/LearnerCreativeBackdrop';
import { useEffect, useState } from 'react';
import { useRouter } from '../../../app/router';
import { ActivityShell } from '../../../shared/shells/ActivityShell';
import { CreativeHabitatSurface } from '../../../shared/creative/CreativeHabitatSurface';
import { useCreativeWorkspace } from '../../../shared/creative/useCreativeWorkspace';
export function HabitatStudioPage(){const {query}=useRouter();return <HabitatWorkspace key={query.id||query.draft||query.template||'new'}/>;}
function HabitatWorkspace(){
 const motionRoot=useCreativeMotion('habitat');
  const {query,navigate}=useRouter();const [id]=useState(()=>query.id||query.draft||'habitat-'+crypto.randomUUID());
  const {value,error,retry}=useCreativeWorkspace('habitat',query);
  useEffect(()=>{if(!query.id&&!query.draft)navigate('/creative/habitat',{replace:true,query:{...query,draft:id}});},[]);
  return <ActivityShell title="Nơi sống của bé" variant="light" onBack={()=>navigate('/creative')} showLogo><div ref={motionRoot} className="learner-creative-page creative-local-page creative-workspace"><LearnerCreativeBackdrop/>{error?<div className="creative-workspace-empty" role="alert"><p>{error}</p><button onClick={retry}>Thử lại</button></div>:!value?<p role="status">Đang mở sa bàn…</p>:<CreativeHabitatSurface snapshot={value.snapshot} workspace={{kind:'local',id,artwork:value.artwork}} initialMode={query.mode==='run'?'run':'build'} onModeChange={mode=>navigate('/creative/habitat',{replace:true,query:{...query,mode:mode==='run'?'run':null}})}/>}</div></ActivityShell>;
}
