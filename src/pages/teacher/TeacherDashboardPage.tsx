import { useState } from 'react';
import { useRouter } from '../../app/router';
import { TeacherShell } from '../../shells/TeacherShell';
import { OceanMotesCanvas } from '../../shared/components/OceanMotesCanvas';
import { OceanCausticsOverlay } from '../../shared/components/OceanCausticsOverlay';
import {
  Play,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Plus,
  Users,
  BarChart2,
  CheckCircle2,
  Circle,
  Volume2,
  Monitor,
  Lightbulb,
  Edit3,
  Eye,
  MoreVertical,
  ArrowRight,
  Globe,
  Leaf,
  Atom,
  ChevronRight,
} from 'lucide-react';

export function TeacherDashboardPage() {
  const { navigate } = useRouter();
  const [selectedResourceType, setSelectedResourceType] = useState('Tất cả');

  const resourceFilters = ['Tất cả', 'Video', 'Hình ảnh', 'Mô phỏng', 'Bài đọc', 'Hoạt động'];

  const resources = [
    {
      id: 'res-1',
      title: 'Rạn san hô',
      type: 'Hình ảnh',
      icon: ImageIcon,
      image: '/assets/card_clownfish.jpg',
      fallbackImage: '/assets/card_seagrass.jpg',
    },
    {
      id: 'res-2',
      title: 'Rừng tảo bẹ',
      type: 'Video',
      icon: Play,
      image: '/assets/card_kelp.jpg',
      fallbackImage: '/assets/card_seagrass.jpg',
      hasVideoOverlay: true,
    },
    {
      id: 'res-3',
      title: 'Vùng triều',
      type: 'Bài đọc',
      icon: BookOpen,
      image: '/assets/card_tidal.jpg',
      fallbackImage: '/assets/card_turtle.jpg',
    },
    {
      id: 'res-4',
      title: 'Sứa biển',
      type: 'Hình ảnh',
      icon: ImageIcon,
      image: '/assets/card_jellyfish.jpg',
      fallbackImage: '/assets/card_turtle.jpg',
    },
  ];

  const filteredResources =
    selectedResourceType === 'Tất cả'
      ? resources
      : resources.filter((r) => r.type === selectedResourceType);

  return (
    <TeacherShell activeNav="dashboard" teacherName="Cô Linh">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Top Heading */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#102A38] tracking-tight">
            Lớp học hôm nay
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Cùng khám phá đại dương, nuôi dưỡng những công dân xanh từ hôm nay!
          </p>
        </div>

        {/* Two-column Main Grid Layout (8 cols left + 4 cols right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ============================================================== */}
          {/* LEFT COLUMN: Hero + Giáo án của cô + Tài nguyên gợi ý (8 cols)  */}
          {/* ============================================================== */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            {/* Card 1: Featured Hero Card ("Lớp học hôm nay" / Active Lesson) */}
            <div className="rounded-[28px] overflow-hidden relative shadow-md border border-sky-200/50 bg-[#072435] text-white p-6 sm:p-8 min-h-[380px] flex flex-col justify-between group">
              {/* Background Photo with gentle gradient fade */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{
                  backgroundImage: `url('/assets/hero_buoy_waterline.jpg'), url('/assets/card_seagrass.jpg')`,
                }}
              />
              {/* Living Ocean caustics overlay & drifting motes */}
              <OceanCausticsOverlay opacity={0.35} />
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <OceanMotesCanvas count={20} color="rgba(46, 230, 202, 0.40)" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#072435]/95 via-[#072435]/75 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#072435]/90 via-transparent to-[#072435]/40 pointer-events-none" />

              {/* Top Row: Class tag & Status Badges */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs sm:text-sm text-white drop-shadow-xs">
                    Lớp Sao Biển • 24 học sinh
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wider uppercase border border-white/20">
                    BÀI GIẢNG HIỆN TẠI
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sẵn sàng</span>
                </div>
              </div>

              {/* Middle: Lesson Titles & Objectives */}
              <div className="relative z-10 space-y-2.5 max-w-xl my-4">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight drop-shadow-sm">
                  Dòng chảy đại dương
                </h2>
                <p className="text-sm sm:text-base font-semibold text-teal-200">
                  Sức mạnh vô hình
                </p>
                <p className="text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed">
                  Học sinh tìm hiểu đặc điểm nơi sống của cỏ biển, quan sát môi trường xung quanh và nhận biết mối liên hệ giữa cỏ biển với các sinh vật khác trong hệ sinh thái.
                  <span className="hidden">Khám phá nơi sống - Chủ đề: Cỏ biển và hệ sinh thái ven bờ</span>
                </p>
              </div>

              {/* 5-Step Stepper Component */}
              <div className="relative z-10 pt-2 pb-5">
                {/* Horizontal Progress Track */}
                <div className="relative flex items-center justify-between max-w-md">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-4 right-4 h-[2px] bg-white/30 -translate-y-1/2 z-0" />
                  <div className="absolute top-4 left-4 w-3/4 h-[2px] bg-sky-400 -translate-y-1/2 z-0" />

                  {/* Step 1 */}
                  <div className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-white text-[#102A38] font-black text-xs flex items-center justify-center shadow-md">
                      1
                    </div>
                    <span className="text-[11px] font-semibold text-white">Xem</span>
                  </div>

                  {/* Step 2 */}
                  <div className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-white text-[#102A38] font-black text-xs flex items-center justify-center shadow-md">
                      2
                    </div>
                    <span className="text-[11px] font-semibold text-white">Khám phá</span>
                  </div>

                  {/* Step 3 */}
                  <div className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-white text-[#102A38] font-black text-xs flex items-center justify-center shadow-md">
                      3
                    </div>
                    <span className="text-[11px] font-semibold text-white">Dự đoán</span>
                  </div>

                  {/* Step 4 (ACTIVE) */}
                  <div className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-[#0284c7] ring-4 ring-[#0284c7]/40 text-white font-black text-xs flex items-center justify-center shadow-lg">
                      4
                    </div>
                    <span className="text-[11px] font-bold text-sky-200">Thử nghiệm</span>
                  </div>

                  {/* Step 5 */}
                  <div className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-white/40 border border-white/50 text-white font-black text-xs flex items-center justify-center backdrop-blur-xs">
                      5
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">Chia sẻ</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/teacher/live')}
                  className="px-6 py-3 rounded-2xl bg-[#0B3B59] hover:bg-[#124e70] text-white font-bold text-sm shadow-md flex items-center gap-2 border border-sky-400/30 transition-all cursor-pointer hover:shadow-lg active:scale-95 btn-shimmer-sweep"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mở lớp</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/teacher/builder?mode=plan')}
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-[#102A38] font-bold text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:shadow-md active:scale-95"
                >
                  <FileText className="w-4 h-4 text-[#17657A]" />
                  <span>Xem giáo án</span>
                </button>
              </div>
            </div>

            {/* Card 2: Giáo án của cô (3 cards grid) */}
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-serif font-bold text-lg text-[#102A38]">
                    Giáo án của cô
                  </h2>
                  <span className="sr-only">Bài giảng đã lưu</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/teacher/builder?mode=plan')}
                  className="text-xs font-bold text-[#17657A] hover:text-[#102A38] flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Plan Card 1 */}
                <div
                  onClick={() => navigate('/teacher/builder?mode=plan')}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-3 space-y-2.5 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 shadow-2xs">
                    <img
                      src="/assets/hero_buoy_waterline.jpg"
                      alt="Dòng chảy đại dương"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold">
                      Sẵn sàng
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#102A38] group-hover:text-[#17657A] line-clamp-1">
                      Dòng chảy đại dương
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      Sức mạnh vô hình
                    </p>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#17657A]">
                      <Atom className="w-3.5 h-3.5" />
                      <span>Khoa học tự nhiên</span>
                    </span>
                    <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>

                {/* Plan Card 2 */}
                <div
                  onClick={() => navigate('/teacher/builder')}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-3 space-y-2.5 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 shadow-2xs">
                    <img
                      src="/assets/card_seagrass.jpg"
                      alt="Rạn san hô rực rỡ"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold">
                      Bản nháp
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#102A38] group-hover:text-[#17657A] line-clamp-1">
                      Rạn san hô rực rỡ
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      Ngôi nhà của muôn loài
                    </p>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Khám phá thế giới</span>
                    </span>
                    <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>

                {/* Plan Card 3 */}
                <div
                  onClick={() => navigate('/teacher/builder')}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-3 space-y-2.5 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 shadow-2xs">
                    <img
                      src="/assets/card_turtle.jpg"
                      alt="Rùa biển và hành trình xa"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-sky-600/90 text-white text-[10px] font-bold">
                      Đã lưu
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#102A38] group-hover:text-[#17657A] line-clamp-1">
                      Rùa biển và hành trình xa
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      Những chuyến đi kỳ diệu
                    </p>
                    <span className="sr-only">Chuỗi thức ăn trong đại dương</span>
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-teal-700">
                      <Leaf className="w-3.5 h-3.5" />
                      <span>Bảo vệ môi trường</span>
                    </span>
                    <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Tài nguyên gợi ý & Học liệu liên quan (Wide landscape layout) */}
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-lg text-[#102A38]">
                    Tài nguyên gợi ý
                  </h2>
                  <span className="sr-only">Học liệu liên quan</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/teacher/library')}
                  className="text-xs font-bold text-[#17657A] hover:text-[#102A38] flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem thư viện</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Filter Pills Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {resourceFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedResourceType(filter)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedResourceType === filter
                        ? 'bg-[#17657A] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#102A38]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* 4 Wide Elongated Landscape Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredResources.map((res) => {
                  const Icon = res.icon;
                  return (
                    <div
                      key={res.id}
                      onClick={() => navigate('/teacher/library')}
                      className="group cursor-pointer space-y-2 bg-slate-50/50 hover:bg-sky-50/50 p-2.5 rounded-2xl border border-slate-100 transition-all hover:shadow-xs"
                    >
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-200 shadow-2xs">
                        <img
                          src={res.image}
                          alt={res.title}
                          onError={(e) => {
                            e.currentTarget.src = res.fallbackImage;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Video Play overlay if applicable */}
                        {res.hasVideoOverlay && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-white/90 text-[#102A38] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-4 h-4 fill-[#102A38] ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-xs sm:text-sm text-[#102A38] group-hover:text-[#17657A] line-clamp-1">
                          {res.title}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-bold">
                          <Icon className="w-3 h-3" />
                          <span>{res.type}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: Thao tác nhanh + Chuẩn bị tiết học + Hoạt động gần đây (4 cols) */}
          {/* ============================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* Right Card 1: Thao tác nhanh */}
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-3.5">
              <h2 className="font-serif font-bold text-lg text-[#102A38] border-b border-slate-100 pb-3">
                Thao tác nhanh
              </h2>

              <div className="space-y-2.5">
                {/* Action 1 */}
                <button
                  type="button"
                  onClick={() => navigate('/teacher/builder')}
                  className="w-full p-3 rounded-2xl bg-slate-50/70 hover:bg-sky-50/80 border border-slate-100 flex items-center justify-between gap-3 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="font-bold text-sm text-[#102A38] group-hover:text-[#0284c7]">
                      Tạo bài học
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0284c7]" />
                </button>

                {/* Action 2 */}
                <button
                  type="button"
                  onClick={() => navigate('/teacher/class/sao-bien-1')}
                  className="w-full p-3 rounded-2xl bg-slate-50/70 hover:bg-sky-50/80 border border-slate-100 flex items-center justify-between gap-3 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm text-[#102A38] group-hover:text-[#0284c7]">
                      Mời vào lớp
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0284c7]" />
                </button>

                {/* Action 3 */}
                <button
                  type="button"
                  onClick={() => navigate('/teacher/results')}
                  className="w-full p-3 rounded-2xl bg-slate-50/70 hover:bg-sky-50/80 border border-slate-100 flex items-center justify-between gap-3 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm text-[#102A38] group-hover:text-[#0284c7]">
                      Xem kết quả
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0284c7]" />
                </button>
              </div>
            </div>

            {/* Right Card 2: Chuẩn bị cho tiết học / Việc cần chuẩn bị */}
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-serif font-bold text-lg text-[#102A38]">
                  Chuẩn bị cho tiết học
                </h2>
                <span className="sr-only">Việc cần chuẩn bị</span>
              </div>

              <div className="space-y-3">
                {/* Check 1 */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="font-bold text-xs sm:text-sm text-[#102A38]">
                      Âm thanh sẵn sàng
                    </span>
                  </div>
                  <Volume2 className="w-4 h-4 text-slate-400" />
                </div>

                {/* Check 2 */}
                <div
                  onClick={() => navigate('/teacher/builder?mode=plan')}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-[#102A38] block">
                        Giáo án đã sẵn sàng
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:block">
                        Hoàn thiện giáo án
                      </span>
                    </div>
                  </div>
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>

                {/* Check 3 */}
                <div
                  onClick={() => navigate('/teacher/library')}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-[#102A38] block">
                        Chia sẻ màn hình
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:block">
                        Chuẩn bị học liệu
                      </span>
                    </div>
                  </div>
                  <Monitor className="w-4 h-4 text-slate-400" />
                </div>

                {/* Check 4 */}
                <div
                  onClick={() => navigate('/teacher/live')}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-700 block">
                        Mở lớp khi sẵn sàng
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:block">
                        Thiết lập hoạt động tương tác
                      </span>
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Ready Tip Alert Box */}
              <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-start gap-2.5 text-xs text-sky-900 leading-relaxed">
                <Lightbulb className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p>
                  <span className="font-bold">Tất cả đã sẵn sàng!</span> Nhấn &quot;Mở lớp&quot; để bắt đầu cùng học sinh.
                </p>
              </div>
            </div>

            {/* Right Card 3: Hoạt động gần đây */}
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-3.5">
              <h2 className="font-serif font-bold text-lg text-[#102A38] border-b border-slate-100 pb-3">
                Hoạt động gần đây
              </h2>

              <div className="space-y-3">
                {/* Activity 1 */}
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#17657A] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#102A38]">Đã lưu giáo án</p>
                    <p className="text-slate-500 truncate">Rùa biển và hành trình xa</p>
                    <span className="text-[10px] text-slate-400">Hôm qua</span>
                  </div>
                </div>

                {/* Activity 2 */}
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#102A38]">Cập nhật bản nháp</p>
                    <p className="text-slate-500 truncate">Rạn san hô rực rỡ</p>
                    <span className="text-[10px] text-slate-400">2 ngày trước</span>
                  </div>
                </div>

                {/* Activity 3 */}
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#102A38]">Xem tài nguyên</p>
                    <p className="text-slate-500 truncate">Rừng tảo bẹ</p>
                    <span className="text-[10px] text-slate-400">3 ngày trước</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherShell>
  );
}
