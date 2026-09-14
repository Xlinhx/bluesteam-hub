export type JourneyNodeStatus = 'completed' | 'current' | 'locked';

export interface JourneyNodeProps {
  stationNumber: number;
  title: string;
  subtitle?: string;
  status: JourneyNodeStatus;
  onClick?: () => void;
  className?: string;
}

export function JourneyNode({
  stationNumber,
  title,
  subtitle,
  status,
  onClick,
  className = '',
}: JourneyNodeProps) {
  const isInteractive = status !== 'locked';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Node Button & Ring */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring for current node */}
        {status === 'current' && (
          <span className="absolute -inset-2.5 rounded-full bg-[#F67650]/30 animate-ping pointer-events-none" />
        )}
        {status === 'current' && (
          <span className="absolute -inset-1.5 rounded-full border-2 border-[#F67650] animate-pulse pointer-events-none" />
        )}

        <button
          type="button"
          onClick={isInteractive ? onClick : undefined}
          disabled={!isInteractive}
          aria-label={`Trạm ${stationNumber}: ${title} (${status})`}
          className={`relative w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17657A]/50 ${
            status === 'completed'
              ? 'bg-[#17657A] text-white shadow-[0_4px_14px_rgba(23,101,122,0.4)] border-3 border-white hover:scale-105 active:scale-95 cursor-pointer'
              : status === 'current'
              ? 'bg-[#F67650] text-[#12384B] shadow-[0_6px_20px_rgba(246,118,80,0.45)] border-4 border-white scale-110 hover:scale-115 active:scale-105 cursor-pointer ring-4 ring-[#F67650]/20'
              : 'bg-[#EAE4D5] text-[#12384B]/40 border-2 border-[#12384B]/15 cursor-not-allowed opacity-75'
          }`}
        >
          {status === 'completed' && (
            <div className="flex flex-col items-center">
              {/* Gold Star / Checkmark icon */}
              <svg className="w-8 h-8 text-[#E5A93C]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          )}

          {status === 'current' && (
            <div className="flex flex-col items-center">
              {/* Baby Turtle / Compass Icon */}
              <span className="text-2xl" role="img" aria-label="Rùa biển">
                🐢
              </span>
            </div>
          )}

          {status === 'locked' && (
            <div className="flex flex-col items-center">
              {/* Padlock */}
              <svg className="w-6 h-6 text-[#12384B]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Station Label */}
      <div className="mt-3 text-center max-w-[140px]">
        <div className="font-sans font-extrabold text-sm text-[#12384B] leading-tight line-clamp-1">{title}</div>
        {subtitle && <div className="text-xs text-[#12384B]/70 line-clamp-1 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}
