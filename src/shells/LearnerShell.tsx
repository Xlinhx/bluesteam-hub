import React from 'react';
import { useRouter } from '../app/router';
import { useI18n } from '../shared/i18n/I18nContext';
import { BlueSteamLogo } from '../shared/components/BlueSteamLogo';
import { LanguageToggle } from '../shared/components/LanguageToggle';
import { demoStore } from '../demo/storage/demoStore';

function HomeNavIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}



function UsersNavIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function BulbNavIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
    </svg>
  );
}

function UserNavIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export type LearnerNavKey = 'home' | 'resources' | 'learn' | 'interactive' | 'creative' | 'profile';

export interface LearnerShellProps {
  children: React.ReactNode;
  activeNav?: LearnerNavKey;
  learnerName?: string;
  learnerAvatar?: string;
}

export function LearnerShell({
  children,
  activeNav,
  learnerName = 'Bé An',
  learnerAvatar,
}: LearnerShellProps) {
  const { navigate } = useRouter();
  const { t } = useI18n();

  const profile = demoStore.getProfile();
  const rawAvatar =
    learnerAvatar ||
    (profile.role === 'student' ? profile.avatarKey : undefined);
  const effectiveAvatar =
    rawAvatar && (rawAvatar.startsWith('/') || rawAvatar.startsWith('http') || rawAvatar.startsWith('data:'))
      ? rawAvatar
      : '/assets/avatar_an.png';
  const effectiveName =
    learnerName !== 'Bé An'
      ? learnerName
      : (profile.role === 'student' && profile.name) || 'Bé An';

  const navItems = [
    { key: 'resources', label: t('nav.learner.resources'), path: '/resources', icon: HomeNavIcon },
    { key: 'interactive', label: t('nav.learner.interactive'), path: '/interactive', icon: UsersNavIcon },
    { key: 'creative', label: t('nav.learner.creative'), path: '/creative', icon: BulbNavIcon },
    { key: 'profile', label: t('nav.learner.profile'), path: '/profile', icon: UserNavIcon },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EB] text-[#12384B] font-sans pb-20 lg:pb-0 selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header - Warm ivory matching Mockup Image 2 */}
      <header className="sticky top-0 z-40 w-full h-16 lg:h-[68px] bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E4DA]/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] px-4 lg:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between relative gap-4">
          {/* Brand Logo Left */}
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17657A] rounded-xl p-1 -ml-1 transition-opacity hover:opacity-90 z-10"
            aria-label="Về trang chủ BlueSTEAM"
          >
            <BlueSteamLogo size="md" />
          </button>

          {/* Desktop Navigation (>= 1024px) - Exact 5 Items in Order - Clean typography & SVGs matching Mockup Image 2 */}
          <nav
            className="hidden lg:flex items-center justify-center gap-7 xl:gap-8 flex-1 max-w-2xl mx-auto z-10 min-w-0"
            aria-label="Điều hướng học sinh"
          >
            {navItems.map((item) => {
              const isActive = activeNav === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 py-1.5 transition-all duration-150 cursor-pointer whitespace-nowrap group ${
                    isActive
                      ? 'text-[#0B3B56] font-bold'
                      : 'text-[#0B3B56]/85 hover:text-[#0B3B56] font-medium'
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] lg:w-5 lg:h-5 transition-colors shrink-0 ${
                      isActive
                        ? 'text-[#0B3B56]'
                        : 'text-[#0B3B56]/85 group-hover:text-[#0B3B56]'
                    }`}
                  />
                  <span className="text-[15px] tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: LanguageToggle + Kid Avatar matching Mockup Image 2 */}
          <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0 z-10">
            <LanguageToggle />

            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-black/5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17657A] group"
              aria-label={`Hồ sơ của ${effectiveName}`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
                <img
                  src={effectiveAvatar}
                  alt={effectiveName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/avatar_an.png';
                  }}
                />
              </div>
              <span className="font-bold text-[15px] text-[#0B3B56] group-hover:text-[#17657A] flex items-center gap-1 transition-colors">
                {effectiveName}
                <svg className="w-3.5 h-3.5 text-[#0B3B56]/70 group-hover:text-[#17657A] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
