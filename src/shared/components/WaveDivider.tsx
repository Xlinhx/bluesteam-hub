export type WaveVariant = 'gentle' | 'deep' | 'crest';

export interface WaveDividerProps {
  variant?: WaveVariant;
  fillColor?: string;
  className?: string;
  flip?: boolean;
}

export function WaveDivider({
  variant = 'gentle',
  fillColor = '#F6F3EB',
  className = '',
  flip = false,
}: WaveDividerProps) {
  const transform = flip ? 'scale(1, -1)' : 'none';

  return (
    <div className={`w-full overflow-hidden leading-none select-none pointer-events-none ${className}`}>
      {variant === 'gentle' && (
        <svg
          className="w-full h-10 md:h-16 block"
          viewBox="0 0 1440 80"
          fill="none"
          preserveAspectRatio="none"
          style={{ transform }}
        >
          <path
            d="M0 40C240 70 480 15 720 40C960 65 1200 20 1440 40V80H0V40Z"
            fill={fillColor}
          />
        </svg>
      )}

      {variant === 'deep' && (
        <svg
          className="w-full h-12 md:h-20 block"
          viewBox="0 0 1440 100"
          fill="none"
          preserveAspectRatio="none"
          style={{ transform }}
        >
          <path
            d="M0 60C320 15 640 90 960 45C1200 15 1340 75 1440 60V100H0V60Z"
            fill={fillColor}
          />
        </svg>
      )}

      {variant === 'crest' && (
        <svg
          className="w-full h-14 md:h-24 block"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
          style={{ transform }}
        >
          <path
            d="M0 80C180 30 360 110 540 70C720 30 900 100 1080 60C1260 20 1380 90 1440 80V120H0V80Z"
            fill={fillColor}
          />
          {/* Subtle foam line */}
          <path
            d="M0 76C180 26 360 106 540 66C720 26 900 96 1080 56C1260 16 1380 86 1440 76"
            stroke="#2EE6CA"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
        </svg>
      )}
    </div>
  );
}
