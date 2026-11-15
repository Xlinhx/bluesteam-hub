import { Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import { useRouter } from '../../../app/router';
import { oceanApi, type OceanProfile, useOceanData } from '../../../shared/api/learnerOcean';
import { demoStore } from '../../../shared/realtime/demoStore';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import { AnimalAvatar } from '../../../shared/ui/identity/AnimalAvatar';
import { LearnerIdentityDialog } from '../../../shared/ui/identity/LearnerIdentityDialog';
import { useLocalIdentity } from '../../../shared/ui/identity/useLocalIdentity';
import { useOceanChoreography } from '../../../shared/ui/motion/useOceanChoreography';
import { focusDialogTrigger } from '../../../shared/ui/overlays/nativeDialogFocus';
import { PersonalInformation } from './PersonalInformation';
import { ProfileJourney } from './ProfileJourney';
import './profile.css';
import '../../../shared/ui/profile/profile-layout.css';
import './learner-profile-layout.css';
import { ClassMembershipPanel } from './ClassMembershipPanel';
import { ProfileLagoon } from '../../../shared/ui/profile/ProfileLagoon';
import { useProfileCardMotion } from '../../../shared/ui/profile/useProfileCardMotion';

export function LearnerProfilePage() {
  const scene = useRef<HTMLDivElement>(null);
  useOceanChoreography(scene, 'profile');
  useProfileCardMotion(scene);
  const identity = useLocalIdentity();
  const inviteCode = useRouter().query.join;
  const [viewedContext, setViewedContext] = useState<string>();
  const profile = useOceanData<OceanProfile>(viewedContext ? 'profile?contextId=' + encodeURIComponent(viewedContext) : 'profile', identity.id, true);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [lastProfile, setLastProfile] = useState<{ id:string; data:OceanProfile }>();
  if (profile.data && (lastProfile?.id !== identity.id || lastProfile?.data !== profile.data)) setLastProfile({ id:identity.id, data:profile.data });
  const data = profile.data;
  const formData = data ?? (lastProfile?.id === identity.id ? lastProfile.data : undefined);
  const formContext = formData?.contexts.find(context => context.id === (viewedContext || formData.contextId)) || formData?.contexts[0];
  const isPersonal = !!viewedContext && viewedContext === data?.personalContextId;
  const current = isPersonal ? undefined : data?.contexts.find(context => context.id === (viewedContext || data.contextId)) || data?.contexts[0];
  const personalContextId = data?.personalContextId;

  async function save(value: string) {
    setPending(true);
    setSaveError('');
    try {
      const { name } = await oceanApi<{ name: string }>('name', {
        method: 'PUT', body: JSON.stringify({ name:value }),
      });
      const previous = demoStore.getProfile();
      if (previous.role === 'student' && previous.id === identity.id) demoStore.setProfile({ ...previous, name });
      profile.reload();
    } catch (error) {
      setSaveError((error as Error).message);
    } finally {
      setPending(false);
    }
  }

  const avatar = <div className="profile-identity">
    <AnimalAvatar avatarKey={identity.avatarKey} className="profile-portrait" />
    <button className="profile-secondary" aria-haspopup="dialog" onClick={event => {
      focusDialogTrigger(event.currentTarget);
      setEditingAvatar(true);
    }}><Camera size={16} aria-hidden="true" />Đổi tên và hình</button>
  </div>;

  return <LearnerShell activeNav="profile">
    <div ref={scene} className="learner-profile" data-testid="learner-profile-page">
      <section className="profile-hero" aria-labelledby="profile-personal-heading">
        <ProfileLagoon />
        <div className="profile-hero-inner">
          <h1 id="profile-personal-heading">Thông tin cá nhân</h1>
          {formData ? <PersonalInformation key={identity.id} name={formData.name} current={formContext}
            contexts={formData.contexts} onSelect={context => setViewedContext(context.id)} pending={pending} onSave={save} avatar={avatar} /> :
            <div className="profile-personal-sheet profile-personal-status">
              {avatar}
              {profile.loading && <p role="status">Đang mở hồ sơ…</p>}
              {profile.error && <p role="alert">{profile.error} <button className="profile-link" onClick={profile.reload}>Thử lại</button></p>}
            </div>}
          {!data && formData && profile.loading && <p role="status">Đang đổi lớp đang xem…</p>}
          {!data && formData && profile.error && <p role="alert">{profile.error} <button className="profile-link" onClick={profile.reload}>Thử lại</button></p>}
          {saveError && <p className="profile-save-error" role="alert">{saveError}</p>}
          {formData && <ClassMembershipPanel key={identity.id+':'+(inviteCode||'')} inviteCode={inviteCode} activeContext={formData.contextId} onChange={profile.reload}/>}
        </div>
      </section>
      <div className="profile-content">
        <ProfileJourney key={current?.id || identity.id} profile={data} current={current} unavailable={Boolean(profile.error)}
          artworkScope={current ? `${identity.id}:${current.id}` : undefined}
          onScopeChange={data?.contextId && personalContextId ? () => setViewedContext(current ? personalContextId : undefined) : undefined}/>
      </div>
    </div>
    {editingAvatar && <LearnerIdentityDialog onClose={() => setEditingAvatar(false)} />}
  </LearnerShell>;
}
