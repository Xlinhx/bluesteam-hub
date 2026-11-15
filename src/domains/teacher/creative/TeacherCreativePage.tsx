import {useCreativeMotion} from '../../../shared/ui/motion/useCreativeMotion';
import {useEffect,useState} from 'react';
import {Waves,Palette,ArrowLeft} from 'lucide-react';
import {useRouter} from '../../../app/router';
import {TeacherShell} from '../../../shared/shells/TeacherShell';
import {CreativeSeascape} from '../../../shared/ui/visuals/CreativeSeascape';
import type {CreativeSession,CreativeSubmission} from '../../../shared/api/creativeSessions';
import {CreativeScanConsole} from './scanning/CreativeScanConsole';
import {TeacherSeaSessions} from './sea/TeacherSeaSessions';
import {TeacherColoringUsage} from './coloring/TeacherColoringUsage';
import './creative.css';
import './creativeTeacher.css';
import '../../../shared/creative/creativeWorkspace.css';
import '../../learner/creative-studio/scanning/scanning.css';
export function TeacherCreativePage(){
 const motionRoot=useCreativeMotion<HTMLDivElement>('teacher');
 const {query,navigate}=useRouter();const [review,setReview]=useState<CreativeSubmission|null>(null);const retired=query.tab==='habitat'||!!query.artworkId;
 const tab=['coloring','stats'].includes(query.tab)?'coloring':'sea';
 const selectTab=(next:string)=>navigate('/teacher/creative',{query:{tab:next},preserveQuery:false});
 useEffect(()=>{if(retired)navigate('/teacher/creative',{replace:true,query:{tab:'sea'},preserveQuery:false});},[retired]);
 const open=(s:CreativeSession)=>navigate('/teacher/creative',{query:{tab:'sea',session:s.id},preserveQuery:false});
 return <TeacherShell activeNav="creative"><div ref={motionRoot} className="creative-page creative-teacher-hub"><CreativeSeascape/><div className="creative-teacher-content"><header className="creative-heading"><div>{review&&<button className="ct-review-breadcrumb" onClick={()=>navigate('/teacher/creative',{query:{...query,submission:null},preserveQuery:false})}><ArrowLeft size={16}/>Biển chung / Tranh của {review.alias}</button>}<h1>{review?`Tranh của ${review.alias}`:'Sáng tạo cùng bé'}</h1>{review&&<p className="creative-lead">{`Tên người vẽ: ${review.alias} · ${review.status==='released'?'Đã thả':review.status==='ready'?'Chờ xem':'Cần gửi lại'} · Bản gửi ${review.edit_version}`}</p>}</div></header><nav className="creative-tabs" aria-label="Sáng tạo của cô">{([['sea','Biển chung',Waves],['coloring','Tô màu',Palette]] as const).map(([id,label,Icon])=><button key={id} className={tab===id?'active':''} aria-current={tab===id?'page':undefined} onClick={()=>selectTab(id)}><Icon size={21}/>{label}</button>)}</nav>
 {!retired&&(query.session?<CreativeScanConsole key={query.session} id={query.session} onReviewChange={setReview} onBack={()=>selectTab('sea')}/>:tab==='coloring'?<TeacherColoringUsage/>:<TeacherSeaSessions onOpen={open}/>)}
 </div></div></TeacherShell>;
}
