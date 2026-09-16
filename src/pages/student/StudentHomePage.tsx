import { useRouter } from '../../app/router';
import { BlueSteamLogo } from '../../shared/components/BlueSteamLogo';
import { getStoredConcept, ConceptKey } from '../../showcase/registry';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  Volume2,
  ChevronDown,
  ArrowRight,
  Play,
  Users,
  Star,
  Check,
  Compass,
} from 'lucide-react';

export function StudentHomePage() {
  const { query, navigate } = useRouter();

  // Concept state: URL param takes precedence, then stored concept, fallback 'a'
  const activeConcept = (query.concept as ConceptKey) || getStoredConcept('studenthome');

  const speakTeacherGreeting = () => {
    oceanAudio.speak('Hôm nay chúng ta tiếp tục thử nghiệm nhé!');
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-neutral-900 pb-20 font-sans">
      {/* Student Global Navigation Bar */}
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sky-700 font-semibold text-sm border-b-2 border-sky-600 bg-sky-50/50 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-sky-600" />
                Trang chủ
              </button>
              <button
                onClick={() => navigate('/student/journey')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-neutral-600 hover:text-sky-900 font-medium text-sm transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-neutral-400" />
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
            {/* Audio Button */}
            <button
              onClick={() => oceanAudio.playChime()}
              className="p-2.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 transition-colors cursor-pointer border border-sky-200/60"
              title="Âm thanh"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Profile An */}
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

      {/* RENDER CONCEPT A: CINEMATIC DISCOVERY */}
      {activeConcept === 'a' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
          {/* Top Wide Waterline Hero */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-sky-100 bg-sky-950 text-white min-h-[460px] flex flex-col justify-between p-8 lg:p-10">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('/assets/hero_buoy_waterline.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sky-950/80 via-sky-950/40 to-transparent" />

            {/* Hero Main Content */}
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-sky-800/80 backdrop-blur-sm text-sky-200 text-xs font-semibold tracking-wide uppercase">
                Học tiếp cùng An
              </span>

              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-white leading-tight drop-shadow-md">
                Dòng chảy đại dương
              </h1>
              <h2 className="text-xl lg:text-2xl font-medium text-sky-100 drop-shadow">
                Sức mạnh vô hình
              </h2>

              <p className="text-sky-100 text-sm md:text-base leading-relaxed max-w-lg">
                Cùng tìm hiểu cách dòng chảy di chuyển mọi thứ trên mặt biển nhé!
              </p>

              {/* Progress Bar 60% */}
              <div className="space-y-1.5 pt-2 max-w-md">
                <div className="flex justify-between text-xs font-semibold text-sky-200">
                  <span>Tiến trình bài học</span>
                  <span>60%</span>
                </div>
                <div className="w-full h-2.5 bg-sky-950/60 rounded-full overflow-hidden border border-sky-400/30">
                  <div className="w-[60%] h-full bg-gradient-to-r from-cyan-400 to-sky-300 rounded-full" />
                </div>
              </div>

              {/* 5-Step Tracker Pill */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-medium text-emerald-300 border border-emerald-400/30">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Xem</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-medium text-emerald-300 border border-emerald-400/30">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Khám phá</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-medium text-emerald-300 border border-emerald-400/30">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. Dự đoán</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-sky-950 text-xs font-bold shadow-md border border-cyan-300">
                  <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>4. Thử nghiệm</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm text-xs font-medium text-neutral-300">
                  <span className="w-3.5 h-3.5 rounded-full border border-neutral-400 flex items-center justify-center text-[9px]">
                    5
                  </span>
                  <span>5. Chia sẻ</span>
                </div>
              </div>

              {/* Big CTA button */}
              <div className="pt-3">
                <button
                  onClick={() => navigate('/student/journey')}
                  className="px-7 py-3.5 rounded-2xl bg-white hover:bg-sky-50 text-sky-950 font-bold text-sm shadow-xl flex items-center gap-2.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-sky-900 text-sky-900" />
                  <span>Học tiếp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Floated Cards */}
            <div className="relative z-10 self-end w-full lg:w-72 mt-6 lg:mt-0 space-y-3">
              {/* Card 1: Class Entry */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 text-sky-950 shadow-lg border border-sky-100">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-sm">Lớp Sao Biển</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="/assets/avatar_an.png" alt="" />
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-amber-400 text-[9px] font-bold text-white flex items-center justify-center">B</div>
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-teal-500 text-[9px] font-bold text-white flex items-center justify-center">C</div>
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-500 text-[9px] font-bold text-white flex items-center justify-center">D</div>
                  </div>
                  <span className="text-xs text-neutral-500 font-medium pl-1.5">+19 bạn</span>
                </div>
                <p className="text-xs text-neutral-600 mb-3">
                  24 bạn cùng khám phá đại dương
                </p>
                <button
                  onClick={() => navigate('/join')}
                  className="w-full py-2.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Vào lớp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2: Teacher Greeting */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 text-sky-950 shadow-lg border border-sky-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/avatar_colinh.png"
                    alt="Cô Linh"
                    className="w-10 h-10 rounded-full object-cover border border-sky-300 shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-sky-950">Cô Linh</h4>
                    <p className="text-[11px] text-neutral-600 leading-tight">
                      Hôm nay chúng ta tiếp tục thử nghiệm nhé!
                    </p>
                  </div>
                </div>
                <button
                  onClick={speakTeacherGreeting}
                  className="p-2 rounded-full hover:bg-sky-100 text-sky-800 transition-colors cursor-pointer"
                  title="Nghe cô nói"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Section: Hôm nay em khám phá gì? */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-sky-950">
                Hôm nay em khám phá gì?
              </h3>
              <button
                onClick={() => navigate('/student/journey')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Rạn san hô */}
              <div
                onClick={() => navigate('/student/journey')}
                className="group relative rounded-2xl overflow-hidden shadow-md border border-sky-100 aspect-[4/3] cursor-pointer hover:shadow-xl transition-all"
              >
                <img
                  src="/assets/card_clownfish.jpg"
                  alt="Rạn san hô"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-sky-950/30 to-transparent flex items-end p-5 justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-white">Rạn san hô</h4>
                    <p className="text-xs text-sky-200">Ngôi nhà rực rỡ dưới biển</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/90 group-hover:bg-white text-sky-950 flex items-center justify-center shadow transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Card 2: Rùa biển */}
              <div
                onClick={() => navigate('/student/journey')}
                className="group relative rounded-2xl overflow-hidden shadow-md border border-sky-100 aspect-[4/3] cursor-pointer hover:shadow-xl transition-all"
              >
                <img
                  src="/assets/card_turtle.jpg"
                  alt="Rùa biển"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-sky-950/30 to-transparent flex items-end p-5 justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-white">Rùa biển</h4>
                    <p className="text-xs text-sky-200">Những người du hành hiền lành</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/90 group-hover:bg-white text-sky-950 flex items-center justify-center shadow transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Card 3: Sứa biển */}
              <div
                onClick={() => navigate('/student/journey')}
                className="group relative rounded-2xl overflow-hidden shadow-md border border-sky-100 aspect-[4/3] cursor-pointer hover:shadow-xl transition-all"
              >
                <img
                  src="/assets/card_jellyfish.jpg"
                  alt="Sứa biển"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-sky-950/30 to-transparent flex items-end p-5 justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-white">Sứa biển</h4>
                    <p className="text-xs text-sky-200">Những vũ điệu trong nước</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/90 group-hover:bg-white text-sky-950 flex items-center justify-center shadow transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Thử một điều mới */}
          <section className="space-y-4">
            <h3 className="text-2xl font-serif font-bold text-sky-950">
              Thử một điều mới
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Nghe âm thanh */}
              <div
                onClick={() => oceanAudio.playChime(440, 1.2)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative rounded-xl overflow-hidden mb-3 aspect-[16/9]">
                  <img src="/assets/card_whale.jpg" alt="Cá voi" className="w-full h-full object-cover" />
                  <button className="absolute bottom-2 left-2 p-2 rounded-full bg-white/90 text-sky-900 shadow">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-sky-950">Nghe âm thanh</h4>
                    <p className="text-xs text-neutral-500">Đáy là con gì?</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-800 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Card 2: Ghép bóng */}
              <div
                onClick={() => navigate('/student/simulation')}
                className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="rounded-xl overflow-hidden mb-3 aspect-[16/9] bg-sky-50 flex items-center justify-center">
                  <img src="/assets/card_silhouette.png" alt="Ghép bóng" className="w-full h-full object-contain p-2" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-sky-950">Ghép bóng</h4>
                    <p className="text-xs text-neutral-500">Tìm hình giống nhau</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-800 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Card 3: Vẽ dòng chảy */}
              <div
                onClick={() => navigate('/student/simulation')}
                className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="rounded-xl overflow-hidden mb-3 aspect-[16/9] bg-sky-50 flex items-center justify-center">
                  <img src="/assets/card_flow_drawing.png" alt="Vẽ dòng chảy" className="w-full h-full object-contain p-2" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-sky-950">Vẽ dòng chảy</h4>
                    <p className="text-xs text-neutral-500">Vẽ đường đi của phao</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-800 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Row: Bộ sưu tập & Hành trình khám phá */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Bộ sưu tập của An */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-sky-950">
                    Bộ sưu tập của An
                  </h3>
                  <span className="text-xs text-neutral-500 font-medium">
                    Đã thu thập 6/12
                  </span>
                </div>
                <div className="w-40 h-2 bg-sky-100 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-teal-500 rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3 pt-2">
                {[
                  { name: 'Vỏ sò', file: '/assets/specimen_shell.png' },
                  { name: 'Sao biển', file: '/assets/specimen_starfish.png' },
                  { name: 'San hô', file: '/assets/specimen_coral.png' },
                  { name: 'Vỏ ốc', file: '/assets/specimen_snail.png' },
                  { name: 'Cát biển', file: '/assets/specimen_sand.png' },
                  { name: 'Tảo biển', file: '/assets/specimen_algae.png' },
                ].map((item) => (
                  <div key={item.name} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-sky-50/60 border border-sky-100/80">
                    <img src={item.file} alt={item.name} className="w-12 h-12 object-contain" />
                    <span className="text-[11px] font-medium text-neutral-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hành trình khám phá */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-sky-950">
                  Hành trình khám phá
                </h3>
                <span className="text-xs text-neutral-500 font-medium">
                  Còn 3 chủ đề nữa
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden my-3 aspect-[16/8]">
                <img src="/assets/map_island_journey.jpg" alt="Bản đồ đảo" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => navigate('/student/journey')}
                className="w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Xem bản đồ hành trình</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>
      )}

      {/* RENDER CONCEPT B: SCIENTIFIC ATLAS */}
      {activeConcept === 'b' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column Sidebar */}
            <div className="lg:col-span-4 space-y-5">
              {/* Card: Học tiếp cùng An */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
                <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider block">
                  Học tiếp cùng An
                </span>

                <div className="rounded-2xl overflow-hidden aspect-[16/9] shadow-sm">
                  <img
                    src="/assets/hero_buoy_waterline.jpg"
                    alt="Phao đại dương"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-serif font-bold text-sky-950 leading-tight">
                    Dòng chảy đại dương
                  </h2>
                  <p className="text-sm font-medium text-sky-700">
                    Sức mạnh vô hình
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-neutral-600">
                    <span>Tiến độ bài học</span>
                    <span>60%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="w-[60%] h-full bg-teal-500 rounded-full" />
                  </div>
                </div>

                {/* Vertical 5-Step Checklist */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span>1. Xem</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span>2. Khám phá</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span>3. Dự đoán</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-sky-950 bg-sky-50/80 p-2 rounded-xl border border-sky-200">
                    <span className="w-5 h-5 rounded-full bg-sky-700 text-white flex items-center justify-center text-[11px]">
                      4
                    </span>
                    <span>4. Thử nghiệm</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-400">
                    <span className="w-5 h-5 rounded-full border border-neutral-300 flex items-center justify-center text-[10px]">
                      5
                    </span>
                    <span>5. Chia sẻ</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/student/journey')}
                  className="w-full py-3.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Học tiếp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card: Lớp Sao Biển */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-sm text-sky-950">Lớp Sao Biển</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="/assets/avatar_an.png" alt="" />
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-amber-400 text-[9px] font-bold text-white flex items-center justify-center">B</div>
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-teal-500 text-[9px] font-bold text-white flex items-center justify-center">C</div>
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-500 text-[9px] font-bold text-white flex items-center justify-center">D</div>
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">+19 bạn trong lớp</span>
                </div>
                <button
                  onClick={() => navigate('/join')}
                  className="w-full py-2.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Vào lớp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card: Cô Linh */}
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
                      Hôm nay chúng ta tiếp tục thử nghiệm nhé!
                    </p>
                  </div>
                </div>
                <button
                  onClick={speakTeacherGreeting}
                  className="p-2 rounded-full hover:bg-sky-50 text-sky-800 transition-colors cursor-pointer"
                  title="Nghe cô nói"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Main Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Khám phá thế giới đại dương */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-bold text-sky-950">
                    Khám phá thế giới đại dương
                  </h2>
                  <button
                    onClick={() => navigate('/student/journey')}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem tất cả</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Grid row 1: Wide coral card + turtle card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => navigate('/student/journey')}
                    className="md:col-span-2 group relative rounded-2xl overflow-hidden aspect-[16/9] shadow-sm border border-sky-100 cursor-pointer"
                  >
                    <img
                      src="/assets/card_clownfish.jpg"
                      alt="Rạn san hô"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/20 to-transparent flex items-end justify-between p-5 text-white">
                      <div>
                        <h4 className="font-bold text-lg">Rạn san hô</h4>
                        <p className="text-xs text-sky-200">Sự sống muôn màu</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white text-sky-950 flex items-center justify-center shadow">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => navigate('/student/journey')}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-auto shadow-sm border border-sky-100 cursor-pointer"
                  >
                    <img
                      src="/assets/card_turtle.jpg"
                      alt="Rùa biển"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/20 to-transparent flex items-end justify-between p-4 text-white">
                      <div>
                        <h4 className="font-bold text-base">Rùa biển</h4>
                        <p className="text-xs text-sky-200">Những người du hành xa</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white text-sky-950 flex items-center justify-center shadow">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid row 2: 3 cards: Kelp, Jellyfish, Tidal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => navigate('/student/journey')}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm border border-sky-100 cursor-pointer"
                  >
                    <img src="/assets/card_kelp.jpg" alt="Rừng tảo biển" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-transparent to-transparent flex items-end justify-between p-4 text-white">
                      <div>
                        <h4 className="font-bold text-sm">Rừng tảo biển</h4>
                        <p className="text-[11px] text-sky-200">Khu rừng dưới nước</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white text-sky-950 flex items-center justify-center shadow">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => navigate('/student/journey')}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm border border-sky-100 cursor-pointer"
                  >
                    <img src="/assets/card_jellyfish.jpg" alt="Sứa biển" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-transparent to-transparent flex items-end justify-between p-4 text-white">
                      <div>
                        <h4 className="font-bold text-sm">Sứa biển</h4>
                        <p className="text-[11px] text-sky-200">Vũ điệu trong đại dương</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white text-sky-950 flex items-center justify-center shadow">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => navigate('/student/journey')}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm border border-sky-100 cursor-pointer"
                  >
                    <img src="/assets/card_tidal.jpg" alt="Bờ đá thủy triều" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-transparent to-transparent flex items-end justify-between p-4 text-white">
                      <div>
                        <h4 className="font-bold text-sm">Bờ đá thủy triều</h4>
                        <p className="text-[11px] text-sky-200">Khám phá khi nước rút</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white text-sky-950 flex items-center justify-center shadow">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Thử một điều mới */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-bold text-sky-950">
                    Thử một điều mới
                  </h3>
                  <span className="text-xs text-sky-700 font-semibold cursor-pointer">
                    Hoạt động khác ➔
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => oceanAudio.playChime(440, 1.2)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative rounded-xl overflow-hidden mb-3 aspect-[16/9]">
                      <img src="/assets/card_whale.jpg" alt="Cá voi" className="w-full h-full object-cover" />
                      <button className="absolute bottom-2 left-2 p-1.5 rounded-full bg-white/90 text-sky-900 shadow">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-sky-950">Nghe âm thanh</h4>
                        <p className="text-[11px] text-neutral-500">Đáy là con gì?</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-sky-50 text-sky-800 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => navigate('/student/simulation')}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="rounded-xl overflow-hidden mb-3 aspect-[16/9] bg-sky-50 flex items-center justify-center">
                      <img src="/assets/card_silhouette.png" alt="Ghép bóng" className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-sky-950">Ghép bóng</h4>
                        <p className="text-[11px] text-neutral-500">Tìm hình giống nhau</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-sky-50 text-sky-800 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => navigate('/student/simulation')}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="rounded-xl overflow-hidden mb-3 aspect-[16/9] bg-sky-50 flex items-center justify-center">
                      <img src="/assets/card_flow_drawing.png" alt="Vẽ dòng chảy" className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-sky-950">Vẽ dòng chảy</h4>
                        <p className="text-[11px] text-neutral-500">Vẽ đường đi của phao</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-sky-50 text-sky-800 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Bottom Row Concept B: Bộ sưu tập & Hành trình */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-8">
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-sky-950">
                    Bộ sưu tập của An
                  </h3>
                  <span className="text-xs text-neutral-500 font-medium">
                    Đã thu thập 6/12
                  </span>
                </div>
                <div className="w-40 h-2 bg-sky-100 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-teal-500 rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3 pt-2">
                {[
                  { name: 'Vỏ sò', file: '/assets/specimen_shell.png' },
                  { name: 'Sao biển', file: '/assets/specimen_starfish.png' },
                  { name: 'San hô', file: '/assets/specimen_coral.png' },
                  { name: 'Vỏ ốc', file: '/assets/specimen_snail.png' },
                  { name: 'Cát biển', file: '/assets/specimen_sand.png' },
                  { name: 'Tảo biển', file: '/assets/specimen_algae.png' },
                ].map((item) => (
                  <div key={item.name} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-sky-50/60 border border-sky-100/80">
                    <img src={item.file} alt={item.name} className="w-12 h-12 object-contain" />
                    <span className="text-[11px] font-medium text-neutral-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-sky-950">
                  Hành trình của An
                </h3>
                <span className="text-xs text-neutral-500 font-medium">
                  Còn 3 chủ đề nữa
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden my-3 aspect-[16/8]">
                <img src="/assets/map_island_journey.jpg" alt="Bản đồ đảo" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => navigate('/student/journey')}
                className="w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Xem bản đồ hành trình</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
