interface BlueSteamLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  className?: string;
}

export function BlueSteamLogo({ size = 'md', variant = 'dark', className = '' }: BlueSteamLogoProps) {
  const heights = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
  };

  const waveColor = variant === 'light' ? '#2EE6CA' : '#17657A';
  const textColor = variant === 'light' ? '#FFFFFF' : '#12384B';
  const steamColor = '#F67650';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Canonical Living Ocean Wave SVG */}
      <svg
        className={`${heights[size]} w-auto aspect-[38/32] shrink-0`}
        viewBox="0 0 38 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2 24C6 24 8 20 12 16C16 12 18 8 23 8C27.5 8 30 11.5 32 15C33.5 17.6 35.5 19 37 19"
          stroke={waveColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M4 29C8 29 10 25.5 14 22C18 18.5 20.5 15.5 25 15.5C29 15.5 32 18.5 34 22C35 23.7 36 24.5 37 25"
          stroke={steamColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <circle cx="23" cy="8" r="2.5" fill="#E5A93C" />
      </svg>

      {/* Unified Wordmark */}
      <span
        className={`font-sans font-extrabold tracking-tight leading-none ${
          size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl md:text-2xl' : 'text-3xl'
        }`}
        style={{ color: textColor }}
      >
        Blue<span style={{ color: steamColor }}>STEAM</span>
      </span>
    </div>
  );
}
