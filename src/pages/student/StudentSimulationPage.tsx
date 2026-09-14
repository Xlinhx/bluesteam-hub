import { useState } from 'react';
import { useRouter } from '../../app/router';
import { getStoredConcept, ConceptKey } from '../../showcase/registry';
import { OceanSimulationView } from '../../experiences/simulation/OceanSimulationView';
import { WindDirection, WindStrength } from '../../demo/storage/oceanShowcaseStore';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  Volume2,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Check,
  Eye,
  Wind,
  Leaf,
  Lightbulb,
  Search,
  Star,
  Compass,
} from 'lucide-react';

export function StudentSimulationPage() {
  const { query, navigate } = useRouter();

  const activeConcept = (query.concept as ConceptKey) || getStoredConcept('simulation');

  // Simulation state
  const [windDirection, setWindDirection] = useState<WindDirection>('right');
  const [windStrength, setWindStrength] = useState<WindStrength>('gentle');
  const [isRunning, setIsRunning] = useState(false);
  const [showArrows, setShowArrows] = useState(true);
  const [observationResult, setObservationResult] = useState<string | null>(null);

  const handleToggleRun = () => {
    if (!isRunning) {
      setIsRunning(true);
      oceanAudio.playChime(523.25, 0.6);
    } else {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setObservationResult(null);
    oceanAudio.playChime(392, 0.4);
  };

  const handleObservationComplete = (direction: WindDirection) => {
    if (!observationResult) {
      const text = direction === 'right' ? 'Phao di chuyển sang phải theo chiều gió!' : 'Phao di chuyển sang trái theo chiều gió!';
      setObservationResult(text);
      oceanAudio.speak('Quan sát thấy phao di chuyển sang phải theo chiều gió!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-neutral-900 pb-20 font-sans">
      {/* Student Global Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-sky-100 sticky top-0 z-40 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold font-serif text-sky-950 tracking-tight flex items-center gap-1 cursor-pointer"
            >
              Ocean
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/student/unit')}
              className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại bài học</span>
            </button>
            <span className="text-neutral-300">|</span>
            <div className="flex items-center gap-1 text-xs font-bold text-sky-950">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Lớp Sao Biển</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="font-serif font-bold text-base text-sky-950 leading-tight">
              Dòng chảy đại dương
            </h1>
            <p className="text-[11px] text-sky-700">Sức mạnh vô hình</p>
          </div>

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
              <span>4. Thử nghiệm</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-400">
              <span className="w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center text-[9px]">
                5
              </span>
              <span className="hidden sm:inline">5. Chia sẻ</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-sky-100">
              <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="w-[60%] h-full bg-teal-500 rounded-full" />
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">3/5 đã hoàn thành (60%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN SIMULATION WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Canvas & Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Interactive Simulation Display */}
            <OceanSimulationView
              mode={activeConcept === 'a' ? 'cross-section' : 'aerial'}
              windDirection={windDirection}
              windStrength={windStrength}
              isRunning={isRunning}
              showArrows={showArrows}
              onToggleArrows={(show) => setShowArrows(show)}
              onObservationComplete={handleObservationComplete}
            />

            {/* Interactive Controls Bar Below Canvas */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Hướng gió */}
              <div className="md:col-span-4 space-y-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Hướng gió
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setWindDirection('left');
                      oceanAudio.playChime(440, 0.2);
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      windDirection === 'left'
                        ? 'bg-sky-900 text-white shadow-md'
                        : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                    }`}
                  >
                    <span>←</span>
                    <span>Sang trái</span>
                  </button>

                  <button
                    onClick={() => {
                      setWindDirection('right');
                      oceanAudio.playChime(523, 0.2);
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      windDirection === 'right'
                        ? 'bg-sky-900 text-white shadow-md'
                        : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                    }`}
                  >
                    <span>Sang phải</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Cường độ gió */}
              <div className="md:col-span-4 space-y-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Cường độ gió
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWindStrength('gentle')}
                    className={`flex-1 py-2 px-2 rounded-2xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      windStrength === 'gentle'
                        ? 'bg-sky-50 border-2 border-sky-600 text-sky-900 font-bold'
                        : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Leaf className="w-3.5 h-3.5" />
                    <span>Nhẹ</span>
                  </button>

                  <button
                    onClick={() => setWindStrength('moderate')}
                    className={`flex-1 py-2 px-2 rounded-2xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      windStrength === 'moderate'
                        ? 'bg-sky-50 border-2 border-sky-600 text-sky-900 font-bold'
                        : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5" />
                    <span>Vừa</span>
                  </button>

                  <button
                    onClick={() => setWindStrength('strong')}
                    className={`flex-1 py-2 px-2 rounded-2xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      windStrength === 'strong'
                        ? 'bg-sky-50 border-2 border-sky-600 text-sky-900 font-bold'
                        : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5" />
                    <span>Mạnh</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Chạy thử & Đặt lại */}
              <div className="md:col-span-4 flex items-center gap-2 pt-2 md:pt-0">
                <button
                  onClick={handleToggleRun}
                  className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    isRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-sky-900 hover:bg-sky-800 text-white'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isRunning ? 'Tạm dừng' : 'Chạy thử'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="p-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                  title="Đặt lại mô phỏng"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Bàn thử nghiệm & Quan sát (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <h3 className="font-serif font-bold text-base text-sky-950">
                  Bàn thử nghiệm
                </h3>
                <button
                  onClick={() => oceanAudio.speak('Bàn thử nghiệm: Dự đoán của An là sang phải. Hãy bấm Chạy thử để quan sát!')}
                  className="p-1.5 rounded-full hover:bg-sky-50 text-sky-800"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Dự đoán của An */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Dự đoán của An
                </span>
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex flex-col items-center justify-center gap-1.5">
                  <div className="w-12 h-6 bg-sky-600 rounded-full flex items-center justify-center text-white text-base">
                    ➔
                  </div>
                  <span className="font-bold text-sm text-sky-950">Sang phải</span>
                </div>
              </div>

              {/* Kết quả quan sát */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Kết quả quan sát
                </span>

                {observationResult ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-2 animate-fadeIn">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-emerald-950 leading-relaxed">
                      {observationResult}
                    </p>
                    <span className="inline-block text-[11px] text-emerald-700 bg-white px-2.5 py-1 rounded-full shadow-sm">
                      Khớp với dự đoán của em!
                    </span>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border-2 border-dashed border-sky-200 text-center space-y-2 text-neutral-400">
                    <Eye className="w-6 h-6 text-sky-400 mx-auto" />
                    <span className="text-xs font-medium text-neutral-500 block">
                      {isRunning ? 'Đang mô phỏng di chuyển...' : 'Chạy để quan sát'}
                    </span>
                  </div>
                )}
              </div>

              {/* Next Step Button (When observation is done or user ready) */}
              <div className="pt-2">
                <button
                  onClick={() => navigate('/student/progress')}
                  className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    observationResult
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                      : 'bg-sky-900 hover:bg-sky-800 text-white'
                  }`}
                >
                  <span>{observationResult ? 'Hoàn thành & Sang Chia sẻ (5/5)' : 'Tiếp tục sang Chia sẻ & Kỷ vật (5/5)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Hướng dẫn nhanh */}
              <div className="space-y-2 pt-2 border-t border-sky-100">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  Hướng dẫn nhanh
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-neutral-700">
                    <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Chọn hướng gió và cường độ</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700">
                    <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Nhấn Chạy thử</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700">
                    <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Quan sát bè nổi di chuyển</span>
                  </div>
                </div>
              </div>

              {/* Tip Banner */}
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-2.5">
                {activeConcept === 'a' ? (
                  <>
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-sky-900 leading-tight">
                      Gió thổi trên mặt biển có thể làm bè nổi dịch chuyển đấy!
                    </p>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-sky-900 leading-tight">
                      Quan sát kỹ hướng di chuyển của bè nổi trên mặt nước nhé!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
