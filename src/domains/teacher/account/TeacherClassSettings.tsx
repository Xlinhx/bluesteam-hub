import { useEffect, useId, useState, type FormEvent } from 'react';
import { ArrowRight, Archive, CalendarDays, Check, ChevronRight, ClipboardList, Folder, FolderOpen, Info, LockKeyhole, Users, X } from 'lucide-react';
import { schoolYearStart } from '@bluesteam/contracts';
import { getTeacherAvatar } from '../../../shared/data/teacherAvatars';
import { AnimalAvatar } from '../../../shared/ui/identity/AnimalAvatar';
import { ProfileDialog } from '../../../shared/ui/profile/ProfileDialog';
import { ProfileFormSelect } from '../../../shared/ui/profile/ProfileFields';
import { ClassInvitation } from './ClassInvitation';
import type { Classroom, ClassroomMutation, ClassTeacher } from './classroomProfileTypes';
import './teacher-settings.css';

const art = '/assets/generated/profile/dive-log/';
const classPath = (id:string) => '/classes/'+id;

export function TeacherClassSettings({ classroom, teachers, pending, busy, error, mutate, onRequests, onCatalog }: {
  classroom:Classroom; teachers:ClassTeacher[]; pending:number; busy:boolean; error:string;
  mutate:ClassroomMutation; onRequests:()=>void; onCatalog:()=>void;
}) {
  const c = classroom;
  const formId = useId();
  const [modal,setModal] = useState<'assign'|'year'|'archive'>();
  const [draftVersion,setDraftVersion] = useState(0);
  const [approvalDraft,setApprovalDraft] = useState<boolean>();
  const [modalFailed,setModalFailed] = useState(false);
  const approval = approvalDraft ?? c.requires_approval ?? true;
  const yearStart = schoolYearStart(c.year);
  const classCode = c.class_number == null ? '' : String(c.class_number).padStart(6,'0');
  const savedVersion = [c.name,c.age_group,c.start_date,c.end_date,draftVersion].join('\u0000');
  useEffect(()=>{
    setApprovalDraft(draft=>draft===c.requires_approval?undefined:draft);
  },[c.requires_approval]);

  function openModal(next:typeof modal) {
    setModalFailed(false);
    setModal(next);
  }

  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    await mutate(classPath(c.id),{
      name:fields.get('name'), ageGroup:fields.get('ageGroup'), archived:c.archived,
      startDate:fields.get('startDate')||null, endDate:fields.get('endDate')||null,
      requiresApproval:c.canManage&&!c.archived?approvalDraft:undefined,
    },'PATCH');
  }

  async function submitModal(event:FormEvent<HTMLFormElement>,close:()=>void) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const result = await (modal==='assign' ? mutate(classPath(c.id)+'/teachers',fields)
      : modal==='year' ? mutate('/classes',{...fields,schoolId:c.school_id,ageGroup:c.age_group},'POST',false)
      : mutate(classPath(c.id),{name:c.name,ageGroup:c.age_group,archived:!c.archived},'PATCH'));
    if (result) close();
    else setModalFailed(true);
  }

  const archiveLabel = c.archived?'Mở lại lớp':'Lưu trữ lớp';
  const modalTitle = modal==='assign'?'Thay đổi phân công':modal==='year'?'Chuẩn bị lớp năm học mới':archiveLabel;
  return <section className="class-settings" aria-labelledby="class-settings-heading">
    <header className="class-settings-heading">
      <div><h2 id="class-settings-heading">Thiết lập lớp {c.name}<i aria-hidden="true"/></h2>
        <div>{classCode&&<span>Mã lớp CL-{classCode.slice(0,-3)}-{classCode.slice(-3)}</span>}
          <span className="class-settings-badge" data-tone={c.archived?'quiet':'green'}>{c.archived?<Archive aria-hidden="true"/>:<Check aria-hidden="true"/>}{c.archived?'Đã lưu trữ':'Đang hoạt động'}</span>
        </div>
      </div>
      {c.canManage&&<button type="button" className="teacher-profile-action" aria-haspopup="dialog" onClick={onCatalog}><Folder aria-hidden="true"/>Danh mục trường &amp; năm học <ChevronRight aria-hidden="true"/></button>}
    </header>

    <div className="class-settings-grid">
      <section className="class-settings-card class-settings-info" data-profile-card="settings" aria-labelledby="class-settings-info">
        <h3 id="class-settings-info"><ClipboardList aria-hidden="true"/>Thông tin lớp</h3>
        <img className="class-settings-school-art" src={art+'school.webp'} alt=""/>
        <form id={formId} key={savedVersion} onSubmit={event=>void save(event)}>
          <div className="class-settings-basics">
            <label>Tên lớp <span aria-hidden="true">*</span><input className="profile-input" name="name" defaultValue={c.name} required maxLength={150}/></label>
            <ProfileFormSelect label="Độ tuổi" name="ageGroup" defaultValue={c.age_group} disabled={busy}
              options={[...new Set([c.age_group,'3–4 tuổi','4–5 tuổi','5–6 tuổi','Lớp ghép'])].map(value=>({value,label:value||'Chưa chọn'}))}/>
          </div>
          <div className="class-settings-locked">
            <div><LockKeyhole aria-hidden="true"/><span>Trường<strong>{c.school}</strong></span></div>
            <div><LockKeyhole aria-hidden="true"/><span>Năm học<strong>{c.year}</strong></span></div>
          </div>
          <fieldset className="class-settings-dates"><legend><CalendarDays aria-hidden="true"/>Thời gian năm học</legend>
            <div><label>Ngày bắt đầu<input className="profile-input" name="startDate" type="date" defaultValue={c.start_date?.slice(0,10)||''}/></label>
              <ArrowRight aria-hidden="true"/>
              <label>Ngày kết thúc<input className="profile-input" name="endDate" type="date" defaultValue={c.end_date?.slice(0,10)||''}/></label></div>
          </fieldset>
        </form>
      </section>

      <ClassInvitation key={c.invite_code} classroom={c} busy={busy} mutate={mutate}
        settings={{approval,pending,onApprovalChange:setApprovalDraft,onRequests}}/>

      <section className="class-settings-card class-settings-staff" data-profile-card="settings" aria-labelledby="class-settings-staff">
        <h3 id="class-settings-staff"><Users aria-hidden="true"/>Giáo viên phụ trách</h3>
        <div className="class-settings-inset">
          {teachers.length ? <ul>{teachers.map(teacher=><li key={teacher.id}>
            {teacher.avatar_media_id ? <img className="class-staff-photo" src={`/api/v1/media/${teacher.avatar_media_id}`} alt=""/>
              : <AnimalAvatar artwork={getTeacherAvatar(teacher.avatar_key ?? '')} alt=""/>}
            <strong>{teacher.name}</strong>
            <span className="class-settings-badge" data-tone={teacher.role==='lead'?'green':'blue'}>{teacher.role==='lead'?'Chủ nhiệm':'Đồng giảng'}</span>
          </li>)}</ul> : <p className="class-settings-note">Chưa có giáo viên được phân công.</p>}
          {c.canManage
            ? <button type="button" className="teacher-profile-action" aria-haspopup="dialog" onClick={()=>openModal('assign')}>Thay đổi phân công <ChevronRight aria-hidden="true"/></button>
            : <p className="class-settings-note">Người phụ trách trường quản lý phân công.</p>}
        </div>
      </section>

      <section className="class-settings-card class-settings-scope" data-profile-card="settings" aria-labelledby="class-settings-scope">
        <h3 id="class-settings-scope"><Folder aria-hidden="true"/>Phạm vi dữ liệu của lớp</h3>
        <div className="class-settings-inset">
          <p className="class-settings-note">Hoạt động và sản phẩm đã ghi vào lớp được lưu theo năm học. Tranh lưu riêng trên thiết bị chỉ có trong hồ sơ của bé.</p>
        </div>
      </section>
    </div>

    <section className="class-settings-card class-settings-year" data-profile-card="settings" aria-labelledby="class-settings-year">
      <div className="class-settings-year-copy"><span className="class-settings-folder" aria-hidden="true"><FolderOpen/></span><div>
        <h3 id="class-settings-year">Khi kết thúc năm học</h3>
      </div></div>
      <div className="class-settings-year-actions">
        {c.canManage&&<button className="profile-secondary" onClick={()=>openModal('year')}><CalendarDays aria-hidden="true"/>Chuẩn bị lớp năm học mới</button>}
        <button className="profile-secondary" onClick={()=>openModal('archive')}><Archive aria-hidden="true"/>{archiveLabel}</button>
      </div>
    </section>
    <footer className="class-settings-footer">
      <div><button className="profile-secondary" disabled={busy} onClick={()=>{setDraftVersion(value=>value+1);setApprovalDraft(undefined);}}><X aria-hidden="true"/>Hủy thay đổi</button>
        <button className="profile-primary" form={formId} disabled={busy}><Check aria-hidden="true"/>Lưu thiết lập</button></div>
    </footer>

    {modal&&<ProfileDialog title={modalTitle} icon={modal==='assign'?<Users/>:modal==='year'?<CalendarDays/>:<Archive/>}
      onClose={()=>setModal(undefined)} className="class-settings-modal">
      {close=><form onSubmit={event=>void submitModal(event,close)}>
        {modal==='assign'&&<>
          <label>Email tài khoản giáo viên<input className="profile-input" name="email" type="email" required maxLength={254}/></label>
          <ProfileFormSelect label="Phân công" name="role" disabled={busy} options={[
            {value:'lead',label:'Chủ nhiệm'},{value:'assistant',label:'Đồng giảng'},{value:'remove',label:'Kết thúc phân công'},
          ]}/>
          <p className="class-settings-note"><Info aria-hidden="true"/>Giáo viên được phân công có thể xem hồ sơ của các bé trong lớp.</p>
        </>}
        {modal==='year'&&<>
          <label>Năm học mới<input className="profile-input" name="year" required maxLength={150} readOnly={yearStart!=null} defaultValue={yearStart==null?'':`${yearStart+1}–${yearStart+2}`}/></label>
          <label>Tên lớp mới<input className="profile-input" name="name" required maxLength={150} defaultValue={c.name}/></label>
          <p className="class-settings-note"><Info aria-hidden="true"/>Sau khi tạo lớp, vào Danh sách học sinh và chọn Lên năm học để chuyển các bé.</p>
        </>}
        {modal==='archive'&&<p>{c.archived?`Mở lại lớp ${c.name} để tiếp tục ghi nhận hoạt động. Cấp lại mã nếu mã cũ đã hết hạn.`:`Lưu lịch sử lớp ${c.name} để xem lại. Lớp sẽ ngừng nhận yêu cầu và hoạt động mới.`}</p>}
        {modalFailed&&error&&<p role="alert">{error}</p>}
        <div className="class-settings-modal-actions"><button type="button" className="profile-secondary" onClick={close}>Hủy</button>
          <button className="profile-primary" disabled={busy}>{modal==='assign'?'Lưu phân công':modal==='year'?'Tạo lớp năm học mới':archiveLabel}</button></div>
      </form>}
    </ProfileDialog>}
  </section>;
}
