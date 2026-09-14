import { useState } from 'react';
import { useRouter } from '../../app/router';
import {
  ArrowRight,
  Search,
  X,
  Compass,
  BookOpen,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  Play,
  RotateCcw,
} from 'lucide-react';

export function ConceptBPage() {
  const { navigate } = useRouter();

  // Search Drawer
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Category Filter in Section 2
  const [activeCategory, setActiveCategory] = useState<'ecosystem' | 'creatures' | 'currents'>('ecosystem');

  // Simulation Widget State in Section 4
  const [windSpeed, setWindSpeed] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [buoyPos, setBuoyPos] = useState(50); // percentage

  const runSimulation = () => {
    setIsSimRunning(true);
    const step = windSpeed === 'low' ? 1.5 : windSpeed === 'medium' ? 3 : 5;
    let current = 25;
    const interval = setInterval(() => {
      current += step;
      if (current >= 80) {
        clearInterval(interval);
        setIsSimRunning(false);
        setBuoyPos(80);
      } else {
        setBuoyPos(current);
      }
    }, 100);
  };

  const resetSimulation = () => {
    setIsSimRunning(false);
    setBuoyPos(50);
  };

  // Specimen detail modal
  const [specimenModal, setSpecimenModal] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen bg-[#f7f9fa] text-slate-900 font-sans selection:bg-sky-200 selection:text-sky-900">
      {/* ========================================================
          1. HEADER (Ocean-Immerse Scientific Atlas Brand)
      ======================================================== */}
      <header className="sticky top-0 z-30 w-full bg-[#f7f9fa]/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-2xl font-serif font-bold tracking-tight text-[#08233b]">
              Ocean-Immerse
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <button
              onClick={() => navigate('/')}
              className="text-[#08233b] font-semibold border-b-2 border-[#08233b] pb-0.5"
            >
              Trang chủ
            </button>
            <button
              onClick={() => navigate('/student/explore')}
              className="hover:text-[#08233b] transition-colors cursor-pointer"
            >
              Khám phá
            </button>
            <button
              onClick={() => navigate('/student/progress')}
              className="hover:text-[#08233b] transition-colors cursor-pointer"
            >
              Bộ sưu tập
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Tìm kiếm bài học & tiêu bản"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Đăng nhập
            </button>

            <button
              onClick={() => navigate('/student')}
              className="px-5 py-2.5 rounded-full bg-[#08233b] text-white text-xs font-semibold hover:bg-sky-900 transition-all shadow-md cursor-pointer"
            >
              Bắt đầu ngay
            </button>
          </div>
        </div>

        {/* Quick Search Drawer */}
        {searchOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-3 shadow-inner">
            <div className="max-w-xl mx-auto flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tra cứu: Megaptera novaeangliae, Rạn san hô, Dòng hải lưu..."
                className="w-full bg-transparent text-slate-800 focus:outline-none"
                autoFocus
              />
              <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          2. HERO SECTION: KHOA HỌC THỰC SỰ. TRẢI NGHIỆM THỰC TẾ.
      ======================================================== */}
      <section className="relative w-full min-h-[580px] lg:min-h-[660px] bg-[#07243c] overflow-hidden text-white flex items-center">
        {/* Background Image: Giant Humpback Whale swimming in deep ocean */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/concepts/assets/hero_whale_b.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#07243c]/95 via-[#07243c]/70 to-[#07243c]/20" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f7f9fa] to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Left Column: Title & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block text-[11px] font-bold tracking-widest uppercase text-sky-300 font-mono">
              KHOA HỌC THỰC SỰ. TRẢI NGHIỆM THỰC TẾ.
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.12]">
              Khám phá đại dương <br className="hidden sm:inline" />
              như các nhà khoa học.
            </h1>

            <p className="text-lg text-slate-200 font-sans max-w-lg leading-relaxed">
              Tri thức hôm nay, đại dương ngày mai.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => navigate('/student')}
                className="px-7 py-3.5 rounded-full bg-[#08233b] hover:bg-[#0c3152] text-white border border-sky-400/40 font-semibold text-sm transition-all shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <span>Khám phá</span>
                <ArrowRight className="w-4 h-4 text-sky-300" />
              </button>

              <button
                onClick={() => navigate('/teacher')}
                className="px-7 py-3.5 rounded-full bg-white/95 hover:bg-white text-slate-900 font-semibold text-sm transition-all shadow-md cursor-pointer"
              >
                Dành cho giáo viên
              </button>
            </div>
          </div>

          {/* Right Column: Specimen Annotation Callout Box */}
          <div className="lg:col-span-5 flex justify-end">
            <div className="relative bg-[#051a2d]/85 backdrop-blur-md p-5 rounded-2xl border border-sky-400/30 text-white shadow-2xl max-w-sm w-full">
              {/* Pointer line indicator */}
              <div className="flex items-center gap-2 text-xs font-mono text-sky-300 border-b border-sky-400/20 pb-3 mb-4">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span className="font-serif italic font-bold">Cá voi lưng gù</span>
                <span className="text-slate-400">· Megaptera novaeangliae</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-[11px] text-slate-300 font-sans">Độ dài trung bình</div>
                  <div className="text-xl font-bold text-sky-200 mt-0.5">12 – 16 m</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-[11px] text-slate-300 font-sans">Độ sâu lặn</div>
                  <div className="text-xl font-bold text-sky-200 mt-0.5">đến 500 m</div>
                </div>
              </div>

              <button
                onClick={() => setSpecimenModal('humpback')}
                className="mt-4 w-full py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 rounded-xl text-xs font-semibold text-sky-200 transition-colors text-center cursor-pointer"
              >
                Xem chi tiết tiêu bản →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. SECTION 2: KHÁM PHÁ THEO CHỦ ĐỀ
      ======================================================== */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Khám phá theo chủ đề
            </h2>
            <p className="text-slate-600 mt-2 text-sm max-w-2xl">
              Những khía cạnh đa dạng của đại dương, được tuyển chọn bởi các nhà khoa học và nhà giáo dục.
            </p>
          </div>

          <button
            onClick={() => navigate('/student/explore')}
            className="text-sm font-semibold text-[#08233b] hover:text-sky-700 flex items-center gap-1 group self-start md:self-auto cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('ecosystem')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'ecosystem'
                ? 'bg-[#08233b] text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Hệ sinh thái
          </button>
          <button
            onClick={() => setActiveCategory('creatures')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'creatures'
                ? 'bg-[#08233b] text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Sinh vật biển
          </button>
          <button
            onClick={() => setActiveCategory('currents')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'currents'
                ? 'bg-[#08233b] text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Chuyển động biển
          </button>
        </div>

        {/* 2-Column Grid: Featured Coral Card + 4 Specimen List Items */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Featured Large Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg flex flex-col justify-between group hover:shadow-xl transition-all">
            <div className="relative h-72 sm:h-80 w-full overflow-hidden">
              <img
                src="/concepts/assets/coral_reef_panoramic.jpg"
                alt="Rạn san hô"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            </div>
            <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">Rạn san hô</h3>
                <h4 className="text-sm font-semibold text-sky-800 mt-1">Sự sống rực rỡ dưới làn nước</h4>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  Rạn san hô là những thành phố dưới biển, nơi sinh sống của hàng ngàn loài sinh vật và che chở hơn 25% hệ sinh thái đại dương toàn cầu.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate('/student/unit')}
                  className="px-6 py-2.5 rounded-full bg-[#08233b] hover:bg-sky-900 text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Khám phá chủ đề</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 4 List Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {/* 1. Cá hề */}
            <div
              onClick={() => setSpecimenModal('clownfish')}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <img
                  src="/concepts/assets/card_clownfish.jpg"
                  alt="Cá hề"
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                    Cá hề
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Cộng sinh cùng hải quỳ độc</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-800 group-hover:translate-x-1 transition-all" />
            </div>

            {/* 2. Rùa biển */}
            <div
              onClick={() => setSpecimenModal('turtle')}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <img
                  src="/concepts/assets/sea_turtle_reef.jpg"
                  alt="Rùa biển"
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                    Rùa biển
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Nhà du hành vượt ngàn hải lý</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-800 group-hover:translate-x-1 transition-all" />
            </div>

            {/* 3. Cá mập */}
            <div
              onClick={() => setSpecimenModal('shark')}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <img
                  src="/concepts/assets/card_shark.jpg"
                  alt="Cá mập"
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                    Cá mập
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Kẻ săn mồi có giác quan siêu việt</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-800 group-hover:translate-x-1 transition-all" />
            </div>

            {/* 4. Sứa biển */}
            <div
              onClick={() => setSpecimenModal('jellyfish')}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <img
                  src="/concepts/assets/card_jellyfish.jpg"
                  alt="Sứa biển"
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                    Sứa biển
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Ngọn đèn kỳ ảo dưới đáy sâu</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-800 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. SECTION 3: BÀI HỌC NỔI BẬT
      ======================================================== */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Bài học nổi bật
            </h2>
            <p className="text-slate-600 mt-2 text-sm">
              Những hành trình học tập được thiết kế cho mọi lứa tuổi.
            </p>
          </div>

          <button
            onClick={() => navigate('/teacher/library')}
            className="text-sm font-semibold text-[#08233b] hover:text-sky-700 flex items-center gap-1 group self-start md:self-auto cursor-pointer"
          >
            <span>Xem tất cả bài học</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Cuộc sống của rùa biển */}
          <div
            onClick={() => navigate('/student/journey')}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="relative h-52 overflow-hidden">
                <img
                  src="/concepts/assets/sea_turtle_reef.jpg"
                  alt="Cuộc sống của rùa biển"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                  Cuộc sống của rùa biển
                </h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    Sinh vật biển
                  </span>
                  <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold">
                    5–8 tuổi
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Rừng tảo bẹ kỳ diệu */}
          <div
            onClick={() => navigate('/student/journey')}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="relative h-52 overflow-hidden">
                <img
                  src="/concepts/assets/kelp_forest_player.jpg"
                  alt="Rừng tảo bẹ kỳ diệu"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                  Rừng tảo bẹ kỳ diệu
                </h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    Hệ sinh thái
                  </span>
                  <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold">
                    6–10 tuổi
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Dòng chảy đại dương */}
          <div
            onClick={() => navigate('/student/simulation')}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="relative h-52 overflow-hidden">
                <img
                  src="/concepts/assets/hero_whale_b.jpg"
                  alt="Dòng chảy đại dương"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                  Dòng chảy đại dương
                </h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    Chuyển động biển
                  </span>
                  <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold">
                    8–12 tuổi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. SECTION 4: HỌC QUA KHÁM PHÁ (VỚI WIDGET MÔ PHỎNG)
      ======================================================== */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Học qua khám phá
          </h2>
          <p className="text-slate-600 mt-2 text-sm">
            Quy trình khoa học được thiết kế sinh động, phù hợp với lớp học.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: 3 Scientific Steps */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#08233b] text-white flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-base">Quan sát</h4>
                <p className="text-xs text-slate-500 mt-1">Quan sát hiện tượng thực tế dưới lòng biển và đưa ra chú thích.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-base">Dự đoán</h4>
                <p className="text-xs text-slate-500 mt-1">Đưa ra giả thuyết: Khi hướng gió thay đổi, phao sẽ trôi về đâu?</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-base">Thử nghiệm</h4>
                <p className="text-xs text-slate-500 mt-1">Tương tác và kiểm chứng giả thuyết bằng mô phỏng trực quan.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Simulator Box */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#08233b] text-white px-6 py-4 flex items-center justify-between">
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-sky-300">
                Thử nghiệm: Dòng chảy bề mặt
              </div>
              <div className="text-[11px] text-slate-300">
                Mô phỏng hải lưu tương tác
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Simulation Canvas Area */}
              <div className="md:col-span-8 relative h-60 bg-gradient-to-b from-sky-300 to-sky-600 rounded-2xl overflow-hidden border border-sky-200 shadow-inner flex items-center justify-center">
                {/* Sea waves background */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]" />

                {/* Animated wind flow lines */}
                <div className="absolute inset-0 flex flex-col justify-around px-4 pointer-events-none opacity-60">
                  <div className={`h-0.5 bg-white/70 w-3/4 rounded-full ${isSimRunning ? 'animate-pulse' : ''}`} />
                  <div className={`h-0.5 bg-white/70 w-5/6 rounded-full self-end ${isSimRunning ? 'animate-pulse' : ''}`} />
                  <div className={`h-0.5 bg-white/70 w-2/3 rounded-full ${isSimRunning ? 'animate-pulse' : ''}`} />
                </div>

                {/* Interactive Buoy */}
                <div
                  className="absolute bottom-16 transition-all duration-300 flex flex-col items-center"
                  style={{ left: `${buoyPos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-8 h-12 bg-gradient-to-t from-orange-600 to-amber-400 rounded-t-full border-2 border-white shadow-lg relative">
                    <div className="w-1.5 h-4 bg-slate-800 mx-auto -top-3 absolute left-1/2 -translate-x-1/2" />
                  </div>
                  <div className="text-[10px] font-mono font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-full mt-1">
                    Phao #{buoyPos}m
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 text-xs font-mono text-white/90">
                  Hướng gió: ➜ Sang phải
                </div>
              </div>

              {/* Simulation Control Panel */}
              <div className="md:col-span-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2 font-mono">
                    Tốc độ gió
                  </label>
                  <div className="space-y-1.5">
                    {(['low', 'medium', 'high'] as const).map((spd) => (
                      <label
                        key={spd}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                          windSpeed === spd
                            ? 'bg-sky-50 text-sky-900 font-bold border border-sky-300'
                            : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                        }`}
                      >
                        <input
                          type="radio"
                          name="windSpeed"
                          checked={windSpeed === spd}
                          onChange={() => setWindSpeed(spd)}
                          className="text-sky-600 focus:ring-sky-500"
                        />
                        <span>
                          {spd === 'low' && 'Thấp (10 km/h)'}
                          {spd === 'medium' && 'Trung bình (25 km/h)'}
                          {spd === 'high' && 'Cao (50 km/h)'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={runSimulation}
                    disabled={isSimRunning}
                    className="w-full py-2.5 rounded-xl bg-[#08233b] hover:bg-sky-900 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Chạy mô phỏng</span>
                  </button>

                  <button
                    onClick={resetSimulation}
                    className="w-full py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Đặt lại</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. SECTION 5: THƯ VIỆN BÀI GIẢNG PHONG PHÚ
      ======================================================== */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Description & 4 Bullets */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Thư viện bài giảng phong phú
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Hàng trăm bài giảng, hoạt động và tài nguyên sẵn sàng sử dụng được biên soạn theo chuẩn chương trình.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-sky-700 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">Bài giảng theo chuẩn</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-sky-700 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">Hoạt động tương tác</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Users className="w-5 h-5 text-sky-700 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">Tài liệu cho giáo viên</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Award className="w-5 h-5 text-sky-700 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">Đánh giá linh hoạt</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/teacher/library')}
                className="px-7 py-3 rounded-full bg-[#08233b] hover:bg-sky-900 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Khám phá thư viện</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Realistic Mockup of Teacher Library UI */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-700 ml-2">Thư viện giáo viên</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Tất cả chủ đề ▾</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Mọi lứa tuổi ▾</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Mockup Card 1 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src="/concepts/assets/hero_whale_b.jpg"
                  alt="Dòng chảy đại dương"
                  className="w-full h-24 object-cover"
                />
                <div className="p-3">
                  <div className="text-xs font-bold text-slate-900 leading-tight">Dòng chảy đại dương: Sức mạnh vô hình</div>
                  <div className="text-[11px] text-slate-500 mt-1">20 phút</div>
                </div>
              </div>

              {/* Mockup Card 2 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src="/concepts/assets/coral_reef_panoramic.jpg"
                  alt="Rạn san hô"
                  className="w-full h-24 object-cover"
                />
                <div className="p-3">
                  <div className="text-xs font-bold text-slate-900 leading-tight">Rạn san hô: Ngôi nhà rực rỡ</div>
                  <div className="text-[11px] text-slate-500 mt-1">21 phút</div>
                </div>
              </div>

              {/* Mockup Card 3 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src="/concepts/assets/card_jellyfish.jpg"
                  alt="Sinh vật vùng biển sâu"
                  className="w-full h-24 object-cover"
                />
                <div className="p-3">
                  <div className="text-xs font-bold text-slate-900 leading-tight">Sinh vật vùng biển sâu: Những điều kỳ bí</div>
                  <div className="text-[11px] text-slate-500 mt-1">20 phút</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. SECTION 6: KẾT NỐI LỚP HỌC VỚI ĐẠI DƯƠNG
      ======================================================== */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Kết nối lớp học với đại dương
          </h2>
          <p className="text-slate-600 mt-2 text-sm">
            Mang thế giới thực vào lớp học, dù ở bất cứ đâu.
          </p>
        </div>

        {/* 4 Feature Badges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-slate-900 text-sm">Bài học sống động</h4>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-slate-900 text-sm">Thảo luận nhóm</h4>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-slate-900 text-sm">Học qua trải nghiệm</h4>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-slate-900 text-sm">Nuôi dưỡng ý thức bảo vệ</h4>
          </div>
        </div>

        {/* Visual Coastal Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl min-h-[280px] flex items-center">
          <img
            src="/concepts/assets/coastal_beach_footer.jpg"
            alt="Đại dương"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08233b]/90 via-[#08233b]/70 to-transparent" />

          <div className="relative z-10 p-8 sm:p-12 max-w-xl text-white space-y-4">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
              Cùng kiến tạo tương lai xanh cho đại dương.
            </h3>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/student')}
                className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-colors shadow-lg cursor-pointer"
              >
                Khám phá ngay →
              </button>
              <button
                onClick={() => navigate('/teacher')}
                className="px-6 py-3 rounded-full bg-[#08233b]/80 border border-white/40 text-white font-semibold text-xs hover:bg-[#08233b] transition-colors cursor-pointer"
              >
                Dành cho giáo viên
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. FOOTER
      ======================================================== */}
      <footer className="w-full bg-[#08233b] text-slate-300 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-serif font-bold text-white">Ocean-Immerse</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
              Về chúng tôi
            </button>
            <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
              Liên hệ
            </button>
            <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">
              Chính sách
            </button>
            <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors cursor-pointer">
              Điều khoản
            </button>
          </div>

          <div className="text-xs font-serif italic text-sky-300">
            Tri thức hôm nay. Đại dương ngày mai.
          </div>
        </div>
      </footer>

      {/* Specimen Modal */}
      {specimenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setSpecimenModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-serif font-bold text-slate-900">
              {specimenModal === 'humpback' && 'Cá voi lưng gù (Megaptera novaeangliae)'}
              {specimenModal === 'clownfish' && 'Cá hề (Amphiprioninae)'}
              {specimenModal === 'turtle' && 'Đồi mồi dứa (Chelonia mydas)'}
              {specimenModal === 'shark' && 'Cá mập đại dương'}
              {specimenModal === 'jellyfish' && 'Sứa biển phát quang'}
            </h3>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Mẫu vật nghiên cứu thuộc cơ sở dữ liệu hải dương học Ocean-Immerse. Được thẩm định bởi các nhà sinh vật học biển và chuyên gia bảo tồn quốc tế.
            </p>
            <button
              onClick={() => {
                setSpecimenModal(null);
                navigate('/student/unit');
              }}
              className="mt-6 w-full py-2.5 rounded-full bg-[#08233b] text-white text-xs font-semibold hover:bg-sky-900 transition-colors"
            >
              Đi tới bài học liên quan →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


export interface SpecimenSlide {
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  specimens: string[];
  depthLabel: string;
}

export const TAB_SLIDES: Record<string, SpecimenSlide[]> = {
  ecosystem: [
    { title: 'Rạn san hô nhiệt đới', subtitle: 'Thành phố rực rỡ dưới đáy biển', desc: 'Rạn san hô nâng đỡ 25% sinh vật biển toàn cầu.', image: '/concepts/assets/coral_reef_panoramic.jpg', specimens: ['Cá hề', 'San hô bàn', 'Hải quỳ'], depthLabel: '10–30m' },
    { title: 'Rừng tảo bẹ khổng lồ', subtitle: 'Mái vòm xanh mát của đại dương', desc: 'Những thân tảo vươn cao tới 30m tạo nơi trú ẩn cho nhiều loài.', image: '/concepts/assets/kelp_forest_player.jpg', specimens: ['Rái cá', 'Tảo bẹ', 'Cầu gai'], depthLabel: '5–25m' },
    { title: 'Thảm cỏ biển ven bờ', subtitle: 'Đồng cỏ xanh lọc sạch đại dương', desc: 'Hấp thụ carbon nhanh gấp 35 lần rừng nhiệt đới.', image: '/concepts/assets/sea_turtle_reef.jpg', specimens: ['Bò biển Dugong', 'Cỏ biển', 'Cá ngựa'], depthLabel: '2–12m' },
    { title: 'Rãnh vực sâu Hadal', subtitle: 'Ranh giới sự sống cực hạn', desc: 'Môi trường áp suất khổng lồ và tối vĩnh hằng.', image: '/concepts/assets/card_jellyfish.jpg', specimens: ['Sứa phát quang', 'Cá vây chân', 'Tôm amphipod'], depthLabel: '4000–6000m+' },
  ],
  life: [
    { title: 'Cá voi lưng gù', subtitle: 'Khổng lồ hiền lành của đại dương', desc: 'Di cư hơn 8.000 km mỗi năm với tiếng hát vang xa.', image: '/concepts/assets/hero_whale_b.jpg', specimens: ['Vây ngực 5m', 'Khe mang lọc', 'Lớp mỡ'], depthLabel: '0–200m' },
    { title: 'Cá mập đại dương', subtitle: 'Kẻ săn mồi thượng đỉnh', desc: 'Khứu giác và cảm biến điện trường siêu nhạy.', image: '/concepts/assets/card_shark.jpg', specimens: ['Vảy mịn', 'Hàm răng thay thế', 'Cảm biến điện'], depthLabel: '10–100m' },
    { title: 'Đồi mồi dứa', subtitle: 'Hoa tiêu cổ xưa của hải lưu', desc: 'Định hướng từ trường để về bãi biển sinh ra.', image: '/concepts/assets/sea_turtle_reef.jpg', specimens: ['Mai sừng', 'Tuyến muối', 'Chân chèo'], depthLabel: '0–50m' },
    { title: 'Cá hề và hải quỳ', subtitle: 'Mối quan hệ cộng sinh hoàn hảo', desc: 'Màng nhầy đặc biệt giúp cá hề miễn dịch độc tố.', image: '/concepts/assets/card_clownfish.jpg', specimens: ['Màng nhầy', 'Thích ti', 'Tảo zooxanthellae'], depthLabel: '1–15m' },
  ],
  process: [
    { title: 'Dòng hải lưu toàn cầu', subtitle: 'Băng chuyền nhiệt muối đại dương', desc: 'Vận chuyển nhiệt lượng từ xích đạo lên các cực.', image: '/concepts/assets/hero_whale_b.jpg', specimens: ['Dòng Vịnh', 'Hải lưu Humboldt', 'Vòng hoàn lưu'], depthLabel: '0–3000m' },
    { title: 'Hiện tượng nước trồi', subtitle: 'Đánh thức nguồn dinh dưỡng đáy biển', desc: 'Gió kéo nước sâu giàu muối khoáng trào lên mặt biển.', image: '/concepts/assets/kelp_forest_player.jpg', specimens: ['Tảo silic', 'Nitrat', 'Phù du'], depthLabel: '50–300m' },
    { title: 'Bơm carbon sinh học', subtitle: 'Cỗ máy hấp thụ carbon vĩ đại', desc: 'Tuyết biển mang carbon chôn vùi dưới đáy thẳm.', image: '/concepts/assets/sea_turtle_reef.jpg', specimens: ['Tuyết biển', 'Vỏ vôi', 'Trầm tích'], depthLabel: '100–5000m' },
    { title: 'Thủy triều tương tác', subtitle: 'Nhịp thở của Mặt Trăng và Trái Đất', desc: 'Lực hấp dẫn kéo theo nhịp dâng hạ hai lần mỗi ngày.', image: '/concepts/assets/coral_reef_panoramic.jpg', specimens: ['Vùng triều', 'Hàu đá', 'Cua dã tràng'], depthLabel: '0–15m' },
  ],
  impact: [
    { title: 'Axit hóa đại dương', subtitle: 'Nguy cơ cho rạn san hô', desc: 'CO2 hòa tan làm giảm ion carbonat cần cho vỏ sò và san hô.', image: '/concepts/assets/coral_reef_panoramic.jpg', specimens: ['Độ pH', 'Aragonit', 'Xương xốp'], depthLabel: '5–50m' },
    { title: 'Hạt vi nhựa', subtitle: 'Kẻ thù vô hình trong chuỗi thức ăn', desc: 'Nhựa phân rã thành hạt dưới 5mm tích lũy sinh học.', image: '/concepts/assets/child_turtle_c.jpg', specimens: ['Vòng xoáy rác', 'Vi nhựa', 'Xơ sợi'], depthLabel: '0–11000m' },
    { title: 'Khu bảo tồn biển MPA', subtitle: 'Phục hồi nguồn lợi thiên nhiên', desc: 'Bảo vệ vùng lõi giúp sinh vật sinh sản và tràn ra ngoài.', image: '/concepts/assets/card_shark.jpg', specimens: ['Vùng lõi', 'Lưới thoát rùa', 'Hạn ngạch'], depthLabel: '0–800m' },
    { title: 'Nhiệt độ nước biển tăng', subtitle: 'Thử thách thích ứng', desc: 'Nước ấm buộc các loài dịch cư về hai cực.', image: '/concepts/assets/coastal_beach_footer.jpg', specimens: ['Sóng nhiệt biển', 'Tẩy trắng san hô', 'Di cư sinh khối'], depthLabel: '0–200m' },
  ],
  careers: [
    { title: 'Nhà sinh vật học biển', subtitle: 'Giải mã mật mã của sự sống', desc: 'Lặn khảo sát rạn san hô và gắn định vị vệ tinh.', image: '/concepts/assets/child_turtle_c.jpg', specimens: ['Nhật ký lặn', 'Máy đo eDNA', 'Kính hiển vi'], depthLabel: '0–40m' },
    { title: 'Kỹ sư robot ngầm ROV', subtitle: 'Chạm vào đáy vực thẳm', desc: 'Điều khiển cánh tay robot lấy mẫu từ độ sâu hàng ngàn mét.', image: '/concepts/assets/kelp_forest_player.jpg', specimens: ['Tay máy thủy lực', 'Camera 4K chịu áp', 'Sonar đa tia'], depthLabel: '1000–6000m+' },
    { title: 'Chuyên gia phục hồi san hô', subtitle: 'Trồng lại khu rừng biển', desc: 'Ươm cấy vi mảnh san hô chịu nhiệt và cấy ra tự nhiên.', image: '/concepts/assets/coral_reef_panoramic.jpg', specimens: ['Bàn ươm', 'Biorock', 'Keo sinh học'], depthLabel: '3–20m' },
    { title: 'Nhà khoa học dữ liệu đại dương', subtitle: 'Lắng nghe nhịp thở hành tinh', desc: 'Phân tích dữ liệu phao tự hành Argo toàn cầu.', image: '/concepts/assets/classroom_screen.jpg', specimens: ['Phao Argo', 'Ảnh vệ tinh', 'Mô hình 3D'], depthLabel: 'Toàn cầu' },
  ],
};

export const CAMERA_FEEDS_B = [
  { name: 'Toàn cảnh cá voi lưng gù', src: '/concepts/assets/hero_whale_b.jpg', thumb: '/concepts/assets/hero_whale_b.jpg' },
  { name: 'Rừng tảo bẹ (Góc chính)', src: '/concepts/assets/kelp_forest_player.jpg', thumb: '/concepts/assets/kelp_forest_player.jpg' },
  { name: 'Rùa biển trên rạn san hô', src: '/concepts/assets/sea_turtle_reef.jpg', thumb: '/concepts/assets/sea_turtle_reef.jpg' },
  { name: 'Không gian nghiên cứu thực địa', src: '/concepts/assets/classroom_screen.jpg', thumb: '/concepts/assets/classroom_screen.jpg' },
];
