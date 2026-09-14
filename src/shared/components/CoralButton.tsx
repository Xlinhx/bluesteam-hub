import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface CoralButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  isKidFriendly?: boolean;
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function CoralButton({
  size = 'md',
  variant = 'primary',
  isKidFriendly = true,
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: CoralButtonProps) {
  // Enforce minimum touch target of 56px for kid-friendly interactions
  const heightClasses = {
    sm: isKidFriendly ? 'min-h-[56px] px-6 text-lg' : 'min-h-[44px] px-4 text-sm',
    md: isKidFriendly ? 'min-h-[60px] px-8 text-xl font-bold' : 'min-h-[48px] px-6 text-base font-semibold',
    lg: isKidFriendly ? 'min-h-[68px] px-10 text-2xl font-bold' : 'min-h-[54px] px-8 text-lg font-bold',
  };

  const baseStyles =
    'relative inline-flex items-center justify-center gap-3 rounded-full font-sans tracking-wide transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17657A]/40 active:translate-y-1';

  const variantStyles = {
    primary:
      'bg-[#F67650] hover:bg-[#F2643A] text-[#12384B] font-extrabold shadow-[0_4px_0_#C95634,0_8px_20px_rgba(246,118,80,0.35)] active:shadow-[0_1px_0_#C95634]',
    secondary:
      'bg-[#17657A] hover:bg-[#135365] text-white font-bold shadow-[0_4px_0_#0F3E4C,0_8px_16px_rgba(23,101,122,0.25)] active:shadow-[0_1px_0_#0F3E4C]',
    outline:
      'bg-[#F6F3EB] hover:bg-white text-[#12384B] font-bold border-2 border-[#17657A]/40 shadow-[0_3px_0_#17657A/30] active:shadow-[0_1px_0_#17657A/30]',
  };

  const disabledStyles = disabled || isLoading ? 'opacity-50 pointer-events-none shadow-none translate-y-0' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${heightClasses[size]} ${variantStyles[variant]} ${disabledStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-5 h-5 border-3 border-[#12384B] border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
