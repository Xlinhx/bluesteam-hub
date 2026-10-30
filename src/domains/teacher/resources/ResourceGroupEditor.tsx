import { useEffect, useRef, useState } from 'react';
import { Upload, Waves, Minus, Plus, Trash2, Info } from 'lucide-react';
import { uploadTeacherMediaFile } from '../../../shared/api/client';
import { saveResourceGroup, type ResourceGroup } from '../../../shared/api/resourceGroups';
import { ResourceDialog } from './ResourceDialog';
import { ResourceSelect, VISIBILITY_OPTIONS } from './ResourceControls';
import { cropImageStyle, panCoverCrop } from '../../../shared/ui/visuals/resourceCoverCrop';

export function ResourceGroupEditor({ group, onClose, onSaved }: { group?: ResourceGroup; onClose: () => void; onSaved: (id: string) => void }) {
  const [title, setTitle] = useState(group?.title || '');
  const [visibility, setVisibility] = useState<'published' | 'hidden'>(group?.visibility==='published'?'published':'hidden');
  const [cover, setCover] = useState(group?.coverUrl || '');
  const [file, setFile] = useState<File | null>(null);
  const [uploadedCoverId, setUploadedCoverId] = useState(group?.coverMediaId || null);
  const [crop, setCrop] = useState(group?.coverCrop || { x: .5, y: .5, scale: 1 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(()=>{if(error)errorRef.current?.scrollIntoView({block:'center',behavior:'instant'});},[error]);
  const objectUrl = useRef('');
  const controller = useRef<AbortController | null>(null);
  const aspect = useRef(1);
  const drag = useRef<{ x: number; y: number; crop: typeof crop } | null>(null);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); controller.current?.abort(); }, []);
  const beforeClose = () => !dirty || window.confirm('Bỏ thay đổi chưa lưu của nhóm?');
  const close = () => { if(!busy) onClose(); };
  const select = (next?: File) => {
    if (!next || busy) return;
    if (!['image/jpeg','image/png','image/webp'].includes(next.type) || next.size > 10*1024*1024) { setError('Chọn ảnh JPG, PNG hoặc WebP, tối đa 10 MB.'); return; }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(next);
    setCover(objectUrl.current); setFile(next); setCrop({ x: .5, y: .5, scale: 1 }); setDirty(true); setError('');
  };
  const save = async () => {
    if (busy) return;
    if (!title.trim()) { setError('Nhập tên nhóm.'); return; }
    setBusy(true); setError('');
    controller.current = new AbortController();
    try {
      let mediaId = cover ? uploadedCoverId : null;
      if (file) {
        mediaId = (await uploadTeacherMediaFile(file, controller.current.signal)).id;
        setUploadedCoverId(mediaId); setFile(null);
      }
      if (controller.current.signal.aborted) return;
      const saved = await saveResourceGroup({ title: title.trim(), visibility, coverMediaId: mediaId, coverCrop: crop }, group?.id);
      if (!controller.current.signal.aborted) onSaved(saved.id);
    } catch (err) { if (!controller.current.signal.aborted) setError(err instanceof Error ? err.message : 'Chưa lưu được nhóm.'); }
    finally { setBusy(false); }
  };
  const imageStyle = cropImageStyle(crop);
  const zoomProgress = `${(crop.scale-1)/3*100}%`;
  return <ResourceDialog title={group ? 'Sửa nhóm' : 'Tạo nhóm'} onClose={close} beforeClose={beforeClose} busy={busy} wide className="resource-group-dialog">{requestClose =>
    <form onSubmit={e => { e.preventDefault(); void save(); }}>
      <div className="resource-form-body">
        <label>Tên nhóm <input autoFocus required maxLength={100} value={title} onChange={e => { setTitle(e.target.value); setDirty(true); }} placeholder="Ví dụ: Rạn san hô"/></label>
        <section className="group-photo-editor" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();select(e.dataTransfer.files[0]);}}><div className="group-photo-label"><strong>Ảnh đại diện</strong><small>Không bắt buộc</small></div><div className="group-cover-workspace">
          <div className="group-crop-area"><div className="group-cover-square" data-draggable={Boolean(cover)} tabIndex={0} role="group" aria-label="Vùng cắt ảnh. Dùng phím mũi tên để dịch ảnh." onKeyDown={e=>{if(!cover || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key) || busy)return;e.preventDefault();setCrop(prev=>({...prev,x:Math.min(1,Math.max(0,prev.x+(e.key==='ArrowLeft'?-.02:e.key==='ArrowRight'?.02:0))),y:Math.min(1,Math.max(0,prev.y+(e.key==='ArrowUp'?-.02:e.key==='ArrowDown'?.02:0)))}));setDirty(true);}}
          onPointerDown={e=>{if(!cover || busy || e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,crop};}}
          onPointerMove={e=>{if(!drag.current)return;setCrop(panCoverCrop(drag.current.crop,e.clientX-drag.current.x,e.clientY-drag.current.y,e.currentTarget.clientWidth,aspect.current));setDirty(true);}}
          onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}
          >{cover?<img src={cover} draggable={false} onLoad={e=>{aspect.current=e.currentTarget.naturalWidth/e.currentTarget.naturalHeight;}} alt="Vùng ảnh nhóm" style={imageStyle}/>:<Waves size={64}/>}{cover && <span className="group-crop-grid" aria-hidden="true"/>}</div><p>Kéo ảnh để chọn vùng hiển thị</p><div className="group-crop-controls"><button type="button" aria-label="Thu nhỏ ảnh" disabled={!cover || busy || crop.scale<=1} onClick={()=>{setCrop(prev=>({...prev,scale:Math.max(1,prev.scale-.1)}));setDirty(true);}}><Minus size={18}/></button><input aria-label="Thu phóng ảnh" type="range" style={{background:`linear-gradient(to right,#18758b ${zoomProgress},#e0e4e8 ${zoomProgress})`}} min="1" max="4" step="0.01" disabled={!cover || busy} value={crop.scale} onChange={e=>{setCrop(prev=>({...prev,scale:Number(e.target.value)}));setDirty(true);}}/><button type="button" aria-label="Phóng to ảnh" disabled={!cover || busy || crop.scale>=4} onClick={()=>{setCrop(prev=>({...prev,scale:Math.min(4,prev.scale+.1)}));setDirty(true);}}><Plus size={18}/></button></div></div>
          <div className="group-photo-preview"><strong>Xem trước</strong><div className="group-cover-circle">{cover?<img src={cover} alt="Xem trước ảnh tròn" style={imageStyle}/>:<Waves size={44}/>}</div>{file && <p className="group-file-name">{file.name}<small>{(file.size/1024/1024).toFixed(1)} MB</small></p>}
          <div className="group-photo-actions"><label className="resource-upload"><Upload size={20}/>{cover?'Thay ảnh':'Tải ảnh lên'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{select(e.target.files?.[0]);e.target.value='';}}/></label>{cover && <button type="button" className="resource-secondary" disabled={busy} onClick={()=>{setCover('');setFile(null);setDirty(true);}}><Trash2 size={18}/>Bỏ ảnh</button>}</div><p className="resource-field-hint">JPG, PNG, WebP · tối đa 10 MB</p></div>
        </div></section>
        <label>Hiển thị nhóm<ResourceSelect label="Hiển thị nhóm" value={visibility} disabled={busy} options={VISIBILITY_OPTIONS} onChange={value=>{setVisibility(value as typeof visibility);setDirty(true);}}/></label>
        {error && <p ref={errorRef} className="resource-form-error" role="alert">{error}</p>}
      </div>
      <footer>{!group && <span className="resource-field-hint"><Info size={17}/>Có thể thêm học liệu sau khi tạo nhóm.</span>}<button type="button" onClick={requestClose}>Hủy</button><button className="resource-primary" disabled={busy} type="submit">{busy ? 'Đang lưu…' : group ? 'Lưu thay đổi' : 'Tạo nhóm'}</button></footer>
    </form>}
  </ResourceDialog>;
}
