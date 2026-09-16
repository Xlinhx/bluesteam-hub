import { useState } from 'react';
import { useRouter } from '../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import { InteractiveSubNav } from '../../components/interactive/InteractiveSubNav';
import {
  Eye,
  Brain,
  Settings,
  Search,
  ChevronRight,
  Puzzle,
  FlaskConical,
  ClipboardCheck,
  Binoculars,
  Layers,
  Sparkles,
  Gamepad2,
} from 'lucide-react';

// =========================================================================
// 2D CONTEXTUAL MARINE DECORATIONS (Floating bubbles, doodles, STEAM accents)
// =========================================================================
function FloatingBubble({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`pointer-events-none select-none shrink-0 ${className}`}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#17657A"
        strokeWidth="1.2"
        strokeOpacity="0.35"
        fill="#2EE6CA"
        fillOpacity="0.12"
      />
      <ellipse
        cx="8.5"
        cy="8"
        rx="2.5"
        ry="1.5"
        fill="white"
        fillOpacity="0.85"
        transform="rotate(-30 8.5 8)"
      />
    </svg>
  );
}

function StarfishDoodle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className={`pointer-events-none select-none ${className}`}>
      <path
        d="M32 6 C33 18 36 23 48 24 C37 28 35 34 38 46 C30 38 25 39 18 48 C20 36 17 31 6 28 C18 25 21 19 22 8 Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="27" r="1.5" fill="currentColor" />
      <circle cx="27" cy="23" r="1" fill="currentColor" />
      <circle cx="37" cy="24" r="1" fill="currentColor" />
    </svg>
  );
}

function SeashellDoodle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className={`pointer-events-none select-none ${className}`}>
      <path
        d="M32 52 C16 52 10 38 12 24 C14 12 24 8 32 8 C40 8 50 12 52 24 C54 38 48 52 32 52 Z"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M32 52 C26 38 24 24 24 10" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M32 52 C38 38 40 24 40 10" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M32 52 L32 8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M26 55 C28 57 36 57 38 55" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FishTrailDoodle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 36" fill="none" stroke="currentColor" className={`pointer-events-none select-none ${className}`}>
      <path
        d="M12 12 C18 8 26 12 30 16 C26 20 18 24 12 20 L6 24 L8 16 L6 8 Z"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M50 8 C55 5 61 8 64 11 C61 14 55 17 50 14 L46 17 L47 11 L46 5 Z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M76 18 C81 15 87 18 90 21 C87 24 81 27 76 24 L72 27 L73 21 L72 15 Z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SteamSparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`pointer-events-none select-none ${className}`}>
      <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
    </svg>
  );
}

export function GameLabPage() {
  const { navigate } = useRouter();
  const [activeCategory, setActiveCategory] = useState<'all' | 'recognize' | 'sort' | 'sequence' | 'build'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 3 Bloom's Taxonomy Cognitive Depth Cards (matching interactive.png)
  const bloomCards = [
    {
      id: 'recognize',
      title: 'Nhận biết',
      icon: Eye,
      image: '/assets/generated/creatures/thumb_hero_clownfish.png',
      legacyAsset: 'clownfish_isolated.jpg',
      path: '/interactive/habitat-placement?step=recognition',
      alt: 'Cá hề và hải quỳ trong rạn san hô',
    },
    {
      id: 'understand',
      title: 'Hiểu',
      icon: Brain,
      image: '/assets/generated/creatures/thumb_hero_turtle.png',
      legacyAsset: 'green_turtle_hero.jpg',
      path: '/interactive/habitat-placement',
      alt: 'Rùa biển xanh bơi lội',
    },
    {
      id: 'apply',
      title: 'Vận dụng',
      icon: Settings,
      image: '/assets/generated/stations/thumb_hero_coral.png',
      legacyAsset: 'station_coral_reef.jpg',
      path: '/interactive/habitat-placement?step=feedback',
      alt: 'Hệ sinh thái rạn san hô',
    },
  ];

  // 4 Discovery Activities matching interactive.png
  const activities = [
    {
      id: 'shells',
      title: 'Nhận biết vỏ sò',
      category: 'recognize',
      tag: 'Nhận biết',
      icon: Eye,
      image: '/assets/generated/creatures/thumb_shell_gamelab.png',
      legacyAsset: 'thumb_shell_tile.jpg',
      path: '/interactive/habitat-placement?step=recognition',
    },
    {
      id: 'sort-species',
      title: 'Sắp xếp sinh vật biển',
      category: 'sort',
      tag: 'Sắp xếp',
      icon: Layers,
      image: '/assets/generated/creatures/thumb_fish_sort_gamelab.png',
      legacyAsset: 'thumb_starfish_tile.jpg',
      path: '/interactive/habitat-placement',
    },
    {
      id: 'fish-lifecycle',
      title: 'Sắp xếp vòng đời cá',
      category: 'sequence',
      tag: 'Theo trình tự',
      icon: Sparkles,
      image: '/assets/generated/stations/thumb_fish_lifecycle_gamelab.png',
      legacyAsset: 'station_seagrass_fish.jpg',
      path: '/interactive/habitat-placement',
    },
    {
      id: 'build-reef',
      title: 'Tạo rạn san hô',
      category: 'build',
      tag: 'Xây dựng môi trường sống',
      icon: Gamepad2,
      image: '/assets/generated/stations/thumb_coral_habitat_gamelab.png',
      legacyAsset: 'station_coral_reef.jpg',
      path: '/creative/habitat',
    },
  ];

  const filteredActivities = activities.filter((act) => {
    const matchesCategory = activeCategory === 'all' || act.category === activeCategory;
    const matchesSearch = searchQuery === '' || act.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <LearnerShell activeNav="interactive">
      <div className="min-h-[calc(100vh-72px)] bg-[#FBF9F4] font-sans text-[#102A38] select-none flex flex-col">
        {/* ========================================================================= */}
        {/* TOP HERO SECTION: "Thử, quan sát, rồi thử lại" (Portrait 1024x1536 Optimized) */}
        {/* ========================================================================= */}
        <div className="relative w-full pt-10 sm:pt-14 pb-20 sm:pb-28 px-6 sm:px-12 lg:px-16 overflow-hidden bg-[#0A2E44] text-white">
          {/* Background Ocean & Humpback Whale Backdrop */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/generated/backgrounds/whale_hero_gamelab.jpg"
              alt="Cá voi lưng gù bơi lội trong lòng đại dương"
              className="w-full h-full object-cover object-[center_35%]"
            />
            {/* Subtle atmospheric vignette preserving the magnificent whale */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E44]/55 via-transparent to-[#0A2E44]/75 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-10 sm:gap-14">
            {/* Editorial Heading with Organic Sine Wave Underline */}
            <div>
              <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-[54px] text-white tracking-[-0.02em] leading-tight drop-shadow-md">
                Thử, quan sát, rồi thử lại
              </h1>
              {/* Organic wave SVG curve matching mockup */}
              <div className="mt-3.5 w-24 h-4">
                <svg viewBox="0 0 96 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path
                    d="M2 10C16 10 22 4 36 4C50 4 56 10 70 10C84 10 90 4 94 4"
                    stroke="#2EE6CA"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* 3 Bloom's Taxonomy Depth Cards (Full Bleed Image, Lower Vertical Position) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
              {bloomCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={() => navigate(card.path)}
                    className="group rounded-[28px] bg-[#F8F5EB] shadow-[0_16px_36px_rgba(0,0,0,0.25)] border border-white/70 hover:shadow-[0_22px_45px_rgba(0,0,0,0.35)] transition-all duration-300 cursor-pointer hover:-translate-y-1.5 flex flex-col overflow-hidden"
                  >
                    {/* Full Bleed Image (Tràn viền, flush to edges) */}
                    <div className="w-full h-44 sm:h-40 lg:h-44 relative bg-[#0D384D] overflow-hidden rounded-[20px]">
                      <img
                        src={card.image}
                        alt={card.alt}
                        data-legacy-asset={card.legacyAsset}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Bottom Pill Container */}
                    <div className="flex items-center justify-between px-4 py-3.5 bg-[#F8F5EB]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#E2EAEF] text-[#102A38] flex items-center justify-center shadow-xs shrink-0">
                          <Icon className="w-4 h-4 text-[#102A38]" />
                        </div>
                        <span className="font-serif font-black text-xl text-[#102A38] tracking-tight">
                          {card.title}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#EAE5DB] flex items-center justify-center text-[#102A38] group-hover:bg-[#102A38] group-hover:text-white transition-colors duration-200 shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Organic Wave Transition Divider at bottom of Hero */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
            <svg
              viewBox="0 0 1024 48"
              fill="none"
              preserveAspectRatio="none"
              className="w-full h-7 sm:h-11 block"
            >
              <path
                d="M0,0 C180,28 360,42 512,42 C680,42 860,20 1024,0 L1024,48 L0,48 Z"
                fill="#FBF9F4"
              />
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: "Hoạt động để bé khám phá"                                     */}
        {/* ========================================================================= */}
        <div className="relative max-w-5xl mx-auto w-full px-6 sm:px-10 lg:px-12 pt-6 sm:pt-8 pb-4 sm:pb-6 space-y-7">
          {/* Sub-system Segmented Switcher (Kết nối 3 Phân hệ: Game Lab vs Mô Phỏng vs Khám Phá 3D) */}
          <InteractiveSubNav activeTab="games" />

          {/* Ambient 2D Marine Decorative Layer (Subtle, Playful & STEAM Themed) */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
            {/* Top-Left: Floating Bubbles beside Heading */}
            <FloatingBubble size={22} className="absolute left-2 top-2 opacity-50" />
            <FloatingBubble size={12} className="absolute left-9 top-6 opacity-40" />
            <FloatingBubble size={16} className="absolute left-6 top-12 opacity-45" />

            {/* Top-Right: Playful Starfish Doodle & Bubbles */}
            <StarfishDoodle className="w-9 h-9 text-[#17657A]/25 absolute right-3 sm:right-6 top-1 rotate-12 hidden sm:block" />
            <FloatingBubble size={18} className="absolute right-14 top-7 opacity-40 hidden sm:block" />
            <FloatingBubble size={10} className="absolute right-20 top-3 opacity-30 hidden sm:block" />

            {/* Middle-Left Margin: Seashell Doodle */}
            <SeashellDoodle className="w-9 h-9 text-[#17657A]/22 absolute left-1 top-72 -rotate-6 hidden lg:block" />
            <FloatingBubble size={14} className="absolute left-7 top-84 opacity-40 hidden lg:block" />

            {/* Middle-Right Margin: Mini Fish School Contour */}
            <FishTrailDoodle className="w-16 h-6 text-[#17657A]/24 absolute right-2 top-72 hidden lg:block" />
            <FloatingBubble size={16} className="absolute right-10 top-84 opacity-40 hidden lg:block" />

            {/* Bottom Section 3: Floating Bubbles & STEAM Sparkles */}
            <FloatingBubble size={20} className="absolute left-2 bottom-20 opacity-50" />
            <FloatingBubble size={12} className="absolute left-8 bottom-12 opacity-40" />
            <SteamSparkle className="w-3.5 h-3.5 text-[#2EE6CA]/60 absolute right-4 bottom-28" />
            <FloatingBubble size={18} className="absolute right-3 bottom-14 opacity-45" />
            <FloatingBubble size={10} className="absolute right-10 bottom-8 opacity-35" />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-5">
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#102A38] tracking-[-0.02em]">
                  Hoạt động để bé khám phá
                </h2>
                <SteamSparkle className="w-4 h-4 text-[#2EE6CA] opacity-60 hidden sm:block" />
              </div>

              {/* Search Bar & "Xem tất cả >" CTA */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm"
                    className="pl-9 pr-4 py-2.5 rounded-full bg-white border border-[#E2EAEF] text-xs font-bold text-[#102A38] focus:outline-none focus:ring-2 focus:ring-[#17657A]/40 w-48 shadow-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className="px-5 py-2.5 rounded-full bg-[#102A38] hover:bg-[#163B4E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors duration-150 active:scale-95"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Category Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'recognize', label: 'Nhận biết' },
                { id: 'sort', label: 'Sắp xếp' },
                { id: 'sequence', label: 'Theo trình tự' },
                { id: 'build', label: 'Xây dựng môi trường sống' },
              ].map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#102A38] text-white shadow-md'
                        : 'bg-[#EAE4D5]/40 text-[#102A38]/80 hover:text-[#102A38] hover:bg-[#EAE4D5]/70 border border-[#E5ECEF]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Activities Grid (Full Bleed Image, Side-by-side title and button) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredActivities.map((act) => {
              const TagIcon = act.icon;
              return (
                <div
                  key={act.id}
                  onClick={() => navigate(act.path)}
                  className="group rounded-[24px] bg-[#FAF7EE] border border-[#EAE5DB] shadow-[0_4px_20px_rgba(16,42,56,0.06)] hover:shadow-[0_14px_32px_rgba(16,42,56,0.14)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  {/* Full Bleed Image (Tràn viền) */}
                  <div className="w-full h-36 sm:h-40 overflow-hidden relative bg-slate-100 shadow-inner">
                    <img
                      src={act.image}
                      alt={act.title}
                      data-legacy-asset={act.legacyAsset}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                    {/* Badge Pill */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9E8F3] text-[11px] font-extrabold text-[#17657A] mb-2 self-start border border-[#C5DCED]/60">
                      <TagIcon className="w-3 h-3" />
                      <span>{act.tag}</span>
                    </div>

                    {/* Title & Chevron Button side by side on bottom line */}
                    <div className="flex items-center justify-between gap-1.5 mt-auto pt-1">
                      <h3 className="font-serif font-black text-[14px] sm:text-[15px] text-[#102A38] group-hover:text-[#17657A] transition-colors leading-snug tracking-tight">
                        {act.title}
                      </h3>
                      <div className="w-7 h-7 rounded-full bg-[#EAE5DB] flex items-center justify-center text-[#102A38] group-hover:bg-[#102A38] group-hover:text-white transition-colors duration-200 shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: "Chơi tiếp" (Authentic 2-Column Split matching Mockup)          */}
          {/* ========================================================================= */}
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#102A38] tracking-[-0.02em]">
                Chơi tiếp
              </h2>
              <SteamSparkle className="w-4 h-4 text-[#2EE6CA] opacity-60 hidden sm:block" />
            </div>

            <div className="rounded-[28px] sm:rounded-[32px] bg-[#FAF8F2] border border-[#EAE5DB] shadow-[0_8px_30px_rgba(16,42,56,0.06)] overflow-hidden flex flex-col lg:flex-row">
              {/* Left Column: Full-Bleed Image on Top, Game Title on Bottom */}
              <div className="w-full lg:w-[42%] flex flex-col justify-between border-b lg:border-b-0 bg-[#FAF8F2] shrink-0">
                <div className="w-full h-48 sm:h-52 relative overflow-hidden bg-[#0D384D]">
                  <img
                    src="/assets/generated/stations/thumb_coral_habitat_gamelab.png"
                    alt="Tạo rạn san hô đang diễn ra"
                    data-legacy-asset="station_coral_reef.jpg"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3.5 left-3.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs font-extrabold text-[#102A38] shadow-xs flex items-center gap-2 border border-white/80">
                    <span className="w-2 h-2 rounded-full bg-[#2EE6CA] animate-pulse" />
                    <Gamepad2 className="w-3.5 h-3.5 text-[#102A38]" />
                    <span>Đang thực hiện</span>
                  </div>
                </div>

                {/* Left Column Bottom Bar: Controller Icon + Game Title */}
                <div className="px-5 sm:px-6 py-4 flex items-center gap-3 bg-[#FAF8F2]">
                  <div className="w-8 h-8 rounded-full bg-[#DFE5EA] flex items-center justify-center text-[#102A38] shrink-0 shadow-xs">
                    <Gamepad2 className="w-4 h-4 text-[#102A38]" />
                  </div>
                  <span className="font-serif font-black text-lg sm:text-xl text-[#102A38] tracking-tight">
                    Tạo rạn san hô
                  </span>
                </div>
              </div>

              {/* Right Column: 4 Centered Progress Steps + Anchored Bottom-Right CTA */}
              <div className="flex-1 p-6 sm:p-7 lg:p-8 flex flex-col justify-between bg-[#FAF8F2]">
                {/* 4 Steps Centered in upper/mid zone matching Mockup (Chevrons aligned with circle centers) */}
                <div className="my-auto py-3 flex items-start justify-center gap-2 sm:gap-4 lg:gap-6 flex-nowrap">
                  {/* Step 1: Quan sát (Active with Dark Navy & Binoculars) */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#102A38] text-white flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105">
                      <Binoculars className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-[#102A38]">Quan sát</span>
                  </div>

                  <div className="h-13 sm:h-15 flex items-center shrink-0">
                    <ChevronRight className="w-4 h-4 text-[#102A38]/40" />
                  </div>

                  {/* Step 2: Đặt vào */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#DFE5EA] text-[#102A38] flex items-center justify-center transition-transform duration-200 hover:scale-105">
                      <Puzzle className="w-6 h-6 sm:w-7 sm:h-7 text-[#102A38]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#5C7482]">Đặt vào</span>
                  </div>

                  <div className="h-13 sm:h-15 flex items-center shrink-0">
                    <ChevronRight className="w-4 h-4 text-[#102A38]/40" />
                  </div>

                  {/* Step 3: Thử */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#DFE5EA] text-[#102A38] flex items-center justify-center transition-transform duration-200 hover:scale-105">
                      <FlaskConical className="w-6 h-6 sm:w-7 sm:h-7 text-[#102A38]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#5C7482]">Thử</span>
                  </div>

                  <div className="h-13 sm:h-15 flex items-center shrink-0">
                    <ChevronRight className="w-4 h-4 text-[#102A38]/40" />
                  </div>

                  {/* Step 4: Xem lại */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#DFE5EA] text-[#102A38] flex items-center justify-center transition-transform duration-200 hover:scale-105">
                      <ClipboardCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#102A38]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#5C7482]">Xem lại</span>
                  </div>
                </div>

                {/* Bottom Right CTA: Horizontally aligned with "Tạo rạn san hô" */}
                <div className="flex justify-end pt-3 mt-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/interactive/habitat-placement')}
                    className="px-7 py-3 rounded-full bg-[#102A38] hover:bg-[#163B4E] text-white font-bold text-sm shadow-[0_6px_20px_rgba(16,42,56,0.22)] flex items-center gap-2 cursor-pointer transition-all duration-200 active:scale-95"
                  >
                    <span>Tiếp tục</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FOOTER AUTHENTIC MULTI-LAYER OCEAN WAVES & CORAL BANNER                  */}
        {/* ========================================================================= */}
        <div className="w-full relative overflow-hidden pointer-events-none select-none bg-[#FBF9F4] leading-none mt-4 sm:mt-6">
          <img
            src="/assets/generated/gamelab_footer_waves.png"
            alt="Dải sóng biển đa tầng và rạn san hô tự nhiên"
            className="w-full h-auto object-cover object-bottom block"
          />
        </div>
      </div>
    </LearnerShell>
  );
}
