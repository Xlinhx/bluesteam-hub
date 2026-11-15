import { useEffect, useState } from 'react';
import { CalendarDays, ChevronRight, ClipboardCopy, Info, KeyRound, RotateCw, UserRoundPlus } from 'lucide-react';
import QRCode from 'qrcode';
import { ProfileDialog } from '../../../shared/ui/profile/ProfileDialog';
import { rosterDate, type Classroom, type ClassroomMutation } from './classroomProfileTypes';

export function ClassInvitation({ classroom, busy, mutate, settings }: {
  classroom: Classroom; busy: boolean; mutate: ClassroomMutation;
  settings?: { approval:boolean; pending:number; onApprovalChange:(value:boolean)=>void; onRequests:()=>void };
}) {
  const [qr,setQr] = useState('');
  const [copyStatus,setCopyStatus] = useState('');
  const [confirmRefresh,setConfirmRefresh] = useState(false);
  const [refreshFailed,setRefreshFailed] = useState(false);
  const expiresAt = new Date(classroom.invite_expires_at);
  const expired = expiresAt.getTime() <= Date.now();
  const inactive = classroom.archived || expired;
  const showQR = !settings;
  const link = typeof window === 'undefined' ? '' : new URL('/profile?join='+encodeURIComponent(classroom.invite_code), window.location.origin).href;
  useEffect(()=>{
    if (!showQR || !link || inactive) return;
    let active = true;
    void QRCode.toDataURL(link, {width:256, margin:4, color:{dark:'#092f50',light:'#ffffff'}})
      .then(value=>{ if (active) setQr(value); }).catch(()=>{ if (active) setQr(''); });
    return ()=>{active=false;};
  },[showQR,link,inactive]);

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText([
        'Mời bé vào lớp '+classroom.name+' · '+classroom.school+' · '+classroom.year,
        'Mã lớp '+classroom.invite_code,link,
      ].join('\n'));
      setCopyStatus('Đã sao chép lời mời.');
    } catch {
      setCopyStatus('Chưa sao chép được lời mời. Cô có thể sao chép liên kết bên dưới.');
    }
  }

  const actions = <div className="teacher-invitation-actions">
    <button type="button" disabled={busy||inactive} onClick={()=>void copyInvite()}><ClipboardCopy aria-hidden="true"/>Sao chép lời mời</button>
    <button type="button" className="teacher-profile-action" disabled={busy||classroom.archived} aria-haspopup="dialog" onClick={()=>{
      setRefreshFailed(false);setConfirmRefresh(true);
    }}><RotateCw aria-hidden="true"/>Cấp lại mã</button>
  </div>;
  const feedback = <>
    {copyStatus&&<p role="status">{copyStatus}</p>}
    {copyStatus.startsWith('Chưa')&&<input className="profile-input" readOnly aria-label="Liên kết lời mời" value={link} onFocus={event=>event.currentTarget.select()}/>}
  </>;
  const confirmation = confirmRefresh&&<ProfileDialog title="Cấp lại mã mời" icon={<KeyRound/>}
    onClose={()=>{if (!busy) setConfirmRefresh(false);}} className="class-settings-modal invite-refresh-dialog">
    {close=><form onSubmit={async event=>{
      event.preventDefault();
      if (await mutate('/classes/'+classroom.id+'/invitation',{})) setConfirmRefresh(false);
      else setRefreshFailed(true);
    }}>
      <p>Mã <strong>{classroom.invite_code}</strong> và liên kết hiện tại sẽ hết hiệu lực. Cô có thể gửi lời mời mới sau khi cấp lại.</p>
      {refreshFailed&&<p role="alert">Chưa cấp lại được mã. Cô thử lại nhé.</p>}
      <div className="class-settings-modal-actions"><button type="button" className="profile-secondary" onClick={close} disabled={busy}>Hủy</button>
        <button type="submit" className="profile-primary" disabled={busy}>Cấp lại mã</button></div>
    </form>}
  </ProfileDialog>;
  if (settings) return <section className="class-settings-card class-settings-invite" data-profile-card="settings" aria-labelledby="class-invite-title">
    <h3 id="class-invite-title"><UserRoundPlus aria-hidden="true"/>Tham gia lớp</h3>
    <span className="class-settings-key" aria-hidden="true"><KeyRound/></span>
    <div className="class-settings-inset">
      <div className="class-invite-code-row"><span>Mã mời</span><strong className="teacher-invite-code">{classroom.invite_code}</strong></div>
      <p className="class-settings-note"><CalendarDays aria-hidden="true"/>{classroom.archived?'Lớp đã lưu trữ':expired?'Mã đã hết hạn':`Hết hạn ${rosterDate.format(expiresAt)}`}</p>
      {actions}{feedback}
      <div className="class-invite-policy">
        <label className="class-invite-toggle">
          <strong>Cô duyệt yêu cầu tham gia</strong>
          <input type="checkbox" role="switch" checked={settings.approval}
            disabled={busy||!classroom.canManage||classroom.archived} onChange={event=>settings.onApprovalChange(event.target.checked)}/>
        </label>
        {!classroom.canManage&&!classroom.archived&&<p className="class-settings-note">Chỉ người phụ trách trường có thể đổi tùy chọn này.</p>}
        <button type="button" className="teacher-profile-action" onClick={settings.onRequests}>{settings.pending?`${settings.pending} yêu cầu đang chờ`:'Xem yêu cầu tham gia'} <ChevronRight size={15} aria-hidden="true"/></button>
        {!settings.approval&&settings.pending>0&&<p className="class-settings-note">Các yêu cầu đã gửi vẫn cần duyệt.</p>}
      </div>
    </div>
    {confirmation}
  </section>;

  return <section className="teacher-profile-panel teacher-invitation roster-invitation" data-profile-card="roster">
    <h3><UserRoundPlus aria-hidden="true"/>Mời bé vào lớp</h3>
    <KeyRound className="roster-invite-key" aria-hidden="true"/>
    <div className="roster-invite-details">
      {!inactive&&qr&&<a className="roster-qr" href={link} target="_blank" rel="noreferrer" aria-label="Mở liên kết mời bé vào lớp"><img src={qr} alt="QR tham gia lớp"/></a>}
      <div>
        <span>Mã mời lớp {classroom.name}</span>
        <strong className="teacher-invite-code">{classroom.invite_code}</strong>
      </div>
    </div>
    <p className="roster-note"><Info aria-hidden="true"/>{classroom.archived ? 'Lớp đã lưu trữ' : expired ? 'Mã đã hết hạn' : `Hết hạn ${rosterDate.format(expiresAt)}`}</p>
    {actions}{feedback}
    {confirmation}
  </section>;
}
