import { useEffect, useRef, useState } from 'react';
import { BarChart3, Eye, Search } from 'lucide-react';
import type { UsageRow } from '@bluesteam/contracts';
import { useRouter } from '@/app/router';
import { TeacherShell } from '@/shared/shells/TeacherShell';
import { InteractiveSeascape } from '@/shared/ui/visuals/InteractiveSeascape';
import { InteractiveWorlds, resolveInteractiveKind } from '@/shared/ui/navigation/InteractiveWorlds';
import { fetchTeacherInteractivePage, fetchInteractiveGroups, type InteractiveGroup } from '@/shared/api/interactiveGroups';
import { fetchTeacherActivityById, fetchPublicModelById, type ActivityDto, type Model3DDto } from '@/shared/api/catalog';
import { ActivityExperience } from '@/shared/activities/ActivityExperience';
import { ActivityThumbnail } from '@/shared/activities/ActivityThumbnail';
import { interactiveMechanicLabel } from '@/shared/data/interactiveArtwork';
import { TeacherUsagePanel } from './TeacherUsagePanel';
import { InteractivePreview } from './InteractivePreview';
import { InteractiveViewSwitch } from './InteractiveViewSwitch';
import './teacher-interactive-curated.css';

export function TeacherInteractivePage() {
  const { query, setQuery } = useRouter();
  const kind = resolveInteractiveKind(query.kind), usage = query.view === 'usage';
  const [search, setSearch] = useState(query.q || '');
  const [items, setItems] = useState<Array<ActivityDto | Model3DDto>>([]);
  const [cursor, setCursor] = useState<string | null>(null), [total, setTotal] = useState(0);
  const [groups, setGroups] = useState<InteractiveGroup[]>([]), [groupsError, setGroupsError] = useState('');
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  const [preview, setPreview] = useState<ActivityDto | Model3DDto | null>(null);
  const [previewError, setPreviewError] = useState(''), [previewBusy, setPreviewBusy] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);
  const moreRequest = useRef<AbortController | null>(null), previewRequest = useRef<AbortController | null>(null);
  useEffect(() => { setSearch(query.q || ''); }, [query.q]);
  useEffect(() => {
    moreRequest.current?.abort();
    if (usage) return;
    const abort = new AbortController();
    setLoading(true); setError(''); setGroupsError(''); setItems([]); setCursor(null); setTotal(0); setGroups([]);
    fetchTeacherInteractivePage({kind,q:query.q,groupId:query.groupId},abort.signal).then(page=>{
      if(!abort.signal.aborted){setItems(page.items);setCursor(page.nextCursor);setTotal(page.total);}
    }).catch(err=>{if(!abort.signal.aborted)setError(err.message||'Chưa tải được thư viện.');})
      .finally(()=>{if(!abort.signal.aborted)setLoading(false);});
    fetchInteractiveGroups(kind,false,undefined,abort.signal).then(page=>{if(!abort.signal.aborted)setGroups(page.items);})
      .catch(()=>{if(!abort.signal.aborted)setGroupsError('Chưa tải được nhóm hoạt động. Cô thử lại nhé.');});
    return()=>{abort.abort();moreRequest.current?.abort();};
  },[kind,query.q,query.groupId,usage,retry]);
  useEffect(()=>{setPreview(null);setPreviewError('');setPreviewBusy(false);previewRequest.current?.abort();},[kind,usage]);
  useEffect(()=>()=>previewRequest.current?.abort(),[]);
  const openPreview = async (item: ActivityDto | Model3DDto | UsageRow) => {
    trigger.current=document.activeElement as HTMLElement;previewRequest.current?.abort();setPreviewError('');
    if(!('contentType' in item)){setPreview(item);return;}
    const abort=new AbortController();previewRequest.current=abort;setPreviewBusy(true);
    try{
      const content=item.contentType==='model3d'?await fetchPublicModelById(item.contentId,abort.signal):await fetchTeacherActivityById(item.contentId,abort.signal);
      if(!abort.signal.aborted)setPreview(content);
    }catch(err){if(!abort.signal.aborted)setPreviewError(err instanceof Error?err.message:'Chưa mở được xem thử. Cô thử lại nhé.');}
    finally{if(!abort.signal.aborted)setPreviewBusy(false);}
  };
  const more=async()=>{
    if(!cursor||loading)return;setLoading(true);setError('');
    const abort=new AbortController();moreRequest.current=abort;
    try{const page=await fetchTeacherInteractivePage({kind,q:query.q,groupId:query.groupId,cursor},abort.signal);if(!abort.signal.aborted){setItems(old=>[...old,...page.items.filter(item=>!old.some(existing=>existing.id===item.id))]);setCursor(page.nextCursor);}}
    catch{if(!abort.signal.aborted)setError('Chưa tải thêm được hoạt động.');}finally{if(!abort.signal.aborted)setLoading(false);}
  };
  return <TeacherShell activeNav="interactive"><InteractiveSeascape scene={`${kind}:${usage}:${query.contentId||''}`} audience="teacher" className={`curated-interactive ${usage?'curated-interactive--trends':''} ${usage&&query.contentId?'curated-interactive--detail':''}`}>
    <div className="curated-interactive__content">
      <div className="curated-interactive__top"><header className="curated-interactive__intro"><h1>Tương tác</h1><p>Hoạt động làm sẵn để cô cùng bé khám phá.</p></header>
        <InteractiveViewSwitch usage={usage} onChange={next=>setQuery({view:next?'usage':null,contentId:null,version:null})}/>
      </div>
      <InteractiveWorlds value={kind} compact={usage} onChange={next=>setQuery({kind:next,contentId:null,version:null,q:null,groupId:null})}/>
      {previewBusy&&<p role="status" className="usage-inline-message">Đang mở xem thử…</p>}{previewError&&<p role="alert" className="usage-inline-error">{previewError}</p>}
      {usage?<TeacherUsagePanel kind={kind} contentId={query.contentId} q={query.q} onPreview={row=>void openPreview(row)}/>:<>
        <div className="curated-interactive__filters"><form onSubmit={event=>{event.preventDefault();setQuery({q:search.trim()||null});}}><Search size={22}/><input aria-label="Tìm hoạt động" placeholder="Tìm hoạt động…" value={search} onChange={event=>setSearch(event.target.value)}/><button type="submit" aria-label="Tìm hoạt động"><Search size={20}/></button></form>
          <label><span className="sr-only">Lọc theo nhóm</span><select aria-label="Lọc theo nhóm" disabled={Boolean(groupsError)} value={query.groupId||''} onChange={event=>setQuery({groupId:event.target.value||null})}><option value="">Tất cả nhóm</option>{groups.map(group=><option value={group.id} key={group.id}>{group.title}</option>)}</select></label><span className="curated-interactive__count">{loading&&!items.length?'Đang tải…':`${total} hoạt động`}</span>
        </div>
        {groupsError&&<p role="alert" className="usage-inline-error">{groupsError}<button onClick={()=>setRetry(value=>value+1)}>Thử lại nhóm</button></p>}
        <section aria-label="Hoạt động trong thư viện" aria-busy={loading}>
          {error&&<div role="alert" className="curated-message">{error}<button onClick={()=>items.length?void more():setRetry(value=>value+1)}>Thử lại</button></div>}
          {loading&&!items.length?<p className="curated-message" role="status">Đang tải thư viện…</p>:!items.length&&!error?<div className="curated-message"><h2>Chưa có hoạt động phù hợp</h2><p>Cô thử tìm tên khác hoặc chọn một khu khác nhé.</p></div>:<div className="curated-interactive__grid">{items.map(item=><article className="curated-card" key={item.id}>
            <ActivityThumbnail content={item} kind={kind}/><div className="curated-card__body"><span className="usage-badge">{'templateKey' in item?interactiveMechanicLabel(item.templateKey):'Mô hình 3D'}</span><h2 title={item.title}>{item.title}</h2><p>{item.description}</p></div>
            <div className="curated-card__actions"><button onClick={()=>{setQuery({view:'usage',contentId:item.id,version:null});window.scrollTo({top:0,behavior:'instant'});}}><BarChart3 size={20}/>Số liệu</button><button onClick={()=>void openPreview(item)}><Eye size={20}/>Xem thử</button></div>
          </article>)}</div>}
          {cursor&&<div className="curated-more"><button disabled={loading} onClick={()=>void more()}>{loading?'Đang tải…':'Xem thêm hoạt động'}</button></div>}
        </section>
      </>}
    </div>
    {preview&&<InteractivePreview title={preview.title} version={preview.version} source={trigger.current} onClose={()=>setPreview(null)}>{close=><ActivityExperience content={preview} context="preview" onBack={close}/>}</InteractivePreview>}
  </InteractiveSeascape></TeacherShell>;
}
export default TeacherInteractivePage;
