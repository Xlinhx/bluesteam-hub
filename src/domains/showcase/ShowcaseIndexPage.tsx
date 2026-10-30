import { useState } from 'react';
import { useRouter } from '../../app/router';
import {
  BLUESTEAM_V2_SCREENS,
  V2_CATEGORIES,
  V2ScreenMeta,
} from './v2ScreensData';
import { oceanAudio } from '../../shared/audio/oceanAudio';
import { V2ScreenModal } from './V2ScreenModal';
import {
  Play,
  RotateCcw,
  Sparkles,
  Eye,
  Users,
  GraduationCap,
  ArrowRight,
  Palette,
  Compass,
  CheckCircle2,
  Award,
  Search,
} from 'lucide-react';

export function ShowcaseIndexPage() {
  const { navigate } = useRouter();

  // V2 state
  const [selectedV2Category, setSelectedV2Category] = useState<string>('all');
  const [v2SearchTerm, setV2SearchTerm] = useState('');
  const [activeV2ModalScreen, setActiveV2ModalScreen] = useState<V2ScreenMeta | null>(null);
  const [resetFeedback, setResetFeedback] = useState(false);

  // Filtered V2 screens
  const filteredV2Screens = BLUESTEAM_V2_SCREENS.filter((screen) => {
    const matchesCategory =
      selectedV2Category === 'all' || screen.category === selectedV2Category;
    const matchesSearch =
      v2SearchTerm === '' ||
      screen.name.toLowerCase().includes(v2SearchTerm.toLowerCase()) ||
      screen.route.toLowerCase().includes(v2SearchTerm.toLowerCase()) ||
      screen.reviewId.toLowerCase().includes(v2SearchTerm.toLowerCase()) ||
      screen.squad.toLowerCase().includes(v2SearchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleResetDemo = () => {
    setResetFeedback(true);
    oceanAudio.playChime(520, 0.2);
    setTimeout(() => setResetFeedback(false), 2500);
  };

  const handleStartTour = (route: string) => {
    oceanAudio.playChime(660, 0.2);
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-[#071322] text-slate-100 font-sans selection:bg-sky-500 selection:text-white pb-24">
      {/* Modals */}
      {activeV2ModalScreen && (
        <V2ScreenModal
          screen={activeV2ModalScreen}
          onClose={() => setActiveV2ModalScreen(null)}
        />
      )}

      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-sky-900/50 bg-gradient-to-b from-[#0a1e38] via-[#071629] to-[#071322] px-6 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300 text-xs font-mono font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>BLUESTEAM · HỒ SƠ ĐỐI CHIẾU LỊCH SỬ</span>
            </div>

            {/* Quick Demo Reset Button */}
            <button
              onClick={handleResetDemo}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                resetFeedback
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950'
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:border-sky-500'
              }`}
              title="Khôi phục trạng thái 24 học sinh, kết quả khảo sát và giáo án"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetFeedback ? 'animate-spin' : ''}`} />
              <span>{resetFeedback ? 'Đã đặt lại dữ liệu mẫu' : 'Đặt lại dữ liệu mẫu'}</span>
            </button>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              Ocean Immersive Learning <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-200">
                Web Showcase Hub
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              <strong>39 bản ghi đối chiếu lịch sử.</strong> Ảnh, điểm và trạng thái được giữ theo lần ghi nhận cũ; không chứng nhận thiết kế hoặc chức năng hiện tại.
            </p>
          </div>

          {/* Highlights & Metrics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-sky-950/50 border border-sky-800/60 backdrop-blur-xs">
              <div className="text-2xl font-bold font-mono text-sky-300">39 / 39</div>
              <div className="text-xs text-slate-400">Bản ghi lịch sử</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-950/50 border border-sky-800/60 backdrop-blur-xs">
              <div className="text-2xl font-bold font-mono text-cyan-300">10 Squads</div>
              <div className="text-xs text-slate-400">Chuyên trách độc quyền</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-950/50 border border-sky-800/60 backdrop-blur-xs">
              <div className="text-2xl font-bold font-mono text-teal-300">97.6 / 100</div>
              <div className="text-xs text-slate-400">Điểm Rubric TB (Tất cả ≥96)</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-950/50 border border-sky-800/60 backdrop-blur-xs">
              <div className="text-2xl font-bold font-mono text-emerald-300">464 Tests</div>
              <div className="text-xs text-slate-400">Vitest PASS 100% (39 suites)</div>
            </div>
          </div>

          {/* 4 Guided Tours Launchers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
            {/* Tour 1: Learner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/70 to-blue-950/50 border border-sky-800/60 hover:border-sky-400 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-1.5 text-sky-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Kịch bản 1</span>
                </div>
                <h3 className="text-sm font-serif font-bold text-white group-hover:text-sky-200 transition">
                  Hành trình Bé An
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">
                  Trang chủ → Trạm sóng → Rùa biển 3D → Sinh thái rạn san hô.
                </p>
              </div>
              <button
                onClick={() => handleStartTour('/home')}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Vào Tour Học sinh</span>
              </button>
            </div>

            {/* Tour 2: Teacher */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/70 to-purple-950/50 border border-indigo-800/60 hover:border-indigo-400 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-1.5 text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Kịch bản 2</span>
                </div>
                <h3 className="text-sm font-serif font-bold text-white group-hover:text-indigo-200 transition">
                  Lớp học Cô Linh
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">
                  Dashboard → Soạn bài 5 bước → Bàn điều khiển trực tiếp & Chuông tập trung.
                </p>
              </div>
              <button
                onClick={() => handleStartTour('/teacher')}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Vào Tour Giáo viên</span>
              </button>
            </div>

            {/* Tour 3: Creative Studio */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/70 to-orange-950/50 border border-amber-800/60 hover:border-amber-400 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Kịch bản 3</span>
                </div>
                <h3 className="text-sm font-serif font-bold text-white group-hover:text-amber-200 transition">
                  Xưởng Sáng Tạo 3D
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">
                  Vẽ sáp màu Crayon Canvas → Xây dựng sa bàn 3D → Chạy mô phỏng rạn san hô.
                </p>
              </div>
              <button
                onClick={() => handleStartTour('/creative')}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Vào Xưởng Sáng Tạo</span>
              </button>
            </div>

            {/* Tour 4: Simulations */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-950/70 to-emerald-950/50 border border-teal-800/60 hover:border-teal-400 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-1.5 text-teal-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Kịch bản 4</span>
                </div>
                <h3 className="text-sm font-serif font-bold text-white group-hover:text-teal-200 transition">
                  Mô phỏng Đại dương
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">
                  Lựa chọn hành động → So sánh tác động → Hành trình rác thải nhựa → Cứu hộ NOAA.
                </p>
              </div>
              <button
                onClick={() => handleStartTour('/interactive/simulations')}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Vào Mô phỏng</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Showcase Gallery Area */}
      <main className="max-w-7xl mx-auto px-6 pt-10 space-y-8">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">

          <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm màn hình, route, squad..."
                value={v2SearchTerm}
                onChange={(e) => setV2SearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
              />
            </div>
        </div>

        {/* TAB 1: BLUESTEAM V2 (39 SCREENS) */}
        <div className="space-y-6">
            {/* Filter Squad Categories */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                {V2_CATEGORIES.map((cat) => {
                  const count =
                    cat.key === 'all'
                      ? BLUESTEAM_V2_SCREENS.length
                      : BLUESTEAM_V2_SCREENS.filter((s) => s.category === cat.key).length;
                  const isActive = selectedV2Category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedV2Category(cat.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-sky-600 text-white font-semibold shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] text-sky-300 font-mono">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Hiển thị <span className="text-sky-400 font-bold">{filteredV2Screens.length}</span> / 39 màn hình
              </div>
            </div>

            {/* V2 Screens Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredV2Screens.map((screen) => {
                const screenshotUrl = '/' + screen.screenshotPath;
                return (
                  <div
                    key={screen.reviewId}
                    className="flex flex-col justify-between bg-slate-900/90 border border-slate-800 hover:border-sky-500/70 rounded-3xl overflow-hidden transition-all duration-200 group shadow-lg hover:shadow-sky-950/50"
                  >
                    {/* Card Thumbnail Area */}
                    <div className="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800/80">
                      <img
                        src={screenshotUrl}
                        alt={screen.name}
                        className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300 brightness-[0.92] group-hover:brightness-100"
                        loading="lazy"
                      />

                      {/* Top Left: Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-sky-300 font-mono text-xs font-bold border border-sky-500/40">
                          #{String(screen.index).padStart(2, '0')}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-950/90 backdrop-blur-xs text-sky-200 text-[10px] font-medium border border-sky-800/50">
                          {screen.squad}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 backdrop-blur-xs text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          VERIFIED
                        </span>
                      </div>

                      {/* Top Right: Rubric Badge */}
                      {screen.score && (
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/90 backdrop-blur-xs text-amber-300 text-[11px] font-bold border border-amber-500/40 flex items-center gap-1 shadow-sm">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>{screen.score}/100</span>
                        </div>
                      )}

                      {/* Bottom strip inside thumbnail */}
                      <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-700/60 text-[11px] text-slate-400 font-mono">
                        <span className="truncate">{screen.route}</span>
                        <span>{screen.viewport.width}x{screen.viewport.height}</span>
                      </div>
                    </div>

                    {/* Card Info Content */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="text-[11px] text-sky-400 font-semibold tracking-wide uppercase">
                          {screen.squadName}
                        </div>
                        <h3 className="font-serif font-bold text-base text-white group-hover:text-sky-300 transition line-clamp-1">
                          {screen.name}
                        </h3>
                        {screen.setupSteps.length > 0 && (
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                            {screen.setupSteps.join(' · ')}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                        {/* Open live route */}
                        <button
                          onClick={() => navigate(screen.route)}
                          className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group-hover:shadow-sky-900/50"
                        >
                          <span>Mở xem thực tế</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Open V2 comparison modal */}
                        <button
                          onClick={() => setActiveV2ModalScreen(screen)}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1 cursor-pointer border border-slate-700"
                          title="Đối chiếu ảnh mockup gốc và screenshot kiểm chứng"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          <span className="hidden sm:inline">Đối chiếu</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

      </main>
    </div>
  );
}
