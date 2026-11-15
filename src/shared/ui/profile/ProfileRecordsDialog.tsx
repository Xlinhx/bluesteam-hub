import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Award, BookOpen, ChevronLeft, ChevronRight, Gamepad2, Palette, Search } from 'lucide-react';
import type { ProfileRecord } from '@bluesteam/contracts';
import { ProfileDialog } from './ProfileDialog';
import './profile-records-dialog.css';

export type ProfileDialogRecord = ProfileRecord & { learnerName?:string };
const families = {
  explore: { label:'Khám phá', icon:BookOpen },
  interact: { label:'Tương tác', icon:Gamepad2 },
  create: { label:'Sáng tạo', icon:Palette },
};
const date = new Intl.DateTimeFormat('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', timeZone:'Asia/Ho_Chi_Minh' });
const searchKey = (value:string) => value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{Diacritic}/gu,'').replaceAll('đ','d');
const pageSize = 6;

export function ProfileRecordsDialog({ title, records, onClose, mode, thumbnail, onNavigate, initialPreview }: {
  title:string; records:ProfileDialogRecord[]; onClose:()=>void; mode:'timeline'|'badges'|ProfileRecord['family'];
  thumbnail?:(record:ProfileDialogRecord)=>ReactNode;
  onNavigate?:(href:string)=>void;
  initialPreview?:ProfileDialogRecord;
}) {
  const [preview,setPreview] = useState(initialPreview);
  const [query,setQuery] = useState('');
  const [family,setFamily] = useState<'all'|ProfileRecord['family']>('all');
  const [page,setPage] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const previewOpener = useRef<number | 'search' | null>(initialPreview ? 'search' : null);
  const previewScrollTop = useRef(0);
  const term = searchKey(query.trim());
  const filtered = records.filter(item=>(family==='all'||item.family===family) &&
    searchKey(item.title+' '+(item.learnerName ?? '')).includes(term));
  const currentPage = Math.min(page,Math.max(0,Math.ceil(filtered.length/pageSize)-1));
  const start = currentPage*pageSize;
  const end = Math.min(start+pageSize,filtered.length);
  const unit = mode==='timeline'?'hoạt động':mode==='badges'?'huy hiệu':mode==='create'?'sản phẩm':'ghi nhận';
  const Icon = mode==='timeline'?BookOpen:mode==='badges'?Award:families[mode].icon;
  const hasLearnerNames = records.some(item=>item.learnerName);
  const searchLabel = mode==='timeline' ? (hasLearnerNames?'Tìm học sinh hoặc hoạt động':'Tìm hoạt động') : 'Tìm theo tên';

  useLayoutEffect(()=>{
    if (preview) back.current?.focus({preventScroll:true});
    else if (previewOpener.current!==null) {
      const trigger = typeof previewOpener.current==='number'
        ? list.current?.querySelector<HTMLButtonElement>(`[data-record-index="${previewOpener.current}"]`)
        : undefined;
      if (list.current) list.current.scrollTop = previewScrollTop.current;
      (trigger ?? search.current)?.focus({preventScroll:true});
      previewOpener.current = null;
    }
  },[preview]);

  function showPage(next:number) {
    setPage(next);
    list.current?.scrollTo({top:0});
  }

  return <ProfileDialog title={title} icon={<Icon/>} className="profile-records-dialog" onClose={onClose}>
    {preview ? <div className="profile-record-preview">
      <button className="profile-record-back" type="button" ref={back} onClick={()=>setPreview(undefined)}>
        <ArrowLeft aria-hidden="true"/>Về danh sách
      </button>
      <div className="profile-record-preview-caption"><strong>{preview.title}</strong>
        <span>{preview.learnerName&&`${preview.learnerName} · `}{date.format(new Date(preview.at))}</span>
      </div>
      <img src={preview.image!} alt={preview.title}/>
    </div> : <>
      <div className="profile-record-tools">
        <div className="profile-record-search-row">
          <label className="profile-record-search"><Search aria-hidden="true"/>
            <input type="search" ref={search} aria-label={searchLabel} placeholder={mode==='timeline'&&hasLearnerNames?'Tìm bé, hoạt động':searchLabel}
              value={query} onChange={event=>{setQuery(event.target.value);showPage(0);}}/>
          </label>
          <span className="profile-record-count" role="status">{filtered.length} {unit}</span>
        </div>
        {mode==='timeline'&&<div className="profile-record-filters" role="group" aria-label="Nhóm hoạt động">
          <button type="button" aria-pressed={family==='all'} onClick={()=>{setFamily('all');showPage(0);}}>Tất cả</button>
          {(Object.keys(families) as ProfileRecord['family'][]).map(value=>{
            const {icon:FamilyIcon,label} = families[value];
            return <button key={value} type="button" data-family={value} aria-pressed={family===value} onClick={()=>{setFamily(value);showPage(0);}}>
              <FamilyIcon aria-hidden="true"/>{label}
            </button>;
          })}
        </div>}
      </div>
      <div className="profile-record-scroll" ref={list}>
        <ul className="profile-record-items">{filtered.slice(start,end).map((item,index)=>{
          const {icon:FamilyIcon,label} = families[item.family];
          const opens = Boolean((item.href && onNavigate) || (mode!=='badges' && item.image));
          const row = <>
            <span className="profile-record-thumb" data-family={item.family} data-cover={Boolean(item.image && item.family==='create' && mode!=='badges')}>
              {thumbnail ? thumbnail(item) : item.image ? <img src={item.image} alt="" decoding="async"/> : <FamilyIcon aria-hidden="true"/>}
            </span>
            <span className="profile-record-name"><strong>{item.title}</strong>{item.learnerName&&<small>{item.learnerName}</small>}</span>
            <span className="profile-record-kind" data-family={item.family}><FamilyIcon aria-hidden="true"/>{label}</span>
            <time dateTime={item.at}>{date.format(new Date(item.at))}</time>
            {opens&&<ChevronRight className="profile-record-chevron" aria-hidden="true"/>}
          </>;
          return <li key={`${item.family}:${item.id}:${start+index}`}>{opens ?
            <button type="button" className="profile-record-row" data-record-index={index} onClick={()=>{
              if (item.href&&onNavigate) onNavigate(item.href);
              else {
                previewOpener.current = index;
                previewScrollTop.current = list.current?.scrollTop ?? 0;
                setPreview(item);
              }
            }}>{row}</button> : <div className="profile-record-row">{row}</div>}</li>;
        })}</ul>
        {!filtered.length&&<p className="profile-record-empty">{records.length?'Không tìm thấy nội dung phù hợp.':'Chưa có ghi nhận trong phạm vi này.'}</p>}
      </div>
      <footer className="profile-record-footer" aria-label="Phân trang">
        <span>{filtered.length?`${start+1}–${end} / ${filtered.length}`:'0 / 0'}</span>
        {filtered.length>pageSize&&<div>
          <button type="button" disabled={!currentPage} onClick={()=>showPage(currentPage-1)}><ChevronLeft aria-hidden="true"/>Trước</button>
          <button type="button" disabled={end>=filtered.length} onClick={()=>showPage(currentPage+1)}>Tiếp<ChevronRight aria-hidden="true"/></button>
        </div>}
      </footer>
    </>}
  </ProfileDialog>;
}
