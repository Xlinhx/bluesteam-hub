import { useEffect, useRef, useState } from 'react';
import { Box, Glasses, RotateCcw } from 'lucide-react';
import { oceanApi } from '../../../shared/api/learnerOcean';
import { createTurtleViewer, type TurtleViewer } from './turtleViewer';

export function LearningModel({ onBack }: { onBack:()=>void }) {
  const mount = useRef<HTMLDivElement>(null);
  const viewer = useRef<TurtleViewer | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [vr, setVr] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const abort = new AbortController();
    let controller: TurtleViewer | undefined;
    setReady(false);setFailed(false);setMessage('');setVr(false);setInspecting(false);
    if (!mount.current) return;
    const parent = mount.current;
    try {
      controller = createTurtleViewer(parent, abort.signal);
      controller.ready.then(() => {
        if (!abort.signal.aborted) {viewer.current = controller;setReady(true);}
      }).catch(() => {
        if (!abort.signal.aborted) {setFailed(true);setMessage('Chưa tải được mô hình. Bé có thể xem lại thẻ sinh vật.');}
      });
    } catch {
      setFailed(true);setMessage('Trình duyệt này chưa hỗ trợ hiển thị mô hình 3D.');
    }
    navigator.xr?.isSessionSupported('immersive-vr').then(supported => {
      if (!abort.signal.aborted) setVr(supported);
    }).catch(() => {});
    return () => { abort.abort(); viewer.current = undefined; controller?.dispose(); };
  }, [retry]);

  async function observe(mode:'vr'|'inspector') {
    if (pending || !viewer.current) return;
    setMessage('');
    if (mode==='inspector' && inspecting) {
      viewer.current.inspect(false);setInspecting(false);return;
    }
    setPending(true);
    try {
      if (mode==='vr') {
        await viewer.current.enterVR();
        setMessage('Bé đang xem bằng kính VR. Điểm VR đang chờ xác minh lượt quan sát.');
        return;
      }
      viewer.current.inspect(true);setInspecting(true);
      const { id } = await oceanApi<{id:string}>('model-runs', {method:'POST',body:JSON.stringify({modelId:'digitallife-72b',mode})});
      const result = await oceanApi<{awarded:boolean}>('model-runs/' + id + '/award',{method:'POST'});
      setMessage(result.awarded ? '+100 điểm khám phá!' : 'Bé đã nhận điểm cho chế độ này trên mô hình.');
    } catch (error) {
      setMessage((error as Error).message || 'Chưa mở được chế độ này.');
    } finally { setPending(false); }
  }

  return <section className="learning-paper learning-model">
    <button className="learning-back" onClick={onBack}>← Về thẻ sinh vật</button>
    <h1>Rùa biển xanh</h1>
    <div ref={mount} className="learning-model-canvas" aria-label="Mô hình 3D rùa biển xanh"/>
    {!ready && !failed && <p role="status">Đang tải mô hình…</p>}
    {failed && <button className="learning-primary" onClick={() => setRetry(n => n+1)}>Thử lại</button>}
    <div className="learning-actions">
      <button disabled={!ready} onClick={() => viewer.current?.reset()}><RotateCcw size={18}/> Đặt lại góc nhìn</button>
      <button disabled={!ready || pending} aria-pressed={inspecting} onClick={() => void observe('inspector')}><Box size={18}/> Model Inspector</button>
      <button disabled={!ready || pending || !vr} onClick={() => void observe('vr')}><Glasses size={18}/> Kính VR</button>
    </div>
    {!vr && <p>Kính VR chưa được hỗ trợ trên thiết bị này. Bé vẫn có thể xoay và quan sát mô hình.</p>}
    {message && <p role="status">{message}</p>}
    <p>Mô hình 72B của DigitalLife3D · <a href="https://digitallife3d.org/sea-turtles-1" target="_blank" rel="noreferrer">Nguồn</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></p>
  </section>;
}
