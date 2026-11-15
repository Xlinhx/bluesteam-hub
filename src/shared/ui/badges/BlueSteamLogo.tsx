export interface BlueSteamLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'landing' | 'editorial' | 'mockup';
  showTagline?: boolean;
  tagline?: string;
  className?: string;
  onClick?: () => void;
}

export function BlueSteamLogo({
  size = 'md',
  variant = 'dark',
  showTagline = false,
  tagline = 'Học cùng đại dương',
  className = '',
  onClick,
}: BlueSteamLogoProps) {
  const logoWidths = {
    sm: 'w-36',
    md: 'w-[170px]',
    lg: 'w-[220px]',
    xl: 'w-[280px]',
  };

  const taglineSizes = {
    sm: 'text-[9px] tracking-[0.2em] mt-1',
    md: 'text-[11px] tracking-[0.22em] mt-1.5',
    lg: 'text-xs tracking-[0.25em] mt-2',
    xl: 'text-sm tracking-[0.28em] mt-2.5',
  };

  const isLight = variant === 'light';
  const logoSrc = '/assets/branding/bluesteam-hub-ocean.webp';

  const taglineColor = isLight ? '#E0F2FE' : '#0A2540';

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <img
        src={logoSrc}
        alt="Blue STEAM Hub — khám phá đại dương"
        width={2172}
        height={724}
        className={`${logoWidths[size]} h-auto max-w-full object-contain shrink-0${isLight ? ' rounded-lg' : ''}`}
        loading="eager"
        decoding="async"
      />
      {/* Screen reader semantic brand name */}
      <span className="sr-only">
        Blue <span>STEAM Hub</span>
      </span>

      {showTagline && (
        <span
          className={`font-sans font-bold uppercase text-center block ${taglineSizes[size]}`}
          style={{ color: taglineColor }}
        >
          {tagline}
        </span>
      )}
    </div>
  );
}
