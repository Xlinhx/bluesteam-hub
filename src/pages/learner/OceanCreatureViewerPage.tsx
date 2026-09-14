import { useState } from 'react';
import { useRouter } from '../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import { GreenSeaTurtleScene } from '../../experiences/turtle/GreenSeaTurtleScene';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  RotateCcw,
  ZoomIn,
  Home,
  Play,
  Volume2,
  ChevronRight,
  Waves,
  Sparkles,
  Fish,
  AlertTriangle,
} from 'lucide-react';

export function OceanCreatureViewerPage() {
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<'swimming' | 'habitat' | 'diet' | 'threat'>('swimming');
  const [isPlayingSwim, setIsPlayingSwim] = useState(false);
  const [is3DMode] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [zoomTrigger, setZoomTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  const speakIntro = () => {
    oceanAudio.speak(
      'Rùa biển xanh dùng đôi vây trước lớn như đôi cánh để bơi lượn nhẹ nhàng trong làn nước trong vắt.'
    );
  };

  const toggleSwimDemo = () => {
    setIsPlayingSwim((prev) => !prev);
    if (!isPlayingSwim) {
      oceanAudio.speak('Bạn rùa đang tăng tốc lướt sóng bằng đôi vây mái chèo khỏe khoắn.');
    }
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
      alt: 'Vây bơi rùa biển xanh',
      caption: 'Đôi vây trước hình mái chèo uyển chuyển quạt nước tiến tới, vây sau giữ vai trò bánh lái định hướng.',
    },
    habitat: {
      image: '/assets/generated/stations/station_seagrass_fish.jpg',
      alt: 'Thảm cỏ biển và rạn san hô',
      caption: 'Rùa biển xanh sinh sống chủ yếu ở các thảm cỏ biển giàu dinh dưỡng và rạn san hô nước nông ven bờ.',
    },
    diet: {
      image: '/assets/generated/stations/station_seagrass_fish.jpg',
      alt: 'Cỏ biển xanh thức ăn của rùa',
      caption: 'Rùa biển xanh trưởng thành là loài ăn thực vật duy nhất trong các loài rùa biển, thức ăn chính là cỏ biển và tảo.',
    },
    threat: {
      image: '/assets/generated/stations/station_coral_reef.jpg',
      alt: 'Môi trường sống cần bảo vệ',
      caption: 'Rác thải nhựa, túi nilon trôi nổi (dễ nhầm với sứa) và mắc lưới đánh cá là những mối đe dọa lớn đối với rùa.',
    },
  };

  const currentContent = tabContents[activeTab];

  return (
    <LearnerShell activeNav="learn">
      <div className="relative min-h-[calc(100vh-72px)] bg-[#B6E2EB] overflow-hidden select-none font-sans">
        {/* Top Breadcrumb Bar */}
        <div className="relative z-30 px-6 sm:px-10 py-3.5 flex items-center gap-2 text-sm text-[#12384B]/80 font-semibold">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="hover:text-[#102A38] flex items-center gap-1 cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#17657A]" />
          </button>
          <ChevronRight className="w-4 h-4 text-[#17657A]/40" />
          <button
            type="button"
            onClick={() => navigate('/learn/atlas')}
            className="hover:text-[#102A38] cursor-pointer"
          >
            Học tập
          </button>
          <ChevronRight className="w-4 h-4 text-[#17657A]/40" />
          <span>Sinh vật biển</span>
          <ChevronRight className="w-4 h-4 text-[#17657A]/40" />
          <span className="text-[#102A38] font-black">Rùa biển</span>
        </div>

        {/* Left Floating 3D Control Column */}
        <div className="absolute left-6 lg:left-10 top-24 z-30 flex flex-col items-center gap-5">
          {/* Rotate Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsAutoRotating((prev) => !prev)}
              aria-label="Xoay mô hình"
              className={`w-13 h-13 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-white/80 hover:scale-108 active:scale-95 transition-all cursor-pointer ${
                isAutoRotating ? 'bg-[#17657A] text-white ring-4 ring-[#17657A]/30' : 'bg-white text-[#102A38]'
              }`}
            >
              <RotateCcw className={`w-6 h-6 ${isAutoRotating ? 'text-white animate-spin' : 'text-[#17657A]'}`} />
            </button>
            <span className="text-xs font-black text-[#102A38]">Xoay</span>
          </div>

          {/* Zoom In Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoomTrigger((prev) => prev + 1)}
              aria-label="Phóng to"
              className="w-13 h-13 rounded-full bg-white text-[#102A38] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-white/80 hover:scale-108 active:scale-95 transition-all cursor-pointer"
            >
              <ZoomIn className="w-6 h-6 text-[#17657A]" />
            </button>
            <span className="text-xs font-black text-[#102A38]">Phóng gần</span>
          </div>

          {/* Home Reset Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => setResetTrigger((prev) => prev + 1)}
              aria-label="Về góc ban đầu"
              className="w-13 h-13 rounded-full bg-white text-[#102A38] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-white/80 hover:scale-108 active:scale-95 transition-all cursor-pointer"
            >
              <Home className="w-6 h-6 text-[#17657A]" />
            </button>
            <span className="text-xs font-black text-[#102A38]">Về góc đầu</span>
          </div>
        </div>

        {/* Center Stage: Living Ocean 3D WebGL Canvas */}
        <div className="absolute inset-0 z-10 w-full h-full">
          {is3DMode ? (
            <GreenSeaTurtleScene
              showLegacyControls={false}
              autoRotate={isAutoRotating}
              zoomTrigger={zoomTrigger}
              resetTrigger={resetTrigger}
            />
          ) : (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src="/assets/generated/creatures/green_turtle_hero.jpg"
                alt="Rùa biển xanh bơi lội"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#B6E2EB]/20 via-transparent to-white/10 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Right Biological Inspector Card (4 Tabs) */}
        <div className="hidden sm:block absolute right-6 lg:right-12 top-20 z-30 w-80 lg:w-96 rounded-[28px] bg-white/95 backdrop-blur-md shadow-[0_12px_40px_rgba(18,56,75,0.15)] border border-white/80 overflow-hidden">
          {/* 4 Tabs Header */}
          <div className="grid grid-cols-4 border-b border-slate-100 bg-[#F6F3EB]/60">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
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
        <div className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 justify-center whitespace-nowrap">
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
            className="px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-[#102A38] font-extrabold text-base shadow-md border border-slate-100 flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all"
          >
            <Volume2 className="w-5 h-5 text-[#17657A]" />
            <span>Nghe hướng dẫn</span>
          </button>

          {/* Pill 3: Về thảm cỏ biển (White) */}
          <button
            type="button"
            onClick={() => navigate('/learn/atlas?mode=horizontal')}
            className="px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-[#102A38] font-extrabold text-base shadow-md border border-slate-100 flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all"
          >
            <svg className="w-5 h-5 text-[#17657A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22c-2-5-6-9-6-15a6 6 0 0 1 12 0c0 6-4 10-6 15z" />
              <path d="M12 12c1-3 3-5 5-7" />
              <path d="M12 16c-1-2-2-4-2-6" />
            </svg>
            <span>Về thảm cỏ biển</span>
          </button>
        </div>
      </div>
    </LearnerShell>
  );
}
