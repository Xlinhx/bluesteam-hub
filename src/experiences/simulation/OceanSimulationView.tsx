import { useEffect, useRef, useState } from 'react';
import { WindDirection, WindStrength } from '../../demo/storage/oceanShowcaseStore';
import { Maximize2, Minimize2, Check, Compass } from 'lucide-react';

interface OceanSimulationViewProps {
  mode: 'cross-section' | 'aerial';
  windDirection: WindDirection;
  windStrength: WindStrength;
  isRunning: boolean;
  showArrows: boolean;
  onToggleArrows?: (show: boolean) => void;
  onObservationComplete?: (direction: WindDirection) => void;
}

export function OceanSimulationView({
  mode,
  windDirection,
  windStrength,
  isRunning,
  showArrows,
  onToggleArrows,
  onObservationComplete,
}: OceanSimulationViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buoyOffset, setBuoyOffset] = useState(0);

  // Speed multiplier based on wind strength
  const speed = windStrength === 'gentle' ? 1 : windStrength === 'moderate' ? 2 : 3.5;
  const directionMultiplier = windDirection === 'right' ? 1 : -1;

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;

    if (isRunning) {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000;

        // Move buoy smoothly across water up to limit (+/- 140px)
        const target = Math.min(140, Math.max(-140, directionMultiplier * elapsed * speed * 25));
        setBuoyOffset(target);

        if (elapsed > 2.5 && onObservationComplete) {
          onObservationComplete(windDirection);
        }

        animationFrameId = requestAnimationFrame(step);
      };
      animationFrameId = requestAnimationFrame(step);
    } else {
      // Stopped or reset
      setBuoyOffset((prev) => prev * 0.95);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, windDirection, windStrength, speed, directionMultiplier, onObservationComplete]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/9] md:aspect-[21/10] rounded-2xl overflow-hidden shadow-lg border border-sky-100 bg-sky-950 select-none"
    >
      {/* Background Graphic */}
      {mode === 'cross-section' ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('/assets/hero_buoy_waterline.jpg')` }}
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('/assets/hero_buoy_aerial.jpg')` }}
        />
      )}

      {/* Underwater Water Glow & Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-t from-sky-900/30 via-transparent to-sky-400/10 pointer-events-none" />

      {/* Aerial Overlays (Concept B specific) */}
      {mode === 'aerial' && (
        <>
          {/* Compass Rose top-left */}
          <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/30 flex flex-col items-center justify-center text-white shadow-md z-10">
            <span className="text-[10px] font-bold font-mono text-cyan-300 leading-none">N</span>
            <Compass className="w-4 h-4 text-white" />
          </div>

          {/* Scale Bar bottom-left */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 text-white font-mono text-[11px] flex flex-col gap-0.5 z-10">
            <div className="flex justify-between text-[9px] text-neutral-300">
              <span>0</span>
              <span>5</span>
              <span>10 m</span>
            </div>
            <div className="w-24 h-1.5 bg-neutral-700 rounded flex overflow-hidden border border-white/30">
              <div className="w-1/2 bg-white" />
              <div className="w-1/2 bg-cyan-400" />
            </div>
          </div>

          {/* Wind Indicator bottom-right */}
          <div className="absolute bottom-4 right-4 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white z-10 flex flex-col items-center">
            <span className="text-[11px] font-medium text-neutral-300">
              Gió (mặt biển)
            </span>
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-sm">
              <span>{windDirection === 'right' ? 'Thổi sang phải' : 'Thổi sang trái'}</span>
              <span className={`text-base transform ${windDirection === 'left' ? 'rotate-180' : ''}`}>➔</span>
            </div>
          </div>
        </>
      )}

      {/* Floating Animated Buoy */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 ease-out z-20"
        style={{
          transform: `translate(calc(-50% + ${buoyOffset}px), -50%)`,
        }}
      >
        {/* Animated Ripple Waves under Buoy */}
        <div
          className={`absolute -inset-4 rounded-full border-2 border-cyan-300/40 ${
            isRunning ? 'animate-ping' : ''
          }`}
          style={{ animationDuration: `${2 / speed}s` }}
        />
        {/* Buoy Marker Pin */}
        <div className="relative flex flex-col items-center">
          <div className="w-2 h-6 bg-neutral-900 rounded-t-sm" />
          <div className="w-7 h-10 bg-gradient-to-b from-amber-500 via-orange-500 to-amber-600 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center">
            <div className="w-full h-1.5 bg-white my-auto" />
          </div>
          <div className="w-1.5 h-7 bg-neutral-800" />
        </div>
      </div>

      {/* Flow Arrows Overlay */}
      {showArrows && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-10">
          <div
            className={`w-full flex justify-around px-8 opacity-85 transition-opacity ${
              isRunning ? 'animate-pulse' : ''
            }`}
          >
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 text-cyan-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                style={{
                  transform: windDirection === 'left' ? 'rotate(180deg)' : 'none',
                }}
              >
                <div className="w-12 h-1 bg-gradient-to-r from-cyan-400/20 via-cyan-300 to-white rounded-full" />
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Floating Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
        {/* Toggle Arrows Button */}
        {onToggleArrows && (
          <button
            onClick={() => onToggleArrows(!showArrows)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-medium border border-white/20 transition-colors cursor-pointer shadow"
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center ${
                showArrows ? 'bg-sky-500 border-sky-400' : 'border-neutral-400'
              }`}
            >
              {showArrows && <Check className="w-3 h-3 text-white" />}
            </div>
            <span>Hiện mũi tên</span>
          </button>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-colors cursor-pointer shadow"
          title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
