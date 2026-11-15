import { ArrowRight, BookOpen, Gamepad2 } from 'lucide-react';
import { useRouter } from '../../../app/router';
import { oceanPath, useOceanData, type LearnerProfileJourney, type OceanProfile, type StudyContext } from '../../../shared/api/learnerOcean';
import { ProfileRecordList } from '../../../shared/ui/profile/ProfileEvidenceView';
import { profileArt } from './PersonalInformation';
import { ProfileGallery } from './ProfileGallery';

const counts = new Intl.NumberFormat('vi-VN');

function Count({ value, label, image }: { value?: number; label: string; image: string }) {
  return <div className="profile-count">
    <img src={`${profileArt}/${image}.webp`} alt="" width={240} height={160} decoding="async" />
    <div><strong>{value === undefined ? '–' : counts.format(value)}</strong><span>{label}</span></div>
  </div>;
}

export function ProfileJourney({ profile, current, unavailable, artworkScope, onScopeChange }: {
  profile?: OceanProfile;
  current?: StudyContext;
  unavailable: boolean;
  artworkScope?: string;
  onScopeChange?: () => void;
}) {
  const { navigate } = useRouter();
  const contextId = current?.id ?? profile?.personalContextId ?? undefined;
  const evidence = useOceanData<LearnerProfileJourney>(profile ? oceanPath('evidence', { contextId }) : null, contextId);
  const journey = evidence.data;
  const lists = [
    { title:'Nội dung đã học', kind:'learned', records:journey?.species, Icon:BookOpen, empty:'Bé chưa ghi sinh vật nào vào sổ.', action:'Khám phá sinh vật', href:'/learning' },
    { title:'Game đã chơi', kind:'games', records:journey?.games, Icon:Gamepad2, empty:'Bé chưa có game nào được ghi nhận.', action:'Khám phá game', href:'/interactive' },
  ];
  return <section className="profile-journey" aria-labelledby="profile-journey-heading">
    <header className="profile-journey-header">
      <h2 id="profile-journey-heading">Hành trình của bé</h2>
      {profile && <span className="profile-scope">{current ? `${current.className} · ${current.schoolYear}` : 'Cá nhân'}</span>}
      {onScopeChange && <button type="button" className="profile-link profile-scope-switch" onClick={onScopeChange}>
        {current ? 'Xem hành trình cá nhân' : 'Xem hành trình của lớp'} <ArrowRight size={16} aria-hidden="true" />
      </button>}
      {current && current.id !== profile?.contextId && <small>Đang xem lịch sử</small>}
    </header>
    {evidence.loading && <p className="profile-journey-status" role="status">Đang mở hành trình…</p>}
    {evidence.error && <p className="profile-journey-status" role="alert">{evidence.error} <button className="profile-link" onClick={evidence.reload}>Thử lại</button></p>}
    <div className="profile-summary">
      <section className="profile-summary-panel profile-summary-progress" data-profile-card="progress" aria-labelledby="profile-progress-heading">
        <h3 id="profile-progress-heading">Tiến trình học tập</h3>
        <div className="profile-count-pair">
          <Count value={profile?.learned} label="Học tập" image="notebook" />
          <Count value={journey?.resourceCount} label="Học liệu" image="resource-cards" />
        </div>
      </section>
      <section className="profile-summary-panel profile-summary-achievements" data-profile-card="achievement" aria-labelledby="profile-achievement-heading">
        <h3 id="profile-achievement-heading">Thành tích</h3>
        <Count value={journey?.achievementCount} label="đã đạt" image="achievement-octopus" />
      </section>
    </div>
    <div className="profile-journey-grid">
      {lists.map(({ title, kind, records, Icon, empty, action, href }) => <section className={`profile-tray profile-tray-${kind}`} key={kind} data-profile-card={kind} aria-labelledby={`profile-${kind}-heading`}>
        <h3 id={`profile-${kind}-heading`}><Icon aria-hidden="true" />{title}</h3>
        {records?.length ? <ProfileRecordList title={title} records={records} layout="tiles" /> :
          <div className="profile-tray-empty"><p>{records ? empty : 'Chưa có dữ liệu hiển thị.'}</p>
            <button className="profile-link" onClick={() => navigate(href, { preserveQuery:false })}>{action} <ArrowRight size={16} aria-hidden="true" /></button>
          </div>}
      </section>)}
      <ProfileGallery scope={artworkScope} submissions={journey?.creations} />
    </div>
    <section className="profile-journal" data-profile-card="journal" aria-labelledby="profile-journal-heading">
      <h3 id="profile-journal-heading">Hành trình học tập</h3>
      <ProfileRecordList title="Hành trình học tập" records={journey?.timeline ?? []} layout="journal" timeline
        emptyMessage={unavailable ? 'Chưa tải được hành trình.' : 'Các hoạt động của bé sẽ xuất hiện ở đây.'} />
    </section>
  </section>;
}
