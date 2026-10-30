import { useState, useEffect } from 'react';
import { useRouter } from '../../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import { RotateCcw, Home, AlertCircle, Waves } from 'lucide-react';
import { oceanAudio } from '../../audio/oceanAudio';

export interface SystemLoadingRetryProps {
  onRetry?: () => void;
  targetPath?: string;
  initialProgress?: number;
  errorMessage?: string | null;
}

export const DEEP_SEA_QUOTES = [
  'Đang lặn xuống tầng trung quang...',
  'Rùa biển đang bơi qua các thảm cỏ biển đầy nắng...',
  'Đang nạp mô hình 3D và sinh thái rạn san hô sống động...',
  'Bạn có biết? Rùa biển xanh có thể nín thở tới 5 giờ dưới đại dương!',
  'Tầng trung quang (200m - 1000m) là vùng chuyển tiếp kỳ thú của ánh sáng...',
];

export function SystemLoadingRetry({
  onRetry,
  targetPath = '/home',
  initialProgress = 35,
  errorMessage = null,
}: SystemLoadingRetryProps) {
  const { navigate } = useRouter();
  const [progress] = useState<number>(initialProgress);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [timedOut, setTimedOut] = useState<boolean>(false);

  // Indeterminate progress per V38-02: No fake percent timers.
  // Visual pulse indicates active streaming connection.

  // Cycle educational ocean quotes
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % DEEP_SEA_QUOTES.length);
    }, 3200);

    return () => clearInterval(quoteTimer);
  }, []);

  // Detect slow loading (> 3.5 seconds) to offer retry guidance
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimedOut(true);
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  const handleRetry = () => {
    oceanAudio.speak('Đang thử tải lại dữ liệu đại dương!');
    if (onRetry) {
      onRetry();
    } else {
      // Clear ?loading=true by navigating directly to clean path
      navigate(targetPath, { replace: true, query: {} });
    }
  };

  const handleGoHome = () => {
    navigate('/home', { replace: true, query: {} });
  };

  // SVG Circular Ring Math
  const radius = 100;

  return (
    <LearnerShell activeNav="home">
      <div
        className="relative min-h-[calc(100vh-72px)] bg-gradient-to-b from-[#041624] via-[#0B232F] to-[#0A3D4D] flex flex-col items-center justify-center p-6 text-center text-white select-none overflow-hidden font-sans"
        role="status"
        aria-live="polite"
        aria-label="Màn hình chuyển cảnh và thử lại"
      >
        {/* Ambient Underwater Light Caustics & Depth Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-[#17657A]/25 via-transparent to-transparent pointer-events-none" />

        {/* Ambient Animated Micro-Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-[15%] bottom-[-20px] w-4 h-4 rounded-full bg-cyan-300/30 blur-[0.5px] animate-bounce duration-[3000ms]" />
          <div className="absolute left-[30%] bottom-[-20px] w-6 h-6 rounded-full bg-teal-200/25 blur-[1px] animate-bounce duration-[4200ms]" />
          <div className="absolute right-[22%] bottom-[-20px] w-5 h-5 rounded-full bg-cyan-200/30 blur-[0.5px] animate-bounce duration-[3600ms]" />
          <div className="absolute right-[38%] bottom-[-20px] w-3 h-3 rounded-full bg-white/35 blur-[0.5px] animate-bounce duration-[2800ms]" />
        </div>

        {/* Main Loading Visual Stack */}
        <div className="relative z-10 max-w-xl w-full flex flex-col items-center space-y-6">
          
          {/* Circular SVG Progress Ring with Swimming Turtle Centerpiece */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* Ambient Radial Depth Glow */}
            <div className="absolute inset-4 rounded-full bg-[#17657A]/25 blur-2xl animate-pulse" />

            <svg
              className="w-full h-full transform -rotate-90 animate-spin [animation-duration:8s]"
              viewBox="0 0 240 240"
            >
              {/* Background Track Circle */}
              <circle
                cx="120"
                cy="120"
                r={radius}
                className="text-white/10"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />

              {/* Indeterminate Ocean Stream Arc (V38-02 & V38-03 natural lighting) */}
              <circle
                cx="120"
                cy="120"
                r={radius}
                className="text-[#2EE6CA]/90"
                strokeWidth="8"
                strokeDasharray="180 450"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Turtle Swimmer & Calm Status */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className="relative group animate-pulse duration-1000">
                <img
                  src="/assets/generated/creatures/turtle_isolated.png"
                  alt="Rùa biển bơi lặn"
                  className="w-24 sm:w-28 h-24 sm:h-28 object-contain drop-shadow-[0_8px_20px_rgba(23,101,122,0.45)] transform hover:scale-105 transition-transform"
                />
              </div>

              {/* Progress Percentage Display */}
              <div className="mt-1 font-mono font-black text-2xl sm:text-3xl text-[#2EE6CA] drop-shadow-md">
                {progress}%
              </div>
            </div>
          </div>

          {/* Heading & Rotating Oceanic Narrative */}
          <div className="space-y-2 max-w-md">
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-[-0.02em] drop-shadow">
              Đang chuẩn bị chuyến hải trình
            </h1>

            <div className="h-12 flex items-center justify-center">
              <p
                key={quoteIndex}
                className="text-sm sm:text-base text-cyan-100/90 font-medium italic animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                "{DEEP_SEA_QUOTES[quoteIndex]}"
              </p>
            </div>
          </div>

          {/* Error Message or Delayed Loading Advice */}
          {(errorMessage || timedOut) && (
            <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs text-cyan-50 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-center gap-1.5 text-[#F67650] font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {errorMessage ? 'Không thể tải trạm học' : 'Kết nối mạng đang chậm'}
                </span>
              </div>
              <p className="text-neutral-200 text-[11px] leading-relaxed">
                {errorMessage ||
                  'Chuyến lặn mất nhiều thời gian hơn dự kiến do đang tải mô hình 3D rạn san hô. Bé có thể bấm Thử lại hoặc quay về Trang chủ nhé!'}
              </p>
            </div>
          )}

          {/* Action Buttons: Coral "Thử lại" CTA + "Về Trang chủ" */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Primary Retry Button */}
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#F67650] hover:bg-[#ff845e] text-white font-black text-base shadow-[0_6px_25px_rgba(246,118,80,0.45)] transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Thử lại</span>
            </button>

            {/* Secondary Home Button */}
            <button
              type="button"
              onClick={handleGoHome}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/30 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Về Trang chủ</span>
            </button>
          </div>

          {/* Subtle Oceanic Badge Footer */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs font-semibold text-cyan-200/60">
            <Waves className="w-4 h-4" />
            <span>BlueSTEAM v2 · Hệ Thống Học Liệu Tương Tác Đại Dương</span>
          </div>

        </div>
      </div>
    </LearnerShell>
  );
}

export default SystemLoadingRetry;
