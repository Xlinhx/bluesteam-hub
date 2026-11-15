import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { Circle, CircleDot, Plus, Unlink, Eye, X } from 'lucide-react';
import { createTeacherResourceApi, updateTeacherResourceApi, type ResourceDto, type ResourceVariantLink } from '../../../shared/api/catalog';
import { apiRequest, uploadTeacherMediaFile } from '../../../shared/api/client';
import { ResourceAssetField } from './ResourceAssetField';
import { ResourceDrawingChoice } from './ResourceDrawingChoice';
import { ResourcePreview } from './ResourcePreview';
import { isVisual, coverFromResource, mediaFromResource, readAlbum, validateResourceDraft, validateUpload, compatibleMedia, MAX_ALBUM_IMAGES, type AuthoringMedia } from './resourceAuthoring';
import { ResourceDialog } from './ResourceDialog';
import { ResourceSelect, ResourceSearch, FORMAT_OPTIONS, VISIBILITY_OPTIONS } from './ResourceControls';
import { ResourceGroupPicker } from './ResourceGroupPicker';
import { ResourcePicker } from './ResourcePicker';
import { RESOURCE_KIND_LABELS, ResourceKind } from './ResourceKind';
import { getLinkedChoices, preferLinkedChoice } from '../../../shared/api/resourceLinks';
import { cropImageStyle } from '../../../shared/ui/visuals/resourceCoverCrop';
import { type ResourceGroup } from '../../../shared/api/resourceGroups';
import { nativeDialogFocus, focusDialogTrigger } from '../../../shared/ui/overlays/nativeDialogFocus';

export function ResourceEditor({ item, initialGroupId, onClose, onSaved }: { item?: ResourceDto; initialGroupId?: string; onClose: () => void; onSaved: (item: ResourceDto) => Promise<void> }) {
  const [fieldsReady, setFieldsReady] = useState(typeof document === 'undefined');
  useEffect(() => {
    // Paint the actual title input and modal first. The longer authoring fields
    // must not all participate in showModal's synchronous focus/layout pass.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => { timer = setTimeout(() => setFieldsReady(true), 0); });
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, []);
  const [id, setId] = useState(item?.id);
  const [title,setTitle] = useState(item?.title || '');
  const [kind,setKind] = useState<ResourceDto['kind']>(item?.kind || 'flashcard');
  const [description,setDescription] = useState(item?.description || '');
  const [narration,setNarration] = useState(item?.content.narrationText || '');
  const [facts,setFacts] = useState(item?.content.shortFacts || []);
  const [visibility,setVisibility] = useState(item?.visibility==='published'?'published':'hidden');
  const [cover,setCover] = useState<AuthoringMedia|null>(coverFromResource(item));
  const [media,setMedia] = useState<AuthoringMedia|null>(mediaFromResource(item));
  const [album,setAlbum] = useState<AuthoringMedia[]>(isVisual(kind)?readAlbum(item):[]);
  const [template,setTemplate] = useState(item?.content.drawingTemplateKey || '');
  const [preview,setPreview] = useState(false);
  const [fieldError,setFieldError] = useState<{field:string;message:string}|null>(null);
  const [links,setLinks] = useState<ResourceVariantLink[]>((item?.variants || []).filter(v=>!item?.editableVariantIds || item.editableVariantIds.includes(v.id)));
  const [groupIds,setGroupIds] = useState(item?.groups?.filter(g=>g.canEdit).map(g=>g.id) || (initialGroupId?[initialGroupId]:[]));
  const [groups,setGroups] = useState<ResourceGroup[]>([]);
  const [tab,setTab] = useState('content');
  const [choosingGroups,setChoosingGroups] = useState(false);
  const tabId=useId();
  const [picker,setPicker] = useState(false);
  const [linkSearch,setLinkSearch]=useState('');
  const [linkKind,setLinkKind]=useState('all');
  const [newLinks,setNewLinks]=useState<string[]>([]);
  useEffect(()=>{if(!newLinks.length)return;const timer=setTimeout(()=>setNewLinks([]),900);return()=>clearTimeout(timer);},[newLinks]);
  const [dirty,setDirty] = useState(false);
  const [busy,setBusy] = useState(false);
  const [uploading,setUploading] = useState('');
  const [error,setError] = useState('');
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(()=>{if(error)errorRef.current?.scrollIntoView({block:'center',behavior:'instant'});},[error]);
  const uploadRef = useRef<AbortController | null>(null);
  useEffect(() => () => uploadRef.current?.abort(), []);
  useEffect(()=>{const abort=new AbortController();Promise.all(groupIds.map(id=>import('../../../shared/api/resourceGroups').then(api=>api.fetchResourceGroupById(id,true,abort.signal)))).then(values=>{if(!abort.signal.aborted)setGroups(values);}).catch(()=>{});return()=>abort.abort();},[]);
  const visibleLinks=links.filter(link=>(linkKind==='all'||link.kind===linkKind) && link.title.toLocaleLowerCase('vi').includes(linkSearch.toLocaleLowerCase('vi'))).sort((a,b)=>FORMAT_OPTIONS.findIndex(o=>o.value===a.kind)-FORMAT_OPTIONS.findIndex(o=>o.value===b.kind));
  const beforeClose = () => !dirty || window.confirm('Bỏ thay đổi chưa lưu của học liệu?');
  const close = () => { if(busy)return; uploadRef.current?.abort(); onClose(); };
  const locked=busy || Boolean(uploading);
  const primary=isVisual(kind)?album[0] || null:media;
  const coverUrl=cover?.url || (isVisual(kind)?album[0]?.url:media?.mimeType?.startsWith('image/')?media.url:null) || null;
  const reportField=(field:string,message:string)=>{setFieldError({field,message});setTab('content');setTimeout(()=>{const node=document.querySelector<HTMLElement>(`[data-editor-field="${field}"]`);node?.scrollIntoView({block:'center',behavior:'instant'});node?.focus();},50);};
  const changeKind=(value:string)=>{
    if(locked)return;
    const next=value as ResourceDto['kind'];
    const old=isVisual(kind)?album:media?[media]:[];
    const incompatible=old.some(asset=>!compatibleMedia(asset,next)) || (isVisual(kind)&&!isVisual(next)&&album.length>1);
    if(incompatible && !window.confirm('Định dạng mới không dùng được toàn bộ file hiện tại. Bỏ các file nội dung này để đổi định dạng? Ảnh bìa, chữ và liên kết vẫn được giữ.'))return;
    if(isVisual(next)){setAlbum(incompatible?[]:old);setMedia(null);}else{setMedia(incompatible?null:old[0]||null);setAlbum([]);}
    setKind(next);setFieldError(null);setDirty(true);
  };
  const upload = async (files:File[],target:'cover'|'media') => {
    if(!files.length || locked)return;
    const uploadKind=target==='cover'?'cover':kind;
    if(target==='media' && isVisual(kind) && album.length+files.length>MAX_ALBUM_IMAGES){reportField(target,'Mỗi thẻ tối đa 8 ảnh. Hãy bớt ảnh trước khi tải thêm.');return;}
    for(const file of files){const message=validateUpload(file,uploadKind);if(message){reportField(target,`${file.name}: ${message}`);return;}}
    const abort=new AbortController();uploadRef.current=abort;setFieldError(null);setError('');setUploading(target);
    try{for(let index=0;index<files.length;index++){
      const file=files[index];setUploading(`${target}:${index+1}/${files.length}`);
      const result=await uploadTeacherMediaFile(file,abort.signal);if(abort.signal.aborted)return;
      const asset:AuthoringMedia={id:result.id,url:result.url,name:file.name,byteSize:result.byteSize,mimeType:result.mimeType};
      if(target==='cover')setCover(asset);else if(isVisual(kind))setAlbum(prev=>[...prev,asset]);else setMedia(asset);
      setDirty(true);
    }}catch(err){if(!abort.signal.aborted)reportField(target,err instanceof Error?err.message:'Chưa tải được file. Các file đã tải thành công vẫn được giữ.');}
    finally{if(!abort.signal.aborted)setUploading('');}
  };
  const buildContent=()=>({...item?.content,narrationText:narration.trim(),shortFacts:facts.filter(f=>f.label.trim()).map(f=>({...f,label:f.label.trim(),detail:f.detail?.trim()})),albumUrls:isVisual(kind)?album.map(a=>a.url):[],albumAssets:isVisual(kind)?album:[],albumImages:[],coverOverride:Boolean(cover),mediaDetails:primary?{name:primary.name,byteSize:primary.byteSize,mimeType:primary.mimeType}:undefined,drawingTemplateKey:kind==='coloring'||isVisual(kind)?template:''});
  const previewItem:ResourceDto={...item,id:id||'local-preview',ownerId:item?.ownerId||null,isSeed:false,title:title.trim()||'Học liệu mới',kind,description,content:buildContent(),coverMediaId:cover?.id||null,mediaId:primary?.id||null,coverUrl,mediaUrl:primary?.url||null,mediaMimeType:primary?.mimeType||null,visibility:visibility as 'published'|'hidden',version:item?.version||0,topicSlugs:item?.topicSlugs||[],variants:links,related:item?.related||[]};
  const save = async () => {
    if(busy || uploading)return;
    const issue=validateResourceDraft({title,kind,visibility,hasMedia:Boolean(primary),hasImage:Boolean(album.length||cover),hasTemplate:Boolean(template)});
    if(issue){reportField(issue.field,issue.message);return;}
    setFieldError(null);
    setBusy(true);setError('');
    try {
      if(kind==='coloring' && template && !['blank','turtle','octopus','coral'].includes(template)){
        try {const chosen=await apiRequest<{kind:string}>(`/api/v1/creative-templates/${encodeURIComponent(template)}`);if(chosen.kind!=='drawing')throw Error('Mẫu này không dùng để tô màu.');}
        catch{reportField('template','Mẫu tô này không còn khả dụng. Hãy chọn lại mẫu đã xuất bản.');return;}
      }
      const payload={title:title.trim(),kind,description:description.trim(),coverMediaId:cover?.id || (isVisual(kind)?primary?.id:null) || null,mediaId:primary?.id || null,
        content:buildContent(),visibility:visibility as 'published'|'hidden',topicSlugs:item?.topicSlugs || [], linkedVariantIds:links.map(l=>l.id),groupIds};
      const saved=id ? await updateTeacherResourceApi(id,payload) : await createTeacherResourceApi(payload);
      setId(saved.id);
      await onSaved(saved);
      setDirty(false);
    } catch(err) {setError(err instanceof Error ? err.message:'Không lưu được. Thay đổi vẫn đang ở đây.');}
    finally {setBusy(false);}
  };
  return <><ResourceDialog title={item ? 'Sửa học liệu' : 'Thêm học liệu'} onClose={close} beforeClose={beforeClose} busy={busy} drawer className={!item ? 'resource-create-editor' : ''}>{requestClose => <>
    <div className="resource-editor-identity">{coverUrl ? <img src={coverUrl} alt=""/> : <ResourceKind kind={kind} iconOnly/>}<div><h3>{title || 'Học liệu mới'}</h3><ResourceKind kind={kind}/></div></div>
    <div className="resource-editor-tabs" role="tablist" aria-label="Chỉnh sửa học liệu" onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?'content':e.key==='End'?'links':tab==='content'?'links':'content';setTab(next);e.currentTarget.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)?.focus();}}>{[['content','Nội dung'],['links','Nhóm & liên kết']].map(([key,label])=><button key={key} data-tab={key} role="tab" id={`${tabId}-${key}`} aria-selected={tab===key} aria-controls={`${tabId}-panel`} tabIndex={tab===key?0:-1} onClick={()=>setTab(key)}>{label}</button>)}</div>
    <form noValidate onSubmit={e=>{e.preventDefault();void save();}}><div className="resource-form-body" role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-${tab}`}><fieldset className="resource-editor-fields" disabled={busy}>
      {tab==='content' ? <>
        <label>Tên học liệu<input className="ui-field" ref={nativeDialogFocus} data-editor-field="title" required aria-invalid={fieldError?.field==='title'} aria-describedby={fieldError?.field==='title'?`${tabId}-title-error`:undefined} maxLength={100} value={title} disabled={busy} onChange={e=>{setTitle(e.target.value);setFieldError(null);setDirty(true);}}/></label>
        {fieldsReady ? <>
        {fieldError?.field==='title'&&<p id={`${tabId}-title-error`} role="alert" className="resource-form-error">{fieldError.message}</p>}
        <label>Định dạng<ResourceSelect label="Định dạng học liệu" value={kind} options={FORMAT_OPTIONS} format disabled={locked} onChange={changeKind}/></label>
        <ResourceAssetField kind={kind} assets={isVisual(kind)?album:media?[media]:[]} album={isVisual(kind)} busy={locked} uploading={uploading.startsWith('media')} error={fieldError?.field==='media'?fieldError.message:undefined} onFiles={files=>void upload(files,'media')} onRemove={index=>{if(isVisual(kind))setAlbum(prev=>prev.filter((_,i)=>i!==index));else setMedia(null);setDirty(true);}} onMove={(index,direction)=>{setAlbum(prev=>{const next=[...prev];[next[index],next[index+direction]]=[next[index+direction],next[index]];return next;});setDirty(true);}}/>
        {uploading&&<p role="status">Đang tải file {uploading.split(':')[1]||''}…</p>}
        {kind==='coloring'&&<ResourceDrawingChoice value={template} disabled={locked} onChange={value=>{setTemplate(value);setDirty(true);setFieldError(null);}}/>}
        <details className="resource-optional-cover"><summary>Ảnh bìa riêng (tuỳ chọn)</summary><p className="resource-field-hint">Thẻ hình dùng ảnh đầu tiên làm bìa. Chọn ảnh riêng khi cô muốn đổi hình đại diện.</p><ResourceAssetField kind="cover" assets={cover?[cover]:[]} busy={locked} uploading={uploading.startsWith('cover')} error={fieldError?.field==='cover'?fieldError.message:undefined} onFiles={files=>void upload(files,'cover')} onRemove={()=>{setCover(null);setDirty(true);}}/></details>
        <label>Giới thiệu ngắn<textarea className="ui-field" maxLength={500} value={description} onChange={e=>{setDescription(e.target.value);setDirty(true);}}/></label>
        <label>Lời đọc cho bé<textarea className="ui-field" maxLength={2000} value={narration} onChange={e=>{setNarration(e.target.value);setDirty(true);}}/></label>
        {(kind==='flashcard' || kind==='image') && <fieldset className="resource-facts-editor"><legend>Đặc điểm cho bé</legend>{facts.map((fact,index)=><div key={index}>
          <label>Biểu tượng<ResourceSelect label={`Biểu tượng đặc điểm ${index+1}`} value={fact.iconKey} options={[{value:fact.iconKey,label:'Hiện tại'},...Object.entries({waves:'Sóng biển',claw:'Càng cua',crab:'Con cua',fish:'Cá',shell:'Vỏ sò',home:'Nơi sống',shield:'Bảo vệ',sun:'Mặt trời',heart:'Trái tim',sprout:'Mầm cây',star:'Ngôi sao',sparkles:'Lấp lánh'}).filter(([key])=>key!==fact.iconKey).map(([value,label])=>({value,label}))]} onChange={value=>{setFacts(prev=>prev.map((f,i)=>i===index?{...f,iconKey:value}:f));setDirty(true);}}/></label>
          <label>Đặc điểm {index+1}<input className="ui-field" maxLength={100} value={fact.label} onChange={e=>{setFacts(prev=>prev.map((f,i)=>i===index?{...f,label:e.target.value}:f));setDirty(true);}}/></label>
          <label>Lời giải thích<textarea className="ui-field" maxLength={500} value={fact.detail || ''} onChange={e=>{setFacts(prev=>prev.map((f,i)=>i===index?{...f,detail:e.target.value}:f));setDirty(true);}}/></label>
          <button type="button" className="resource-text-danger" aria-label={`Bỏ đặc điểm ${index+1}`} onClick={()=>{setFacts(prev=>prev.filter((_,i)=>i!==index));setDirty(true);}}>Bỏ đặc điểm</button>
        </div>)}{facts.length<3 && <button type="button" className="resource-secondary" onClick={()=>{setFacts(prev=>[...prev,{iconKey:'waves',label:'',detail:''}]);setDirty(true);}}><Plus size={18}/>Thêm đặc điểm</button>}</fieldset>}
        <label>Hiển thị<ResourceSelect label="Hiển thị học liệu" value={visibility} options={VISIBILITY_OPTIONS} onChange={value=>{setVisibility(value);setDirty(true);}}/></label>
        </> : <p role="status" className="resource-field-hint">Đang mở nội dung…</p>}
      </> : <><fieldset className="resource-editor-groups"><legend>Thuộc nhóm</legend>
        <div className="resource-group-chips">{groupIds.map(groupId=>{const group=groups.find(g=>g.id===groupId);const known=group || item?.groups?.find(g=>g.id===groupId);return <span className="resource-group-chip" key={groupId}>{group?.coverUrl && <span className="resource-group-chip-cover"><img src={group.coverUrl} style={cropImageStyle(group.coverCrop)} alt=""/></span>}<span>{known?.title || 'Nhóm đã chọn'}</span><button type="button" aria-label={`Bỏ khỏi ${known?.title || 'nhóm'}`} onClick={()=>{setGroupIds(prev=>prev.filter(id=>id!==groupId));setDirty(true);}}><X size={18}/></button></span>;})}</div>
        <button type="button" className="resource-secondary" aria-expanded={choosingGroups} onClick={()=>setChoosingGroups(v=>!v)}><Plus size={20}/>Thêm nhóm</button>
        {choosingGroups && <ResourceGroupPicker selectedIds={groupIds} onClose={()=>setChoosingGroups(false)} onToggle={group=>{setGroups(prev=>prev.some(g=>g.id===group.id)?prev:[...prev,group]);setGroupIds(prev=>prev.includes(group.id)?prev.filter(id=>id!==group.id):[...prev,group.id]);setDirty(true);}}/>}
      </fieldset><div className="resource-links-heading"><div><h3>Nội dung đi cùng</h3><p>Bé có thể mở từ trang {title || 'học liệu này'}.</p></div><button type="button" className="resource-secondary" aria-haspopup="dialog" onClick={event=>{focusDialogTrigger(event.currentTarget);setPicker(true);}}><Plus size={20}/>Liên kết học liệu</button></div><div className="resource-link-filters"><ResourceSearch label="Tìm nội dung đã liên kết" placeholder="Tìm nội dung đi cùng…" value={linkSearch} onChange={setLinkSearch}/><ResourceSelect label="Lọc nội dung đi cùng" value={linkKind} onChange={setLinkKind} options={[{value:'all',label:'Định dạng'},...FORMAT_OPTIONS]} format/></div><div className="resource-linked-list">{visibleLinks.map((link,index)=>{const preferred=getLinkedChoices(links,link.kind)[0]?.id===link.id;return <Fragment key={link.id}>{(index===0||visibleLinks[index-1].kind!==link.kind) && <h4 className="resource-linked-group-label">{RESOURCE_KIND_LABELS[link.kind] || link.kind}</h4>}<div data-new={newLinks.includes(link.id)}><ResourceKind kind={link.kind} iconOnly/>{link.coverUrl && <img src={link.coverUrl} alt=""/>}<span><strong>{link.title}</strong><small><ResourceKind kind={link.kind}/>{link.visibility==='hidden' && <em className="resource-link-hidden">Đã ẩn với bé</em>}</small></span>{getLinkedChoices(links,link.kind).length>1 && <button type="button" className="resource-link-preference" aria-pressed={preferred} aria-label={`${preferred?'Mở trước':'Đặt mở trước'}: ${link.title}`} onClick={()=>{setLinks(prev=>preferLinkedChoice(prev,link.id));setDirty(true);}}>{preferred?<CircleDot size={16}/>:<Circle size={16}/>}<span>{preferred?'Mở trước':'Đặt mở trước'}</span></button>}<button type="button" aria-label={`Bỏ liên kết ${link.title}`} onClick={()=>{setLinks(prev=>prev.filter(l=>l.id!==link.id));setDirty(true);}}><Unlink size={22}/></button></div></Fragment>;})}</div>{links.length>0 && visibleLinks.length===0 && <p role="status">Không có nội dung liên kết phù hợp.</p>}{!links.length && <p className="resource-field-hint">Chưa có nội dung đi cùng.</p>}{item?.editableVariantIds && item.variants?.some(v=>!item.editableVariantIds!.includes(v.id)) && <div><h3>Được liên kết từ</h3><p>{item.variants.filter(v=>!item.editableVariantIds!.includes(v.id)).map(v=>v.title).join(', ')}. Chỉnh liên kết tại học liệu nguồn.</p></div>}</>}
      </fieldset>{fieldError?.field==='template'&&<p role="alert" className="resource-form-error">{fieldError.message}</p>}
      {error && <p ref={errorRef} role="alert" className="resource-form-error">{error}</p>}
    </div><footer className="resource-authoring-footer"><span className="resource-dirty-state" role="status" data-dirty={dirty}>{dirty?'Có thay đổi chưa lưu':''}</span><button type="button" className="resource-preview-action" disabled={locked} aria-haspopup="dialog" onClick={event=>{focusDialogTrigger(event.currentTarget);setPreview(true);}}><Eye size={18}/>Xem trước</button><button type="button" disabled={busy} onClick={requestClose}>Hủy</button><button type="submit" className="resource-primary" disabled={busy || Boolean(uploading)}>{busy?'Đang lưu…':item?'Lưu thay đổi':'Thêm học liệu'}</button></footer></form></>}
  </ResourceDialog>{preview&&<ResourcePreview resource={previewItem} onClose={()=>setPreview(false)}/>} {picker && <ResourcePicker initialKind={linkKind} title="Chọn nội dung liên quan" excludeId={id} existingIds={links.map(l=>l.id)} onClose={()=>setPicker(false)} onChoose={async chosen=>{setNewLinks(chosen.map(item=>item.id));setLinks(prev=>[...prev,...chosen.filter(c=>!prev.some(p=>p.id===c.id))]);setDirty(true);setPicker(false);}}/>}</>;
}
