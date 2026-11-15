import { useState } from 'react';
import { ProfileSelect } from './ProfileFields';
import { ArrowRight, BookOpen, Gamepad2, Palette, LockKeyhole, Check, Award, Route } from 'lucide-react';
import type { ProfileEvidence, ProfileBadge, ProfileRecord } from '@bluesteam/contracts';
import { useRouter } from '../../../app/router';
import { ProfileDialog } from './ProfileDialog';
import { ProfileRecordsDialog } from './ProfileRecordsDialog';
import './profile-evidence.css';

const families = { explore:'Khám phá', interact:'Tương tác', create:'Sáng tạo' };
const icons = { explore:BookOpen, interact:Gamepad2, create:Palette };
const art = '/assets/generated/profile/dive-log/';
const date = (value:string) => new Date(value).toLocaleDateString('vi-VN');

export function ProfilePages({ total, size, page, onPage }: { total:number; size:number; page:number; onPage:(value:number)=>void }) {
  if (total <= size) return null;
  return <nav className="profile-pages" aria-label="Phân trang">
    <button type="button" disabled={page===0} onClick={()=>onPage(page-1)}>Trước</button>
    <span role="status">{page*size+1}–{Math.min((page+1)*size,total)} / {total}</span>
    <button type="button" disabled={(page+1)*size>=total} onClick={()=>onPage(page+1)}>Tiếp</button>
  </nav>;
}

function Medallion({badge}:{badge:ProfileBadge}) {
  return <span className="badge-medallion" data-earned={!!badge.earnedAt}>
    <img src={art+(badge.artwork||'first-species.webp')} alt="" loading="lazy"/><span>{badge.target}</span>
    {badge.earnedAt?<Check className="badge-status" aria-hidden="true"/>:<LockKeyhole className="badge-status" aria-hidden="true"/>}
  </span>;
}

export function BadgeCollection({ badges, scopeLabel, teacher }: { badges:ProfileBadge[]; scopeLabel?:string; teacher?:boolean }) {
  const [open,setOpen] = useState(false);
  const earned=badges.filter(badge=>badge.earnedAt).sort((a,b)=>b.earnedAt!.localeCompare(a.earnedAt!));
  return <section className="evidence-panel evidence-badges" data-profile-card="achievement">
    <h3><Award aria-hidden="true"/>Thành tích</h3>
    <p className="evidence-total"><strong>{earned.length}</strong> / {badges.length} huy hiệu đã đạt</p>
    {earned.length ? <ul className="badge-preview-list">{earned.slice(0,3).map(badge=>
      <li key={badge.id}><Medallion badge={badge}/><span>{badge.title}</span></li>
    )}</ul> : <p>Huy hiệu đầu tiên sẽ xuất hiện khi bé đạt một mốc hoạt động.</p>}
    <button className="evidence-link" aria-haspopup="dialog" onClick={()=>setOpen(true)}>Xem tất cả huy hiệu →</button>
    {open&&<ProfileDialog title="Bộ sưu tập huy hiệu" icon={<Award/>} wide className="profile-badge-dialog" onClose={()=>setOpen(false)}>
      <BadgeAlbum badges={badges} scopeLabel={scopeLabel} teacher={teacher}/>
    </ProfileDialog>}
  </section>;
}

function BadgeAlbum({badges,scopeLabel,teacher}:{badges:ProfileBadge[];scopeLabel?:string;teacher?:boolean}) {
  const [status,setStatus] = useState('all');
  const [family,setFamily] = useState('all');
  const [selected,setSelected] = useState<string>();
  const [page,setPage] = useState(0);
  const earned=badges.filter(badge=>badge.earnedAt).length;
  const visible=badges.filter(badge=>(family==='all'||badge.family===family)&&(status==='all'||(status==='earned'?!!badge.earnedAt:!badge.earnedAt)));
  const size=9;
  const tiles=visible.slice(page*size,(page+1)*size);
  const current=tiles.find(badge=>badge.id===selected)||tiles[0];
  function selectBadge(id:string) {
    setSelected(id);
    if (window.matchMedia('(max-width: 900px)').matches) requestAnimationFrame(()=>{
      document.getElementById('profile-badge-detail')?.focus();
    });
  }
  return <div className="badge-album">
    {scopeLabel&&<p className="badge-scope"><Award size={17} aria-hidden="true"/> {scopeLabel}</p>}
    <div className="badge-filters" role="group" aria-label="Lọc theo trạng thái">
      {[['all','Tất cả',badges.length],['earned','Đã nhận',earned],['locked','Đang tiến tới',badges.length-earned]].map(([key,label,count])=>
        <button key={key} type="button" aria-pressed={status===key} onClick={()=>{setStatus(String(key));setPage(0);}}>
          {key==='earned'&&<Check aria-hidden="true"/>}{key==='locked'&&<LockKeyhole aria-hidden="true"/>}{label} · {count}
        </button>)}
      <ProfileSelect className="badge-family-filter" label="Nhóm huy hiệu" value={family}
        options={[{value:'all',label:'Tất cả nhóm'},...Object.entries(families).map(([value,label])=>({value,label}))]}
        onChange={value=>{setFamily(value);setPage(0);}} />
    </div>
    <div className="badge-album-layout"><div className="badge-family-list" id="profile-badge-list" tabIndex={-1}>
      {Object.entries(families).map(([group,label])=>{
        const items=tiles.filter(badge=>badge.family===group);
        const Icon=icons[group as keyof typeof icons];
        return !!items.length&&<section className="badge-family" key={group} data-family={group}><h4><Icon aria-hidden="true"/>{label}</h4>
          <div className="badge-grid">{items.map(badge=><button className="badge-tile" key={badge.id} data-earned={!!badge.earnedAt}
            aria-pressed={current?.id===badge.id} onClick={()=>selectBadge(badge.id)}>
            <Medallion badge={badge}/><strong>{badge.title}</strong><span>{badge.target} {badge.unit}</span>
            <span className="badge-progress" data-earned={!!badge.earnedAt}>{badge.earnedAt?'Đã nhận · '+date(badge.earnedAt):`${Math.min(badge.count,badge.target)}/${badge.target}`}</span>
          </button>)}</div>
        </section>;
      })}
      {!tiles.length&&<p>Chưa có huy hiệu phù hợp.</p>}
      <ProfilePages total={visible.length} size={size} page={page} onPage={setPage}/>
    </div>
    {current&&<aside id="profile-badge-detail" tabIndex={-1} className="badge-detail" aria-label="Chi tiết huy hiệu">
      <button className="evidence-link badge-back" onClick={()=>document.getElementById('profile-badge-list')?.focus()}>↑ Về danh sách huy hiệu</button>
      <Medallion badge={current}/><h5>{current.title}</h5>
      <p className="badge-detail-status" data-earned={!!current.earnedAt}>{current.earnedAt?'Đã nhận':'Đang tiến tới'}</p>
      <dl><dt>Cách nhận</dt><dd>{current.target} {current.unit}.</dd>
        {scopeLabel&&<><dt>Ghi nhận trong</dt><dd>{scopeLabel}</dd></>}
        <dt>{current.earnedAt?'Ngày nhận':'Đã ghi nhận'}</dt><dd>{current.earnedAt?date(current.earnedAt):`${Math.min(current.count,current.target)}/${current.target}`}</dd></dl>
      {!!current.evidence?.length&&<><h5>Minh chứng</h5><ul className="badge-evidence">{current.evidence.map(item=><li key={item.id}>
        {item.href&&!teacher?<a href={item.href}>{item.title}</a>:<strong>{item.title}</strong>}<time dateTime={item.at}>{date(item.at)}</time></li>)}</ul></>}
    </aside>}
    </div>
  </div>;
}


export function ProfileRecordList({title,records,teacher=false,timeline=false,emptyMessage='Chưa có ghi nhận trong lớp này.',layout}:{
  title:string; records:ProfileRecord[]; teacher?:boolean; timeline?:boolean; emptyMessage?:string; layout?:'tiles'|'journal';
}) {
  const [open,setOpen]=useState(false);
  const [preview,setPreview]=useState<ProfileRecord>();
  const { navigate }=useRouter();

  function row(item:ProfileRecord,index:number,compact=false) {
    const Icon=icons[item.family];
    const href=!teacher?item.href:undefined;
    const label = compact && layout === 'journal' ? {
      explore:`Ghi ${item.title} vào sổ`, interact:`Chơi ${item.title}`, create:`Tạo ${item.title}`,
    }[item.family] : item.title;
    const body=<><span className={timeline?'timeline-dot timeline-'+item.family:'evidence-thumb'}>
      {item.image&&!timeline?<img src={item.image} alt="" loading="lazy"/>:<Icon aria-hidden="true"/>}
    </span><span><strong>{label}</strong>{!(compact && layout === 'tiles') && <time dateTime={item.at}>{date(item.at)}</time>}</span></>;
    return <li key={item.family+item.id+':'+index}>
      {href||item.image?<button className="evidence-open-record" onClick={()=>{
        if (href) navigate(href,{preserveQuery:false});
        else {setPreview(item);setOpen(true);}
      }}>{body}</button>:<div className="evidence-open-record">{body}</div>}
    </li>;
  }
  const previewSize=timeline && !layout ? 3 : 2;
  return <><div className={`evidence-records${timeline?' evidence-record-timeline':''}${layout ? ` profile-record-${layout}` : ''}`}>
    {!records.length&&<p>{emptyMessage}</p>}
    <ul>{records.slice(0,previewSize).map((item,index)=>row(item,index,true))}</ul>
    {(records.length>previewSize || (layout==='tiles' && records.length>0))&&<button className="evidence-link" aria-haspopup="dialog" onClick={()=>setOpen(true)}>
      {layout ? <>Xem thêm <ArrowRight size={16} aria-hidden="true"/></> : `Xem danh sách · ${records.length} →`}
    </button>}
  </div>
    {open&&<ProfileRecordsDialog title={title} records={records} mode={timeline?'timeline':records[0]?.family ?? 'explore'}
      initialPreview={preview} onNavigate={teacher?undefined:href=>navigate(href,{preserveQuery:false})}
      onClose={()=>{setOpen(false);setPreview(undefined);}}/>}
  </>;
}

export function ProfileEvidenceView({ evidence, includeSpecies=true, teacher=false, scopeLabel, personal=false }: { evidence:ProfileEvidence;includeSpecies?:boolean;teacher?:boolean;scopeLabel?:string;personal?:boolean }) {
  const lists=[{title:'Sinh vật đã ghi vào sổ',records:evidence.species,Icon:BookOpen,show:includeSpecies},
    {title:'Game đã chơi',records:evidence.games,Icon:Gamepad2,show:true},
    {title:'Sản phẩm đã gửi vào lớp',records:evidence.creations,Icon:Palette,show:!personal}];
  const emptyMessage = personal ? 'Chưa có hoạt động được ghi nhận.' : undefined;
  return <div className="profile-evidence">
    <div className="evidence-summary"><section className="evidence-panel" data-profile-card="progress"><h3><Route aria-hidden="true"/>Tiến trình học tập</h3>
      <img className="evidence-corner-art" src={art+'notebook.webp'} alt=""/>
      <p className="evidence-total"><strong>{evidence.timeline.length}</strong> nội dung có hoạt động</p>
      <div className="evidence-pills"><span>{evidence.species.length} sinh vật</span><span>{evidence.games.length} game</span>{!personal && <span>{evidence.creations.length} sản phẩm</span>}</div>
    </section><BadgeCollection badges={evidence.badges} scopeLabel={scopeLabel} teacher={teacher}/></div>
    <div className="evidence-lists">{lists.filter(list=>list.show).map(({title,records,Icon})=>
      <section className="evidence-panel" key={title} data-profile-card="records"><h3><Icon aria-hidden="true"/>{title}</h3>
        <p className="evidence-total"><strong>{records.length}</strong> nội dung được ghi nhận</p>
        <ProfileRecordList title={title} records={records} teacher={teacher} emptyMessage={emptyMessage}/>
      </section>)}</div>
    <section className="evidence-panel" data-profile-card="journal"><h3><Route aria-hidden="true"/>Hành trình học tập</h3>
      {!personal && <p>Lần đầu ghi nhận từng nội dung trong lớp đang xem.</p>}
      <ProfileRecordList title="Hành trình học tập" records={evidence.timeline} teacher={teacher} timeline emptyMessage={emptyMessage}/>
    </section>
  </div>;
}
