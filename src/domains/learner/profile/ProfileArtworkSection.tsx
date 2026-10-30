import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useI18n } from '../../../shared/i18n/I18nContext';
import { useRouter } from '../../../app/router';
import type { SavedArtworkView } from '../../../shared/creative/artworkCompletion';
import { ArtworkPreview } from '../../../shared/ui/artworks/ArtworkPreview';
import { artworkKindPresentation, formatSavedDate } from '../../../shared/ui/artworks/artworkKindPresentation';
import type { ProfileArtworkPage } from './profileCollection';

export function ProfileArtworkSection({ section, onOpen, onLoadMore, refreshing }: { section: ProfileArtworkPage; onOpen: (art: SavedArtworkView, source: HTMLElement) => void; onLoadMore: () => Promise<boolean>; refreshing: boolean }) {
  const { t, locale } = useI18n(), { navigate } = useRouter();
  const list = useRef<HTMLUListElement>(null);
  const focusIntent = useRef<{ index:number; trigger:HTMLButtonElement; origin:Element|null; confirmed:boolean } | null>(null);
  const [focusRevision,setFocusRevision] = useState(0);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const relinquish=(event:Event)=>{
      const intent=focusIntent.current, target=event.target;
      if(!intent || !(target instanceof Node) || intent.trigger.contains(target))return;
      if(event.type==='focusin' && target===document.body)return;
      focusIntent.current=null;
    };
    document.addEventListener('pointerdown',relinquish,true); document.addEventListener('focusin',relinquish,true);
    return () => { mounted.current = false; focusIntent.current=null; document.removeEventListener('pointerdown',relinquish,true);document.removeEventListener('focusin',relinquish,true); };
  }, []);
  const meta = artworkKindPresentation[section.kind], Icon = meta.Icon;
  const visible = section.items, remaining = Math.max(0, section.total - visible.length);
  useEffect(()=>{
    const intent=focusIntent.current;
    if(!intent?.confirmed || visible.length<=intent.index)return;
    focusIntent.current=null;
    // Safari does not focus a button when tapped. Preserve that starting focus,
    // but relinquish the intent if the user acts elsewhere while loading.
    if(document.activeElement!==intent.trigger && document.activeElement!==document.body && document.activeElement!==intent.origin)return;
    list.current?.querySelectorAll<HTMLButtonElement>('.profile-art')[intent.index]?.focus();
  },[visible.length,focusRevision]);
  const reveal = async (trigger: HTMLButtonElement) => {
    const intent={index:visible.length,trigger,origin:document.activeElement,confirmed:false};
    focusIntent.current=intent;
    const succeeded=await onLoadMore();
    if(!mounted.current || focusIntent.current!==intent)return;
    if(!succeeded){focusIntent.current=null;return;}
    intent.confirmed=true; setFocusRevision(value=>value+1);
  };
  return <section className={`profile-collection-section profile-kind-${section.kind}`} data-artwork-section={section.kind} aria-labelledby={`profile-${section.kind}-heading`}>
    <header className="profile-section-heading"><span className="profile-section-icon"><Icon aria-hidden="true" size={24} strokeWidth={2} /></span><div><div className="profile-section-title"><h3 id={`profile-${section.kind}-heading`}>{t(meta.titleKey)}</h3><span className="profile-section-count" aria-label={t('profile.count').replace('{count}', String(section.total))}>{section.total}</span></div><p>{t(meta.descriptionKey)}</p></div></header>
    {section.items.length ? <>
      <ul className="profile-art-grid" ref={list}>{visible.map(art => {
        const title = art.title || t('profile.untitled'), date = formatSavedDate(art.savedAt, locale);
        return <li key={art.id}><button className="profile-art" data-artwork-id={art.id} aria-label={t('profile.open').replace('{title}', title)} onClick={event => onOpen(art, event.currentTarget)}>
          <ArtworkPreview src={art.previewDataUrl} alt="" lazy />
          <div className="profile-art-caption"><h4>{title}</h4><p>{date ? <time dateTime={new Date(art.savedAt!).toISOString()}>{date}</time> : t('profile.unknownDate')}{art.sceneCount !== undefined && <span className="profile-scene-count">{t('profile.scenes').replace('{count}', String(art.sceneCount))}</span>}</p><ArrowRight className="profile-art-open" size={20} aria-hidden="true" /></div>
        </button></li>;
      })}</ul>
      {section.moreError && <p className="profile-more-error" role="alert">{t('profile.moreError')}</p>}
      {section.nextCursor && <button className="profile-show-more" disabled={refreshing || section.loadingMore} aria-busy={section.loadingMore} onClick={event => void reveal(event.currentTarget)}><Plus size={18} aria-hidden="true" />{section.loadingMore ? t('profile.moreLoading') : section.moreError ? t('profile.moreRetry') : t('profile.more').replace('{count}', String(Math.min(6, remaining) || 6))}</button>}
    </> : <div className="profile-section-empty"><p>{t(meta.emptyKey)}</p><button onClick={() => navigate(meta.path, { query: meta.query, preserveQuery: false })}>{t(meta.actionKey)}<ArrowRight size={18} aria-hidden="true" /></button></div>}
  </section>;
}
