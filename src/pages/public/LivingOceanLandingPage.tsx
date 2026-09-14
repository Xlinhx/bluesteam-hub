import { useState } from 'react';
import { useRouter } from '../../app/router';
import { PublicShell } from '../../shells/PublicShell';
import { CoralButton } from '../../shared/components/CoralButton';
import { BlueSteamLogo } from '../../shared/components/BlueSteamLogo';
import { GreenSeaTurtleScene } from '../../experiences/turtle/GreenSeaTurtleScene';
import {
  ArrowRight,
  Recycle,
  Trash2,
  Waves,
  BookOpen,
  FileText,
  Folder,
  Gamepad2,
} from 'lucide-react';

export function LivingOceanLandingPage() {
  const { navigate, query } = useRouter();

  // Beat 2: Active creature thumbnail
  const [activeCreature, setActiveCreature] = useState<'jellyfish' | 'clownfish' | 'starfish' | 'shell'>('jellyfish');

  // Beat 2/3: 3D interactive view toggle (supports ?mode=3d or ?creature=turtle)
  const [is3DMode, setIs3DMode] = useState<boolean>(() => query.mode === '3d' || query.creature === 'turtle');

  // Beat 4: Selected action choice
  const [selectedAction, setSelectedAction] = useState<number | null>(0);

  return (
    <PublicShell>
      <div className="relative min-h-screen w-full bg-[#FAF9F6] text-[#12384B] font-sans overflow-x-hidden selection:bg-teal-100 select-none">
        {/* ========================================================
            BEAT 0: HERO - MỘT LẦN CHẠM, CẢ ĐẠI DƯƠNG MỞ RA
        ======================================================== */}
        <section className="relative w-full h-[620px] sm:h-[720px] flex items-center overflow-hidden" id="beat1">
          {/* Split Ocean Photo Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/generated/backgrounds/ocean_split_beach.jpg"
              alt="Mặt nước và rùa biển xanh bơi lội"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/25 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12">
            <div className="max-w-xl space-y-6">
              <h1 className="font-editorial font-black text-5xl sm:text-6xl text-white tracking-[-0.02em] leading-[1.1] drop-shadow-lg">
                Một lần chạm.<br />
                Cả đại dương mở ra.
              </h1>
              <p className="text-lg sm:text-xl text-white/95 font-medium leading-relaxed drop-shadow">
                Khám phá thế giới đại dương qua học liệu, trò chơi và hoạt động sáng tạo dành cho bé.
              </p>
              <div className="pt-2">
                <CoralButton
                  size="lg"
                  isKidFriendly={false}
                  onClick={() => navigate('/entry')}
                  className="shadow-2xl"
                >
                  <span>Bắt đầu khám phá</span>
                  <ArrowRight className="w-5 h-5 ml-2 inline-block" />
                </CoralButton>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 1: MỘT ĐẠI DƯƠNG. NHIỀU THẾ GIỚI. (ATLAS HORIZONTAL)
        ======================================================== */}
        <section className="relative w-full py-20 px-6 sm:px-12 max-w-7xl mx-auto" id="beat2">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-editorial font-black text-4xl sm:text-5xl text-[#102A38] tracking-[-0.02em] mb-2">
                Một đại dương. Nhiều thế giới.
              </h2>
              <p className="text-base sm:text-lg text-[#12384B]/80 font-medium">
                Cùng khám phá các vùng sinh cảnh và những điều kỳ thú dưới mặt biển.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/learn/atlas')}
              className="px-6 py-2.5 rounded-full border border-slate-300 hover:border-[#17657A] text-[#12384B] font-extrabold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Khám phá bản đồ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Panoramic Horizontal Cross-Section with 5 Interactive Pointers */}
          <div className="relative w-full h-[380px] sm:h-[460px] rounded-[32px] overflow-hidden shadow-2xl border border-slate-200">
            <img
              src="/assets/generated/backgrounds/ocean_horizontal_atlas_panorama.jpg"
              alt="Mặt cắt ngang đại dương từ bờ biển đến đáy sâu"
              className="w-full h-full object-cover object-center"
            />

            {/* Pin 1: Bờ biển và vùng triều */}
            <div
              onClick={() => navigate('/learn/atlas')}
              className="absolute left-[12%] top-[38%] -translate-x-1/2 flex flex-col items-center group cursor-pointer"
            >
              <span className="text-xs font-black text-[#102A38] bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md mb-2">
                Bờ biển và vùng triều
              </span>
              <div className="w-[1.5px] h-12 bg-white/90 shadow-md" />
              <div className="w-4 h-4 rounded-full bg-white shadow-lg border-2 border-[#17657A] -mt-1 group-hover:scale-125 transition-transform" />
            </div>

            {/* Pin 2: Rạn san hô */}
            <div
              onClick={() => navigate('/learn/atlas')}
              className="absolute left-[30%] top-[48%] -translate-x-1/2 flex flex-col items-center group cursor-pointer"
            >
              <span className="text-xs font-black text-[#102A38] bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md mb-2">
                Rạn san hô
              </span>
              <div className="w-[1.5px] h-12 bg-white/90 shadow-md" />
              <div className="w-4 h-4 rounded-full bg-white shadow-lg border-2 border-[#17657A] -mt-1 group-hover:scale-125 transition-transform" />
            </div>

            {/* Pin 3: Vùng nước mở */}
            <div
              onClick={() => navigate('/learn/atlas')}
              className="absolute left-[52%] top-[45%] -translate-x-1/2 flex flex-col items-center group cursor-pointer"
            >
              <span className="text-xs font-black text-[#102A38] bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md mb-2">
                Vùng nước mở
              </span>
              <div className="w-[1.5px] h-12 bg-white/90 shadow-md" />
              <div className="w-4 h-4 rounded-full bg-white shadow-lg border-2 border-[#17657A] -mt-1 group-hover:scale-125 transition-transform" />
            </div>

            {/* Pin 4: Vùng biển sâu */}
            <div
              onClick={() => navigate('/learn/atlas')}
              className="absolute left-[72%] top-[56%] -translate-x-1/2 flex flex-col items-center group cursor-pointer"
            >
              <span className="text-xs font-black text-[#102A38] bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md mb-2">
                Vùng biển sâu
              </span>
              <div className="w-[1.5px] h-12 bg-white/90 shadow-md" />
              <div className="w-4 h-4 rounded-full bg-white shadow-lg border-2 border-[#17657A] -mt-1 group-hover:scale-125 transition-transform" />
            </div>

            {/* Pin 5: Đáy đại dương */}
            <div
              onClick={() => navigate('/learn/atlas')}
              className="absolute left-[90%] top-[60%] -translate-x-1/2 flex flex-col items-center group cursor-pointer"
            >
              <span className="text-xs font-black text-[#102A38] bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md mb-2">
                Đáy đại dương
              </span>
              <div className="w-[1.5px] h-12 bg-white/90 shadow-md" />
              <div className="w-4 h-4 rounded-full bg-white shadow-lg border-2 border-[#17657A] -mt-1 group-hover:scale-125 transition-transform" />
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 2 & 3: QUAN SÁT THẬT GẦN (3D & AQUARIUM DISPLAY)
        ======================================================== */}
        <section className="relative w-full py-24 bg-[#0A1A24] text-white overflow-hidden" id="beat3">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Text */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="font-editorial font-black text-4xl sm:text-5xl text-white tracking-[-0.02em] leading-tight">
                Quan sát thật gần
              </h2>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                Khám phá các sinh vật biển qua mô hình 3D, hình ảnh và thuyết minh sinh động.
              </p>

              {/* Mode Switcher: 2D Cylinder Tank vs 3D Interactive Sea Turtle */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-xs">
                <button
                  type="button"
                  onClick={() => setIs3DMode(false)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    !is3DMode
                      ? 'bg-white text-[#102A38] shadow-md'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Trụ quan sát sứa
                </button>
                <button
                  type="button"
                  onClick={() => setIs3DMode(true)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    is3DMode
                      ? 'bg-[#17657A] text-white shadow-md'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Rùa biển 3D
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => navigate('/learn/turtle')}
                  className="px-8 py-3.5 rounded-full bg-white hover:bg-slate-100 text-[#102A38] font-black text-sm shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>Khám phá sinh vật</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center Display: Cylindrical Jellyfish Tank OR Three.js 3D Turtle Canvas */}
            <div className="lg:col-span-5 flex justify-center">
              {is3DMode ? (
                <div className="relative w-full h-[460px] rounded-[32px] overflow-hidden shadow-2xl border border-white/20 bg-[#041624]">
                  <GreenSeaTurtleScene showLegacyControls={true} className="w-full h-full" />
                </div>
              ) : (
                <div className="relative w-full max-w-sm h-[440px] rounded-[32px] overflow-hidden shadow-2xl border border-white/20">
                  <img
                    src="/assets/generated/stations/jellyfish_display_cylinder.jpg"
                    alt="Trụ quan sát sứa biển phát sáng"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}
            </div>

            {/* Right Inspection Card & Creature Thumbnails */}
            <div className="lg:col-span-3 flex flex-col justify-between h-[440px] py-4">
              {/* Creature Info Card */}
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
                <h3 className="font-editorial font-black text-2xl text-white tracking-[-0.02em]">
                  {is3DMode
                    ? 'Rùa Biển Xanh'
                    : activeCreature === 'jellyfish'
                    ? 'Sứa biển'
                    : activeCreature === 'clownfish'
                    ? 'Cá hề'
                    : activeCreature === 'starfish'
                    ? 'Sao biển'
                    : 'Vỏ sò'}
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  {is3DMode
                    ? 'Đôi vây bơi to khỏe như mái chèo giúp rùa lướt sóng hàng ngàn cây số.'
                    : activeCreature === 'jellyfish'
                    ? 'Cơ thể trong suốt, di chuyển nhẹ nhàng theo dòng nước.'
                    : activeCreature === 'clownfish'
                    ? 'Sống cộng sinh an toàn giữa các xúc tu hải quỳ rực rỡ.'
                    : activeCreature === 'starfish'
                    ? 'Di chuyển bằng hàng trăm chân ống nhỏ xíu dưới đáy rạn.'
                    : 'Lớp vỏ vôi cứng cáp bảo vệ sinh vật trước sóng biển mạnh mẽ.'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/learn/turtle')}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#2EE6CA] hover:underline cursor-pointer pt-1"
                >
                  <span>{is3DMode ? 'Mở Màn Hình Quan Sát Toàn Cảnh' : 'Xem chi tiết'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Bottom Thumbnails */}
              <div className="grid grid-cols-4 gap-2 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCreature('jellyfish');
                    setIs3DMode(false);
                  }}
                  className={`w-14 h-14 rounded-2xl bg-white/10 border-2 cursor-pointer flex items-center justify-center transition-all ${
                    !is3DMode && activeCreature === 'jellyfish'
                      ? 'border-[#2EE6CA] shadow-lg shadow-[#2EE6CA]/30'
                      : 'border-white/20'
                  }`}
                  aria-label="Xem Sứa Biển"
                >
                  <span className="text-2xl">🪼</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCreature('clownfish');
                    setIs3DMode(false);
                  }}
                  className={`w-14 h-14 rounded-2xl bg-white/10 border-2 cursor-pointer flex items-center justify-center transition-all ${
                    !is3DMode && activeCreature === 'clownfish'
                      ? 'border-[#2EE6CA] shadow-lg shadow-[#2EE6CA]/30'
                      : 'border-white/20'
                  }`}
                  aria-label="Xem Cá Hề"
                >
                  <span className="text-2xl">🐠</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCreature('starfish');
                    setIs3DMode(false);
                  }}
                  className={`w-14 h-14 rounded-2xl bg-white/10 border-2 cursor-pointer flex items-center justify-center transition-all ${
                    !is3DMode && activeCreature === 'starfish'
                      ? 'border-[#2EE6CA] shadow-lg shadow-[#2EE6CA]/30'
                      : 'border-white/20'
                  }`}
                  aria-label="Xem Sao Biển"
                >
                  <span className="text-2xl">⭐</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIs3DMode(true)}
                  className={`w-14 h-14 rounded-2xl bg-white/10 border-2 cursor-pointer flex items-center justify-center transition-all ${
                    is3DMode
                      ? 'border-[#2EE6CA] shadow-lg shadow-[#2EE6CA]/30 bg-[#2EE6CA]/20'
                      : 'border-white/20'
                  }`}
                  aria-label="Xem Rùa 3D"
                >
                  <span className="text-2xl">🐢</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 4: MỘT LỰA CHỌN NHỎ (SIMULATION CHOICE)
        ======================================================== */}
        <section className="relative w-full h-[540px] flex items-center overflow-hidden">
          {/* Sandy Beach Bottle Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/generated/backgrounds/glass_bottle_beach_cleanup.jpg"
              alt="Chai thủy tinh dạt vào bãi cát bờ biển"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-white/10" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Text */}
            <div className="max-w-lg space-y-4">
              <h2 className="font-editorial font-black text-4xl sm:text-5xl text-[#102A38] tracking-[-0.02em]">
                Một lựa chọn nhỏ
              </h2>
              <p className="text-base sm:text-lg text-[#12384B]/90 font-medium leading-relaxed">
                Những hành động hôm nay có thể tạo nên thay đổi lớn cho đại dương ngày mai.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/interactive/my-action')}
                  className="px-7 py-3.5 rounded-full bg-white/95 hover:bg-white text-[#12384B] font-extrabold text-xs shadow-md border border-slate-200 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Chọn hành động</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Choice Card: Bạn sẽ làm gì? */}
            <div className="rounded-[28px] bg-white/90 backdrop-blur-md shadow-2xl border border-white/80 p-6 sm:p-8 max-w-md w-full">
              <h3 className="font-editorial font-black text-2xl text-[#102A38] tracking-[-0.02em] mb-6">
                Bạn sẽ làm gì?
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAction(0)}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all cursor-pointer ${
                    selectedAction === 0
                      ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <Recycle className="w-8 h-8 text-emerald-600" />
                  <span className="text-xs font-bold text-[#12384B]">Nhặt rác trên bãi biển</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAction(1)}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all cursor-pointer ${
                    selectedAction === 1
                      ? 'bg-slate-100 border-slate-500 shadow-md ring-2 ring-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <Trash2 className="w-8 h-8 text-slate-500" />
                  <span className="text-xs font-bold text-slate-600">Bỏ qua và đi tiếp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAction(2)}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all cursor-pointer ${
                    selectedAction === 2
                      ? 'bg-teal-50 border-[#17657A] shadow-md ring-2 ring-teal-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <Waves className="w-8 h-8 text-[#17657A]" />
                  <span className="text-xs font-bold text-[#12384B]">Mang về tái chế</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 5: ĐẠI DƯƠNG CỦA BÉ (CREATIVE STUDIO DIORAMA)
        ======================================================== */}
        <section className="relative w-full h-[580px] flex items-center overflow-hidden">
          {/* Handcrafted Diorama Wooden Tray Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/generated/craft/ocean_diorama_wood_tray.jpg"
              alt="Mô hình khay gỗ rạn san hô đất nặn của bé"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Text */}
            <div className="max-w-md space-y-4">
              <h2 className="font-editorial font-black text-4xl sm:text-5xl text-[#102A38] tracking-[-0.02em]">
                Đại dương của bé
              </h2>
              <p className="text-base sm:text-lg text-[#12384B]/90 font-medium leading-relaxed">
                Thỏa sức sáng tạo, xây dựng môi trường sống lý tưởng cho các sinh vật biển.
              </p>
              <div>
                <CoralButton
                  size="md"
                  isKidFriendly={false}
                  onClick={() => navigate('/creative')}
                >
                  <span>Bắt đầu sáng tạo</span>
                  <ArrowRight className="w-4 h-4 ml-2 inline-block" />
                </CoralButton>
              </div>
            </div>

            {/* Right Floating Tactile Craft Tool Palettes */}
            <div className="hidden sm:flex items-center gap-4 select-none">
              {/* Material Palette */}
              <div className="p-4 rounded-[28px] bg-white/90 backdrop-blur-md shadow-xl border border-white/80 flex flex-col gap-2.5 min-w-[130px]">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-amber-50 text-xs font-black text-[#102A38]">
                  <span>🪨</span>
                  <span>Đá</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-rose-50 text-xs font-black text-[#102A38]">
                  <span>🪸</span>
                  <span>San hô</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-xs font-black text-[#102A38]">
                  <span>🌿</span>
                  <span>Cây biển</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-sky-50 text-xs font-black text-[#102A38]">
                  <span>🪨</span>
                  <span>Hang trú ẩn</span>
                </div>
              </div>

              {/* Specimen Palette */}
              <div className="p-4 rounded-[28px] bg-white/90 backdrop-blur-md shadow-xl border border-white/80 flex flex-col gap-3 min-w-[150px]">
                <span className="text-xs font-black text-[#102A38] text-center border-b border-slate-100 pb-1.5">
                  Chọn sinh vật
                </span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <span className="p-2 rounded-xl bg-sky-50 text-lg hover:scale-110 transition-transform cursor-pointer">🐠</span>
                  <span className="p-2 rounded-xl bg-rose-50 text-lg hover:scale-110 transition-transform cursor-pointer">🪸</span>
                  <span className="p-2 rounded-xl bg-amber-50 text-lg hover:scale-110 transition-transform cursor-pointer">🐚</span>
                  <span className="p-2 rounded-xl bg-emerald-50 text-lg hover:scale-110 transition-transform cursor-pointer">🌿</span>
                </div>
                <span className="p-2 rounded-xl bg-orange-50 text-lg text-center hover:scale-110 transition-transform cursor-pointer">⭐</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 6: CÙNG CÔ KHÁM PHÁ (TEACHER & RESOURCE HUB)
        ======================================================== */}
        <section className="relative w-full py-20 px-6 sm:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-editorial font-black text-4xl sm:text-5xl text-[#102A38] tracking-[-0.02em] mb-2">
                Cùng cô khám phá
              </h2>
              <p className="text-base sm:text-lg text-[#12384B]/80 font-medium">
                Các bài giảng được thiết kế sinh động, dễ áp dụng trong lớp học và tại nhà.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/resources')}
                  className="px-6 py-2.5 rounded-full border border-slate-300 hover:border-[#17657A] text-[#12384B] font-extrabold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Xem bài giảng</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/teacher')}
              className="inline-flex items-center gap-2 text-xs font-black text-[#17657A] hover:underline cursor-pointer"
            >
              <span>Dành cho giáo viên</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div
              onClick={() => navigate('/resources')}
              className="rounded-[28px] bg-white p-3.5 shadow-md border border-slate-200 flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-pointer"
            >
              <div className="h-44 rounded-2xl overflow-hidden mb-3">
                <img
                  src="/assets/generated/stations/station_coral_reef.jpg"
                  alt="Sinh cảnh rạn san hô"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-editorial font-black text-base text-[#102A38] tracking-[-0.02em] mb-2 px-1">
                Sinh cảnh rạn san hô
              </h4>
              <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#17657A]">Bài giảng</span>
                <BookOpen className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => navigate('/resources')}
              className="rounded-[28px] bg-white p-3.5 shadow-md border border-slate-200 flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-pointer"
            >
              <div className="h-44 rounded-2xl overflow-hidden mb-3">
                <img
                  src="/assets/generated/creatures/green_turtle_hero.jpg"
                  alt="Bảo vệ động vật biển"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-editorial font-black text-base text-[#102A38] tracking-[-0.02em] mb-2 px-1">
                Bảo vệ động vật biển
              </h4>
              <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#17657A]">Giáo án</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => navigate('/resources')}
              className="rounded-[28px] bg-white p-3.5 shadow-md border border-slate-200 flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-pointer"
            >
              <div className="h-44 rounded-2xl overflow-hidden mb-3">
                <img
                  src="/assets/generated/stations/station_seagrass_fish.jpg"
                  alt="Hệ sinh thái ven biển"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-editorial font-black text-base text-[#102A38] tracking-[-0.02em] mb-2 px-1">
                Hệ sinh thái ven biển
              </h4>
              <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#17657A]">Học liệu</span>
                <Folder className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => navigate('/interactive')}
              className="rounded-[28px] bg-white p-3.5 shadow-md border border-slate-200 flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-pointer"
            >
              <div className="h-44 rounded-2xl overflow-hidden mb-3">
                <img
                  src="/assets/generated/backgrounds/whale_hero_gamelab.jpg"
                  alt="Khám phá đại dương sâu"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-editorial font-black text-base text-[#102A38] tracking-[-0.02em] mb-2 px-1">
                Khám phá đại dương sâu
              </h4>
              <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#17657A]">Game & Sim</span>
                <Gamepad2 className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 7: BẮT ĐẦU CÙNG BÉ (SUNSET COASTAL CTA)
        ======================================================== */}
        <section className="relative w-full h-[520px] flex items-center justify-end overflow-hidden">
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
            <div className="max-w-md space-y-6 text-right">
              <h2 className="font-editorial font-black text-4xl sm:text-5xl text-[#102A38] tracking-[-0.02em]">
                Bắt đầu cùng bé
              </h2>
              <p className="text-base sm:text-lg text-[#12384B]/90 font-medium">
                Mở ra những trải nghiệm ý nghĩa cho hôm nay và mai sau.
              </p>
              <div className="flex justify-end">
                <CoralButton
                  size="lg"
                  isKidFriendly={false}
                  onClick={() => navigate('/entry')}
                  className="shadow-2xl"
                >
                  <span>Bắt đầu khám phá</span>
                  <ArrowRight className="w-5 h-5 ml-2 inline-block" />
                </CoralButton>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            PUBLIC FOOTER
        ======================================================== */}
        <footer className="w-full bg-[#FAF9F6] border-t border-slate-200 py-8 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-600">
          <BlueSteamLogo size="sm" />

          <div className="flex items-center gap-6">
            <button type="button" className="hover:text-[#12384B] cursor-pointer">
              Về BlueSTEAM
            </button>
            <button type="button" className="hover:text-[#12384B] cursor-pointer">
              Hỗ trợ
            </button>
            <button type="button" className="hover:text-[#12384B] cursor-pointer">
              Liên hệ
            </button>
          </div>

          <div className="text-slate-500">
            Vì một đại dương xanh hơn
          </div>
        </footer>
      </div>
    </PublicShell>
  );
}
