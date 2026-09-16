import { useState } from 'react';
import { useRouter } from '../../app/router';
import { useI18n } from '../../shared/i18n/I18nContext';
import { LearnerShell } from '../../shells/LearnerShell';
import { InteractiveSubNav } from '../../components/interactive/InteractiveSubNav';
import { ArrowRight, Search } from 'lucide-react';

export function SimulationsCatalogPage() {
  const { navigate } = useRouter();
  const { locale } = useI18n();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { id: 'all', labelVi: 'Tất cả', labelEn: 'All' },
    { id: 'choice', labelVi: 'Lựa chọn', labelEn: 'Choices' },
    { id: 'track', labelVi: 'Theo dấu', labelEn: 'Track' },
    { id: 'build', labelVi: 'Xây và thử', labelEn: 'Build & Test' },
  ];

  const moreActivities = [
    {
      id: 'habitat-choice',
      titleVi: 'Chọn nơi sống',
      titleEn: 'Choose Habitat',
      descVi: 'Thử các lựa chọn để tạo môi trường sống phù hợp cho sinh vật biển.',
      descEn: 'Test choices to build suitable living conditions for marine life.',
      image: '/assets/generated/simulations/sim_card_habitat.png',
      legacyAsset: 'station_seagrass_fish.jpg',
      category: 'choice',
      route: '/interactive/habitat-placement',
    },
    {
      id: 'waste-track',
      titleVi: 'Theo dấu rác thải',
      titleEn: 'Track Marine Debris',
      descVi: 'Quan sát dòng chảy và xem rác thải có thể trôi đến đâu.',
      descEn: 'Follow water currents to observe where marine litter travels.',
      image: '/assets/generated/simulations/sim_card_waste.png',
      legacyAsset: 'split_coastal_plastic_journey.jpg',
      category: 'track',
      route: '/interactive/plastic-journey',
    },
    {
      id: 'barrier-solution',
      titleVi: 'Xây giải pháp',
      titleEn: 'Build Solutions',
      descVi: 'Thử thiết kế và kiểm tra hiệu quả các giải pháp bảo vệ bờ biển.',
      descEn: 'Design and test protective coastal barrier solutions.',
      image: '/assets/generated/simulations/sim_card_barrier.png',
      legacyAsset: 'coastal_bay_rescue_hero.jpg',
      category: 'build',
      route: '/creative/habitat',
    },
    {
      id: 'mangrove-restore',
      titleVi: 'Phục hồi rừng ngập mặn',
      titleEn: 'Mangrove Restoration',
      descVi: 'Khám phá cách rừng ngập mặn giúp đại dương khỏe mạnh hơn.',
      descEn: 'Discover how mangrove forests nurture a resilient living ocean.',
      image: '/assets/generated/simulations/sim_card_mangrove.png',
      legacyAsset: 'mangrove_coastal_ecosystem.jpg',
      category: 'build',
      route: '/interactive/rescue-mission',
    },
  ];

  const filteredActivities = moreActivities.filter((act) => {
    if (activeFilter !== 'all' && act.category !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        act.titleVi.toLowerCase().includes(q) ||
        act.titleEn.toLowerCase().includes(q) ||
        act.descVi.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <LearnerShell activeNav="interactive">
      <div className="min-h-screen bg-[#F9F8F3] text-[#102A38] font-sans pb-16 relative select-none overflow-x-hidden">
        {/* Top Coastal Panorama Background Art matching interactive-simulations.png */}
        <div className="absolute top-0 left-0 right-0 w-full h-[240px] pointer-events-none select-none z-0 overflow-hidden">
          <img
            src="/assets/generated/simulations/sim_coastal_panorama_bg.jpg"
            alt="Bờ vịnh biển nhiệt đới"
            className="w-full h-full object-cover object-top opacity-95"
          />
        </div>

        {/* Ambient Side Foliage (Customs trang trí 2 bên lề) */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10" aria-hidden="true">
          {/* Bottom Left Seaweed & Coral Clump */}
          <img
            src="/assets/generated/simulations/sim_decor_seaweed_coral_left_clean.png"
            alt="Rong biển và san hô trang trí bên trái"
            className="absolute -bottom-2 left-0 w-28 sm:w-36 lg:w-44 h-auto pointer-events-none drop-shadow-xs"
          />
          {/* Bottom Right Seaweed Clump */}
          <img
            src="/assets/generated/simulations/sim_decor_seaweed_right_clean.png"
            alt="Rong biển trang trí bên phải"
            className="absolute -bottom-2 right-0 w-28 sm:w-36 lg:w-44 h-auto pointer-events-none drop-shadow-xs"
          />
        </div>

        {/* Main Content Viewport (1536px Landscape Layout) */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pt-6 pb-4">
          {/* Sub-system Segmented Switcher (Kết nối 3 Phân hệ: Game Lab vs Mô Phỏng vs Khám Phá 3D) */}
          <InteractiveSubNav activeTab="simulations" className="mb-5" />

          {/* Header Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#102A38] tracking-[-0.02em] font-serif leading-tight">
              {locale === 'vi' ? 'Thử những điều có thể xảy ra' : 'Explore What Could Happen'}
            </h1>
            <p className="text-sm sm:text-base text-[#102A38]/85 max-w-2xl leading-relaxed">
              {locale === 'vi'
                ? 'Khám phá các tình huống, thử cách giải quyết và quan sát điều gì sẽ xảy ra trong thế giới đại dương.'
                : 'Explore scenarios, experiment with solutions, and observe cause-and-effect in marine ecosystems.'}
            </p>
          </div>

          {/* ========================================================================= */}
          {/* PRIMARY BENTO HERO GRID (1536x1024 Authentic Layout)                     */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mt-6 sm:mt-7">
            {/* Left Big Hero Card: "Hành trình giải cứu" (7 Cols) */}
            <div
              onClick={() => navigate('/interactive/rescue-mission')}
              className="lg:col-span-7 rounded-[28px] overflow-hidden relative group cursor-pointer shadow-[0_12px_32px_rgba(16,42,56,0.14)] hover:shadow-[0_18px_44px_rgba(16,42,56,0.22)] card-tactile-lift active:scale-[0.99] transition-all duration-300 min-h-[380px] sm:min-h-[410px] flex flex-col justify-between p-7 sm:p-9 bg-[#0A2E44]"
            >
              {/* Card Photo Backdrop with split sea turtle & rocky bay */}
              <img
                src="/assets/generated/backgrounds/coastal_bay_rescue_hero.jpg"
                alt="Hành trình giải cứu rùa biển trong vịnh"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Dark editorial gradient overlay for pristine legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A2E44]/95 via-[#0A2E44]/75 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#15586E]/80 backdrop-blur-md text-[#2EE6CA] text-[11px] font-black uppercase tracking-wider border border-[#2EE6CA]/30 shadow-xs">
                  {locale === 'vi' ? 'MÔ PHỎNG TƯƠNG TÁC' : 'INTERACTIVE SIMULATION'}
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white font-serif tracking-[-0.02em] leading-tight drop-shadow-xs">
                  {locale === 'vi' ? 'Hành trình giải cứu' : 'Rescue Mission'}
                </h2>
                <p className="text-xs sm:text-sm text-white/90 max-w-md leading-relaxed">
                  {locale === 'vi'
                    ? 'Khám phá vùng vịnh, tìm hiểu các mối đe dọa và thử những cách giúp đại dương sạch hơn.'
                    : 'Explore the bay, identify marine hazards, and discover effective rescue actions.'}
                </p>
              </div>

              <div className="relative z-10 pt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/interactive/rescue-mission');
                  }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F26A5A] hover:bg-[#E55746] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer btn-shimmer-sweep relative overflow-hidden"
                >
                  <span>{locale === 'vi' ? 'Bắt đầu' : 'Start'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Stack (5 Cols): 2 Full-Bleed Split Cards */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-5 sm:gap-6">
              {/* Card 1: "Hành động của em" (Split text left, full-bleed photo right) */}
              <div
                onClick={() => navigate('/interactive/my-action')}
                className="flex-1 rounded-[28px] overflow-hidden bg-[#f0f7f9] border border-[#D5E6ED] shadow-[0_6px_24px_rgba(16,42,56,0.06)] hover:shadow-[0_12px_32px_rgba(16,42,56,0.12)] card-tactile-lift active:scale-[0.99] transition-all duration-300 min-h-[180px] sm:min-h-[192px] flex items-stretch cursor-pointer group"
              >
                {/* Left Text Content */}
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 min-w-0">
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-[22px] font-black text-[#102A38] font-serif tracking-tight group-hover:text-[#17657A] transition-colors leading-snug">
                      {locale === 'vi' ? 'Hành động của em' : 'My Actions'}
                    </h3>
                    <p className="text-xs text-[#5C7482] line-clamp-3 leading-relaxed">
                      {locale === 'vi'
                        ? 'Mỗi lựa chọn nhỏ đều có thể tạo ra thay đổi lớn. Thử xem hành động của em sẽ dẫn đến điều gì.'
                        : 'Every small choice makes a big wave. See the consequences of your decisions.'}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/interactive/my-action');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DCEAF0] hover:bg-[#CDE3EC] text-[#15586E] font-bold text-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span>{locale === 'vi' ? 'Xem cách chơi' : 'How to Play'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Full Bleed Photo (Tràn viền bên phải) */}
                <div className="w-40 sm:w-48 lg:w-52 h-full overflow-hidden shrink-0 relative">
                  <img
                    src="/assets/generated/simulations/sim_bottle_beach.png"
                    alt="Thông điệp trong chai trên bãi cát"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-r-[28px]"
                  />
                </div>
              </div>

              {/* Card 2: "Một mảnh nhựa đi đâu?" (Deep Oceanic Split Card) */}
              <div
                onClick={() => navigate('/interactive/plastic-journey')}
                className="flex-1 rounded-[28px] overflow-hidden bg-[#0A2E44] shadow-[0_8px_24px_rgba(16,42,56,0.15)] hover:shadow-[0_14px_32px_rgba(16,42,56,0.22)] card-tactile-lift active:scale-[0.99] transition-all duration-300 min-h-[180px] sm:min-h-[192px] flex items-stretch cursor-pointer group"
              >
                {/* Left Text Content */}
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 min-w-0">
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-[22px] font-black text-white font-serif tracking-tight leading-snug">
                      {locale === 'vi' ? 'Một mảnh nhựa đi đâu?' : 'Where Does Plastic Go?'}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-3 leading-relaxed">
                      {locale === 'vi'
                        ? 'Theo dấu hành trình của một mảnh nhựa từ đất liền ra đại dương và khám phá điều gì có thể xảy ra trên đường đi.'
                        : 'Track plastic fragments from land to deep waters and learn the impacts along the route.'}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/interactive/plastic-journey');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E5EEF3] hover:bg-white text-[#102A38] font-bold text-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span>{locale === 'vi' ? 'Xem cách chơi' : 'How to Play'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#15586E]" />
                    </button>
                  </div>
                </div>

                {/* Right Full Bleed Photo (Tràn viền bên phải) */}
                <div className="w-40 sm:w-48 lg:w-52 h-full overflow-hidden shrink-0 relative">
                  <img
                    src="/assets/generated/simulations/sim_plastic_journey.png"
                    alt="Mảnh nhựa dưới nước"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-r-[28px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LOWER SECTION: "Khám phá thêm hoạt động" (4 Full-Bleed Activity Cards)    */}
          {/* ========================================================================= */}
          <div className="mt-12 sm:mt-14 space-y-5 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <h3 className="text-2xl sm:text-3xl font-black text-[#102A38] font-serif tracking-tight">
                  {locale === 'vi' ? 'Khám phá thêm hoạt động' : 'Explore More Activities'}
                </h3>
                <div className="flex items-center gap-2">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeFilter === tab.id
                          ? 'bg-[#102A38] text-white shadow-xs'
                          : 'bg-white/90 text-[#102A38]/75 hover:bg-white hover:text-[#102A38] border border-[#E2EAEF]'
                      }`}
                    >
                      {locale === 'vi' ? tab.labelVi : tab.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar & "Xem thêm ->" */}
              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={locale === 'vi' ? 'Tìm hoạt động...' : 'Search activities...'}
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#E2EAEF] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#17657A]/30 text-[#102A38] shadow-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className="text-xs font-bold text-[#102A38] hover:text-[#17657A] flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <span>{locale === 'vi' ? 'Xem thêm' : 'View all'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4 Cards Grid with Full Bleed Images on Top */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => navigate(act.route)}
                  className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(16,42,56,0.06)] hover:shadow-[0_14px_32px_rgba(16,42,56,0.14)] card-tactile-lift active:scale-[0.98] card-img-zoom transition-all duration-300 border border-[#EAE5DB] group cursor-pointer flex flex-col justify-between"
                >
                  {/* Full Bleed Image (Tràn viền cạnh trên, trái, phải) */}
                  <div className="w-full h-40 sm:h-44 overflow-hidden relative bg-slate-100">
                    <img
                      src={act.image}
                      alt={locale === 'vi' ? act.titleVi : act.titleEn}
                      data-legacy-asset={act.legacyAsset}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-[24px]"
                    />
                  </div>

                  {/* Card Body with Clear Typography Hierarchy */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 bg-white">
                    <div className="space-y-1.5">
                      <h4 className="text-base sm:text-[17px] font-black text-[#102A38] font-serif group-hover:text-[#17657A] transition-colors leading-snug tracking-tight">
                        {locale === 'vi' ? act.titleVi : act.titleEn}
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#5C7482] line-clamp-2 leading-relaxed">
                        {locale === 'vi' ? act.descVi : act.descEn}
                      </p>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(act.route);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E8F1F5] hover:bg-[#D5E4EC] text-[#15586E] font-bold text-xs transition-colors cursor-pointer"
                      >
                        <span>{locale === 'vi' ? 'Xem cách chơi' : 'How to Play'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
