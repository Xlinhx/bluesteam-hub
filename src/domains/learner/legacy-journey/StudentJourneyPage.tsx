import { useRouter } from '../../../app/router';
import { BlueSteamLogo } from '../../../shared/ui/badges/BlueSteamLogo';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import {
  Volume2,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Check,
  Search,
  Lightbulb,
  FlaskConical,
  Mic,
  Compass,
} from 'lucide-react';

export function StudentJourneyPage() {
  const { query, navigate } = useRouter();

  const activeConcept = (query.concept as 'a' | 'b' | 'c' | 'single') || 'a';

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-neutral-900 pb-20 font-sans">
      {/* Student Global Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-sky-100 sticky top-0 z-40 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="cursor-pointer hover:opacity-90 transition p-1 -ml-1 flex items-center"
              aria-label="Về trang chủ BlueSTEAM"
            >
              <BlueSteamLogo size="sm" />
            </button>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/student')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-neutral-600 hover:text-sky-900 font-medium text-sm transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <button
                onClick={() => navigate('/student/journey')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sky-700 font-semibold text-sm border-b-2 border-sky-600 bg-sky-50/50 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-sky-600" />
                Khám phá
              </button>
              <button
                onClick={() => navigate('/student/progress')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-neutral-600 hover:text-sky-900 font-medium text-sm transition-colors cursor-pointer"
              >
                <span className="text-amber-500 text-sm">🐚</span>
                Bộ sưu tập
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => oceanAudio.playChime()}
              className="p-2.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 transition-colors cursor-pointer border border-sky-200/60"
              title="Âm thanh"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-sky-100">
              <img
                src="/assets/avatar_an.png"
                alt="Bé An"
                className="w-9 h-9 rounded-full object-cover border-2 border-sky-400 shadow-sm"
              />
              <div className="text-left">
                <span className="font-semibold text-xs text-sky-950 block leading-tight">An</span>
                <span className="text-[10px] text-neutral-500 block leading-tight">Lớp Sao Biển</span>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </div>
          </div>
        </div>
      </header>

      {/* RENDER CONCEPT A: CINEMATIC DISCOVERY */}
      {activeConcept === 'a' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
          {/* Back Button */}
          <div>
            <button
              onClick={() => navigate('/student')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-sky-100 text-sky-900 text-xs font-semibold hover:bg-sky-50 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          </div>

          {/* Main Hero Container with Curved 5-Step Trajectory */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Big Interactive Trajectory Canvas */}
            <div className="lg:col-span-8 relative rounded-3xl overflow-hidden shadow-xl border border-sky-100 bg-sky-950 text-white p-8 min-h-[460px] flex flex-col justify-between">
              {/* Seascape Background */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('/assets/hero_buoy_waterline.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-sky-950/40 to-sky-950/30" />

              {/* Top Details */}
              <div className="relative z-10 space-y-2 max-w-lg">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-wide">
                  Hành trình học
                </span>
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white leading-tight drop-shadow-md">
                  Dòng chảy đại dương
                </h1>
                <h2 className="text-lg lg:text-xl font-medium text-sky-200 drop-shadow">
                  Sức mạnh vô hình
                </h2>
                <p className="text-xs lg:text-sm text-sky-100 leading-relaxed">
                  Cùng An khám phá cách dòng nước di chuyển và mang mọi thứ đi khắp đại dương.
                </p>
              </div>

              {/* 5 Journey Nodes Along Wave Path */}
              <div className="relative z-10 pt-16 pb-4">
                {/* Curved Dotted Wave Line */}
                <div className="absolute top-[62%] left-10 right-10 h-0.5 border-b-2 border-dashed border-sky-300/40 pointer-events-none" />

                <div className="relative flex justify-between items-center px-4">
                  {/* Step 1: Xem */}
                  <div
                    onClick={() => oceanAudio.speak('Chặng một: Xem video ngắn về dòng nước.')}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div className="relative w-14 h-14 rounded-full bg-sky-900/90 border-2 border-white/60 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white drop-shadow">1. Xem</span>
                  </div>

                  {/* Step 2: Khám phá */}
                  <div
                    onClick={() => oceanAudio.speak('Chặng hai: Quan sát và tìm hiểu xung quanh.')}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div className="relative w-14 h-14 rounded-full bg-sky-900/90 border-2 border-white/60 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Search className="w-5 h-5 text-white" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white drop-shadow">2. Khám phá</span>
                  </div>

                  {/* Step 3: Dự đoán */}
                  <div
                    onClick={() => oceanAudio.speak('Chặng ba: Dự đoán dòng nước sẽ đi về đâu.')}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div className="relative w-14 h-14 rounded-full bg-sky-900/90 border-2 border-white/60 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Lightbulb className="w-5 h-5 text-white" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white drop-shadow">3. Dự đoán</span>
                  </div>

                  {/* Step 4: Thử nghiệm (Active Cyan Ring, Clean, No Neon per rule) */}
                  <div
                    onClick={() => navigate('/student/unit')}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div className="relative w-18 h-18 rounded-full bg-sky-500 border-4 border-white shadow-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <FlaskConical className="w-8 h-8 text-white" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center shadow-md">
                        <Play className="w-3 h-3 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-cyan-200 drop-shadow">4. Thử nghiệm</span>
                  </div>

                  {/* Step 5: Chia sẻ */}
                  <div className="flex flex-col items-center gap-2 opacity-60">
                    <div className="relative w-14 h-14 rounded-full bg-sky-950/70 border-2 border-white/30 flex items-center justify-center text-neutral-300">
                      <Mic className="w-5 h-5 text-neutral-300" />
                    </div>
                    <span className="text-xs font-medium text-neutral-300">5. Chia sẻ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Status Card */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider block">
                  Bài học hiện tại
                </span>
                <h3 className="text-2xl font-serif font-bold text-sky-950 leading-tight">
                  Dòng chảy đại dương
                </h3>
                <p className="text-xs font-medium text-sky-700">Sức mạnh vô hình</p>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs font-semibold text-neutral-600">
                    <span>Đã hoàn thành 3/5</span>
                    <span>60%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="w-[60%] h-full bg-teal-500 rounded-full" />
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden aspect-[16/10] my-2 shadow-sm">
                  <img src="/assets/lab_wave_flume.jpg" alt="Thử nghiệm với phao" className="w-full h-full object-cover" />
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  Thử nghiệm với phao để quan sát cách dòng nước di chuyển trên bề mặt.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => navigate('/student/unit')}
                  className="w-full py-3.5 rounded-2xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <span>Tiếp tục</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Huy hiệu của An */}
                <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center gap-3">
                  <img src="/assets/specimen_shell.png" alt="Huy hiệu" className="w-10 h-10 object-contain" />
                  <div>
                    <h4 className="font-bold text-xs text-sky-950">Nhà khám phá</h4>
                    <p className="text-[11px] text-neutral-500">Đã hoàn thành 3 hoạt động</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Hành trình khác */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold text-sky-950">
                  Hành trình khác
                </h3>
                <p className="text-xs text-neutral-500">
                  Còn nhiều điều tuyệt vời đang chờ khám phá!
                </p>
              </div>
              <button
                onClick={() => navigate('/student')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div
                onClick={() => navigate('/student/journey')}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sky-100 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src="/assets/card_clownfish.jpg" alt="Rạn san hô" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-sky-950">Rạn san hô</h4>
                    <p className="text-[11px] text-neutral-500">Những ngôi nhà dưới biển</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-800 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/student/journey')}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sky-100 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src="/assets/card_turtle.jpg" alt="Rùa biển" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-sky-950">Rùa biển</h4>
                    <p className="text-[11px] text-neutral-500">Hành trình phiêu lưu</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-800 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/student/journey')}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sky-100 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src="/assets/card_kelp.jpg" alt="Rừng tảo bẹ" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-sky-950">Rừng tảo bẹ</h4>
                    <p className="text-[11px] text-neutral-500">Khu rừng dưới sóng</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-800 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/student/journey')}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sky-100 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src="/assets/card_jellyfish.jpg" alt="Sứa biển" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-sky-950">Sứa biển</h4>
                    <p className="text-[11px] text-neutral-500">Những vũ điệu trong nước</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-800 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* RENDER CONCEPT B: SCIENTIFIC ATLAS */}
      {activeConcept === 'b' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => navigate('/student')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-sky-100 text-sky-900 font-semibold hover:bg-sky-50 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-600 font-medium">Hành trình học</span>
            <span className="text-neutral-400">/</span>
            <span className="text-sky-900 font-bold">Bài học hiện tại</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Lesson Overview */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-sky-950 leading-tight">
                    Dòng chảy đại dương
                  </h1>
                  <p className="text-base font-medium text-sky-700">
                    Sức mạnh vô hình
                  </p>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  Dòng nước di chuyển trên bề mặt đại dương, mang nhiều thứ đi khắp nơi. Hôm nay, chúng ta sẽ thử nghiệm với một chiếc phao để quan sát dòng chảy.
                </p>

                <div className="rounded-2xl overflow-hidden aspect-[16/10] shadow-sm">
                  <img
                    src="/assets/hero_buoy_waterline.jpg"
                    alt="Phao trên nước"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Mini Stats Cards */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-teal-500 flex items-center justify-center font-bold text-xs text-teal-600">
                      60%
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-sky-950">Tiến độ bài học</h4>
                      <p className="text-[11px] text-neutral-500">3/5 hoạt động</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center gap-3">
                    <img src="/assets/specimen_shell.png" alt="Huy hiệu" className="w-9 h-9 object-contain" />
                    <div>
                      <h4 className="font-bold text-xs text-sky-950">Nhà khám phá</h4>
                      <p className="text-[11px] text-neutral-500">Đã xong 3 bước</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Timeline Cards */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
              <h2 className="text-xl font-serif font-bold text-sky-950">
                Các bước trong hành trình
              </h2>

              <div className="space-y-3">
                {/* 1. Xem */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 hover:bg-sky-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      <Check className="w-4 h-4" />
                    </span>
                    <div className="w-14 h-10 rounded-xl overflow-hidden shadow-sm">
                      <img src="/assets/card_clownfish.jpg" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-sky-950">Xem</h3>
                      <p className="text-xs text-neutral-500">Xem video ngắn về dòng nước.</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </div>

                {/* 2. Khám phá */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 hover:bg-sky-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      <Check className="w-4 h-4" />
                    </span>
                    <div className="w-14 h-10 rounded-xl overflow-hidden shadow-sm">
                      <img src="/assets/card_turtle.jpg" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-sky-950">Khám phá</h3>
                      <p className="text-xs text-neutral-500">Quan sát và tìm hiểu xung quanh.</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </div>

                {/* 3. Dự đoán */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 hover:bg-sky-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      <Check className="w-4 h-4" />
                    </span>
                    <div className="w-14 h-10 rounded-xl overflow-hidden shadow-sm">
                      <img src="/assets/card_flow_drawing.png" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-sky-950">Dự đoán</h3>
                      <p className="text-xs text-neutral-500">Dòng nước sẽ đi về đâu?</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </div>

                {/* 4. Thử nghiệm (Active Step) */}
                <div className="p-5 rounded-2xl bg-sky-50 border-2 border-sky-300 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-sm shadow">
                        4
                      </span>
                      <div>
                        <h3 className="font-bold text-base text-sky-950">Thử nghiệm</h3>
                        <p className="text-xs text-neutral-600">Thả phao và quan sát dòng chảy.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden aspect-[16/7] shadow-sm">
                    <img src="/assets/lab_wave_flume.jpg" alt="Mô phỏng thử nghiệm phao và sóng" className="w-full h-full object-cover" />
                  </div>

                  <button
                    onClick={() => navigate('/student/unit')}
                    className="w-full py-3 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
                  >
                    <span>Bắt đầu thử nghiệm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 5. Chia sẻ */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/60 opacity-60">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border border-neutral-300 text-neutral-400 flex items-center justify-center font-bold text-xs">
                      5
                    </span>
                    <div className="w-14 h-10 rounded-xl overflow-hidden bg-neutral-200 flex items-center justify-center">
                      <Mic className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-500">Chia sẻ</h3>
                      <p className="text-xs text-neutral-400">Kể lại điều em đã khám phá.</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row Concept B: Những điều An đã khám phá */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-sky-950">
                  Những điều An đã khám phá
                </h3>
                <p className="text-xs text-neutral-500">Các ghi chú nhỏ từ hành trình của bạn.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden">
                    <img src="/assets/card_whale.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-xs text-sky-950">Nước di chuyển trên bề mặt.</h4>
                  <p className="text-[10px] text-neutral-500">Từ hoạt động Xem</p>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden">
                    <img src="/assets/card_clownfish.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-xs text-sky-950">Thấy nhiều sinh vật theo dòng nước.</h4>
                  <p className="text-[10px] text-neutral-500">Từ hoạt động Khám phá</p>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden">
                    <img src="/assets/card_flow_drawing.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-xs text-sky-950">Vật nổi được dòng nước mang đi.</h4>
                  <p className="text-[10px] text-neutral-500">Từ hoạt động Dự đoán</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-sky-950">
                  Xem bộ sưu tập
                </h3>
                <p className="text-xs text-neutral-500 mt-1">Lưu lại những điều thú vị bạn đã khám phá.</p>
              </div>

              <div className="flex items-center gap-3 my-4">
                <img src="/assets/specimen_shell.png" alt="" className="w-12 h-12 object-contain" />
                <img src="/assets/specimen_starfish.png" alt="" className="w-12 h-12 object-contain" />
                <img src="/assets/specimen_algae.png" alt="" className="w-12 h-12 object-contain" />
              </div>

              <button
                onClick={() => navigate('/student/progress')}
                className="w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Mở bộ sưu tập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
