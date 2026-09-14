import { useI18n } from '../i18n/I18nContext';

export interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { locale, setLocale } = useI18n();

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
