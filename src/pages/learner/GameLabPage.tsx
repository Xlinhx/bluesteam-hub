import { useState } from 'react';
import { useRouter } from '../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import {
  Eye,
  Brain,
  Settings,
  Search,
  ChevronRight,
  Puzzle,
  FlaskConical,
  ClipboardList,
  Layers,
  Sparkles,
  Gamepad2,
} from 'lucide-react';

export function GameLabPage() {
  const { navigate } = useRouter();
  const [activeCategory, setActiveCategory] = useState<'all' | 'recognize' | 'sort' | 'sequence' | 'build'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 3 Bloom's Taxonomy Cognitive Depth Cards (matching bluesteam-v2-game-lab-overview.png)
  const bloomCards = [
    {
      id: 'recognize',
      title: 'Nhận biết',
      icon: Eye,
      image: '/assets/generated/creatures/clownfish_isolated.jpg',
      path: '/interactive/habitat-placement?step=recognition',
      alt: 'Cá hề và hải quỳ rực rỡ',
    },
    {
      id: 'understand',
      title: 'Hiểu',
      icon: Brain,
      image: '/assets/generated/creatures/green_turtle_hero.jpg',
      path: '/interactive/habitat-placement',
      alt: 'Rùa biển xanh bơi lội',
    },
    {
      id: 'apply',
      title: 'Vận dụng',
      icon: Settings,
      image: '/assets/generated/stations/station_coral_reef.jpg',
      path: '/interactive/habitat-placement?step=feedback',
      alt: 'Hệ sinh thái rạn san hô',
    },
  ];

  // 4 Discovery Activities
  const activities = [
    {
      id: 'shells',
      title: 'Nhận biết vỏ sò',
      category: 'recognize',
      tag: 'Nhận biết',
      icon: Eye,
      image: '/assets/generated/stations/station_hermit_crab.jpg',
      path: '/interactive/habitat-placement?step=recognition',
    },
    {
      id: 'sort-species',
      title: 'Sắp xếp sinh vật biển',
      category: 'sort',
      tag: 'Sắp xếp',
      icon: Layers,
      image: '/assets/generated/stations/station_seagrass_fish.jpg',
      path: '/interactive/habitat-placement',
    },
    {
      id: 'fish-lifecycle',
      title: 'Sắp xếp vòng đời cá',
      category: 'sequence',
      tag: 'Theo trình tự',
      icon: Sparkles,
      image: '/assets/generated/stations/station_seagrass_fish.jpg',
      path: '/interactive/habitat-placement',
    },
    {
      id: 'build-reef',
      title: 'Tạo rạn san hô',
      category: 'build',
      tag: 'Xây dựng môi trường sống',
      icon: Gamepad2,
      image: '/assets/generated/stations/station_coral_reef.jpg',
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
        <div className="relative w-full pt-10 pb-16 px-6 sm:px-12 lg:px-16 overflow-hidden bg-[#0A2E44] text-white">
          {/* Background Ocean & Humpback Whale Backdrop */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/generated/backgrounds/whale_hero_gamelab.jpg"
              alt="Cá voi lưng gù bơi lội trong lòng đại dương"
              className="w-full h-full object-cover object-center scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E44]/75 via-[#0A2E44]/35 to-[#0A2E44]/80 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-6">
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

            {/* 3 Bloom's Taxonomy Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6 pt-3">
              {bloomCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={() => navigate(card.path)}
                    className="group rounded-[28px] bg-white p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.22)] border border-white/80 hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer hover:-translate-y-1.5 flex flex-col justify-between"
                  >
                    <div className="w-full h-44 sm:h-40 lg:h-48 rounded-[20px] overflow-hidden mb-3 relative bg-[#0D384D] shadow-inner">
                      <img
                        src={card.image}
                        alt={card.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Bottom Pill Container */}
                    <div className="flex items-center justify-between px-2 py-1">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#102A38] text-white flex items-center justify-center shadow-sm shrink-0">
                          <Icon className="w-4 h-4 text-[#2EE6CA]" />
                        </div>
                        <span className="font-serif font-black text-xl text-[#102A38] tracking-[-0.01em]">
                          {card.title}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#EAE4D5]/40 flex items-center justify-center text-[#102A38] group-hover:bg-[#102A38] group-hover:text-white transition-colors duration-200">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: "Hoạt động để bé khám phá"                                     */}
        {/* ========================================================================= */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-6 sm:px-12 lg:px-16 py-10 space-y-10">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#102A38] tracking-[-0.02em]">
                Hoạt động để bé khám phá
              </h2>

              {/* Search Bar & "Xem tất cả >" CTA */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm"
                    className="pl-9 pr-4 py-2.5 rounded-full bg-white border border-[#E5ECEF] text-xs font-bold text-[#102A38] focus:outline-none focus:ring-2 focus:ring-[#17657A]/40 w-48 shadow-xs"
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

          {/* 4 Activities Grid (Portrait & iPad responsive) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredActivities.map((act) => {
              const TagIcon = act.icon;
              return (
                <div
                  key={act.id}
                  onClick={() => navigate(act.path)}
                  className="group rounded-[28px] bg-white border border-[#EAE4D5]/80 p-4 shadow-[0_4px_20px_rgba(16,42,56,0.06)] hover:shadow-[0_14px_32px_rgba(16,42,56,0.14)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-36 sm:h-40 rounded-[20px] overflow-hidden mb-3.5 relative bg-slate-100 shadow-inner">
                      <img
                        src={act.image}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {/* Badge Pill */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3F7] text-[11px] font-extrabold text-[#17657A] mb-2.5 border border-[#D5E6EE]">
                      <TagIcon className="w-3 h-3" />
                      <span>{act.tag}</span>
                    </div>
                    <h3 className="font-serif font-black text-base text-[#102A38] group-hover:text-[#17657A] transition-colors line-clamp-1 tracking-tight">
                      {act.title}
                    </h3>
                  </div>

                  <div className="self-end mt-4 w-7 h-7 rounded-full bg-[#EAE4D5]/40 flex items-center justify-center text-[#102A38] group-hover:bg-[#102A38] group-hover:text-white transition-colors duration-200">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: "Chơi tiếp" (Prominent Continuation Card)                     */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-4">
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#102A38] tracking-[-0.02em]">
              Chơi tiếp
            </h2>

            <div className="rounded-[32px] bg-white border border-[#EAE4D5] p-6 sm:p-8 shadow-[0_12px_36px_rgba(16,42,56,0.08)] flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left: Current Active Game Card */}
              <div className="w-full lg:w-84 flex flex-col gap-2.5 shrink-0">
                <div className="w-full h-44 rounded-[22px] overflow-hidden relative shadow-sm">
                  <img
                    src="/assets/generated/stations/station_coral_reef.jpg"
                    alt="Tạo rạn san hô đang diễn ra"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-extrabold text-[#102A38] shadow-sm flex items-center gap-2 border border-white/80">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2EE6CA] animate-pulse" />
                    <span>Đang thực hiện</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 pt-1 px-1">
                  <Gamepad2 className="w-5 h-5 text-[#102A38]" />
                  <span className="font-serif font-black text-lg text-[#102A38] tracking-tight">
                    Tạo rạn san hô
                  </span>
                </div>
              </div>

              {/* Center: 4 Horizontal Progress Steps matching Mockup */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 flex-nowrap shrink-0">
                {/* Step 1: Quan sát (Active) */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-[#102A38] text-white flex items-center justify-center shadow-md">
                    <Eye className="w-6 h-6 text-[#2EE6CA]" />
                  </div>
                  <span className="text-xs font-black text-[#102A38]">Quan sát</span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

                {/* Step 2: Đặt vào */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-[#E5ECEF] text-[#4A6472] flex items-center justify-center">
                    <Puzzle className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#5C7482]">Đặt vào</span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

                {/* Step 3: Thử */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-[#E5ECEF] text-[#4A6472] flex items-center justify-center">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#5C7482]">Thử</span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

                {/* Step 4: Xem lại */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-[#E5ECEF] text-[#4A6472] flex items-center justify-center">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#5C7482]">Xem lại</span>
                </div>
              </div>

              {/* Right: Primary "Tiếp tục" Action Button */}
              <button
                type="button"
                onClick={() => navigate('/interactive/habitat-placement')}
                className="w-full lg:w-auto px-8 py-4 rounded-full bg-[#102A38] hover:bg-[#163B4E] text-white font-bold text-sm shadow-[0_8px_20px_rgba(16,42,56,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 shrink-0"
              >
                <span>Tiếp tục</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FOOTER AMBIENT OCEAN & CORAL VECTOR DECORATION (NO EMOJIS)                 */}
        {/* ========================================================================= */}
        <div className="w-full mt-auto relative overflow-hidden bg-gradient-to-b from-transparent via-[#0B2B3E]/80 to-[#081F2D] pt-12 pb-6 px-8 text-white pointer-events-none">
          <div className="max-w-5xl mx-auto flex items-end justify-between relative z-10">
            {/* Left Coral Reef Silhouettes (Terracotta & Gold) */}
            <div className="w-48 h-20 opacity-85">
              <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Coral Branch 1 */}
                <path
                  d="M20 80C20 60 15 45 28 35C35 30 45 35 48 25C50 20 45 15 50 10C53 7 58 8 60 12C63 18 58 25 65 30C75 35 70 55 70 80H20Z"
                  fill="#F67650"
                  opacity="0.9"
                />
                {/* Coral Branch 2 */}
                <path
                  d="M65 80C65 65 72 50 82 45C90 40 98 48 105 38C108 33 103 26 110 22C115 19 120 22 122 28C124 35 118 42 125 48C132 55 130 68 130 80H65Z"
                  fill="#E5A93C"
                  opacity="0.75"
                />
                {/* Seaweed Tendril */}
                <path
                  d="M5 80C8 65 3 50 8 38C12 28 20 25 18 15C16 8 10 12 12 5"
                  stroke="#2EE6CA"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </svg>
            </div>

            {/* Center Brand Note */}
            <div className="text-center pb-1">
              <span className="font-serif font-bold text-sm tracking-wide text-white/80">
                BlueSTEAM Living Ocean Game Lab
              </span>
            </div>

            {/* Right School of Swimming Fish Silhouettes */}
            <div className="w-48 h-16 opacity-80">
              <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Fish 1 */}
                <path
                  d="M170 20C155 12 140 22 130 20C125 19 120 15 120 20C120 25 125 21 130 20C140 18 155 28 170 20ZM170 20L180 15V25L170 20Z"
                  fill="#2EE6CA"
                  opacity="0.8"
                />
                {/* Fish 2 */}
                <path
                  d="M140 38C128 32 116 40 108 38C104 37 100 34 100 38C100 42 104 39 108 38C116 36 128 44 140 38ZM140 38L148 34V42L140 38Z"
                  fill="#2EE6CA"
                  opacity="0.65"
                />
                {/* Fish 3 */}
                <path
                  d="M185 45C175 40 165 47 158 45C155 44 152 41 152 45C152 49 155 46 158 45C165 43 175 50 185 45ZM185 45L192 42V48L185 45Z"
                  fill="#FFFFFF"
                  opacity="0.7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
