import { useState } from 'react';
import { useRouter } from '../../../app/router';
import {
  ArrowRight,
  Search,
  X,
  Volume2,
  Check,
    Monitor,
  Tablet,
  Laptop,
  Users,
  GraduationCap,
  Heart,
} from 'lucide-react';

export function ConceptCPage() {
  const { navigate } = useRouter();

  // Search Drawer
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Turtle question interaction in Section 2
  const [showTurtleAnswer, setShowTurtleAnswer] = useState(false);

  // Active step in Tablet Mockup (Section 3)
  const [mockupStep, setMockupStep] = useState<number>(4);

  // Active preview device in Section 4
  const [previewDevice, setPreviewDevice] = useState<'student' | 'teacher' | 'presentation'>('student');

  return (
    <div className="relative min-h-screen bg-[#f8f9fa] text-slate-900 font-sans selection:bg-sky-200 selection:text-sky-900">
      {/* ========================================================
          1. HEADER (Ocean-Immerse Brand Navigation)
      ======================================================== */}
      <header className="sticky top-0 z-30 w-full bg-[#f8f9fa]/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-2xl font-serif font-bold tracking-tight text-[#07253d]">
              Ocean-Immerse
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <button
              onClick={() => navigate('/')}
              className="text-[#07253d] font-semibold border-b-2 border-[#07253d] pb-0.5"
            >
              Trang chủ
            </button>
            <button
              onClick={() => navigate('/student/explore')}
              className="hover:text-[#07253d] transition-colors cursor-pointer"
            >
              Khám phá
            </button>
            <button
              onClick={() => navigate('/student/progress')}
              className="hover:text-[#07253d] transition-colors cursor-pointer"
            >
              Bộ sưu tập
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Tìm kiếm bài học & sinh vật"
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
              className="px-5 py-2.5 rounded-full bg-[#07253d] text-white text-xs font-semibold hover:bg-sky-900 transition-all shadow-md cursor-pointer"
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
                placeholder="Tra cứu: Rùa biển, Sứa, Rạn san hô, Dòng hải lưu..."
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
          2. HERO: TRẢI NGHIỆM THẬT. THAY ĐỔI THẬT.
      ======================================================== */}
      <section className="relative w-full min-h-[580px] lg:min-h-[660px] bg-[#07253d] overflow-hidden text-white flex items-center">
        {/* Background Image: Orca Whale leaping into sunlight */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/concepts/assets/hero_orca_c.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#07253d]/90 via-[#07253d]/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f8f9fa] to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block text-[11px] font-bold tracking-widest uppercase text-sky-300 font-mono">
              HỌC CÙNG ĐẠI DƯƠNG. VÌ MỘT NGÀY MAI TƯƠI SÁNG
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.12]">
              Trải nghiệm thật. <br />
              Thay đổi thật.
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-sans max-w-lg leading-relaxed">
              Nền tảng học tập tương tác cho những bộ óc tò mò, và những nhà giáo dục đầy tâm huyết.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => navigate('/student')}
                className="px-7 py-3.5 rounded-full bg-[#07253d] hover:bg-[#0b3b61] text-white border border-sky-400/40 font-semibold text-sm transition-all shadow-xl flex items-center gap-2 cursor-pointer"
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

          <div className="lg:col-span-5 flex justify-end">
            <div className="hidden lg:block text-right text-sky-200 font-serif italic text-lg max-w-xs leading-relaxed">
              &ldquo;Những bức tranh cuộc nhìn sáng hơn&rdquo;
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. SECTION 2: NUÔI DƯỠNG TÌNH YÊU ĐẠI DƯƠNG TỪ NHỮNG KHÁM PHÁ ĐẦU TIÊN
      ======================================================== */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
              Nuôi dưỡng tình yêu đại dương từ những khám phá đầu tiên
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              Trẻ em học tốt nhất khi được chạm, nhìn, nghe và khám phá. Ocean-Immerse mang đại dương đến gần hơn với những nhà thám hiểm nhỏ tuổi qua các tương tác chân thực và trực quan.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate('/student')}
                className="px-7 py-3.5 rounded-full bg-[#07253d] hover:bg-sky-900 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Khám phá dành cho trẻ em</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Image with Interactive Turtle Dialog */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="/concepts/assets/child_turtle_c.jpg"
                alt="Em bé chạm rùa biển"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

              {/* Speech Bubble: "Con rùa đang làm gì?" */}
              <div
                onClick={() => setShowTurtleAnswer(!showTurtleAnswer)}
                className="absolute top-8 right-8 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-sky-300 flex items-center gap-3 cursor-pointer hover:scale-105 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-serif font-bold text-slate-900">
                    Con rùa đang làm gì?
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Nhấn để nghe giải thích
                  </div>
                </div>
              </div>

              {/* Expandable answer panel */}
              {showTurtleAnswer && (
                <div className="absolute bottom-6 inset-x-6 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl text-white text-xs space-y-1 shadow-2xl border border-sky-400/40 animate-fade-in">
                  <div className="font-serif font-bold text-sky-300 text-sm">
                    Đồi mồi dứa đang lặn kiếm cỏ biển!
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Rùa biển dùng 4 chi chèo để bơi lượn nhịp nhàng. Khi mệt, rùa sẽ ngoi lên mặt nước để hít thở bầu không khí trong lành trước khi lặn tiếp.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. SECTION 3: LỚP HỌC TRONG TẦM TAY (MOCKUP LIVE CLASS TRÊN TABLET)
      ======================================================== */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Button */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
              Lớp học trong tầm tay
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              Quản lý lớp học, giao bài, theo dõi tiến độ — tất cả trong một nơi. Dành cho các giáo viên tạo nên những buổi học sinh động và gắn kết.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate('/teacher')}
                className="px-7 py-3.5 rounded-full bg-[#07253d] hover:bg-sky-900 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Xem giao diện giáo viên</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Tablet Mockup of Live Class */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-8 border-slate-800 shadow-2xl overflow-hidden p-6">
            {/* Tablet Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-slate-900 text-base">Lớp Sao Biển</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                  24 học sinh
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                <span className="text-slate-400">Tổng quan</span>
                <span className="text-sky-800 border-b-2 border-sky-800 pb-1">Bài học</span>
                <span className="text-slate-400">Học sinh</span>
                <span className="text-slate-400">Kết quả</span>
              </div>
            </div>

            {/* Lesson Card Inside Mockup */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-base">
                    Dòng chảy đại dương: Sức mạnh vô hình
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">3 / 5 hoạt động đã hoàn thành</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-sky-800">60%</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-sky-600 h-2 rounded-full w-3/5" />
              </div>

              {/* 5 Activity Step Circles */}
              <div className="flex items-center justify-between pt-3 text-center">
                <div
                  onClick={() => setMockupStep(1)}
                  className={`flex flex-col items-center gap-1 cursor-pointer ${mockupStep === 1 ? 'opacity-100 font-bold' : 'opacity-70'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-700">Xem</span>
                </div>

                <div className="w-8 h-0.5 bg-emerald-400" />

                <div
                  onClick={() => setMockupStep(2)}
                  className={`flex flex-col items-center gap-1 cursor-pointer ${mockupStep === 2 ? 'opacity-100 font-bold' : 'opacity-70'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-700">Khám phá</span>
                </div>

                <div className="w-8 h-0.5 bg-emerald-400" />

                <div
                  onClick={() => setMockupStep(3)}
                  className={`flex flex-col items-center gap-1 cursor-pointer ${mockupStep === 3 ? 'opacity-100 font-bold' : 'opacity-70'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-slate-700">Dự đoán</span>
                </div>

                <div className="w-8 h-0.5 bg-sky-300" />

                <div
                  onClick={() => setMockupStep(4)}
                  className={`flex flex-col items-center gap-1 cursor-pointer ${mockupStep === 4 ? 'opacity-100 font-bold scale-105' : 'opacity-70'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-sky-100">
                    4
                  </div>
                  <span className="text-[11px] text-sky-800 font-bold">Thử nghiệm</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded-full font-bold">Tiếp theo</span>
                </div>

                <div className="w-8 h-0.5 bg-slate-300" />

                <div
                  onClick={() => setMockupStep(5)}
                  className={`flex flex-col items-center gap-1 cursor-pointer ${mockupStep === 5 ? 'opacity-100 font-bold' : 'opacity-70'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">
                    5
                  </div>
                  <span className="text-[11px] text-slate-500">Chia sẻ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. SECTION 4: CÙNG MỘT BÀI HỌC, NHIỀU CÁCH TRẢI NGHIỆM
      ======================================================== */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Cùng một bài học, nhiều cách trải nghiệm
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Học sinh, giáo viên và cả lớp cùng xem, cùng khám phá — đồng bộ theo thời gian thực.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Device 1: Giao diện học sinh */}
          <div
            onClick={() => {
              setPreviewDevice('student');
              navigate('/student/journey');
            }}
            className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group ${previewDevice === 'student' ? 'border-sky-500 ring-2 ring-sky-100' : 'border-slate-200'}`}
          >
            <div>
              <div className="relative rounded-2xl overflow-hidden h-48 bg-slate-100 mb-4 border border-slate-200">
                <img
                  src="/concepts/assets/child_turtle_c.jpg"
                  alt="Giao diện học sinh"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Tablet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                    Giao diện học sinh
                  </h4>
                  <p className="text-xs text-slate-500">Tương tác chạm, nghe và khám phá</p>
                </div>
              </div>
            </div>
          </div>

          {/* Device 2: Giao diện giáo viên */}
          <div
            onClick={() => {
              setPreviewDevice('teacher');
              navigate('/presentation');
            }}
            className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group ${previewDevice === 'teacher' ? 'border-sky-500 ring-2 ring-sky-100' : 'border-slate-200'}`}
          >
            <div>
              <div className="relative rounded-2xl overflow-hidden h-48 bg-slate-100 mb-4 border border-slate-200">
                <img
                  src="/concepts/assets/classroom_screen.jpg"
                  alt="Giao diện giáo viên"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                    Giao diện giáo viên
                  </h4>
                  <p className="text-xs text-slate-500">Điều khiển và theo dõi từng em</p>
                </div>
              </div>
            </div>
          </div>

          {/* Device 3: Trình chiếu lớp học */}
          <div
            onClick={() => {
              setPreviewDevice('presentation');
              navigate('/presentation');
            }}
            className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group ${previewDevice === 'presentation' ? 'border-sky-500 ring-2 ring-sky-100' : 'border-slate-200'}`}
          >
            <div>
              <div className="relative rounded-2xl overflow-hidden h-48 bg-slate-100 mb-4 border border-slate-200">
                <img
                  src="/concepts/assets/hero_whale_b.jpg"
                  alt="Trình chiếu lớp học"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                    Trình chiếu lớp học
                  </h4>
                  <p className="text-xs text-slate-500">Màn hình lớn cho cả lớp thảo luận</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. SECTION 5: THẾ GIỚI ĐẠI DƯƠNG ĐANG CHỜ KHÁM PHÁ (5 CARDS)
      ======================================================== */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Thế giới đại dương đang chờ khám phá
            </h2>
            <p className="text-slate-600 mt-2 text-sm">
              Khám phá các kỳ quan và sinh vật diệu kỳ khắp các đại dương trên thế giới.
            </p>
          </div>

          <button
            onClick={() => navigate('/student/explore')}
            className="text-sm font-semibold text-[#07253d] hover:text-sky-700 flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Card 1: Rạn san hô */}
          <div
            onClick={() => navigate('/student/unit')}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="h-40 overflow-hidden">
              <img
                src="/concepts/assets/coral_reef_panoramic.jpg"
                alt="Rạn san hô"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors text-sm">
                Rạn san hô
              </h4>
              <p className="text-xs text-slate-500 mt-1">Sự sống rực rỡ</p>
            </div>
          </div>

          {/* Card 2: Rừng tảo bẹ */}
          <div
            onClick={() => navigate('/student/unit')}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="h-40 overflow-hidden">
              <img
                src="/concepts/assets/kelp_forest_player.jpg"
                alt="Rừng tảo bẹ"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors text-sm">
                Rừng tảo bẹ
              </h4>
              <p className="text-xs text-slate-500 mt-1">Những cánh rừng dưới nước</p>
            </div>
          </div>

          {/* Card 3: Sứa biển */}
          <div
            onClick={() => navigate('/student/unit')}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="h-40 overflow-hidden">
              <img
                src="/concepts/assets/card_jellyfish.jpg"
                alt="Sứa biển"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors text-sm">
                Sứa biển
              </h4>
              <p className="text-xs text-slate-500 mt-1">Vẻ đẹp kỳ diệu</p>
            </div>
          </div>

          {/* Card 4: Vùng biển sâu */}
          <div
            onClick={() => navigate('/student/unit')}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="h-40 overflow-hidden">
              <img
                src="/concepts/assets/card_shark.jpg"
                alt="Vùng biển sâu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors text-sm">
                Vùng biển sâu
              </h4>
              <p className="text-xs text-slate-500 mt-1">Những điều bí ẩn</p>
            </div>
          </div>

          {/* Card 5: Thảm cỏ biển */}
          <div
            onClick={() => navigate('/student/unit')}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="h-40 overflow-hidden">
              <img
                src="/concepts/assets/sea_turtle_reef.jpg"
                alt="Thảm cỏ biển"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <h4 className="font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors text-sm">
                Thảm cỏ biển
              </h4>
              <p className="text-xs text-slate-500 mt-1">Lá phổi xanh</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. SECTION 6: PHOTO BANNER "CÙNG NHAU..."
      ======================================================== */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[340px] flex items-center border border-slate-200">
          <img
            src="/concepts/assets/classroom_screen.jpg"
            alt="Lớp học cùng nhau thay đổi"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-transparent" />

          <div className="relative z-10 p-8 sm:p-14 max-w-xl text-white space-y-4">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
              Cùng nhau, chúng ta có thể tạo ra những thay đổi thật.
            </h3>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Từ những khám phá trong lớp học, đến ý thức bảo vệ môi trường biển ngoài đời thực.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/student/explore')}
                className="px-7 py-3 rounded-full bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-colors shadow-lg cursor-pointer"
              >
                Tìm hiểu thêm →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. SECTION 7: THAM GIA CỘNG ĐỒNG OCEAN-IMMERSE (3 ROLE CARDS)
      ======================================================== */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Tham gia cộng đồng Ocean-Immerse
          </h2>
          <p className="text-slate-600 mt-2 text-sm">
            Mỗi vai trò, một hành trình. Cùng chung mục tiêu vì đại dương.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Role 1: Học sinh */}
          <div
            onClick={() => navigate('/student')}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all cursor-pointer text-center flex flex-col items-center group"
          >
            <div className="w-20 h-20 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
              Tôi là học sinh
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Khám phá các bí ẩn đại dương, tích lũy huy hiệu và trải nghiệm các thí nghiệm khoa học sinh động.
            </p>
            <div className="mt-6 text-xs font-semibold text-sky-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>Khám phá ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Role 2: Giáo viên */}
          <div
            onClick={() => navigate('/teacher')}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all cursor-pointer text-center flex flex-col items-center group"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
              Tôi là giáo viên
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Kho thư viện bài giảng theo chuẩn, công cụ điều khiển buổi học thời gian thực và quản lý lớp học.
            </p>
            <div className="mt-6 text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>Bắt đầu giảng dạy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Role 3: Phụ huynh */}
          <div
            onClick={() => navigate('/about')}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all cursor-pointer text-center flex flex-col items-center group"
          >
            <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
              Tôi là phụ huynh
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Đồng hành cùng con trong hành trình học tập, theo dõi sự tò mò và tiến bộ mỗi ngày.
            </p>
            <div className="mt-6 text-xs font-semibold text-amber-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>Tìm hiểu thêm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          9. FOOTER
      ======================================================== */}
      <footer className="w-full bg-[#07253d] text-slate-300 py-12 px-6 border-t border-slate-800">
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
            Đại dương kết nối chúng ta.
          </div>
        </div>
      </footer>
    </div>
  );
}


export const CAMERA_FEEDS_C = [
  { name: 'Toàn cảnh cá voi sát thủ Orca', src: '/concepts/assets/hero_orca_c.jpg', thumb: '/concepts/assets/hero_orca_c.jpg' },
  { name: 'Rừng tảo bẹ (Góc chính)', src: '/concepts/assets/kelp_forest_player.jpg', thumb: '/concepts/assets/kelp_forest_player.jpg' },
  { name: 'Rùa biển xúc giác cận cảnh', src: '/concepts/assets/child_turtle_c.jpg', thumb: '/concepts/assets/child_turtle_c.jpg' },
  { name: 'Không gian lớp học dùng chung 4K', src: '/concepts/assets/classroom_screen.jpg', thumb: '/concepts/assets/classroom_screen.jpg' },
];
