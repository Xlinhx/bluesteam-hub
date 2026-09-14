import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface PebbleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function PebbleButton({
  isSelected = false,
  size = 'md',
  children,
  className = '',
  ...props
}: PebbleButtonProps) {
  const dimensions = {
    sm: 'min-w-[48px] min-h-[48px] p-2.5 text-sm',
    md: 'min-w-[56px] min-h-[56px] p-3 text-base',
    lg: 'min-w-[64px] min-h-[64px] p-4 text-lg',
  };

  // Asymmetric pebble border radius
  const pebbleShape = 'rounded-[26px_18px_24px_22px/20px_26px_18px_24px]';

  const baseStyles =
    'relative inline-flex items-center justify-center font-sans font-bold transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17657A]/40 active:scale-95';

  const selectedStyles = isSelected
    ? 'bg-[#17657A] text-white shadow-[0_4px_12px_rgba(23,101,122,0.35)] ring-3 ring-[#F67650]'
    : 'bg-[#F6F3EB] hover:bg-white text-[#12384B] border-2 border-[#17657A]/25 shadow-[0_3px_8px_rgba(18,56,75,0.08)] hover:border-[#17657A]';

  return (
    <button
      className={`${baseStyles} ${pebbleShape} ${dimensions[size]} ${selectedStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
