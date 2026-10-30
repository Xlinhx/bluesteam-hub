import { useRouter } from '../../../app/router';
import { TeacherShell } from '../../../shared/shells/TeacherShell';
import { HOME_ART, HomeShortcut } from '../../../shared/ui/home/HomeShortcut';
import { useHomeEntrance } from '../../../shared/ui/home/useHomeEntrance';
import { HomeOceanStage } from '../../../shared/ui/home/HomeOceanStage';
import { HomeSpecimenMark } from '../../../shared/ui/home/HomeSpecimenMark';
import './dashboard.css';
import {
  Gamepad2,
  BookOpen,
  Box,
  Palette,
  ArrowRight,
} from 'lucide-react';

export function TeacherDashboardPage() {
  const { navigate } = useRouter();
  const entranceRef = useHomeEntrance('teacher');

  return <TeacherShell activeNav="dashboard">
    <div ref={entranceRef} className="teacher-home">
      <HomeOceanStage role="teacher" />
      <section aria-label="Không gian của cô" className="teacher-home-feature">
        <div className="teacher-home-copy home-split-copy">
          <HomeSpecimenMark />
          <div><h1>Không gian của cô</h1><p>Chuẩn bị nội dung, cùng bé khám phá.</p></div>
          <button type="button" className="home-primary teacher-home-primary" onClick={() => navigate('/teacher/interactive', {query:{}})}><Gamepad2 size={26}/><span>Quản lý tương tác</span><ArrowRight size={22}/></button>
        </div>
        <div className="teacher-home-photo"><img src={HOME_ART.teacher} alt="Cua biển trên ghềnh đá ven bờ" fetchPriority="high"/></div>
      </section>
      <section aria-label="Phân khu quản lý nội dung" className="teacher-home-domains">
        {[
          {label:'3D',image:HOME_ART.model,icon:Box,route:'/teacher/interactive?kind=model3d'},
          {label:'Học liệu',image:HOME_ART.resources,icon:BookOpen,route:'/teacher/resources'},
          {label:'Trò chơi',image:HOME_ART.games,icon:Gamepad2,route:'/teacher/interactive?kind=game'},
        ].map(({label,image,icon:Icon,route})=><button key={route} type="button" onClick={()=>navigate(route,{query:{}})}><img src={image} alt="" decoding="async"/><span className="teacher-domain-label"><Icon size={25}/><span>{label}</span></span><ArrowRight className="teacher-domain-arrow" size={24}/></button>)}
      </section>
      <section aria-label="Lối tắt sáng tạo" className="home-shortcuts teacher-home-shortcuts">
        <HomeShortcut label="Quản lý sáng tạo" image={HOME_ART.creative} icon={Palette} onClick={()=>navigate('/teacher/creative',{query:{}})}/>
      </section>
    </div>
  </TeacherShell>;
}
