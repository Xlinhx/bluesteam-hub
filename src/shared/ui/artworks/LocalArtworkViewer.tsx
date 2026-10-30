import { useRef, useState } from 'react';
import { ArrowLeft, Check, Download, Laptop, Printer, X } from 'lucide-react';
import { ModalFrame } from '../overlays/ModalFrame';
import { BlueSteamLogo } from '../badges/BlueSteamLogo';
import type { SavedArtworkView } from '../../creative/artworkCompletion';
import { artworkDownloadName } from '../../creative/artworkCapabilities';
import { ArtworkPreview, type PreviewStatus } from './ArtworkPreview';
import { artworkKindPresentation, formatSavedDate } from './artworkKindPresentation';
import { useI18n } from '../../i18n/I18nContext';
import './artwork-viewer.css';

export function LocalArtworkViewer({ artwork, onClose, motionSource }: { artwork: SavedArtworkView; onClose: () => void; motionSource?: HTMLElement | null }) {
  const { t, locale } = useI18n();
  const source = useRef(motionSource || null);
  const [status, setStatus] = useState<PreviewStatus>('loading'), [message, setMessage] = useState('');
  const title = artwork.title || t('profile.untitled'), meta = artworkKindPresentation[artwork.type], Icon = meta.Icon;
  const date = formatSavedDate(artwork.savedAt, locale);
  const print = () => {
    setMessage('');
    const view = window.open('', '_blank');
    if (!view) { setMessage(t('profile.popupError')); return; }
    view.document.title = title;
    const img = view.document.createElement('img'); img.alt = title;
    img.style.cssText = 'width:100%;height:95vh;object-fit:contain';
    img.onload = () => { if (!view.closed) { view.focus(); view.print(); } };
    img.onerror = () => { view.close(); setMessage(t('profile.printError')); };
    view.document.body.appendChild(img); img.src = artwork.previewDataUrl;
  };
  return <ModalFrame title={title} onClose={onClose} fullScreen motionSource={source.current} header={close =>
    <header className="artwork-viewer-header"><BlueSteamLogo size="lg" variant="dark" /><button onClick={close} aria-label={t('profile.close')}><X aria-hidden="true" />{t('profile.close')}</button></header>
  }>
    {close => <div className={`local-artwork-viewer profile-kind-${artwork.type}`}>
      <section className="artwork-viewer-heading">
        <button className="artwork-viewer-back" onClick={close}><ArrowLeft aria-hidden="true" />{t('profile.back')}</button>
        <h2>{title}</h2>
        <div className="artwork-viewer-metadata"><span className="artwork-viewer-kind"><Icon aria-hidden="true" />{t(meta.titleKey)}</span><span>{date ? <time dateTime={new Date(artwork.savedAt!).toISOString()}>{date}</time> : t('profile.unknownDate')}</span>{artwork.sceneCount !== undefined && <span>{t('profile.scenes').replace('{count}', String(artwork.sceneCount))}</span>}<span className="artwork-viewer-local"><Laptop aria-hidden="true" />{t('profile.local')}</span></div>
      </section>
      <div className="artwork-viewer-body">
        <div><div className="artwork-full-view"><ArtworkPreview src={artwork.previewDataUrl} alt={title} onStatusChange={setStatus} /></div>{artwork.type !== 'drawing' && <p className="artwork-viewer-note">{t(artwork.type === 'habitat' ? 'profile.habitatImage' : 'profile.scanImage')}</p>}</div>
        <aside className="artwork-viewer-actions" aria-label={t('profile.actions')}>
          {status === 'loaded' ? <a className="ocean-button coral" href={artwork.previewDataUrl} download={artworkDownloadName(title, artwork.previewDataUrl)}><Download aria-hidden="true" />{t('profile.download')}</a> : <button className="ocean-button coral" disabled><Download aria-hidden="true" />{t('profile.download')}</button>}
          <button className="ocean-button outline" disabled={status !== 'loaded'} onClick={print}><Printer aria-hidden="true" />{t('profile.print')}</button>
          {message && <p role="status" className="artwork-viewer-message">{message}</p>}
          <p className="artwork-viewer-saved"><Check aria-hidden="true" />{t('profile.saved')}</p>
        </aside>
      </div>
    </div>}
  </ModalFrame>;
}
