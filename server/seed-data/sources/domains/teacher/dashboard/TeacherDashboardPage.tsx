import { useEffect, useState } from 'react';
import { useRouter } from '../../../app/router';
import { TeacherShell } from '../../../shared/shells/TeacherShell';
import { CATEGORY_ARTWORK_MAP } from '../../../shared/data/categoryArtworkMap';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import { apiRequest } from '../../../shared/api/client';
import {
  Volume2,
  DoorOpen,
  Plus,
  Gamepad2,
  BookOpen,
  Compass,
  Palette,
  Edit3,
  ArrowRight,
} from 'lucide-react';

interface RecentRoomSummary {
  id: string;
  title: string;
  endedAt: string | null;
  createdAt: string;
  status: string;
  thumbnailUrl?: string;
}

export function TeacherDashboardPage() {
  const { navigate } = useRouter();
  const [recentRooms, setRecentRooms] = useState<RecentRoomSummary[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingRooms(true);
    apiRequest<{ items: RecentRoomSummary[] }>('/api/v1/teacher/rooms?status=ended&limit=3')
      .then((res) => {
        if (!cancelled && Array.isArray(res.items)) {
          setRecentRooms(res.items.slice(0, 3));
        }
      })
      .catch(() => {
        // When unauthenticated or no rooms yet, keep empty list
      })
      .finally(() => {
        if (!cancelled) setLoadingRooms(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const formatRoomDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <TeacherShell activeNav="dashboard" teacherName="Cô Linh">
      <div className="max-w-[1320px] mx-auto space-y-6 pb-10">
        {/* ================================================================ */}
        {/* 1. HERO FEATURE BANNER (M07: 300px, "Không gian của cô")          */}
        {/* ================================================================ */}
        <section
          aria-label="Không gian của cô"
          className="relative rounded-[28px] overflow-hidden border border-[#E2D9C8] bg-[#F3EFE6] shadow-[0_10px_28px_rgba(12,59,84,0.08)] min-h-[300px] grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Left Content Column */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between z-10 bg-[#F3EFE6]">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  oceanAudio.speak(
                    'Không gian của cô. Chuẩn bị nội dung, cùng bé khám phá đại dương.'
                  )
                }
                aria-label="Nghe giới thiệu không gian của cô"
                className="w-11 h-11 rounded-full bg-[#DCE9EE] hover:bg-[#CBE0E8] text-[#0C3B54] flex items-center justify-center transition-colors cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              <h1 className="font-serif font-extrabold text-[34px] sm:text-[40px] leading-[1.12] text-[#0C3B54] tracking-tight">
                Không gian của cô
              </h1>
              <p className="text-base sm:text-lg font-bold text-[#144863]">
                Chuẩn bị nội dung, cùng bé khám phá.
              </p>
            </div>

            {/* Primary CTA: "Quản lý tương tác" per UI-SPEC 2.4 & M07.2 */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate('/teacher/interactive', { query: {} })}
                className="w-full sm:w-auto min-h-[68px] px-6 py-3.5 rounded-[22px] bg-[#0F5E78] hover:bg-[#0C4A60] text-white flex items-center gap-4 shadow-md transition-all cursor-pointer active:scale-[0.99] text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-lg font-extrabold leading-tight">Quản lý tương tác</div>
                  <div className="text-xs font-semibold text-cyan-100/90 mt-0.5">
                    Trò chơi, tình huống và mô hình 3D
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Right Marine Photo + Top-Right "Mở phòng +" CTA */}
          <div className="lg:col-span-7 relative min-h-[240px] lg:min-h-[300px] overflow-hidden">
            <img
              src="/assets/generated/stations/station_hermit_crab.jpg"
              alt="Cua biển trên ghềnh đá ven bờ"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#F3EFE6] to-transparent pointer-events-none hidden lg:block" />

            {/* Top-right Mở phòng CTA (high contrast coral pill, never lost in photo) */}
            <div className="absolute top-5 right-5 z-20">
              <button
                type="button"
                onClick={() => navigate('/teacher/rooms', { query: { openDrawer: '1' } })}
                className="min-h-[52px] px-5 py-2.5 rounded-full bg-[#D96B4B] hover:bg-[#C55B3C] text-white font-extrabold text-base shadow-[0_6px_20px_rgba(12,59,84,0.28)] border-2 border-white/85 flex items-center gap-2.5 transition-all cursor-pointer active:scale-95"
              >
                <DoorOpen className="w-5 h-5" />
                <span>Mở phòng</span>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* 2. THREE DOMAIN MANAGEMENT CARDS (Học liệu / Tương tác / Sáng tạo)*/}
        {/* ================================================================ */}
        <section
          aria-label="Phân khu quản lý nội dung"
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* Học liệu */}
          <button
            type="button"
            onClick={() => navigate('/teacher/resources', { query: {} })}
            className="group relative h-[132px] rounded-[28px] overflow-hidden border border-[#E2D9C8] shadow-sm hover:shadow-md transition-all cursor-pointer text-left"
          >
            <img
              src={CATEGORY_ARTWORK_MAP.resources.image}
              alt={CATEGORY_ARTWORK_MAP.resources.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C3B54]/35 via-transparent to-transparent" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-[20px] px-4 py-3 min-w-[96px] flex flex-col items-center justify-center gap-1.5 shadow-md border border-[#E2D9C8]">
              <BookOpen className="w-6 h-6 text-[#0C3B54]" />
              <span className="text-sm font-extrabold text-[#0C3B54]">Học liệu</span>
            </div>
          </button>

          {/* Tương tác */}
          <button
            type="button"
            onClick={() => navigate('/teacher/interactive', { query: {} })}
            className="group relative h-[132px] rounded-[28px] overflow-hidden border border-[#E2D9C8] shadow-sm hover:shadow-md transition-all cursor-pointer text-left"
          >
            <img
              src={CATEGORY_ARTWORK_MAP.model3d.image}
              alt={CATEGORY_ARTWORK_MAP.model3d.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C3B54]/35 via-transparent to-transparent" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-[20px] px-4 py-3 min-w-[96px] flex flex-col items-center justify-center gap-1.5 shadow-md border border-[#E2D9C8]">
              <Compass className="w-6 h-6 text-[#0C3B54]" />
              <span className="text-sm font-extrabold text-[#0C3B54]">Tương tác</span>
            </div>
          </button>

          {/* Sáng tạo */}
          <button
            type="button"
            onClick={() => navigate('/teacher/creative', { query: {} })}
            className="group relative h-[132px] rounded-[28px] overflow-hidden border border-[#E2D9C8] shadow-sm hover:shadow-md transition-all cursor-pointer text-left"
          >
            <img
              src="/assets/generated/stations/station_sandy_shells.jpg"
              alt="Vỏ sò và cát biển"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C3B54]/35 via-transparent to-transparent" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-[20px] px-4 py-3 min-w-[96px] flex flex-col items-center justify-center gap-1.5 shadow-md border border-[#E2D9C8]">
              <Palette className="w-6 h-6 text-[#0C3B54]" />
              <span className="text-sm font-extrabold text-[#0C3B54]">Sáng tạo</span>
            </div>
          </button>
        </section>

        {/* ================================================================ */}
        {/* 3. TWO SHORTCUT BANNERS (Quản lý sáng tạo / Phòng sinh hoạt)      */}
        {/* ================================================================ */}
        <section
          aria-label="Lối tắt sáng tạo và phòng sinh hoạt"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Quản lý sáng tạo */}
          <div
            onClick={() => navigate('/teacher/creative', { query: {} })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/teacher/creative', { query: {} });
              }
            }}
            className="group relative h-[210px] rounded-[28px] overflow-hidden border border-[#E2D9C8] shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <img
              src={CATEGORY_ARTWORK_MAP.creative.image}
              alt={CATEGORY_ARTWORK_MAP.creative.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute right-5 bottom-5 bg-white/95 backdrop-blur-sm rounded-[22px] px-5 py-4 shadow-md border border-[#E2D9C8] flex flex-col items-center gap-2 min-w-[165px]">
              <div className="flex items-center gap-2.5 text-[#0C3B54]">
                <Edit3 className="w-6 h-6 text-[#0F5E78]" />
                <span className="font-extrabold text-base leading-tight">
                  Quản lý
                  <br />
                  sáng tạo
                </span>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#EDF3F6] flex items-center justify-center text-[#0C3B54]">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Phòng sinh hoạt */}
          <div
            onClick={() => navigate('/teacher/rooms', { query: {} })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/teacher/rooms', { query: {} });
              }
            }}
            className="group relative h-[210px] rounded-[28px] overflow-hidden border border-[#E2D9C8] shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <img
              src={CATEGORY_ARTWORK_MAP.classroom.image}
              alt={CATEGORY_ARTWORK_MAP.classroom.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute right-5 bottom-5 bg-white/95 backdrop-blur-sm rounded-[22px] px-5 py-4 shadow-md border border-[#E2D9C8] flex flex-col items-center gap-2 min-w-[165px]">
              <div className="flex items-center gap-2.5 text-[#0C3B54]">
                <DoorOpen className="w-6 h-6 text-[#0F5E78]" />
                <span className="font-extrabold text-base leading-tight">
                  Phòng
                  <br />
                  sinh hoạt
                </span>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#EDF3F6] flex items-center justify-center text-[#0C3B54]">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* 4. RECENT ROOM HISTORY (Max 3 ended sessions, no fake KPIs)      */}
        {/* ================================================================ */}
        <section aria-label="Buổi sinh hoạt gần đây" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-extrabold text-xl text-[#0C3B54]">
              Buổi sinh hoạt gần đây
            </h2>
            <button
              type="button"
              onClick={() => navigate('/teacher/rooms', { query: { tab: 'history' } })}
              className="text-sm font-bold text-[#0F5E78] hover:text-[#0C3B54] flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả phòng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-[24px] bg-white border border-[#E2D9C8] shadow-xs overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3 bg-[#E3F0F3] text-xs font-extrabold text-[#0C3B54] uppercase tracking-wider">
              <div className="col-span-5">Buổi</div>
              <div className="col-span-3">Ngày</div>
              <div className="col-span-2">Trạng thái</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>

            {loadingRooms ? (
              <div className="px-6 py-6 text-sm font-semibold text-[#526B7A]">
                Đang tải lịch sử buổi sinh hoạt...
              </div>
            ) : recentRooms.length === 0 ? (
              <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-[#526B7A]">
                <span>Chưa có buổi sinh hoạt nào đã kết thúc gần đây.</span>
                <button
                  type="button"
                  onClick={() => navigate('/teacher/rooms', { query: { openDrawer: '1' } })}
                  className="px-4 py-2 rounded-full bg-[#EDF3F6] hover:bg-[#DCE9EE] text-[#0C3B54] font-bold text-xs cursor-pointer self-start sm:self-auto"
                >
                  Mở phòng sinh hoạt mới
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#ECE6DA]">
                {recentRooms.map((room, idx) => (
                  <div
                    key={room.id}
                    onClick={() => navigate(`/teacher/rooms/${room.id}/results`, { query: {} })}
                    className="grid grid-cols-12 items-center px-6 py-3.5 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <div className="col-span-5 flex items-center gap-3.5 min-w-0">
                      <img
                        src={
                          room.thumbnailUrl ||
                          (idx % 2 === 0
                            ? '/assets/generated/stations/station_hermit_crab.jpg'
                            : '/assets/generated/creatures/sea_turtle_card.jpg')
                        }
                        alt={room.title}
                        className="w-16 h-11 rounded-xl object-cover border border-[#E2D9C8] shrink-0"
                      />
                      <span className="font-bold text-sm text-[#0C3B54] truncate">
                        {room.title}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm font-medium text-[#526B7A]">
                      {formatRoomDate(room.endedAt || room.createdAt)}
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-sm font-semibold text-[#526B7A]">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      <span>Đã kết thúc</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-[#0F5E78] hover:text-[#0C3B54]">
                        <span>Xem kết quả</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </TeacherShell>
  );
}
