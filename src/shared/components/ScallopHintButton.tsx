import type { ButtonHTMLAttributes } from 'react';

export interface ScallopHintButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  isPulsing?: boolean;
}

export function ScallopHintButton({
  size = 'md',
  isPulsing = false,
  className = '',
  ...props
}: ScallopHintButtonProps) {
  const dimensions = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14 min-w-[56px] min-h-[56px]',
    lg: 'w-16 h-16 min-w-[64px] min-h-[64px]',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  };

  return (
    <button
      type="button"
      className={`relative inline-flex items-center justify-center rounded-full bg-[#FFFDF8] border-2 border-[#E5A93C] text-[#E5A93C] shadow-[0_4px_12px_rgba(229,169,60,0.25)] hover:bg-[#FFF8E7] hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E5A93C]/40 ${
        isPulsing ? 'animate-bounce' : ''
      } ${dimensions[size]} ${className}`}
      title="Gợi ý quan sát"
      aria-label="Gợi ý quan sát"
      {...props}
    >
      {/* Custom Vector Scallop Shell SVG */}
      <svg
        className={`${iconSizes[size]} shrink-0`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M16 4C9 4 4 10 5 18C5.5 22 8 26 13 28L14 27C14.5 25.5 15.2 24.5 16 24.5C16.8 24.5 17.5 25.5 18 27L19 28C24 26 26.5 22 27 18C28 10 23 4 16 4Z"
          fill="#FFF4D4"
          stroke="#E5A93C"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Scallop shell ridges */}
        <path d="M16 6V24" stroke="#E5A93C" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M11 9C12.5 14 13.5 19 14.5 24" stroke="#E5A93C" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M21 9C19.5 14 18.5 19 17.5 24" stroke="#E5A93C" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7.5 14C9.5 18 11.5 21 13.5 24.5" stroke="#E5A93C" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M24.5 14C22.5 18 20.5 21 18.5 24.5" stroke="#E5A93C" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}
