import { useState } from 'react';
import { useRouter } from '../../app/router';
import {
  ArrowRight,
  Search,
  X,
  ChevronRight,
} from 'lucide-react';

interface DepthZone {
  id: string;
  name: string;
  depth: string;
  light: string;
  temp: string;
  pressure: string;
  desc: string;
  specimenName: string;
  tagDepth: string;
}

export const DEPTH_ZONES: DepthZone[] = [
  {
    id: 'surface',
    name: 'Vùng mặt nước',
    depth: '0 m',
    light: '100% ánh sáng mặt trời',
    temp: '24°C – 28°C',
    pressure: '1 atm',
    desc: 'Vùng ngập tràn nắng ấm, nơi diễn ra hơn 90% quá trình quang hợp đại dương. Sinh sống bởi rùa biển, rạn san hô, cá heo và thảm cỏ biển.',
    specimenName: 'Đồi mồi dứa (Chelonia mydas)',
    tagDepth: '0 M · MẶT NƯỚC',
  },
  {
    id: 'sunlight',
    name: 'Vùng ánh sáng',
    depth: '200 m',
    light: 'Quang phổ xanh lam mờ',
    temp: '14°C – 20°C',
    pressure: '20 atm',
    desc: 'Tia sáng đỏ tắt nhanh chóng sau 15m đầu tiên. Luồng ánh sáng lục và lam yếu ớt xuyên qua. Cá voi lưng gù thường lặn kiếm ăn tại vùng này.',
    specimenName: 'Cá voi lưng gù (Megaptera novaeangliae)',
    tagDepth: '200 M · VÙNG ÁNH SÁNG',
  },
  {
    id: 'twilight',
    name: 'Vùng chạng vạng',
    depth: '1.000 m',
    light: 'Ranh giới chạng vạng',
    temp: '4°C – 8°C',
    pressure: '100 atm',
    desc: 'Ánh nắng mặt trời dần biến mất hoàn toàn. Động vật sử dụng cơ quan phát quang sinh học để săn mồi và ngụy trang dưới bóng tối.',
    specimenName: 'Sứa phát quang sinh học (Aequorea victoria)',
    tagDepth: '1.000 M · VÙNG CHẠNG VẠNG',
  },
  {
    id: 'midnight',
    name: 'Vùng tối',
    depth: '4.000 m',
    light: 'Bóng tối vĩnh hằng',
    temp: '2°C – 4°C',
    pressure: '400 atm',
    desc: 'Bóng tối vĩnh viễn và áp suất khổng lồ. Nguồn dinh dưỡng chính là tuyết biển (marine snow) rơi từ các tầng nước bên trên.',
    specimenName: 'Mực khổng lồ (Architeuthis dux)',
    tagDepth: '4.000 M · VÙNG TỐI',
  },
  {
    id: 'abyss',
    name: 'Vực thẳm',
    depth: '6.000 m+',
    light: 'Không ánh sáng',
    temp: '1°C – 3°C',
    pressure: '1.000+ atm',
    desc: 'Các rãnh đại dương sâu nhất hành tinh. Sự sống kỳ bí quanh miệng phun thủy nhiệt giàu khoáng chất sulfur và sắt.',
    specimenName: 'Cá vây chân rãnh ngầm (Pseudoliparis swirei)',
    tagDepth: '6.000 M+ · VỰC THẲM',
  },
];

export function ConceptAPage() {
  const { navigate } = useRouter();
  const [activeDepthIndex, setActiveDepthIndex] = useState<number>(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCardModal, setActiveCardModal] = useState<string | null>(null);

  const activeZone = DEPTH_ZONES[activeDepthIndex];

  return (
    <div className="relative min-h-screen bg-[#f8f6f0] text-slate-900 font-sans selection:bg-sky-200 selection:text-sky-900">
      {/* ========================================================
          1. HEADER (Thanh điều hướng tinh gọn phong cách Editorial)
      ======================================================== */}
      {/* ========================================================
          1. HEADER (Ocean-Immerse Brand Navigation)
      ======================================================== */}
      <header className="sticky top-0 z-30 w-full bg-[#f8f6f0]/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <span className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#0a273f]">
              Ocean-Immerse
            </span>
          </div>

          {/* Center Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-sky-900 font-semibold transition-colors cursor-pointer"
            >
              Trang chủ
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('lan-sau-the-gioi-ky-dieu');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-sky-700 transition-colors cursor-pointer"
            >
              Khám phá
            </button>
            <button
              onClick={() => navigate('/student/progress')}
              className="hover:text-sky-700 transition-colors cursor-pointer"
            >
              Bộ sưu tập
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-full hover:bg-slate-200/60 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Tìm kiếm bài học và sinh vật"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Đăng nhập Link */}
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-slate-700 hover:text-sky-900 transition-colors cursor-pointer px-2"
            >
              Đăng nhập
            </button>

            {/* Bắt đầu ngay Pill Button */}
            <button
              onClick={() => navigate('/join')}
              className="px-6 py-2.5 rounded-full bg-[#0a273f] text-white text-sm font-semibold hover:bg-sky-800 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Bắt đầu ngay
            </button>
          </div>
        </div>

        {/* Quick Search Drawer */}
        {searchOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-4 animate-in slide-in-from-top-2 duration-200 shadow-sm">
            <div className="max-w-2xl mx-auto flex items-center gap-3 bg-slate-100 rounded-full px-4 py-2 border border-slate-300">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm: Cá voi lưng gù, Rạn san hô, Dòng chảy, Vực thẳm..."
                className="w-full bg-transparent text-sm text-slate-800 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          2. HERO: CẢ MỘT ĐẠI DƯƠNG. MỞ RA CÁCH HỌC MỚI.
      ======================================================== */}
      <section className="relative w-full min-h-[660px] md:min-h-[760px] bg-[#0c2f4a] overflow-clip">
        {/* Background Visual: Whale surfacing with sea spray */}
        <div
          className="absolute inset-0 z-10 bg-cover bg-center md:bg-right transition-transform duration-700"
          style={{ backgroundImage: `url('/concepts/assets/hero_whale_a.jpg')` }}
        >
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071a2a]/95 via-[#071a2a]/60 to-transparent w-full md:w-3/5" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#041c30] to-transparent" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 min-h-[660px] md:min-h-[760px] flex flex-col justify-center py-16">
          <div className="max-w-xl space-y-6">
            {/* Tagline Eyebrow */}
            <p className="text-xs font-mono font-bold tracking-[0.2em] text-sky-300 uppercase">
              THẾ GIỚI ĐẠI DƯƠNG ĐANG CHỜ BẠN
            </p>

            {/* Large Hero Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-tight leading-[1.08] drop-shadow-md">
              Cả một đại dương.<br />Mở ra cách học mới.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-sky-100/90 font-sans leading-relaxed drop-shadow-sm max-w-lg">
              Những trải nghiệm học tập sống động, đưa đại dương đến gần hơn với mọi lớp học.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('lan-sau-the-gioi-ky-dieu');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-full bg-white hover:bg-sky-50 text-slate-900 font-mono text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer touch-target-child"
              >
                <span>Khám phá</span>
                <ArrowRight className="w-4 h-4 text-slate-800" />
              </button>

              <button
                onClick={() => navigate('/teacher')}
                className="px-6 py-3.5 rounded-full bg-[#051a2a]/80 hover:bg-[#07243b] text-white border border-sky-400/40 font-mono text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer touch-target-child"
              >
                <span>Dành cho giáo viên</span>
              </button>
            </div>

            {/* Scroll Indicator */}
            <div className="pt-8 flex items-center gap-3 text-sky-200/80 font-mono text-xs">
              <div className="w-5 h-8 rounded-full border-2 border-sky-300/60 flex items-start justify-center p-1">
                <div className="w-1 h-2 bg-sky-300 rounded-full animate-bounce" />
              </div>
              <span className="tracking-wider">Cuộn để khám phá</span>
            </div>
          </div>
        </div>

        {/* Script callout near whale: Khám phá • Học hiểu • Bảo vệ */}
        <div className="hidden lg:flex absolute top-[36%] right-[10%] z-20 flex-col items-end pointer-events-none select-none">
          <span className="font-serif italic text-xl text-sky-100 drop-shadow-lg tracking-wide">
            Khám phá
          </span>
          <span className="font-serif italic text-xl text-sky-100 drop-shadow-lg tracking-wide">
            Học hiểu
          </span>
          <span className="font-serif italic text-xl text-sky-100 drop-shadow-lg tracking-wide">
            Bảo vệ
          </span>
        </div>
      </section>

      {/* ========================================================
          3. SECTION: HÀNH TRÌNH CHÌM SÂU (Continuous Ocean Plunge)
      ======================================================== */}
      {/* ========================================================
          3. SECTION: LẶN SÂU VÀO THẾ GIỚI KỲ DIỆU
      ======================================================== */}
      <section
        id="lan-sau-the-gioi-ky-dieu"
        className="relative w-full min-h-[660px] md:min-h-[740px] bg-[#051829] text-white py-24 overflow-hidden"
      >
        {/* Continuous Ocean Underwater Background with Sea Turtle */}
        <div
          className="absolute inset-0 z-10 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url('/concepts/assets/sea_turtle_reef.jpg')`,
            filter: `brightness(${Math.max(0.4, 0.9 - activeDepthIndex * 0.12)}) contrast(${1 + activeDepthIndex * 0.05})`,
          }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#03121f]/95 via-[#03121f]/60 to-[#03121f]/90 md:via-[#03121f]/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c2f4a] via-transparent to-[#04121e]/90" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[500px]">
          {/* Left Column: Typography & Environmental Info */}
          <div className="lg:col-span-6 space-y-6 max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-[1.1] drop-shadow-md">
              Lặn sâu vào thế giới kỳ diệu
            </h2>
            <p className="text-base sm:text-lg text-sky-100/90 font-sans leading-relaxed drop-shadow max-w-lg">
              Từ mặt nước đến vực thẳm, mỗi lớp nước đều có những câu chuyện riêng.
            </p>

            {/* Depth Zone Detail Card */}
            <div className="p-5 rounded-2xl bg-[#041624]/85 border border-sky-400/40 backdrop-blur-md shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wide">
                  {activeZone.tagDepth}
                </span>
                <span className="text-xs font-mono text-sky-200">
                  {activeZone.depth}
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                {activeZone.name}
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {activeZone.desc}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-sky-200 border-t border-sky-800/60">
                <span>Ánh sáng: {activeZone.light}</span>
                <span>Nhiệt độ: {activeZone.temp}</span>
                <span>Áp suất: {activeZone.pressure}</span>
              </div>
            </div>

            {/* Explore Button */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/student/journey')}
                className="px-6 py-3.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>Khám phá các lớp đại dương</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Vertical Depth Gauge (0m -> 6000m+) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-[2px] before:bg-sky-400/40">
              {DEPTH_ZONES.map((zone, idx) => {
                const isActive = activeDepthIndex === idx;
                return (
                  <div
                    key={zone.id}
                    onClick={() => setActiveDepthIndex(idx)}
                    className="relative flex items-center gap-4 cursor-pointer group select-none transition-all"
                  >
                    {/* Circle Node */}
                    <div
                      className={`-ml-8 w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold transition-all ${
                        isActive
                          ? 'bg-sky-400 text-slate-950 ring-4 ring-sky-400/40 scale-125 shadow-lg'
                          : 'bg-[#041624] border border-sky-400/60 text-sky-200 group-hover:border-sky-300 group-hover:scale-110'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Zone Info */}
                    <div className="p-2 rounded-xl group-hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-sm block transition-colors ${
                            isActive
                              ? 'text-white font-bold tracking-wide'
                              : 'text-slate-300 group-hover:text-white'
                          }`}
                        >
                          {zone.depth}
                        </span>
                        <span className="text-xs text-sky-300 font-sans">
                          {zone.name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Organic Wave Divider */}
        <div className="absolute inset-x-0 -bottom-1 overflow-hidden leading-none pointer-events-none z-20">
          <svg
            className="relative block w-full h-16 sm:h-20 text-[#f8f6f0]"
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,45 C360,110 800,5 1440,55 L1440,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      {/* ========================================================
          4. SECTION: TRẢI NGHIỆM HỌC TẬP TƯƠNG TÁC
      ======================================================== */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0a273f] tracking-tight">
            Trải nghiệm học tập tương tác
          </h2>
          <p className="text-base text-slate-600 font-sans leading-relaxed">
            Chạm vào, khám phá, và tự mình tìm ra câu trả lời.
          </p>
        </div>

        {/* 3 Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Quan sát (Shark) */}
          <div
            onClick={() => setActiveCardModal('shark')}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#062035]">
              <img
                src="/concepts/assets/card_shark.jpg"
                alt="Quan sát cá mập"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="text-xl font-serif font-bold text-[#0a273f] group-hover:text-sky-700 transition-colors">
                  Quan sát
                </h3>
              </div>
              <p className="text-xs font-mono text-slate-500">
                Quan sát thế giới xung quanh
              </p>
            </div>
          </div>

          {/* Card 2: Thử nghiệm (Clownfish) */}
          <div
            onClick={() => setActiveCardModal('clownfish')}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#062035]">
              <img
                src="/concepts/assets/card_clownfish.jpg"
                alt="Thử nghiệm hải quỳ"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h3 className="text-xl font-serif font-bold text-[#0a273f] group-hover:text-sky-700 transition-colors">
                  Thử nghiệm
                </h3>
              </div>
              <p className="text-xs font-mono text-slate-500">
                Tương tác và khám phá
              </p>
            </div>
          </div>

          {/* Card 3: Khám phá (Jellyfish) */}
          <div
            onClick={() => setActiveCardModal('jellyfish')}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#020b12]">
              <img
                src="/concepts/assets/card_jellyfish.jpg"
                alt="Khám phá sứa biển"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h3 className="text-xl font-serif font-bold text-[#0a273f] group-hover:text-sky-700 transition-colors">
                  Khám phá
                </h3>
              </div>
              <p className="text-xs font-mono text-slate-500">
                Đặt câu hỏi, tìm hiểu thêm
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. SECTION: NHỮNG HÀNH TRÌNH KHÁM PHÁ (Bám sát Mockup Tham Chiếu)
      ======================================================== */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0a273f] tracking-tight mb-8">
          Những hành trình khám phá
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Big Featured Left Card: Rạn san hô */}
          <div
            onClick={() => navigate('/student/journey')}
            className="lg:col-span-7 group relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 min-h-[340px] md:min-h-[380px] flex flex-col justify-end p-8 cursor-pointer hover:shadow-2xl transition-all"
          >
            <div
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: `url('/concepts/assets/coral_reef_panoramic.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#041624]/95 via-[#041624]/40 to-transparent" />
            <div className="relative z-10 text-white space-y-2">
              <h3 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
                Rạn san hô
              </h3>
              <p className="text-sky-100 text-base font-sans">
                Ngôi nhà của muôn loài
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-sky-300 group-hover:translate-x-1 transition-transform">
                  Khám phá ngay <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Two stacked cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Card 1: Dòng chảy đại dương */}
            <div
              onClick={() => navigate('/student/unit')}
              className="group relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 flex-1 min-h-[170px] flex items-center justify-between p-6 cursor-pointer hover:shadow-xl transition-all"
            >
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url('/assets/hero_buoy_waterline.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#041624]/90 via-[#041624]/60 to-[#041624]/30" />
              <div className="relative z-10 text-white space-y-1">
                <h4 className="text-xl sm:text-2xl font-serif font-bold">
                  Dòng chảy đại dương
                </h4>
                <p className="text-xs sm:text-sm text-sky-100 font-sans">
                  Sức mạnh kết nối Trái Đất
                </p>
              </div>
              <div className="relative z-10 p-3 rounded-full bg-white/20 backdrop-blur-md text-white group-hover:bg-white group-hover:text-slate-950 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Thảm cỏ biển */}
            <div
              onClick={() => navigate('/student/journey')}
              className="group relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 flex-1 min-h-[170px] flex items-center justify-between p-6 cursor-pointer hover:shadow-xl transition-all"
            >
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url('/assets/card_seagrass.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#041624]/90 via-[#041624]/60 to-[#041624]/30" />
              <div className="relative z-10 text-white space-y-1">
                <h4 className="text-xl sm:text-2xl font-serif font-bold">
                  Thảm cỏ biển
                </h4>
                <p className="text-xs sm:text-sm text-sky-100 font-sans">
                  Những cánh rừng dưới nước
                </p>
              </div>
              <div className="relative z-10 p-3 rounded-full bg-white/20 backdrop-blur-md text-white group-hover:bg-white group-hover:text-slate-950 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. SECTION: CÔNG CỤ CHO GIÁO VIÊN & THẾ HỆ YÊU ĐẠI DƯƠNG
      ======================================================== */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Teacher Tools with Library Mockup */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-[#0a273f] tracking-tight leading-tight">
              Công cụ mạnh mẽ<br />dành cho giáo viên
            </h3>
            <p className="text-base text-slate-600 font-sans leading-relaxed max-w-lg">
              Dễ dàng tạo bài giảng sống động, quản lý lớp học và theo dõi tiến độ học tập.
            </p>

            <button
              onClick={() => navigate('/teacher')}
              className="px-6 py-3 rounded-full bg-[#0a273f] hover:bg-sky-900 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Tìm hiểu thêm</span>
              <ArrowRight className="w-4 h-4 text-sky-300" />
            </button>

            {/* Teacher Dashboard Library Mockup UI */}
            <div className="mt-6 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-xs font-mono font-bold text-slate-800">
                    Thư viện bài học
                  </span>
                </div>
                <span className="text-[11px] font-mono text-sky-600">Đã sẵn sàng 14 bài giảng</span>
              </div>

              {/* Mini cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <img src="/concepts/assets/card_clownfish.jpg" alt="" className="w-full h-12 object-cover rounded-lg" />
                  <p className="text-[10px] font-bold text-slate-800 truncate">Sinh vật biển</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <img src="/concepts/assets/coral_reef_panoramic.jpg" alt="" className="w-full h-12 object-cover rounded-lg" />
                  <p className="text-[10px] font-bold text-slate-800 truncate">Hệ sinh thái</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <img src="/assets/hero_buoy_waterline.jpg" alt="" className="w-full h-12 object-cover rounded-lg" />
                  <p className="text-[10px] font-bold text-slate-800 truncate">Chuyển động biển</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <img src="/concepts/assets/card_jellyfish.jpg" alt="" className="w-full h-12 object-cover rounded-lg" />
                  <p className="text-[10px] font-bold text-slate-800 truncate">Biển sâu kỳ bí</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Community & Class Generation */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-[#0a273f] tracking-tight leading-tight">
              Cùng nhau tạo nên<br />thế hệ yêu đại dương
            </h3>
            <p className="text-base text-slate-600 font-sans leading-relaxed max-w-lg">
              Khi giáo viên, học sinh và công nghệ kết nối, việc học trở nên ý nghĩa hơn.
            </p>

            <button
              onClick={() => navigate('/presentation')}
              className="text-sm font-semibold text-sky-800 hover:text-sky-950 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Xem cách hoạt động</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Photo Container */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white mt-4 aspect-[16/10]">
              <img
                src="/concepts/assets/classroom_screen.jpg"
                alt="Lớp học tương tác với công nghệ Ocean"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. SECTION: BANNER: VÌ MỘT ĐẠI DƯƠNG KHỎE MẠNH HƠN
      ======================================================== */}
      <section className="relative w-full min-h-[460px] bg-[#0c2f4a] overflow-clip flex items-center justify-center text-center text-white">
        {/* Background Coastline Photo */}
        <div
          className="absolute inset-0 z-10 bg-cover bg-center"
          style={{ backgroundImage: `url('/concepts/assets/coastal_beach_footer.jpg')` }}
        >
          <div className="absolute inset-0 bg-[#071d2e]/65 backdrop-brightness-95" />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 py-20 space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight leading-tight text-white drop-shadow-md">
            Vì một đại dương khỏe mạnh hơn<br />cho những thế hệ mai sau.
          </h2>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => navigate('/student')}
              className="px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-xl cursor-pointer"
            >
              Khám phá ngay
            </button>
            <button
              onClick={() => navigate('/teacher')}
              className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/40 font-mono text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
            >
              Dành cho giáo viên
            </button>
          </div>

          <div className="pt-4">
            <span className="font-serif italic text-lg text-sky-200 drop-shadow">
              Học hôm nay, bảo vệ ngày mai
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. FOOTER (Ocean-Immerse Brand Footer)
      ======================================================== */}
      <footer className="w-full bg-white text-slate-600 border-t border-slate-200 py-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer group select-none"
            >
              <span className="text-2xl font-serif font-black tracking-tight text-[#0a273f]">
                Ocean-Immerse
              </span>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center gap-6 text-xs font-mono text-slate-600">
              <button
                onClick={() => navigate('/')}
                className="hover:text-sky-800 transition-colors cursor-pointer"
              >
                Về chúng tôi
              </button>
              <button
                onClick={() => navigate('/entry')}
                className="hover:text-sky-800 transition-colors cursor-pointer"
              >
                Liên hệ
              </button>
              <button
                onClick={() => navigate('/entry')}
                className="hover:text-sky-800 transition-colors cursor-pointer"
              >
                Chính sách
              </button>
              <button
                onClick={() => navigate('/entry')}
                className="hover:text-sky-800 transition-colors cursor-pointer"
              >
                Điều khoản
              </button>
            </nav>

            <div className="text-xs font-mono text-slate-400">
              <p>Đại dương kết nối chúng ta.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal detail for 3 cards */}
      {activeCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#071a2a] border border-sky-700/60 rounded-3xl p-6 text-white shadow-2xl">
            <button
              onClick={() => setActiveCardModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-mono">
                {activeCardModal === 'shark'
                  ? 'Mô phỏng tương tác'
                  : activeCardModal === 'clownfish'
                  ? 'Hệ sinh thái sống'
                  : 'Thử thách hấp dẫn'}
              </div>

              <h3 className="text-2xl font-serif font-bold text-white">
                {activeCardModal === 'shark'
                  ? 'Cá mập trắng và chuyển động săn mồi'
                  : activeCardModal === 'clownfish'
                  ? 'Cá hề và hệ sinh thái rạn san hô'
                  : 'Sứa biển và hiện tượng phát quang sinh học'}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {activeCardModal === 'shark'
                  ? 'Khám phá giải phẫu học cơ thể hình thoi giúp cá mập rẽ nước với lực cản tối thiểu, cùng các giác quan cảm ứng từ trường ampullae của Lorenzini.'
                  : activeCardModal === 'clownfish'
                  ? 'Khám phá lớp màng nhầy đặc biệt bảo vệ cá hề khỏi nọc độc của xúc tu hải quỳ, tạo nên sự cộng sinh hoàn hảo nơi rạn san hô.'
                  : 'Tìm hiểu phản ứng oxy hóa của phân tử luciferin với enzyme luciferase, tạo ra nguồn ánh sáng lạnh không tỏa nhiệt chiếu sáng vùng nước sâu thẳm.'}
              </p>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveCardModal(null);
                    navigate('/student');
                  }}
                  className="px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Mở chế độ học sinh
                </button>
                <button
                  onClick={() => setActiveCardModal(null)}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
