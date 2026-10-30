import { useState } from 'react';
import { Laptop } from 'lucide-react';
import { ModalFrame } from '../overlays/ModalFrame';
import { AnimalAvatar, AnimalAvatarPicker } from './AnimalAvatarPicker';
import { demoStore } from '../../realtime/demoStore';

export function LearnerIdentityDialog({ onClose }: { onClose: () => void }) {
  const profile = demoStore.getProfile();
  const [name, setName] = useState(profile.role === 'student' ? profile.name : 'Bé An');
  const [avatar, setAvatar] = useState(profile.avatarKey || 'turtle');
  const [error, setError] = useState('');
  return <ModalFrame title="Tên và hình của con" onClose={onClose}>
    {requestClose => <form onSubmit={e => { e.preventDefault(); if (!name.trim()) return; try { demoStore.setProfile({ ...profile, role: 'student', id: profile.role === 'student' ? profile.id : 'student-local', name: name.trim(), avatarKey: avatar }); onClose(); } catch { setError('Chưa lưu được tên và hình. Con kiểm tra bộ nhớ trình duyệt rồi thử lại nhé.'); } }}>
      <div className="identity-preview"><AnimalAvatar avatarKey={avatar} /><label>Tên của con<input required maxLength={30} value={name} onChange={e => setName(e.target.value)} /></label></div>
      <p className="ocean-label">Chọn một bạn biển</p><AnimalAvatarPicker value={avatar} onChange={setAvatar} />
      {error && <p role="alert" className="ocean-error">{error}</p>}
      <footer className="ocean-modal-footer"><span><Laptop size={19} /> Trên thiết bị này</span><button type="button" className="ocean-button quiet" onClick={requestClose}>Hủy</button><button className="ocean-button coral" type="submit">Lưu</button></footer>
    </form>}
  </ModalFrame>;
}
