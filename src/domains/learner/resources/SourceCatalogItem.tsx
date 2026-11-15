import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Bookmark, Check, Download, FileText, Image, Pause, Play, Volume2, ZoomIn } from 'lucide-react';
import type { OceanItem } from '../../../shared/api/learnerOcean';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import { useBookmarkMotion } from '../../../shared/ui/motion/useBookmarkMotion';

export function SourceCatalogItem({ entry, saved, onSave, onOpen }: {
  entry: Pick<OceanItem, 'id' | 'title' | 'kind' | 'image' | 'images' | 'file' | 'audio'>; saved: boolean; onSave: () => void; onOpen: () => void;
}) {
  const { title, kind, id } = entry;
  const bookmark = useBookmarkMotion(saved, id);
  const image = entry.image || entry.images?.[0];
  const [failedImage, setFailedImage] = useState<string>();
  const flashcard = kind === 'flashcard';
  const paper = ['coloring', 'worksheet', 'poster'].includes(kind);
  const CoverIcon = kind === 'image' ? ZoomIn : kind === 'video' ? Play : null;
  const openLabel = `Mở học liệu: ${title}`;
  const saveButton = <button ref={bookmark} className="source-item-save" type="button" aria-pressed={saved}
    aria-label={`${saved ? 'Bỏ lưu' : 'Lưu'} ${title}`} onClick={onSave}>
    <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} aria-hidden="true"/>
    <span>{saved ? 'Đã lưu' : 'Lưu'}</span>{saved && <Check size={14} aria-hidden="true"/>}
  </button>;

  return <article className="source-item" data-resource-id={id} data-resource-kind={kind}>
    {kind === 'audio' || kind === 'download' ? <section className="source-file-row">
      {kind === 'audio' ? <TrackPreview key={entry.file || entry.audio} title={title} src={entry.file || entry.audio} onOpen={onOpen}/> :
        <span className="source-file-icon"><FileText size={25} aria-hidden="true"/></span>}
      <h3><button type="button" onClick={onOpen} aria-label={openLabel}>{title}</button></h3>
      {kind === 'download' && entry.file && <a className="source-download" href={entry.file} download aria-label={`Tải xuống ${title}`}>
        <Download size={20} aria-hidden="true"/> Tải xuống
      </a>}
      {saveButton}
    </section> : <>
      <button type="button" className="source-item-cover" onClick={onOpen} aria-label={openLabel}>
        {image && failedImage !== image ? <img src={image} alt="" loading="lazy" decoding="async" onError={() => setFailedImage(image)}/> :
          <span className="source-item-placeholder"><Image size={32} aria-hidden="true"/>Chưa có ảnh xem trước</span>}
        {CoverIcon && <span className="source-cover-action"><CoverIcon size={21} aria-hidden="true"/></span>}
      </button>
      {!flashcard && <h3>{title}</h3>}
      <footer className="source-item-actions">
        {flashcard && <button type="button" className="source-item-listen" aria-label={`Nghe ${title}`}
          onClick={() => void oceanAudio.playNarration(entry.audio, title, {profile:'learner-resource'})}><Volume2 size={21} aria-hidden="true"/></button>}
        {saveButton}
        {(flashcard || paper) && <button type="button" className="source-item-open" onClick={onOpen}
          aria-label={`${flashcard ? 'Mở thẻ' : 'Xem trước'} ${title}`}>
          {flashcard ? 'Mở thẻ' : 'Xem trước'} <ArrowUpRight size={16} aria-hidden="true"/>
        </button>}
      </footer>
    </>}
  </article>;
}

function TrackPreview({ title, src, onOpen }: { title: string; src?: string; onOpen: () => void }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const track = audio.current;
    return () => track?.pause();
  }, []);

  function togglePlayback() {
    const track = audio.current;
    if (!track) return;
    if (track.paused) void track.play().catch((reason: unknown) => {
      if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError(true);
    });
    else track.pause();
  }

  return <>
    {src && !error ? <button type="button" className="source-track-play" data-playing={playing} aria-label={`${playing ? 'Tạm dừng' : 'Phát'} ${title}`} onClick={togglePlayback}>
      {playing ? <Pause size={21} aria-hidden="true"/> : <Play size={21} aria-hidden="true"/>}
    </button> : <button type="button" className="source-track-play" aria-label={`Xem chi tiết ${title}`} onClick={onOpen}>
      <ArrowUpRight size={21} aria-hidden="true"/>
    </button>}
    {src && <audio ref={audio} src={src} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onEnded={() => setPlaying(false)} onError={() => { setPlaying(false); setError(true); }}
      onDurationChange={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
      onTimeUpdate={event => setElapsed(event.currentTarget.currentTime)}/>}
    {duration > 0 && !error && <input className="source-track-progress" type="range" min={0} max={duration} step="any" value={elapsed}
      style={{'--played': `${Math.min(100, elapsed / duration * 100)}%`} as CSSProperties}
      aria-label={`Vị trí phát ${title}`} onChange={event => {
        if (!audio.current) return;
        audio.current.currentTime = event.target.valueAsNumber;
        setElapsed(event.target.valueAsNumber);
      }}/>}
    {duration > 0 && !error && <span className="source-track-duration">{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>}
    {error && <span className="source-track-error" role="status">Chưa phát được</span>}
  </>;
}
