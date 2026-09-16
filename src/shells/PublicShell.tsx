import React, { useState, useEffect } from 'react';
import { useRouter } from '../app/router';
import { useI18n } from '../shared/i18n/I18nContext';
import { BlueSteamLogo } from '../shared/components/BlueSteamLogo';
import { LanguageToggle } from '../shared/components/LanguageToggle';
import { CoralButton } from '../shared/components/CoralButton';
import { Menu, X, BookOpen, Compass, Gamepad2, Palette, Sparkles } from 'lucide-react';

export interface PublicShellProps {
  children: React.ReactNode;
  activeNav?: 'resources' | 'interactive' | 'creative';
  variant?: 'landing' | 'default';
}

const LANDING_NAV_ITEMS = [
  { key: 'beat2', label: 'Sinh cảnh', targetId: 'beat2', icon: Compass },
  { key: 'beat3', label: 'Sinh vật 3D', targetId: 'beat3', icon: Sparkles },
  { key: 'beat4', label: 'Tương tác', targetId: 'beat4', icon: Gamepad2 },
  { key: 'beat5', label: 'Sáng tạo', targetId: 'beat5', icon: Palette },
  { key: 'beat6', label: 'Bài giảng', targetId: 'beat6', icon: BookOpen },
] as const;

export function PublicShell({ children, activeNav, variant = 'default' }: PublicShellProps) {
  const { navigate } = useRouter();
  const { t } = useI18n();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeLandingSection, setActiveLandingSection] = useState<string>('');

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // Handle ESC key to dismiss drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth scroll to in-page section with sticky header offset
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 68;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Track active section on landing page via scroll listener
  useEffect(() => {
    if (variant !== 'landing') return;

    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      const headerOffset = 120;
      const sections = ['beat6', 'beat5', 'beat4', 'beat3', 'beat2'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - headerOffset;
          if (scrollY >= top) {
            setActiveLandingSection(id);
            return;
          }
        }
      }
      setActiveLandingSection('');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant]);

  const navItems = [
    { key: 'resources', label: t('nav.public.resources'), path: '/resources', icon: BookOpen },
    { key: 'interactive', label: t('nav.public.interactive'), path: '/interactive', icon: Gamepad2 },
    { key: 'creative', label: t('nav.public.creative'), path: '/creative', icon: Palette },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EB] text-[#12384B] font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header - 68px desktop, 64px mobile */}
      <header
        className="sticky top-0 z-40 w-full h-16 lg:h-[68px] bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] px-4 lg:px-8 transition-colors"
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between relative gap-4">
          {/* Brand Logo Left */}
          <button
            type="button"
            onClick={() => {
              if (variant === 'landing') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/');
              }
            }}
            className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17657A] rounded-xl p-1 -ml-1 transition-opacity hover:opacity-90 flex items-center z-10"
            aria-label="Về trang chủ BlueSTEAM"
          >
            <BlueSteamLogo size="md" />
          </button>

          {/* Desktop Navigation (>= 1024px) - Clean typography matching Mockup */}
          <nav
            className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-2.5 flex-1 max-w-xl mx-auto z-10 min-w-0"
            aria-label="Điều hướng công khai"
          >
            {variant === 'landing' ? (
              LANDING_NAV_ITEMS.map((item) => {
                const isActive = activeLandingSection === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => scrollToSection(item.targetId)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-white bg-[#17657A] shadow-[0_2px_8px_rgba(23,101,122,0.25)]'
                        : 'text-[#12384B]/80 hover:text-[#102A38] hover:bg-slate-100/80'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })
            ) : (
              navItems.map((item) => {
                const isActive = activeNav === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-white bg-[#17657A] shadow-[0_2px_8px_rgba(23,101,122,0.25)]'
                        : 'text-[#12384B]/80 hover:text-[#102A38] hover:bg-slate-100/80'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })
            )}
          </nav>

          {/* Right Controls: Language Toggle + Login + Join Class */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0 z-10">
            <LanguageToggle />

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-3.5 py-2 rounded-full text-sm font-semibold text-[#17657A] hover:bg-[#17657A]/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17657A] whitespace-nowrap"
            >
              {t('nav.public.login')}
            </button>

            <CoralButton
              size="sm"
              isKidFriendly={false}
              onClick={() => navigate('/entry')}
            >
              {t('nav.public.join')}
            </CoralButton>
          </div>

          {/* Mobile Right Bar (< 1024px) */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageToggle />
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="min-w-[48px] min-h-[48px] p-2.5 rounded-2xl bg-white/80 border border-[#17657A]/20 text-[#12384B] hover:bg-white flex items-center justify-center cursor-pointer transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17657A]"
              aria-label="Mở menu điều hướng"
              aria-expanded={mobileDrawerOpen}
            >
              <Menu className="w-6 h-6 text-[#12384B]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Backdrop & Sheet (< 1024px) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-start">
          {/* Dimmed backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet Container */}
          <div className="relative w-full bg-[#F6F3EB] rounded-b-[32px] shadow-2xl border-b border-[#17657A]/20 px-6 pt-5 pb-8 flex flex-col gap-4 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto z-10">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#17657A]/15">
              <BlueSteamLogo size="sm" />
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="min-w-[48px] min-h-[48px] p-2 rounded-2xl bg-black/5 hover:bg-black/10 text-[#12384B] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Đóng menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Nav Items List */}
            <nav className="flex flex-col gap-2 py-2" aria-label="Menu di động">
              {variant === 'landing' ? (
                LANDING_NAV_ITEMS.map((item) => {
                  const isActive = activeLandingSection === item.key;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        setTimeout(() => {
                          scrollToSection(item.targetId);
                        }, 100);
                      }}
                      className={`flex items-center gap-3.5 px-4 min-h-[52px] rounded-2xl text-base font-extrabold transition-all cursor-pointer ${
                        isActive
                          ? 'text-white bg-[#17657A] shadow-sm'
                          : 'text-[#12384B] hover:bg-[#17657A]/10'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#F67650]' : 'text-[#17657A]'}`} />
                      {item.label}
                    </button>
                  );
                })
              ) : (
                navItems.map((item) => {
                  const isActive = activeNav === item.key;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        navigate(item.path);
                      }}
                      className={`flex items-center gap-3.5 px-4 min-h-[52px] rounded-2xl text-base font-extrabold transition-all cursor-pointer ${
                        isActive
                          ? 'text-white bg-[#17657A] shadow-sm'
                          : 'text-[#12384B] hover:bg-[#17657A]/10'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#F67650]' : 'text-[#17657A]'}`} />
                      {item.label}
                    </button>
                  );
                })
              )}
            </nav>

            {/* Drawer Footer Actions: Unauthenticated Login & Join Class */}
            <div className="pt-4 border-t border-[#17657A]/15 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate('/login');
                }}
                className="w-full min-h-[48px] rounded-2xl text-center text-base font-extrabold text-[#17657A] bg-white border border-[#17657A]/25 shadow-xs hover:bg-[#17657A]/5 transition-colors cursor-pointer"
              >
                {t('nav.public.login')}
              </button>

              <CoralButton
                size="md"
                isKidFriendly={false}
                className="w-full justify-center"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate('/entry');
                }}
              >
                {t('nav.public.join')}
              </CoralButton>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
