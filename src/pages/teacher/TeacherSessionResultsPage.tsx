import { useState } from 'react';
import { useRouter } from '../../app/router';
import { TeacherShell } from '../../shells/TeacherShell';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  Download,
  Printer,
  ArrowLeft,
  Tv,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  Volume2,
  FileText,
  Search,
  BookOpen,
  Compass,
  Palette,
  Calculator,
} from 'lucide-react';

export interface StudentPedagogicalRecord {
  id: string;
  name: string;
  avatar: string;
  progress: string; // e.g. "5/5"
  engagement: number; // e.g. 98%
  tier: 'excellent' | 'good' | 'support';
  badges: string[];
  audioDuration?: string;
  audioText?: string;
  artifactTitle?: string;
  note: string;
}

export const CLASS_SESSION_STUDENTS: StudentPedagogicalRecord[] = [
  {
    id: '01',
    name: 'An',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 98,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    audioDuration: '0:15',
    audioText: 'Con thấy rùa biển phải ngoi lên mặt nước thở vì rùa có phổi giống như chúng con!',
    artifactTitle: 'Tranh sáp: Bạn Rùa và Vườn Cỏ Biển',
    note: 'Tập trung cao độ, phát biểu mạch lạc, hoàn thành xuất sắc thử thách ghép nơi sống.',
  },
  {
    id: '02',
    name: 'Bình',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 95,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    audioDuration: '0:14',
    audioText: 'Con đã xếp đúng chỗ cho bạn cá hề trong bụi hải quỳ bảo vệ bạn ấy.',
    artifactTitle: 'Mô hình 3D: Rạn San Hô Đa Tầng',
    note: 'Tư duy không gian 3D rất tốt, thao tác nhanh nhẹn.',
  },
  {
    id: '03',
    name: 'Chi',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 94,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    audioDuration: '0:16',
    audioText: 'Con thích màu nước biển lúc hoàng hôn, con đã tô màu nước biển màu xanh ngọc lam.',
    artifactTitle: 'Bản phối màu sáp: Hoàng Hôn Đại Dương',
    note: 'Cảm thụ nghệ thuật xuất sắc, có năng khiếu phối màu tự nhiên.',
  },
  {
    id: '04',
    name: 'Duy',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 96,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    audioDuration: '0:12',
    audioText: 'Chúng mình không được vứt rác túi nilon xuống biển vì rùa sẽ tưởng nhầm là sứa.',
    note: 'Ý thức bảo vệ môi trường vượt trội, tích cực chia sẻ trong nhóm.',
  },
  {
    id: '05',
    name: 'Hà',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 92,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    note: 'Hoàn thành tốt hoạt động vẽ sinh vật biển.',
  },
  {
    id: '06',
    name: 'Huy',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 91,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    note: 'Nhận biết chính xác 5 loài sinh vật tầng mặt.',
  },
  {
    id: '07',
    name: 'Khánh',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 90,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    note: 'Tương tác tốt với mô hình rùa bơi.',
  },
  {
    id: '08',
    name: 'Linh',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 91,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    note: 'Tham gia sôi nổi ở phần khởi động.',
  },
  {
    id: '09',
    name: 'Mai',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 90,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    note: 'Tích cực tương tác trên bảng điện tử.',
  },
  {
    id: '10',
    name: 'Minh',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 93,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    note: 'Làm việc nhóm rất hợp tác.',
  },
  {
    id: '11',
    name: 'Nam',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 92,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    note: 'Hoàn thành ghép nơi sống sau 2 lần thử.',
  },
  {
    id: '12',
    name: 'Ngọc',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 90,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    note: 'Bản vẽ rất sáng tạo và chi tiết.',
  },
  {
    id: '13',
    name: 'Phong',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 91,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    note: 'Đã phân biệt được rùa biển và rùa cạn.',
  },
  {
    id: '14',
    name: 'Phúc',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 92,
    tier: 'excellent',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    note: 'Thao tác kéo thả nơi sống chuẩn xác.',
  },
  {
    id: '15',
    name: 'Quân',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 88,
    tier: 'good',
    badges: ['badge-rescue-hero', 'badge-ocean-artist', 'badge-eco-guardian'],
    note: 'Hoàn thành bài tập rất đúng giờ.',
  },
  {
    id: '16',
    name: 'Sơn',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 89,
    tier: 'good',
    badges: ['badge-rescue-hero', 'badge-ocean-artist'],
    note: 'Trí tưởng tượng phong phú về thế giới đại dương.',
  },
  {
    id: '17',
    name: 'Tâm',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 87,
    tier: 'good',
    badges: ['badge-rescue-hero', 'badge-ocean-artist'],
    note: 'Trả lời đúng câu hỏi thử thách ngay lượt đầu.',
  },
  {
    id: '18',
    name: 'Thảo',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 86,
    tier: 'good',
    badges: ['badge-rescue-hero', 'badge-ocean-artist'],
    note: 'Tô màu sinh vật biển rất tỉ mỉ.',
  },
  {
    id: '19',
    name: 'Trang',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 85,
    tier: 'good',
    badges: ['badge-ocean-artist'],
    note: 'Rất chăm chú nghe cô kể chuyện.',
  },
  {
    id: '20',
    name: 'Tuấn',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 88,
    tier: 'good',
    badges: ['badge-ocean-artist'],
    note: 'Đã giúp bạn bên cạnh thao tác xoay mô hình 3D.',
  },
  {
    id: '21',
    name: 'Vinh',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 87,
    tier: 'good',
    badges: ['badge-ocean-artist'],
    note: 'Hăng hái tham gia phần đố vui.',
  },
  {
    id: '22',
    name: 'Vy',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 84,
    tier: 'good',
    badges: [],
    note: 'Phát biểu rất tự tin trước cả lớp.',
  },
  {
    id: '23',
    name: 'Yến',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 78,
    tier: 'support',
    badges: [],
    note: 'Đã hoàn thành 5 bước với sự hướng dẫn của cô Linh.',
  },
  {
    id: '24',
    name: 'Bảo',
    avatar: '/assets/avatar_an.png',
    progress: '5/5',
    engagement: 76,
    tier: 'support',
    badges: [],
    note: 'Cần rèn luyện thêm khả năng tập trung trong nửa cuối buổi học.',
  },
];

export function TeacherSessionResultsPage() {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'excellent' | 'good' | 'support'>('all');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const filteredStudents = CLASS_SESSION_STUDENTS.filter((st) => {
    const matchSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTier = tierFilter === 'all' || st.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const handlePlayAudio = (st: StudentPedagogicalRecord) => {
    if (st.audioText) {
      setPlayingAudioId(st.id);
      oceanAudio.speak(st.audioText);
      setTimeout(() => setPlayingAudioId(null), 3000);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const content = `BÁO CÁO KẾT QUẢ BUỔI HỌC — BLUESTEAM V2
Lớp: Lớp Sao Biển (Mầm non) · Sĩ số: 24/24 (100%)
Giáo viên phụ trách: Cô Linh · Mã buổi học: #482915
Chủ đề: Rùa Biển & Nơi Sinh Sống Diệu Kỳ
Điểm tương tác trung bình: 96%
Tiến độ 5 mục tiêu STEAM:
- Khoa học (S): 100%
- Công nghệ 3D (T): 96%
- Kỹ thuật (E): 92%
- Nghệ thuật tạo hình (A): 95%
- Toán học phân loại (M): 94%

Phân bố thành tích:
- Xuất sắc: 14 học sinh (58.3%)
- Đạt tốt: 8 học sinh (33.3%)
- Cần hỗ trợ: 2 học sinh (8.4%)
Tổng số huy hiệu trao tặng: 54 huy hiệu`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bluesteam_bao_cao_lop_sao_bien_482915.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TeacherShell activeNav="results">
      <div className="space-y-6 pb-12">
        {/* Navigation & Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => navigate('/teacher')}
              className="text-xs font-semibold text-[#17657A] hover:text-[#102A38] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về bàn làm việc giáo viên</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#102A38] tracking-[-0.02em]">
                Báo Cáo Kết Quả Buổi Học
              </h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Phiên học mẫu · Quan sát sư phạm
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600">
              Lớp: <span className="font-bold text-[#102A38]">Lớp Sao Biển</span> · 
              Chủ đề: <span className="font-bold text-[#102A38]">Rùa Biển & Nơi Sinh Sống Diệu Kỳ</span> · 
              Thời gian: <span className="font-mono text-[#17657A]">08:30 - 09:15</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/presentation')}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#102A38] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Mở lại màn hình chiếu bài học"
            >
              <Tv className="w-4 h-4 text-[#17657A]" />
              <span>Màn hình chiếu</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#102A38] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#17657A]" />
              <span>Xuất PDF / In</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadReport}
              className="px-5 py-2.5 rounded-2xl bg-[#102A38] hover:bg-[#17657A] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải báo cáo</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Attendance */}
          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-[#17657A]/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Sĩ số tham gia</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-[#102A38]">24 / 24</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                100%
              </span>
            </div>
            <p className="text-xs text-neutral-500">Toàn bộ lớp học tham gia đầy đủ 5/5 trạm trải nghiệm</p>
          </div>

          {/* Card 2: Engagement */}
          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-[#17657A]/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Tương tác lớp học</span>
              <div className="w-8 h-8 rounded-full bg-sky-50 text-[#17657A] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-[#102A38]">96%</span>
              <span className="text-xs font-bold text-[#17657A] bg-[#E3F6F9] px-2 py-0.5 rounded-md">
                Rất tích cực
              </span>
            </div>
            <p className="text-xs text-neutral-500">Mức độ chú ý và phản hồi bình quân qua các hoạt động</p>
          </div>

          {/* Card 3: Goals Completed */}
          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-[#17657A]/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Mục tiêu đạt được</span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-[#102A38]">5 / 5</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                Đạt chuẩn
              </span>
            </div>
            <p className="text-xs text-neutral-500">Thỏa mãn 100% chuẩn đầu ra bài giảng sinh thái ven bờ</p>
          </div>

          {/* Card 4: Badges Awarded */}
          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-[#17657A]/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Huy hiệu trao tặng</span>
              <div className="w-8 h-8 rounded-full bg-rose-50 text-[#F67650] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-[#102A38]">54</span>
              <span className="text-xs font-bold text-[#F67650] bg-rose-50 px-2 py-0.5 rounded-md">
                Huy hiệu
              </span>
            </div>
            <p className="text-xs text-neutral-500">Trung bình 2.25 huy hiệu mỗi học sinh trong buổi học</p>
          </div>
        </div>

        {/* 2-Column Core Pedagogical Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: 5 STEAM Pillars Progress (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-[28px] p-6 shadow-sm border border-[#17657A]/15 space-y-4 flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-serif font-bold text-lg text-[#102A38]">
                Tiến Độ 5 Trụ Cột STEAM
              </h2>
              <p className="text-xs text-neutral-500">
                Đánh giá mức độ tiếp thu đa chiều của học sinh mầm non
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Pillar 1: Science */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-[#102A38]">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Khoa học (Science): Đặc điểm sinh học Rùa & Cỏ biển</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-600">100%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Pillar 2: Technology */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-[#102A38]">
                    <Tv className="w-4 h-4 text-sky-600" />
                    <span>Công nghệ (Technology): Thao tác mô hình 3D & chạm màn hình</span>
                  </span>
                  <span className="font-mono font-bold text-sky-600">96%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: '96%' }} />
                </div>
              </div>

              {/* Pillar 3: Engineering */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-[#102A38]">
                    <Compass className="w-4 h-4 text-amber-600" />
                    <span>Kỹ thuật (Engineering): Ghép nối nơi sống & môi trường biển</span>
                  </span>
                  <span className="font-mono font-bold text-amber-600">92%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '92%' }} />
                </div>
              </div>

              {/* Pillar 4: Art */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-[#102A38]">
                    <Palette className="w-4 h-4 text-[#F67650]" />
                    <span>Nghệ thuật (Art): Sáng tạo tranh sáp & phối màu đại dương</span>
                  </span>
                  <span className="font-mono font-bold text-[#F67650]">95%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#F67650]" style={{ width: '95%' }} />
                </div>
              </div>

              {/* Pillar 5: Mathematics */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-[#102A38]">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    <span>Toán học (Math): Phân loại số lượng sinh vật & nhận diện hình thái</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-600">94%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: '94%' }} />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-neutral-600 flex items-center justify-between">
              <span className="font-medium">Chỉ số hoàn thành tổng thể STEAM:</span>
              <span className="font-mono font-extrabold text-sm text-[#102A38]">95.4% (Chuẩn A)</span>
            </div>
          </div>

          {/* Right: Achievement Distribution & Badges (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-[28px] p-6 shadow-sm border border-[#17657A]/15 space-y-4 flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-serif font-bold text-lg text-[#102A38]">
                Phân Bố Xếp Loại & Huy Hiệu
              </h2>
              <p className="text-xs text-neutral-500">
                Thống kê năng lực 24 học sinh lớp Sao Biển
              </p>
            </div>

            {/* Distribution Bar Chart */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-700">Xuất sắc (90% - 100%)</span>
                  <span className="font-mono font-bold text-emerald-800">14 bạn (58.3%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '58.3%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-sky-700">Đạt tốt (80% - 89%)</span>
                  <span className="font-mono font-bold text-sky-800">8 bạn (33.3%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: '33.3%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-amber-700">Cần hỗ trợ (&lt; 80%)</span>
                  <span className="font-mono font-bold text-amber-800">2 bạn (8.4%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '8.4%' }} />
                </div>
              </div>
            </div>

            {/* Badges Breakdown with Vector Icons (No raw emoji) */}
            <div className="pt-2 grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-1">
                  <Award className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-[#102A38] block">Cứu Hộ Biển</span>
                <span className="text-[11px] font-mono text-neutral-600">18 huy hiệu</span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-1">
                  <Palette className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-[#102A38] block">Họa Sĩ Biển</span>
                <span className="text-[11px] font-mono text-neutral-600">21 huy hiệu</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-[#102A38] block">Người Giám Hộ</span>
                <span className="text-[11px] font-mono text-neutral-600">15 huy hiệu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Student Artifacts Showcase */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-sm border border-[#17657A]/15 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-xl text-[#102A38]">
                Tác Phẩm & Giọng Nói Tiêu Biểu Của Học Sinh
              </h2>
              <p className="text-xs text-neutral-500">
                Ghi lại sản phẩm sáng tạo và lời phát biểu sinh động trong tiết học
              </p>
            </div>
            <span className="text-xs font-bold text-[#17657A] bg-[#E3F6F9] px-3 py-1 rounded-full">
              3 tác phẩm chọn lọc
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Artifact 1: Bé An */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200">
                  <img
                    src="/assets/generated/craft/child_crayon_turtle.jpg"
                    alt="Tranh sáp của An"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-bold text-white">
                    Tranh sáp 2D
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#102A38]">Bạn Rùa và Vườn Cỏ Biển</h3>
                <p className="text-xs text-neutral-600">Tác giả: Bé An · Điểm tương tác: 98%</p>
              </div>
              <button
                type="button"
                onClick={() => handlePlayAudio(CLASS_SESSION_STUDENTS[0])}
                className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#17657A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe bé giải thích (0:15)</span>
              </button>
            </div>

            {/* Artifact 2: Bé Bình */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200">
                  <img
                    src="/assets/card_clownfish.jpg"
                    alt="Mô hình rạn san hô của Bình"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-bold text-white">
                    Mô hình 3D
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#102A38]">Rạn San Hô Đa Tầng</h3>
                <p className="text-xs text-neutral-600">Tác giả: Bé Bình · Điểm tương tác: 95%</p>
              </div>
              <button
                type="button"
                onClick={() => handlePlayAudio(CLASS_SESSION_STUDENTS[1])}
                className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#17657A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe bé giải thích (0:14)</span>
              </button>
            </div>

            {/* Artifact 3: Bé Chi */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200">
                  <img
                    src="/assets/card_seagrass.jpg"
                    alt="Bản phối màu của Chi"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-bold text-white">
                    Phối màu sáp
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#102A38]">Hoàng Hôn Đại Dương</h3>
                <p className="text-xs text-neutral-600">Tác giả: Bé Chi · Điểm tương tác: 94%</p>
              </div>
              <button
                type="button"
                onClick={() => handlePlayAudio(CLASS_SESSION_STUDENTS[2])}
                className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#17657A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe bé giải thích (0:16)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed 24 Students Roster Table */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-sm border border-[#17657A]/15 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-serif font-bold text-xl text-[#102A38]">
                Danh Sách Chi Tiết 24 Học Sinh
              </h2>
              <p className="text-xs text-neutral-500">
                Theo dõi tiến trình 5 hoạt động, điểm số và nhận xét từng bạn
              </p>
            </div>

            {/* Search and filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên học sinh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#102A38] focus:outline-none focus:ring-2 focus:ring-[#17657A]"
                />
              </div>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A38] focus:outline-none"
              >
                <option value="all">Tất cả xếp loại ({CLASS_SESSION_STUDENTS.length})</option>
                <option value="excellent">Xuất sắc (14)</option>
                <option value="good">Đạt tốt (8)</option>
                <option value="support">Cần hỗ trợ (2)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#102A38] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Học sinh</th>
                  <th className="p-3">Tiến trình</th>
                  <th className="p-3">Điểm tương tác</th>
                  <th className="p-3">Xếp loại</th>
                  <th className="p-3">Huy hiệu đạt</th>
                  <th className="p-3">Chia sẻ âm thanh</th>
                  <th className="p-3 text-right">Nhận xét</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono text-neutral-400 font-bold">{st.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img src={st.avatar} alt={st.name} className="w-7 h-7 rounded-full border border-slate-200" />
                        <span className="font-bold text-sm text-[#102A38]">{st.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{st.progress}</span>
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#17657A]">
                      {st.engagement}%
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                          st.tier === 'excellent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : st.tier === 'good'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {st.tier === 'excellent' ? 'Xuất sắc' : st.tier === 'good' ? 'Đạt tốt' : 'Cần hỗ trợ'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {st.badges.map((b) => (
                          <span
                            key={b}
                            className="text-base"
                            title={
                              b === 'badge-rescue-hero'
                                ? 'Hiệp sĩ Cứu hộ'
                                : b === 'badge-ocean-artist'
                                ? 'Họa sĩ Biển Xanh'
                                : 'Người Giám Hộ San Hô'
                            }
                          >
                            {b === 'badge-rescue-hero' ? '🐢' : b === 'badge-ocean-artist' ? '🎨' : '🌿'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      {st.audioDuration ? (
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(st)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            playingAudioId === st.id
                              ? 'bg-[#17657A] text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-[#17657A]'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{playingAudioId === st.id ? 'Đang phát...' : st.audioDuration}</span>
                        </button>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-xs text-neutral-600 max-w-xs inline-block truncate" title={st.note}>
                        {st.note}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>Hiển thị {filteredStudents.length} / {CLASS_SESSION_STUDENTS.length} học sinh</span>
            <span>BlueSTEAM v2 · Dữ liệu sư phạm được bảo mật</span>
          </div>
        </div>

        {/* Teacher Final Pedagogical Notes */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-sm border border-[#17657A]/15 space-y-4">
          <h2 className="font-serif font-bold text-xl text-[#102A38]">
            Nhận Xét Tổng Quát Của Giáo Viên (Cô Linh)
          </h2>
          <div className="p-4 rounded-2xl bg-[#E3F6F9]/40 border border-[#17657A]/15 flex items-start gap-4">
            <FileText className="w-5 h-5 text-[#17657A] shrink-0 mt-0.5" />
            <p className="text-sm text-neutral-700 leading-relaxed italic">
              "Buổi học diễn ra hết sức tích cực và hào hứng. Cả 24 con đều kết nối thông suốt, 
              thích thú khi nhìn thấy rùa biển 3D trên màn hình chiếu lớn và chủ động làm việc 
              trên thiết bị cá nhân. Các sản phẩm tranh sáp và bản ghi âm thể hiện tư duy ngôn ngữ 
              và tình yêu môi trường sâu sắc của trẻ. Gợi ý cho buổi sau: Mở rộng sang rạn san hô tầng trung và mối quan hệ cộng sinh giữa cá hề và hải quỳ."
            </p>
          </div>
        </div>

      </div>
    </TeacherShell>
  );
}

export const SessionResultsPage = TeacherSessionResultsPage;
export default TeacherSessionResultsPage;
