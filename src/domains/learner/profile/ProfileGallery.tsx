import { useState } from 'react';
import { ArrowRight, Paintbrush, Palette } from 'lucide-react';
import type { ProfileRecord } from '@bluesteam/contracts';
import { useRouter } from '../../../app/router';
import type { SavedArtworkView } from '../../../shared/creative/artworkCompletion';
import { useI18n } from '../../../shared/i18n/I18nContext';
import { ArtworkPreview } from '../../../shared/ui/artworks/ArtworkPreview';
import { artworkKindPresentation } from '../../../shared/ui/artworks/artworkKindPresentation';
import { LocalArtworkViewer } from '../../../shared/ui/artworks/LocalArtworkViewer';
import { ProfileRecordList } from '../../../shared/ui/profile/ProfileEvidenceView';
import { ProfileArtworkSection } from './ProfileArtworkSection';
import { useProfileArtworks } from './useProfileArtworks';

type Collection = ReturnType<typeof useProfileArtworks>;
type OpenArtwork = (art: SavedArtworkView, source: HTMLElement) => void;

export function ProfileGallery({ scope = '', submissions = [] }: { scope?: string; submissions?: ProfileRecord[] }) {
  const { navigate } = useRouter();
  const { t } = useI18n();
  const [expanded, setExpanded] = useState<'class' | 'device' | null>(null);
  const [selection, setSelection] = useState<{ art: SavedArtworkView; source: HTMLElement | null }>();
  const collection = useProfileArtworks(scope);
  const hasArtworks = collection.records?.some(section => section.items.length > 0);

  function openArtwork(art: SavedArtworkView, source: HTMLElement) {
    setSelection({ art, source: source.querySelector<HTMLElement>('.artwork-preview') });
  }

  function toggle(next: 'class' | 'device') {
    setExpanded(previous => previous === next ? null : next);
  }

  return <>
    <section className="profile-tray profile-tray-artworks" data-profile-card="creations" aria-labelledby="profile-artworks-heading">
      <h3 id="profile-artworks-heading"><Palette aria-hidden="true"/>Sản phẩm đã tạo</h3>
      {!scope && !hasArtworks && <p className="profile-artwork-scope">{t('profile.local')}</p>}
      {collection.error && (!expanded || (scope && expanded === 'device')) && <p role="alert">
        {t(collection.blocked ? 'profile.upgradeBlocked' : collection.records ? 'profile.refreshError' : 'profile.readError')}
        <button className="profile-link" disabled={collection.refreshing} onClick={() => void collection.reload()}>{t('system.retry')}</button>
      </p>}
      {!collection.records && !collection.error && <p role="status">{t('profile.loading')}</p>}
      <ul className="profile-artwork-tiles">{collection.records?.map(section => {
        const meta = artworkKindPresentation[section.kind];
        const art = section.items[0];
        const content = <>
          <span className="profile-preview-media">{art ? <ArtworkPreview src={art.previewDataUrl} alt="" lazy /> : <meta.Icon aria-hidden="true" />}</span>
          <span>{t(meta.titleKey)}{!art && <small>Chưa có tác phẩm</small>}</span>
        </>;
        return <li key={section.kind}>{art ? <button className="profile-preview-row" onClick={event => openArtwork(art, event.currentTarget)}
          aria-label={t('profile.open').replace('{title}', art.title || t('profile.untitled'))}>{content}</button> :
          <div className="profile-preview-row">{content}</div>}</li>;
      })}</ul>
      <div className="profile-list-actions">
        {!scope && !expanded && !hasArtworks && <button className="profile-link" onClick={() => navigate('/creative', { preserveQuery: false })}>
          {t('profile.start')}
        </button>}
        <button className="profile-link" aria-expanded={expanded === 'device'} aria-controls="profile-artwork-collection"
          aria-label={t('profile.collection')} onClick={() => toggle('device')}>{scope ? t('profile.collection') : expanded ? 'Thu gọn' : 'Xem thêm'}{!scope && !expanded && <ArrowRight size={16} aria-hidden="true" />}</button>
        {scope ? <button className="profile-link" aria-expanded={expanded === 'class'} aria-controls="profile-artwork-collection"
          onClick={() => toggle('class')}>{expanded === 'class' ? 'Thu gọn' : 'Xem thêm'} <ArrowRight size={16} aria-hidden="true" /></button> : null}
      </div>
    </section>
    <section id="profile-artwork-collection" className="profile-gallery" hidden={!expanded}>
      {expanded === 'class' && submissions.length > 0 && <div className="profile-sent-artworks">
        <h3>Sản phẩm đã gửi vào lớp</h3><ProfileRecordList title="Sản phẩm đã gửi vào lớp" records={submissions} />
      </div>}
      {scope && expanded === 'device' ? <DeviceCollection onOpen={openArtwork} /> :
        expanded && <ArtworkCollection
          title={scope ? 'Tác phẩm lưu trên thiết bị theo lớp' : t('profile.collection')}
          collection={collection} onOpen={openArtwork} device={!scope} />}
    </section>
    {selection && <LocalArtworkViewer key={selection.art.id} artwork={selection.art}
      motionSource={selection.source} onClose={() => setSelection(undefined)} />}
  </>;
}

function DeviceCollection({ onOpen }: { onOpen: OpenArtwork }) {
  const { t } = useI18n();
  const collection = useProfileArtworks('');
  return <ArtworkCollection title={t('profile.collection')} collection={collection} onOpen={onOpen} device />;
}

function ArtworkCollection({ title, collection, onOpen, device }: {
  title: string; collection: Collection; onOpen: OpenArtwork; device: boolean;
}) {
  const { navigate } = useRouter();
  const { t } = useI18n();
  const { records, error, blocked, refreshing, reload, loadMore } = collection;
  return <>
    <header className="profile-gallery-title">
      <div><h2>{title}</h2><p>{device ? t('profile.local') : 'Theo lớp đang xem'} · {t('profile.collectionDescription')}</p></div>
      <button className="profile-primary" onClick={() => navigate('/creative', { query: {}, preserveQuery: false })}>
        <Paintbrush size={20} aria-hidden="true" />{t('profile.start')}
      </button>
    </header>
    {error && <div className="profile-read-error">
      <p role="alert">{t(blocked ? 'profile.upgradeBlocked' : records ? 'profile.refreshError' : 'profile.readError')}</p>
      <button className="profile-secondary" disabled={refreshing} onClick={() => void reload()}>{t('system.retry')}</button>
    </div>}
    {!records && !error && <div className="profile-loading">
      <p role="status">{t('profile.loading')}</p>
      <div className="profile-skeleton-grid" aria-hidden="true"><div /><div /><div /></div>
    </div>}
    {records?.map(section => <ProfileArtworkSection key={section.kind} section={section}
      onOpen={onOpen} onLoadMore={() => loadMore(section.kind)} refreshing={refreshing} />)}
  </>;
}
