import { useId, useState, type ReactNode } from 'react';
import { ArrowRight, CalendarDays, ChevronDown, GraduationCap, Search, Users } from 'lucide-react';
import { schoolYearStart } from '@bluesteam/contracts';
import { AnimalAvatar } from '../../../shared/ui/identity/AnimalAvatar';
import { ProfileDialog } from '../../../shared/ui/profile/ProfileDialog';
import { matchesStudent, rosterDate, studentCode, type Classroom, type ClassroomMutation, type Member } from './classroomProfileTypes';

type Destination = Pick<Classroom,'id'|'name'|'year'>;

function RosterPicker({label,summary,icon,children}:{
  label:string;summary:string;icon:ReactNode;children:ReactNode;
}) {
  const id=useId();
  const [open,setOpen]=useState(true);
  return <div className="roster-picker">
    <button type="button" className="roster-shape roster-picker-trigger" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>
      <span className="roster-shape-art">{icon}</span><span className="roster-shape-label">{label}</span>
      <strong>{summary}</strong><ChevronDown aria-hidden="true"/>
    </button>
    <div id={id} className="roster-picker-options" hidden={!open}>{children}</div>
  </div>;
}

export function RosterMoveDialog({classroom,classes,members,initialMember,mode,busy,error,mutate,onClose}:{
  classroom:Classroom;classes:Classroom[];members:Member[];initialMember?:Member;mode:'transfer'|'promote';
  busy:boolean;error:string;mutate:ClassroomMutation;onClose:()=>void;
}) {
  const [step,setStep]=useState(0);
  const [selected,setSelected]=useState<string[]>(initialMember?[initialMember.id]:[]);
  const [search,setSearch]=useState('');
  const [destinationId,setDestinationId]=useState('');
  const [newDestination,setNewDestination]=useState<Destination>();
  const [creating,setCreating]=useState(false);
  const title=mode==='promote'?'Lên năm học':'Chuyển lớp';
  const labels=['Chọn học sinh','Chọn lớp đích','Xác nhận'];
  const start=schoolYearStart(classroom.year);
  const next=start===null?null:start+1;
  const year=next===null?'':classes.find(value=>value.school_id===classroom.school_id&&schoolYearStart(value.year)===next)?.year||next+'–'+(next+1);
  const destinations:Destination[]=classes.filter(value=>value.id!==classroom.id&&value.school_id===classroom.school_id&&!value.archived&&(
    mode==='promote'?next!==null&&schoolYearStart(value.year)===next:value.year_id===classroom.year_id
  ));
  if (newDestination&&!destinations.some(value=>value.id===newDestination.id)) destinations.push(newDestination);
  const destination=destinations.find(value=>value.id===destinationId);
  const active=members.filter(value=>value.status==='active');
  const selectedIds=new Set(selected);
  const group=active.filter(value=>selectedIds.has(value.id));
  const visible=active.filter(value=>matchesStudent(value,search));
  const allVisible=visible.length>0&&visible.every(value=>selectedIds.has(value.id));
  const canCreate=mode==='promote'&&classroom.canManage&&Boolean(year);
  const showCreate=canCreate&&(creating||!destinations.length);
  const listName='roster-destination-'+classroom.id;

  async function createDestination(form:FormData) {
    const name=String(form.get('name')).trim();
    const result=await mutate('/classes',{schoolId:classroom.school_id,year,name,ageGroup:form.get('ageGroup')},'POST',false);
    if (!result || !result.id) return;
    setNewDestination({id:result.id,name,year});
    setDestinationId(result.id);
    setCreating(false);
  }

  async function advance() {
    if (step<2) {setStep(step+1);return;}
    if (await mutate('/classes/'+classroom.id+'/transfers',{destinationId,mode,enrollmentIds:group.map(value=>value.id)})) onClose();
  }

  return <ProfileDialog title={title} icon={<GraduationCap/>} onClose={onClose} className="roster-modal roster-move-modal">
    {close=><div className="roster-dialog">
      <ol className="roster-dialog-steps">{labels.map((label,index)=><li key={label} aria-current={step===index?'step':undefined}>
        {index>0&&<ArrowRight size={15} aria-hidden="true"/>}<span>{index+1}</span><strong>{label}</strong>
      </li>)}</ol>
      {step===0&&<RosterPicker label="Học sinh" summary={group.length?group.length+' học sinh đã chọn':'Chọn học sinh'} icon={<Users aria-hidden="true"/>}>
        <div className="roster-picker-tools">
          <label className="teacher-roster-search"><Search aria-hidden="true"/><input type="search" aria-label="Tìm tên hoặc mã học sinh" placeholder="Tên hoặc mã học sinh" value={search} onChange={event=>setSearch(event.target.value)}/></label>
          <button type="button" className="roster-select-all" disabled={!visible.length} onClick={()=>setSelected(previous=>{
            const ids=new Set(visible.map(value=>value.id));
            return allVisible?previous.filter(id=>!ids.has(id)):[...new Set([...previous,...ids])];
          })}>{allVisible?'Bỏ chọn':search.trim()?'Chọn kết quả':'Chọn cả lớp'}</button>
        </div>
        <div className="roster-option-list" role="group" aria-label="Học sinh của lớp">
          {visible.map(member=><label className="roster-picker-option" key={member.id}>
            <AnimalAvatar avatarKey={member.avatar_key}/><strong>{member.name}</strong><small>{studentCode(member)}</small>
            <input type="checkbox" aria-label={member.name+' · '+studentCode(member)} checked={selectedIds.has(member.id)} onChange={event=>{
              const checked=event.target.checked;
              setSelected(previous=>checked?[...previous,member.id]:previous.filter(id=>id!==member.id));
            }}/>
          </label>)}
          {!visible.length&&<p className="roster-empty">Không tìm thấy học sinh phù hợp.</p>}
        </div>
      </RosterPicker>}
      {step===1&&<>
        <div className="roster-move-summary"><Users aria-hidden="true"/><strong>{group.length} học sinh đã chọn</strong>
          <small>{mode==='promote'&&year?year:classroom.year}</small></div>
        {!!destinations.length&&<RosterPicker label="Lớp đích" summary={destination?.name||'Chọn lớp đích'} icon={<GraduationCap aria-hidden="true"/>}>
          <div className="roster-option-list" role="radiogroup" aria-label="Lớp đích">
            {destinations.map(value=><label className="roster-picker-option" key={value.id}>
              <GraduationCap aria-hidden="true"/><strong>{value.name}</strong><small>{value.year}</small>
              <input type="radio" name={listName} value={value.id} checked={destinationId===value.id} onChange={()=>setDestinationId(value.id)}/>
            </label>)}
          </div>
        </RosterPicker>}
        {!destinations.length&&!showCreate&&<p>{mode==='promote'&&next===null
          ? 'Năm học hiện tại cần có dạng hai năm liên tiếp, ví dụ 2026–2027.'
          : 'Chưa có lớp đích đang hoạt động mà cô có quyền quản lý.'}</p>}
        {canCreate&&destinations.length>0&&!showCreate&&<button type="button" className="teacher-profile-action roster-create-link" onClick={()=>setCreating(true)}>Tạo thêm lớp đích</button>}
        {showCreate&&<form className="roster-create-destination" onSubmit={event=>{event.preventDefault();void createDestination(new FormData(event.currentTarget));}}>
          <h3><CalendarDays aria-hidden="true"/>Tạo lớp đích</h3>
          <label>Tên lớp mới<input className="profile-input" name="name" required maxLength={150}/></label>
          <label>Độ tuổi<input className="profile-input" name="ageGroup" defaultValue={classroom.age_group} maxLength={80}/></label>
          <div className="roster-create-actions">
            {destinations.length>0&&<button type="button" disabled={busy} onClick={()=>setCreating(false)}>Dùng lớp có sẵn</button>}
            <button className="profile-primary" disabled={busy}>Tạo lớp đích</button>
          </div>
        </form>}
      </>}
      {step===2&&<div className="roster-confirm">
        <div className="roster-move-summary"><Users aria-hidden="true"/><strong>{group.length} học sinh</strong><small>{rosterDate.format(new Date())}</small></div>
        <p><strong>{classroom.name} · {classroom.year}</strong> <ArrowRight size={16} aria-label="sang"/> <strong>{destination?.name} · {destination?.year}</strong></p>
        <p>Áp dụng ngay khi xác nhận. Hành trình đã ghi nhận vẫn xem được ở lớp cũ.</p>
        <ul aria-label="Học sinh được chọn">{group.map(member=><li key={member.id}><AnimalAvatar avatarKey={member.avatar_key}/><span>{member.name}</span><small>{studentCode(member)}</small></li>)}</ul>
      </div>}
      {error&&<p role="alert">{error}</p>}
      <footer><button type="button" disabled={busy} onClick={step?()=>setStep(step-1):close}>{step?'Quay lại':'Hủy'}</button>
        <button type="button" className="profile-primary" disabled={busy||!group.length||(step>0&&!destination)||showCreate&&step===1} onClick={()=>void advance()}>
          {step===2?(mode==='promote'?'Xác nhận lên năm học':'Xác nhận chuyển lớp'):'Tiếp'}
        </button></footer>
    </div>}
  </ProfileDialog>;
}
