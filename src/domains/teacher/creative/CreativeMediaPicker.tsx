import { useEffect, useRef, useState } from 'react';
import { Upload, X, CheckCircle2, RotateCcw, Image as ImageIcon, Music2 } from 'lucide-react';
import { ALLOWED_MEDIA_MIME_TYPES, MEDIA_UPLOAD_LIMITS_BYTES, type MediaUploadResult } from '@bluesteam/contracts';
import { getApiBaseUrl } from '../../../shared/api/client';

interface UploadRow { key: string; file: File; progress: number; state: 'uploading' | 'ready' | 'error' | 'cancelled'; result?: MediaUploadResult; error?: string }
export function CreativeMediaPicker({ kind = 'image', title, onSelect, onClose }: {
  kind?: 'image' | 'audio'; title: string; onSelect: (media: MediaUploadResult) => void; onClose: () => void;
}) {
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [selected, setSelected] = useState<string>('');
  const requests = useRef(new Map<string, XMLHttpRequest>());
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,audio') || []);
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
    };
    document.addEventListener('keydown', keys);
    return () => { document.removeEventListener('keydown', keys); requests.current.forEach(x => x.abort()); previous?.focus(); };
  }, []);
  const update = (key: string, patch: Partial<UploadRow>) => setRows(old => old.map(row => row.key === key ? { ...row, ...patch } : row));
  const upload = (row: UploadRow) => {
    if (!ALLOWED_MEDIA_MIME_TYPES[kind].includes(row.file.type) || row.file.size > MEDIA_UPLOAD_LIMITS_BYTES[kind]) {
      update(row.key, { state: 'error', error: `Chọn ${kind === 'image' ? 'PNG, JPG, WebP' : 'audio được hỗ trợ'}, tối đa ${MEDIA_UPLOAD_LIMITS_BYTES[kind]/1024/1024} MB.` }); return;
    }
    const xhr = new XMLHttpRequest(); requests.current.set(row.key, xhr);
    update(row.key, { state: 'uploading', progress: 0, error: undefined });
    xhr.open('POST', `${getApiBaseUrl()}/api/v1/teacher/media`); xhr.withCredentials = true;
    xhr.upload.onprogress = event => { if (event.lengthComputable) update(row.key, { progress: Math.min(99, Math.round(event.loaded/event.total*100)) }); };
    xhr.onload = () => {
      let result: any; try { result = JSON.parse(xhr.responseText); } catch { result = {}; }
      requests.current.delete(row.key);
      if (xhr.status >= 200 && xhr.status < 300 && result.id) { update(row.key, { result, state: 'ready', progress: 100 }); setSelected(old => old || row.key); }
      else update(row.key, { state: 'error', error: result.message || 'Chưa tải được file. Thử lại nhé.' });
    };
    xhr.onerror = () => { requests.current.delete(row.key); update(row.key, { state: 'error', error: 'Mất kết nối. File khác đã tải vẫn được giữ.' }); };
    xhr.onabort = () => update(row.key, { state: 'cancelled', error: 'Đã hủy tải file này.' });
    const body = new FormData(); body.append('file', row.file, row.file.name); xhr.send(body);
  };
  const addFiles = (files: FileList | null) => {
    const added: UploadRow[] = Array.from(files || []).map(file => ({ key: crypto.randomUUID(), file, progress: 0, state: 'uploading' }));
    setRows(old => [...old, ...added]); added.forEach(upload);
  };
  const active = rows.find(r => r.key === selected && r.state === 'ready');
  return <div className="creative-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="creative-media-dialog" role="dialog" aria-modal="true" aria-label={title} ref={dialog}>
      <header><div><h2>{title}</h2><p>Chọn file đã tải xong để sử dụng.</p></div><button className="creative-icon" onClick={onClose} aria-label="Đóng chọn file"><X /></button></header>
      <div className="creative-media-body"><section>
        <label className="creative-upload" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}><Upload size={30}/><strong>Kéo file vào đây hoặc chọn từ máy</strong><span>{kind === 'image' ? 'PNG, JPG, WebP · tối đa 10 MB' : 'Audio · tối đa 20 MB'}</span><input aria-label="Chọn file tải lên" type="file" multiple accept={ALLOWED_MEDIA_MIME_TYPES[kind].join(',')} onChange={e => addFiles(e.target.files)}/></label>
        <div className="creative-upload-list">{rows.map(row => <div className={`creative-upload-row ${selected === row.key ? 'selected' : ''}`} key={row.key}>
          <button disabled={row.state !== 'ready'} onClick={() => setSelected(row.key)}>{row.state === 'ready' ? <CheckCircle2/> : kind === 'image' ? <ImageIcon/> : <Music2/>}<span><strong>{row.file.name}</strong><small>{row.state === 'ready' ? 'Đã tải xong' : row.error || `${row.progress}% · Đang tải`}</small></span></button>
          {row.state === 'uploading' ? <button className="creative-icon" aria-label={`Hủy tải ${row.file.name}`} onClick={() => requests.current.get(row.key)?.abort()}><X size={18}/></button> : row.state !== 'ready' ? <button className="creative-icon" aria-label={`Thử lại ${row.file.name}`} onClick={() => upload(row)}><RotateCcw size={18}/></button> : null}
          {row.state === 'uploading' && <progress max={100} value={row.progress}/>}</div>)}</div>
      </section><section className="creative-media-preview">{active?.result ? <>{kind === 'image' ? <div className="creative-alpha"><img src={active.result.url} alt={active.file.name}/></div> : <audio controls src={active.result.url}/>}<strong>{active.file.name}</strong><p>Giữ nguyên toàn ảnh khi sử dụng.</p></> : <p>Chọn một file đã tải xong để xem trước.</p>}</section></div>
      <footer><span>Đã tải file khác với đã lưu vào mẫu.</span><button className="creative-btn" onClick={onClose}>Hủy</button><button className="creative-btn primary" disabled={!active?.result} onClick={() => { if (active?.result) onSelect(active.result); }}>Dùng file này</button></footer>
    </div>
  </div>;
}
