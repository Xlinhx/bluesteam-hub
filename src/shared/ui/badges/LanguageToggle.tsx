import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Globe, ChevronDown, Check } from 'lucide-react';
import '../catalog/option-popover.css';

export interface LanguageToggleProps {
  variant?: 'dropdown' | 'pill';
  className?: string;
  compact?: boolean;
}

export function LanguageToggle({ variant = 'dropdown', className = '', compact = false }: LanguageToggleProps) {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-full bg-[#EAE4D5] border border-[#17657A]/20 select-none shadow-inner ${className}`}
        role="group"
        aria-label="Chuyển đổi ngôn ngữ / Language toggle"
      >
        <button
          type="button"
          onClick={() => setLocale('vi')}
          aria-pressed={locale === 'vi'}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
            locale === 'vi'
              ? 'bg-[#17657A] text-white shadow-sm'
              : 'text-[#12384B]/70 hover:text-[#12384B]'
          }`}
        >
          VI
        </button>
        <button
          type="button"
          onClick={() => setLocale('en')}
          aria-pressed={locale === 'en'}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
            locale === 'en'
              ? 'bg-[#17657A] text-white shadow-sm'
              : 'text-[#12384B]/70 hover:text-[#12384B]'
          }`}
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left select-none ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chuyển đổi ngôn ngữ / Language toggle"
        className="ui-filter-control inline-flex min-h-11 items-center gap-2 px-2 bg-[var(--catalog-control-surface)] text-[var(--catalog-control-ink)] cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {!compact && <Globe className="size-4 shrink-0" aria-hidden="true" />}
        <span className="text-xs sm:text-sm font-semibold tracking-normal">
          {compact ? locale.toUpperCase() : locale === 'vi' ? 'Tiếng Việt' : 'English'}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 shrink-0 motion-safe:transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="ui-option-panel absolute right-0 mt-1.5 w-36 z-50 flex flex-col gap-[3px]">
          <button
            type="button"
            onClick={() => {
              setLocale('vi');
              setIsOpen(false);
            }}
            aria-pressed={locale === 'vi'}
            className="ui-option-row w-full justify-between text-sm"
          >
            <span>Tiếng Việt</span>
            {locale === 'vi' && <Check className="w-3.5 h-3.5 text-[#17657A]" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setLocale('en');
              setIsOpen(false);
            }}
            aria-pressed={locale === 'en'}
            className="ui-option-row w-full justify-between text-sm"
          >
            <span>English</span>
            {locale === 'en' && <Check className="w-3.5 h-3.5 text-[#17657A]" />}
          </button>
        </div>
      )}
    </div>
  );
}
