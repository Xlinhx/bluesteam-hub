import React, { useState, useEffect } from 'react';
import { useRouter } from '../app/router';
import { BlueSteamLogo } from '../shared/components/BlueSteamLogo';
import { LanguageToggle } from '../shared/components/LanguageToggle';
import {
  LayoutDashboard,
  BookText,
  Layers,
  BarChart2,
  Users,
  Menu,
  X,
  Wifi,
  ChevronDown,
} from 'lucide-react';

export type TeacherNavKey =
  | 'lessons'
  | 'curriculum'
  | 'resources'
  | 'games'
  | 'profile'
  | 'live'
  | 'results'
  | 'dashboard'
  | 'library'
  | 'builder'
  | 'plan';

export interface TeacherShellProps {
  children?: React.ReactNode;
  activeNav?: TeacherNavKey;
  teacherName?: string;
  isLiveConnected?: boolean;
}

export function TeacherShell({
  children,
  activeNav = 'lessons',
  teacherName = 'Cô Linh',
  isLiveConnected = true,
}: TeacherShellProps) {
  const { navigate } = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Map incoming activeNav aliases to standard educator destinations
  // Tabs: [Bài giảng, Giáo án, Học liệu, Lớp học, Kết quả]
  const isTabActive = (tabKey: 'lessons' | 'plan' | 'library' | 'live' | 'results') => {
    if (tabKey === 'lessons') {
      return activeNav === 'lessons' || activeNav === 'dashboard';
    }
    if (tabKey === 'plan') {
      return activeNav === 'plan' || activeNav === 'curriculum' || activeNav === 'builder';
    }
    if (tabKey === 'library') {
      return activeNav === 'resources' || activeNav === 'library';
    }
    if (tabKey === 'live') {
      return activeNav === 'live';
    }
    if (tabKey === 'results') {
      return activeNav === 'results';
    }
    return false;
  };

  const navItems = [
    {
      key: 'lessons' as const,
      label: 'Bài giảng',
      path: '/teacher',
      icon: LayoutDashboard,
      isActive: isTabActive('lessons'),
    },
    {
      key: 'plan' as const,
      label: 'Giáo án',
      path: '/teacher/builder?mode=plan',
      icon: BookText,
      isActive: isTabActive('plan'),
    },
    {
      key: 'library' as const,
      label: 'Học liệu',
      path: '/teacher/library',
      icon: Layers,
      isActive: isTabActive('library'),
    },
    {
      key: 'live' as const,
      label: 'Lớp học',
      path: '/teacher/live',
      icon: Users,
      isActive: isTabActive('live'),
    },
    {
      key: 'results' as const,
      label: 'Kết quả',
      path: '/teacher/results',
      icon: BarChart2,
      isActive: isTabActive('results'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#102A38] font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header - 72px desktop sticky header */}
      <header className="sticky top-0 z-40 w-full h-16 lg:h-[72px] bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
          {/* Logo with Teacher Tag */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/teacher')}
              className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17657A] rounded-xl p-1 -ml-1 transition-opacity hover:opacity-90"
              aria-label="Về bàn làm việc giáo viên"
            >
              <BlueSteamLogo size="md" />
            </button>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-lg bg-[#17657A]/10 text-[#17657A] text-[11px] font-extrabold uppercase tracking-wider border border-[#17657A]/15">
              Teacher Suite
            </span>
          </div>

          {/* Desktop Navigation Tabs (>= 1024px) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 h-full" aria-label="Điều hướng giáo viên">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer ${
                    item.isActive
                      ? 'text-[#102A38] font-black'
                      : 'text-slate-600 hover:text-[#102A38] hover:bg-slate-100/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      item.isActive ? 'text-[#102A38]' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.isActive && (
                    <span className="absolute bottom-[-16px] left-3 right-3 h-[3px] bg-[#102A38] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Live Sync Badge + Language Toggle + Teacher Avatar */}
          <div className="flex items-center gap-2.5 lg:gap-3">
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                isLiveConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
              title="Trạng thái đồng bộ BroadcastChannel"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isLiveConnected ? 'Live Sync' : 'Offline'}</span>
            </div>

            <LanguageToggle />

            {/* Teacher Profile with wave avatar & dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs cursor-pointer transition-colors"
                aria-label="Tài khoản giáo viên"
              >
                <div className="w-8 h-8 rounded-full bg-[#17657A] text-white flex items-center justify-center text-xs font-black tracking-wider shadow-inner">
                  {teacherName === 'Cô Linh' ? 'CL' : teacherName.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-extrabold text-sm text-[#102A38] hidden sm:inline">
                  {teacherName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 border-b border-slate-100">
                    <p className="font-bold text-[#102A38]">{teacherName}</p>
                    <p className="text-[11px] text-slate-500">Giáo viên Lớp Sao Biển</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/teacher');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer"
                  >
                    Bàn làm việc
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/teacher/results');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer"
                  >
                    Báo cáo buổi học
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/presentation');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-sky-50 text-sky-800 font-medium transition cursor-pointer"
                  >
                    Màn hình trình chiếu
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/login');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-rose-50 text-rose-700 font-semibold transition cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] p-2 rounded-2xl bg-white border border-slate-200 text-[#102A38] hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
              aria-label="Mở menu giáo viên"
              aria-expanded={mobileDrawerOpen}
            >
              <Menu className="w-5 h-5 text-[#102A38]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-start">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full bg-white rounded-b-[28px] shadow-2xl border-b border-slate-200 px-6 pt-5 pb-8 flex flex-col gap-4 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BlueSteamLogo size="sm" />
                <span className="px-2 py-0.5 rounded-md bg-[#17657A]/10 text-[#17657A] text-[11px] font-extrabold uppercase">
                  Teacher Suite
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#102A38] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      navigate(item.path);
                    }}
                    className={`flex items-center gap-3.5 px-4 min-h-[48px] rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      item.isActive
                        ? 'text-white bg-[#102A38] shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
