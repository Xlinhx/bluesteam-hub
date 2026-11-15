import { ResourceFactIcon } from '../visuals/ResourceFactIcon';
import { ResourceDetailFrame, ResourceDetailFormats } from './ResourceDetailFrame';
import { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Printer,
  Download,
  Palette,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ResourceDto } from '../../api/catalog';
import { oceanAudio, type SpeechProfile } from '../../audio/oceanAudio';
import { useOceanChoreography } from '../motion/useOceanChoreography';

export interface ResourceRendererProps {
  resource: ResourceDto;
  onSelectVariant?: (variantId: string, kind: string, drawingTemplateKey?: string | null) => void;
  onOpenDrawing?: (templateKey: string) => void;
  narrationProfile?: SpeechProfile;
}

export function ResourceRenderer({
  resource,
  onSelectVariant,
  onOpenDrawing,
  narrationProfile,
}: ResourceRendererProps) {
  const scene = useRef<HTMLDivElement>(null);
  useOceanChoreography(scene, 'detail');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAdultDetails, setShowAdultDetails] = useState(false);
  const [albumIndex, setAlbumIndex] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(
    resource.content?.durationSeconds || 0,
  );
  const [_videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsSpeaking(false);
    setAlbumIndex(0);
    setVideoError(null);
    setVideoCurrentTime(0);
    setVideoDuration(resource.content?.durationSeconds || 0);
    oceanAudio.stop();
    return () => {
      oceanAudio.stop();
    };
  }, [resource.id]);

  const narrationText =
    resource.content?.narrationText ||
    `${resource.title}. ${resource.description}`;

  const handleToggleNarration = () => {
    if (isSpeaking) {
      oceanAudio.stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsSpeaking(false);
      return;
    }
    if (!narrationProfile) oceanAudio.playChime(523.25, 0.2);
    setIsSpeaking(oceanAudio.speak(narrationText, {profile:narrationProfile,onEnd:()=>setIsSpeaking(false)}));
  };

  const isCutoutSpecimen =
    (resource.mediaUrl || resource.coverUrl || '').endsWith('.png');
  const albumUrls =
    resource.content?.albumUrls && resource.content.albumUrls.length > 0
      ? resource.content.albumUrls
      : [resource.mediaUrl || resource.coverUrl || ''];

  const currentImage = albumUrls[albumIndex] || albumUrls[0];
  const shortFacts = (resource.content?.shortFacts || []).slice(0, 3);
  const isPrintable = ['coloring', 'worksheet', 'poster'].includes(resource.kind);
  const isPdf = resource.mediaMimeType === 'application/pdf' || /\.pdf(?:[?#]|$)/i.test(resource.mediaUrl || '');
  const hasVideoMedia = Boolean(resource.mediaUrl) && !/\.(?:jpe?g|png|webp|svg)(?:[?#]|$)/i.test(resource.mediaUrl || '');

  const handlePrint = () => {
    if (isPdf && resource.mediaUrl) {
      window.open(resource.mediaUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    oceanAudio.playChime(659.25, 0.15);
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  const handleDownload = () => {
    oceanAudio.playChime(587.33, 0.15);
    if (typeof document !== 'undefined') {
      const a = document.createElement('a');
      a.href = resource.mediaUrl || resource.coverUrl || '';
      const mimeExtensions: Record<string, string> = {'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/svg+xml':'svg'};
      const extension = mimeExtensions[resource.mediaMimeType || ''] || (resource.mediaUrl || resource.coverUrl || '').match(/\.([a-z0-9]+)(?:[?#]|$)/i)?.[1] || 'png';
      a.download = `${resource.title.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
      a.click();
    }
  };

  return (
    <ResourceDetailFrame sceneRef={scene} title={resource.title} listening={isSpeaking} className="resource-media-renderer"
      titleAction={<button type="button" onClick={handleToggleNarration} aria-label={`Nghe tên ${resource.title}`}
        className="observation-name-audio"><Volume2 /></button>}
      stage={<div className="observation-photo observation-photo--media flex flex-col gap-4">
        <div className="relative w-full min-h-[320px] max-h-[620px] rounded-[20px] bg-[#F6F3EB] border border-[#D7E4E7] overflow-hidden flex flex-col items-center justify-center p-6">
          {/* 1. VIDEO RENDERER */}
          {resource.kind === 'video' && (
            <div className="w-full flex flex-col gap-4">
              <div className="relative w-full aspect-video rounded-[16px] bg-[#0B2230] overflow-hidden flex items-center justify-center">
                {hasVideoMedia ? (
                  <video
                    ref={videoRef}
                    src={resource.mediaUrl || undefined}
                    poster={resource.coverUrl || undefined}
                    controls
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(e) => {
                      const dur = e.currentTarget.duration;
                      if (Number.isFinite(dur) && dur > 0) setVideoDuration(Math.round(dur));
                    }}
                    onTimeUpdate={(e) => setVideoCurrentTime(Math.round(e.currentTarget.currentTime))}
                    onError={() => setVideoError('Không tải được tệp video. Bé hãy thử lại nhé.')}
                    className="w-full h-full object-contain"
                  />
                ) : <p role="status" className="text-white text-center p-6">Chưa có tệp video.</p>}

              </div>

              {videoError && (
                <div role="alert" className="p-3 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                  {videoError} <button onClick={() => { setVideoError(null); videoRef.current?.load(); }} className="underline ml-2 min-h-[48px]">Thử lại</button>
                </div>
              )}

              <div className="flex items-center justify-between px-2 text-sm font-bold text-[#12384B]">
                <span>
                  {videoDuration > 0 ? `Thời lượng: ${Math.floor(videoDuration / 60)}:${String(videoDuration % 60).padStart(2, '0')}` : ''}
                </span>
                {resource.content?.chapters && resource.content.chapters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {resource.content.chapters.map((ch, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setVideoCurrentTime(ch.timeSeconds);
                          if (videoRef.current) {
                            videoRef.current.currentTime = ch.timeSeconds;
                          }
                          oceanAudio.speak(ch.title, { profile: narrationProfile });
                        }}
                        className="px-3 py-1.5 min-h-[44px] rounded-full bg-white border border-[#D7E4E7] text-xs font-bold text-[#17657A] hover:bg-[#D8EDF0] cursor-pointer"
                      >
                        {ch.title} ({ch.timeSeconds}s)
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. AUDIO RENDERER */}
          {resource.kind === 'audio' && (
            <div className="w-full max-w-lg flex flex-col items-center gap-6 py-6">
              {resource.coverUrl && (
                <img
                  src={resource.coverUrl}
                  alt={resource.title}
                  className="resource-media-cover w-48 h-48 rounded-[20px] object-cover border-2 border-white shadow-sm"
                />
              )}
              {resource.mediaUrl && (
                <audio
                  ref={audioRef}
                  controls
                  preload="metadata"
                  onError={() => setVideoError('Không tải được tệp âm thanh. Bé hãy thử lại nhé.')}
                  src={resource.mediaUrl}
                  onEnded={() => setIsSpeaking(false)}
                />
              )}
              {!resource.mediaUrl && <p>Chưa có tệp âm thanh.</p>}
              {videoError && <p role="alert">{videoError} <button className="underline min-h-[48px]" onClick={() => {setVideoError(null);audioRef.current?.load();}}>Thử lại</button></p>}
              {/* Decorative rhythm; never presented as measured audio data. */}
              <div
                className="flex items-end justify-center gap-2 h-20 w-full px-6"
                aria-hidden="true"
              >
                {(resource.content?.waveformPeaks || [0.3, 0.6, 0.85, 0.5, 0.9, 0.65, 0.4, 0.75, 0.55, 0.35]).map(
                  (peak, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${Math.max(20, Math.round(peak * 100))}%` }}
                      className={`w-3 rounded-full transition-colors ${
                        isSpeaking ? 'bg-[#B74A36]' : 'bg-[#17657A]/60'
                      }`}
                    />
                  ),
                )}
              </div>
            </div>
          )}

          {/* 3. PRINTABLE A4 RENDERER (coloring / worksheet / poster) */}
          {isPrintable && resource.mediaUrl && (
            <div
              id="printable-sheet"
              className="w-full max-w-[420px] aspect-[1/1.414] bg-white rounded-[16px] border border-[#D7E4E7] p-6 flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs font-bold text-[#436475]">
                <span>BlueSTEAM • Học liệu in A4</span>
                <span>{resource.title}</span>
              </div>
              <div className="flex-1 flex items-center justify-center py-4">
                {isPdf ? <a href={resource.mediaUrl || undefined} target="_blank" rel="noreferrer" className="resource-secondary">Mở bản PDF</a> : currentImage ? <img
                  src={currentImage}
                  alt={resource.title}
                  className="resource-media-cover max-h-[300px] w-auto object-contain"
                /> : <p role="status">Chưa có bản in.</p>}
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs text-[#436475]">
                <span>Tên của bé: ....................................</span>
                <span>Khổ A4</span>
              </div>
            </div>
          )}

          {isPrintable && !resource.mediaUrl && <div className="flex min-h-[240px] w-full flex-col items-center justify-center gap-4 rounded-[24px] bg-[#E5F1EF] p-6 text-center text-[#12384B]">
            {resource.coverUrl ? <img src={resource.coverUrl} alt={resource.title} className="max-h-[240px] rounded-[16px] object-contain"/> : <Palette size={64} strokeWidth={1.3}/>}
            <p>{resource.kind==='coloring' && resource.content.drawingTemplateKey?'Mở mẫu và tô màu theo cách của bé.':'Chưa có bản in.'}</p>
          </div>}

          {/* 4. FLASHCARD / IMAGE SPECIMEN RENDERER */}
          {(resource.kind === 'flashcard' || resource.kind === 'image') && (
            <div className="relative w-full flex items-center justify-center min-h-[340px] max-h-[520px] rounded-[20px] overflow-hidden">
              {currentImage ? <img
                src={currentImage}
                alt={resource.title}
                className={`max-h-[480px] rounded-[20px] ${
                  isCutoutSpecimen
                    ? 'w-auto object-contain p-4'
                    : 'w-full h-[440px] object-cover'
                }`}
              /> : <p role="status">Chưa có hình ảnh.</p>}

              {albumUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setAlbumIndex((prev) => (prev - 1 + albumUrls.length) % albumUrls.length)
                    }
                    aria-label="Ảnh trước"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 border border-[#D7E4E7] text-[#12384B] flex items-center justify-center cursor-pointer hover:bg-[#D8EDF0] shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlbumIndex((prev) => (prev + 1) % albumUrls.length)}
                    aria-label="Ảnh tiếp theo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 border border-[#D7E4E7] text-[#12384B] flex items-center justify-center cursor-pointer hover:bg-[#D8EDF0] shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Coral Nghe Pill Overlaid at Bottom Center matching 03-learner-resource-detail.png */}
              <button
                type="button"
                onClick={handleToggleNarration}
                aria-pressed={isSpeaking}
                className={`absolute bottom-5 left-1/2 -translate-x-1/2 min-h-[56px] px-8 rounded-full font-extrabold text-xl flex items-center gap-3 cursor-pointer transition-colors shadow-lg ${
                  isSpeaking
                    ? 'bg-[#12384B] text-white'
                    : 'bg-[#D96045] hover:bg-[#c25138] text-white'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                <span>{isSpeaking ? 'Dừng nghe' : 'Nghe'}</span>
                <span className="sr-only">Nghe thuyết minh</span>
              </button>
            </div>
          )}
        </div>

        {/* PRIMARY CHILD ACTION ROW FOR NON-IMAGE KINDS */}
        {resource.kind !== 'flashcard' && resource.kind !== 'image' && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleToggleNarration}
              aria-pressed={isSpeaking}
              className={`min-h-[60px] px-8 rounded-full font-bold text-xl flex items-center gap-3 cursor-pointer transition-colors ${
                isSpeaking
                  ? 'bg-[#12384B] text-white'
                  : 'bg-[#D96045] hover:bg-[#c25138] text-white'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
              <span>{isSpeaking ? 'Dừng nghe' : 'Nghe thuyết minh'}</span>
            </button>

            {resource.kind === 'coloring' && resource.content?.drawingTemplateKey && onOpenDrawing && (
              <button
                type="button"
                onClick={() => onOpenDrawing(resource.content.drawingTemplateKey!)}
                className="min-h-[60px] px-7 rounded-full bg-[#17657A] hover:bg-[#125061] text-white font-bold text-xl flex items-center gap-3 cursor-pointer"
              >
                <Palette className="w-6 h-6" />
                <span>Tô màu trên màn hình</span>
              </button>
            )}

            {isPrintable && resource.mediaUrl && (
              <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="min-h-[48px] px-5 rounded-[12px] bg-white border border-[#D7E4E7] text-[#12384B] font-bold text-base flex items-center gap-2 hover:bg-[#D8EDF0] cursor-pointer"
                >
                  <Download className="w-5 h-5 text-[#17657A]" />
                  <span>Tải bản in (Người lớn)</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="min-h-[48px] px-5 rounded-[12px] bg-white border border-[#D7E4E7] text-[#12384B] font-bold text-base flex items-center gap-2 hover:bg-[#D8EDF0] cursor-pointer"
                >
                  <Printer className="w-5 h-5 text-[#17657A]" />
                  <span>In A4</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>}
      notes={<div className="resource-media-notes flex flex-col gap-5">
        {/* Up to 3 Short Facts with 64px Circular Pictogram & 2-4 word label (UI-SPEC 2.4 & M03.4) */}
        {shortFacts.length > 0 && (
          <div className="flex flex-col gap-2.5" aria-label="Đặc điểm nổi bật cho bé">
            {shortFacts.map((fact, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (!narrationProfile) oceanAudio.playChime(587.33, 0.15);
                  oceanAudio.speak(`${fact.label}. ${fact.detail || ''}`, { profile: narrationProfile });
                }}
                className="w-full p-3 rounded-[20px] bg-[#F6F3EB] hover:bg-[#D8EDF0]/70 border border-[#D7E4E7] flex items-center gap-4 text-left cursor-pointer transition-colors"
              >
                <div className="resource-media-fact-icon w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-[#D8EDF0] border border-[#17657A]/15 flex items-center justify-center shrink-0">
                  <ResourceFactIcon iconKey={fact.iconKey} className="w-7 h-7 text-[#17657A]" />
                </div>
                <div className="resource-media-fact-copy flex-1">
                  <div className="text-[20px] leading-[28px] font-extrabold text-[#12384B]">
                    {fact.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <ResourceDetailFormats key={resource.id} kind={resource.kind} id={resource.id}
          variants={resource.variants} drawingTemplate={resource.content.drawingTemplateKey}
          onOpen={onSelectVariant} onOpenDrawing={onOpenDrawing}/>
        {/* Related Sea Creatures Strip in Right Column matching 03-learner-resource-detail.png */}
        {Boolean(resource.related?.length) && <div className="pt-2">
          <div className="text-base font-extrabold text-[#12384B] mb-2.5">
            Sinh vật liên quan
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(resource.related || []).slice(0,3).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectVariant?.(item.id, item.kind, null)}
                className="rounded-[18px] bg-[#F6F3EB] hover:bg-white border border-[#D7E4E7] p-2.5 flex flex-col items-center gap-1.5 cursor-pointer transition-all"
              >
                <div className="w-full aspect-square rounded-[12px] bg-white flex items-center justify-center p-2 overflow-hidden">
                  <img src={item.coverUrl || ''} alt={item.title} className="w-full h-full object-contain" />
                </div>
                <span className="text-sm font-extrabold text-[#12384B]">{item.title}</span>
              </button>
            ))}
          </div>
        </div>}

        {/* Adult Disclosure for longer descriptions (UI-SPEC 2.4 & M03.4) */}
        <div className="pt-1 border-t border-[#D7E4E7]">
          <button
            type="button"
            onClick={() => setShowAdultDetails((prev) => !prev)}
            aria-expanded={showAdultDetails}
            className="min-h-[40px] text-xs font-bold text-[#17657A] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <span>Xem thêm gợi ý cho người lớn</span>
            {showAdultDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showAdultDetails && (
            <div className="mt-2 p-4 rounded-[16px] bg-white border border-[#D7E4E7] text-base leading-6 text-[#12384B] space-y-2">
              <p>{resource.description}</p>
              {shortFacts.map(
                (f, i) =>
                  f.detail && (
                    <p key={i} className="text-sm text-[#436475]">
                      • <strong>{f.label}:</strong> {f.detail}
                    </p>
                  ),
              )}
            </div>
          )}
        </div>
      </div>}/>
  );
}
