import { useEffect, useRef, useState } from 'react';
import { BarChart3, Users, Settings, Camera, Save, ChevronRight, Folder, Link2, UserRound } from 'lucide-react';
import type { ProfileEvidence } from '@bluesteam/contracts';
import { getTeacherAvatar } from '../../../shared/data/teacherAvatars';
import { AnimalAvatar } from '../../../shared/ui/identity/AnimalAvatar';
import { ProfileEvidenceView } from '../../../shared/ui/profile/ProfileEvidenceView';
import { apiRequest } from '../../../shared/api/client';
import { TeacherShell } from '../../../shared/shells/TeacherShell';
import { getCachedTeacherProfile, fetchCurrentTeacherApi } from '../../../shared/api/auth';
import { ProfileFormSelect, ProfileSelect, ProfileTextField } from '../../../shared/ui/profile/ProfileFields';
import { TeacherIdentityDialog } from './TeacherIdentityDialog';
import '../../../shared/ui/profile/profile-layout.css';
import './teacher-profile.css';
import './teacher-roster.css';
import { TeacherClassRoster } from './TeacherClassRoster';
import { TeacherClassOverview, type ClassOverviewEvidence } from './TeacherClassOverview';
import { TeacherClassSettings } from './TeacherClassSettings';
import { ProfileDialog } from '../../../shared/ui/profile/ProfileDialog';
import { useMovingMarker } from '../../../shared/ui/motion/useMovingMarker';
import { ProfileLagoon } from '../../../shared/ui/profile/ProfileLagoon';
import { useProfileCardMotion } from '../../../shared/ui/profile/useProfileCardMotion';
import { useTeacherProfileTabMotion, type TeacherProfileTab } from './useTeacherProfileTabMotion';
import type { Classroom, ClassTeacher, Member } from './classroomProfileTypes';

type Index = { profile:{name:string;birthDate:string|null}; schools:{id:string;name:string}[]; classes:Classroom[] };
type Detail = { classroom:Classroom; members:Member[]; teachers:ClassTeacher[]; evidence:ClassOverviewEvidence };
const endpoint='/api/v1/teacher/classroom';
const art='/assets/generated/profile/dive-log/';
// The same demo portrait is available as seed media and as an earlier cropped upload.
const demoPortraits=new Set([
  '/api/v1/media/09c844ba-d3fb-4ec2-8cc3-4add87fb9370',
  '/api/v1/media/3227b339-e061-44d3-8f56-2656b9121b7a',
]);

export function TeacherProfilePage() {
  const [index,setIndex]=useState<Index>();
  const [selected,setSelected]=useState('');
  const [detail,setDetail]=useState<Detail>();
  const [tab,setTab]=useState<TeacherProfileTab>('overview');
  const tabMarker=useMovingMarker(tab,'x',430,'glide');
  const tabMotion=useTeacherProfileTabMotion(tab);
  useProfileCardMotion(tabMotion.panel);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [revision,setRevision]=useState(0);
  const [editing,setEditing]=useState(false);
  const [message,setMessage]=useState('');
  const [learner,setLearner]=useState<Member>();
  const [evidence,setEvidence]=useState<ProfileEvidence>();
  const [personalDraft,setPersonalDraft]=useState<Index['profile']>();
  const [showRequests,setShowRequests]=useState(false);
  const [showCatalog,setShowCatalog]=useState(false);
  const classSelect=useRef<HTMLDivElement>(null);
  const personalTrigger=useRef<HTMLButtonElement>(null);

  function closePersonal() {
    setPersonalDraft(undefined);
    personalTrigger.current?.focus({preventScroll:true});
  }

  function closeAvatarEditor() {
    const savedName=getCachedTeacherProfile()?.displayName;
    setPersonalDraft(draft=>draft&&savedName&&draft.name===index?.profile.name ? {...draft,name:savedName} : draft);
    setEditing(false);
    reload();
  }

  function chooseClass(id:string) {
    setSelected(id);
    setLearner(undefined);
    setShowRequests(false);
  }
  function openRequests() {
    setTab('students');
    setLearner(undefined);
    setShowRequests(true);
  }
  useEffect(()=>{
    if (tab==='students' && showRequests && detail?.classroom.id===selected) document.getElementById('teacher-class-requests')?.focus();
  },[tab,showRequests,detail,selected]);
  const reload=()=>setRevision(value=>value+1);
  const current=index?.classes.find(value=>value.id===selected);
  const [account,setAccount]=useState(getCachedTeacherProfile);
  useEffect(()=>{
    const update=()=>setAccount(getCachedTeacherProfile());
    window.addEventListener('bluesteam:teacher-updated',update);
    void fetchCurrentTeacherApi().then(setAccount);
    return ()=>window.removeEventListener('bluesteam:teacher-updated',update);
  },[]);
  useEffect(()=>{
    const abort=new AbortController();
    void apiRequest<Index>(endpoint,{signal:abort.signal}).then(data=>{
      if(abort.signal.aborted)return;
      setIndex(data);
      setSelected(previous=>data.classes.some(value=>value.id===previous)?previous:data.classes[0]?.id||'');
    }).catch(reason=>{if(!abort.signal.aborted)setError(reason.message);});
    return ()=>abort.abort();
  },[revision]);
  useEffect(()=>{
    if(!selected)return;
    const abort=new AbortController();
    void apiRequest<Detail>(endpoint+'/classes/'+selected,{signal:abort.signal}).then(data=>{if(!abort.signal.aborted)setDetail(data);})
      .catch(reason=>{if(!abort.signal.aborted)setError(reason.message);});
    return ()=>abort.abort();
  },[selected,revision]);

  useEffect(() => {
    setEvidence(undefined);
    if (!learner || !selected) return;
    const abort = new AbortController();
    void apiRequest<ProfileEvidence>(endpoint+'/classes/'+selected+'/learners/'+learner.learner_id,{signal:abort.signal})
      .then(data => { if (!abort.signal.aborted) {setEvidence(data);requestAnimationFrame(()=>document.querySelector('.teacher-child-detail')?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));} })
      .catch(reason => { if (!abort.signal.aborted) setError(reason.message); });
    return () => abort.abort();
  },[learner,selected,revision]);

  async function mutate(path:string,data:unknown,method='POST',selectCreatedClass=true) {
    setBusy(true);setError('');setMessage('');
    try {
      const result=await apiRequest<{id?:string}>(endpoint+path,{method,body:JSON.stringify(data)});
      if(path==='/classes'&&result.id&&selectCreatedClass)chooseClass(result.id);
      setMessage('Đã lưu thay đổi.');reload();
      if(path==='/profile') void fetchCurrentTeacherApi();
      return result;
    } catch(reason){setError((reason as Error).message);return false as const;}
    finally{setBusy(false);}
  }
  const classDetail=detail?.classroom.id===selected?detail:undefined;
  const members=classDetail?.members.filter(value=>value.status==='active')||[];
  const teacherAvatar=(alt = '')=>account?.avatarKey && !account.avatarUrl
    ? <AnimalAvatar artwork={getTeacherAvatar(account.avatarKey)} alt={alt}/>
    : <img className="avatar-frame" data-avatar-photo={Boolean(account?.avatarUrl)} src={account?.avatarUrl || art+'diver.webp'} alt={alt}/>;
  const classRole=classDetail?.classroom.teacherRole ?? current?.teacherRole;
  const hasPortraitCutout=demoPortraits.has(account?.avatarUrl ?? '');
  const portrait=<div className="teacher-profile-avatar" data-cutout={hasPortraitCutout}>
    {hasPortraitCutout
      ? <img className="teacher-profile-photo" src={art+'linh-portrait-cutout.webp'} alt="Ảnh giáo viên"/>
      : teacherAvatar(account?.avatarUrl ? 'Ảnh giáo viên' : '')}
    <img className="teacher-portrait-shell" src="/assets/generated/r2-cutouts/seashell_cutout.png" alt=""/>
  </div>;
  const compactName=index&&<div className="teacher-compact-identity">
    {teacherAvatar()}
    <strong>{index.profile.name}</strong>
    <button type="button" ref={personalTrigger} className="teacher-profile-action" aria-haspopup="dialog" onClick={()=>{setError('');setPersonalDraft(index.profile);}}>Thông tin cá nhân <ChevronRight size={17} aria-hidden="true"/></button>
  </div>;
  const classContext=index&&current&&<div className="teacher-profile-context">
    <ProfileSelect label="Trường" caption="Trường" art="school" className="profile-field-school" value={current.school_id}
      options={[...new Map(index.classes.map(value=>[value.school_id,value])).values()].map(value=>({value:value.school_id,label:value.school}))}
      onChange={school=>chooseClass(index.classes.find(value=>value.school_id===school)!.id)}/>
    <ProfileSelect label="Năm học" caption="Năm học" art="calendar" className="profile-field-schoolYear" value={current.year_id}
      options={[...new Map(index.classes.filter(value=>value.school_id===current.school_id).map(value=>[value.year_id,value])).values()].map(value=>({value:value.year_id,label:value.year}))}
      onChange={year=>chooseClass(index.classes.find(value=>value.year_id===year&&value.school_id===current.school_id)!.id)}/>
    <div ref={classSelect}>
      <ProfileSelect label="Giáo viên lớp" caption="Giáo viên lớp" art="classmates" className="profile-field-className" value={selected}
        options={index.classes.filter(value=>value.school_id===current.school_id&&value.year_id===current.year_id)
          .map(value=>({value:value.id,label:value.name+(value.archived?' · Đã lưu trữ':'')}))}
        onChange={chooseClass}/>
    </div>
  </div>;
  const catalog=index&&<div className="teacher-settings-catalog">
    <form className="teacher-class-create" onSubmit={event=>{event.preventDefault();void mutate('/schools',{name:new FormData(event.currentTarget).get('name')});}}>
      <label>Tạo trường mới<input className="profile-input" name="name" required maxLength={150} placeholder="Tên trường"/></label><button className="profile-primary" disabled={busy}>Tạo trường</button>
    </form>
    {!!index.schools.length&&<form className="teacher-class-create" onSubmit={event=>{event.preventDefault();const form=new FormData(event.currentTarget);void mutate('/classes',Object.fromEntries(form)).then(result=>{if(result)setShowCatalog(false);});}}>
      <ProfileFormSelect label="Trường" name="schoolId" disabled={busy} options={index.schools.map(value=>({value:value.id,label:value.name}))}/>
      <label>Năm học<input className="profile-input" name="year" required placeholder="2026–2027"/></label><label>Tên lớp<input className="profile-input" name="name" required/></label><label>Độ tuổi<input className="profile-input" name="ageGroup" maxLength={80}/></label><button className="profile-primary" disabled={busy}>Tạo lớp</button>
    </form>}
  </div>;
  return <TeacherShell><div className="learner-profile teacher-profile" data-tab={tab}>
    <ProfileLagoon />
    <div className="profile-content">
      <header className="teacher-profile-intro">
        <h1>Hồ sơ giáo viên</h1>
        {compactName}
      </header>
      {!index&&<p role="status">Đang mở hồ sơ…</p>}
      {index&&<>
        {classContext}
        {current&&<div className="teacher-class-context-row">
          <p className="teacher-class-context"><Users size={18} aria-hidden="true"/>{classRole==='lead'?'Chủ nhiệm · ':classRole==='assistant'?'Đồng giảng · ':classRole==='owner'?'Phụ trách trường · ':''}{classDetail?`${members.length} học sinh`:'Đang tải sĩ số'}{current.age_group?' · '+current.age_group:''}{current.archived?' · Đã lưu trữ':''}</p>
          <button type="button" className="teacher-profile-action" onClick={()=>{
            const trigger=classSelect.current?.querySelector('button');
            trigger?.focus();
            trigger?.click();
          }}><Link2 size={16} aria-hidden="true"/>Đổi lớp</button>
        </div>}
        <nav className="teacher-profile-tabs" aria-label="Quản lý hồ sơ">
          {([['overview','Tổng quan lớp'],['students','Danh sách học sinh'],['settings','Thiết lập lớp']] as const).map(([key,label])=><button type="button" key={key} aria-current={tab===key?'page':undefined} onClick={event=>{
            tabMotion.prepare(key,event.detail>0);
            if (tab!==key) tabMarker.prepare(event.detail>0);
            setTab(key);setLearner(undefined);setShowRequests(false);
          }}>{key==='overview'?<BarChart3 aria-hidden="true"/>:key==='students'?<Users aria-hidden="true"/>:<Settings aria-hidden="true"/>}{label}
            {tab===key&&<span ref={tabMarker.marker} className="teacher-profile-tab-marker" data-motion-marker aria-hidden="true"/>}
          </button>)}
        </nav>
      </>}
      {error&&!personalDraft&&<p role="alert">{error}<button onClick={reload}>Thử lại</button></p>}
      {message&&<p role="status">{message}</p>}
      <div ref={tabMotion.panel} className="teacher-profile-tab-panel">
      {index&&<>
        {!current&&<p>Chưa có lớp được phân công. Người phụ trách có thể tạo trường và lớp bên dưới.</p>}
        {current&&!classDetail&&<p role="status">Đang tải dữ liệu lớp…</p>}
        {current&&classDetail&&tab==='overview'&&<TeacherClassOverview key={current.id} className={current.name}
          members={members} evidence={classDetail.evidence}/>}
        {current&&classDetail&&tab==='students'&&<TeacherClassRoster key={current.id} classroom={classDetail.classroom}
          classes={index.classes} members={classDetail.members} busy={busy} error={error}
          mutate={mutate} onView={setLearner} viewed={learner?.id}/>}
        {current&&learner&&tab==='students'&&<section className="teacher-child-detail" aria-labelledby="teacher-child-heading">
          <div className="teacher-child-heading"><h2 id="teacher-child-heading">Hành trình của {learner.name}</h2><button onClick={()=>setLearner(undefined)}>Đóng hồ sơ bé</button></div>
          {!evidence&&<p role="status">Đang mở hành trình của bé…</p>}
          {evidence&&<ProfileEvidenceView key={learner.id} evidence={evidence} teacher scopeLabel={learner.name+' · '+current.name+' · '+current.year}/>}
        </section>}
        {current&&classDetail&&tab==='settings'&&<TeacherClassSettings key={current.id} classroom={classDetail.classroom}
          teachers={classDetail.teachers} pending={classDetail.members.filter(member=>member.status==='pending').length} busy={busy} error={error}
          mutate={mutate} onRequests={openRequests} onCatalog={()=>setShowCatalog(true)}/>}
        {tab==='settings'&&!current&&<section className="teacher-profile-panel"><h3>Trường và lớp do cô quản lý</h3>{catalog}</section>}
        {tab==='settings'&&showCatalog&&current&&<ProfileDialog title="Danh mục trường và năm học" icon={<Folder/>} onClose={()=>setShowCatalog(false)} wide className="class-settings-modal">
          {catalog}{error&&<p role="alert">{error}</p>}
        </ProfileDialog>}
      </>}
      </div>
    </div>
    {personalDraft&&!editing&&<ProfileDialog title="Thông tin cá nhân" icon={<UserRound/>} wide className="teacher-personal-modal" onClose={closePersonal}>
      <form className="teacher-profile-sheet" onSubmit={event=>{
        event.preventDefault();const form=new FormData(event.currentTarget);
        void mutate('/profile',{name:form.get('name'),birthDate:form.get('birthDate')||null},'PATCH').then(result=>{if(result)closePersonal();});
      }}>
        <div className="teacher-profile-portrait">
          {portrait}
          <button type="button" className="profile-secondary" disabled={!account||busy} onClick={()=>setEditing(true)}><Camera size={16} aria-hidden="true"/> Đổi ảnh</button>
        </div>
        <div className="teacher-profile-fields">
          <ProfileTextField label="Họ tên giáo viên" art="diver" name="name" value={personalDraft.name} required maxLength={80}
            onChange={event=>setPersonalDraft({...personalDraft,name:event.target.value})}/>
          <ProfileTextField label="Ngày sinh" art="calendar" name="birthDate" type="date" value={personalDraft.birthDate||''}
            onChange={event=>setPersonalDraft({...personalDraft,birthDate:event.target.value})}/>
        </div>
        {error&&<p role="alert">{error}</p>}
        <button className="profile-primary" disabled={busy}><Save size={17} aria-hidden="true"/> Lưu thông tin</button>
      </form>
    </ProfileDialog>}
    {editing&&account&&<TeacherIdentityDialog profile={account} onClose={closeAvatarEditor}/>}
  </div></TeacherShell>;
}
