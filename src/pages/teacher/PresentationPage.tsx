import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { PresentationShell } from '../../shells/PresentationShell';
import { teacherSyncStore, TeacherSyncState, LessonStepId } from '../../services/teacherSyncStore';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  Sparkles,
  Volume2,
  CheckCircle2,
  Compass,
  ChevronRight,
  ChevronLeft,
  Eye,
  BookOpen,
  HelpCircle,
  Trophy,
  Bell,
} from 'lucide-react';

export function PresentationPage() {
  const { navigate } = useRouter();
  const [syncState, setSyncState] = useState<TeacherSyncState>(teacherSyncStore.getState());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTabOverride, setActiveTabOverride] = useState<LessonStepId | null>(null);

  // Effective step (controlled remotely by teacher or local override during presentation preview)
  const currentStep: LessonStepId = activeTabOverride ?? syncState.activeStep;

  // Real-time synchronization with Teacher Live Console via BroadcastChannel
  useEffect(() => {
    const unsub = teacherSyncStore.subscribe((newState) => {
      setSyncState(newState);
      if (activeTabOverride === null) {
        // Automatically follow teacher's console step
      }
    });
    return unsub;
  }, [activeTabOverride]);

  // Audio chime reaction when teacher rings attention bell remotely (Finding 3)
  useEffect(() => {
    if (syncState.attentionAlert) {
      oceanAudio.playAttentionChime(659.25, 0.4);
    }
  }, [syncState.attentionAlertTimestamp, syncState.attentionAlert]);

  // Handle Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Keyboard navigation for presentation remote clickers (Left/Right arrows, 1-5 keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        const next = Math.min(5, currentStep + 1) as LessonStepId;
        setActiveTabOverride(next);
        teacherSyncStore.setStep(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        const prev = Math.max(1, currentStep - 1) as LessonStepId;
        setActiveTabOverride(prev);
        teacherSyncStore.setStep(prev);
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const step = parseInt(e.key, 10) as LessonStepId;
        setActiveTabOverride(step);
        teacherSyncStore.setStep(step);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  // Audio speech narration for classroom
  const handlePlayAudio = (text: string) => {
    oceanAudio.speak(text);
  };

  return (
    <PresentationShell
      joinCode={syncState.classCode}
      topicTitle={syncState.topicTitle}
      stepIndicator={`Bước ${currentStep}/5: ${getStepShortLabel(currentStep)}`}
      isFullscreen={isFullscreen}
      onToggleFullscreen={handleToggleFullscreen}
      onExit={() => navigate('/teacher/live')}
    >
      {/* 
        NO learner bottom nav, NO "An" avatar as mandated by REFERENCE_CORRECTIONS.md line 31!
        Passive, high-contrast classroom presentation display with dynamic step views.
      */}
      <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
        
        {/* 
          Visual Focus Indicator & Attention Halo (Finding 3):
          When teacher triggers attention bell in TeacherLiveConsolePage,
          this renders a gentle luminous oceanic glow and focus pill banner.
        */}
        {syncState.attentionAlert && (
          <>
            {/* Edge Glow Ripple Halo */}
            <div
              className="absolute inset-0 z-50 pointer-events-none ring-4 ring-inset ring-[#2EE6CA]/60 shadow-[inset_0_0_90px_rgba(46,230,202,0.45)] animate-pulse transition-opacity duration-500"
              aria-hidden="true"
            />

            {/* Floating Focus Notification Pill */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3.5 px-6 py-3 rounded-full bg-[#071E2E]/95 backdrop-blur-xl border-2 border-[#2EE6CA] text-white shadow-[0_10px_40px_rgba(46,230,202,0.5)]">
                <div className="w-8 h-8 rounded-full bg-[#2EE6CA]/20 border border-[#2EE6CA] flex items-center justify-center text-[#2EE6CA] shrink-0">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div className="text-left">
                  <div className="font-serif font-black text-sm sm:text-base text-white tracking-[-0.01em]">
                    Cả lớp cùng chú ý lên màn hình nhé!
                  </div>
                  <div className="text-[11px] text-[#2EE6CA] font-bold">
                    Cô giáo đang rung chuông tập trung
                  </div>
                </div>
                <span className="text-base animate-pulse">✨</span>
              </div>
            </div>
          </>
        )}

        {/* Step 1: Câu chuyện mở đầu (Story & Warm-up) */}
        {currentStep === 1 && (
          <div className="relative w-full h-full flex items-center justify-center p-8 lg:p-16 animate-in fade-in duration-300">
            {/* Cinematic Ocean Backdrop */}
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/bluesteam/bs-landing-ocean-bg-v01.jpg"
                alt="Đại dương bao la"
                className="w-full h-full object-cover brightness-[0.65] contrast-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041624] via-[#041624]/40 to-transparent" />
            </div>

            {/* Story Presentation Center Card */}
            <div className="relative z-10 max-w-4xl w-full bg-[#071E2E]/85 backdrop-blur-xl border border-white/20 rounded-[32px] p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2EE6CA]/15 border border-[#2EE6CA]/30 text-[#2EE6CA] text-sm font-black uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Bước 1: Câu Chuyện Khởi Động</span>
              </div>

              <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-[-0.02em] leading-tight">
                Hành Trình Vượt Trùng Dương
              </h1>

              <p className="text-lg sm:text-2xl text-slate-200 font-sans leading-relaxed max-w-2xl mx-auto">
                "Chào các bạn nhỏ lớp Sao Biển! Bạn Rùa Xanh vừa hoàn thành chuyến bơi 2.000 cây số từ biển sâu về bờ biển quê hương. Bạn đang tìm một nơi thật an toàn để kiếm ăn và nghỉ ngơi..."
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    handlePlayAudio(
                      'Chào các bạn nhỏ lớp Sao Biển! Bạn Rùa Xanh vừa hoàn thành chuyến bơi hai nghìn cây số từ biển sâu về bờ biển quê hương. Các con hãy cùng cô khám phá xem bạn Rùa thích sống ở đâu nhé!'
                    )
                  }
                  className="px-6 py-3.5 rounded-2xl bg-[#F67650] hover:bg-[#ff845e] text-white font-black text-base flex items-center gap-2.5 shadow-lg shadow-[#F67650]/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Kể chuyện cho cả lớp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTabOverride(2);
                    teacherSyncStore.setStep(2);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Chuyển sang Quan sát Rùa 3D</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Quan sát Rùa biển 3D (Specimen Deep-dive) */}
        {currentStep === 2 && (
          <div className="relative w-full h-full flex flex-col justify-between p-8 lg:p-12 animate-in fade-in duration-300">
            {/* Background */}
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/generated/backgrounds/ocean_split_beach.jpg"
                alt="Đại dương 3D"
                className="w-full h-full object-cover brightness-[0.55]"
              />
              <div className="absolute inset-0 bg-[#041624]/60 backdrop-blur-[2px]" />
            </div>

            {/* Top Heading */}
            <div className="relative z-10 text-center space-y-2 max-w-3xl mx-auto pt-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2EE6CA]/15 border border-[#2EE6CA]/30 text-[#2EE6CA] text-xs font-black uppercase tracking-wider">
                <Eye className="w-4 h-4" />
                <span>Bước 2: Khám Phá Sinh Học Biển</span>
              </div>
              <h1 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-[-0.02em]">
                Cấu Tạo Cơ Thể Của Rùa Xanh
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                Quan sát các đặc điểm tiến hóa giúp rùa thích nghi với đời sống bơi lội đại dương
              </p>
            </div>

            {/* Center 3D Specimen Interactive Showcase */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-4">
              <div className="relative w-full max-w-4xl aspect-[16/9] flex items-center justify-center">
                {/* 3D Specimen Image with oceanic glow */}
                <div className="relative group cursor-grab">
                  <div className="absolute -inset-4 bg-radial from-[#2EE6CA]/30 via-transparent to-transparent blur-2xl rounded-full animate-pulse" />
                  <img
                    src="/assets/generated/creatures/turtle_isolated.png"
                    alt="Rùa Biển 3D"
                    className="relative w-72 sm:w-96 lg:w-[460px] object-contain drop-shadow-[0_15px_45px_rgba(46,230,202,0.45)] transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Callout 1: Mai rùa rẽ nước */}
                <div className="absolute top-8 left-4 lg:left-12 bg-[#071E2E]/90 backdrop-blur-md border border-[#2EE6CA]/40 p-4 rounded-2xl shadow-xl max-w-[220px] text-left animate-in slide-in-from-left duration-500">
                  <div className="flex items-center gap-2 text-[#2EE6CA] font-black text-sm mb-1">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Mai Dẹp Khí Động</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Giảm tối đa lực cản nước, giúp rùa lướt êm với tốc độ 35 km/h.
                  </p>
                </div>

                {/* Callout 2: Vây trước hình mái chèo */}
                <div className="absolute bottom-12 left-6 lg:left-16 bg-[#071E2E]/90 backdrop-blur-md border border-[#2EE6CA]/40 p-4 rounded-2xl shadow-xl max-w-[220px] text-left animate-in slide-in-from-left duration-700">
                  <div className="flex items-center gap-2 text-[#2EE6CA] font-black text-sm mb-1">
                    <Compass className="w-4 h-4 shrink-0" />
                    <span>Vây Chèo Mạnh Mẽ</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Chi trước tiến hóa thành hai mái chèo lớn tạo lực đẩy vượt trội.
                  </p>
                </div>

                {/* Callout 3: Hô hấp bằng phổi */}
                <div className="absolute top-10 right-4 lg:right-12 bg-[#071E2E]/90 backdrop-blur-md border border-[#F67650]/40 p-4 rounded-2xl shadow-xl max-w-[220px] text-left animate-in slide-in-from-right duration-500">
                  <div className="flex items-center gap-2 text-[#F67650] font-black text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Thở Bằng Phổi</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Rùa biển phải ngoi lên mặt nước hít thở trước khi lặn sâu hàng giờ.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Step Advance Bar */}
            <div className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full bg-[#071E2E]/80 backdrop-blur-md px-6 py-3 rounded-[28px] border border-white/15">
              <span className="text-sm font-medium text-slate-300">
                Đặc điểm khoa học STEAM: Sinh vật học & Khí động lực học
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTabOverride(3);
                  teacherSyncStore.setStep(3);
                }}
                className="px-5 py-2 rounded-xl bg-[#2EE6CA] hover:bg-[#28cfb5] text-[#041624] font-black text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Đến Thao Tác Ghép Nơi Sống</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 
          Step 3: Ghép nơi sống (Habitat Matching)
          EXACT REFERENCE MOCKUP SCENE FROM C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-teacher-presentation.png
        */}
        {currentStep === 3 && (
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden animate-in fade-in duration-300">
            {/* Full-bleed Coastal Underwater Background with Seagrass, Sand & Coral */}
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/generated/backgrounds/habitat_placement_bg.jpg"
                alt="Hệ sinh thái đại dương ven bờ"
                className="w-full h-full object-cover object-center"
              />
              {/* Subtle water caustics overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#041624]/30 via-transparent to-[#041624]/40 pointer-events-none" />
            </div>

            {/* Main Stage Title: "Tìm nơi sống cho bạn nhỏ" (High contrast, Playfair/Noto Serif) */}
            <div className="relative z-20 text-center pt-20 px-4">
              <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-[#102A38] tracking-[-0.02em] drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]">
                Tìm nơi sống cho bạn nhỏ
              </h1>
              <p className="text-base sm:text-lg font-bold text-[#102A38]/90 max-w-xl mx-auto mt-2 drop-shadow-[0_1px_8px_rgba(255,255,255,0.8)]">
                {syncState.stepDescription}
              </p>
            </div>

            {/* Interactive Habitat Zones & Floating Glowing Turtle */}
            <div className="relative z-20 flex-1 w-full max-w-6xl mx-auto px-6 flex items-center justify-between">
              
              {/* Zone 1: Bãi cát ngầm (Left) */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-48 sm:w-56 h-28 sm:h-32 rounded-[50%] border-4 border-dashed transition-all duration-300 flex items-center justify-center ${
                    syncState.placedSlots.sand
                      ? 'border-[#2EE6CA] bg-[#2EE6CA]/20 shadow-[0_0_30px_rgba(46,230,202,0.4)]'
                      : 'border-white/80 bg-white/10 hover:border-white'
                  }`}
                >
                  <span className="text-white font-extrabold text-sm drop-shadow-md bg-black/40 px-3 py-1 rounded-full">
                    Bãi cát ngầm
                  </span>
                </div>
              </div>

              {/* Center Floating Turtle & Zone 2: Thảm cỏ biển */}
              <div className="relative flex flex-col items-center">
                {/* Floating Sea Turtle with luminous cyan glow contour matching mockup */}
                <div className="relative -mb-6 z-30 transition-transform duration-700 hover:scale-110">
                  <div className="absolute -inset-4 bg-radial from-[#2EE6CA]/50 via-transparent to-transparent blur-xl rounded-full animate-pulse" />
                  <img
                    src="/assets/generated/creatures/turtle_isolated.png"
                    alt="Rùa biển bơi lội"
                    className="relative w-56 sm:w-72 lg:w-80 object-contain drop-shadow-[0_0_30px_rgba(46,230,202,0.85)]"
                  />
                </div>

                {/* Target dashed oval slot on seagrass */}
                <div
                  className={`w-64 sm:w-80 h-32 sm:h-36 rounded-[50%] border-4 border-dashed transition-all duration-300 flex items-center justify-center ${
                    syncState.placedSlots.seagrass
                      ? 'border-[#2EE6CA] bg-[#2EE6CA]/25 shadow-[0_0_45px_rgba(46,230,202,0.6)]'
                      : 'border-white/80 bg-white/10'
                  }`}
                >
                  <span className="text-white font-extrabold text-base drop-shadow-md bg-black/50 px-4 py-1 rounded-full">
                    Thảm cỏ biển (Nơi sống)
                  </span>
                </div>
              </div>

              {/* Zone 3: Rạn san hô (Right) */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-48 sm:w-56 h-28 sm:h-32 rounded-[50%] border-4 border-dashed transition-all duration-300 flex items-center justify-center ${
                    syncState.placedSlots.coral
                      ? 'border-[#2EE6CA] bg-[#2EE6CA]/20 shadow-[0_0_30px_rgba(46,230,202,0.4)]'
                      : 'border-white/80 bg-white/10 hover:border-white'
                  }`}
                >
                  <span className="text-white font-extrabold text-sm drop-shadow-md bg-black/40 px-3 py-1 rounded-full">
                    Rạn san hô
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Floating Creature Selection Dock matching mockup */}
            <div className="relative z-30 pb-8 flex flex-col items-center gap-3">
              <div className="bg-[#071E2E]/80 backdrop-blur-xl border border-white/25 rounded-3xl p-3 shadow-2xl flex items-center gap-4">
                {/* 1. Crab */}
                <button
                  type="button"
                  onClick={() => teacherSyncStore.selectCreature('crab')}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all cursor-pointer ${
                    syncState.selectedCreature === 'crab'
                      ? 'bg-[#2EE6CA] text-[#041624] font-black shadow-lg shadow-[#2EE6CA]/40 scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white font-bold'
                  }`}
                >
                  <img
                    src="/assets/generated/creatures/crab_isolated.png"
                    alt="Cua biển"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-sm">Cua</span>
                </button>

                {/* 2. Turtle (Active in mockup) */}
                <button
                  type="button"
                  onClick={() => teacherSyncStore.selectCreature('turtle')}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all cursor-pointer ${
                    syncState.selectedCreature === 'turtle'
                      ? 'bg-[#2EE6CA] text-[#041624] font-black shadow-lg shadow-[#2EE6CA]/40 scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white font-bold'
                  }`}
                >
                  <img
                    src="/assets/generated/creatures/turtle_isolated.png"
                    alt="Rùa biển"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-sm">Rùa biển</span>
                </button>

                {/* 3. Clownfish */}
                <button
                  type="button"
                  onClick={() => teacherSyncStore.selectCreature('clownfish')}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all cursor-pointer ${
                    syncState.selectedCreature === 'clownfish'
                      ? 'bg-[#2EE6CA] text-[#041624] font-black shadow-lg shadow-[#2EE6CA]/40 scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white font-bold'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-400 flex items-center justify-center text-xs">
                    🐠
                  </div>
                  <span className="text-sm">Cá hề</span>
                </button>
              </div>

              {/* Status pill: số bạn đã hoàn thành */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#041624]/75 backdrop-blur-md text-xs font-bold text-[#2EE6CA] border border-[#2EE6CA]/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{syncState.habitatCompletedCount}/{syncState.totalStudents} bé đã ghép thành công</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Đố vui tương tác cả lớp (Classroom Quiz Polling) */}
        {currentStep === 4 && (
          <div className="relative w-full h-full flex flex-col justify-between p-8 lg:p-12 animate-in fade-in duration-300">
            {/* Background */}
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/bluesteam/bs-landing-ocean-bg-v01.jpg"
                alt="Đại dương bao la"
                className="w-full h-full object-cover brightness-[0.45]"
              />
              <div className="absolute inset-0 bg-radial from-transparent via-[#041624]/60 to-[#041624]" />
            </div>

            {/* Quiz Question Card */}
            <div className="relative z-10 max-w-4xl mx-auto w-full pt-16 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F67650]/20 border border-[#F67650]/40 text-[#F67650] text-sm font-black uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Thử Thách Cả Lớp</span>
              </div>

              <h1 className="font-serif font-black text-3xl sm:text-5xl text-white tracking-[-0.02em] leading-tight">
                {syncState.quiz.questionText}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base">
                Cả lớp hãy bấm chọn phương án trên máy tính bảng của mình nhé!
              </p>
            </div>

            {/* Voting Options (Real-time Bars) */}
            <div className="relative z-10 max-w-3xl mx-auto w-full space-y-4 my-auto">
              {syncState.quiz.options.map((opt) => {
                const percentage = Math.round((opt.votes / Math.max(1, syncState.quiz.totalVotes)) * 100);
                const isWinner = opt.isCorrect && syncState.quiz.isRevealed;

                return (
                  <div
                    key={opt.id}
                    onClick={() => teacherSyncStore.submitQuizVote(opt.id)}
                    className={`relative overflow-hidden rounded-2xl p-5 border transition-all cursor-pointer select-none ${
                      isWinner
                        ? 'border-emerald-400 bg-emerald-950/70 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                        : 'border-white/20 bg-[#071E2E]/80 hover:bg-[#071E2E]'
                    }`}
                  >
                    {/* Live Progress Fill Bar */}
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                        isWinner ? 'bg-emerald-500/30' : 'bg-[#17657A]/40'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full font-black text-sm flex items-center justify-center ${
                            isWinner ? 'bg-emerald-400 text-[#041624]' : 'bg-white/15 text-white'
                          }`}
                        >
                          {opt.id.slice(-1).toUpperCase()}
                        </span>
                        <span className="font-bold text-lg text-white">{opt.label}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-xl text-white">
                          {opt.votes} phiếu ({percentage}%)
                        </span>
                        {isWinner && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-[#041624] font-black text-xs">
                            Đúng
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Quiz Control Bar */}
            <div className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full bg-[#071E2E]/85 backdrop-blur-md px-6 py-3 rounded-[28px] border border-white/20">
              <span className="text-sm text-slate-300 font-bold">
                Tổng cộng: {syncState.quiz.totalVotes} / {syncState.totalStudents} phiếu bình chọn
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => teacherSyncStore.toggleQuizReveal()}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
                >
                  {syncState.quiz.isRevealed ? 'Ẩn đáp án' : 'Công bố đáp án đúng'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTabOverride(5);
                    teacherSyncStore.setStep(5);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#2EE6CA] hover:bg-[#28cfb5] text-[#041624] font-black text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Xem Lễ Trao Huy Hiệu</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Vinh danh & Trao Huy hiệu STEAM */}
        {currentStep === 5 && (
          <div className="relative w-full h-full flex flex-col justify-between p-8 lg:p-14 text-center animate-in fade-in duration-300">
            {/* Background with golden celebratory ocean lights */}
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/bluesteam/bs-landing-ocean-bg-v01.jpg"
                alt="Vinh danh lớp học"
                className="w-full h-full object-cover brightness-[0.55]"
              />
              <div className="absolute inset-0 bg-radial from-amber-500/20 via-[#041624]/60 to-[#041624]" />
            </div>

            {/* Heading */}
            <div className="relative z-10 pt-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-sm font-black uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                <span>Lớp Học Xuất Sắc</span>
              </div>
              <h1 className="font-serif font-black text-4xl sm:text-6xl text-white tracking-[-0.02em]">
                Chúc Mừng Lớp Sao Biển!
              </h1>
              <p className="text-slate-200 text-lg max-w-xl mx-auto">
                24/24 nhà thám hiểm nhí đã hoàn thành trọn vẹn 5 nhiệm vụ sinh thái và khám phá nơi sống của Rùa Biển!
              </p>
            </div>

            {/* 3 Core Badges Awarded to Class */}
            <div className="relative z-10 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 my-auto">
              {/* Badge 1 */}
              <div className="bg-[#071E2E]/80 backdrop-blur-xl border border-amber-400/30 rounded-3xl p-6 text-center space-y-3 shadow-xl">
                <div className="w-18 h-18 mx-auto rounded-full bg-amber-400/15 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(251,191,36,0.4)]">
                  🐢
                </div>
                <h3 className="font-serif font-black text-lg text-white">Bạn Của Rùa Xanh</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hiểu rõ đặc điểm sinh học và môi trường sống của rùa biển
                </p>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs">
                  24 bé đạt được
                </span>
              </div>

              {/* Badge 2 */}
              <div className="bg-[#071E2E]/80 backdrop-blur-xl border border-[#2EE6CA]/30 rounded-3xl p-6 text-center space-y-3 shadow-xl">
                <div className="w-18 h-18 mx-auto rounded-full bg-[#2EE6CA]/15 border-2 border-[#2EE6CA] flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(46,230,202,0.4)]">
                  🌿
                </div>
                <h3 className="font-serif font-black text-lg text-white">Bảo Vệ Cỏ Biển</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ghép đúng môi trường sống và giữ sạch bãi biển quê hương
                </p>
                <span className="inline-block px-3 py-1 rounded-full bg-[#2EE6CA]/20 text-[#2EE6CA] font-bold text-xs">
                  24 bé đạt được
                </span>
              </div>

              {/* Badge 3 */}
              <div className="bg-[#071E2E]/80 backdrop-blur-xl border border-[#F67650]/30 rounded-3xl p-6 text-center space-y-3 shadow-xl">
                <div className="w-18 h-18 mx-auto rounded-full bg-[#F67650]/15 border-2 border-[#F67650] flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(246,118,80,0.4)]">
                  🎨
                </div>
                <h3 className="font-serif font-black text-lg text-white">Họa Sĩ Đại Dương</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sáng tạo tranh sáp và mô hình rạn san hô diệu kỳ
                </p>
                <span className="inline-block px-3 py-1 rounded-full bg-[#F67650]/20 text-[#F67650] font-bold text-xs">
                  24 bé đạt được
                </span>
              </div>
            </div>

            {/* Bottom Final Action Bar */}
            <div className="relative z-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/teacher/results')}
                className="px-8 py-3.5 rounded-2xl bg-[#2EE6CA] hover:bg-[#28cfb5] text-[#041624] font-black text-base shadow-xl shadow-[#2EE6CA]/30 transition-transform active:scale-95 cursor-pointer"
              >
                <span>Xem Báo Cáo Buổi Học & Xuất PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* Minimal Presentation Step Bar (Floating bottom pill for classroom remote control) */}
        <footer className="relative z-30 mx-auto mb-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const prev = Math.max(1, currentStep - 1) as LessonStepId;
              setActiveTabOverride(prev);
              teacherSyncStore.setStep(prev);
            }}
            className="p-1 text-slate-300 hover:text-white cursor-pointer"
            title="Bước trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  setActiveTabOverride(step as LessonStepId);
                  teacherSyncStore.setStep(step as LessonStepId);
                }}
                className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer ${
                  currentStep === step
                    ? 'bg-[#2EE6CA] text-[#041624]'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {step}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              const next = Math.min(5, currentStep + 1) as LessonStepId;
              setActiveTabOverride(next);
              teacherSyncStore.setStep(next);
            }}
            className="p-1 text-slate-300 hover:text-white cursor-pointer"
            title="Bước tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>

      </div>
    </PresentationShell>
  );
}

function getStepShortLabel(step: LessonStepId): string {
  switch (step) {
    case 1:
      return 'Khởi động';
    case 2:
      return 'Quan sát 3D';
    case 3:
      return 'Ghép nơi sống';
    case 4:
      return 'Đố vui';
    case 5:
      return 'Vinh danh';
  }
}
