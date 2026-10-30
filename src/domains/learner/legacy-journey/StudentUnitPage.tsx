import { useState } from 'react';
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
  Wind,
  FlaskConical,
  Eye,
  Edit2,
  Lightbulb,
  Compass,
} from 'lucide-react';

export function StudentUnitPage() {
  const { query, navigate } = useRouter();

  const activeConcept = (query.concept as 'a' | 'b' | 'c' | 'single') || 'a';
  const [selectedDirection, setSelectedDirection] = useState<'left' | 'right'>('right');

  const handleListenGuide = () => {
    oceanAudio.speak('Hôm nay chúng ta thử xem gió đổi hướng thì phao sẽ đi đâu nhé!');
  };

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
              <span className="font-semibold text-sm text-sky-950">An</span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header Tracker Bar */}
      <div className="bg-white border-b border-sky-100 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Back button */}
          <button
            onClick={() => navigate('/student/journey')}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại hành trình</span>
          </button>

          {/* Center Title */}
          <div className="text-center">
            <h1 className="font-serif font-bold text-base text-sky-950 leading-tight">
              Dòng chảy đại dương
            </h1>
            <p className="text-[11px] text-sky-700">Sức mạnh vô hình</p>
          </div>

          {/* 5-Step tracker */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span className="hidden sm:inline">1. Xem</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span className="hidden sm:inline">2. Khám phá</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span className="hidden sm:inline">3. Dự đoán</span>
            </div>
            <div className="flex items-center gap-1 text-sky-950 font-bold bg-sky-100 px-2.5 py-1 rounded-full border border-sky-300">
              <span className="w-4 h-4 rounded-full bg-sky-700 text-white flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Thử nghiệm</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-400">
              <span className="w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center text-[9px]">
                5
              </span>
              <span className="hidden sm:inline">5. Chia sẻ</span>
            </div>

            {/* Progress 60% */}
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-sky-100">
              <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="w-[60%] h-full bg-teal-500 rounded-full" />
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">3/5 hoàn thành (60%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER CONCEPT A: CINEMATIC DISCOVERY */}
      {activeConcept === 'a' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Big Preview Banner */}
            <div className="lg:col-span-8 relative rounded-3xl overflow-hidden shadow-xl border border-sky-100 bg-sky-950 text-white p-8 min-h-[440px] flex flex-col justify-end">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('/assets/hero_buoy_waterline.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-sky-950/40 to-transparent" />

              <div className="relative z-10 space-y-4 max-w-xl">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white drop-shadow-md">
                    Dòng chảy đại dương
                  </h2>
                  <p className="text-base text-sky-200 drop-shadow">
                    Sức mạnh vô hình
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleListenGuide}
                    className="px-5 py-3 rounded-2xl bg-white/95 hover:bg-white text-sky-950 text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-sky-800" />
                    <span>Nghe hướng dẫn</span>
                  </button>

                  <button
                    onClick={() => navigate('/student/simulation')}
                    className="px-6 py-3 rounded-2xl bg-sky-800 hover:bg-sky-700 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-sky-400/40 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Mở mô phỏng</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Interactive Selection Card */}
            <div className="lg:col-span-4 space-y-4">
              {/* Em sẽ thử gì? */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
                <h3 className="text-xl font-serif font-bold text-sky-950">
                  Em sẽ thử gì?
                </h3>

                <div className="flex items-center justify-center gap-4 py-2 text-sky-900">
                  <div className="flex flex-col items-center gap-1">
                    <Wind className="w-8 h-8 text-sky-600 animate-pulse" />
                    <span className="text-xs font-bold">Gió đổi</span>
                  </div>
                  <span className="text-xl text-neutral-400">➔</span>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow flex items-center justify-center text-white text-xs">
                      📍
                    </div>
                    <span className="text-xs font-bold">Phao đi đâu?</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setSelectedDirection('left')}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      selectedDirection === 'left'
                        ? 'border-sky-600 bg-sky-50 shadow'
                        : 'border-sky-100 hover:border-sky-200 bg-white'
                    }`}
                  >
                    <div className="h-16 rounded-xl overflow-hidden mb-2">
                      <img src="/assets/hero_buoy_waterline.jpg" alt="Sang trái" className="w-full h-full object-cover scale-x-[-1]" />
                    </div>
                    <span className="font-bold text-xs text-sky-950">Sang trái</span>
                  </button>

                  <button
                    onClick={() => setSelectedDirection('right')}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      selectedDirection === 'right'
                        ? 'border-sky-600 bg-sky-50 shadow'
                        : 'border-sky-100 hover:border-sky-200 bg-white'
                    }`}
                  >
                    <div className="h-16 rounded-xl overflow-hidden mb-2">
                      <img src="/assets/hero_buoy_waterline.jpg" alt="Sang phải" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-xs text-sky-950">Sang phải</span>
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/student/simulation?wind=${selectedDirection}`)}
                  className="w-full mt-3 py-3 rounded-2xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Bắt đầu thử nghiệm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cô Linh Greeting Card */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/avatar_colinh.png"
                    alt="Cô Linh"
                    className="w-12 h-12 rounded-full object-cover border-2 border-sky-300"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-sky-950">Cô Linh</h4>
                    <p className="text-[11px] text-neutral-600 leading-tight">
                      Hôm nay chúng ta thử xem gió đổi hướng thì phao sẽ đi đâu nhé!
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleListenGuide}
                  className="p-2 rounded-full hover:bg-sky-50 text-sky-800 transition-colors cursor-pointer"
                  title="Nghe cô nói"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Section: Các bước thực hiện */}
          <section className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-sky-950">
              Các bước thực hiện
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-sky-900 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <Wind className="w-6 h-6 text-sky-600" />
                  <span className="font-bold text-sm text-sky-950">Chọn hướng gió</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-sky-900 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <span className="text-xl">📍</span>
                  <span className="font-bold text-sm text-sky-950">Thả phao</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-sky-900 text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <Eye className="w-6 h-6 text-sky-600" />
                  <span className="font-bold text-sm text-sky-950">Quan sát phao di chuyển</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </div>
            </div>
          </section>

          {/* Section: Gợi ý từ những gì chúng ta đã khám phá */}
          <section className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-sky-950">
              Gợi ý từ những gì chúng ta đã khám phá
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl overflow-hidden shadow-sm">
                    <img src="/assets/card_whale.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-sky-950">Sóng trên bờ</h4>
                    <p className="text-[11px] text-neutral-500">Gió có thể tạo ra sóng trên mặt nước.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl overflow-hidden shadow-sm">
                    <img src="/assets/card_flow_drawing.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-sky-950">Hướng di chuyển</h4>
                    <p className="text-[11px] text-neutral-500">Chúng ta đoán phao sẽ đi theo hướng gió.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl overflow-hidden shadow-sm">
                    <img src="/assets/card_kelp.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-sky-950">Rong biển</h4>
                    <p className="text-[11px] text-neutral-500">Rong biển cũng di chuyển theo dòng nước.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </div>
            </div>
          </section>
        </main>
      )}

      {/* RENDER CONCEPT B: SCIENTIFIC ATLAS */}
      {activeConcept === 'b' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar Column */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card Thử nghiệm */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-sky-950">Thử nghiệm</h3>
                    <p className="text-xs text-sky-700">Gió đổi, phao đi đâu?</p>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  Hãy thử thay đổi hướng gió và quan sát phao di chuyển trên mặt nước nhé!
                </p>

                <button
                  onClick={() => navigate('/student/simulation')}
                  className="w-full py-3 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mở mô phỏng</span>
                </button>
              </div>

              {/* Card Các bước */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-3">
                <h4 className="font-bold text-xs text-sky-950">Các bước</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-800">
                    <span className="w-6 h-6 rounded-full bg-sky-900 text-white flex items-center justify-center text-xs">
                      1
                    </span>
                    <Wind className="w-4 h-4 text-sky-600" />
                    <span>Chọn hướng gió</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-800">
                    <span className="w-6 h-6 rounded-full bg-sky-900 text-white flex items-center justify-center text-xs">
                      2
                    </span>
                    <span className="text-sm">📍</span>
                    <span>Thả phao</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-800">
                    <span className="w-6 h-6 rounded-full bg-sky-900 text-white flex items-center justify-center text-xs">
                      3
                    </span>
                    <Eye className="w-4 h-4 text-sky-600" />
                    <span>Quan sát phao di chuyển</span>
                  </div>
                </div>
              </div>

              {/* Card Cô Linh */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/avatar_colinh.png"
                    alt="Cô Linh"
                    className="w-10 h-10 rounded-full object-cover border border-sky-300"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-sky-950">Cô Linh</h4>
                    <p className="text-[11px] text-neutral-600">
                      Hãy thử vài lần và xem phao đi về phía nào nhé!
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleListenGuide}
                  className="p-2 rounded-full hover:bg-sky-50 text-sky-800 transition-colors cursor-pointer"
                  title="Nghe cô nói"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Mẹo nhỏ */}
              <div className="bg-sky-50/70 rounded-3xl p-4 border border-sky-100 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-sky-950">Mẹo nhỏ</h4>
                  <p className="text-[11px] text-neutral-600 leading-tight">
                    Gió thổi trên mặt nước sẽ kéo phao đi theo hướng gió.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Top Banner: Thử nghiệm dòng chảy */}
              <div className="relative rounded-3xl overflow-hidden shadow-md border border-sky-100 bg-sky-950 text-white p-8 min-h-[360px] flex flex-col justify-between">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('/assets/hero_buoy_waterline.jpg')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-transparent to-sky-950/40" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white drop-shadow">
                      Thử nghiệm dòng chảy
                    </h2>
                    <p className="text-xs text-sky-200 mt-1">
                      Thay đổi hướng gió để xem phao di chuyển
                    </p>
                  </div>

                  {/* Wind selection top-right card */}
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 text-sky-950 shadow-xl border border-sky-100">
                    <span className="text-[11px] font-bold text-neutral-500 block mb-2 text-center">
                      Chọn hướng gió
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDirection('left')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          selectedDirection === 'left'
                            ? 'bg-sky-800 text-white shadow'
                            : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                        }`}
                      >
                        <span>←</span>
                        <span>Sang trái</span>
                      </button>
                      <button
                        onClick={() => setSelectedDirection('right')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          selectedDirection === 'right'
                            ? 'bg-sky-800 text-white shadow'
                            : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                        }`}
                      >
                        <span>Sang phải</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <button
                    onClick={() => navigate('/student/simulation')}
                    className="px-6 py-3 rounded-2xl bg-sky-900 hover:bg-sky-800 text-white text-xs font-bold shadow-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Bắt đầu thử nghiệm ngay</span>
                  </button>
                </div>
              </div>

              {/* Bottom Row Concept B */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-3">
                  <h4 className="font-bold text-xs text-sky-950 uppercase tracking-wider">
                    Trước khi thử
                  </h4>
                  <div className="rounded-xl overflow-hidden aspect-[16/9]">
                    <img src="/assets/hero_buoy_waterline.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-neutral-600">
                    Gió đang thổi về bên phải trên mặt biển.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-sky-950 uppercase tracking-wider">
                      Điều em dự đoán
                    </h4>
                    <button className="text-sky-700 hover:text-sky-900 text-xs flex items-center gap-1 cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa</span>
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden aspect-[16/9]">
                    <img src="/assets/card_flow_drawing.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-neutral-700">
                    Mình đoán phao sẽ đi <strong className="text-sky-900 font-bold">sang phải.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
