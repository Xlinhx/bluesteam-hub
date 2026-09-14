import { useRouter } from '../../app/router';
import { TeacherShell } from '../../shells/TeacherShell';
import {
  Play,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Gamepad2,
  ChevronRight,
  MoreVertical,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function TeacherDashboardPage() {
  const { navigate } = useRouter();

  return (
    <TeacherShell activeNav="dashboard">
      <div className="space-y-6">
        {/* Top Grid: Hero Active Lesson (8 cols) + Việc cần chuẩn bị (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Featured Hero Card */}
          <div className="lg:col-span-8 relative rounded-[28px] overflow-hidden bg-[#0A2533] border border-sky-200/40 shadow-sm p-6 sm:p-8 flex flex-col justify-between min-h-[380px] text-white">
            {/* Background underwater photo with gentle gradient fade */}
            <div
              className="absolute inset-0 bg-cover bg-right sm:bg-center opacity-70 transition-transform duration-700 hover:scale-105"
              style={{
                backgroundImage: `url('/assets/card_seagrass.jpg')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A2533] via-[#0A2533]/80 to-transparent" />

            {/* Hero Card Content */}
            <div className="relative z-10 space-y-3 max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold tracking-wider uppercase border border-white/20">
                BÀI GIẢNG HIỆN TẠI
              </span>

              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-[-0.02em] leading-tight">
                Khám phá nơi sống
              </h1>

              <p className="text-sm sm:text-base font-semibold text-teal-200">
                Chủ đề: Cỏ biển và hệ sinh thái ven bờ
              </p>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-1">
                Học sinh tìm hiểu đặc điểm nơi sống của cỏ biển, quan sát môi trường xung quanh và nhận biết mối liên hệ giữa cỏ biển với các sinh vật khác trong hệ sinh thái.
              </p>

              {/* Tag pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {['Khám phá', 'Quan sát', 'Thảo luận', 'Liên môn'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-white border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 flex flex-wrap items-center gap-3 pt-6">
              <button
                type="button"
                onClick={() => navigate('/teacher/builder')}
                className="px-6 py-3 rounded-2xl bg-[#102A38] hover:bg-[#17657A] text-white font-bold text-sm shadow-md flex items-center gap-2 border border-white/20 transition-all cursor-pointer hover:shadow-lg active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Tiếp tục chuẩn bị</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/teacher/live')}
                className="px-6 py-3 rounded-2xl bg-white/95 hover:bg-white text-[#102A38] font-bold text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:shadow-md active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-[#102A38]" />
                <span>Mở bài giảng</span>
              </button>
            </div>
          </div>

          {/* Right Column Card: Việc cần chuẩn bị (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-50 text-[#17657A] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h2 className="font-serif font-bold text-lg text-[#102A38]">
                  Việc cần chuẩn bị
                </h2>
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

            <div className="space-y-3 flex-1 flex flex-col justify-around">
              {/* Item 1 */}
              <div
                onClick={() => navigate('/teacher/builder?mode=plan')}
                className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-sky-50/70 border border-slate-100 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-[#17657A] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#102A38] group-hover:text-[#17657A]">
                      Hoàn thiện giáo án
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      Bổ sung hoạt động nhóm và câu hỏi thảo luận cho bài Khám phá nơi sống
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#17657A] shrink-0" />
              </div>

              {/* Item 2 */}
              <div
                onClick={() => navigate('/teacher/library')}
                className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-emerald-50/70 border border-slate-100 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#102A38] group-hover:text-emerald-700">
                      Chuẩn bị học liệu
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      Kiểm tra hình ảnh, video và phiếu học tập liên quan đến cỏ biển
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0" />
              </div>

              {/* Item 3 */}
              <div
                onClick={() => navigate('/teacher/builder')}
                className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-orange-50/70 border border-slate-100 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#F67650] flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#102A38] group-hover:text-[#F67650]">
                      Thiết lập hoạt động tương tác
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      Cấu hình trò chơi khám phá hệ sinh thái ven bờ cho tiết học
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#F67650] shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Bài giảng đã lưu (6 cols) + Học liệu liên quan (6 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Bottom Left Card: Bài giảng đã lưu */}
          <div className="lg:col-span-6 bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-serif font-bold text-lg text-[#102A38]">
                Bài giảng đã lưu
              </h2>
              <button
                type="button"
                onClick={() => navigate('/teacher/library')}
                className="text-xs font-bold text-[#17657A] hover:text-[#102A38] flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Saved Lesson 1 */}
              <div
                onClick={() => navigate('/teacher/builder')}
                className="p-3 rounded-2xl bg-slate-50/60 hover:bg-sky-50/60 border border-slate-100 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-12 rounded-xl overflow-hidden shadow-xs shrink-0">
                    <img
                      src="/assets/card_seagrass.jpg"
                      alt="Khám phá nơi sống"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#102A38] group-hover:text-[#17657A]">
                      Khám phá nơi sống
                    </h3>
                    <p className="text-xs text-slate-500">Chủ đề: Cỏ biển và hệ sinh thái ven bờ</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  aria-label="Thao tác"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Saved Lesson 2 */}
              <div
                onClick={() => navigate('/teacher/builder')}
                className="p-3 rounded-2xl bg-slate-50/60 hover:bg-sky-50/60 border border-slate-100 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-12 rounded-xl overflow-hidden shadow-xs shrink-0">
                    <img
                      src="/assets/card_turtle.jpg"
                      alt="Chuỗi thức ăn trong đại dương"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#102A38] group-hover:text-[#17657A]">
                      Chuỗi thức ăn trong đại dương
                    </h3>
                    <p className="text-xs text-slate-500">Chủ đề: Sinh vật biển và mối quan hệ trong tự nhiên</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  aria-label="Thao tác"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Saved Lesson 3 */}
              <div
                onClick={() => navigate('/teacher/builder')}
                className="p-3 rounded-2xl bg-slate-50/60 hover:bg-sky-50/60 border border-slate-100 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-12 rounded-xl overflow-hidden shadow-xs shrink-0">
                    <img
                      src="/assets/map_island_journey.jpg"
                      alt="Bảo vệ vùng biển quê hương"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#102A38] group-hover:text-[#17657A]">
                      Bảo vệ vùng biển quê hương
                    </h3>
                    <p className="text-xs text-slate-500">Chủ đề: Con người và đại dương</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  aria-label="Thao tác"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Right Card: Học liệu liên quan */}
          <div className="lg:col-span-6 bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-serif font-bold text-lg text-[#102A38]">
                Học liệu liên quan
              </h2>
              <button
                type="button"
                onClick={() => navigate('/teacher/library')}
                className="text-xs font-bold text-[#17657A] hover:text-[#102A38] flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Item 1 */}
              <div
                onClick={() => navigate('/teacher/library')}
                className="group cursor-pointer space-y-2"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-xs">
                  <img
                    src="/assets/card_seagrass.jpg"
                    alt="Hình ảnh cỏ biển"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white/90 text-[#102A38] flex items-center justify-center shadow-md">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="font-bold text-xs text-[#102A38] line-clamp-1 group-hover:text-[#17657A]">
                  Hình ảnh cỏ biển
                </h3>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => navigate('/teacher/library')}
                className="group cursor-pointer space-y-2"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-xs">
                  <img
                    src="/assets/bluesteam/bs-habitat-seagrass-bg-v01.jpg"
                    alt="Video môi trường sống"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white/90 text-[#102A38] flex items-center justify-center shadow-md">
                    <Play className="w-3.5 h-3.5 fill-[#102A38]" />
                  </div>
                </div>
                <h3 className="font-bold text-xs text-[#102A38] line-clamp-1 group-hover:text-[#17657A]">
                  Video môi trường sống
                </h3>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => navigate('/teacher/library')}
                className="group cursor-pointer space-y-2"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-xs">
                  <img
                    src="/assets/card_flow_drawing.png"
                    alt="Phiếu học tập quan sát"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white/90 text-[#102A38] flex items-center justify-center shadow-md">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="font-bold text-xs text-[#102A38] line-clamp-1 group-hover:text-[#17657A]">
                  Phiếu học tập quan sát
                </h3>
              </div>

              {/* Item 4 */}
              <div
                onClick={() => navigate('/teacher/library')}
                className="group cursor-pointer space-y-2"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-xs">
                  <img
                    src="/assets/map_island_journey.jpg"
                    alt="Bản đồ hệ sinh thái ven bờ"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white/90 text-[#102A38] flex items-center justify-center shadow-md">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="font-bold text-xs text-[#102A38] line-clamp-1 group-hover:text-[#17657A]">
                  Bản đồ hệ sinh thái ven bờ
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherShell>
  );
}
