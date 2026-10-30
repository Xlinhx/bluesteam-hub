import { useEffect, useRef, useState } from 'react';
import { Image, Upload, RotateCcw, Trash2 } from 'lucide-react';
import { ModalFrame } from '../../../shared/ui/overlays/ModalFrame';
import { AnimalAvatarPicker } from '../../../shared/ui/identity/AnimalAvatarPicker';
import { TEACHER_AVATARS, getTeacherAvatar } from '../../../shared/data/teacherAvatars';
import './teacher-identity.css';
import { updateTeacherProfileApi, type TeacherProfile } from '../../../shared/api/auth';
import { uploadTeacherMediaFile } from '../../../shared/api/client';

export function TeacherIdentityDialog({ profile, onClose }: { profile: TeacherProfile; onClose: () => void }) {
  const [name, setName] = useState(profile.displayName);
  const [tab, setTab] = useState<'preset' | 'upload'>(profile.avatarUrl ? 'upload' : 'preset');
  const [preset, setPreset] = useState<string | null>(profile.avatarKey || null);
  const [source, setSource] = useState<string | null>(null);
  const [cropped, setCropped] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [remove, setRemove] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);
  useEffect(() => {
    const img = image.current;
    if (!source || !img?.naturalWidth) { setCropped(null); return; }
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
    const side = Math.min(img.naturalWidth, img.naturalHeight) / zoom;
    canvas.getContext('2d')!.drawImage(img, (img.naturalWidth - side) * position.x / 100, (img.naturalHeight - side) * position.y / 100, side, side, 0, 0, 512, 512);
    setCropped(canvas.toDataURL('image/png'));
  }, [source, zoom, position, imageVersion]);
  const preview = remove ? null : tab === 'preset' ? (preset ? getTeacherAvatar(preset).imageSrc : null) : (source ? cropped : profile.avatarUrl);
  const close = () => { if (!busy) onClose(); };
  const save = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      let avatarMediaId = remove || tab === 'preset' ? null : profile.avatarMediaId || null;
      let avatarKey = remove ? null : tab === 'preset' ? preset : null;
      if (source && tab === 'upload' && !remove) {
        const img = image.current;
        if (!img?.naturalWidth) throw new Error('Ảnh chưa sẵn sàng. Cô đợi một chút nhé.');
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
        const side = Math.min(img.naturalWidth, img.naturalHeight) / zoom;
        const sx = (img.naturalWidth - side) * position.x / 100;
        const sy = (img.naturalHeight - side) * position.y / 100;
        canvas.getContext('2d')!.drawImage(img, sx, sy, side, side, 0, 0, 512, 512);
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Không xử lý được ảnh')), 'image/png'));
        const uploaded = await uploadTeacherMediaFile(new File([blob], 'avatar.png', { type: 'image/png' }));
        avatarMediaId = uploaded.id; avatarKey = null;
      }
      if (avatarKey) avatarMediaId = null;
      await updateTeacherProfileApi({ displayName: name.trim(), avatarKey, avatarMediaId });
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Chưa lưu được. Cô thử lại nhé.'); }
    finally { setBusy(false); }
  };
  return <ModalFrame title="Hồ sơ giáo viên" onClose={close}>
    {requestClose => <form onSubmit={e => { e.preventDefault(); void save(); }}><fieldset disabled={busy}>
      <label className="ocean-label">Tên hiển thị<input required maxLength={80} value={name} disabled={busy} onChange={e => setName(e.target.value)} /></label>
      <div className="identity-tabs"><button type="button" aria-pressed={tab === 'preset'} onClick={() => setTab('preset')}><Image size={20} /> Hình có sẵn</button><button type="button" aria-pressed={tab === 'upload'} onClick={() => setTab('upload')}><Upload size={20} /> Tải ảnh</button></div>
      {tab === 'preset' ? <>
        <AnimalAvatarPicker avatars={TEACHER_AVATARS} label="Chọn ảnh đại diện giáo viên" value={preset || ''} onChange={key => { setPreset(key); setRemove(false); }} />
      </> : <>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={e => {
          const file = e.target.files?.[0]; if (!file) return;
          if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('Chọn ảnh JPG, PNG hoặc WebP tối đa 5 MB.'); return; }
          setSource(URL.createObjectURL(file)); setRemove(false); setZoom(1); setPosition({ x: 50, y: 50 }); setError('');
        }} />
        <div className="teacher-crop-layout">{source && <img ref={image} src={source} alt="" hidden onLoad={() => setImageVersion(v => v + 1)} onError={() => { setError('Không đọc được ảnh. Cô chọn ảnh khác nhé.'); setSource(null); }} />}<div>
          <div className="avatar-crop" onPointerDown={e => { if (!source || busy) return; e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, startX: position.x, startY: position.y }; }} onPointerMove={e => { if (!busy && drag.current) setPosition({ x: Math.max(0, Math.min(100, drag.current.startX - (e.clientX - drag.current.x) / 2)), y: Math.max(0, Math.min(100, drag.current.startY - (e.clientY - drag.current.y) / 2)) }); }} onPointerUp={() => { drag.current = null; }}>
            {preview ? <img src={preview} alt="Ảnh để cắt" /> : <button type="button" onClick={() => fileInput.current?.click()}><Upload /> Chọn ảnh</button>}
            {source && <span className="avatar-crop-ring" />}
          </div>
          <label className="ocean-label">Phóng to<input type="range" min="1" max="3" step="0.01" value={zoom} disabled={!source || busy} onChange={e => setZoom(Number(e.target.value))} /></label>
        </div><div className="teacher-avatar-preview"><strong>Xem trước</strong>{preview && <img src={preview} alt="Ảnh đại diện xem trước" />}<button type="button" onClick={() => fileInput.current?.click()}><RotateCcw size={19} /> Chọn ảnh khác</button><button type="button" onClick={() => { setRemove(true); setSource(null); }}><Trash2 size={19} /> Bỏ ảnh</button></div></div>
        <p className="ocean-hint">Kéo ảnh để căn khung. JPG, PNG hoặc WebP · tối đa 5 MB.</p>
      </>}
      </fieldset>{error && <p role="alert" className="ocean-error">{error}</p>}
      <footer className="ocean-modal-footer"><span aria-live="polite">{busy ? 'Đang lưu hồ sơ…' : source ? 'Ảnh đang xem trước, chưa lưu vào hồ sơ' : ''}</span><button type="button" disabled={busy} className="ocean-button quiet" onClick={requestClose}>Hủy</button><button type="submit" disabled={busy || !name.trim()} className="ocean-button coral">{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button></footer>
    </form>}
  </ModalFrame>;
}
