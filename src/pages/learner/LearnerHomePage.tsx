import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import { demoStore, BlueSteamProgressV2 } from '../../demo/storage/demoStore';
import { ArrowRight, Volume2, Check } from 'lucide-react';
import { oceanAudio } from '../../shared/sound/oceanAudio';

import { SystemLoadingRetry } from '../../components/system/SystemLoadingRetry';

export function LearnerHomePage() {
  const { navigate, query } = useRouter();
  const isLoading = query.loading === 'true';

  const [progress, setProgress] = useState<BlueSteamProgressV2>(() =>
    demoStore.getBlueSteamProgress()
  );

  useEffect(() => {
    setProgress(demoStore.getBlueSteamProgress());
  }, []);

  const handleStationClick = (num: number, route: string) => {
    if (num <= progress.currentStation) {
      navigate(route);
    }
  };

  // =========================================================================
  // SCREEN 38: System Loading & Retry Fallback View (/home?loading=true)
  // =========================================================================
  if (isLoading) {
    return (
      <SystemLoadingRetry
        onRetry={() => navigate('/home', { replace: true, query: {} })}
        targetPath="/home"
      />
    );
  }

  return (
    <LearnerShell activeNav="home">
      <div className="relative min-h-[calc(100vh-72px)] bg-[#F6F3EB] overflow-x-hidden font-sans">
        {/* Tier 1 & Tier 2 & Tier 3: Panoramic Split-View Living Ocean Hero */}
        <section className="relative w-full h-[580px] sm:h-[620px] lg:h-[660px] overflow-hidden select-none">
          {/* Tier 1: Panoramic Environmental Background */}
          <img
            src="/assets/generated/backgrounds/ocean_split_beach.jpg"
            alt="Đại dương nhiệt đới chia đôi mặt nước"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          {/* Top Gradient Overlay for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/25 pointer-events-none" />

          {/* Top-Left Title & Audio Button */}
          <div className="absolute top-6 left-6 lg:top-10 lg:left-12 z-20 flex items-center gap-4">
            <h1 className="text-white font-serif font-bold text-2xl sm:text-3xl lg:text-4xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-[-0.02em] leading-tight max-w-xs sm:max-w-md">
              Chuyến khám phá của An
            </h1>
            <button
              type="button"
              onClick={() => oceanAudio.speak('Chào mừng bé An đến với chuyến hành trình khám phá đại dương!')}
              aria-label="Phát âm thanh hướng dẫn"
              className="w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 text-[#12384B] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer border border-white/60"
            >
              <Volume2 className="w-6 h-6 text-[#12384B]" />
            </button>
          </div>

          {/* Desktop Horizontal Journey Path (>= 768px) */}
          <div className="hidden md:block absolute inset-0 z-10">
            {/* SVG Connecting Dashed Curve - Two Segments */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1536 660"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Segment 1: Bờ cát to Cỏ biển */}
              <path
                d="M 320 340 Q 480 300 650 340"
                stroke="white"
                strokeWidth="4.5"
                strokeDasharray="10 12"
                strokeLinecap="round"
                strokeOpacity="0.95"
              />
              {/* Segment 2: Cỏ biển to Rạn san hô */}
              <path
                d="M 886 340 Q 1050 300 1210 340"
                stroke="white"
                strokeWidth="4.5"
                strokeDasharray="10 12"
                strokeLinecap="round"
                strokeOpacity="0.95"
              />
            </svg>

            {/* Swimming Mascot Turtle along Journey Curve */}
            <div className="absolute left-[54%] top-[18%] z-25 pointer-events-none transition-transform duration-700 hover:scale-105">
              <img
                src="/assets/generated/creatures/turtle_isolated.png"
                alt="Rùa biển dẫn đường"
                className="w-36 lg:w-44 h-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] scale-x-[-1] -rotate-12 animate-pulse"
              />
            </div>

            {/* Station 1: Bờ cát (Completed) */}
            <div className="absolute left-[13%] lg:left-[15%] top-[45%] -translate-y-1/2 flex flex-col items-center group z-20">
              <button
                type="button"
                onClick={() => handleStationClick(1, '/learn/atlas?mode=horizontal')}
                className="relative w-36 h-36 lg:w-44 lg:h-44 rounded-full border-4 border-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden cursor-pointer group-hover:scale-105 transition-all duration-300"
              >
                <img
                  src="/assets/generated/stations/station_hermit_crab.jpg"
                  alt="Trạm Bờ cát - Ốc mượn hồn"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Completed Check Badge */}
                <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#10b981] border-2 border-white flex items-center justify-center text-white shadow-md">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              </button>

              {/* Station Label Pill */}
              <div className="mt-3 px-6 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md border border-white/80 text-[#12384B] font-extrabold text-sm lg:text-base tracking-wide">
                Bờ cát
              </div>
            </div>

            {/* Station 2: Cỏ biển (Active Hero Station) */}
            <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-30">
              {/* Hero Circular Node with Glowing Coral Halo */}
              <button
                type="button"
                onClick={() => handleStationClick(2, '/learn/turtle')}
                className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-full border-[5px] border-[#F26440] ring-8 ring-[#F26440]/30 shadow-[0_0_40px_rgba(242,100,64,0.6)] overflow-hidden cursor-pointer group-hover:scale-105 transition-all duration-300"
              >
                <img
                  src="/assets/generated/stations/station_seagrass_fish.jpg"
                  alt="Trạm Cỏ biển - Đàn cá trong thảm cỏ"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </button>

              {/* Station Label Pill */}
              <div className="mt-3 px-8 py-2 rounded-full bg-white shadow-xl border border-slate-100 text-[#12384B] font-black text-base lg:text-lg tracking-wide">
                Cỏ biển
              </div>

              {/* Big Coral CTA Button */}
              <button
                type="button"
                onClick={() => navigate('/learn/turtle')}
                className="mt-3 px-8 py-3 rounded-full bg-gradient-to-r from-[#F26440] to-[#E76F51] hover:from-[#E76F51] hover:to-[#D95D39] text-white font-extrabold text-base lg:text-lg shadow-[0_8px_25px_rgba(242,100,64,0.5)] flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all"
              >
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                <span>Tiếp tục</span>
              </button>
            </div>

            {/* Station 3: Rạn san hô (Upcoming) */}
            <div className="absolute right-[13%] lg:right-[15%] top-[45%] -translate-y-1/2 flex flex-col items-center group z-20">
              <button
                type="button"
                onClick={() => handleStationClick(3, '/interactive/habitat-placement')}
                className="relative w-36 h-36 lg:w-44 lg:h-44 rounded-full border-4 border-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden cursor-pointer group-hover:scale-105 transition-all duration-300 opacity-95"
              >
                <img
                  src="/assets/generated/stations/station_coral_reef.jpg"
                  alt="Trạm Rạn san hô"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </button>

              {/* Station Label Pill */}
              <div className="mt-3 px-6 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md border border-white/80 text-[#12384B] font-extrabold text-sm lg:text-base tracking-wide">
                Rạn san hô
              </div>
            </div>
          </div>

          {/* Mobile Vertical Journey Path (< 768px) */}
          <div className="md:hidden relative z-10 pt-24 pb-8 px-4 flex flex-col items-center gap-6">
            {/* Mobile Station 1 */}
            <button
              type="button"
              onClick={() => handleStationClick(1, '/learn/atlas?mode=horizontal')}
              className="flex items-center gap-4 w-full max-w-xs min-h-[56px] bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-white shadow-md text-left cursor-pointer active:scale-98 transition-transform"
            >
              <div className="relative w-16 h-16 rounded-full border-2 border-white overflow-hidden shrink-0">
                <img
                  src="/assets/generated/stations/station_hermit_crab.jpg"
                  alt="Bờ cát"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#10b981] border border-white flex items-center justify-center text-white text-[10px]">
                  ✓
                </div>
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-sm text-[#12384B]">Bờ cát</div>
                <div className="text-xs text-emerald-700 font-bold">Đã hoàn thành</div>
              </div>
            </button>

            {/* Dashed connector line */}
            <div className="w-0.5 h-6 border-l-2 border-dashed border-white/80" />

            {/* Mobile Station 2 */}
            <div className="flex flex-col items-center w-full max-w-xs bg-white/95 backdrop-blur-md p-4 rounded-[28px] border-2 border-[#F26440] shadow-xl">
              <div className="relative w-24 h-24 rounded-full border-4 border-[#F26440] overflow-hidden mb-2">
                <img
                  src="/assets/generated/stations/station_seagrass_fish.jpg"
                  alt="Cỏ biển"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-serif font-bold text-lg text-[#102A38]">Cỏ biển</div>
              <div className="text-xs text-[#F26440] font-bold mb-3">Đang khám phá</div>
              <button
                type="button"
                onClick={() => navigate('/learn/turtle')}
                className="w-full min-h-[56px] py-3 rounded-full bg-[#F26440] hover:bg-[#E05330] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dashed connector line */}
            <div className="w-0.5 h-6 border-l-2 border-dashed border-white/80" />

            {/* Mobile Station 3 */}
            <button
              type="button"
              onClick={() => handleStationClick(3, '/interactive/habitat-placement')}
              className="flex items-center gap-4 w-full max-w-xs min-h-[56px] bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white/60 shadow-sm opacity-90 text-left cursor-pointer active:scale-98 transition-transform"
            >
              <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden shrink-0">
                <img
                  src="/assets/generated/stations/station_coral_reef.jpg"
                  alt="Rạn san hô"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-sm text-[#12384B]">Rạn san hô</div>
                <div className="text-xs text-slate-500 font-bold">Trạm kế tiếp</div>
              </div>
            </button>
          </div>
        </section>

        {/* Tier 4: Bottom Two Tactile Wooden Craft Desk Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Card 1: Xưởng sáng tạo */}
            <button
              type="button"
              onClick={() => navigate('/creative')}
              className="relative rounded-[28px] bg-white border border-[#17657A]/15 overflow-hidden shadow-[0_4px_20px_rgba(18,56,75,0.06)] hover:shadow-2xl hover:border-[#F26440]/40 transition-all duration-300 cursor-pointer group flex flex-col sm:flex-row items-center p-3 text-left"
            >
              <div className="w-full sm:w-1/2 h-48 sm:h-52 rounded-2xl overflow-hidden relative shrink-0">
                <img
                  src="/assets/generated/craft/craft_desk_art.jpg"
                  alt="Bàn vẽ xưởng sáng tạo của bé"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 p-4 lg:p-6 flex flex-col justify-between h-full w-full">
                <div>
                  <h3 className="font-serif font-bold text-2xl lg:text-3xl text-[#102A38] tracking-[-0.02em] group-hover:text-[#F26440] transition-colors">
                    Xưởng sáng tạo
                  </h3>
                  <p className="mt-1 text-sm text-[#12384B]/70 font-medium">
                    Vẽ tranh, tô màu & xây dựng sinh cảnh đại dương 3D
                  </p>
                </div>
                <div className="mt-4 self-end">
                  <div className="w-12 h-12 rounded-full bg-[#F6F3EB] group-hover:bg-[#17657A] group-hover:text-white text-[#12384B] flex items-center justify-center shadow-sm group-hover:translate-x-1.5 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </button>

            {/* Card 2: Vào lớp */}
            <button
              type="button"
              onClick={() => navigate('/entry')}
              className="relative rounded-[28px] bg-white border border-[#17657A]/15 overflow-hidden shadow-[0_4px_20px_rgba(18,56,75,0.06)] hover:shadow-2xl hover:border-[#17657A]/40 transition-all duration-300 cursor-pointer group flex flex-col sm:flex-row items-center p-3 text-left"
            >
              <div className="w-full sm:w-1/2 h-48 sm:h-52 rounded-2xl overflow-hidden relative shrink-0">
                <img
                  src="/assets/generated/craft/classroom_desk_study.jpg"
                  alt="Góc học tập và khám phá lớp học"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 p-4 lg:p-6 flex flex-col justify-between h-full w-full">
                <div>
                  <h3 className="font-serif font-bold text-2xl lg:text-3xl text-[#102A38] tracking-[-0.02em] group-hover:text-[#17657A] transition-colors">
                    Vào lớp
                  </h3>
                  <p className="mt-1 text-sm text-[#12384B]/70 font-medium">
                    Kết nối vào phòng học trực tiếp cùng cô giáo và bạn bè
                  </p>
                </div>
                <div className="mt-4 self-end">
                  <div className="w-12 h-12 rounded-full bg-[#F6F3EB] group-hover:bg-[#17657A] group-hover:text-white text-[#12384B] flex items-center justify-center shadow-sm group-hover:translate-x-1.5 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </LearnerShell>
  );
}
