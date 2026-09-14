import type { ReactNode } from 'react';
import { useRouter } from '../app/router';
import { useI18n } from '../shared/i18n/I18nContext';
import { ArrowLeft, Pause, Play } from 'lucide-react';
import { ScallopHintButton } from '../shared/components/ScallopHintButton';
import { AudioControlButton } from '../shared/components/AudioControlButton';
import { BlueSteamLogo } from '../shared/components/BlueSteamLogo';

export interface ActivityShellProps {
  title?: string;
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
  onHint?: () => void;
  isPaused?: boolean;
  onTogglePause?: () => void;
  showLogo?: boolean;
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
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
  headerCenter,
  headerRight,
  children,
}: ActivityShellProps) {
  const { navigate } = useRouter();
  const { t } = useI18n();

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
    <div className="relative min-h-screen flex flex-col bg-[#0B232F] text-[#F6F3EB] font-sans select-none overflow-hidden">
      {/* Activity Top Bar - Minimal, focused, 72px desktop */}
      <header className="relative z-50 w-full h-16 lg:h-[72px] bg-[#12384B]/85 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Back Button & Optional BlueSTEAM Wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label={t('nav.activity.back')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all active:scale-95 cursor-pointer min-w-[56px] min-h-[56px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6CA]"
          >
            <ArrowLeft className="w-6 h-6 text-[#2EE6CA]" />
            <span className="hidden sm:inline text-sm">{t('nav.activity.back')}</span>
          </button>

          {showLogo && (
            <div className="hidden md:flex items-center pl-1">
              <BlueSteamLogo size="sm" variant="light" />
            </div>
          )}
        </div>

        {/* Center: Custom headerCenter OR Default Activity Title & Progress Beads */}
        {headerCenter ? (
          <div className="flex items-center justify-center flex-1 max-w-xl">
            <span className="sr-only font-serif tracking-[-0.02em]">{title}</span>
            {headerCenter}
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-md text-center">
            <h1 className="font-serif font-black text-base sm:text-lg lg:text-xl text-white tracking-[-0.02em] truncate max-w-[240px] sm:max-w-md">
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
                        : 'w-2 bg-white/20'
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

            <AudioControlButton size="sm" />

            {onTogglePause && (
              <button
                type="button"
                onClick={onTogglePause}
                aria-label={isPaused ? t('nav.activity.resume') : t('nav.activity.pause')}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white min-w-[48px] min-h-[48px] flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F67650]"
              >
                {isPaused ? <Play className="w-5 h-5 text-[#F67650]" /> : <Pause className="w-5 h-5" />}
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
