import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeftRight, CalendarDays, Check, ChevronLeft, ChevronRight, CircleCheck,
  ClipboardList, Ellipsis, FolderOpen, Plus, Search, Trash2, UserRound, Users, X,
} from 'lucide-react';
import { AnimalAvatar } from '../../../shared/ui/identity/AnimalAvatar';
import { ClassInvitation } from './ClassInvitation';
import { RosterActionDialog, type RosterAction } from './RosterActionDialog';
import { RosterMoveDialog } from './RosterMoveDialog';
import { matchesStudent, rosterDate, studentCode, type Classroom, type ClassroomMutation, type Member } from './classroomProfileTypes';

const pageSize = 4;
const requestPageSize = 2;
const groups = [
  {key:'active',label:'Đang học',icon:Users},
  {key:'transferred',label:'Đã chuyển',icon:ArrowLeftRight},
  {key:'ended',label:'Đã kết thúc',icon:CircleCheck},
] as const;
type Group = typeof groups[number]['key'];
const groupOf = (member:Member)=>member.status==='ended'&&member.transfer_to_class_id ? 'transferred' : member.status;

function RosterPager({ page, size, count, label, onPage }: {page:number;size:number;count:number;label:string;onPage:(page:number)=>void}) {
  if (!count) return null;
  return <div className="roster-pager" aria-label={'Phân trang '+label}>
    <span aria-live="polite">{page*size+1}–{Math.min((page+1)*size,count)} / {count} {label}</span>
    {count>size&&<div><button disabled={!page} onClick={()=>onPage(page-1)}><ChevronLeft aria-hidden="true"/>Trước</button>
    <button disabled={(page+1)*size>=count} onClick={()=>onPage(page+1)}>Tiếp<ChevronRight aria-hidden="true"/></button></div>}
  </div>;
}

function RowMenu({ member, canEdit, onView, onAction }: {member:Member;canEdit:boolean;onView:()=>void;onAction:(action:RosterAction)=>void}) {
  const root = useRef<HTMLDetailsElement>(null);
  useEffect(()=>{
    function dismiss(event:PointerEvent) {
      if (!root.current?.contains(event.target as Node)) root.current?.removeAttribute('open');
    }
    document.addEventListener('pointerdown',dismiss);
    return ()=>document.removeEventListener('pointerdown',dismiss);
  },[]);
  function choose(action:()=>void) {
    root.current?.removeAttribute('open');
    root.current?.querySelector('summary')?.focus();
    action();
  }
  return <details ref={root} className="teacher-row-menu" onKeyDown={event=>{
    if (event.key==='Escape'&&root.current?.open) {
      event.stopPropagation();choose(()=>{});
    }
  }}>
    <summary aria-label={'Thao tác với '+member.name}><Ellipsis aria-hidden="true"/></summary>
    <div className="roster-row-actions">
      <button onClick={()=>choose(onView)}><UserRound aria-hidden="true"/>Xem hồ sơ</button>
      {canEdit&&<>
        <button onClick={()=>choose(()=>onAction({kind:'transfer',member}))}><ArrowLeftRight aria-hidden="true"/>Chuyển lớp</button>
        <button className="roster-destructive" onClick={()=>choose(()=>onAction({kind:'end',member}))}><Trash2 aria-hidden="true"/>Kết thúc theo học</button>
      </>}
    </div>
  </details>;
}

export function TeacherClassRoster({ classroom, classes, members, busy, error, mutate, onView, viewed }: {
  classroom:Classroom; classes:Classroom[]; members:Member[]; busy:boolean; error:string;
  mutate:ClassroomMutation; onView:(member:Member)=>void; viewed?:string;
}) {
  const [status,setStatus] = useState<Group>('active');
  const [search,setSearch] = useState('');
  const [page,setPage] = useState(0);
  const [requestPage,setRequestPage] = useState(0);
  const [action,setAction] = useState<RosterAction>();
  const pending = members.filter(member=>member.status==='pending');
  const matches = members.filter(member=>groupOf(member)===status&&matchesStudent(member,search));
  const rosterPage = Math.min(page,Math.max(0,Math.ceil(matches.length/pageSize)-1));
  const inboxPage = Math.min(requestPage,Math.max(0,Math.ceil(pending.length/requestPageSize)-1));
  const base = '/classes/'+classroom.id;
  const openClass = !classroom.archived;
  const canMove=openClass&&!busy&&members.some(value=>value.status==='active');

  return <>
    <div className="teacher-roster-layout">
      <div className="roster-main">
        <section className="teacher-profile-panel teacher-roster" data-profile-card="roster" aria-labelledby="class-roster-heading">
          <div className="roster-heading">
            <h2 id="class-roster-heading">Danh sách lớp {classroom.name}</h2>
            <div className="teacher-roster-statuses" aria-label="Trạng thái học sinh" role="group">
              {groups.map(({key,label,icon:Icon})=>{
                const count = members.filter(member=>groupOf(member)===key).length;
                if (key==='ended'&&!count) return null;
                return <button key={key} aria-pressed={status===key} onClick={()=>{setStatus(key);setPage(0);}}><Icon aria-hidden="true"/>{label} <b>{count}</b></button>;
              })}
            </div>
          </div>
          <div className="roster-tools">
            <label className="teacher-roster-search"><Search aria-hidden="true"/><input type="search" value={search}
              aria-label="Tìm tên hoặc mã học sinh" placeholder="Tìm tên hoặc mã học sinh"
              onChange={event=>{setSearch(event.target.value);setPage(0);}}/></label>
            <button className="profile-primary" disabled={!openClass||busy} onClick={()=>setAction({kind:'add'})}><Plus aria-hidden="true"/>Thêm học sinh</button>
          </div>
          <table className="roster-table" aria-label={'Học sinh lớp '+classroom.name}>
            <thead><tr><th scope="col">Học sinh</th><th scope="col">Mã học sinh</th><th scope="col">Tham gia từ</th><th scope="col">Trạng thái</th><th scope="col" colSpan={2}><span className="sr-only">Thao tác</span></th></tr></thead>
            <tbody>{matches.slice(rosterPage*pageSize,(rosterPage+1)*pageSize).map(member=>{
              const group=groupOf(member);
              return <tr key={member.id}>
                <th scope="row"><span className="teacher-roster-name"><AnimalAvatar avatarKey={member.avatar_key}/><strong>{member.name}</strong></span></th>
                <td className="roster-student-code">{studentCode(member)}</td>
                <td className="roster-joined">{member.joined_at?rosterDate.format(new Date(member.joined_at)):'—'}</td>
                <td className="roster-state-cell"><span className="roster-state" data-state={group}>
                  {group==='active'?<CircleCheck aria-hidden="true"/>:<ArrowLeftRight aria-hidden="true"/>}{groups.find(value=>value.key===group)?.label}
                </span></td>
                <td className="roster-view"><button type="button" className="teacher-profile-action" aria-expanded={viewed===member.id} aria-label={'Xem hành trình của '+member.name} onClick={()=>onView(member)}>Xem hành trình <ChevronRight aria-hidden="true"/></button></td>
                <td className="roster-menu-cell"><RowMenu member={member} canEdit={openClass&&group==='active'} onView={()=>onView(member)} onAction={setAction}/></td>
              </tr>;
            })}</tbody>
          </table>
          {!matches.length&&<p className="roster-empty">{search?'Không tìm thấy học sinh phù hợp.':status==='active'?'Lớp chưa có học sinh đang theo học.':status==='transferred'?'Chưa có học sinh chuyển lớp.':'Chưa có học sinh kết thúc theo học.'}</p>}
          <RosterPager page={rosterPage} size={pageSize} count={matches.length} label="học sinh" onPage={setPage}/>
        </section>
        <section className="teacher-profile-panel teacher-requests" data-profile-card="roster" id="teacher-class-requests" tabIndex={-1} aria-labelledby="class-requests-heading">
          <div className="roster-request-heading"><ClipboardList aria-hidden="true"/><h3 id="class-requests-heading">Yêu cầu tham gia · {pending.length}</h3></div>
          {!pending.length&&<p className="roster-empty">Hiện không có yêu cầu chờ duyệt.</p>}
          {!!pending.length&&!openClass&&<p>Mở lại lớp để duyệt yêu cầu đang chờ.</p>}
          {pending.slice(inboxPage*requestPageSize,(inboxPage+1)*requestPageSize).map(member=><div className="teacher-member-request" key={member.id}>
            <AnimalAvatar avatarKey={member.avatar_key}/>
            <div className="roster-request-name"><strong>{member.name}</strong><small>{studentCode(member)}</small></div>
            <button type="button" className="teacher-profile-action" aria-haspopup="dialog" aria-label={'Xem thông tin '+member.name} onClick={()=>setAction({kind:'info',member})}>Xem thông tin <ChevronRight aria-hidden="true"/></button>
            <button className="profile-primary" disabled={busy||!openClass} onClick={()=>void mutate(base+'/enrollments/'+member.id,{action:'approve'})}><Check aria-hidden="true"/>Duyệt</button>
            <button className="roster-reject" disabled={busy} onClick={()=>setAction({kind:'reject',member})}><X aria-hidden="true"/>Từ chối</button>
          </div>)}
          {pending.length>requestPageSize&&<RosterPager page={inboxPage} size={requestPageSize} count={pending.length} label="yêu cầu" onPage={setRequestPage}/>}
        </section>
      </div>
      <ClassInvitation key={classroom.invite_code} classroom={classroom} busy={busy} mutate={mutate}/>
    </div>
    <section className="teacher-profile-panel roster-transfer" data-profile-card="roster" aria-labelledby="class-transfer-heading">
      <div className="roster-transfer-title"><span className="roster-transfer-art" aria-hidden="true"><FolderOpen/></span><h3 id="class-transfer-heading">Chuyển lớp và lên năm học</h3></div>
      <div className="roster-transfer-actions">
        <button disabled={!canMove} onClick={()=>setAction({kind:'transfer'})}><ArrowLeftRight aria-hidden="true"/>Chuyển lớp</button>
        <button className="profile-primary" disabled={!canMove} onClick={()=>setAction({kind:'promote'})}><CalendarDays aria-hidden="true"/>Lên năm học</button>
      </div>
    </section>
    {action&&(action.kind==='transfer'||action.kind==='promote'
      ? <RosterMoveDialog classroom={classroom} classes={classes} members={members} mode={action.kind}
          initialMember={action.kind==='transfer'?action.member:undefined} busy={busy} error={error} mutate={mutate} onClose={()=>setAction(undefined)}/>
      : <RosterActionDialog action={action} classroom={classroom} busy={busy} error={error} mutate={mutate} onClose={()=>setAction(undefined)}/>)}
  </>;
}
