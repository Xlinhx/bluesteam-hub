import {ResourceSeascape,ResourceCurrent} from '../../../shared/ui/visuals/ResourceSeascape';
import { focusDialogTrigger } from '../../../shared/ui/overlays/nativeDialogFocus';
import {ResourceSurface} from '../../../shared/ui/visuals/ResourceSurface';
import { cropImageStyle } from '../../../shared/ui/visuals/resourceCoverCrop';
import './teacher-resources.css';
import '../../../shared/ui/catalog/resource-controls.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useOceanChoreography } from '../../../shared/ui/motion/useOceanChoreography';
import { OceanCabinet } from '../../../shared/ui/visuals/OceanCabinet';
import { ArrowLeft, ArrowRight, Copy, Eye, Folder, Layers, Pencil, Plus, Trash2, Unlink, Waves, Check } from 'lucide-react';
import { useRouter } from '../../../app/router';
import { TeacherShell } from '../../../shared/shells/TeacherShell';
import { fetchTeacherResources, duplicateTeacherResourceApi, updateTeacherResourceApi, deleteTeacherResourceApi, type ResourceDto } from '../../../shared/api/catalog';
import { apiRequest } from '../../../shared/api/client';
import { fetchResourceGroups, fetchResourceGroupById, changeGroupMembers, deleteResourceGroup, duplicateResourceGroup, type ResourceGroup } from '../../../shared/api/resourceGroups';
import { ResourceGroupEditor } from './ResourceGroupEditor';
import { ResourceEditor } from './ResourceEditor';
import { ResourcePicker } from './ResourcePicker';
import { ResourceSearch, ResourceSelect, FORMAT_OPTIONS, VISIBILITY_OPTIONS, CoralMark } from './ResourceControls';
import { ResourceGroupPicker } from './ResourceGroupPicker';
import { ResourcePreview } from './ResourcePreview';
import { ResourceMotion } from './ResourceMotion';
import { ResourceKind } from './ResourceKind';
import { ResourceActionMenu } from './ResourceActionMenu';
import { fetchCurrentTeacherApi } from '../../../shared/api/auth';

export function TeacherResourceLibraryPage() {
  const { query,setQuery } = useRouter();
  const scene = useRef<HTMLDivElement>(null);
  useOceanChoreography(scene, 'teacher');
  const [groups,setGroups] = useState<ResourceGroup[]>([]);
  const [teacherId,setTeacherId] = useState<string|null>(null);
  useEffect(() => { let active=true; void fetchCurrentTeacherApi().then(profile=>{if(active)setTeacherId(profile?.id || null);}); return()=>{active=false;}; },[]);
  const [focusedGroup,setFocusedGroup] = useState<ResourceGroup|null>(null);
  const [groupPage,setGroupPage]=useState(0);
  const [groupTotal,setGroupTotal]=useState(0);
  const [groupsLoading,setGroupsLoading]=useState(true);
  const [groupsError,setGroupsError]=useState('');
  const [groupRetry,setGroupRetry]=useState(0);
  const [choosingTarget,setChoosingTarget]=useState(false);
  const [targetName,setTargetName]=useState('');
  const [groupSearch,setGroupSearch] = useState('');
  const [items,setItems] = useState<ResourceDto[]>([]);
  const [total,setTotal] = useState(0);
  const [catalogCounts,setCatalogCounts] = useState<{all:number;unassigned:number}|null>(null);
  const [cursor,setCursor] = useState<string|null>(null);
  const [history,setHistory] = useState<Array<string|undefined>>([undefined]);
  const [search,setSearch] = useState(query.q || '');
  const [kind,setKind] = useState(query.kind || 'all');
  const [visibility,setVisibility] = useState('all');
  const [notice,setNotice] = useState('');
  const [updatedGroup,setUpdatedGroup] = useState('');
  const [transferAction,setTransferAction] = useState(0);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),5500);return()=>clearTimeout(timer);},[notice]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [revision,setRevision] = useState(0);
  const [selection,setSelection] = useState<string[]>([]);
  const [targetGroup,setTargetGroup] = useState('');
  const [groupEditor,setGroupEditor] = useState<ResourceGroup|true|null>(null);
  const [editor,setEditor] = useState<ResourceDto|true|null>(null);
  const [picker,setPicker] = useState(false);
  const [preview,setPreview] = useState<ResourceDto|null>(null);
  const activeGroup=query.group || 'all';
  const selectedGroup=(focusedGroup?.id===activeGroup ? focusedGroup : null) || groups.find(g=>g.id===activeGroup);
  const ownedGroup=selectedGroup && selectedGroup.ownerId===teacherId;

  const refresh=()=>setRevision(v=>v+1);
  useEffect(()=>{const abort=new AbortController();
    Promise.all([fetchTeacherResources({kind:'supported',limit:1},abort.signal),fetchTeacherResources({kind:'supported',groupId:'unassigned',limit:1},abort.signal)])
      .then(([all,unassigned])=>{if(!abort.signal.aborted)setCatalogCounts({all:all.total,unassigned:unassigned.total});}).catch(()=>{});
    return()=>abort.abort();
  },[revision]);
  useEffect(()=>{if(!updatedGroup)return;const timer=setTimeout(()=>setUpdatedGroup(''),1100);return()=>clearTimeout(timer);},[updatedGroup]);
  useEffect(()=>{
    if(activeGroup==='all'||activeGroup==='unassigned')return;
    const abort=new AbortController();
    fetchResourceGroupById(activeGroup,true,abort.signal).then(setFocusedGroup).catch(err=>{if(!abort.signal.aborted)setError(err.message);});
    return()=>abort.abort();
  },[activeGroup,revision]);
  useEffect(()=>{
    const abort=new AbortController();
    setGroupsLoading(true);setGroupsError('');
    const timer=setTimeout(()=>{
      fetchResourceGroups({teacher:true,q:groupSearch,cursor:String(groupPage*6),limit:6},abort.signal).then(page=>{if(!abort.signal.aborted){setGroups(page.items);setGroupTotal(page.total);if(!page.items.length && groupPage>0)setGroupPage(n=>n-1);}})
        .catch(err=>{if(!abort.signal.aborted)setGroupsError(err.message);}).finally(()=>{if(!abort.signal.aborted)setGroupsLoading(false);});
    },200);
    return()=>{clearTimeout(timer);abort.abort();};
  },[groupSearch,groupPage,groupRetry,revision]);
  useEffect(()=>{setHistory([undefined]);setSelection([]);},[activeGroup,search,kind,visibility]);
  useEffect(()=>{
    const abort=new AbortController();setLoading(true);setError('');
    const timer=setTimeout(()=>{
      fetchTeacherResources({groupId:activeGroup==='all'?undefined:activeGroup,q:search,kind:kind==='all'?'supported':kind,visibility,cursor:history[history.length-1],limit:12},abort.signal)
        .then(page=>{if(!abort.signal.aborted){setItems(page.items);setTotal(page.total);setCursor(page.nextCursor);if(!page.items.length && history.length>1)setHistory(prev=>prev.slice(0,-1));}})
        .catch(err=>{if(!abort.signal.aborted){setItems([]);setError(err.message);}})
        .finally(()=>{if(!abort.signal.aborted)setLoading(false);});
    },250);
    return()=>{clearTimeout(timer);abort.abort();};
  },[activeGroup,search,kind,visibility,history,revision]);
  const run=async(action:()=>Promise<void>)=>{if(busy)return;setBusy(true);setError('');try{await action();}catch(err){setError(err instanceof Error?err.message:'Thao tác chưa hoàn tất.');}finally{setBusy(false);}};
  const openEdit=async(item:ResourceDto)=>{
    const detail=await apiRequest<ResourceDto>(`/api/v1/teacher/resources/${item.id}`);
    setEditor(detail);
  };
  const selectGroup=(id:string)=>{setNotice('');setUpdatedGroup('');setTargetGroup('');setTargetName('');setChoosingTarget(false);setQuery({group:id,q:null,kind:null});setSearch('');setKind('all');};
  const title=selectedGroup?.title || (activeGroup==='unassigned'?'Chưa phân nhóm':'Tất cả học liệu');
  // Overlay state does not change the catalog beneath it. Reuse that subtree
  // rather than reconciling every row and SVG during the opening tap.
  const catalog = useMemo(() => <>
    <aside className="teacher-resource-sidebar" aria-label="Nhóm học liệu">
      <ResourceSurface variant="index"/>
      <header><h1>Nhóm học liệu</h1><button aria-haspopup="dialog" aria-label="Tạo nhóm học liệu" onClick={event=>{focusDialogTrigger(event.currentTarget);setGroupEditor(true);}}><Plus size={23}/></button></header>
      <ResourceSearch label="Tìm nhóm" placeholder="Tìm nhóm…" value={groupSearch} onChange={value=>{setGroupSearch(value);setGroupPage(0);}}/>
      <nav className="teacher-resource-shortcuts"><button aria-current={activeGroup==='all'?'page':undefined} onClick={()=>selectGroup('all')}><Layers size={24}/>Tất cả học liệu{catalogCounts && <span className="teacher-group-count">{catalogCounts.all}</span>}</button><button aria-current={activeGroup==='unassigned'?'page':undefined} onClick={()=>selectGroup('unassigned')}><Folder size={24}/>Chưa phân nhóm{catalogCounts && <span className="teacher-group-count">{catalogCounts.unassigned}</span>}</button></nav>
      <nav className="teacher-resource-groups" aria-label="Danh sách nhóm" aria-busy={groupsLoading}>{groups.map(g=><button key={g.id} data-ocean-action="group" data-group-id={g.id} aria-current={activeGroup===g.id?'page':undefined} disabled={groupsLoading} onClick={()=>selectGroup(g.id)}>{g.coverUrl?<span className="teacher-group-cover"><img src={g.coverUrl} alt="" style={cropImageStyle(g.coverCrop)}/></span>:<Waves size={36}/>}<span>{g.title}</span><span className="teacher-group-count" data-updated={updatedGroup===g.id}>{g.memberCount}</span></button>)}{groupsLoading && !groups.length && <p role="status">Đang tìm nhóm…</p>}{groupsError && <p role="alert">{groupsError} <button onClick={()=>setGroupRetry(n=>n+1)}>Thử lại</button></p>}{!groupsLoading&&!groupsError&&!groups.length&&<p>Chưa có nhóm phù hợp.</p>}</nav>
      <nav className="teacher-group-pagination" aria-label="Phân trang nhóm">{groupTotal>6 && <><span>{groupPage+1} / {Math.ceil(groupTotal/6)}</span><button aria-label="Trang nhóm trước" disabled={groupsLoading||groupPage===0} onClick={()=>setGroupPage(n=>n-1)}><ArrowLeft size={18}/></button><button aria-label="Trang nhóm sau" disabled={groupsLoading||(groupPage+1)*6>=groupTotal} onClick={()=>setGroupPage(n=>n+1)}><ArrowRight size={18}/></button></>}</nav>
    </aside>
    <section className="teacher-resource-content" aria-label="Quản lý học liệu">
      <header className="teacher-resource-title"><ResourceSurface variant="workspace"/><OceanCabinet variant="workspace"/><div key={activeGroup} className="teacher-resource-title-copy">{selectedGroup?.coverUrl && <span className="teacher-group-cover teacher-group-cover-large"><img src={selectedGroup.coverUrl} alt="" style={cropImageStyle(selectedGroup.coverCrop)}/></span>}<div><h2>{title}</h2><p>{selectedGroup ? selectedGroup.visibility==='published'?'Hiển thị cho bé':'Đã ẩn' : 'Sắp xếp học liệu vào các nhóm để bé dễ khám phá.'}</p></div>{ownedGroup && <button aria-label="Chỉnh sửa nhóm" onClick={event=>{focusDialogTrigger(event.currentTarget);setGroupEditor(selectedGroup);}}><Pencil size={22}/></button>}</div><div className="teacher-resource-title-actions"><button aria-haspopup="dialog" className="resource-primary" onClick={event=>{focusDialogTrigger(event.currentTarget);setEditor(true);}}><Plus size={22}/>Thêm học liệu</button>{selectedGroup && <ResourceActionMenu label="Thao tác nhóm"><button disabled={busy} onClick={()=>void run(async()=>{const copy=await duplicateResourceGroup(selectedGroup.id);refresh();selectGroup(copy.id);})}><Copy size={18}/>Sao chép nhóm</button>{ownedGroup && <button className="resource-text-danger" disabled={busy} onClick={()=>{if(window.confirm(`Xóa nhóm “${title}”? Các học liệu vẫn được giữ.`))void run(async()=>{await deleteResourceGroup(activeGroup);selectGroup('all');refresh();});}}><Trash2 size={18}/>Xóa nhóm</button>}</ResourceActionMenu>}</div></header>
      <div className="teacher-resource-filters"><ResourceSurface variant="tools"/><CoralMark/><ResourceSearch label="Tìm học liệu" placeholder={selectedGroup?'Tìm trong nhóm…':'Tìm học liệu…'} value={search} onChange={value=>{setSearch(value);setQuery({q:value||null},{replace:true});}}/><ResourceSelect label="Định dạng" value={kind} onChange={value=>{setKind(value);setQuery({kind:value});}} options={[{value:'all',label:'Định dạng'},...FORMAT_OPTIONS.map(o=>o.value==='flashcard'?{...o,value:'visual'}:o)]} format/><ResourceSelect label="Trạng thái" value={visibility} onChange={setVisibility} options={[{value:'all',label:'Trạng thái'},...VISIBILITY_OPTIONS]}/><span>{total} học liệu</span>{ownedGroup && <button className="resource-secondary" onClick={()=>setPicker(true)}><Plus size={21}/>Thêm vào nhóm</button>}</div>
      {notice && <p className="resource-save-notice" role="status"><Check size={18}/>{notice}</p>}
      {error && <p role="alert" className="resource-form-error">{error} <button onClick={refresh}>Thử lại</button></p>}
      <div className="teacher-resource-table-wrap" aria-busy={loading} onClickCapture={event=>{if(loading){event.preventDefault();event.stopPropagation();}}} onKeyDownCapture={event=>{if(loading && (event.key==='Enter'||event.key===' ')){event.preventDefault();event.stopPropagation();}}}><table className="teacher-resource-table"><thead><tr><th><input type="checkbox" aria-label="Chọn tất cả học liệu trang này" checked={items.length>0 && items.every(i=>selection.includes(i.id))} onChange={e=>setSelection(prev=>e.target.checked?[...new Set([...prev,...items.map(i=>i.id)])]:prev.filter(id=>!items.some(i=>i.id===id)))}/></th><th>Học liệu</th><th>Định dạng</th><th>Hiển thị</th><th><span className="sr-only">Thao tác</span></th></tr></thead><tbody>{items.map(item=><tr key={item.id} data-selected={selection.includes(item.id)}><td><input type="checkbox" aria-label={`Chọn ${item.title}`} checked={selection.includes(item.id)} onChange={e=>setSelection(prev=>e.target.checked?[...prev,item.id]:prev.filter(id=>id!==item.id))}/></td><td><button className="teacher-resource-name" aria-haspopup="dialog" onClick={event=>{focusDialogTrigger(event.currentTarget);void run(()=>(item.isSeed || item.ownerId!==teacherId)?apiRequest<ResourceDto>(`/api/v1/teacher/resources/${item.id}`).then(setPreview):openEdit(item));}}>{item.coverUrl ? <img src={item.coverUrl} alt=""/> : <span className="teacher-resource-no-cover" aria-hidden="true"><ResourceKind kind={item.kind} iconOnly/></span>}<span>{item.title}</span></button></td><td data-label="Định dạng"><ResourceKind kind={item.kind}/></td><td data-label="Hiển thị"><span className={`teacher-resource-status status-${item.visibility}`}/>{item.visibility==='published'?'Đang hiện':'Đã ẩn'}</td><td><div className="teacher-resource-row-actions"><button aria-label={`Xem ${item.title}`} aria-haspopup="dialog" onClick={event=>{focusDialogTrigger(event.currentTarget);void run(async()=>setPreview(await apiRequest<ResourceDto>(`/api/v1/teacher/resources/${item.id}`)));}}><Eye size={21}/></button><ResourceActionMenu label={`Thao tác ${item.title}`}>{!item.isSeed && item.ownerId===teacherId && <button onClick={()=>void run(()=>openEdit(item))}><Pencil size={18}/>Chỉnh sửa</button>}<button aria-label={`Sao chép ${item.title}`} onClick={()=>void run(async()=>{const copy=await duplicateTeacherResourceApi(item.id);refresh();setEditor(copy);})}><Copy size={19}/>Sao chép</button>{!item.isSeed && Boolean(teacherId) && item.ownerId===teacherId && <><button aria-label={`${item.visibility==='hidden'?'Hiện lại':'Ẩn'} ${item.title}`} onClick={()=>void run(async()=>{await updateTeacherResourceApi(item.id,{visibility:item.visibility==='hidden'?'published':'hidden'});refresh();})}>{item.visibility==='hidden'?'Hiện lại':'Ẩn'}</button>{item.visibility==='hidden' && <button aria-label={`Xóa ${item.title}`} onClick={()=>{if(window.confirm(`Xóa học liệu “${item.title}”?`))void run(async()=>{await deleteTeacherResourceApi(item.id);refresh();});}}><Trash2 size={19}/>Xóa học liệu</button>}</>}</ResourceActionMenu></div></td></tr>)}</tbody></table>{loading && <p className={items.length?'teacher-resource-updating':'teacher-resource-empty'} role="status">Đang tải học liệu…</p>}{!loading && !items.length && <p className="teacher-resource-empty">{error?'Chưa tải được dữ liệu.':'Chưa có học liệu phù hợp.'}</p>}</div>
      {selection.length>0 && <div className="teacher-resource-bulk"><strong>Đã chọn {selection.length}</strong><button type="button" className="resource-target-trigger" aria-expanded={choosingTarget} onClick={()=>setChoosingTarget(v=>!v)}>{targetName || 'Chọn nhóm nhận'}</button>{choosingTarget && <div className="resource-bulk-group-picker"><ResourceGroupPicker selectedIds={targetGroup?[targetGroup]:[]} excludeId={activeGroup} onClose={()=>setChoosingTarget(false)} onToggle={group=>{setTargetGroup(group.id);setTargetName(group.title);setChoosingTarget(false);}}/></div>}<button data-resource-transfer disabled={!targetGroup || busy} onClick={()=>void run(async()=>{await changeGroupMembers(targetGroup,selection);setNotice(`Đã thêm ${selection.length} học liệu vào ${targetName || 'nhóm'}.`);setUpdatedGroup(targetGroup);setTransferAction(n=>n+1);setSelection([]);refresh();})}><Folder size={20}/>Thêm vào nhóm khác</button>{ownedGroup && <><button data-resource-transfer disabled={!targetGroup || busy} onClick={()=>void run(async()=>{await changeGroupMembers(targetGroup,selection,false,activeGroup);setNotice(`Đã chuyển ${selection.length} học liệu.`);setUpdatedGroup(targetGroup);setTransferAction(n=>n+1);setSelection([]);refresh();})}><ArrowRight size={20}/>Chuyển nhóm</button><button className="resource-text-danger" disabled={busy} onClick={()=>void run(async()=>{await changeGroupMembers(activeGroup,selection,true);setNotice(`Đã gỡ ${selection.length} học liệu khỏi nhóm. Học liệu vẫn được giữ.`);setSelection([]);refresh();})}><Unlink size={20}/>Bỏ khỏi nhóm</button></>}</div>}
      <div className="teacher-resource-pagination"><span>{total?`${(history.length-1)*12+1} – ${Math.min(history.length*12,total)} / ${total}`:'0 học liệu'}</span><div><button aria-label="Trang trước" disabled={history.length===1 || loading} onClick={()=>setHistory(prev=>prev.slice(0,-1))}><ArrowLeft size={20}/></button><span className="teacher-resource-page-current" aria-current="page" aria-label={`Trang ${history.length}`}>{history.length}</span><button aria-label="Trang sau" disabled={!cursor || loading} onClick={()=>setHistory(prev=>[...prev,cursor!])}><ArrowRight size={20}/></button></div></div>
    </section>
  </>, [groups, teacherId, focusedGroup, groupPage, groupTotal, groupsLoading, groupsError, groupSearch, items, total, catalogCounts, cursor, history, search, kind, visibility, notice, updatedGroup, loading, error, busy, selection, targetGroup, targetName, choosingTarget, activeGroup, selectedGroup, ownedGroup, title, setQuery]);
  return <TeacherShell activeNav="resources"><div ref={scene} className="teacher-resource-library"><ResourceSeascape tone="teacher" sceneKey={activeGroup}/><ResourceCurrent/><ResourceMotion groupId={activeGroup} success={notice} targetGroup={updatedGroup} actionId={transferAction}/>{catalog}
    {groupEditor && <ResourceGroupEditor group={groupEditor===true?undefined:groupEditor} onClose={()=>setGroupEditor(null)} onSaved={id=>{setGroupEditor(null);refresh();setGroupSearch('');setGroupPage(0);selectGroup(id);}}/>}
    {editor && <ResourceEditor key={editor===true?'new':editor.id} item={editor===true?undefined:editor} initialGroupId={editor===true && ownedGroup?activeGroup:undefined} onClose={()=>setEditor(null)} onSaved={async()=>{setEditor(null);refresh();}}/>}
    {picker && selectedGroup && <ResourcePicker groupId={selectedGroup.id} groupTitle={selectedGroup.title} onClose={()=>setPicker(false)} onChoose={async chosen=>{await changeGroupMembers(selectedGroup.id,chosen.map(i=>i.id));setPicker(false);setNotice(`Đã thêm ${chosen.length} học liệu vào nhóm.`);setUpdatedGroup(selectedGroup.id);setTransferAction(n=>n+1);refresh();}}/>}
    {preview && <ResourcePreview resource={preview} onClose={()=>setPreview(null)}/> }
  </div></TeacherShell>;
}
