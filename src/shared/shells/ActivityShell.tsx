import type { ReactNode } from 'react';
import { useRouter } from '../../app/router';
import { useI18n } from '../i18n/I18nContext';
import { ArrowLeft, Pause, Play } from 'lucide-react';
import { ScallopHintButton } from '../ui/buttons/ScallopHintButton';
import { AudioControlButton } from '../ui/badges/AudioControlButton';
import { BlueSteamLogo } from '../ui/badges/BlueSteamLogo';

export interface ActivityShellProps {
  title?: string;
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
  onHint?: () => void;
  isPaused?: boolean;
  onTogglePause?: () => void;
  showLogo?: boolean;
  variant?: 'dark' | 'light' | 'studio';
  headerLeft?: ReactNode;
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
  hideBackButton?: boolean;
  children?: ReactNode;
}

export function ActivityShell({
  title = 'Game Lab',
  currentStep,
  totalSteps,
  onBack,
  onHint,
  isPaused = false,
  onTogglePause,
  showLogo = true,
  variant = 'dark',
  headerLeft,
  headerCenter,
  headerRight,
  hideBackButton = false,
  children,
}: ActivityShellProps) {
  const { navigate } = useRouter();
  const { t } = useI18n();
  const isLight = variant === 'light' || variant === 'studio';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/interactive');
    }
  };

  return (
    <div
      className={`relative min-h-screen flex flex-col ${
        isLight
          ? 'bg-gradient-to-b from-[#F2F6FA] via-[#EBF1F7] to-[#E5ECF2] text-[#102A38]'
          : 'bg-[#0B232F] text-[#F6F3EB]'
      } font-sans select-none overflow-hidden`}
    >
      {/* Activity Top Bar - Frosted glass, tactile controls, matching habitat-placement */}
      <header
        className={`relative z-50 w-full h-16 lg:h-[68px] ${
          isLight
            ? 'bg-[#FAF8F5]/95 backdrop-blur-xl border-b border-[#12384B]/10 shadow-[0_2px_12px_rgba(16,42,56,0.04)] text-[#102A38]'
            : 'bg-[#12384B]/85 backdrop-blur-md border-b border-white/10 text-white'
        } px-4 lg:px-8 flex items-center justify-between gap-4`}
      >
        {/* Left: Custom headerLeft OR Back Button & Optional BlueSTEAM Wordmark */}
        {headerLeft ? (
          <div className="flex items-center gap-3">{headerLeft}</div>
        ) : (
          <div className="flex items-center gap-3">
            {!hideBackButton && (
              <button
                type="button"
                onClick={handleBack}
                aria-label={t('nav.activity.back')}
                className={`group flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-200 ease-out active:scale-95 cursor-pointer justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15586E] min-w-[56px] min-h-[56px] ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 text-[#102A38] border border-black/[0.08] shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-xs'
                }`}
              >
                <ArrowLeft className={`w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5 stroke-[2.5] ${isLight ? 'text-[#102A38]' : 'text-[#2EE6CA]'}`} />
                <span className="hidden sm:inline text-xs sm:text-sm tracking-tight">{t('nav.activity.back')}</span>
              </button>
            )}

            {showLogo && (
              <div className="hidden md:flex items-center pl-1">
                <BlueSteamLogo size="sm" variant={isLight ? 'dark' : 'light'} />
              </div>
            )}
          </div>
        )}

        {/* Center: Custom headerCenter OR Default Activity Title & Progress Beads */}
        {headerCenter ? (
          <div className="flex items-center justify-center flex-1 max-w-xl">
            <span className="sr-only font-serif tracking-[-0.02em]">{title}</span>
            {headerCenter}
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-md text-center">
            <h1 className={`font-serif font-black text-base sm:text-lg lg:text-xl tracking-[-0.02em] truncate max-w-[240px] sm:max-w-md ${isLight ? 'text-[#102A38]' : 'text-white'}`}>
              {title}
            </h1>

            {/* Progress beads */}
            {totalSteps && totalSteps > 1 && (
              <div className="flex items-center gap-1.5 mt-1">
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx + 1 === currentStep
                        ? 'w-6 bg-[#F67650]'
                        : idx + 1 < (currentStep || 1)
                        ? 'w-2 bg-[#2EE6CA]'
                        : isLight ? 'w-2 bg-slate-300' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right: Custom headerRight OR (Hint Scallop + Audio Control + Pause) */}
        {headerRight ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {headerRight}
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            {onHint && <ScallopHintButton size="sm" onClick={onHint} />}

            <AudioControlButton
              size="sm"
              className={isLight ? '!w-10 !h-10 !min-w-[40px] !min-h-[40px] bg-white border border-slate-200/90 text-[#102A38] shadow-xs hover:bg-slate-50' : ''}
            />

            {onTogglePause && (
              <button
                type="button"
                onClick={onTogglePause}
                aria-label={isPaused ? t('nav.activity.resume') : t('nav.activity.pause')}
                className={`rounded-full transition-all duration-200 ease-out cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15586E] active:scale-95 ${
                  isLight
                    ? 'w-10 h-10 min-w-[40px] min-h-[40px] bg-white border border-slate-200/90 text-[#102A38] shadow-xs hover:bg-slate-50 hover:scale-105'
                    : 'w-11 h-11 min-w-[44px] min-h-[44px] bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-xs'
                }`}
              >
                {isPaused ? <Play className="w-4 h-4 text-[#15586E] fill-current" /> : <Pause className="w-4 h-4 text-[#102A38]" />}
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Activity Canvas / Stacking Stage */}
      <main className="flex-1 w-full relative flex flex-col items-center justify-center overflow-hidden">
        {children}
      </main>
    </div>
  );
}
