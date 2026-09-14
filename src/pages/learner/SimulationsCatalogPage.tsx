import { useState } from 'react';
import { useRouter } from '../../app/router';
import { useI18n } from '../../shared/i18n/I18nContext';
import { LearnerShell } from '../../shells/LearnerShell';
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
      image: '/assets/generated/stations/isometric_glass_habitat.jpg',
      category: 'choice',
      route: '/interactive/habitat-placement',
    },
    {
      id: 'waste-track',
      titleVi: 'Theo dấu rác thải',
      titleEn: 'Track Marine Debris',
      descVi: 'Quan sát dòng chảy và xem rác thải có thể trôi đến đâu.',
      descEn: 'Follow water currents to observe where marine litter travels.',
      image: '/assets/generated/backgrounds/split_coastal_plastic_journey.jpg',
      category: 'track',
      route: '/interactive/plastic-journey',
    },
    {
      id: 'barrier-solution',
      titleVi: 'Xây giải pháp',
      titleEn: 'Build Solutions',
      descVi: 'Thử thiết kế và kiểm tra hiệu quả các giải pháp bảo vệ bờ biển.',
      descEn: 'Design and test protective coastal barrier solutions.',
      image: '/assets/generated/backgrounds/coastal_bay_rescue_hero.jpg',
      category: 'build',
      route: '/creative/habitat',
    },
    {
      id: 'mangrove-restore',
      titleVi: 'Phục hồi rừng ngập mặn',
      titleEn: 'Mangrove Restoration',
      descVi: 'Khám phá cách rừng ngập mặn giúp đại dương khỏe mạnh hơn.',
      descEn: 'Discover how mangrove forests nurture a resilient living ocean.',
      image: '/assets/generated/stations/mangrove_ecosystem_poster.jpg',
      category: 'build',
      route: '/interactive/simulations',
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
      <div className="min-h-screen bg-[#f7f5ef] pb-16 relative">
        {/* Subtle coastal background header art */}
        <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-4">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black text-[#102A38] tracking-[-0.02em] font-serif">
              {locale === 'vi' ? 'Thử những điều có thể xảy ra' : 'Explore What Could Happen'}
            </h1>
            <p className="text-base text-[#17657A]/85 max-w-3xl">
              {locale === 'vi'
                ? 'Khám phá các tình huống, thử cách giải quyết và quan sát điều gì sẽ xảy ra trong thế giới đại dương.'
                : 'Explore scenarios, experiment with solutions, and observe cause-and-effect in marine ecosystems.'}
            </p>
          </div>

          {/* Primary 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
            {/* Left Big Hero Card: Hành trình giải cứu (7 Cols) */}
            <div
              onClick={() => navigate('/interactive/rescue-mission')}
              className="lg:col-span-7 rounded-[28px] overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 min-h-[380px] flex flex-col justify-between p-8"
              style={{
                backgroundImage: 'url(/assets/generated/backgrounds/coastal_bay_rescue_hero.jpg)',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            >
              {/* Dark gradient overlay for pristine legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e3f]/90 via-[#0d2e3f]/50 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#17657A]/80 backdrop-blur-md text-[#2EE6CA] text-xs font-black uppercase tracking-wider border border-[#2EE6CA]/30">
                  {locale === 'vi' ? 'MÔ PHỎNG TƯƠNG TÁC' : 'INTERACTIVE SIMULATION'}
                </span>
                <h2 className="text-3xl lg:text-4xl font-black text-white font-serif tracking-[-0.02em]">
                  {locale === 'vi' ? 'Hành trình giải cứu' : 'Rescue Mission'}
                </h2>
                <p className="text-sm text-white/90 max-w-md leading-relaxed">
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F67650] hover:bg-[#e06540] text-white font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <span>{locale === 'vi' ? 'Bắt đầu' : 'Start'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Stack (5 Cols): 2 Cards */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              {/* Card 1: Hành động của em (Light seaside card matching mockup) */}
              <div
                onClick={() => navigate('/interactive/my-action')}
                className="flex-1 rounded-[28px] overflow-hidden relative group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 min-h-[175px] flex flex-col justify-between p-6 bg-[#f0f7f9] border border-[#17657A]/15"
                style={{
                  backgroundImage: 'url(/assets/generated/backgrounds/glass_bottle_beach_cleanup.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 40%',
                }}
              >
                {/* Light gradient overlay for crisp contrast matching mockup */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40 pointer-events-none" />

                <div className="relative z-10 space-y-1.5 max-w-[65%]">
                  <h3 className="text-xl font-black text-[#102A38] font-serif tracking-[-0.02em]">
                    {locale === 'vi' ? 'Hành động của em' : 'My Actions'}
                  </h3>
                  <p className="text-xs text-[#12384B]/80 line-clamp-2 leading-relaxed">
                    {locale === 'vi'
                      ? 'Mỗi lựa chọn nhỏ đều có thể tạo ra thay đổi lớn. Thử xem hành động của em sẽ dẫn đến điều gì.'
                      : 'Every small choice makes a big wave. See the consequences of your decisions.'}
                  </p>
                </div>

                <div className="relative z-10 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/interactive/my-action');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#17657A]/10 hover:bg-[#17657A]/20 backdrop-blur-md text-[#102A38] font-bold text-xs transition-colors border border-[#17657A]/20 cursor-pointer"
                  >
                    <span>{locale === 'vi' ? 'Xem cách chơi' : 'How to Play'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#17657A]" />
                  </button>
                </div>
              </div>

              {/* Card 2: Một mảnh nhựa đi đâu? (Deep oceanic card) */}
              <div
                onClick={() => navigate('/interactive/plastic-journey')}
                className="flex-1 rounded-[28px] overflow-hidden relative group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 min-h-[175px] flex flex-col justify-between p-6"
                style={{
                  backgroundImage: 'url(/assets/generated/backgrounds/split_coastal_plastic_journey.jpg)',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a3141]/90 via-[#0a3141]/60 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-1.5 max-w-[65%]">
                  <h3 className="text-xl font-black text-white font-serif tracking-[-0.02em]">
                    {locale === 'vi' ? 'Một mảnh nhựa đi đâu?' : 'Where Does Plastic Go?'}
                  </h3>
                  <p className="text-xs text-white/85 line-clamp-2 leading-relaxed">
                    {locale === 'vi'
                      ? 'Theo dấu hành trình của một mảnh nhựa từ đất liền ra đại dương và khám phá điều gì có thể xảy ra trên đường đi.'
                      : 'Track plastic fragments from land to deep waters and learn the impacts along the route.'}
                  </p>
                </div>

                <div className="relative z-10 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/interactive/plastic-journey');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs transition-colors border border-white/20 cursor-pointer"
                  >
                    <span>{locale === 'vi' ? 'Xem cách chơi' : 'How to Play'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Khám phá thêm hoạt động */}
          <div className="mt-14 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <h3 className="text-2xl font-black text-[#102A38] font-serif tracking-[-0.02em]">
                  {locale === 'vi' ? 'Khám phá thêm hoạt động' : 'Explore More Activities'}
                </h3>
                <div className="flex items-center gap-2">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        activeFilter === tab.id
                          ? 'bg-[#102A38] text-white shadow-sm'
                          : 'bg-white/80 text-[#17657A] hover:bg-white border border-[#17657A]/15'
                      }`}
                    >
                      {locale === 'vi' ? tab.labelVi : tab.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === 'vi' ? 'Tìm hoạt động...' : 'Search activities...'}
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#17657A]/30 text-[#12384B]"
                />
              </div>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => navigate(act.route)}
                  className="bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#17657A]/10 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={act.image}
                      alt={locale === 'vi' ? act.titleVi : act.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h4 className="text-base font-bold text-[#102A38] font-serif group-hover:text-[#17657A] transition-colors line-clamp-1">
                        {locale === 'vi' ? act.titleVi : act.titleEn}
                      </h4>
                      <p className="text-xs text-[#12384B]/70 line-clamp-2 leading-relaxed">
                        {locale === 'vi' ? act.descVi : act.descEn}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#17657A]">
                      <span>{locale === 'vi' ? 'Khám phá' : 'Explore'}</span>
                      <div className="w-6 h-6 rounded-full bg-[#17657A]/10 flex items-center justify-center group-hover:bg-[#17657A] group-hover:text-white transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
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
