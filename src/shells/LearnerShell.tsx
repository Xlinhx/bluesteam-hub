import React from 'react';
import { useRouter } from '../app/router';
import { useI18n } from '../shared/i18n/I18nContext';
import { BlueSteamLogo } from '../shared/components/BlueSteamLogo';
import { LanguageToggle } from '../shared/components/LanguageToggle';
import { BookOpen, Compass, Gamepad2, Palette, User } from 'lucide-react';

export type LearnerNavKey = 'home' | 'resources' | 'learn' | 'interactive' | 'creative' | 'profile';

export interface LearnerShellProps {
  children: React.ReactNode;
  activeNav?: LearnerNavKey;
  learnerName?: string;
}

export function LearnerShell({
  children,
  activeNav,
  learnerName = 'Bé An',
}: LearnerShellProps) {
  const { navigate } = useRouter();
  const { t } = useI18n();

  const navItems = [
    { key: 'resources', label: t('nav.learner.resources'), path: '/resources', icon: BookOpen },
    { key: 'learn', label: t('nav.learner.learn'), path: '/learn', icon: Compass },
    { key: 'interactive', label: t('nav.learner.interactive'), path: '/interactive', icon: Gamepad2 },
    { key: 'creative', label: t('nav.learner.creative'), path: '/creative', icon: Palette },
    { key: 'profile', label: t('nav.learner.profile'), path: '/profile', icon: User },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EB] text-[#12384B] font-sans pb-20 lg:pb-0 selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header - 72px desktop, 64px tablet/mobile */}
      <header className="sticky top-0 z-40 w-full h-16 lg:h-[72px] bg-[#F6F3EB]/95 backdrop-blur-md border-b border-[#17657A]/15 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
          {/* Brand Logo Left */}
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17657A] rounded-xl p-1 -ml-1 transition-opacity hover:opacity-90"
            aria-label="Về trang chủ học tập"
          >
            <BlueSteamLogo size="md" />
          </button>

          {/* Desktop Navigation (>= 1024px) - Exact 5 Items in Order */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Điều hướng học sinh">
            {navItems.map((item) => {
              const isActive = activeNav === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-extrabold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-white bg-[#17657A] shadow-[0_2px_8px_rgba(23,101,122,0.25)]'
                      : 'text-[#12384B]/80 hover:text-[#12384B] hover:bg-black/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F67650]' : 'text-[#17657A]'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: LanguageToggle + Kid Avatar */}
          <div className="flex items-center gap-2.5 lg:gap-3">
            <LanguageToggle />

            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full bg-white/90 border border-[#17657A]/20 shadow-xs hover:border-[#17657A] hover:bg-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17657A]"
              aria-label={`Hồ sơ của ${learnerName}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#17657A] flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-inner">
                <svg className="w-5 h-5 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 12c3-3 6-3 9 0s6 3 9 0" />
                  <path d="M2 17c3-3 6-3 9 0s6 3 9 0" opacity="0.6" />
                </svg>
              </div>
              <span className="font-extrabold text-sm text-[#12384B] flex items-center gap-1">
                {learnerName}
                <svg className="w-3.5 h-3.5 text-[#12384B]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 w-full">{children}</main>

      {/* Bottom Navigation for Learner on Mobile / Tablet (< 1024px) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[68px] bg-[#F6F3EB]/98 backdrop-blur-md border-t border-[#17657A]/20 px-2 flex items-center justify-around shadow-[0_-4px_16px_rgba(18,56,75,0.08)]"
        aria-label="Điều hướng chính di động"
      >
        {navItems.map((item) => {
          const isActive = activeNav === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[56px] px-2 rounded-2xl transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-[#17657A] scale-105 font-extrabold'
                  : 'text-[#12384B]/60 hover:text-[#12384B] font-semibold'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-[#17657A]/15 text-[#F67650]' : 'text-[#17657A]'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[11px] leading-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
