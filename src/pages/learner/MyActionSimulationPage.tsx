import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { useI18n } from '../../shared/i18n/I18nContext';
import { ActivityShell } from '../../shells/ActivityShell';
import { Trash2, Waves, RotateCcw, ArrowRight, Play, Check } from 'lucide-react';

export function MyActionSimulationPage() {
  const { navigate, query } = useRouter();
  const { locale } = useI18n();

  // Check if URL specifies compare mode via router query or location search
  const isCompareFromUrl = query.mode === 'compare' || (typeof window !== 'undefined' && window.location.search.includes('mode=compare'));
  const [isCompareMode, setIsCompareMode] = useState(isCompareFromUrl);
  const [selectedChoice, setSelectedChoice] = useState<'bin' | 'leave' | 'throw' | null>(null);

  useEffect(() => {
    if (query.mode === 'compare' || (typeof window !== 'undefined' && window.location.search.includes('mode=compare'))) {
      setIsCompareMode(true);
    } else {
      setIsCompareMode(false);
    }
  }, [query.mode]);

  const handleSelect = (choice: 'bin' | 'leave' | 'throw') => {
    setSelectedChoice(choice);
    // Transition to comparison view and sync URL query
    setTimeout(() => {
      setIsCompareMode(true);
      navigate('/interactive/my-action?mode=compare');
    }, 500);
  };

  const handleReset = () => {
    setIsCompareMode(false);
    setSelectedChoice(null);
    navigate('/interactive/my-action');
  };

  return (
    <ActivityShell
      title={locale === 'vi' ? 'Hành động của em: Chiếc chai nhựa' : 'My Action: The Plastic Bottle'}
      currentStep={isCompareMode ? 3 : 2}
      totalSteps={3}
      onBack={() => navigate('/interactive/simulations')}
    >
      <div className="relative w-full h-[calc(100vh-72px)] flex flex-col justify-between overflow-hidden">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: isCompareMode
              ? 'radial-gradient(circle at center, rgba(247,245,239,0.92) 0%, rgba(247,245,239,0.98) 100%), url(/assets/generated/backgrounds/clean_beach_trash_can_turtle.jpg)'
              : 'url(/assets/generated/backgrounds/littered_beach_turtle.jpg)',
            backgroundPosition: 'center 40%',
          }}
        />

        {/* Content Layer */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex flex-col justify-between flex-1">
          {/* Top Stepper: 3 beads reflecting state accurately */}
          <div className="flex justify-center items-center gap-3">
            {/* Step 1: Quan sát */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md shadow-sm border border-black/5 text-xs font-bold text-[#17657A]">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                <Check className="w-3 h-3" />
              </span>
              <span>{locale === 'vi' ? 'Quan sát' : 'Observe'}</span>
            </div>

            {/* Step 2: Lựa chọn */}
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                !isCompareMode
                  ? 'bg-[#17657A] text-white shadow-md ring-4 ring-[#2EE6CA]/30'
                  : 'bg-white/85 backdrop-blur-md shadow-sm border border-black/5 text-[#17657A]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  !isCompareMode ? 'bg-[#2EE6CA] text-[#0d2e3f]' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isCompareMode ? <Check className="w-3 h-3" /> : '2'}
              </span>
              <span>{locale === 'vi' ? 'Lựa chọn' : 'Action'}</span>
            </div>

            {/* Step 3: Xem kết quả (Active in compare mode per REFERENCE_CORRECTIONS.md) */}
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                isCompareMode
                  ? 'bg-[#17657A] text-white shadow-md ring-4 ring-[#2EE6CA]/30'
                  : 'bg-white/85 backdrop-blur-md shadow-sm border border-black/5 text-gray-500'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isCompareMode ? 'bg-[#2EE6CA] text-[#0d2e3f] font-black' : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </span>
              <span>{locale === 'vi' ? 'Xem kết quả' : 'Results'}</span>
            </div>
          </div>

          {/* Heading with Noto Serif #102A38 */}
          <div className="text-center space-y-2 mt-4">
            <h1 className="text-3xl lg:text-5xl font-black text-[#102A38] tracking-[-0.02em] font-serif">
              {isCompareMode
                ? (locale === 'vi' ? 'Nếu chọn cách khác thì sao?' : 'What If You Made Another Choice?')
                : (locale === 'vi' ? 'Bé sẽ làm gì với chiếc chai?' : 'What Will You Do With The Bottle?')}
            </h1>
            <p className="text-sm sm:text-base text-[#12384B]/80 max-w-2xl mx-auto font-medium">
              {isCompareMode
                ? (locale === 'vi' ? 'Hãy quan sát khung cảnh và so sánh sự khác biệt.' : 'Observe the scene and compare the long-term impact.')
                : (locale === 'vi' ? 'Hãy quan sát khung cảnh và chọn một cách xử lý phù hợp.' : 'Observe the beach scenery and pick the most responsible action.')}
            </p>
          </div>

          {/* Center Main Stage */}
          {!isCompareMode ? (
            /* Mode 1: Choice Screen (Screen 22) */
            <div className="flex-1 flex flex-col justify-end pb-8 space-y-6">
              {/* 3 Large Action Cards with 28px Apple corners */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
                {/* Choice 1: Bỏ vào thùng */}
                <button
                  type="button"
                  onClick={() => handleSelect('bin')}
                  className={`bg-white/95 hover:bg-white backdrop-blur-md rounded-[28px] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center gap-4 cursor-pointer border ${
                    selectedChoice === 'bin' ? 'border-[#2EE6CA] ring-4 ring-[#2EE6CA]/30' : 'border-white/80'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <span className="text-lg font-bold text-[#102A38]">
                    {locale === 'vi' ? 'Bỏ vào thùng' : 'Put in Trash Bin'}
                  </span>
                </button>

                {/* Choice 2: Để lại trên bãi */}
                <button
                  type="button"
                  onClick={() => handleSelect('leave')}
                  className={`bg-white/95 hover:bg-white backdrop-blur-md rounded-[28px] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center gap-4 cursor-pointer border ${
                    selectedChoice === 'leave' ? 'border-[#F67650] ring-4 ring-[#F67650]/30' : 'border-white/80'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <div className="relative">
                      <div className="w-10 h-3 bg-amber-200 rounded-full mt-3" />
                      <div className="w-8 h-4 bg-sky-200 border border-sky-400 rounded -rotate-12 absolute -top-1 left-1" />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-[#102A38]">
                    {locale === 'vi' ? 'Để lại trên bãi' : 'Leave on Beach'}
                  </span>
                </button>

                {/* Choice 3: Vứt xuống biển */}
                <button
                  type="button"
                  onClick={() => handleSelect('throw')}
                  className={`bg-white/95 hover:bg-white backdrop-blur-md rounded-[28px] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center gap-4 cursor-pointer border ${
                    selectedChoice === 'throw' ? 'border-red-400 ring-4 ring-red-400/30' : 'border-white/80'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <Waves className="w-8 h-8" />
                  </div>
                  <span className="text-lg font-bold text-[#102A38]">
                    {locale === 'vi' ? 'Vứt xuống biển' : 'Toss into Sea'}
                  </span>
                </button>
              </div>

              {/* Bottom reset button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 hover:bg-white text-xs font-bold text-[#17657A] shadow-sm backdrop-blur-md border border-black/5 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{locale === 'vi' ? 'Nhấn để chơi lại' : 'Tap to restart'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Mode 2: Compare Screen (Screen 23) */
            <div className="flex-1 flex flex-col justify-between py-4 space-y-6">
              {/* 2-Column Split View with 28px corners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 max-w-6xl mx-auto w-full">
                {/* Left: Bỏ vào thùng */}
                <div className="relative rounded-[28px] overflow-hidden border-2 border-white shadow-2xl min-h-[360px] group">
                  <img
                    src="/assets/generated/backgrounds/clean_beach_trash_can_turtle.jpg"
                    alt="Bỏ vào thùng"
                    className="w-full h-full object-cover"
                  />
                  {/* Top Left Badge */}
                  <div className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-md text-xs font-bold text-[#102A38]">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Trash2 className="w-3 h-3" />
                    </div>
                    <span>{locale === 'vi' ? 'Bỏ vào thùng' : 'Put in Trash Bin'}</span>
                  </div>
                </div>

                {/* Right: Để lại trên bãi */}
                <div className="relative rounded-[28px] overflow-hidden border-2 border-white shadow-2xl min-h-[360px] group">
                  <img
                    src="/assets/generated/backgrounds/littered_beach_turtle.jpg"
                    alt="Để lại trên bãi"
                    className="w-full h-full object-cover"
                  />
                  {/* Top Left Badge */}
                  <div className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-md text-xs font-bold text-[#102A38]">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Waves className="w-3 h-3" />
                    </div>
                    <span>{locale === 'vi' ? 'Để lại trên bãi' : 'Leave on Beach'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Scrubber & Buttons */}
              <div className="space-y-4 max-w-xl mx-auto w-full">
                {/* Scrubber Bar */}
                <div className="flex items-center justify-between gap-4 px-6 py-2.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-black/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#17657A]">
                    <div className="w-7 h-7 rounded-full bg-[#17657A] text-white flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                    <span>{locale === 'vi' ? 'Xem lại diễn biến' : 'Replay event'}</span>
                  </div>

                  {/* 3-Point Scrubber Line */}
                  <div className="flex-1 flex items-center px-4">
                    <div className="w-full h-1 bg-gray-200 rounded-full relative flex items-center justify-between">
                      <div className="w-3 h-3 rounded-full bg-[#17657A] ring-4 ring-[#17657A]/20 cursor-pointer" />
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-400 cursor-pointer hover:scale-125 transition-transform" />
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-400 cursor-pointer hover:scale-125 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Bottom 2 Action Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F67650] hover:bg-[#e06540] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{locale === 'vi' ? 'Thử lựa chọn khác' : 'Try Another Choice'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/interactive/plastic-journey')}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#17657A] hover:bg-[#124d5d] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{locale === 'vi' ? 'Tiếp tục khám phá' : 'Continue Exploring'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ActivityShell>
  );
}
