export interface BlueSteamLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'landing' | 'editorial' | 'mockup';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export function BlueSteamLogo({
  size = 'md',
  variant = 'dark',
  showTagline = false,
  className = '',
  onClick,
}: BlueSteamLogoProps) {
  const logoHeights = {
    sm: 'h-7 sm:h-7.5',
    md: 'h-8 sm:h-8.5',
    lg: 'h-11 sm:h-12',
    xl: 'h-14 sm:h-16',
  };

  const taglineSizes = {
    sm: 'text-[9px] tracking-[0.2em] mt-1',
    md: 'text-[11px] tracking-[0.22em] mt-1.5',
    lg: 'text-xs tracking-[0.25em] mt-2',
    xl: 'text-sm tracking-[0.28em] mt-2.5',
  };

  const isLight = variant === 'light';
  const logoSrc = isLight
    ? '/assets/branding/logo-wordmark-light.png'
    : '/assets/branding/logo-wordmark.png';

  const taglineColor = isLight ? '#E0F2FE' : '#0A2540';

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <img
        src={logoSrc}
        alt="BlueSTEAM Logo"
        className={`${logoHeights[size]} w-auto object-contain shrink-0`}
        loading="eager"
        decoding="async"
      />
      {/* Screen reader semantic brand name */}
      <span className="sr-only">
        Blue<span>STEAM</span>
      </span>

      {showTagline && (
        <span
          className={`font-sans font-bold uppercase text-center block ${taglineSizes[size]}`}
          style={{ color: taglineColor }}
        >
          Học cùng đại dương
        </span>
      )}
    </div>
  );
}
