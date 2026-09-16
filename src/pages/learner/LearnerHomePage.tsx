import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import { demoStore, BlueSteamProgressV2 } from '../../demo/storage/demoStore';
import { ArrowRight, Volume2, Check } from 'lucide-react';
import { oceanAudio } from '../../shared/sound/oceanAudio';

export function LearnerHomePage() {
  const { navigate } = useRouter();

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

  return (
    <LearnerShell activeNav="home">
      <div className="relative min-h-[calc(100vh-72px)] bg-[#F6F3EB] overflow-x-hidden font-sans">
        {/* Tier 1 & Tier 2 & Tier 3: Panoramic Split-View Living Ocean Hero */}
        <section className="relative w-full min-h-[680px] md:min-h-0 md:h-[620px] lg:h-[660px] overflow-visible md:overflow-hidden select-none">
          {/* Tier 1: Panoramic Environmental Background */}
          <img
            src="/assets/generated/backgrounds/ocean_split_beach.jpg"
            alt="Đại dương nhiệt đới chia đôi mặt nước"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          {/* Top Gradient Overlay for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/25 pointer-events-none" />

          {/* Top-Left Title & Audio Button (Two-line clear hierarchy, min 56px touch target for V01-04) */}
          <div className="absolute top-6 left-6 lg:top-8 lg:left-12 z-20 flex items-start gap-4">
            <button
              type="button"
              onClick={() => oceanAudio.speak('Chào mừng bé đến với chuyến khám phá đại dương! Cùng chạm vào trạm để tiếp tục nhé!')}
              aria-label="Phát âm thanh hướng dẫn"
              className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-white/95 text-[#12384B] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer border-2 border-white/80 shrink-0 mt-0.5"
            >
              <Volume2 className="w-7 h-7 text-[#17657A]" />
            </button>
            <div className="flex flex-col">
              <span className="text-white/85 font-sans font-semibold text-sm lg:text-base tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                Chuyến khám phá của bé
              </span>
              <h1 className="text-white font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-[-0.01em] leading-tight">
                Hành trình Đại dương
              </h1>
            </div>
          </div>

          {/* Desktop Horizontal Journey Path (>= 768px) - V01-01 Curved Connector */}
          <div className="hidden md:block absolute inset-0 z-10">
            {/* SVG Connecting Dashed Curve passing smoothly between station rims */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1536 660"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Segment 1: Bờ cát rim to Cỏ biển rim */}
              <path
                d="M 406 330 C 490 330, 570 290, 656 290"
                stroke="white"
                strokeWidth="5"
                strokeDasharray="12 14"
                strokeLinecap="round"
                strokeOpacity="0.95"
              />
              {/* Segment 2: Cỏ biển rim to Rạn san hô rim */}
              <path
                d="M 880 290 C 965 290, 1045 330, 1130 330"
                stroke="white"
                strokeWidth="5"
                strokeDasharray="12 14"
                strokeLinecap="round"
                strokeOpacity="0.95"
              />
            </svg>

            {/* Station 1: Bờ cát (Completed) - V01-03 badge outside */}
            <div className="absolute left-[13%] lg:left-[15%] top-[50%] -translate-y-1/2 flex flex-col items-center group z-20">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => handleStationClick(1, '/resources/flashcard')}
                  className="relative w-36 h-36 lg:w-44 lg:h-44 rounded-full border-4 border-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden cursor-pointer group-hover:scale-105 transition-all duration-300"
                >
                  <img
                    src="/assets/generated/stations/station_hermit_crab.jpg"
                    alt="Trạm Bờ cát - Ốc mượn hồn"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </button>
                {/* Completed Check Badge - positioned outside clipping */}
                <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#10b981] border-2 border-white flex items-center justify-center text-white shadow-md z-10 pointer-events-none">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              </div>

              {/* Station Label Pill */}
              <div className="mt-3 px-6 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md border border-white/80 text-[#12384B] font-extrabold text-sm lg:text-base tracking-wide">
                Bờ cát
              </div>
            </div>

            {/* Station 2: Cỏ biển (Active Hero Station) */}
            <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-30">
              {/* Hero Circular Node with Glowing Coral Halo */}
              <button
                type="button"
                onClick={() => handleStationClick(2, '/3dmodel/turtle')}
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

              {/* Tactile Coral CTA Button - V01-06 */}
              <button
                type="button"
                onClick={() => navigate('/3dmodel/turtle')}
                className="mt-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#F26440] to-[#E05330] hover:from-[#E05330] hover:to-[#D95D39] text-white font-extrabold text-base lg:text-lg shadow-[0_10px_25px_rgba(242,100,64,0.45)] border-2 border-white/60 flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all"
              >
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                <span>Tiếp tục</span>
              </button>
            </div>

            {/* Station 3: Rạn san hô (Upcoming) */}
            <div className="absolute right-[13%] lg:right-[15%] top-[50%] -translate-y-1/2 flex flex-col items-center group z-20">
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

          {/* Mobile Vertical Journey Path (< 768px) - V02-01, V02-02, V02-03 */}
          <div className="md:hidden relative z-10 pt-28 pb-10 px-4 flex flex-col items-center gap-4">
            {/* Mobile Station 1 */}
            <button
              type="button"
              onClick={() => handleStationClick(1, '/resources/flashcard')}
              className="flex items-center gap-4 w-full max-w-xs min-h-[64px] bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-white shadow-md text-left cursor-pointer active:scale-98 transition-transform"
            >
              <div className="relative w-16 h-16 shrink-0">
                <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden">
                  <img
                    src="/assets/generated/stations/station_hermit_crab.jpg"
                    alt="Bờ cát"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#10b981] border-2 border-white flex items-center justify-center text-white text-xs font-bold z-10 shadow-sm">
                  ✓
                </div>
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-base text-[#12384B]">Bờ cát</div>
                <div className="text-xs text-emerald-700 font-bold">Đã hoàn thành</div>
              </div>
            </button>

            {/* Dashed connector line - V02-02 */}
            <div className="w-0.5 h-8 border-l-3 border-dashed border-white/90" />

            {/* Mobile Station 2 */}
            <div className="flex flex-col items-center w-full max-w-xs bg-white/95 backdrop-blur-md p-5 rounded-[28px] border-3 border-[#F26440] shadow-xl">
              <div className="relative w-28 h-28 rounded-full border-4 border-[#F26440] overflow-hidden mb-3 shadow-md">
                <img
                  src="/assets/generated/stations/station_seagrass_fish.jpg"
                  alt="Cỏ biển"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-sans font-extrabold text-xl text-[#102A38]">Cỏ biển</div>
              <div className="text-xs text-[#F26440] font-bold mb-4">Đang khám phá</div>
              <button
                type="button"
                onClick={() => navigate('/3dmodel/turtle')}
                className="w-full min-h-[56px] py-3.5 rounded-full bg-[#F26440] hover:bg-[#E05330] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dashed connector line - V02-02 */}
            <div className="w-0.5 h-8 border-l-3 border-dashed border-white/90" />

            {/* Mobile Station 3 - V02-01 fully visible, no clipping */}
            <button
              type="button"
              onClick={() => handleStationClick(3, '/interactive/habitat-placement')}
              className="flex items-center gap-4 w-full max-w-xs min-h-[64px] bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/70 shadow-sm opacity-95 text-left cursor-pointer active:scale-98 transition-transform"
            >
              <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden shrink-0">
                <img
                  src="/assets/generated/stations/station_coral_reef.jpg"
                  alt="Rạn san hô"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-base text-[#12384B]">Rạn san hô</div>
                <div className="text-xs text-slate-500 font-bold">Trạm kế tiếp</div>
              </div>
            </button>
          </div>
        </section>

        {/* Tier 4: Bottom Two Tactile Wooden Craft Desk Cards - Full photo cards with compact frosted blur badge */}
        <section className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9 pb-24 md:pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
            {/* Card 1: Xưởng sáng tạo */}
            <button
              type="button"
              onClick={() => navigate('/creative')}
              className="relative rounded-[22px] lg:rounded-[26px] overflow-hidden shadow-[0_4px_20px_rgba(18,56,75,0.08)] hover:shadow-xl hover:scale-[1.008] transition-all duration-300 cursor-pointer group text-left h-40 sm:h-44 lg:h-48 border border-white/60"
            >
              {/* Full background image spanning whole card */}
              <img
                src="/assets/generated/craft/craft_desk_art.jpg"
                alt="Xưởng sáng tạo"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Compact frosted glass badge: text on top, arrow below, minimal spacing, no line-wrap */}
              <div className="absolute right-3.5 sm:right-5 lg:right-6 top-1/2 -translate-y-1/2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_4px_16px_rgba(18,56,75,0.12)] flex flex-col items-center justify-center gap-1.5 group-hover:bg-white/90 group-hover:scale-105 transition-all duration-300">
                <span className="font-sans font-bold text-sm sm:text-[15px] text-[#0A354D] tracking-tight whitespace-nowrap group-hover:text-[#F26440] transition-colors">
                  Xưởng sáng tạo
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#0A354D] shadow-xs border border-stone-200/80 flex items-center justify-center group-hover:bg-[#0A354D] group-hover:text-white transition-all duration-300">
                  <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                </div>
              </div>
            </button>

            {/* Card 2: Vào lớp */}
            <button
              type="button"
              onClick={() => navigate('/entry')}
              className="relative rounded-[22px] lg:rounded-[26px] overflow-hidden shadow-[0_4px_20px_rgba(18,56,75,0.08)] hover:shadow-xl hover:scale-[1.008] transition-all duration-300 cursor-pointer group text-left h-40 sm:h-44 lg:h-48 border border-white/60"
            >
              {/* Full background image spanning whole card */}
              <img
                src="/assets/generated/craft/classroom_desk_study.jpg"
                alt="Vào lớp"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Compact frosted glass badge: text on top, arrow below, minimal spacing, no line-wrap */}
              <div className="absolute right-3.5 sm:right-5 lg:right-6 top-1/2 -translate-y-1/2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_4px_16px_rgba(18,56,75,0.12)] flex flex-col items-center justify-center gap-1.5 group-hover:bg-white/90 group-hover:scale-105 transition-all duration-300">
                <span className="font-sans font-bold text-sm sm:text-[15px] text-[#0A354D] tracking-tight whitespace-nowrap group-hover:text-[#17657A] transition-colors">
                  Vào lớp
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#0A354D] shadow-xs border border-stone-200/80 flex items-center justify-center group-hover:bg-[#17657A] group-hover:text-white transition-all duration-300">
                  <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </LearnerShell>
  );
}
