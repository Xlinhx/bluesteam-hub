import { useState, useCallback } from 'react';
import { useRouter } from '../../app/router';
import { ActivityShell } from '../../shells/ActivityShell';
import { GreenSeaTurtleScene } from '../../experiences/turtle/GreenSeaTurtleScene';
import { UnderwaterCausticsBackground } from '../../components/underwater/UnderwaterCausticsBackground';
import { SketchfabTurtleViewer } from '../../components/turtle/SketchfabTurtleViewer';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  RotateCcw,
  ZoomIn,
  Home,
  Play,
  Volume2,
  Waves,
  Sparkles,
  Fish,
  AlertTriangle,
} from 'lucide-react';

export function SeagrassTuftIcon({ className = 'w-6 h-6 text-[#102A38]' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer Left Blade */}
      <path d="M6.8 21C5.8 18 3.6 15.5 1.8 13.8C3.2 14.8 5.6 17.2 7.6 21Z" />
      {/* Mid Left Blade */}
      <path d="M8.2 21C7.5 16.5 5.6 12 3.8 8.2C5.8 11 8.2 15.5 9.4 21Z" />
      {/* Center-Left Tall Blade */}
      <path d="M9.8 21C9.5 15 8.4 9.5 7.2 4.5C9.2 8.2 10.8 13.5 11.2 21Z" />
      {/* Center Tallest Blade */}
      <path d="M11.4 21C11.6 14 11.8 8 12 2.8C12.2 8 12.4 14 12.6 21Z" />
      {/* Center-Right Tall Blade */}
      <path d="M12.8 21C13.2 13.5 14.8 8.2 16.8 4.5C15.6 9.5 14.5 15 14.2 21Z" />
      {/* Mid Right Blade */}
      <path d="M14.6 21C15.8 15.5 18.2 11 20.2 8.2C18.4 12 16.5 16.5 15.8 21Z" />
      {/* Outer Right Blade */}
      <path d="M16.4 21C18.4 17.2 20.8 14.8 22.2 13.8C20.4 15.5 18.2 18 17.2 21Z" />
      {/* Bottom Base Anchor */}
      <path d="M4.5 20.8H19.5C19.5 22.2 4.5 22.2 4.5 20.8Z" />
    </svg>
  );
}

export function OceanCreatureViewerPage() {
  const { navigate, currentPath } = useRouter();

  // Extract creature slug from /3dmodel/{creature} route
  const pathParts = currentPath.split('/').filter(Boolean);
  const creatureSlug =
    pathParts[0] === '3dmodel' && pathParts[1]
      ? pathParts[1]
      : typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('creature') || 'turtle'
      : 'turtle';

  const creatureNames: Record<string, string> = {
    turtle: 'Rùa biển (Leatherback)',
    'rua-bien': 'Rùa biển (Leatherback)',
    clownfish: 'Cá hề (Clownfish)',
    jellyfish: 'Sứa biển (Jellyfish)',
    starfish: 'Sao biển (Starfish)',
    shell: 'Vỏ sò (Marine Shell)',
  };
  const creatureDisplayName = creatureNames[creatureSlug] || 'Rùa biển';

  const [activeTab, setActiveTab] = useState<'swimming' | 'habitat' | 'diet' | 'threat'>('swimming');
  const [isPlayingSwim, setIsPlayingSwim] = useState(false);
  const [viewerMode, setViewerMode] = useState<'sketchfab' | 'simulation'>('sketchfab');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [zoomTrigger, setZoomTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showZoomTip, setShowZoomTip] = useState(false);

  const playBubblePop = useCallback((freq = 560) => {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 2.2, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio context might be restricted
    }
  }, []);

  const speakIntro = () => {
    playBubblePop(680);
    oceanAudio.speak(
      'Rùa da biển (Leatherback) là loài rùa biển lớn nhất hành tinh, có mai da đặc biệt và khả năng lặn sâu vượt trội.'
    );
  };

  const toggleSwimDemo = () => {
    playBubblePop(520);
    setIsPlayingSwim((prev) => !prev);
    if (!isPlayingSwim) {
      setIsAutoRotating(true);
      oceanAudio.speak('Bạn rùa đang tăng tốc lướt sóng bằng đôi vây mái chèo khỏe khoắn.');
    }
  };

  const handleReset = () => {
    playBubblePop(620);
    setResetTrigger((prev) => prev + 1);
    setIsAutoRotating(false);
  };

  const handleZoom = () => {
    playBubblePop(740);
    setZoomTrigger((prev) => prev + 1);
    setShowZoomTip(true);
    setTimeout(() => setShowZoomTip(false), 3500);
  };

  const tabs = [
    { key: 'swimming', label: 'Cách bơi', icon: Waves },
    { key: 'habitat', label: 'Nơi sống', icon: Sparkles },
    { key: 'diet', label: 'Thức ăn', icon: Fish },
    { key: 'threat', label: 'Mối đe dọa', icon: AlertTriangle },
  ] as const;

  const tabContents = {
    swimming: {
      image: '/assets/generated/creatures/turtle_flipper_detail.jpg',
      alt: 'Vây bơi rùa biển',
      caption: 'Đôi vây trước hình mái chèo uyển chuyển quạt nước tiến tới, vây sau giữ vai trò bánh lái định hướng.',
    },
    habitat: {
      image: '/assets/generated/stations/station_seagrass_fish.jpg',
      alt: 'Thảm cỏ biển và rạn san hô',
      caption: 'Rùa biển sinh sống chủ yếu ở các thảm cỏ biển giàu dinh dưỡng và rạn san hô nước nông ven bờ.',
    },
    diet: {
      image: '/assets/generated/stations/station_seagrass_fish.jpg',
      alt: 'Cỏ biển xanh thức ăn của rùa',
      caption: 'Rùa non ăn sinh vật phù du và cỏ non, rùa xanh ăn cỏ biển, còn rùa da săn sứa biển trong các chuyến di cư xuyên đại dương.',
    },
    threat: {
      image: '/assets/generated/stations/station_coral_reef.jpg',
      alt: 'Môi trường sống cần bảo vệ',
      caption: 'Rác thải nhựa, túi nilon trôi nổi (dễ nhầm với sứa) và mắc lưới đánh cá là những mối đe dọa lớn đối với rùa.',
    },
  };

  const currentContent = tabContents[activeTab];

  return (
    <ActivityShell
      title={`Mô hình 3D: ${creatureDisplayName}`}
      variant="light"
      onBack={() => navigate('/interactive')}
      showLogo={true}
      headerRight={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 shadow-xs text-xs">
            <button
              type="button"
              onClick={() => {
                playBubblePop(620);
                setViewerMode('sketchfab');
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                viewerMode === 'sketchfab'
                  ? 'bg-[#15586E] text-white shadow-xs'
                  : 'text-[#102A38]/70 hover:text-[#102A38]'
              }`}
            >
              DigitalLife3D
            </button>
            <button
              type="button"
              onClick={() => {
                playBubblePop(620);
                setViewerMode('simulation');
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                viewerMode === 'simulation'
                  ? 'bg-[#15586E] text-white shadow-xs'
                  : 'text-[#102A38]/70 hover:text-[#102A38]'
              }`}
            >
              Three.js
            </button>
          </div>
        </div>
      }
    >
      <UnderwaterCausticsBackground
        interactive={true}
        className="h-[calc(100vh-68px)] min-h-[calc(100vh-68px)] w-full relative overflow-hidden font-sans"
      >

        {/* Left Floating 3D Control Column */}
        <div className="absolute left-6 lg:left-10 top-24 z-30 flex flex-col items-center gap-5 pointer-events-auto">
          {/* Rotate Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                playBubblePop(isAutoRotating ? 480 : 640);
                setIsAutoRotating((prev) => !prev);
              }}
              aria-label="Xoay mô hình"
              className={`w-14 h-14 min-w-[56px] min-h-[56px] rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-2 border-white/80 hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                isAutoRotating
                  ? 'bg-[#17657A] text-white ring-4 ring-[#17657A]/30'
                  : 'bg-white/95 backdrop-blur-sm text-[#102A38]'
              }`}
            >
              <RotateCcw
                className={`w-6 h-6 ${isAutoRotating ? 'text-white animate-spin' : 'text-[#17657A]'}`}
              />
            </button>
            <span className="text-xs font-black text-[#102A38] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              Xoay
            </span>
          </div>

          {/* Zoom In Button */}
          <div className="flex flex-col items-center gap-1.5 relative">
            <button
              type="button"
              onClick={handleZoom}
              aria-label="Phóng gần"
              className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-white/95 backdrop-blur-sm text-[#102A38] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-2 border-white/80 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ZoomIn className="w-6 h-6 text-[#17657A]" />
            </button>
            <span className="text-xs font-black text-[#102A38] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              Phóng gần
            </span>

            {/* Zoom Tooltip Toast */}
            {showZoomTip && (
              <div className="absolute left-16 top-2 z-40 whitespace-nowrap bg-[#102A38]/95 text-white text-xs font-medium px-3.5 py-2 rounded-xl shadow-lg backdrop-blur-md border border-white/20 animate-fade-in">
                🔍 Cuộn chuột hoặc chụm tay trực tiếp trên rùa để phóng to cực đại!
              </div>
            )}
          </div>

          {/* Home Reset Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={handleReset}
              aria-label="Về góc ban đầu"
              className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-white/95 backdrop-blur-sm text-[#102A38] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-2 border-white/80 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Home className="w-6 h-6 text-[#17657A]" />
            </button>
            <span className="text-xs font-black text-[#102A38] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              Về góc đầu
            </span>
          </div>
        </div>

        {/* Center Stage: Living Ocean 3D WebGL Canvas / Sketchfab Embed */}
        <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center pointer-events-auto">
          {viewerMode === 'sketchfab' ? (
            <SketchfabTurtleViewer
              autoRotate={isAutoRotating}
              resetTrigger={resetTrigger}
              zoomTrigger={zoomTrigger}
            />
          ) : (
            <GreenSeaTurtleScene
              showLegacyControls={false}
              autoRotate={isAutoRotating}
              zoomTrigger={zoomTrigger}
              resetTrigger={resetTrigger}
            />
          )}
        </div>

        {/* Right Biological Inspector Card (4 Tabs) */}
        <div className="hidden sm:block absolute right-6 lg:right-12 top-20 z-30 w-80 lg:w-96 rounded-[28px] bg-white/95 backdrop-blur-md shadow-[0_12px_40px_rgba(18,56,75,0.18)] border border-white/80 overflow-hidden pointer-events-auto">
          {/* 4 Tabs Header */}
          <div className="grid grid-cols-4 border-b border-slate-100 bg-[#F6F3EB]/70">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    playBubblePop(590);
                    setActiveTab(tab.key);
                  }}
                  className={`flex flex-col items-center justify-center py-3.5 px-1 transition-all cursor-pointer relative ${
                    isActive
                      ? 'text-[#17657A] font-black'
                      : 'text-[#12384B]/60 hover:text-[#12384B] font-medium'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-[#17657A]' : 'text-slate-400'}`} />
                  <span className="text-xs tracking-tight text-center leading-tight">{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-1 bg-[#17657A] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Body Content */}
          <div className="p-5 flex flex-col gap-4">
            <div className="w-full h-44 lg:h-52 rounded-2xl overflow-hidden shadow-inner border border-slate-100 relative bg-slate-100">
              <img
                src={currentContent.image}
                alt={currentContent.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-serif font-bold text-base lg:text-lg text-[#102A38] tracking-[-0.02em] leading-relaxed">
              {currentContent.caption}
            </p>
          </div>
        </div>

        {/* Bottom 3 Action Pills in a single horizontal row */}
        <div className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 justify-center whitespace-nowrap pointer-events-auto">
          {/* Pill 1: Xem rùa bơi (Dark Teal Hero) */}
          <button
            type="button"
            onClick={toggleSwimDemo}
            className="px-7 py-3 rounded-full bg-[#17657A] hover:bg-[#125061] text-white font-extrabold text-base shadow-[0_6px_20px_rgba(23,101,122,0.35)] flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all"
          >
            <Play className={`w-4 h-4 fill-white ${isPlayingSwim ? 'animate-bounce' : ''}`} />
            <span>{isPlayingSwim ? 'Đang bơi nhịp nhàng' : 'Xem rùa bơi'}</span>
          </button>

          {/* Pill 2: Nghe hướng dẫn (White) */}
          <button
            type="button"
            onClick={speakIntro}
            className="px-7 py-3 rounded-full bg-white/95 backdrop-blur-sm hover:bg-slate-50 text-[#102A38] font-extrabold text-base shadow-md border border-slate-100 flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all"
          >
            <Volume2 className="w-5 h-5 text-[#17657A]" />
            <span>Nghe hướng dẫn</span>
          </button>

          {/* Pill 3: Về Game Lab (White) */}
          <button
            type="button"
            onClick={() => navigate('/interactive')}
            className="px-7 py-3 rounded-full bg-white/95 backdrop-blur-sm hover:bg-slate-50 text-[#102A38] font-extrabold text-base shadow-md border border-slate-100 flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all"
          >
            <SeagrassTuftIcon className="w-6 h-6 text-[#102A38]" />
            <span>Về Game Lab</span>
          </button>
        </div>
      </UnderwaterCausticsBackground>
    </ActivityShell>
  );
}
