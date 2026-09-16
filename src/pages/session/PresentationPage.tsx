import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { BlueSteamLogo } from '../../shared/components/BlueSteamLogo';
import { getStoredConcept, ConceptKey } from '../../showcase/registry';
import { OceanSimulationView } from '../../experiences/simulation/OceanSimulationView';
import { oceanShowcaseStore } from '../../demo/storage/oceanShowcaseStore';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  Volume2,
  Check,
  Wind,
  Eye,
  ArrowRight,
} from 'lucide-react';

export function PresentationPage() {
  const { query, navigate } = useRouter();

  const activeConcept = (query.concept as ConceptKey) || getStoredConcept('presentation');

  // Synchronized state with teacher live console
  const [sessionState, setSessionState] = useState(oceanShowcaseStore.getState());

  useEffect(() => {
    const unsub = oceanShowcaseStore.subscribe((newState) => {
      setSessionState(newState);
    });
    return unsub;
  }, []);

  const handleSpeak = () => {
    oceanAudio.speak('Gió đổi, phao đi đâu? Hãy cùng quan sát xem phao sẽ trôi về đâu nhé!');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col justify-between select-none">
      {/* Presentation Clean Top Bar */}
      <header className="bg-white/95 backdrop-blur-md text-sky-950 px-8 py-4 shadow-md flex items-center justify-between z-30">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/teacher/live')}
            className="cursor-pointer hover:opacity-90 transition p-1 -ml-1"
            aria-label="Về bàn làm việc giáo viên"
          >
            <BlueSteamLogo size="sm" />
          </button>
        </div>

        {/* 5-Step Horizontal Tracker */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </span>
            <span>1. Xem</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </span>
            <span>2. Khám phá</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </span>
            <span>3. Dự đoán</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-950 font-bold bg-sky-100 px-3 py-1 rounded-full border border-sky-300 shadow-sm">
            <span className="w-5 h-5 rounded-full bg-sky-700 text-white flex items-center justify-center text-xs">
              4
            </span>
            <span>4. Thử nghiệm</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
            <span className="w-5 h-5 rounded-full border border-neutral-300 flex items-center justify-center text-xs">
              5
            </span>
            <span>5. Chia sẻ</span>
          </div>
        </div>

        {/* Audio speaker button */}
        <button
          onClick={handleSpeak}
          className="p-2.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-900 transition-colors cursor-pointer"
          title="Âm thanh lớp học"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </header>

      {/* RENDER CONCEPT A: FULL CINEMATIC SCREEN */}
      {activeConcept === 'a' && (
        <main className="relative flex-1 flex flex-col justify-between p-6 sm:p-10 overflow-hidden">
          {/* Simulation Display taking full container */}
          <div className="absolute inset-0">
            <OceanSimulationView
              mode="cross-section"
              windDirection={sessionState.windDirection}
              windStrength={sessionState.windStrength}
              isRunning={sessionState.isSimulationRunning}
              showArrows={sessionState.showArrows}
            />
          </div>

          {/* Floating Top-Left Card */}
          <div className="relative z-20 self-start bg-white/95 backdrop-blur-md rounded-3xl p-6 text-sky-950 shadow-2xl border border-sky-100 max-w-md space-y-2">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-serif font-bold text-sky-950 leading-tight">
                Gió đổi, phao đi đâu?
              </h1>
              <button
                onClick={handleSpeak}
                className="p-2 rounded-full bg-sky-100 text-sky-900 shadow-sm"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-medium text-sky-700">
              Thử nghiệm dòng nước di chuyển
            </p>
          </div>

          {/* Floating Bottom Banner */}
          <div className="relative z-20 self-center w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl p-5 text-sky-950 shadow-2xl border border-sky-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left: Gió nhẹ / Thổi từ trái sang phải */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-sky-950">
                  {sessionState.windStrength === 'gentle'
                    ? 'Gió nhẹ'
                    : sessionState.windStrength === 'moderate'
                    ? 'Gió vừa'
                    : 'Gió mạnh'}
                </h4>
                <p className="text-xs text-neutral-500">
                  {sessionState.windDirection === 'right' ? 'Thổi từ trái sang phải' : 'Thổi từ phải sang trái'}
                </p>
              </div>
              <ArrowRight className={`w-5 h-5 text-sky-600 transition-transform ${sessionState.windDirection === 'left' ? 'rotate-180' : ''}`} />
            </div>

            {/* Middle: Cùng quan sát */}
            <div className="flex items-center gap-3 border-y md:border-y-0 md:border-x border-sky-100 py-2 md:py-0 md:px-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                📍
              </div>
              <div>
                <h4 className="font-bold text-sm text-sky-950">Cùng quan sát</h4>
                <p className="text-xs text-neutral-500">Phao sẽ trôi về đâu?</p>
              </div>
            </div>

            {/* Right: Cô Linh đang điều khiển */}
            <div className="flex items-center gap-3">
              <img
                src="/assets/avatars/linh_teacher_headshot.png"
                alt="Cô Linh"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-300 shadow"
                onError={(e) => {
                  e.currentTarget.src = '/assets/avatar_colinh.png';
                }}
              />
              <div>
                <h4 className="font-bold text-xs text-neutral-500">Cô Linh</h4>
                <p className="text-xs font-semibold text-sky-950">đang điều khiển</p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                  {sessionState.isSimulationRunning ? '● Đang chạy' : '○ Tạm dừng'}
                </span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* RENDER CONCEPT B: SCIENTIFIC ATLAS SPLIT VIEW */}
      {activeConcept === 'b' && (
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-10 items-stretch">
          {/* Left Column Controls (4 cols) */}
          <div className="lg:col-span-4 bg-white text-sky-950 rounded-3xl p-8 shadow-2xl border border-sky-100 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-serif font-bold text-sky-950 leading-tight">
                  Gió đổi, phao đi đâu?
                </h1>
                <p className="text-sm font-medium text-sky-700 mt-1">
                  Thử nghiệm dòng nước di chuyển
                </p>
              </div>

              {/* Card 1: Gió nhẹ */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wind className="w-8 h-8 text-sky-700" />
                  <div>
                    <h4 className="font-bold text-sm text-sky-950">
                      {sessionState.windStrength === 'gentle' ? 'Gió nhẹ' : 'Gió vừa'}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      {sessionState.windDirection === 'right' ? 'Thổi từ trái sang phải' : 'Thổi từ phải sang trái'}
                    </p>
                  </div>
                </div>
                <ArrowRight className={`w-6 h-6 text-sky-600 ${sessionState.windDirection === 'left' ? 'rotate-180' : ''}`} />
              </div>

              {/* Card 2: Cùng quan sát */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-3">
                <Eye className="w-8 h-8 text-sky-700" />
                <div>
                  <h4 className="font-bold text-sm text-sky-950">Cùng quan sát</h4>
                  <p className="text-xs text-neutral-500">Phao sẽ trôi về đâu?</p>
                </div>
              </div>

              {/* Card 3: Cô Linh đang điều khiển */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-3">
                <img
                  src="/assets/avatars/linh_teacher_headshot.png"
                  alt="Cô Linh"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-300"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/avatar_colinh.png';
                  }}
                />
                <div>
                  <h4 className="font-bold text-sm text-sky-950">Cô Linh đang điều khiển</h4>
                  <p className="text-xs text-neutral-500">Cả lớp cùng quan sát nhé!</p>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-neutral-400 font-mono">
              Ocean Classroom Display · 4K Wall Sync
            </div>
          </div>

          {/* Right Top-down Aerial View (8 cols) */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden shadow-2xl border border-sky-100 flex flex-col">
            <OceanSimulationView
              mode="aerial"
              windDirection={sessionState.windDirection}
              windStrength={sessionState.windStrength}
              isRunning={sessionState.isSimulationRunning}
              showArrows={sessionState.showArrows}
            />
          </div>
        </main>
      )}
    </div>
  );
}
