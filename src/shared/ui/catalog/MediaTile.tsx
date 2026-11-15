import React from 'react';
import { Volume2, Bookmark, Image as ImageIcon, Film, Palette, BookOpen } from 'lucide-react';
import { oceanAudio } from '../../audio/oceanAudio';
import { useBookmarkMotion } from '../motion/useBookmarkMotion';

export interface MediaTileProps {
  variant?: 'default' | 'resource-catalog';
  id?: string;
  title: string;
  description?: string;
  kind?: string;
  imageSrc?: string;
  imageUrl?: string | null;
  imageMode?: 'cutout' | 'cover';
  visualGradient?: string;
  formatBadge?: string;
  durationLabel?: string;
  bookmarked?: boolean;
  topicBadge?: string;
  statusBadge?: {
    label: string;
    tone: 'published' | 'draft' | 'hidden' | 'seed';
  };
  narrationText?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onOpen?: () => void;
  onSpeak?: () => void;
  onToggleBookmark?: () => void;
  secondaryActions?: React.ReactNode;
}

export function MediaTile({
  id,
  variant = 'default',
  title,
  description,
  kind,
  imageSrc,
  imageUrl,
  imageMode = 'cover',
  visualGradient = 'from-[#F6F3EB] via-[#EFEAE1] to-[#E6E0D4]',
  formatBadge,
  durationLabel,
  bookmarked = false,
  topicBadge,
  statusBadge,
  narrationText,
  primaryActionLabel = 'Mở học liệu',
  onPrimaryAction,
  onOpen,
  onSpeak,
  onToggleBookmark,
  secondaryActions,
}: MediaTileProps) {
  const resourceCatalog = variant === 'resource-catalog';
  const bookmark = useBookmarkMotion(bookmarked, title);
  const KIND_VI_LABELS: Record<string, string> = {
    flashcard: 'Thẻ hình',
    collection: 'Thẻ học liệu',
    image: 'Hình ảnh',
    audio: 'Âm thanh',
    video: 'Video',
    coloring: 'Tranh tô màu',
    worksheet: 'Phiếu học tập',
    poster: 'Poster',
  };
  const resolvedImageSrc = imageSrc || imageUrl || (resourceCatalog ? '' : '/assets/generated/creatures/sea_turtle_card.jpg');
  const [failedImage, setFailedImage] = React.useState<string | null>(null);
  const resolvedFormatBadge =
    formatBadge || (kind ? KIND_VI_LABELS[kind] || kind : 'Học liệu');
  const resolvedPrimaryAction = onPrimaryAction || onOpen || (() => {});
  const handleNarrate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSpeak) {
      onSpeak();
      return;
    }
    oceanAudio.speak(narrationText || `${title}. ${description || ''}`);
  };

  const renderKindIcon = () => {
    if (kind === 'video') return <Film className="w-4 h-4 text-[#15586E] shrink-0" />;
    if (kind === 'audio') return <Volume2 className="w-4 h-4 text-[#15586E] shrink-0" />;
    if (kind === 'coloring' || kind === 'worksheet') return <Palette className="w-4 h-4 text-[#15586E] shrink-0" />;
    if (kind === 'flashcard' || kind === 'collection') return <BookOpen className="w-5 h-5 text-[#15586E] shrink-0" />;
    return <ImageIcon className="w-4 h-4 text-[#15586E] shrink-0" />;
  };

  const statusToneClasses: Record<
    NonNullable<MediaTileProps['statusBadge']>['tone'],
    string
  > = {
    published: 'bg-[#E8F8F0] text-[#14532D] border-[#1F9D6A]/30',
    draft: 'bg-[#FEF3C7] text-[#92400E] border-[#D97706]/30',
    hidden: 'bg-slate-100 text-slate-600 border-slate-300',
    seed: 'bg-[#E4F3FB] text-[#15586E] border-[#15586E]/25',
  };

  return (
    <article
      data-resource-id={id}
      data-resource-kind={kind}
      className={
        resourceCatalog
          ? 'group relative min-w-0 bg-transparent flex flex-col overflow-visible'
          : 'group rounded-[24px] bg-[#F6F3EB] border border-[#12384B]/10 shadow-[0_6px_20px_rgba(18,56,75,0.06)] hover:shadow-[0_12px_28px_rgba(18,56,75,0.12)] transition-all duration-200 overflow-hidden flex flex-col justify-between p-3'
      }
    >
      {/* Wide catalog photo or standard 4:3 visual */}
      <div
        className={`relative w-full ${resourceCatalog ? 'aspect-[2.25/1] rounded-[14px]' : 'aspect-[4/3] rounded-[18px]'} overflow-hidden cursor-pointer flex items-center justify-center bg-gradient-to-br ${visualGradient}`}
      >
        <button type="button" onClick={resolvedPrimaryAction} aria-label={`${primaryActionLabel}: ${title}`} className="absolute inset-0 z-[1] cursor-pointer focus-visible:outline-3 focus-visible:outline-[#17657A] focus-visible:outline-offset-[-3px]" />
        {!resolvedImageSrc || failedImage === resolvedImageSrc ? <span role="img" aria-label={`Chưa có ảnh ${title}`} className="text-[#436475]"><ImageIcon className="w-12 h-12"/></span> : imageMode === 'cutout' ? (
          <img
            src={resolvedImageSrc}
            alt={title}
            onError={() => setFailedImage(resolvedImageSrc)}
            className="w-4/5 h-4/5 object-contain drop-shadow-[0_10px_18px_rgba(18,56,75,0.16)] transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <img
            src={resolvedImageSrc}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={() => setFailedImage(resolvedImageSrc)}
            className={`w-full h-full object-cover ${resourceCatalog ? '' : 'transition-transform duration-300 group-hover:scale-105'}`}
          />
        )}

        {/* Subtle format & status metadata */}
        <span className="sr-only">{resolvedFormatBadge}</span>
        {topicBadge && <span className="sr-only">{topicBadge}</span>}
        {durationLabel && (
          <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#12384B]/80 text-white text-[11px] font-bold">
            {durationLabel}
          </span>
        )}

        {/* Top Right Bookmark or Status */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {statusBadge && (
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                statusToneClasses[statusBadge.tone]
              }`}
            >
              {statusBadge.label}
            </span>
          )}
          {onToggleBookmark && (
            <button
              ref={bookmark}
              aria-pressed={bookmarked}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark();
              }}
              aria-label={bookmarked ? `Bỏ lưu ${title}` : `Lưu ${title}`}
              className={`relative z-[2] w-11 h-11 rounded-full flex items-center justify-center border shadow-xs cursor-pointer transition-all ${
                bookmarked
                  ? 'bg-[#FFF5EC] text-[#E96A49] border-[#E96A49]/35'
                  : resourceCatalog
                    ? 'bg-transparent text-white border-transparent shadow-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] hover:bg-white/20'
                    : 'bg-white/90 hover:bg-white text-[#12384B]/70 border-[#12384B]/10'
              }`}
            >
              <Bookmark className={resourceCatalog ? 'w-5 h-5' : 'w-4 h-4'} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* Clean Footer Row matching 02-learner-resources.png */}
      <div className={`flex items-center justify-between gap-2 ${resourceCatalog ? 'pt-2 px-1 pb-0.5' : 'pt-3 px-1 pb-0.5'}`}>
        <button
          type="button"
          onClick={resolvedPrimaryAction}
          aria-label={`${primaryActionLabel}: ${title}`}
          className="flex items-center gap-2 text-left cursor-pointer min-w-0 flex-1"
        >
          <span className={resourceCatalog ? 'w-6 h-6 flex items-center justify-center shrink-0' : 'w-7 h-7 rounded-lg bg-white border border-[#12384B]/10 flex items-center justify-center shrink-0'}>
            {renderKindIcon()}
          </span>
          <h3 className={resourceCatalog ? 'font-sans font-semibold text-base text-[#12384B] leading-snug truncate' : 'font-sans font-extrabold text-lg text-[#12384B] leading-snug truncate'}>
            {title}
          </h3>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {secondaryActions}
          <button
            type="button"
            onClick={handleNarrate}
            aria-label={`Nghe giới thiệu ${title}`}
            className={`w-10 h-10 rounded-full bg-[#D8EDF0] hover:bg-[#C6E4E9] text-[#15586E] flex items-center justify-center cursor-pointer transition-transform active:scale-95 shrink-0 ${resourceCatalog ? '-translate-y-3 border-2 border-white shadow-[0_3px_10px_rgba(18,56,75,0.12)]' : ''}`}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
