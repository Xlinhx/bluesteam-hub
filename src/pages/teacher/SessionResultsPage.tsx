import { useState } from 'react';
import { useRouter } from '../../app/router';
import { getStoredConcept, ConceptKey } from '../../showcase/registry';
import { TeacherLayout } from './TeacherLayout';
import { DEMO_STUDENTS } from '../../demo/storage/oceanShowcaseStore';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  Download,
  ArrowLeft,
  ArrowRight,
  Check,
  Play,
  Volume2,
  Users,
  CheckCircle2,
  Mic,
  MoreHorizontal,
  Eye,
  Edit2,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function SessionResultsPage() {
  const { query, navigate } = useRouter();

  const activeConcept = (query.concept as ConceptKey) || getStoredConcept('sessionresults');

  // Audio player state for An's 15s recording
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState(false);

  const handlePlayAnAudio = () => {
    if (isPlayingAudio) {
      oceanAudio.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      oceanAudio.speak('Con thấy gió thổi làm nước đi sang phải, nên phao cũng trôi theo.', () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleSaveReport = () => {
    // Generate real demo report text file and trigger download
    const reportContent = `BÁO CÁO TỔNG KẾT BUỔI HỌC - OCEAN IMMERSIVE LEARNING
===================================================
Bài học: Dòng chảy đại dương — Sức mạnh vô hình
Lớp học: Lớp Sao Biển (24 học sinh)
Giáo viên: Cô Linh
Ngày hoàn thành: 12 tháng 4, 2024
Thời lượng: 40 phút

KẾT QUẢ THAM GIA:
- Sĩ số kết nối: 24/24 học sinh (100%)
- Hoàn thành tiến trình: 5/5 hoạt động
- Bài chia sẻ âm thanh: 24 bản ghi

KHẢO SÁT DỰ ĐOÁN (24 bạn):
- Sang phải: 20 học sinh (83.3%)
- Sang trái: 4 học sinh (16.7%)

NHẬN XÉT CỦA GIÁO VIÊN:
"Các con quan sát rất tập trung và đã mạnh dạn thử thay đổi hướng gió.
Nhiều bạn có cách diễn đạt rõ ràng khi chia sẻ. Buổi học diễn ra sôi nổi và đạt mục tiêu."

DANH SÁCH CHI TIẾT (Trích dẫn):
1. An: Dự đoán Sang phải | Thử nghiệm: Hoàn thành | Chia sẻ: Đã ghi âm 15s
2. Bình: Dự đoán Sang phải | Thử nghiệm: Hoàn thành | Chia sẻ: Đã ghi âm 14s
3. Chi: Dự đoán Sang trái | Thử nghiệm: Hoàn thành | Chia sẻ: Đã ghi âm 16s
4. Duy: Dự đoán Sang phải | Thử nghiệm: Hoàn thành | Chia sẻ: Đã ghi âm 15s
... và 20 học sinh khác trong lớp Sao Biển.
`;
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Bao_cao_Lop_Sao_Bien_Dong_chay_dai_duong.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadFeedback(true);
    setTimeout(() => setDownloadFeedback(false), 3000);
  };

  return (
    <TeacherLayout activeTab="results">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-sky-950">
              Kết quả buổi học
            </h1>
            <p className="text-xs text-neutral-600">
              <strong className="text-sky-950">Dòng chảy đại dương</strong> · Lớp Sao Biển · 24 học sinh
            </p>
            <span className="text-[11px] text-neutral-400 block">
              Hoàn thành ngày 12 thg 4, 2024 · 40 phút
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveReport}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border shadow-sm transition-colors cursor-pointer ${
                downloadFeedback
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white hover:bg-sky-50 border-sky-200 text-sky-950'
              }`}
            >
              <Download className="w-4 h-4 text-sky-700" />
              <span>{downloadFeedback ? 'Đã tải báo cáo' : 'Lưu báo cáo'}</span>
            </button>

            <button
              onClick={() => navigate('/teacher/live')}
              className="px-4 py-2.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về lớp học</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl overflow-hidden shadow-sm border border-sky-100 relative aspect-[16/8] sm:aspect-auto">
            <img src="/assets/hero_buoy_waterline.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-sky-950/40 to-transparent p-4 flex flex-col justify-end text-white">
              <h3 className="font-serif font-bold text-base">Dòng chảy đại dương</h3>
              <p className="text-xs text-sky-200">Sức mạnh vô hình</p>
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-3xl p-5 border border-emerald-100 flex flex-col justify-center items-center text-center space-y-1">
            <Users className="w-7 h-7 text-emerald-600 mb-1" />
            <span className="text-2xl font-bold font-mono text-emerald-950">24/24</span>
            <p className="text-xs text-emerald-800 font-medium">học sinh tham gia</p>
          </div>

          <div className="bg-sky-50/70 rounded-3xl p-5 border border-sky-100 flex flex-col justify-center items-center text-center space-y-1">
            <CheckCircle2 className="w-7 h-7 text-sky-600 mb-1" />
            <span className="text-2xl font-bold font-mono text-sky-950">5/5</span>
            <p className="text-xs text-sky-800 font-medium">hoạt động hoàn thành</p>
          </div>

          <div className="bg-amber-50/70 rounded-3xl p-5 border border-amber-100 flex flex-col justify-center items-center text-center space-y-1">
            <Mic className="w-7 h-7 text-amber-600 mb-1" />
            <span className="text-2xl font-bold font-mono text-amber-950">24</span>
            <p className="text-xs text-amber-800 font-medium">bài chia sẻ âm thanh</p>
          </div>
        </div>

        {/* RENDER CONCEPT A: CINEMATIC DISCOVERY */}
        {activeConcept === 'a' && (
          <div className="space-y-6">
            {/* Dấu vết học tập (4 photos with arrow links) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
              <div>
                <h3 className="font-serif font-bold text-base text-sky-950">
                  Dấu vết học tập
                </h3>
                <p className="text-xs text-neutral-500">
                  Hành trình khám phá của cả lớp qua những khoảnh khắc tiêu biểu
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden">
                    <img src="/assets/hero_buoy_waterline.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-xs text-sky-950">1. Quan sát</h4>
                  <p className="text-[10px] text-neutral-500">Khám phá hiện tượng trên thực tế</p>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden">
                    <img src="/assets/card_flow_drawing.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-xs text-sky-950">2. Dự đoán</h4>
                  <p className="text-[10px] text-neutral-500">Chọn hướng dòng chảy</p>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden">
                    <img src="/assets/lab_wave_flume.jpg" alt="Thử nghiệm tạo sóng và đổi gió" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-xs text-sky-950">3. Thử nghiệm</h4>
                  <p className="text-[10px] text-neutral-500">Thay đổi hướng gió và quan sát</p>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden relative">
                    <img src="/assets/child_microphone.jpg" alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white text-sky-950 flex items-center justify-center shadow">
                        <Mic className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-xs text-sky-950">4. Chia sẻ</h4>
                  <p className="text-[10px] text-neutral-500">Kể lại điều em phát hiện</p>
                </div>
              </div>
            </div>

            {/* Middle Row: Predictions & Teacher Comments */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Dự đoán trước khi thử (6 cols) */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                  <h3 className="font-serif font-bold text-sm text-sky-950">
                    Dự đoán trước khi thử
                  </h3>
                  <span className="text-xs text-neutral-500">Tổng: 24 dự đoán</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-sky-950">Sang phải</span>
                      <span className="font-mono text-sm text-sky-900">20 bạn (83%)</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="w-[83%] h-full bg-sky-600 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-neutral-700">Sang trái</span>
                      <span className="font-mono text-sm text-teal-700">4 bạn (17%)</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="w-[17%] h-full bg-teal-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nhận xét của giáo viên (6 cols) */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                  <h3 className="font-serif font-bold text-sm text-sky-950">
                    Nhận xét của giáo viên
                  </h3>
                  <Edit2 className="w-4 h-4 text-sky-600 cursor-pointer" />
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-sky-50/50">
                  <FileText className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-700 leading-relaxed italic">
                    "Các con quan sát rất tập trung và đã mạnh dạn thử thay đổi hướng gió. Nhiều bạn có cách diễn đạt rõ ràng khi chia sẻ. Buổi học diễn ra sôi nổi và đạt mục tiêu."
                  </p>
                </div>
              </div>
            </div>

            {/* Table: Danh sách học sinh (24) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif font-bold text-base text-sky-950">
                  Danh sách học sinh (24)
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tìm học sinh..."
                    className="px-3 py-1.5 rounded-xl bg-sky-50/50 border border-sky-100 text-xs focus:outline-none"
                  />
                  <select className="px-3 py-1.5 rounded-xl bg-sky-50/50 border border-sky-100 text-xs">
                    <option>Tất cả</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-sky-50/60 text-sky-950 font-bold border-b border-sky-100">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Học sinh</th>
                      <th className="p-3">Hoạt động (5/5)</th>
                      <th className="p-3">Thử nghiệm</th>
                      <th className="p-3">Chia sẻ</th>
                      <th className="p-3">Xem</th>
                      <th className="p-3">Thời gian hoàn thành</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100">
                    {DEMO_STUDENTS.slice(0, 4).map((st) => (
                      <tr key={st.id} className="hover:bg-sky-50/40">
                        <td className="p-3 font-mono text-neutral-500">{st.id}</td>
                        <td className="p-3 font-bold text-sky-950 flex items-center gap-2">
                          <img src="/assets/avatar_an.png" alt="" className="w-6 h-6 rounded-full" />
                          <span>{st.name}</span>
                        </td>
                        <td className="p-3 text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>5/5</span>
                        </td>
                        <td className="p-3">
                          <button className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800">
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={st.name === 'An' ? handlePlayAnAudio : undefined}
                            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                              isPlayingAudio && st.name === 'An'
                                ? 'bg-sky-700 text-white'
                                : 'bg-sky-50 hover:bg-sky-100 text-sky-800'
                            }`}
                            title="Nghe đoạn chia sẻ 15s"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{isPlayingAudio && st.name === 'An' ? 'Đang phát...' : '15s'}</span>
                          </button>
                        </td>
                        <td className="p-3">
                          <button className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="p-3 font-mono text-neutral-500">{st.time}</td>
                        <td className="p-3 text-right">
                          <MoreHorizontal className="w-4 h-4 text-neutral-400 inline cursor-pointer" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50 flex items-center justify-between text-xs text-sky-900 font-semibold cursor-pointer">
                <span>+20 học sinh khác trong lớp Sao Biển</span>
                <span className="flex items-center gap-1">Xem thêm học sinh trong lớp <ArrowRight className="w-3.5 h-3.5" /></span>
              </div>
            </div>

            {/* Bottom Row: Gợi ý cho buổi sau */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-sky-950">
                Gợi ý cho buổi sau · Tiếp tục hành trình khám phá đại dương
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => navigate('/teacher/library')}
                  className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src="/assets/card_clownfish.jpg" alt="" className="w-14 h-12 object-cover rounded-2xl" />
                    <div>
                      <h5 className="font-bold text-xs text-sky-950">Rạn san hô rực rỡ</h5>
                      <p className="text-[11px] text-neutral-500">Những ngôi nhà dưới biển</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-sky-700" />
                </div>

                <div
                  onClick={() => navigate('/teacher/library')}
                  className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src="/assets/card_tidal.jpg" alt="" className="w-14 h-12 object-cover rounded-2xl" />
                    <div>
                      <h5 className="font-bold text-xs text-sky-950">Vùng triều</h5>
                      <p className="text-[11px] text-neutral-500">Khám phá bờ biển kỳ thú</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-sky-700" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RENDER CONCEPT B: SCIENTIFIC ATLAS */}
        {activeConcept === 'b' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Tổng quan buổi học (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
                <h3 className="font-serif font-bold text-sm text-sky-950">
                  Tổng quan buổi học
                </h3>

                <div className="rounded-2xl overflow-hidden aspect-[16/9] shadow-sm">
                  <img src="/assets/hero_buoy_waterline.jpg" alt="" className="w-full h-full object-cover" />
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-sky-950">
                    Dòng chảy đại dương
                  </h4>
                  <p className="text-xs text-sky-700">Sức mạnh vô hình</p>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600 border-t border-sky-100 pt-3">
                  <div className="flex justify-between">
                    <span>Thời gian:</span>
                    <span className="font-semibold text-sky-950">12 thg 4, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời lượng:</span>
                    <span className="font-semibold text-sky-950">40 phút</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giáo viên:</span>
                    <span className="font-semibold text-sky-950">Cô Linh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lớp học:</span>
                    <span className="font-semibold text-sky-950">Lớp Sao Biển · 24 học sinh</span>
                  </div>
                </div>

                {/* 3 Metric Cards stacked */}
                <div className="space-y-2 pt-2">
                  <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between text-teal-950 text-xs font-bold">
                    <span>24/24 học sinh tham gia</span>
                    <Users className="w-4 h-4 text-teal-700" />
                  </div>

                  <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between text-sky-950 text-xs font-bold">
                    <span>5/5 hoạt động hoàn thành</span>
                    <CheckCircle2 className="w-4 h-4 text-sky-700" />
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-950 text-xs font-bold">
                    <span>24 bài chia sẻ âm thanh</span>
                    <Mic className="w-4 h-4 text-amber-700" />
                  </div>
                </div>
              </div>

              {/* Center & Right Area (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Top: Danh sách học sinh */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-3">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                    <h3 className="font-serif font-bold text-sm text-sky-950">
                      Danh sách học sinh (24)
                    </h3>
                    <span className="text-xs text-sky-700 font-bold">24/24</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-neutral-400 text-[11px]">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Học sinh</th>
                          <th className="p-2">Hoạt động</th>
                          <th className="p-2">Thử nghiệm</th>
                          <th className="p-2">Chia sẻ</th>
                          <th className="p-2">Xem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-50">
                        {DEMO_STUDENTS.slice(0, 4).map((st) => (
                          <tr key={st.id}>
                            <td className="p-2 text-neutral-400">{st.id}</td>
                            <td className="p-2 font-bold text-sky-950 flex items-center gap-2">
                              <img src="/assets/avatar_an.png" alt="" className="w-6 h-6 rounded-full" />
                              <span>{st.name}</span>
                            </td>
                            <td className="p-2 text-emerald-700 font-semibold">5/5</td>
                            <td className="p-2"><Play className="w-3.5 h-3.5 text-sky-700" /></td>
                            <td className="p-2">
                              <button onClick={handlePlayAnAudio} className="text-sky-700 hover:text-sky-900 font-bold">
                                🔊 0:15
                              </button>
                            </td>
                            <td className="p-2"><Eye className="w-3.5 h-3.5 text-neutral-400" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Center Bottom: Hồ sơ học tập: An */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                    <div className="flex items-center gap-3">
                      <img src="/assets/avatar_an.png" alt="" className="w-10 h-10 rounded-full border-2 border-sky-400" />
                      <div>
                        <h4 className="font-bold text-sm text-sky-950">Hồ sơ học tập: An</h4>
                        <p className="text-[11px] text-neutral-500">Hoàn thành 5/5 hoạt động</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-sky-700 font-semibold">
                      <span>Xem học sinh khác</span>
                      <ChevronLeft className="w-4 h-4 cursor-pointer" />
                      <ChevronRight className="w-4 h-4 cursor-pointer" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1">
                      <span className="font-bold text-sky-950 block">Dự đoán của An</span>
                      <img src="/assets/card_flow_drawing.png" alt="" className="w-full h-12 object-contain" />
                      <span className="text-emerald-700 font-bold block text-center mt-1">Sang phải</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1">
                      <span className="font-bold text-sky-950 block">Kết quả thử nghiệm</span>
                      <img src="/assets/lab_wave_flume.jpg" alt="Thử nghiệm tạo sóng và đổi gió" className="w-full h-12 object-cover rounded-lg" />
                      <span className="text-emerald-700 font-bold block text-center mt-1">Sang phải</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1">
                      <span className="font-bold text-sky-950 block">Bài chia sẻ của An</span>
                      <button
                        onClick={handlePlayAnAudio}
                        className="w-full py-2 rounded-xl bg-sky-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow mt-2"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>0:15 audio</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1">
                      <span className="font-bold text-sky-950 block">Ghi chú</span>
                      <p className="text-[10px] text-neutral-600 leading-tight italic">
                        "Dòng nước đẩy phao đi sang phải khi có gió. Khi đổi hướng gió thì phao đi theo hướng gió."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
