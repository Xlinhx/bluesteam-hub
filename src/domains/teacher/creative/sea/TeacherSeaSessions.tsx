import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Copy,Plus} from 'lucide-react';
import {listCreativeSessions,sessionStateLabel,type CreativeSession} from '../../../../shared/api/creativeSessions';
import {CREATIVE_SEA_ENVIRONMENTS as SEA_ENVIRONMENTS} from '@bluesteam/contracts';
import {OpenSeaDialog} from './OpenSeaDialog';
import {focusDialogTrigger} from '../../../../shared/ui/overlays/nativeDialogFocus';

const seaIllustration = '/assets/generated/creative/teacher-sea-paper-reef.webp';
function SeaCounts({session}:{session:CreativeSession}){const c=session.counts;return <dl className="ct-sea-counts">{[[c?.total??session.submissions??0,'đã nhận'],[c?.released??'—','đã thả'],[c?.ready??'—','chờ xem'],[c?.needs_retry??'—','cần gửi lại']].map(([n,label])=><div key={label}><dt>{label}</dt><dd>{n}</dd></div>)}</dl>;}
function SeaThumbnail({session}:{session:CreativeSession}){const env=SEA_ENVIRONMENTS.find(e=>e.id===session.environment_id)||SEA_ENVIRONMENTS[0];return <div className="ct-sea-thumbnail" style={{backgroundImage:`url('${env.preview}')`}} aria-label={`Ảnh xem trước ${session.title}`}>{session.previews?.map((src,i)=><img key={`${src}-${i}`} src={src} alt="" onError={e=>{e.currentTarget.style.visibility='hidden';}}/>)}</div>;}
export function TeacherSeaSessions({onOpen}:{onOpen:(s:CreativeSession)=>void}){
 const openSeaTrigger=useRef<HTMLButtonElement>(null);
 const [data,setData]=useState<{items:CreativeSession[];total:number}>({items:[],total:0}),[offset,setOffset]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState(''),[reload,setReload]=useState(0),[create,setCreate]=useState(false),[copied,setCopied]=useState(false),[activeSession,setActiveSession]=useState<CreativeSession|undefined>();
 useEffect(()=>{const c=new AbortController();setLoading(true);listCreativeSessions(offset,c.signal,'scan').then(r=>{setData(r);if(offset===0)setActiveSession(r.items.find(s=>sessionStateLabel(s)==='Đang nhận'));setError('');}).catch(e=>{if(!c.signal.aborted)setError(e.message);}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return()=>c.abort();},[offset,reload]);
 const active=activeSession,recent=data.items.filter(s=>s.id!==active?.id);
 const openSeaButton = (
  <button ref={openSeaTrigger} className="creative-btn coral ct-open-sea" aria-haspopup="dialog" onClick={event=>{
   focusDialogTrigger(event.currentTarget);
   setCreate(true);
  }}><Plus size={21}/>Mở biển chung</button>
 );
 return <section className="ct-sea-sessions">
 {(error || loading || active) && openSeaButton}
 {error?<p className="creative-error" role="alert">{error}<button className="creative-btn" onClick={()=>setReload(n=>n+1)}>Thử lại</button></p>:loading?<p role="status">Đang mở danh sách biển…</p>:<>
 {active?<article className="ct-active-sea"><img className="ct-sea-hero-art" src={seaIllustration} alt=""/><div className="ct-sea-hero-copy"><h2>{active.title}</h2><span className="ct-state">Đang nhận tranh</span><div className="ct-sea-code-row"><button className="ct-sea-code-box" onClick={async()=>{try{await navigator.clipboard.writeText(active.code);setCopied(true);}catch{setError('Chưa sao chép được mã. Thử lại.');}}} aria-label="Sao chép mã gửi tranh"><small>{copied?'Đã sao chép':'Mã gửi tranh'}</small><strong>{active.code.slice(0,3)} {active.code.slice(3)}</strong><Copy size={21}/></button><div className="ct-sea-expiry"><small>Đến</small><span>{new Date(active.expires_at).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})} · {new Date(active.expires_at).toLocaleDateString('vi-VN')}</span></div></div><SeaCounts session={active}/><button className="creative-btn primary" onClick={()=>onOpen(active)}>Vào biển<ArrowRight size={20}/></button></div></article>:<div className="ct-sea-empty-hero"><img src={seaIllustration} className="ct-sea-hero-art" alt=""/><div className="ct-sea-empty-copy"><h2>Biển đang chờ những người bạn nhỏ</h2><p>Mở một biển, chia sẻ mã để bé gửi tranh.</p>{openSeaButton}</div></div>}
 {recent.length>0&&<div className="ct-recent-seas"><header><h2>Các biển gần đây</h2></header><div className="ct-recent-sea-list">{recent.map(s=><article key={s.id} className="ct-recent-sea"><SeaThumbnail session={s}/><div className="ct-recent-sea-copy"><h3>{s.title}</h3><p>{sessionStateLabel(s)} · {new Date(s.created_at).toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'})}</p><SeaCounts session={s}/></div><button className="creative-btn" onClick={()=>onOpen(s)}>{sessionStateLabel(s)==='Đang nhận'?'Vào biển':'Xem lại'}<ArrowRight size={18}/></button></article>)}</div></div>}
 {data.total>12&&<div className="creative-pagination"><button className="creative-btn" disabled={!offset} onClick={()=>setOffset(n=>Math.max(0,n-12))}>Trước</button><span>Trang {offset/12+1} / {Math.ceil(data.total/12)}</span><button className="creative-btn" disabled={offset+12>=data.total} onClick={()=>setOffset(n=>n+12)}>Sau</button></div>}</>}
 {create&&<OpenSeaDialog onClose={()=>{
  setCreate(false);
  openSeaTrigger.current?.focus({preventScroll:true});
 }} onOpened={onOpen}/>}</section>;
}
