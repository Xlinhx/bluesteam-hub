import { useRef, useState } from 'react';
import { focusDialogTrigger } from '../../../shared/ui/overlays/nativeDialogFocus';
import { Laptop, Paintbrush, Pencil } from 'lucide-react';
import { useRouter } from '../../../app/router';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import { AnimalAvatar } from '../../../shared/ui/identity/AnimalAvatarPicker';
import { useLocalIdentity } from '../../../shared/ui/identity/useLocalIdentity';
import { LearnerIdentityDialog } from '../../../shared/ui/identity/LearnerIdentityDialog';
import { LocalArtworkViewer } from '../../../shared/ui/artworks/LocalArtworkViewer';
import { useI18n } from '../../../shared/i18n/I18nContext';
import { ProfileArtworkSection } from './ProfileArtworkSection';
import { useProfileArtworks } from './useProfileArtworks';
import './profile.css';
import { useOceanChoreography } from '../../../shared/ui/motion/useOceanChoreography';
import { OceanCabinet } from '../../../shared/ui/visuals/OceanCabinet';

export function LearnerProfilePage() {
  const { navigate } = useRouter(), { t } = useI18n();
  const scene = useRef<HTMLDivElement>(null);
  useOceanChoreography(scene, 'profile');
  const identity = useLocalIdentity();
  const name = identity.role === 'student' ? identity.name : 'Bé An';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const artworkSource = useRef<HTMLElement | null>(null);
  const [editing, setEditing] = useState(false);
  const { records, error, blocked, refreshing, reload, loadMore } = useProfileArtworks();
  const sections = records || [];
  const selected = sections.flatMap(s => s.items).find(art => art.id === selectedId);
  return <LearnerShell activeNav="profile">
    <div ref={scene} className="learner-profile" data-testid="learner-profile-page">
      <section className="profile-seascape"><OceanCabinet variant="collection"/><div className="profile-identity"><AnimalAvatar avatarKey={identity.avatarKey} className="profile-portrait" /><div><h1>{t('profile.garden').replace('{name}', name.replace(/^Bé\s+/i, ''))}</h1><p><Laptop aria-hidden="true" />{t('profile.local')}</p><button className="ocean-button outline" aria-haspopup="dialog" onClick={event => { focusDialogTrigger(event.currentTarget); setEditing(true); }}><Pencil size={21} aria-hidden="true" />{t('profile.editIdentity')}</button></div></div></section>
      <div className="profile-gallery"><header className="profile-gallery-title"><div><h2>{t('profile.collection')}</h2><p>{t('profile.collectionDescription')}</p></div><button className="ocean-button coral" onClick={() => navigate('/creative', { query: {}, preserveQuery: false })}><Paintbrush aria-hidden="true" />{t('profile.start')}</button></header>
        {error && <div className="profile-read-error"><p role="alert">{t(blocked ? 'profile.upgradeBlocked' : records ? 'profile.refreshError' : 'profile.readError')}</p><button className="ocean-button outline" disabled={refreshing} onClick={() => void reload()}>{t('system.retry')}</button></div>}
        {records === null ? !error && <div className="profile-loading"><p role="status">{t('profile.loading')}</p><div className="profile-skeleton-grid" aria-hidden="true">{[0, 1, 2].map(i => <div key={i} />)}</div></div> : sections.map(section => <ProfileArtworkSection key={section.kind} section={section} onOpen={(art, source) => { artworkSource.current = source.querySelector<HTMLElement>(".artwork-preview"); setSelectedId(art.id); }} onLoadMore={() => loadMore(section.kind)} refreshing={refreshing} />)}
      </div>
    </div>
    {editing && <LearnerIdentityDialog onClose={() => setEditing(false)} />}
    {selected && <LocalArtworkViewer key={`${selected.id}-${selected.savedAt}`} artwork={selected} motionSource={artworkSource.current} onClose={() => setSelectedId(null)} />}
  </LearnerShell>;
}
