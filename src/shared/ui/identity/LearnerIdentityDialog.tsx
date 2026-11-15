import { useState } from 'react';
import { Laptop, UserRound } from 'lucide-react';
import { ProfileDialog } from '../profile/ProfileDialog';
import { AnimalAvatar } from './AnimalAvatar';
import { AnimalAvatarPicker } from './AnimalAvatarPicker';
import { demoStore } from '../../realtime/demoStore';
import { oceanApi } from '../../api/learnerOcean';

export function LearnerIdentityDialog({ onClose }: { onClose: () => void }) {
  const profile = demoStore.getProfile();
  const [name, setName] = useState(profile.role === 'student' ? profile.name : 'Bé An');
  const [avatar, setAvatar] = useState(profile.avatarKey || 'turtle');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const account = profile.role === 'student' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(profile.id);
  async function save() {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      if (account && avatar !== profile.avatarKey) {
        await oceanApi('avatar', { method:'PUT', body:JSON.stringify({avatarKey:avatar}) });
      }
      demoStore.setProfile({ ...profile, role:'student', id:profile.role === 'student' ? profile.id : 'student-local', name:name.trim(), avatarKey:avatar });
      onClose();
    } catch (reason) {
      setError(account ? (reason as Error).message : 'Chưa lưu được tên và hình. Con kiểm tra bộ nhớ trình duyệt rồi thử lại nhé.');
    } finally {
      setSaving(false);
    }
  }
  return <ProfileDialog title="Tên và hình của bé" icon={<UserRound/>} className="learner-identity-dialog" onClose={onClose}>
    {requestClose => <form onSubmit={e => { e.preventDefault(); void save(); }}>
      <div className="identity-preview"><AnimalAvatar avatarKey={avatar} /><label>Tên của bé<input className="profile-input" required maxLength={30} value={name} onChange={e => setName(e.target.value)} /></label></div>
      <p className="ocean-label">Chọn bạn đồng hành</p><AnimalAvatarPicker value={avatar} onChange={setAvatar} />
      {error && <p role="alert" className="ocean-error">{error}</p>}
      <footer className="ocean-modal-footer"><span><Laptop size={19} />{account ? 'Tên trên thiết bị · Hình theo tài khoản' : 'Trên thiết bị này'}</span><button type="button" className="ocean-button quiet" onClick={requestClose}>Hủy</button><button disabled={saving} className="ocean-button coral" type="submit">Lưu</button></footer>
    </form>}
  </ProfileDialog>;
}
