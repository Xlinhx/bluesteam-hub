import { useState, useEffect } from 'react';
import { useRouter } from '../../../app/router';
import { BlueSteamLogo } from '../../../shared/ui/badges/BlueSteamLogo';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import {
  Volume2,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Check,
  Star,
  Compass,
} from 'lucide-react';

export function StudentProgressPage() {
  const { query, navigate } = useRouter();

  const activeConcept = (query.concept as 'a' | 'b' | 'c' | 'single') || 'a';

  // Audio sharing player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      oceanAudio.stop();
      setIsPlayingAudio(false);
      setAudioProgress(0);
    } else {
      setIsPlayingAudio(true);
      setAudioProgress(0);
      oceanAudio.speak('Con thấy gió thổi làm nước đi sang phải, nên phao cũng trôi theo.', () => {
        setIsPlayingAudio(false);
        setAudioProgress(15);
      });
    }
  };

  useEffect(() => {
    let interval: number;
    if (isPlayingAudio) {
      interval = window.setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 15) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const speakTeacherFeedback = () => {
    oceanAudio.speak('An đã thử đổi hướng gió và quan sát chiếc phao. Rất tốt!');
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-neutral-600 hover:text-sky-900 font-medium text-sm transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-neutral-400" />
                Khám phá
              </button>
              <button
                onClick={() => navigate('/student/progress')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sky-700 font-semibold text-sm border-b-2 border-sky-600 bg-sky-50/50 cursor-pointer"
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

      {/* RENDER CONCEPT A: CINEMATIC DISCOVERY */}
      {activeConcept === 'a' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
          {/* Top Hero Banner with Swimming Sea Turtle & 100% Badge */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-sky-100 bg-sky-950 text-white p-8 lg:p-10 min-h-[360px] flex flex-col justify-between">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('/assets/hero_buoy_waterline.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sky-950/90 via-sky-950/60 to-transparent" />

            <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <button
                  onClick={() => navigate('/student/simulation')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>

                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white drop-shadow-md">
                  Những điều An đã khám phá
                </h1>
                <p className="text-sm text-sky-200 drop-shadow">
                  Mỗi trải nghiệm, một đại dương lớn hơn!
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <img
                    src="/assets/avatar_an.png"
                    alt="Bé An"
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-base text-white">An</h3>
                    <p className="text-xs text-sky-200">Lớp Sao Biển · 24 bạn</p>
                  </div>
                </div>
              </div>

              {/* Sunburst 100% Complete Badge */}
              <div className="relative self-center w-36 h-36 rounded-full bg-gradient-to-br from-white/95 to-sky-100 backdrop-blur-md border-4 border-sky-300 shadow-2xl flex flex-col items-center justify-center text-sky-950 text-center animate-pulse">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
                  Đã hoàn thành
                </span>
                <span className="text-3xl font-extrabold font-mono text-sky-950 leading-tight">
                  100%
                </span>
                <div className="flex items-center gap-0.5 text-amber-500 pt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
              </div>
            </div>

            {/* Sub-banner: 5/5 Completed Steps */}
            <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 text-sky-950 shadow-lg border border-sky-100 flex flex-wrap items-center justify-between gap-4 mt-6">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check className="w-4 h-4" />
                  </span>
                  <span>1. Xem</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check className="w-4 h-4" />
                  </span>
                  <span>2. Khám phá</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check className="w-4 h-4" />
                  </span>
                  <span>3. Dự đoán</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check className="w-4 h-4" />
                  </span>
                  <span>4. Thử nghiệm</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check className="w-4 h-4" />
                  </span>
                  <span>5. Chia sẻ</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-serif font-bold text-xs text-sky-950 block">
                    Dòng chảy đại dương
                  </span>
                  <span className="text-[10px] text-neutral-500 block">5/5 hoạt động · 100%</span>
                </div>
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                  <img src="/assets/hero_buoy_waterline.jpg" alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Hành trình vừa hoàn thành */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-sky-950">
                Hành trình vừa hoàn thành
              </h3>
              <button
                onClick={() => navigate('/student/journey')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem lại hoạt động</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Thử nghiệm dòng chảy */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-900 text-white flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <h4 className="font-bold text-sm text-sky-950">Thử nghiệm dòng chảy</h4>
                </div>
                <div className="relative rounded-2xl overflow-hidden aspect-[16/9] shadow-sm group">
                  <img src="/assets/hero_buoy_waterline.jpg" alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-sky-950 flex items-center justify-center shadow">
                      <Play className="w-4 h-4 fill-sky-950 ml-0.5" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-neutral-600">
                  Chiếc phao di chuyển sang phải.
                </p>
              </div>

              {/* Card 2: Dự đoán và kết quả */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-900 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h4 className="font-bold text-sm text-sky-950">Dự đoán và kết quả</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 aspect-[16/9]">
                  <div className="rounded-xl overflow-hidden bg-sky-50 p-2 flex flex-col justify-between text-center border border-sky-100">
                    <img src="/assets/card_flow_drawing.png" alt="" className="w-full h-12 object-contain" />
                    <span className="text-[11px] font-bold text-sky-900">Dự đoán</span>
                  </div>
                  <div className="rounded-xl overflow-hidden bg-emerald-50 p-2 flex flex-col justify-between text-center border border-emerald-100">
                    <img src="/assets/lab_wave_flume.jpg" alt="Thực tế" className="w-full h-12 object-cover rounded" />
                    <span className="text-[11px] font-bold text-emerald-900">Kết quả thực tế</span>
                  </div>
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  Khớp hoàn toàn với dự đoán!
                </p>
              </div>

              {/* Card 3: Chia sẻ suy nghĩ with Playable Audio */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-sky-900 text-white flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <h4 className="font-bold text-sm text-sky-950">Chia sẻ suy nghĩ</h4>
                  </div>

                  {/* Audio Player */}
                  <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-center gap-3">
                    <button
                      onClick={togglePlayAudio}
                      className="w-10 h-10 rounded-full bg-sky-900 hover:bg-sky-800 text-white flex items-center justify-center shadow cursor-pointer transition-colors"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                    </button>

                    <div className="flex-1 space-y-1">
                      {/* Animated Sound Waveform */}
                      <div className="flex items-center gap-1 h-6">
                        {[40, 70, 30, 90, 60, 80, 50, 95, 65, 45, 85, 35, 75, 55, 60].map((h, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full transition-all duration-300 ${
                              isPlayingAudio ? 'bg-sky-600 animate-pulse' : 'bg-sky-300'
                            }`}
                            style={{ height: `${isPlayingAudio ? (h * (i % 2 === 0 ? 0.9 : 1.2)) : h * 0.5}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                        <span>0:{audioProgress < 10 ? `0${audioProgress}` : audioProgress}</span>
                        <span>0:15</span>
                      </div>
                    </div>
                  </div>
                </div>

                <blockquote className="text-xs italic text-sky-950 border-l-2 border-sky-300 pl-3 leading-relaxed">
                  "Con thấy gió thổi làm nước đi sang phải, nên phao cũng trôi theo."
                </blockquote>
              </div>
            </div>
          </section>

          {/* Cô Linh Feedback Card */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/assets/avatar_colinh.png"
                alt="Cô Linh"
                className="w-12 h-12 rounded-full object-cover border-2 border-sky-300 shadow-sm"
              />
              <div>
                <h4 className="font-bold text-sm text-sky-950">Cô Linh</h4>
                <p className="text-xs text-neutral-600">
                  An đã thử đổi hướng gió và quan sát chiếc phao. Rất tốt!
                </p>
              </div>
            </div>
            <button
              onClick={speakTeacherFeedback}
              className="p-2.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 transition-colors cursor-pointer"
              title="Nghe nhận xét"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Section: Bộ sưu tập của An (7/12 Unlocked!) */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-sky-950">
                  Bộ sưu tập của An
                </h3>
                <span className="text-xs text-emerald-700 font-semibold">
                  Đã thu thập 7/12 sinh vật & kỷ vật
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-36 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="w-[58%] h-full bg-teal-500 rounded-full" />
                </div>
                <button
                  onClick={() => navigate('/student/progress')}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 pt-2">
              {[
                { name: 'Vỏ sò', file: '/assets/specimen_shell.png' },
                { name: 'Sao biển', file: '/assets/specimen_starfish.png' },
                { name: 'San hô', file: '/assets/specimen_coral.png' },
                { name: 'Vỏ ốc', file: '/assets/specimen_snail.png' },
                { name: 'Cát biển', file: '/assets/specimen_sand.png' },
                { name: 'Tảo biển', file: '/assets/specimen_algae.png' },
                { name: 'Dòng chảy', file: '/assets/specimen_wave.png', isNew: true },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all ${
                    item.isNew
                      ? 'bg-gradient-to-b from-sky-50 to-teal-50 border-teal-300 shadow-md ring-2 ring-teal-200'
                      : 'bg-sky-50/50 border-sky-100'
                  }`}
                >
                  <img src={item.file} alt={item.name} className="w-12 h-12 object-contain" />
                  <span className="text-[11px] font-bold text-neutral-800">{item.name}</span>
                  {item.isNew && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-600 text-white">
                      Mới nhận!
                    </span>
                  )}
                </div>
              ))}

              {/* Locked Slot */}
              <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/60 text-center">
                <span className="text-xl text-neutral-300">?</span>
                <span className="text-[10px] text-neutral-400 font-medium mt-1">Còn 5 món nữa</span>
              </div>
            </div>
          </section>

          {/* Section: Khám phá tiếp theo */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold text-sky-950">
                  Khám phá tiếp theo
                </h3>
                <p className="text-xs text-neutral-500">
                  Những điều thú vị đang chờ An!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => navigate('/student/journey')}
                className="group relative rounded-2xl overflow-hidden shadow-sm border border-sky-100 aspect-[4/3] cursor-pointer"
              >
                <img src="/assets/card_clownfish.jpg" alt="Rạn san hô" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-transparent to-transparent flex items-end justify-between p-4 text-white">
                  <div>
                    <h4 className="font-bold text-base">Rạn san hô</h4>
                    <p className="text-xs text-sky-200">Ngôi nhà rực rỡ</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white text-sky-950 flex items-center justify-center shadow">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/student/journey')}
                className="group relative rounded-2xl overflow-hidden shadow-sm border border-sky-100 aspect-[4/3] cursor-pointer"
              >
                <img src="/assets/card_turtle.jpg" alt="Rùa biển" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-transparent to-transparent flex items-end justify-between p-4 text-white">
                  <div>
                    <h4 className="font-bold text-base">Rùa biển</h4>
                    <p className="text-xs text-sky-200">Những người du hành xa</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white text-sky-950 flex items-center justify-center shadow">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/student/journey')}
                className="group relative rounded-2xl overflow-hidden shadow-sm border border-sky-100 aspect-[4/3] cursor-pointer"
              >
                <img src="/assets/card_kelp.jpg" alt="Rừng tảo biển" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-transparent to-transparent flex items-end justify-between p-4 text-white">
                  <div>
                    <h4 className="font-bold text-base">Rừng tảo biển</h4>
                    <p className="text-xs text-sky-200">Khu rừng dưới nước</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white text-sky-950 flex items-center justify-center shadow">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-sky-950">
                Hành trình học tập của An
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                Khám phá thế giới đại dương qua những trải nghiệm thật thú vị!
              </p>
            </div>
            <button
              onClick={() => navigate('/student/simulation')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sky-100 text-sky-900 text-xs font-semibold hover:bg-sky-50 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Hồ sơ khám phá */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-5 text-center">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block text-left">
                  Hồ sơ khám phá
                </span>

                <div className="flex flex-col items-center">
                  <img
                    src="/assets/avatar_an.png"
                    alt="An"
                    className="w-20 h-20 rounded-full border-4 border-sky-300 shadow-md mb-2"
                  />
                  <h3 className="font-bold text-lg text-sky-950">An</h3>
                  <p className="text-xs text-neutral-500">Lớp Sao Biển · 24 bạn</p>
                </div>

                {/* Big Circular Progress 100% */}
                <div className="w-36 h-36 rounded-full border-8 border-teal-500 mx-auto flex flex-col items-center justify-center shadow-inner bg-sky-50/50">
                  <span className="text-3xl font-extrabold text-teal-700 font-mono">
                    100%
                  </span>
                  <span className="text-[11px] font-bold text-neutral-600">
                    Đã hoàn thành
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-3 text-left">
                  <span className="text-2xl">🪸</span>
                  <p className="text-xs text-sky-900 font-medium leading-tight">
                    Tò mò hôm nay, biển lớn ngày mai!
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Bài học & 5 vertical steps */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div>
                  <h2 className="text-xl font-serif font-bold text-sky-950">
                    Bài học: Dòng chảy đại dương
                  </h2>
                  <p className="text-xs text-sky-700 font-medium">Sức mạnh vô hình</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-bold">5/5</span>
                  </div>
                  <span className="text-xs font-bold text-sky-950 bg-sky-100 px-2.5 py-1 rounded-full">
                    100%
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-sky-900 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <div className="w-16 h-10 rounded-xl overflow-hidden shadow-sm">
                      <img src="/assets/hero_buoy_waterline.jpg" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-sky-950">Xem</h4>
                      <p className="text-xs text-neutral-500">Làm quen với dòng chảy</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-sky-900 text-white font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <div className="w-16 h-10 rounded-xl overflow-hidden shadow-sm">
                      <img src="/assets/card_clownfish.jpg" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-sky-950">Khám phá</h4>
                      <p className="text-xs text-neutral-500">Tìm hiểu điều thú vị</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-sky-900 text-white font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <div className="w-16 h-10 rounded-xl overflow-hidden shadow-sm">
                      <img src="/assets/card_flow_drawing.png" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-sky-950">Dự đoán</h4>
                      <p className="text-xs text-neutral-500">Con đoán phao sẽ đi sang phải</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-sky-900 text-white font-bold flex items-center justify-center text-xs">
                      4
                    </span>
                    <div className="w-16 h-10 rounded-xl overflow-hidden shadow-sm">
                      <img src="/assets/lab_wave_flume.jpg" alt="Thử nghiệm tạo sóng và đổi gió" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-sky-950">Thử nghiệm</h4>
                      <p className="text-xs text-neutral-500">Thử đổi hướng gió và quan sát</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-sky-900 text-white font-bold flex items-center justify-center text-xs">
                      5
                    </span>
                    <div className="w-16 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-sky-800" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-sky-950">Chia sẻ</h4>
                      <p className="text-xs text-neutral-500">Con đã chia sẻ suy nghĩ của mình</p>
                    </div>
                  </div>
                  <button
                    onClick={togglePlayAudio}
                    className="px-3 py-1.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Nghe</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cô Linh Full Width Feedback */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/assets/avatar_colinh.png"
                alt="Cô Linh"
                className="w-12 h-12 rounded-full object-cover border-2 border-sky-300"
              />
              <div>
                <h4 className="font-bold text-sm text-sky-950">Cô Linh</h4>
                <p className="text-xs text-neutral-600">
                  An đã thử đổi hướng gió và quan sát chiếc phao. Rất tốt!
                </p>
              </div>
            </div>
            <button
              onClick={speakTeacherFeedback}
              className="p-2.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bộ sưu tập đại dương (7/12) */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-sky-950">
                  Bộ sưu tập đại dương
                </h3>
                <span className="text-xs text-teal-700 font-semibold">
                  Đã thu thập 7/12
                </span>
              </div>
              <div className="w-40 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="w-[58%] h-full bg-teal-500 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 pt-2">
              {[
                { name: 'Vỏ sò', file: '/assets/specimen_shell.png' },
                { name: 'Sao biển', file: '/assets/specimen_starfish.png' },
                { name: 'San hô', file: '/assets/specimen_coral.png' },
                { name: 'Vỏ ốc', file: '/assets/specimen_snail.png' },
                { name: 'Cát biển', file: '/assets/specimen_sand.png' },
                { name: 'Tảo biển', file: '/assets/specimen_algae.png' },
                { name: 'Dòng chảy', file: '/assets/specimen_wave.png', isNew: true },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border ${
                    item.isNew
                      ? 'bg-sky-50 border-teal-300 shadow ring-2 ring-teal-200'
                      : 'bg-sky-50/40 border-sky-100'
                  }`}
                >
                  <img src={item.file} alt={item.name} className="w-12 h-12 object-contain" />
                  <span className="text-[11px] font-bold text-neutral-800">{item.name}</span>
                </div>
              ))}

              <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/60 text-center">
                <span className="text-xl text-neutral-300">?</span>
                <span className="text-[10px] text-neutral-400 font-medium mt-1">Còn 5 món nữa</span>
              </div>
            </div>
          </section>

          {/* Khám phá tiếp theo Concept B */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-sky-950">
                Khám phá tiếp theo
              </h3>
              <span className="text-xs text-sky-700 font-semibold cursor-pointer">
                Khám phá thêm ➔
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => navigate('/student/journey')}
                className="group relative rounded-2xl overflow-hidden shadow-sm border border-sky-100 aspect-[16/9] cursor-pointer"
              >
                <img src="/assets/card_clownfish.jpg" alt="Rạn san hô" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-transparent to-transparent flex items-end justify-between p-5 text-white">
                  <div>
                    <h4 className="font-bold text-lg">Rạn san hô</h4>
                    <p className="text-xs text-sky-200">Sắc màu của biển cả</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white text-sky-950 flex items-center justify-center shadow">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/student/journey')}
                className="group relative rounded-2xl overflow-hidden shadow-sm border border-sky-100 aspect-[16/9] cursor-pointer"
              >
                <img src="/assets/card_turtle.jpg" alt="Rùa biển" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-transparent to-transparent flex items-end justify-between p-5 text-white">
                  <div>
                    <h4 className="font-bold text-lg">Rùa biển</h4>
                    <p className="text-xs text-sky-200">Những người bạn hiền hòa</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white text-sky-950 flex items-center justify-center shadow">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
