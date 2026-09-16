import { useState } from 'react';
import { useRouter } from '../../app/router';
import { PublicShell } from '../../shells/PublicShell';
import { BlueSteamLogo } from '../../shared/components/BlueSteamLogo';
import {
  ArrowRight,
  Recycle,
  Trash2,
  FileText,
  Gamepad2,
  Image as ImageIcon,
} from 'lucide-react';

const CREATURES_CONFIG = {
  jellyfish: {
    name: 'Sứa biển',
    desc: 'Cơ thể trong suốt, di chuyển nhẹ nhàng theo dòng nước.',
    galleryImg: '/assets/generated/stations/aquarium_gallery_jellyfish.jpg',
    thumbImg: '/assets/generated/creatures/thumb_jellyfish_tile.jpg',
    detailUrl: '/3dmodel/jellyfish',
  },
  clownfish: {
    name: 'Cá hề',
    desc: 'Màu sắc rực rỡ, sống cộng sinh an toàn giữa các xúc tu hải quỳ.',
    galleryImg: '/assets/generated/stations/aquarium_gallery_clownfish.jpg',
    thumbImg: '/assets/generated/creatures/thumb_clownfish_tile.jpg',
    detailUrl: '/3dmodel/clownfish',
  },
  starfish: {
    name: 'Sao biển',
    desc: 'Hình sao độc đáo, di chuyển nhẹ nhàng trên đáy cát và rạn đá.',
    galleryImg: '/assets/generated/stations/aquarium_gallery_starfish.jpg',
    thumbImg: '/assets/generated/creatures/thumb_starfish_tile.jpg',
    detailUrl: '/3dmodel/starfish',
  },
  shell: {
    name: 'Vỏ sò',
    desc: 'Lớp vỏ vôi cứng cáp bảo vệ sinh vật trước sóng biển mạnh mẽ.',
    galleryImg: '/assets/generated/stations/aquarium_gallery_shell.jpg',
    thumbImg: '/assets/generated/creatures/thumb_shell_tile.jpg',
    detailUrl: '/3dmodel/shell',
  },
} as const;

type CreatureKey = keyof typeof CREATURES_CONFIG;

export function LivingOceanLandingPage() {
  const { navigate } = useRouter();

  // Beat 2/3: Active creature thumbnail in aquarium tank
  const [activeCreature, setActiveCreature] = useState<CreatureKey>('jellyfish');

  // Beat 4: Selected action choice
  const [selectedAction, setSelectedAction] = useState<number | null>(0);

  // Beat 5: Creative Studio Tactile Selection
  const [activeMaterial, setActiveMaterial] = useState<string>('da');
  const [activeSpecimen, setActiveSpecimen] = useState<string>('bluefish');

  return (
    <PublicShell variant="landing">
      <div className="relative min-h-screen w-full bg-[#FAF9F6] text-[#12384B] font-sans overflow-x-hidden selection:bg-teal-100 select-none">
        {/* ========================================================
            BEAT 0: HERO - MỘT LẦN CHẠM, CẢ ĐẠI DƯƠNG MỞ RA
        ======================================================== */}
        <section className="relative w-full h-[620px] sm:h-[720px] flex items-center overflow-hidden scroll-mt-16" id="beat1">
          {/* Split Ocean Photo Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/generated/backgrounds/ocean_split_hero_lighthouse.jpg"
              alt="Mặt nước biển và rùa biển bơi lội với ngọn hải đăng"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12">
            <div className="max-w-2xl space-y-6">
              <h1 className="font-editorial font-normal sm:font-medium text-3xl sm:text-5xl md:text-6xl text-white tracking-[-0.015em] leading-[1.2] drop-shadow-md">
                Một lần chạm.<br />
                Cả đại dương mở ra.
              </h1>
              <p className="text-base sm:text-xl text-white/90 font-light leading-relaxed drop-shadow max-w-xl">
                Khám phá thế giới đại dương qua học liệu, trò chơi<br className="hidden sm:inline" /> và hoạt động sáng tạo dành cho bé.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/entry')}
                  className="px-7 py-3 rounded-full bg-[#F67650] hover:bg-[#ff6236] text-white font-bold text-sm shadow-xl flex items-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <span>Bắt đầu khám phá</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 1: MỘT ĐẠI DƯƠNG. NHIỀU THẾ GIỚI. (ATLAS HORIZONTAL)
        ======================================================== */}
        {/* ========================================================
            BEAT 1: MỘT ĐẠI DƯƠNG. NHIỀU THẾ GIỚI. (ATLAS HORIZONTAL)
        ======================================================== */}
        <section className="relative w-full bg-[#F7F4EB] text-[#102A38] overflow-hidden scroll-mt-16" id="beat2">
          {/* Environmental Background Ocean Transect Panorama */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="/assets/generated/backgrounds/ocean_transect_5zones_panorama.jpg"
              alt="Mặt cắt ngang đại dương từ bờ biển đến đáy sâu"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Foreground Content Layer */}
          <div className="relative z-10 w-full pt-12 sm:pt-14 pb-0">
            {/* Section Header: Title, Subtitle, CTA Button */}
            <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="font-editorial font-normal sm:font-medium text-3xl sm:text-4xl md:text-5xl text-[#102A38] tracking-[-0.015em] mb-2.5">
                  Một đại dương. Nhiều thế giới.
                </h2>
                <p className="text-sm sm:text-base text-[#12384B]/80 font-normal">
                  Cùng khám phá các vùng sinh cảnh và những điều kỳ thú dưới mặt biển.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/interactive')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#17657A]/40 bg-white/80 hover:bg-white text-[#17657A] font-medium text-xs sm:text-sm hover:border-[#17657A] hover:shadow-xs transition-all cursor-pointer"
              >
                <span>Khám phá tương tác</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 5 Interactive Zone Labels & Pointer Lines positioned to land on the waterline */}
            <div className="relative w-full h-24 sm:h-28 pointer-events-none">
              {/* Pin 1: Bờ biển và vùng triều (15.5%) */}
              <button
                type="button"
                onClick={() => navigate('/interactive/habitat-placement')}
                className="pointer-events-auto absolute left-[15.5%] top-0 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus-visible:outline-none"
              >
                <span className="text-xs sm:text-sm font-semibold text-[#102A38] text-center leading-tight mb-2 group-hover:text-[#17657A] transition-colors whitespace-nowrap">
                  Bờ biển<br className="sm:hidden" /> và vùng triều
                </span>
                <div className="w-[1px] h-14 sm:h-18 bg-[#102A38]/50 group-hover:bg-[#17657A] transition-colors" />
                <div className="w-3 h-3 rounded-full bg-white shadow-xs border-2 border-[#102A38] -mt-0.5 group-hover:scale-125 group-hover:border-[#17657A] transition-all" />
              </button>

              {/* Pin 2: Rạn san hô (33.5%) */}
              <button
                type="button"
                onClick={() => navigate('/interactive/habitat-placement')}
                className="pointer-events-auto absolute left-[33.5%] top-3 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus-visible:outline-none"
              >
                <span className="text-xs sm:text-sm font-semibold text-[#102A38] text-center leading-tight mb-2 group-hover:text-[#17657A] transition-colors whitespace-nowrap">
                  Rạn san hô
                </span>
                <div className="w-[1px] h-16 sm:h-20 bg-[#102A38]/50 group-hover:bg-[#17657A] transition-colors" />
                <div className="w-3 h-3 rounded-full bg-white shadow-xs border-2 border-[#102A38] -mt-0.5 group-hover:scale-125 group-hover:border-[#17657A] transition-all" />
              </button>

              {/* Pin 3: Vùng nước mở (53.9%) */}
              <button
                type="button"
                onClick={() => navigate('/interactive/habitat-placement')}
                className="pointer-events-auto absolute left-[53.9%] top-3 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus-visible:outline-none"
              >
                <span className="text-xs sm:text-sm font-semibold text-[#102A38] text-center leading-tight mb-2 group-hover:text-[#17657A] transition-colors whitespace-nowrap">
                  Vùng nước mở
                </span>
                <div className="w-[1px] h-16 sm:h-20 bg-[#102A38]/50 group-hover:bg-[#17657A] transition-colors" />
                <div className="w-3 h-3 rounded-full bg-white shadow-xs border-2 border-[#102A38] -mt-0.5 group-hover:scale-125 group-hover:border-[#17657A] transition-all" />
              </button>

              {/* Pin 4: Vùng biển sâu (72.6%) */}
              <button
                type="button"
                onClick={() => navigate('/interactive/habitat-placement')}
                className="pointer-events-auto absolute left-[72.6%] top-3 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus-visible:outline-none"
              >
                <span className="text-xs sm:text-sm font-semibold text-[#102A38] text-center leading-tight mb-2 group-hover:text-[#17657A] transition-colors whitespace-nowrap">
                  Vùng biển sâu
                </span>
                <div className="w-[1px] h-16 sm:h-20 bg-[#102A38]/50 group-hover:bg-[#17657A] transition-colors" />
                <div className="w-3 h-3 rounded-full bg-white shadow-xs border-2 border-[#102A38] -mt-0.5 group-hover:scale-125 group-hover:border-[#17657A] transition-all" />
              </button>

              {/* Pin 5: Đáy đại dương (92.2%) */}
              <button
                type="button"
                onClick={() => navigate('/interactive/habitat-placement')}
                className="pointer-events-auto absolute left-[92.2%] top-3 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus-visible:outline-none"
              >
                <span className="text-xs sm:text-sm font-semibold text-[#102A38] text-center leading-tight mb-2 group-hover:text-[#17657A] transition-colors whitespace-nowrap">
                  Đáy đại dương
                </span>
                <div className="w-[1px] h-16 sm:h-20 bg-[#102A38]/50 group-hover:bg-[#17657A] transition-colors" />
                <div className="w-3 h-3 rounded-full bg-white shadow-xs border-2 border-[#102A38] -mt-0.5 group-hover:scale-125 group-hover:border-[#17657A] transition-all" />
              </button>
            </div>

            {/* Underwater Stage spacer to expose the underwater panorama */}
            <div className="w-full h-[280px] sm:h-[380px] md:h-[460px] lg:h-[500px]" />
          </div>
        </section>

        {/* ========================================================
            BEAT 2 & 3: QUAN SÁT THẬT GẦN (AQUARIUM EXHIBITION GALLERY)
        ======================================================== */}
        <section
          className="relative w-full min-h-[580px] sm:min-h-[640px] flex items-center bg-[#06131C] text-white overflow-hidden scroll-mt-16 py-16 sm:py-24"
          id="beat3"
        >
          {/* Atmospheric Museum Aquarium Background with Seamless Blend */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            <img
              key={activeCreature}
              src={CREATURES_CONFIG[activeCreature].galleryImg}
              alt={CREATURES_CONFIG[activeCreature].name}
              className="w-full h-full object-cover object-[62%_center] sm:object-[58%_center] lg:object-[54%_center] transition-all duration-700 animate-fadeIn"
            />
            {/* Seamless Left-to-Right gradient: starts 100% solid dark navy (#06131C) on the left behind the text, then blends softly into the exhibition hall right after the text */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#06131C] via-[#06131C] via-[32%] sm:via-[36%] lg:via-[40%] to-transparent" />
            {/* Top and Bottom soft fades */}
            <div className="absolute inset-x-0 top-0 h-20 sm:h-28 bg-gradient-to-b from-[#06131C] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 bg-gradient-to-t from-[#06131C] to-transparent" />
          </div>

          {/* Foreground Grid Layout */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            {/* Left Column (5 cols): Heading (no line break), Subtitle (break before 'mô hình 3D'), CTA button */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-editorial font-medium text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-5xl text-white tracking-[-0.015em] leading-tight whitespace-nowrap">
                Quan sát thật gần
              </h2>
              <p className="text-base sm:text-lg text-white/80 font-light leading-relaxed">
                Khám phá các sinh vật biển qua<br />
                mô hình 3D, hình ảnh và thuyết minh sinh động.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(CREATURES_CONFIG[activeCreature].detailUrl)}
                  className="px-7 py-3 rounded-full bg-white hover:bg-white/95 text-[#071723] font-semibold text-sm sm:text-base shadow-xl inline-flex items-center gap-2.5 cursor-pointer transition-all active:scale-95 hover:scale-[1.02]"
                >
                  <span>Khám phá sinh vật</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center Empty Space (3 cols) on desktop: Exposes the illuminated cylindrical tank and secondary background tanks */}
            <div className="hidden lg:block lg:col-span-3 min-h-[440px]" aria-hidden="true" />

            {/* Right Column (4 cols): Floating Info Card & 4 Creature Selector Thumbnails */}
            <div className="lg:col-span-4 flex flex-col justify-between items-start lg:items-end min-h-[360px] sm:min-h-[440px] space-y-8 lg:space-y-0">
              {/* Creature Info Card */}
              <div className="w-full max-w-sm p-6 rounded-2xl bg-[#091A27]/85 backdrop-blur-md border border-white/10 shadow-2xl space-y-3">
                <h3 className="font-editorial font-medium text-2xl text-white tracking-tight">
                  {CREATURES_CONFIG[activeCreature].name}
                </h3>
                <p className="text-sm text-white/75 font-light leading-relaxed min-h-[44px]">
                  {CREATURES_CONFIG[activeCreature].desc}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(CREATURES_CONFIG[activeCreature].detailUrl)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2EE6CA] hover:text-[#5ef3dc] hover:underline cursor-pointer pt-2 transition-colors"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Bottom Thumbnails */}
              <div className="flex items-center gap-3 pt-2">
                {(Object.keys(CREATURES_CONFIG) as CreatureKey[]).map((key) => {
                  const item = CREATURES_CONFIG[key];
                  const isSelected = activeCreature === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setActiveCreature(key)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 p-0.5 bg-[#041624] ${
                        isSelected
                          ? 'border-2 border-[#2EE6CA] shadow-[0_0_20px_rgba(46,230,202,0.45)] ring-2 ring-[#2EE6CA]/30 scale-105'
                          : 'border border-white/15 opacity-70 hover:opacity-100 hover:border-white/40'
                      }`}
                      aria-label={`Xem ${item.name}`}
                    >
                      <img
                        src={item.thumbImg}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 4: MỘT LỰA CHỌN NHỎ (SIMULATION CHOICE)
        ======================================================== */}
        <section className="relative w-full h-[540px] flex items-center overflow-hidden scroll-mt-16" id="beat4">
          {/* Sandy Beach Bottle Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/generated/backgrounds/glass_bottle_beach_cleanup.jpg"
              alt="Chai thủy tinh dạt vào bãi cát bờ biển"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-white/5" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Text */}
            <div className="max-w-lg space-y-4">
              <h2 className="font-editorial font-normal sm:font-medium text-3xl sm:text-4xl md:text-5xl text-[#102A38] tracking-[-0.015em]">
                Một lựa chọn nhỏ
              </h2>
              <p className="text-base sm:text-lg text-[#12384B]/80 font-light leading-relaxed">
                Những hành động hôm nay có thể tạo nên<br className="hidden sm:inline" /> thay đổi lớn cho đại dương ngày mai.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/interactive/my-action')}
                  className="px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-[#12384B] font-bold text-xs shadow-md border border-slate-200 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>Chọn hành động</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Choice Card: Bạn sẽ làm gì? */}
            <div className="rounded-[28px] bg-white/95 backdrop-blur-md shadow-2xl border border-white/80 p-6 sm:p-8 max-w-md w-full">
              <h3 className="font-editorial font-medium text-2xl text-[#102A38] tracking-[-0.015em] mb-6">
                Bạn sẽ làm gì?
              </h3>

              <div className="grid grid-cols-3 gap-3.5">
                <button
                  type="button"
                  onClick={() => setSelectedAction(0)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all cursor-pointer ${
                    selectedAction === 0
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <Recycle className="w-8 h-8 text-emerald-600" />
                  <span className="text-xs font-bold text-[#12384B] leading-tight">
                    Nhặt rác<br />trên bãi biển
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAction(1)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all cursor-pointer ${
                    selectedAction === 1
                      ? 'bg-slate-100 border-slate-500 shadow-md ring-2 ring-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <Trash2 className="w-8 h-8 text-slate-500" />
                  <span className="text-xs font-bold text-[#12384B] leading-tight">
                    Bỏ qua<br />và đi tiếp
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAction(2)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all cursor-pointer ${
                    selectedAction === 2
                      ? 'bg-teal-50/80 border-[#17657A] shadow-md ring-2 ring-teal-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <svg className="w-8 h-8 text-[#17657A]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22c4.5 0 6.5-4 11-4 4.5 0 6.5 4 11 4 1.5 0 2-.5 3-1" />
                    <path d="M4 17c3-1 6-7 11-7 4 0 7 3 8 7" />
                    <path d="M15 10c1.5-3 4-5 7-4-1 2-2 4-4 5" />
                  </svg>
                  <span className="text-xs font-bold text-[#12384B] leading-tight">
                    Mang về<br />tái chế
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 5: ĐẠI DƯƠNG CỦA BÉ (CREATIVE STUDIO DIORAMA)
        ======================================================== */}
        <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden scroll-mt-16" id="beat5">
          {/* Handcrafted Diorama Wooden Tray Background matching Mockup */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/generated/craft/ocean_diorama_wood_tray_mockup.jpg"
              alt="Mô hình khay gỗ rạn san hô đất nặn của bé trên bàn gỗ ấm áp"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/20 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8 py-10">
            {/* Left Text */}
            <div className="max-w-md space-y-4 shrink-0">
              <h2 className="font-editorial font-medium text-4xl sm:text-5xl text-[#102A38] tracking-[-0.02em] whitespace-nowrap">
                Đại dương của bé
              </h2>
              <p className="text-base sm:text-lg text-[#12384B]/80 font-normal leading-relaxed">
                Thỏa sức sáng tạo, xây dựng môi trường sống<br className="hidden sm:inline" /> lý tưởng cho các sinh vật biển.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/creative')}
                  className="px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-[#12384B] font-bold text-xs shadow-md border border-slate-200 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>Bắt đầu sáng tạo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Both Flanking Tactile Craft Tool Palettes: Left Card and Right Card flanking diorama */}
            <div className="flex-1 w-full flex items-center justify-between lg:pl-6 xl:pl-10 select-none">
              {/* Left Material Palette (Flanking the left side of the diorama tray) */}
              <div className="flex flex-col gap-2 p-3.5 rounded-[24px] bg-white/95 backdrop-blur-md shadow-2xl border border-white/80 min-w-[145px]">
                <button
                  type="button"
                  onClick={() => setActiveMaterial('da')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMaterial === 'da'
                      ? 'bg-amber-100/90 text-[#102A38] shadow-xs ring-1 ring-amber-300'
                      : 'bg-amber-50/70 hover:bg-amber-50 text-[#102A38]'
                  }`}
                >
                  <img
                    src="/assets/generated/craft/icons/craft_icon_stone.jpg"
                    alt="Đá"
                    className="w-5 h-5 object-contain mix-blend-multiply"
                  />
                  <span>Đá</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMaterial('sanho')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMaterial === 'sanho'
                      ? 'bg-rose-100/90 text-[#102A38] shadow-xs ring-1 ring-rose-300'
                      : 'bg-rose-50/70 hover:bg-rose-50 text-[#102A38]'
                  }`}
                >
                  <img
                    src="/assets/generated/craft/icons/craft_icon_coral.jpg"
                    alt="San hô"
                    className="w-5 h-5 object-contain mix-blend-multiply"
                  />
                  <span>San hô</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMaterial('caybien')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMaterial === 'caybien'
                      ? 'bg-emerald-100/90 text-[#102A38] shadow-xs ring-1 ring-emerald-300'
                      : 'bg-emerald-50/70 hover:bg-emerald-50 text-[#102A38]'
                  }`}
                >
                  <img
                    src="/assets/generated/craft/icons/craft_icon_seaweed.jpg"
                    alt="Cây biển"
                    className="w-5 h-5 object-contain mix-blend-multiply"
                  />
                  <span>Cây biển</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMaterial('hang')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMaterial === 'hang'
                      ? 'bg-slate-200/90 text-[#102A38] shadow-xs ring-1 ring-slate-400'
                      : 'bg-slate-100/70 hover:bg-slate-100 text-[#102A38]'
                  }`}
                >
                  <img
                    src="/assets/generated/craft/icons/craft_icon_cave.jpg"
                    alt="Hang trú ẩn"
                    className="w-5 h-5 object-contain mix-blend-multiply"
                  />
                  <span>Hang trú ẩn</span>
                </button>
              </div>

              {/* Center Spacer: Let the diorama tray in the background breathe naturally */}
              <div className="hidden lg:block flex-1 min-w-[220px] xl:min-w-[300px]" />

              {/* Right Specimen Palette "Chọn sinh vật" (Standing upright at right side of diorama tray) */}
              <div className="flex flex-col gap-2.5 p-3.5 rounded-[24px] bg-[#FAF3E8]/95 backdrop-blur-md shadow-2xl border border-amber-200/70 min-w-[155px]">
                <span className="text-xs font-bold text-[#102A38] text-center border-b border-amber-200/60 pb-1.5">
                  Chọn sinh vật
                </span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveSpecimen('bluefish')}
                    className={`p-1.5 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      activeSpecimen === 'bluefish'
                        ? 'bg-white shadow-sm ring-2 ring-sky-400'
                        : 'bg-sky-50/70 hover:bg-white border border-sky-100/50'
                    }`}
                    title="Cá xanh"
                  >
                    <img
                      src="/assets/generated/craft/icons/craft_creature_bluefish.jpg"
                      alt="Cá xanh"
                      className="w-8 h-8 object-contain mix-blend-multiply"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSpecimen('bluecoral')}
                    className={`p-1.5 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      activeSpecimen === 'bluecoral'
                        ? 'bg-white shadow-sm ring-2 ring-blue-400'
                        : 'bg-blue-50/70 hover:bg-white border border-blue-100/50'
                    }`}
                    title="San hô xanh"
                  >
                    <img
                      src="/assets/generated/craft/icons/craft_creature_bluecoral.jpg"
                      alt="San hô xanh"
                      className="w-8 h-8 object-contain mix-blend-multiply"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSpecimen('shell')}
                    className={`p-1.5 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      activeSpecimen === 'shell'
                        ? 'bg-white shadow-sm ring-2 ring-amber-400'
                        : 'bg-amber-50/70 hover:bg-white border border-amber-100/50'
                    }`}
                    title="Vỏ sò"
                  >
                    <img
                      src="/assets/generated/craft/icons/craft_creature_shell.jpg"
                      alt="Vỏ sò"
                      className="w-8 h-8 object-contain mix-blend-multiply"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSpecimen('plant')}
                    className={`p-1.5 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      activeSpecimen === 'plant'
                        ? 'bg-white shadow-sm ring-2 ring-emerald-400'
                        : 'bg-emerald-50/70 hover:bg-white border border-emerald-100/50'
                    }`}
                    title="Cây biển"
                  >
                    <img
                      src="/assets/generated/craft/icons/craft_creature_plant.jpg"
                      alt="Cây biển"
                      className="w-8 h-8 object-contain mix-blend-multiply"
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSpecimen('starfish')}
                  className={`p-1.5 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 mx-auto w-12 ${
                    activeSpecimen === 'starfish'
                      ? 'bg-white shadow-sm ring-2 ring-orange-400'
                      : 'bg-orange-50/70 hover:bg-white border border-orange-100/50'
                  }`}
                  title="Sao biển"
                >
                  <img
                    src="/assets/generated/craft/icons/craft_creature_starfish.jpg"
                    alt="Sao biển"
                    className="w-8 h-8 object-contain mix-blend-multiply"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 6: CÙNG CÔ KHÁM PHÁ (TEACHER & RESOURCE HUB)
        ======================================================== */}
        <section className="relative w-full py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto scroll-mt-16" id="beat6">
          <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 xl:gap-10 justify-between">
            {/* Left Column: Heading + Description + Action */}
            <div className="lg:w-[300px] xl:w-[340px] shrink-0 flex flex-col justify-between self-stretch">
              <div>
                <h2 className="font-editorial font-bold text-3xl sm:text-4xl text-[#102A38] tracking-[-0.02em] mb-3 leading-[1.2] whitespace-nowrap">
                  Cùng cô khám phá
                </h2>
                <p className="text-sm sm:text-base text-[#12384B]/80 font-medium leading-relaxed mb-6 max-w-[280px]">
                  Các bài giảng được thiết kế sinh động, dễ áp dụng trong lớp học và tại nhà.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => navigate('/resources')}
                  className="px-5 py-2 sm:py-2.5 rounded-full border border-[#102A38]/30 hover:border-[#17657A] text-[#102A38] hover:text-[#17657A] font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-2 cursor-pointer transition-all w-fit"
                >
                  <span>Xem bài giảng</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: "Dành cho giáo viên" Link + 4 Cards */}
            <div className="flex-1 w-full flex flex-col min-w-0">
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => navigate('/teacher')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#17657A] hover:underline cursor-pointer"
                >
                  <span>Dành cho giáo viên</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {/* Card 1 - Sinh cảnh rạn san hô */}
                <div
                  onClick={() => navigate('/resources')}
                  className="rounded-2xl bg-white shadow-sm hover:shadow-md border border-slate-200/70 flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src="/assets/generated/stations/station_coral_reef.jpg"
                      alt="Sinh cảnh rạn san hô"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
                    <h4 className="font-bold text-xs xl:text-[13px] text-[#102A38] tracking-tight mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
                      Sinh cảnh rạn san hô
                    </h4>
                    <div className="flex items-center justify-between mt-auto gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-[#EAF2F8] text-[#17657A] text-[11px] sm:text-xs font-semibold whitespace-nowrap">
                        Bài giảng
                      </span>
                      <FileText className="w-6 h-6 text-[#17657A] shrink-0" strokeWidth={1.8} />
                    </div>
                  </div>
                </div>

                {/* Card 2 - Bảo vệ động vật biển */}
                <div
                  onClick={() => navigate('/resources')}
                  className="rounded-2xl bg-white shadow-sm hover:shadow-md border border-slate-200/70 flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src="/assets/generated/creatures/green_turtle_hero.jpg"
                      alt="Bảo vệ động vật biển"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
                    <h4 className="font-bold text-xs xl:text-[13px] text-[#102A38] tracking-tight mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
                      Bảo vệ động vật biển
                    </h4>
                    <div className="flex items-center justify-between mt-auto gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-[#EAF2F8] text-[#17657A] text-[11px] sm:text-xs font-semibold whitespace-nowrap">
                        Giáo án
                      </span>
                      <FileText className="w-6 h-6 text-[#17657A] shrink-0" strokeWidth={1.8} />
                    </div>
                  </div>
                </div>

                {/* Card 3 - Mangrove Ecosystem */}
                <div
                  onClick={() => navigate('/resources')}
                  className="rounded-2xl bg-white shadow-sm hover:shadow-md border border-slate-200/70 flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src="/assets/generated/stations/mangrove_coastal_ecosystem.jpg"
                      alt="Hệ sinh thái ven biển rừng ngập mặn"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
                    <h4 className="font-bold text-xs xl:text-[13px] text-[#102A38] tracking-tight mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
                      Hệ sinh thái ven biển
                    </h4>
                    <div className="flex items-center justify-between mt-auto gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-[#E6F4F1] text-[#17657A] text-[11px] sm:text-xs font-semibold whitespace-nowrap">
                        Học liệu
                      </span>
                      <ImageIcon className="w-6 h-6 text-[#17657A] shrink-0" strokeWidth={1.8} />
                    </div>
                  </div>
                </div>

                {/* Card 4 - Deep Ocean Simulation */}
                <div
                  onClick={() => navigate('/interactive')}
                  className="rounded-2xl bg-white shadow-sm hover:shadow-md border border-slate-200/70 flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src="/assets/generated/backgrounds/whale_hero_gamelab.jpg"
                      alt="Khám phá đại dương sâu"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
                    <h4 className="font-bold text-xs xl:text-[13px] text-[#102A38] tracking-tight mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
                      Khám phá đại dương sâu
                    </h4>
                    <div className="flex items-center justify-between mt-auto gap-2">
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#EBF2FA] text-[#1D5C8A] text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">
                        Game & Simulation
                      </span>
                      <Gamepad2 className="w-6 h-6 text-[#17657A] shrink-0" strokeWidth={1.8} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 7: BẮT ĐẦU CÙNG BÉ (SUNSET COASTAL CTA)
        ======================================================== */}
        <section className="relative w-full h-[520px] flex items-center justify-end overflow-hidden" id="beat7">
          {/* Sunset Rocky Coast Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/generated/backgrounds/sunset_rocky_coast.jpg"
              alt="Hoàng hôn trên ghềnh đá ngọn hải đăng"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-amber-50/70 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 flex justify-end">
            <div className="max-w-md space-y-6 text-left">
              <h2 className="font-editorial font-normal sm:font-medium text-3xl sm:text-4xl md:text-5xl text-[#102A38] tracking-[-0.015em]">
                Bắt đầu cùng bé
              </h2>
              <p className="text-base sm:text-lg text-[#12384B]/80 font-light leading-relaxed">
                Mở ra những trải nghiệm ý nghĩa cho<br className="hidden sm:inline" /> hôm nay và mai sau.
              </p>
              <div className="flex justify-start pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/entry')}
                  className="px-7 py-3 rounded-full bg-[#F67650] hover:bg-[#ff6236] text-white font-bold text-sm shadow-xl flex items-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <span>Bắt đầu khám phá</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            PUBLIC FOOTER
        ======================================================== */}
        <footer className="w-full bg-[#FAF9F6] border-t border-slate-200/60 py-8 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#0B3558]">
          <BlueSteamLogo size="sm" />

          <div className="flex items-center gap-6">
            <button type="button" className="hover:text-[#0284C7] transition-colors cursor-pointer">
              Về BlueSTEAM
            </button>
            <button type="button" className="hover:text-[#0284C7] transition-colors cursor-pointer">
              Hỗ trợ
            </button>
            <button type="button" className="hover:text-[#0284C7] transition-colors cursor-pointer">
              Liên hệ
            </button>
          </div>

          <div className="text-[#0B3558]/80 font-medium">
            Vì một đại dương xanh hơn
          </div>
        </footer>
      </div>
    </PublicShell>
  );
}
