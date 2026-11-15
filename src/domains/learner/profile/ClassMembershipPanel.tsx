import { KeyRound, RotateCw, Shell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { oceanApi, useOceanData } from '../../../shared/api/learnerOcean';

type Enrollment = { id:string; contextId:string|null; className:string; school:string; schoolYear:string; status:string; archived:boolean };
const statusLabels: Record<string,string> = {
  active:'Đã được cô xác nhận', pending:'Chờ cô xác nhận',
  ended:'Đã kết thúc theo học', rejected:'Yêu cầu chưa được duyệt',
};

export function ClassMembershipPanel({activeContext,onChange,inviteCode}:{activeContext:string|null;onChange:()=>void;inviteCode?:string}) {
  const enrollments = useOceanData<{items:Enrollment[]}>('enrollments','',true);
  const [code,setCode] = useState(inviteCode?.slice(0,32)||'');
  const inviteInput = useRef<HTMLInputElement>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const [joining,setShowForm] = useState(Boolean(inviteCode));
  const [showHistory,setShowHistory] = useState(false);
  const items = enrollments.data?.items ?? [];
  const current = items.filter(item => !item.archived && ['active','pending'].includes(item.status));
  const history = items.filter(item => !current.includes(item));
  useEffect(()=>{
    if (inviteCode) inviteInput.current?.focus();
  },[inviteCode]);

  async function submit(path:string,data:unknown) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await oceanApi<{status?:string}>(path,{method:'POST',body:JSON.stringify(data)});
      if (path === 'join-class') {
        setCode('');
        setShowForm(false);
        setMessage(result.status === 'active' ? 'Bé đã được xác nhận vào lớp này.' : 'Đã gửi yêu cầu. Bé chờ cô xác nhận nhé.');
        if (result.status === 'active') onChange();
      } else {
        setMessage('Đã chọn lớp ghi nhận hoạt động mới.');
        onChange();
      }
      enrollments.reload();
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function renderEnrollment(item:Enrollment) {
    const recording = item.contextId === activeContext && !item.archived && item.status === 'active';
    return <li key={item.id} className="profile-membership-row">
      <span><b>{item.className}</b><small>{item.school} · {item.schoolYear}</small></span>
      <strong data-status={item.archived?'archived':item.status}>{recording ? 'Đang ghi nhận hoạt động' : item.archived ? 'Lớp đã lưu trữ' : statusLabels[item.status]}</strong>
      {item.status==='active'&&!item.archived&&item.contextId&&!recording&&
        <button className="profile-secondary" disabled={busy} onClick={()=>void submit('active-class',{contextId:item.contextId})}>Ghi hoạt động mới vào lớp này</button>}
    </li>;
  }

  return <section className="profile-journey-card profile-membership" data-profile-card="membership" aria-labelledby="profile-membership-heading">
    <div className="profile-membership-header">
      <div className="profile-membership-title"><span><Shell aria-hidden="true"/></span><div>
        <h3 id="profile-membership-heading">Lớp của bé</h3>
      </div></div>
      <button className="profile-link" disabled={busy} aria-controls="profile-join-form" aria-expanded={joining} onClick={()=>setShowForm(!joining)}>
        <KeyRound size={17} aria-hidden="true"/>{joining?'Thu gọn ô nhập mã':'Tham gia bằng mã'}
      </button>
    </div>
    <form id="profile-join-form" hidden={!joining} onSubmit={event=>{event.preventDefault();void submit('join-class',{code:code.trim().toLowerCase()});}}>
      <label>Mã tham gia lớp<input className="profile-input" ref={inviteInput} value={code} onChange={event=>setCode(event.target.value)} minLength={6} maxLength={32} required disabled={busy} autoCapitalize="characters" spellCheck={false}/></label>
      <button className="profile-primary" disabled={busy}>Gửi yêu cầu vào lớp</button>
    </form>
    {current.length>0&&<ul className="profile-membership-items">{current.map(renderEnrollment)}</ul>}
    {history.length>0&&<><button className="profile-link" aria-expanded={showHistory} onClick={()=>setShowHistory(!showHistory)}>Lịch sử tham gia · {history.length}</button>
      {showHistory&&<ul className="profile-membership-items">{history.map(renderEnrollment)}</ul>}</>}
    {current.some(item=>item.status==='pending')&&<button className="profile-link" aria-disabled={enrollments.loading||busy} onClick={()=>{
      if (!enrollments.loading&&!busy) {enrollments.reload();onChange();}
    }}><RotateCw size={16} aria-hidden="true"/>Cập nhật trạng thái lớp</button>}
    {enrollments.loading&&<p role="status">Đang cập nhật lớp…</p>}
    {enrollments.error&&<p role="alert">{enrollments.error} <button className="profile-link" onClick={enrollments.reload}>Thử lại</button></p>}
    {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
  </section>;
}
