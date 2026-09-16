import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

export interface LanguageToggleProps {
  variant?: 'dropdown' | 'pill';
  className?: string;
}

export function LanguageToggle({ variant = 'dropdown', className = '' }: LanguageToggleProps) {
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

  // Authentic Dropdown Style (Ảnh 3)
  return (
    <div ref={dropdownRef} className={`relative inline-block text-left select-none ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chuyển đổi ngôn ngữ / Language toggle"
        className="inline-flex items-center gap-2 py-1.5 px-2 rounded-lg text-[#102A38] hover:text-[#17657A] hover:bg-black/5 transition-colors cursor-pointer group focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-[#102A38] group-hover:text-[#17657A] transition-colors" />
        <span className="text-xs sm:text-sm font-semibold tracking-normal">
          {locale === 'vi' ? 'Tiếng Việt' : 'English'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#102A38] group-hover:text-[#17657A] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => {
              setLocale('vi');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
              locale === 'vi' ? 'text-[#17657A] bg-teal-50/70' : 'text-[#102A38] hover:bg-slate-50'
            }`}
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
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
              locale === 'en' ? 'text-[#17657A] bg-teal-50/70' : 'text-[#102A38] hover:bg-slate-50'
            }`}
          >
            <span>English</span>
            {locale === 'en' && <Check className="w-3.5 h-3.5 text-[#17657A]" />}
          </button>
        </div>
      )}
    </div>
  );
}
