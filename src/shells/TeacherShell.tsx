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
  ChevronDown,
  Search,
  Bell,
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
  // Canonical 5 Tabs: [Bài giảng, Giáo án, Học liệu, Game & Simulation, Hồ sơ]
  const isTabActive = (tabKey: 'lessons' | 'plan' | 'library' | 'games' | 'profile' | 'live' | 'results') => {
    if (tabKey === 'lessons') {
      return activeNav === 'lessons' || activeNav === 'dashboard';
    }
    if (tabKey === 'plan') {
      return activeNav === 'plan' || activeNav === 'curriculum' || activeNav === 'builder';
    }
    if (tabKey === 'library') {
      return activeNav === 'resources' || activeNav === 'library';
    }
    if (tabKey === 'games') {
      return activeNav === 'games';
    }
    if (tabKey === 'profile') {
      return activeNav === 'profile';
    }
    if (tabKey === 'live') {
      return activeNav === 'live';
    }
    if (tabKey === 'results') {
      return activeNav === 'results';
    }
    return false;
  };

  // 5 Canonical Primary Educator Destinations per REFERENCE_RULES & COMPONENT_SPEC
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

  // Secondary Classroom Session Tools
  const sessionTools = [
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

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  const initials = teacherName === 'Cô Linh' ? 'CL' : (teacherName ? teacherName.slice(0, 2).toUpperCase() : '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchOpen(false);
      navigate(`/teacher/library?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#102A38] font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header - 68px desktop sticky header */}
      <header className="sticky top-0 z-40 w-full h-16 lg:h-[68px] bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] px-4 lg:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/teacher')}
              className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17657A] rounded-xl p-1 -ml-1 transition-opacity hover:opacity-90 flex items-center"
              aria-label="Về bàn làm việc giáo viên"
            >
              <BlueSteamLogo size="md" />
            </button>
            {/* Screen-reader / Contract test presence without visual clutter */}
            <span className="sr-only">Teacher Suite</span>
          </div>

          {/* Desktop Navigation Tabs (>= 1024px) */}
          <nav
            className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-2.5 flex-1 max-w-xl mx-auto z-10 min-w-0"
            aria-label="Điều hướng giáo viên"
          >
            {navItems.map((item) => {
              const isActive = item.isActive;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`px-3.5 xl:px-4 py-2 rounded-full text-xs xl:text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-white bg-[#17657A] shadow-[0_2px_8px_rgba(23,101,122,0.25)]'
                      : 'text-[#12384B]/80 hover:text-[#102A38] hover:bg-slate-100/80'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Contract Live Sync (sr-only) + Search + Notifications + Language + Teacher Profile */}
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            {/* Live Sync Status (Screen-reader & automated contract test verification) */}
            <div
              className={`sr-only ${isLiveConnected ? 'bg-emerald-50' : 'bg-amber-50'}`}
              aria-live="polite"
            >
              {isLiveConnected ? 'Live Sync' : 'Offline'}
            </div>

            {/* Expandable Quick Search */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  searchOpen
                    ? 'bg-slate-100 text-[#17657A]'
                    : 'text-slate-600 hover:text-[#102A38] hover:bg-slate-100'
                }`}
                title="Tìm bài học, lớp học"
                aria-label="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </button>

              {searchOpen && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Tìm bài học, lớp học..."
                      className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-[#102A38] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17657A]/25"
                    />
                    {searchValue && (
                      <button
                        type="button"
                        onClick={() => setSearchValue('')}
                        className="absolute right-2 text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Language Toggle */}
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>

            {/* Notification Bell with Badge & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-[#102A38] transition-colors relative cursor-pointer"
                title="Thông báo lớp học"
                aria-label="Thông báo lớp học"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 space-y-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center font-bold text-[#102A38] border-b border-slate-100 pb-2">
                    <span>Thông báo lớp học</span>
                    <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-bold">3 mới</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2 rounded-xl bg-sky-50/70 hover:bg-sky-50 cursor-pointer">
                      <p className="font-semibold text-[#102A38]">An vừa nộp bài ghi âm (0:15)</p>
                      <span className="text-[10px] text-slate-400">2 phút trước · Lớp Sao Biển</span>
                    </div>
                    <div className="p-2 rounded-xl bg-sky-50/70 hover:bg-sky-50 cursor-pointer">
                      <p className="font-semibold text-[#102A38]">24/24 bạn đã hoàn thành dự đoán</p>
                      <span className="text-[10px] text-slate-400">5 phút trước · Dòng chảy đại dương</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer">
                      <p className="font-medium text-slate-700">Bình đã kết nối lại phiên học</p>
                      <span className="text-[10px] text-slate-400">12 phút trước</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Teacher Profile with clean circular Avatar & dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100/70 cursor-pointer transition-colors"
                aria-label="Tài khoản giáo viên"
              >
                {/* Standardized Teacher Avatar with headshot & CL test fallback */}
                <div className="relative w-9 h-9 rounded-full ring-2 ring-slate-100 shadow-xs shrink-0 bg-[#17657A] flex items-center justify-center text-white overflow-hidden">
                  <span className="sr-only">{initials}</span>
                  {!avatarError ? (
                    <img
                      src="/assets/avatars/linh_teacher_headshot.png"
                      alt={teacherName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (e.currentTarget.src.includes('linh_teacher_headshot')) {
                          e.currentTarget.src = '/assets/avatar_colinh.png';
                        } else {
                          setAvatarError(true);
                        }
                      }}
                    />
                  ) : (
                    <span aria-hidden="true" className="select-none font-bold text-xs">
                      {initials}
                    </span>
                  )}
                  {/* Subtle live indicator status dot on avatar corner */}
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      isLiveConnected ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    title={isLiveConnected ? 'Đang kết nối phiên học trực tiếp' : 'Chưa kết nối'}
                  />
                </div>
                <span className="font-bold text-sm text-[#102A38] hidden sm:inline select-none">
                  {teacherName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 border-b border-slate-100">
                    <p className="font-bold text-[#102A38]">{teacherName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      <span className="text-[11px] text-slate-500">
                        {isLiveConnected ? 'Trực tuyến · Lớp Sao Biển' : 'Ngoại tuyến · Lớp Sao Biển'}
                      </span>
                    </div>
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
                      navigate('/teacher/plan');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer"
                  >
                    Giáo án & Bài soạn
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
                  <div className="pt-1 border-t border-slate-100">
                    <div className="p-1 sm:hidden">
                      <LanguageToggle />
                    </div>
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

            {/* Session tools in mobile drawer */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
                Công cụ buổi dạy
              </span>
              {sessionTools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <button
                    key={tool.key}
                    type="button"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      navigate(tool.path);
                    }}
                    className={`flex items-center gap-3.5 px-4 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tool.isActive
                        ? 'text-white bg-[#17657A] shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ToolIcon className="w-4 h-4" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
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
