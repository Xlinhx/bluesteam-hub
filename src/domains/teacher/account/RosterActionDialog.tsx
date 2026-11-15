import { useState } from 'react';
import { CalendarDays, Check, ClipboardList, GraduationCap, UserRoundPlus, X } from 'lucide-react';
import { AnimalAvatar } from '../../../shared/ui/identity/AnimalAvatar';
import { ProfileDialog } from '../../../shared/ui/profile/ProfileDialog';
import { rosterDate, studentCode, type Classroom, type ClassroomMutation, type Member } from './classroomProfileTypes';

export type RosterAction =
  | {kind:'add'}
  | {kind:'promote'}
  | {kind:'info'|'end'|'reject';member:Member}
  | {kind:'transfer';member?:Member};

export function RosterActionDialog({action,classroom,busy,error,mutate,onClose}:{
  action:Exclude<RosterAction,{kind:'transfer'}|{kind:'promote'}>;classroom:Classroom;
  busy:boolean;error:string;mutate:ClassroomMutation;onClose:()=>void;
}) {
  const [confirmReject,setConfirmReject]=useState(false);
  const base='/classes/'+classroom.id;
  const title=action.kind==='add'?'Thêm học sinh':action.kind==='info'?'Thông tin yêu cầu':action.kind==='end'?'Kết thúc theo học':'Từ chối yêu cầu';

  async function submit(path:string,body:unknown) {
    if (await mutate(path,body)) onClose();
  }

  return <ProfileDialog title={title} icon={action.kind==='add'?<UserRoundPlus/>:<ClipboardList/>}
    onClose={onClose} className={'roster-modal '+(action.kind==='info'?'roster-request-modal':'')}>
    {close=><div className="roster-dialog">
      {action.kind==='info'&&<>
        <div className="roster-request-identity">
          <span className="roster-shape-art"><AnimalAvatar avatarKey={action.member.avatar_key}/></span>
          <div><strong>{action.member.name}</strong><small>{studentCode(action.member)}</small></div>
          <span className="roster-request-source">Xin vào lớp bằng mã</span>
        </div>
        <dl className="roster-request-details">
          <div><GraduationCap aria-hidden="true"/><div><dt>Lớp đăng ký</dt><dd><strong>{classroom.name} · {classroom.year}</strong><small>{classroom.school}</small></dd></div></div>
          <div><CalendarDays aria-hidden="true"/><div><dt>Ngày gửi</dt><dd><strong>{rosterDate.format(new Date(action.member.requested_at))}</strong></dd></div></div>
        </dl>
        {confirmReject&&<p role="status">Từ chối yêu cầu vào lớp của {action.member.name}?</p>}
        <footer>
          <button type="button" disabled={busy} onClick={()=>setConfirmReject(!confirmReject)}>{confirmReject?'Quay lại':<><X aria-hidden="true"/>Từ chối</>}</button>
          {confirmReject
            ? <button type="button" className="profile-dialog-danger" disabled={busy} onClick={()=>void submit(base+'/enrollments/'+action.member.id,{action:'reject'})}>Xác nhận từ chối</button>
            : <button type="button" className="profile-primary" disabled={busy||classroom.archived} onClick={()=>void submit(base+'/enrollments/'+action.member.id,{action:'approve'})}><Check aria-hidden="true"/>Duyệt vào lớp</button>}
        </footer>
      </>}
      {(action.kind==='end'||action.kind==='reject')&&<form onSubmit={event=>{
        event.preventDefault();void submit(base+'/enrollments/'+action.member.id,{action:action.kind});
      }}>
        <p>{action.kind==='end'?'Kết thúc theo học của ':'Từ chối yêu cầu vào lớp của '}<strong>{action.member.name}</strong>?</p>
        {action.kind==='end'&&<p>Hành trình của bé vẫn được lưu trong hồ sơ lớp.</p>}
        <footer><button type="button" onClick={close}>Hủy</button><button className="profile-dialog-danger" disabled={busy}>Xác nhận</button></footer>
      </form>}
      {action.kind==='add'&&<form onSubmit={event=>{
        event.preventDefault();void submit(base+'/roster',{emails:[new FormData(event.currentTarget).get('email')]});
      }}>
        <p>Dùng email của bé đang học tại trường hoặc đã gửi yêu cầu vào {classroom.name}. Với bé mới, cô có thể gửi lời mời tham gia bằng mã.</p>
        <label>Email tài khoản học sinh<input className="profile-input" name="email" type="email" maxLength={254} required/></label>
        <footer><button type="button" onClick={close}>Hủy</button><button className="profile-primary" disabled={busy}>Thêm học sinh</button></footer>
      </form>}
      {error&&<p role="alert">{error}</p>}
    </div>}
  </ProfileDialog>;
}
