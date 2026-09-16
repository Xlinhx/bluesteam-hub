import { useState } from 'react';
import { useRouter } from '../../app/router';
import { useI18n } from '../../shared/i18n/I18nContext';
import { ActivityShell } from '../../shells/ActivityShell';
import { Eye, Search, Lightbulb, Check, PhoneCall, ChevronUp, BookOpen, ShieldAlert, Award, RotateCcw } from 'lucide-react';
import { demoStore } from '../../demo/storage/demoStore';

export function RescueMissionSimulationPage() {
  const { navigate } = useRouter();
  const { locale } = useI18n();
  const [currentStep, setCurrentStep] = useState(2); // Step 2: Tìm vấn đề (as shown in reference mockup)
  const [isNotebookOpen, setIsNotebookOpen] = useState(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const steps = [
    { id: 1, labelVi: 'Quan sát', labelEn: 'Observe', icon: Eye },
    { id: 2, labelVi: 'Tìm vấn đề', labelEn: 'Identify', icon: Search },
    { id: 3, labelVi: 'Chọn cách giúp', labelEn: 'Choose Help', icon: Lightbulb },
    { id: 4, labelVi: 'Xem kết quả', labelEn: 'Outcome', icon: Check },
  ];

  const handleAlertAdults = () => {
    // Correct NOAA Protocol: Alert trained response team
    setWarningMessage(null);
    setCurrentStep(4);
    demoStore.unlockBadge('badge-rescue-hero');
  };

  const handleSelfCutWarning = () => {
    // NOAA Protocol safety educational intercept
    setWarningMessage(
      locale === 'vi'
        ? '⚠️ Quy tắc an toàn NOAA: Tuyệt đối không tự ý bơi lại gần hoặc cắt lưới một mình! Sinh vật hoảng sợ có thể quẫy mạnh gây nguy hiểm, và các sợi cước ngầm có thể quấn vào chân tay người. Hãy báo người lớn và gọi đội cứu hộ chuyên trách!'
        : '⚠️ NOAA Safety Rule: Never attempt to disentangle marine wildlife alone! Panicked animals may thrash unpredictably, and underwater netting presents severe entangling hazards. Alert adults and contact certified responders!'
    );
  };

  const handleReset = () => {
    setCurrentStep(2);
    setWarningMessage(null);
  };

  return (
    <ActivityShell
      title={locale === 'vi' ? 'Nhiệm vụ giải cứu sinh vật biển' : 'Marine Rescue Mission'}
      variant="light"
      currentStep={currentStep}
      totalSteps={4}
      onBack={() => navigate('/interactive/simulations')}
      showLogo={true}
    >
      <div className="relative w-full h-[calc(100vh-72px)] flex flex-col justify-between overflow-hidden">
        {/* Full Bleed Realistic Nature Photography */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: 'url(/assets/generated/backgrounds/dolphin_rocky_cove_rescue.jpg)',
            backgroundPosition: 'center 45%',
          }}
        />

        {/* Ambient Top Wash for header legibility */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />

        {/* Content Layer */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex flex-col justify-between flex-1">
          {/* Top Title and Stepper */}
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-5xl font-black text-[#102A38] tracking-[-0.02em] font-serif text-left">
              {locale === 'vi' ? 'Cùng tìm cách giúp bạn' : 'Let’s Find A Way To Help'}
            </h1>

            {/* 4-Step Progress Ribbon */}
            <div className="flex items-center gap-6 flex-wrap">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isActive = s.id === currentStep;
                const isPast = s.id < currentStep;

                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div
                      className="flex flex-col items-center gap-1 cursor-pointer"
                      onClick={() => setCurrentStep(s.id)}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-[#17657A] text-[#2EE6CA] shadow-md ring-4 ring-[#2EE6CA]/30'
                            : isPast
                            ? 'bg-[#17657A] text-white'
                            : 'bg-white/85 text-gray-500 border border-black/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isActive ? 'text-[#102A38]' : 'text-gray-600'
                        }`}
                      >
                        {locale === 'vi' ? s.labelVi : s.labelEn}
                      </span>
                    </div>

                    {idx < steps.length - 1 && (
                      <div className="w-12 h-0.5 bg-gray-300 -mt-4 hidden sm:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Scene Middle Layer */}
          <div className="relative flex-1 min-h-[360px] flex items-center justify-center">
            {/* Pulsing Target Pin on the Tangled Ghost Net on rocks (Lower-Left Rocky Shore) */}
            {currentStep <= 2 && (
              <div
                onClick={() => setCurrentStep(3)}
                className="absolute top-[62%] left-[28%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                title={locale === 'vi' ? 'Lưới ma mắc kẹt trên ghềnh đá' : 'Ghost net trapped on rocks'}
              >
                {/* Outer pulsing ripple */}
                <div className="absolute -inset-3 rounded-full bg-[#F67650]/30 animate-ping pointer-events-none" />
                {/* Target Circle */}
                <div className="relative w-12 h-12 rounded-full bg-[#F67650] text-white flex items-center justify-center shadow-2xl border-2 border-white group-hover:scale-110 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            )}

            {/* NOAA Warning Banner Modal */}
            {warningMessage && (
              <div className="absolute inset-x-4 max-w-2xl mx-auto top-1/4 bg-white/95 backdrop-blur-md rounded-[28px] p-6 shadow-2xl border-2 border-amber-400 z-30 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-serif font-black text-lg text-[#102A38]">
                      {locale === 'vi' ? 'Cảnh báo an toàn cho bé' : 'Safety Guidance'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#12384B]/90 leading-relaxed">
                      {warningMessage}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setWarningMessage(null)}
                    className="px-5 py-2 rounded-full bg-[#102A38] hover:bg-[#17657A] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {locale === 'vi' ? 'Đã hiểu' : 'Understood'}
                  </button>
                </div>
              </div>
            )}

            {/* Mission Success Outcome Card (Step 4) */}
            {currentStep === 4 && (
              <div className="absolute inset-x-4 max-w-xl mx-auto bg-white/95 backdrop-blur-md rounded-[28px] p-6 shadow-2xl border-2 border-[#2EE6CA] z-30 space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                  <Award className="w-8 h-8 text-[#17657A]" />
                </div>
                <h3 className="font-serif font-black text-2xl text-[#102A38]">
                  {locale === 'vi' ? 'Giải cứu thành công!' : 'Rescue Successful!'}
                </h3>
                <p className="text-sm text-[#12384B]/90 leading-relaxed">
                  {locale === 'vi'
                    ? 'Đội cứu hộ biển đã tiếp cận an toàn bằng ca-nô và kìm cắt chuyên dụng. Chú cá heo đã được giải thoát khỏi lưới ma và bơi trở lại đại dương! Bé đã nhận được huy hiệu Hiệp Sĩ Cứu Hộ Biển.'
                    : 'The professional marine response team arrived with specialized cutting gear. The dolphin is safely freed and swimming into the open sea! You have earned the Ocean Rescue Hero badge.'}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#102A38] text-white text-xs font-bold hover:bg-[#17657A] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{locale === 'vi' ? 'Thử lại nhiệm vụ' : 'Restart Mission'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/interactive/simulations')}
                    className="px-6 py-2.5 rounded-full bg-[#17657A] text-white text-xs font-bold hover:bg-[#124d5d] transition-colors cursor-pointer"
                  >
                    <span>{locale === 'vi' ? 'Về kho mô phỏng' : 'Simulations Catalog'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Right Spiral-Bound Field Notebook: Sổ nhiệm vụ */}
            <div className="absolute top-0 right-2 w-80 bg-[#faf8f2] rounded-[28px] shadow-2xl border border-amber-900/10 overflow-hidden flex flex-col transition-all duration-300 pl-3">
              {/* Spiral rings effect on left spine edge */}
              <div className="absolute left-1.5 top-4 bottom-4 flex flex-col justify-around pointer-events-none z-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-3.5 h-1.5 rounded-full bg-slate-400/70 border border-slate-500/50 shadow-xs -rotate-6" />
                ))}
              </div>
              <div className="p-4 border-b border-amber-900/10 flex items-center justify-between bg-amber-50/50">
                <div className="flex items-center gap-2 text-sm font-bold text-[#102A38]">
                  <BookOpen className="w-4 h-4 text-[#17657A]" />
                  <span>{locale === 'vi' ? 'Sổ nhiệm vụ' : 'Mission Journal'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotebookOpen(!isNotebookOpen)}
                  className="p-1 rounded-lg hover:bg-black/5 text-gray-500 cursor-pointer"
                >
                  <ChevronUp className={`w-4 h-4 transition-transform ${isNotebookOpen ? '' : 'rotate-180'}`} />
                </button>
              </div>

              {isNotebookOpen && (
                <div className="p-4 space-y-3">
                  <span className="text-xs font-bold text-[#17657A]/80 block">
                    {locale === 'vi' ? 'Những gì mình quan sát được' : 'What we have observed'}
                  </span>

                  {/* Field Sketch specimen card */}
                  <div className="rounded-2xl overflow-hidden border border-black/5 shadow-inner bg-[#fffdfa] p-2">
                    <img
                      src="/assets/generated/stations/ghost_net_field_sketch.jpg"
                      alt="Ghost Net Field Sketch"
                      className="w-full h-auto rounded-xl object-contain"
                    />
                  </div>

                  {/* Quick Observations list */}
                  <div className="text-[11px] text-[#12384B]/80 space-y-1 bg-amber-50/50 rounded-xl p-2.5 border border-amber-900/5">
                    <p>• <strong>{locale === 'vi' ? 'Đối tượng' : 'Target'}:</strong> {locale === 'vi' ? 'Cá heo mũi chai' : 'Bottlenose Dolphin'}</p>
                    <p>• <strong>{locale === 'vi' ? 'Mối đe dọa' : 'Threat'}:</strong> {locale === 'vi' ? 'Lưới đánh cá ma bị bỏ rơi' : 'Discarded ghost fishing net'}</p>
                    <p>• <strong>{locale === 'vi' ? 'Vị trí' : 'Location'}:</strong> {locale === 'vi' ? 'Bãi đá ghềnh triều' : 'Tidal rocky cove'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Floating Action Pills */}
          {currentStep !== 4 && (
            <div className="flex items-center justify-center gap-6 py-4 flex-wrap">
              {/* Pill 1: Báo người lớn (Coral) - NOAA Approved */}
              <button
                type="button"
                onClick={handleAlertAdults}
                className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#F67650] hover:bg-[#e06540] text-white font-bold text-base shadow-xl transition-transform active:scale-95 cursor-pointer border border-white/20"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span>{locale === 'vi' ? 'Báo người lớn' : 'Alert Adults'}</span>
                <span className="text-white/80">›</span>
              </button>

              {/* Pill 2: Quan sát thêm (Cyan/White) */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-white/95 hover:bg-white text-[#102A38] font-bold text-base shadow-xl transition-transform active:scale-95 cursor-pointer border border-black/10"
              >
                <div className="w-8 h-8 rounded-full bg-[#17657A] text-white flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <span>{locale === 'vi' ? 'Quan sát thêm' : 'Observe Further'}</span>
                <span className="text-gray-400">›</span>
              </button>

              {/* Pill 3 (Hidden trap / Educational check): Tự bơi ra cắt lưới */}
              <button
                type="button"
                onClick={handleSelfCutWarning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-colors cursor-pointer border border-red-300"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{locale === 'vi' ? 'Tự bơi ra cắt lưới?' : 'Swim out to cut net?'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </ActivityShell>
  );
}
