import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Subtitles,
  ChevronRight,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface Chapter {
  id: number;
  timeSeconds: number;
  timeDisplay: string;
  title: string;
  thumbnail: string;
  narration: string;
}

export function VideoPlayerPage() {
  const { navigate } = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(15); // Start at 15s like mockup
  const duration = 225; // 3 minutes 45 seconds
    const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  // Default educational demo state per test suite and V12 chapter 1
  const [selectedCreatures, setSelectedCreatures] = useState<Record<string, boolean>>({
    turtle: true,
    seagrass: true,
  });

  const playerRef = useRef<HTMLDivElement>(null);

  const chapters: Chapter[] = [
    {
      id: 0,
      timeSeconds: 0,
      timeDisplay: '00:00',
      title: 'Quan sát',
      thumbnail: '/assets/generated/stations/station_seagrass_fish.jpg',
      narration: 'Dưới làn nước trong xanh, chú rùa biển bơi qua thảm cỏ biển tìm kiếm những ngọn cỏ non tươi ngon.',
    },
    {
      id: 1,
      timeSeconds: 75,
      timeDisplay: '01:15',
      title: 'Tìm bạn nhỏ',
      thumbnail: '/assets/generated/creatures/clownfish_isolated.png',
      narration: 'Gần rạn san hô, những chú cá hề cam sọc trắng tung tăng bơi lượn an toàn bên cạnh hải quỳ.',
    },
    {
      id: 2,
      timeSeconds: 150,
      timeDisplay: '02:30',
      title: 'Cùng suy nghĩ',
      thumbnail: '/assets/generated/stations/station_coral_reef.jpg',
      narration: 'Thảm cỏ biển là lá phổi xanh của đại dương. Em hãy cùng gìn giữ biển xanh không rác thải nhé!',
    },
  ];

  // Playback timer simulation
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1;
          // Sync chapter based on timestamp
          if (next >= chapters[2].timeSeconds && activeChapter !== 2) {
            setActiveChapter(2);
          } else if (next >= chapters[1].timeSeconds && next < chapters[2].timeSeconds && activeChapter !== 1) {
            setActiveChapter(1);
          } else if (next < chapters[1].timeSeconds && activeChapter !== 0) {
            setActiveChapter(0);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeChapter, duration]);

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      oceanAudio.playChime(523.25, 0.2);
      oceanAudio.speak(chapters[activeChapter].narration);
    } else {
      oceanAudio.stop();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTime = Math.floor(pos * duration);
    setCurrentTime(seekTime);

    if (seekTime >= chapters[2].timeSeconds) setActiveChapter(2);
    else if (seekTime >= chapters[1].timeSeconds) setActiveChapter(1);
    else setActiveChapter(0);

    oceanAudio.playChime(600, 0.1);
  };

  const handleSelectChapter = (index: number) => {
    setActiveChapter(index);
    setCurrentTime(chapters[index].timeSeconds);
    oceanAudio.playChime(659.25, 0.15);
    if (isPlaying) {
      oceanAudio.speak(chapters[index].narration);
    }
  };

  const toggleCreature = (id: string) => {
    setSelectedCreatures((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      oceanAudio.playChime(next[id] ? 700 : 400, 0.1);
      return next;
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const creaturesList = [
    { id: 'turtle', name: 'Rùa biển', image: '/assets/generated/creatures/turtle_isolated.png', inVideo: true },
    { id: 'clownfish', name: 'Cá hề', image: '/assets/generated/creatures/clownfish_isolated.png', inVideo: true },
    { id: 'starfish', name: 'Sao biển', image: '/assets/generated/stations/species_starfish.jpg', inVideo: false },
    { id: 'seahorse', name: 'Cá ngựa', image: '/assets/generated/creatures/seahorse_isolated.png', inVideo: false },
    { id: 'crab', name: 'Cua', image: '/assets/generated/creatures/crab_isolated.png', inVideo: false },
    { id: 'seagrass', name: 'Cỏ biển', image: '/assets/generated/stations/botanical_seagrass_specimen.jpg', inVideo: true },
    { id: 'bluefish', name: 'Cá xanh', image: '/assets/generated/creatures/blue_fish_isolated.png', inVideo: true },
  ];

  const progressPercent = (currentTime / duration) * 100;

  return (
    <LearnerShell activeNav="resources">
      {/* Main Page Container with Ocean Ambient Atmosphere */}
      <div className="relative min-h-[calc(100vh-72px)] bg-gradient-to-b from-[#F2F8F9] via-[#FAF8F5] to-[#EBF5F8] text-[#102A38] font-sans select-none px-6 lg:px-12 py-8 overflow-hidden">
        {/* AMBIENT OCEAN DECORATIONS (Outside Cards - 2 Sides & Bottom) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          {/* Left ambient: Sea-kelp silhouette & gentle water currents */}
          <div className="absolute left-0 top-1/4 -translate-x-8 opacity-15 text-[#17657A]">
            <svg className="w-56 h-96" viewBox="0 0 120 220" fill="currentColor">
              <path d="M25 220 C 15 160, 50 130, 30 80 C 18 45, 40 15, 25 0 C 10 20, 2 55, 8 95 C 15 140, -2 170, 25 220 Z" />
              <path d="M60 220 C 50 150, 85 110, 68 55 C 55 20, 72 5, 60 0 C 48 18, 38 50, 44 88 C 50 130, 32 170, 60 220 Z" opacity="0.7" />
              <path d="M95 220 C 88 175, 110 140, 98 90 C 85 55, 102 22, 92 0 C 80 20, 68 55, 75 98 C 82 140, 65 180, 95 220 Z" opacity="0.5" />
            </svg>
          </div>
          {/* Left floating bubbles */}
          <div className="absolute left-12 top-48 w-4 h-4 rounded-full border-2 border-[#17657A]/20 bg-white/30 backdrop-blur-xs animate-pulse" />
          <div className="absolute left-24 top-80 w-2.5 h-2.5 rounded-full border border-[#2EE6CA]/35 bg-teal-100/20" />
          <div className="absolute left-8 bottom-32 w-6 h-6 rounded-full border-2 border-[#17657A]/15 bg-white/20" />

          {/* Right ambient: Coral reef silhouettes & schooling fish */}
          <div className="absolute right-0 bottom-0 translate-x-6 opacity-15 text-[#17657A]">
            <svg className="w-64 h-80" viewBox="0 0 180 220" fill="currentColor">
              <path d="M45 220 C 50 175, 35 145, 55 100 C 68 80, 50 45, 60 12 C 72 35, 90 55, 82 90 C 95 125, 72 155, 90 220 Z" />
              <path d="M110 220 C 115 165, 100 130, 128 88 C 140 68, 122 35, 138 0 C 150 28, 160 55, 150 95 C 160 128, 138 165, 155 220 Z" opacity="0.8" />
              <path d="M155 220 C 150 185, 165 155, 160 120 C 155 95, 170 68, 165 35 C 172 58, 175 90, 170 128 C 165 160, 175 188, 175 220 Z" opacity="0.6" />
            </svg>
          </div>
          {/* Right swimming fish */}
          <div className="absolute right-14 top-36 opacity-20 text-[#17657A]">
            <svg className="w-28 h-16" viewBox="0 0 100 60" fill="currentColor">
              <path d="M10 20 Q 30 10, 50 20 Q 30 30, 10 20 Z M 10 20 L 0 12 L 0 28 Z" />
              <path d="M45 38 Q 60 30, 75 38 Q 60 46, 45 38 Z M 45 38 L 38 32 L 38 44 Z" opacity="0.8" />
              <path d="M65 15 Q 78 7, 90 15 Q 78 23, 65 15 Z M 65 15 L 59 10 L 59 20 Z" opacity="0.6" />
            </svg>
          </div>
          {/* Right floating bubbles */}
          <div className="absolute right-16 top-24 w-5 h-5 rounded-full border-2 border-[#2EE6CA]/30 bg-teal-100/20" />
          <div className="absolute right-28 bottom-72 w-3.5 h-3.5 rounded-full border border-[#17657A]/20 bg-white/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto space-y-8">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/resources')}
                className="hover:text-[#17657A] cursor-pointer"
              >
                Học liệu
              </button>
              <span>›</span>
              <span>Đại dương quanh em</span>
              <span>›</span>
              <span className="text-[#102A38] font-black">Thảm cỏ biển</span>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-[#17657A]/15 text-[#17657A] text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#2EE6CA] animate-pulse" />
              Tài liệu khoa học trực quan
            </span>
          </div>

          {/* Page Title with Ocean Accent */}
          <div className="space-y-1">
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#102A38] tracking-[-0.02em]">
              Khám phá thảm cỏ biển
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Tìm hiểu hệ sinh thái thảm cỏ biển qua góc quay tài liệu sống động và câu đố quan sát tương tác.
            </p>
          </div>

          {/* Main Video & Chapters Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Video Player (col-span-8) */}
            <div
              ref={playerRef}
              className={`lg:col-span-8 rounded-[32px] overflow-hidden shadow-[0_16px_48px_rgba(18,56,75,0.18)] border border-[#17657A]/20 bg-black relative flex flex-col justify-between aspect-video group ${
                isFullscreen ? 'fixed inset-0 z-50 rounded-none w-full h-full aspect-auto' : ''
              }`}
            >
              {/* Video Scene Image Backdrop */}
              <div className="absolute inset-0 z-0">
                <img
                  src={chapters[activeChapter].thumbnail}
                  alt="Thước phim thảm cỏ biển"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
              </div>

              {/* Top Bar: Title & Chapter Badge (Overlay) */}
              <div className="relative z-10 p-5 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-[#2EE6CA] animate-pulse" />
                  <span className="font-black text-teal-200 uppercase tracking-wider text-[10px]">
                    Thước phim tài liệu đại dương
                  </span>
                  <span className="text-white/60">•</span>
                  <span className="font-bold text-white">Chương {activeChapter + 1}: {chapters[activeChapter].title}</span>
                </div>
              </div>

              {/* Big Centered Play/Pause Button */}
              <div className="relative z-10 my-auto flex justify-center">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="w-20 h-20 rounded-full bg-white/85 hover:bg-white text-[#102A38] flex items-center justify-center shadow-2xl backdrop-blur-md cursor-pointer hover:scale-110 transition-all active:scale-95"
                  aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  )}
                </button>
              </div>

              {/* Subtitles Overlay */}
              {showSubtitles && (
                <div className="relative z-10 px-8 pb-3 text-center">
                  <span className="inline-block px-5 py-2 rounded-2xl bg-black/75 backdrop-blur-md text-white text-xs sm:text-sm font-semibold tracking-wide border border-white/10 shadow-lg">
                    {chapters[activeChapter].narration}
                  </span>
                </div>
              )}

              {/* Bottom Video Controls Bar */}
              <div className="relative z-10 w-full px-5 py-3.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2 text-white text-xs">
                {/* Timeline Scrubber with Chapter Markers */}
                <div
                  onClick={handleSeek}
                  className="relative w-full h-3 flex items-center cursor-pointer group/timeline"
                >
                  {/* Track background */}
                  <div className="w-full h-1.5 rounded-full bg-white/30 overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-[#2EE6CA] to-[#17657A] rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Chapter Markers on Track */}
                  {chapters.map((ch) => {
                    const posPercent = (ch.timeSeconds / duration) * 100;
                    return (
                      <div
                        key={ch.id}
                        className="absolute w-2 h-2 rounded-full bg-amber-300 border border-black transform -translate-x-1/2 top-0.5"
                        style={{ left: `${posPercent}%` }}
                        title={`Chương ${ch.id + 1}: ${ch.title}`}
                      />
                    );
                  })}

                  {/* Playhead handle */}
                  <div
                    className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-[#17657A] transform -translate-x-1/2 group-hover/timeline:scale-125 transition-transform"
                    style={{ left: `${progressPercent}%` }}
                  />
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="p-1 text-white hover:text-[#2EE6CA] transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentTime(0)}
                      className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
                      title="Xem lại từ đầu"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Time Counter */}
                    <span className="text-[11px] font-bold text-white/80 font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Subtitles Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowSubtitles(!showSubtitles)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        showSubtitles ? 'bg-white/20 text-[#2EE6CA]' : 'text-white/60 hover:text-white'
                      }`}
                      title="Phụ đề tiếng Việt"
                    >
                      <Subtitles className="w-4 h-4" />
                    </button>

                    {/* Volume Mute Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Chapters (col-span-4) - Balanced height matching Video Player */}
            <div className="lg:col-span-4 rounded-2xl bg-white shadow-[0_12px_36px_rgba(18,56,75,0.08)] border border-[#17657A]/20 p-6 space-y-4 relative overflow-hidden flex flex-col justify-between h-full">
              {/* Subtle top ocean strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#17657A] via-[#2EE6CA] to-[#17657A]" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-black text-xl text-[#102A38]">
                    Chương trong bài học
                  </h3>
                  <span className="text-[11px] font-bold text-[#17657A] bg-teal-50 px-2.5 py-1 rounded-full border border-[#17657A]/15">
                    {chapters.length} chương
                  </span>
                </div>

                <div className="space-y-3">
                  {chapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      onClick={() => handleSelectChapter(idx)}
                      className={`p-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                        activeChapter === idx
                          ? 'bg-[#EAF3F7] border-2 border-[#17657A]/40 shadow-xs ring-2 ring-[#17657A]/10'
                          : 'hover:bg-slate-50 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-11 rounded-lg overflow-hidden bg-slate-200 relative shrink-0 shadow-xs">
                          <img
                            src={ch.thumbnail}
                            alt={ch.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white">
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </div>
                        </div>
                        <div>
                          <span className="font-black text-xs text-[#102A38] block">
                            {ch.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            {ch.timeDisplay}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeChapter === idx ? 'text-[#17657A] translate-x-0.5' : 'text-slate-400'}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Oceanic Silhouette at Card Bottom */}
              <div className="pt-4 relative flex items-center justify-between opacity-30 pointer-events-none text-[#17657A]">
                <span className="text-[10px] font-bold italic text-slate-400">
                  BlueSTEAM Đại dương
                </span>
                <svg className="w-28 h-16" viewBox="0 0 120 80" fill="currentColor">
                  <path d="M20 80 C 18 50, 40 30, 35 0 C 30 30, 10 50, 20 80 Z" />
                  <path d="M50 80 C 45 40, 65 20, 60 5 C 55 20, 35 40, 50 80 Z" />
                  <path d="M80 80 C 75 45, 95 25, 90 10 C 85 25, 65 45, 80 80 Z" />
                  <path d="M105 80 C 100 55, 115 35, 110 20 C 105 35, 90 55, 105 80 Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Specimen Quiz Dock with Ocean Styling */}
          <div className="rounded-2xl sm:rounded-3xl bg-white/85 backdrop-blur-xs p-6 lg:p-8 space-y-6 border border-[#17657A]/20 shadow-xs relative overflow-hidden">
            {/* Top subtle ocean wave accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#17657A] via-[#2EE6CA] to-[#F67650]" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#17657A] text-white flex items-center justify-center shadow-md shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-black text-2xl text-[#102A38] tracking-tight">
                  Bé nhìn thấy những ai?
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  Hãy chọn những sinh vật em nhìn thấy trong video nhé!
                </p>
              </div>
            </div>

            {/* 7 Specimen Checkbox Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
              {creaturesList.map((item) => {
                const isSelected = !!selectedCreatures[item.id];

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCreature(item.id)}
                    className={`p-3 rounded-2xl bg-white shadow-xs border transition-all cursor-pointer flex flex-col items-center gap-2 hover:-translate-y-1 ${
                      isSelected
                        ? 'border-2 border-[#17657A] ring-2 ring-[#17657A]/20 shadow-md bg-sky-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow-sm"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#102A38]">
                        {item.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#17657A]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Educational Feedback Message */}
            {selectedCreatures.turtle && selectedCreatures.seagrass && (
              <div className="p-3.5 rounded-xl bg-teal-50 border border-[#17657A]/20 text-xs font-bold text-[#17657A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F67650]" />
                <span>
                  Bé thật tinh mắt! Rùa biển và Cỏ biển là hai nhân vật sinh thái chính trong bài học hôm nay!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
