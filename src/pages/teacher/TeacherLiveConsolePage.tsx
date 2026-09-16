import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { TeacherShell } from '../../shells/TeacherShell';
import { oceanShowcaseStore } from '../../demo/storage/oceanShowcaseStore';
import { teacherSyncStore } from '../../services/teacherSyncStore';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  Tv,
  Square,
  Play,
  Pause,
  Volume2,
  Lightbulb,
  Maximize2,
  Edit3,
  MessageSquare,
  Users,
  ChevronRight,
  Bell,
} from 'lucide-react';

export interface ConsoleStep {
  id: number;
  title: string;
  desc: string;
}

export const CANONICAL_LIVE_CONSOLE_STEPS: ConsoleStep[] = [
  {
    id: 1,
    title: 'Quan sát và khám phá (Khởi động)',
    desc: 'Xem hình ảnh, nhận biết các sinh vật và lắng nghe câu chuyện về Rùa Xanh',
  },
  {
    id: 2,
    title: 'Thảo luận cùng lớp (Quan sát 3D)',
    desc: 'Nói về những sinh vật em nhìn thấy và phân tích cấu tạo rùa biển thích nghi',
  },
  {
    id: 3,
    title: 'Hoạt động tương tác (Ghép nơi sống)',
    desc: 'Kéo thả để sắp xếp sinh vật vào thảm cỏ biển, bãi cát hoặc rạn san hô',
  },
  {
    id: 4,
    title: 'Củng cố và mở rộng (Thử thách lớp học)',
    desc: 'Bình chọn câu trả lời đúng trên máy tính bảng để giải cứu sinh vật biển',
  },
  {
    id: 5,
    title: 'Vinh danh & Trao huy hiệu STEAM',
    desc: 'Chúc mừng cả lớp đã hoàn thành bài học và đúc kết kiến thức bảo vệ biển',
  },
];

export const CANONICAL_CONSOLE_STEPS = CANONICAL_LIVE_CONSOLE_STEPS;

export function TeacherLiveConsolePage() {
  const { navigate } = useRouter();

  // Synchronized state with oceanShowcaseStore & BroadcastChannel
  const [sessionState, setSessionState] = useState(oceanShowcaseStore.getState());
  const [syncState, setSyncState] = useState(teacherSyncStore.getState());
  const [teacherNote, setTeacherNote] = useState('');
  const [hintActive, setHintActive] = useState(false);
  const [isBellActive, setIsBellActive] = useState(false);

  useEffect(() => {
    const unsub1 = oceanShowcaseStore.subscribe((newState) => {
      setSessionState(newState);
    });
    const unsub2 = teacherSyncStore.subscribe((newSync) => {
      setSyncState(newSync);
      setIsBellActive(Boolean(newSync.attentionAlert));
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleStepChange = (step: number) => {
    oceanShowcaseStore.setActiveStep(step);
    if (step >= 1 && step <= 5) {
      teacherSyncStore.setStep(step as 1 | 2 | 3 | 4 | 5);
    }
    oceanAudio.playChime(523.25, 0.2);
  };

  const handleTogglePlayPause = () => {
    const nextRunning = !sessionState.isSimulationRunning;
    oceanShowcaseStore.setSimulationRunning(nextRunning);
    oceanAudio.playChime(nextRunning ? 587.33 : 440, 0.3);
  };

  const handleTriggerAttentionBell = () => {
    oceanAudio.playAttentionChime(659.25, 0.4);
    teacherSyncStore.triggerAttentionBell(3500);
  };

  const handleReplayInstruction = () => {
    oceanAudio.speak(
      'Các con hãy quan sát kỹ xem rùa biển đang tìm thức ăn gì dưới đáy biển nhé!'
    );
  };

  const handleTriggerHint = () => {
    setHintActive(true);
    oceanAudio.speak('Gợi ý cho cả lớp: Rùa biển rất thích ăn cỏ biển tươi non ở vùng ven bờ!');
    setTimeout(() => setHintActive(false), 4000);
  };

  const handleOpenPresentation = () => {
    window.open('/presentation', '_blank');
  };

  const handleEndSession = () => {
    oceanShowcaseStore.endSession();
    teacherSyncStore.endSession();
    navigate('/teacher/results');
  };

  const steps = CANONICAL_LIVE_CONSOLE_STEPS;

  return (
    <TeacherShell activeNav="live">
      <div className="space-y-5">
        {/* Top Header & Session Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => navigate('/teacher')}
                className="text-[#17657A] hover:text-[#102A38] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Bài giảng</span>
              </button>
              <span>&gt;</span>
              <span className="text-[#102A38] font-bold">Khám phá nơi sống</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#102A38] tracking-[-0.02em]">
              Khám phá nơi sống
            </h1>

            <p className="text-xs sm:text-sm text-[#17657A] font-semibold">
              Chủ đề: Cỏ biển và hệ sinh thái ven bờ
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Dedicated Attention Bell Quick Button (Finding 3) */}
            <button
              type="button"
              onClick={handleTriggerAttentionBell}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer ${
                isBellActive
                  ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-pulse'
                  : 'bg-white hover:bg-amber-50/70 border-slate-200 text-[#102A38]'
              }`}
              title="Rung chuông tập trung sự chú ý của cả lớp"
              aria-label="Chuông tập trung"
            >
              <Bell className={`w-4 h-4 ${isBellActive ? 'text-amber-600 animate-bounce' : 'text-amber-500'}`} />
              <span>{isBellActive ? 'Đang rung chuông...' : 'Chuông tập trung'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPresentation}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#102A38] font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
              title="Mở màn hình chiếu lớn cho học sinh"
            >
              <Tv className="w-4 h-4 text-[#17657A]" />
              <span>Trình chiếu</span>
            </button>

            <button
              type="button"
              onClick={handleEndSession}
              className="px-5 py-2.5 rounded-xl bg-[#102A38] hover:bg-[#17657A] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Kết thúc</span>
            </button>
          </div>
        </div>

        {/* Top Main 2-Column: Live Visual Scene (7 cols) + Stepper & Controls (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Major Preview Area */}
          <div className="lg:col-span-7 bg-white rounded-[28px] p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div className="relative rounded-[22px] overflow-hidden bg-sky-950 aspect-[16/10] flex flex-col justify-between p-4 shadow-inner text-white select-none">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{
                  backgroundImage: `url(${
                    syncState.activeStep === 1
                      ? '/assets/generated/creatures/green_turtle_hero.jpg'
                      : syncState.activeStep === 2
                      ? '/assets/card_turtle.jpg'
                      : syncState.activeStep === 3
                      ? '/assets/generated/backgrounds/habitat_placement_bg.jpg'
                      : syncState.activeStep === 4
                      ? '/assets/card_kelp.jpg'
                      : '/assets/generated/craft/ocean_diorama_wood_tray_craft.jpg'
                  })`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/75 via-transparent to-black/30" />

              {/* Top status tag */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      sessionState.isSimulationRunning
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>
                    {sessionState.isSimulationRunning ? 'Đang phát trực tiếp' : 'Tạm dừng'}
                  </span>
                </span>

                <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                  Mã lớp: {sessionState.classCode}
                </span>
              </div>

              {/* Bottom tag & Fullscreen button */}
              <div className="relative z-10 flex items-center justify-between pt-2">
                <span className="px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md text-xs font-bold text-white border border-white/20">
                  {syncState.activeStep === 1 && '📍 Bước 1: Khởi động & Quan sát rùa'}
                  {syncState.activeStep === 2 && '📍 Bước 2: Quan sát 3D thích nghi'}
                  {syncState.activeStep === 3 && '📍 Bước 3: Thảm cỏ biển ven bờ'}
                  {syncState.activeStep === 4 && '📍 Bước 4: Thử thách lớp học'}
                  {syncState.activeStep === 5 && '📍 Bước 5: Vinh danh & Trao huy hiệu'}
                </span>

                <button
                  type="button"
                  onClick={handleOpenPresentation}
                  className="w-8 h-8 rounded-xl bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 cursor-pointer transition-colors"
                  aria-label="Xem toàn màn hình"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Hoạt động trong bài giảng + Điều khiển */}
          <div className="lg:col-span-5 bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-5">
            {/* Stepper Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h2 className="font-serif font-bold text-base text-[#102A38]">
                  Hoạt động trong bài giảng
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {steps.length} bước
                </span>
              </div>

              {/* Vertical Stepper with connecting line */}
              <div className="relative pt-3 space-y-3">
                {/* Connecting dotted line */}
                <div className="absolute left-4 top-6 bottom-6 w-[2px] border-l-2 border-dashed border-slate-200" />

                {steps.map((st) => {
                  const isActive = st.id === (syncState.activeStep ?? sessionState.activeStep);
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleStepChange(st.id)}
                      className={`relative z-10 p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-sky-50/70 border-[#17657A] shadow-xs'
                          : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-[#102A38] text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {st.id}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs sm:text-sm text-[#102A38] truncate">
                            {st.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {st.desc}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Điều khiển hoạt động */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Điều khiển hoạt động
                </span>
                {isBellActive && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 animate-pulse">
                    <Bell className="w-3 h-3" />
                    <span>Chuông đang phát</span>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={handleTogglePlayPause}
                  className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#102A38] border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {sessionState.isSimulationRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-[#102A38]" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-[#102A38]" />
                      <span>Tiếp tục</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTriggerAttentionBell}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isBellActive
                      ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
                      : 'bg-amber-50/70 hover:bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                  title="Rung chuông tập trung học sinh"
                >
                  <Bell className={`w-3.5 h-3.5 ${isBellActive ? 'text-amber-600 animate-bounce' : 'text-amber-500'}`} />
                  <span>Chuông chú ý</span>
                </button>

                <button
                  type="button"
                  onClick={handleReplayInstruction}
                  className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#102A38] border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#17657A]" />
                  <span>Nghe lại</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerHint}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    hintActive
                      ? 'bg-orange-100 text-[#F67650] border-orange-300 animate-pulse'
                      : 'bg-orange-50/70 hover:bg-orange-100 text-[#F67650] border-orange-200'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Hiện gợi ý</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 2-Column: Ghi chú của cô (6 cols) + Phản hồi của học sinh (6 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Card: Ghi chú của cô */}
          <div className="lg:col-span-6 bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-3 flex flex-col">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Edit3 className="w-4 h-4 text-[#17657A]" />
              <h2 className="font-serif font-bold text-base text-[#102A38]">
                Ghi chú của cô
              </h2>
            </div>
            <textarea
              rows={3}
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              placeholder="Nhập ghi chú trong quá trình tổ chức hoạt động..."
              className="flex-1 w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17657A]/30 resize-none leading-relaxed"
            />
          </div>

          {/* Right Card: Phản hồi của học sinh */}
          <div className="lg:col-span-6 bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#17657A]" />
                <h2 className="font-serif font-bold text-base text-[#102A38]">
                  Phản hồi của học sinh
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {sessionState.connectedCount}/{sessionState.totalStudents} bé đã tham gia
              </span>
            </div>

            <div className="flex-1 p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center text-xs text-slate-400">
              <Users className="w-6 h-6 text-slate-300 mb-1" />
              <span>Chưa có phản hồi mới từ học sinh.</span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Các câu trả lời và giọng ghi âm của bé sẽ xuất hiện trực tiếp tại đây.
              </span>
            </div>
          </div>
        </div>
      </div>
    </TeacherShell>
  );
}
