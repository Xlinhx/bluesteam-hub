import React from 'react';
import { useRouter } from '../../app/router';
import {
  Home,
  BookOpen,
  Edit3,
  Users,
  BarChart2,
  HelpCircle,
  Settings,
  Bell,
  Search,
  ChevronDown,
} from 'lucide-react';

export type TeacherNavTab = 'dashboard' | 'library' | 'builder' | 'live' | 'results';

interface TeacherLayoutProps {
  activeTab: TeacherNavTab;
  children: React.ReactNode;
  hideSidebar?: boolean; // For presentation or special views
}

export function TeacherLayout({ activeTab, children, hideSidebar = false }: TeacherLayoutProps) {
  const { navigate } = useRouter();

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home, route: '/teacher' },
    { id: 'library', label: 'Thư viện', icon: BookOpen, route: '/teacher/library' },
    { id: 'builder', label: 'Soạn bài', icon: Edit3, route: '/teacher/builder' },
    { id: 'live', label: 'Lớp học', icon: Users, route: '/teacher/live' },
    { id: 'results', label: 'Kết quả', icon: BarChart2, route: '/teacher/results' },
  ];

  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [classroomAudioVol, setClassroomAudioVol] = React.useState(80);
  const [autoAdvance, setAutoAdvance] = React.useState(true);

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-neutral-900 font-sans flex flex-col md:flex-row">
      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-sky-950">Trung tâm Hỗ trợ Giáo viên</h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-neutral-700">
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-1">
                <p className="font-bold text-sky-950">Hướng dẫn nhanh cho Lớp Sao Biển:</p>
                <p className="text-neutral-600 leading-relaxed">
                  1. Chọn bài học tại Thư viện hoặc tạo bài tại Soạn bài.<br />
                  2. Chuyển sang tab Lớp học để phát mã PIN (482915) cho học sinh vào lớp.<br />
                  3. Bật Trình chiếu lên màn hình lớn bằng nút "Mở Trình chiếu" góc trên.<br />
                  4. Sau buổi học, vào tab Kết quả để xem thống kê và tải báo cáo tổng kết.
                </p>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="font-semibold text-neutral-800">Cần trợ giúp trực tiếp từ kỹ thuật viên?</span>
                <a
                  href="tel:18006886"
                  className="px-3 py-1.5 rounded-lg bg-sky-900 text-white font-bold text-[11px] hover:bg-sky-800 transition"
                >
                  Hotline 1800 6886
                </a>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-5 py-2 rounded-xl bg-sky-900 text-white text-xs font-bold hover:bg-sky-800 transition shadow"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-sky-950">Cài đặt Hệ thống Lớp học</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-xs text-neutral-700">
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Âm lượng âm thanh phòng học</span>
                  <span className="text-sky-700 font-bold">{classroomAudioVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={classroomAudioVol}
                  onChange={(e) => setClassroomAudioVol(Number(e.target.value))}
                  className="w-full accent-sky-700 cursor-pointer"
                />
              </div>
              <label className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                <span className="font-medium text-neutral-800">Tự động đồng bộ màn hình Trình chiếu</span>
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
              </label>
              <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-[11px] text-sky-900">
                <span className="font-bold">Lớp học hiện tại:</span> Lớp Sao Biển · 24 Học sinh · Trạng thái: Đang kết nối
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2 rounded-xl bg-sky-900 text-white text-xs font-bold hover:bg-sky-800 transition shadow"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Navigation Sidebar */}
      {!hideSidebar && (
        <aside className="w-full md:w-64 bg-white border-r border-sky-100 flex flex-col justify-between shrink-0 p-5 shadow-sm">
          <div className="space-y-6">
            {/* Ocean Logo */}
            <div className="flex items-center gap-2 px-2">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold font-serif text-sky-950 tracking-tight cursor-pointer hover:text-sky-700 transition"
              >
                Ocean
              </button>
            </div>

            {/* 5 Navigation items */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.route)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-900 text-white shadow-md'
                        : 'text-neutral-600 hover:text-sky-950 hover:bg-sky-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Tools */}
          <div className="space-y-2 pt-6 border-t border-sky-100">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:text-sky-950 hover:bg-sky-50 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-neutral-400" />
              <span>Trợ giúp</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:text-sky-950 hover:bg-sky-50 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-neutral-400" />
              <span>Cài đặt</span>
            </button>

            {/* Slogan */}
            <div className="pt-2 px-2 text-center text-[11px] text-sky-800/80 font-medium">
              <span className="text-sky-500 font-bold block text-sm mb-0.5">〜</span>
              Cùng đại dương lớn lên mỗi ngày
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-sky-100 px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-4 shadow-sm">
          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm bài học, lớp học..."
              className="w-full pl-10 pr-4 py-2 bg-sky-50/70 border border-sky-100 rounded-2xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Presentation Quick Launch Button */}
            <button
              onClick={() => navigate('/presentation')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-semibold transition cursor-pointer"
              title="Mở màn hình chiếu lớn cho cả lớp"
            >
              <span>Trình chiếu lớp</span>
            </button>

            {/* Bell Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-full hover:bg-sky-50 text-neutral-500 hover:text-sky-900 transition-colors relative cursor-pointer"
                title="Thông báo"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-sky-100 p-3 space-y-2 z-50 text-xs animate-fade-in">
                  <div className="flex justify-between items-center font-bold text-sky-950 border-b border-sky-100 pb-2">
                    <span>Thông báo lớp học</span>
                    <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">3 mới</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2 rounded-xl bg-sky-50/60 hover:bg-sky-50 cursor-pointer">
                      <p className="font-semibold text-sky-950">An vừa nộp bài ghi âm (0:15)</p>
                      <span className="text-[10px] text-neutral-400">2 phút trước · Lớp Sao Biển</span>
                    </div>
                    <div className="p-2 rounded-xl bg-sky-50/60 hover:bg-sky-50 cursor-pointer">
                      <p className="font-semibold text-sky-950">24/24 bạn đã hoàn thành dự đoán</p>
                      <span className="text-[10px] text-neutral-400">5 phút trước · Dòng chảy đại dương</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 cursor-pointer">
                      <p className="font-medium text-neutral-700">Bình đã kết nối lại phiên học</p>
                      <span className="text-[10px] text-neutral-400">12 phút trước</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cô Linh Profile Dropdown */}
            <div className="relative">
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 pl-3 border-l border-sky-100 cursor-pointer hover:opacity-90 transition select-none"
              >
                <img
                  src="/assets/avatar_colinh.png"
                  alt="Cô Linh"
                  className="w-9 h-9 rounded-full object-cover border-2 border-sky-400 shadow-sm"
                />
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-xs text-sky-950 block leading-tight">Cô Linh</span>
                  <span className="text-[10px] text-neutral-500 block leading-tight">Lớp Sao Biển</span>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-sky-100 p-2 space-y-1 z-50 text-xs animate-fade-in">
                  <div className="p-2.5 border-b border-sky-100">
                    <p className="font-bold text-sky-950">Cô Thùy Linh</p>
                    <p className="text-[11px] text-neutral-500">Giáo viên Mầm non Sao Biển</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/teacher');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-sky-50 text-neutral-700 font-medium transition cursor-pointer"
                  >
                    Bảng điều khiển
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-sky-50 text-neutral-700 font-medium transition cursor-pointer"
                  >
                    Cài đặt tài khoản
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/login');
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-rose-50 text-rose-700 font-semibold transition cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
