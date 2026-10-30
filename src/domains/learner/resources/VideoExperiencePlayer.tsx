import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { Experience } from '../../../shared/types/experience';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Tv,
} from 'lucide-react';

interface VideoExperiencePlayerProps {
  experience: Experience;
  isPresentation?: boolean;
  onComplete?: () => void;
  onPresentationRequest?: () => void;
}

export function VideoExperiencePlayer({
  experience,
  isPresentation = false,
  onComplete,
  onPresentationRequest,
}: VideoExperiencePlayerProps) {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  const chapters = (experience.runtimeConfig?.chapters as { timeSeconds: number; title: string }[]) || [
    { timeSeconds: 0, title: 'Surface Ocean' },
    { timeSeconds: 30, title: 'Fading Sunlight' },
    { timeSeconds: 60, title: 'Deep Descent' },
  ];

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 100, seconds));
    setCurrentTimeSec(video.currentTime);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const cur = video.currentTime;
    const dur = video.duration || 1;
    setCurrentTimeSec(cur);
    setDurationSec(dur);
    setProgressPercent((cur / dur) * 100);

    if (cur / dur >= 0.95 && !hasCompleted) {
      setHasCompleted(true);
      onComplete?.();
    }
  };

  const handleComplete = () => {
    setHasCompleted(true);
    onComplete?.();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', () => {
      setIsPlaying(false);
      onComplete?.();
    });
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onComplete, hasCompleted]);

  const isTactile = theme === 'tactile';

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border p-6 transition-all ${
        isTactile
          ? 'bg-gradient-to-b from-[#1c232b] to-[#12171d] border-slate-700 shadow-2xl text-slate-100'
          : 'bg-gradient-to-b from-[#f9f8f5] to-[#ece8dc] border-stone-300 shadow-xl text-stone-900'
      } ${isPresentation ? 'min-h-[80vh]' : 'min-h-[560px]'}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-borderUi-soft/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-primary">
              Scientific Documentary · Video Medium
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated font-mono text-ink-muted border border-borderUi-soft">
              Duration: ~{experience.estimatedMinutes} mins
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold mt-0.5">{experience.title}</h2>
        </div>

        {onPresentationRequest && !isPresentation && (
          <button
            onClick={onPresentationRequest}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-primary hover:opacity-90 text-white rounded-xl text-xs font-mono font-medium transition-opacity cursor-pointer shadow-md"
          >
            <Tv className="w-4 h-4" />
            <span>Present</span>
          </button>
        )}
      </div>

      {/* Video Viewport Container */}
      <div className="mt-6 max-w-4xl mx-auto flex flex-col gap-4">
        {experience.runtimeConfig?.videoSrc ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-borderUi-soft shadow-2xl group">
            <video
              ref={videoRef}
              src={experience.runtimeConfig.videoSrc as string}
              className="w-full h-full object-cover"
              playsInline
              onClick={togglePlay}
            />

            {/* Big Center Play Overlay Button when paused */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs cursor-pointer transition-opacity"
              >
                <div className="w-20 h-20 rounded-full bg-brand-primary/90 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Honest Educational Placeholder - No Fake Play Button */
          <div className="relative w-full rounded-3xl bg-[#0B232F] border-2 border-[#17657A]/40 p-8 sm:p-12 text-center text-white shadow-2xl space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#17657A]/30 border border-[#2EE6CA]/50 text-[#2EE6CA] flex items-center justify-center text-3xl mx-auto">
              🎥
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-[#17657A]/40 text-[#2EE6CA] text-xs font-extrabold uppercase">
                Tài Liệu Đang Số Hóa
              </span>
              <h3 className="font-serif font-extrabold text-2xl text-white">
                Thước Phim Thám Hiểm Lặn Biển Sâu
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tư liệu video khoa học đang được chuẩn hóa bản quyền cùng Viện Nghiên Cứu Hải Dương. Dưới đây là các chương kiến thức tóm tắt trong chuyến thám hiểm:
              </p>
            </div>

            {/* Visual Chapter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {chapters.map((chap, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-xs font-mono text-[#2EE6CA] mb-1">Chương {idx + 1}</div>
                  <div className="font-bold text-sm text-white">{chap.title}</div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleComplete}
                className="px-6 py-3 rounded-full bg-[#F67650] text-[#12384B] font-extrabold text-sm shadow-md hover:bg-[#F2643A] transition-colors cursor-pointer"
              >
                Hoàn Thành Phần Quan Sát
              </button>
            </div>
          </div>
        )}

        {/* Custom Art-Directed Video Control Bar */}
        <div className="bg-surface-elevated rounded-xl p-4 border border-borderUi-soft space-y-3 shadow-md">
          {/* Timeline Scrub Rail with Chapter Markers */}
          <div className="relative w-full h-3 bg-surface-sunken rounded-full overflow-hidden cursor-pointer">
            <div
              className="h-full bg-brand-primary transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Chapter Quick Jumps */}
          <div className="flex flex-wrap gap-2 pt-1">
            {chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => handleSeek(ch.timeSeconds)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-surface-interactive hover:bg-brand-primary hover:text-white transition-colors border border-borderUi-soft/60 cursor-pointer"
              >
                {ch.title}
              </button>
            ))}
          </div>

          {/* Controls: Play, Replay, Time, Mute, Fullscreen */}
          <div className="flex items-center justify-between pt-2 border-t border-borderUi-soft">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow hover:opacity-90 transition-opacity cursor-pointer touch-target-child"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => handleSeek(0)}
                className="w-10 h-10 rounded-xl bg-surface-interactive text-ink-secondary hover:text-ink-primary flex items-center justify-center transition-colors cursor-pointer"
                title="Replay from start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs text-ink-secondary ml-1">
                {formatTime(currentTimeSec)} / {formatTime(durationSec || 180)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="w-10 h-10 rounded-xl bg-surface-interactive text-ink-secondary hover:text-ink-primary flex items-center justify-center transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-sky-500" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current?.requestFullscreen) {
                    videoRef.current.requestFullscreen();
                  }
                }}
                className="w-10 h-10 rounded-xl bg-surface-interactive text-ink-secondary hover:text-ink-primary flex items-center justify-center transition-colors cursor-pointer"
                title="Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
