import {useCreativeMotion} from '../../../shared/ui/motion/useCreativeMotion';
import {ArrowLeft} from 'lucide-react';
import {LearnerCreativeBackdrop} from '../components/creative/LearnerCreativeBackdrop';
import { useEffect, useState } from 'react';
import { useRouter } from '../../../app/router';
import { ActivityShell } from '../../../shared/shells/ActivityShell';
import { CreativeDrawingSurface } from '../../../shared/creative/CreativeDrawingSurface';
import { useCreativeWorkspace } from '../../../shared/creative/useCreativeWorkspace';
import '../../../shared/creative/creativeWorkspace.css';
import './c04Drawing.css';

export function CreativeDrawingPage() {
  const {query}=useRouter();
  return <DrawingWorkspace key={query.id||query.draft||query.template||'blank'}/>;
}
function DrawingWorkspace() {
 const motionRoot=useCreativeMotion('drawing');
  const {query,navigate}=useRouter();
  const [id]=useState(()=>query.id||query.draft||'drawing-'+crypto.randomUUID());
  const {value,error,retry}=useCreativeWorkspace('drawing',query);
  useEffect(()=>{if(!query.id&&!query.draft)navigate('/creative/drawing',{replace:true,query:{...query,draft:id}});},[]);
  return <ActivityShell title="Bức tranh của bé" variant="light" hideBackButton onBack={()=>query.returnResource?navigate(`${query.fromCreative ? '/creative/coloring' : '/resources'}/${query.returnResource}`,{query:{...query,draft:null,id:null,template:null,returnResource:null}}):navigate(query.fromCreative ? '/creative/coloring' : '/resources',{query:{...query,kind:'coloring',template:null,draft:null,id:null,returnResource:null}})} showLogo><div ref={motionRoot} className="learner-creative-page creative-workspace creative-local-page c04-page"><LearnerCreativeBackdrop/>
    {error?<div role="alert" className="creative-workspace-empty"><p>{error}</p><button onClick={retry}>Thử lại</button></div>:!value?<p role="status">Đang mở trang giấy…</p>:<>
      <div className="creative-local-heading"><div><h2>{value.snapshot.title==='Trang giấy trắng'?'Vẽ tự do':value.snapshot.title}</h2><p>Tranh tô màu / Bạn dưới biển</p></div><button className="creative-btn" onClick={()=>navigate(query.fromCreative ? '/creative/coloring' : '/resources',{query:{...query,kind:'coloring',template:null,draft:null,id:null,returnResource:null}})}><ArrowLeft size={18}/>Chọn tranh</button></div>
      <div className="creative-drawing-layout"><section><CreativeDrawingSurface onSeaSource={scanId=>navigate('/creative/scan',{query:{draft:scanId},preserveQuery:false})} snapshot={value.snapshot} workspace={{kind:'local',id,artwork:value.artwork}}/></section></div>
    </>}
  </div></ActivityShell>;
}
