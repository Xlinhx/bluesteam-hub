import { useState } from 'react';
import { useMovingMarker } from '../../../shared/ui/motion/useMovingMarker';
import './lesson-builder-motion.css';
import { useRouter } from '../../../app/router';
import { TeacherShell } from '../../../shared/shells/TeacherShell';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Edit2,
  Eye,
  FileText,
  GripVertical,
  ListOrdered,
  Maximize2,
  MoreVertical,
  Paperclip,
  Play,
  Plus,
  Printer,
  Target,
  Volume2,
  HelpCircle,
} from 'lucide-react';

export interface LessonActivity {
  id: number;
  title: string;
  subtitle: string;
  thumbnail: string;
  targetHabitat: string;
}

export const CANONICAL_BUILDER_ACTIVITIES: LessonActivity[] = [
  {
    id: 1,
    title: 'Khởi động: Quan sát rùa',
    subtitle: 'Khám phá đặc điểm và cấu tạo của rùa biển',
    thumbnail: '/assets/card_turtle.jpg',
    targetHabitat: 'Thảm cỏ biển',
  },
  {
    id: 2,
    title: 'Quan sát 3D: Tìm nơi sống',
    subtitle: 'Tìm hiểu các kiểu môi trường sống ven bờ',
    thumbnail: '/assets/card_seagrass.jpg',
    targetHabitat: 'Rạn san hô',
  },
  {
    id: 3,
    title: 'Thực hành: Ghép nơi sống',
    subtitle: 'Kéo thả sinh vật vào môi trường phù hợp',
    thumbnail: '/assets/card_clownfish.jpg',
    targetHabitat: 'Vùng nước nông',
  },
  {
    id: 4,
    title: 'Thử thách lớp học: Đố vui tương tác',
    subtitle: 'Bình chọn trực tiếp cùng cả lớp',
    thumbnail: '/assets/card_kelp.jpg',
    targetHabitat: 'Vùng nước sâu',
  },
  {
    id: 5,
    title: 'Đúc kết: Vinh danh & Huy hiệu (Cùng sáng tạo)',
    subtitle: 'Làm sản phẩm và trao huy hiệu STEAM',
    thumbnail: '/assets/card_flow_drawing.png',
    targetHabitat: 'Bãi cát ven bờ',
  },
];

export const CANONICAL_BUILDER_STEPS = CANONICAL_BUILDER_ACTIVITIES;

export const STEP_INSTRUCTIONS: Record<number, { child: string; teacher: string }> = {
  1: {
    child: 'Em hãy chạm vào nơi rùa thường sống nhé!',
    teacher: 'Hỏi trẻ: Vì sao rùa lại thích sống ở thảm cỏ biển?',
  },
  2: {
    child: 'Bé hãy chạm xoay mô hình 3D để khám phá cơ thể rùa biển!',
    teacher: 'Gợi mở: Mai rùa có tác dụng gì giúp bảo vệ bạn ấy?',
  },
  3: {
    child: 'Em hãy chạm vào nơi rùa thường sống nhé!',
    teacher: 'Hỏi trẻ: Vì sao rùa lại thích sống ở thảm cỏ biển?',
  },
  4: {
    child: 'Cả lớp cùng bình chọn câu trả lời đúng trên máy tính bảng!',
    teacher: 'Khuyến khích học sinh thảo luận nhóm trước khi chọn đáp án.',
  },
  5: {
    child: 'Chúc mừng các bé đã hoàn thành xuất sắc bài học hôm nay!',
    teacher: 'Tổng kết kiến thức và trao tặng huy hiệu STEAM cho học sinh.',
  },
};

export function TeacherLessonBuilderPage() {
  const { query, navigate } = useRouter();
  const isPlanMode = query.mode === 'plan';

  // ----------------------------------------------------------------------
  // BUILDER STATE (Screen 34)
  // ----------------------------------------------------------------------
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const stepMarker = useMovingMarker(activeStepId, 'y', 270);
  const [childInstruction, setChildInstruction] = useState(
    STEP_INSTRUCTIONS[1].child
  );
  const [voiceActor, setVoiceActor] = useState('Giọng nữ (mặc định)');
  const [allowRetry, setAllowRetry] = useState(true);
  const [teacherPrompt, setTeacherPrompt] = useState(
    STEP_INSTRUCTIONS[1].teacher
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // Lesson Activities
  const [activities, setActivities] = useState<LessonActivity[]>(CANONICAL_BUILDER_ACTIVITIES);

  const handleHearAudio = () => {
    oceanAudio.speak(childInstruction);
  };

  const handleSelectStep = (id: number) => {
    setActiveStepId(id);
    if (STEP_INSTRUCTIONS[id]) {
      setChildInstruction(STEP_INSTRUCTIONS[id].child);
      setTeacherPrompt(STEP_INSTRUCTIONS[id].teacher);
    }
  };

  const handleAddActivity = () => {
    const newId = activities.length + 1;
    const newAct = {
      id: newId,
      title: `Hoạt động ${newId}: Thử thách mới`,
      subtitle: 'Khám phá và nhận biết mở rộng',
      thumbnail: '/assets/card_clownfish.jpg',
      targetHabitat: 'Biển khơi',
    };
    setActivities([...activities, newAct]);
    setActiveStepId(newId);
  };

  // ----------------------------------------------------------------------
  // RENDER SCREEN 33: 5-STEP LESSON PLAN TEMPLATE (?mode=plan)
  // ----------------------------------------------------------------------
  if (isPlanMode) {
    return (
      <TeacherShell activeNav="plan">
        <div className="space-y-4">
          {/* Breadcrumb Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#17657A]">Giáo án</span>
              <span>&gt;</span>
              <span className="text-[#102A38] font-bold">Khám phá nơi sống</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/teacher/builder')}
              className="text-[#17657A] hover:text-[#102A38] font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Chuyển sang Trình soạn bài</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Quick Navigator (2.5 cols) */}
            <nav className="lg:col-span-3 bg-white rounded-[28px] p-5 shadow-sm border border-slate-200/80 space-y-2">
              <h2 className="font-serif font-bold text-sm text-[#102A38] px-2 pb-2 border-b border-slate-100">
                Nội dung giáo án
              </h2>
              <div className="space-y-1 pt-1">
                {[
                  { id: 'sec-target', label: 'Mục tiêu', icon: Target, active: true },
                  { id: 'sec-prep', label: 'Chuẩn bị', icon: FileText, active: false },
                  { id: 'sec-process', label: 'Tiến trình', icon: ListOrdered, active: false },
                  { id: 'sec-observe', label: 'Quan sát', icon: Eye, active: false },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        item.active
                          ? 'bg-sky-50 text-[#17657A] shadow-2xs'
                          : 'text-slate-600 hover:text-[#102A38] hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </nav>

            {/* Center Column: Full Lesson Plan Document (6.5 cols) */}
            <div className="lg:col-span-6 bg-white rounded-[28px] p-8 shadow-sm border border-slate-200/80 space-y-7">
              {/* Header with Title & Action Buttons */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-sky-100 text-[#17657A] text-[10px] font-extrabold uppercase">
                    GIÁO ÁN
                  </span>
                  <h1 className="text-3xl font-serif font-bold text-[#102A38] tracking-[-0.02em]">
                    Khám phá nơi sống
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/teacher/builder')}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#102A38] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#102A38] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In giáo án</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/presentation', {query:{step:String(activeStepId)}})}
                    className="px-4 py-2 rounded-xl bg-[#102A38] hover:bg-[#17657A] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Mở bài giảng</span>
                  </button>
                </div>
              </div>

              {/* Section 1: Mục tiêu */}
              <section id="sec-target" className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-[#17657A] flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif font-bold text-lg text-[#102A38]">
                    Mục tiêu
                  </h2>
                </div>
                <ul className="space-y-2 pl-10 text-xs text-slate-700 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#17657A] font-bold">•</span>
                    <span>Học sinh nhận biết một số kiểu nơi sống của sinh vật ở trong biển.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#17657A] font-bold">•</span>
                    <span>Học sinh quan sát đặc điểm môi trường và liên hệ với sinh vật phù hợp.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#17657A] font-bold">•</span>
                    <span>Học sinh làm việc nhóm và tạo sản phẩm thể hiện hiểu biết về nơi sống.</span>
                  </li>
                </ul>
              </section>

              {/* Section 2: Chuẩn bị */}
              <section id="sec-prep" className="space-y-3 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif font-bold text-lg text-[#102A38]">
                    Chuẩn bị
                  </h2>
                </div>
                <ul className="space-y-2 pl-10 text-xs text-slate-700 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span>Hình ảnh, video về các nơi sống trong biển (rạn san hô, thảm cỏ biển, vùng biển khơi, vùng ven bờ).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span>Phiếu học tập và giấy vẽ, bút màu, kéo, keo dán.</span>
                  </li>
                </ul>
              </section>

              {/* Section 3: Tiến trình (5-Step Authentic STEAM Structure) */}
              <section id="sec-process" className="space-y-4 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#F67650] flex items-center justify-center shrink-0">
                    <ListOrdered className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif font-bold text-lg text-[#102A38]">
                    Tiến trình
                  </h2>
                </div>

                <div className="space-y-3 pl-2 sm:pl-6">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-[#17657A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-[#102A38]">
                        Khởi động: Quan sát rùa biển và đặt câu hỏi
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                        Giáo viên cho học sinh xem hình ảnh hoặc video ngắn về rùa biển. Đặt câu hỏi gợi mở: Rùa biển sống ở đâu? Chúng ăn gì?
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-[#17657A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-[#102A38]">
                        Khám phá: Tìm hiểu các kiểu nơi sống
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                        Học sinh quan sát tranh/ảnh về các nơi sống trong biển: rạn san hô, thảm cỏ biển, vùng nước nông, biển sâu.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-[#17657A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-[#102A38]">
                        Thực hành: Ghép sinh vật với nơi sống
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                        Học sinh tham gia trò chơi tương tác trên màn hình hoặc ghép thẻ hình: đưa rùa, cá hề, cua vào đúng nơi sống phù hợp.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-[#17657A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-[#102A38]">
                        Sáng tạo: Làm sản phẩm về nơi sống
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                        Học sinh vẽ tranh, cắt dán hoặc tạo mô hình nơi sống của rùa biển bằng đất nặn, giấy màu.
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-[#17657A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      5
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-[#102A38]">
                        Tổng kết: Chia sẻ và đúc kết
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                        Học sinh trưng bày sản phẩm, nói 1-2 câu về nơi sống của rùa biển. Giáo viên tổng kết bài học và gửi lời khen ngợi.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Quan sát và đánh giá */}
              <section id="sec-observe" className="space-y-3 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif font-bold text-lg text-[#102A38]">
                    Quan sát và đánh giá
                  </h2>
                </div>
                <ul className="space-y-2 pl-10 text-xs text-slate-700 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-700 font-bold">•</span>
                    <span>Trẻ có hào hứng tham gia quan sát và trả lời câu hỏi không?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-700 font-bold">•</span>
                    <span>Trẻ có ghép đúng rùa biển với thảm cỏ biển hoặc rạn san hô không?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-700 font-bold">•</span>
                    <span>Sản phẩm của trẻ thể hiện được đặc điểm của nơi sống không?</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* Right Column: Attached Materials Sidebar (3 cols) */}
            <aside className="lg:col-span-3 bg-white rounded-[28px] p-5 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Paperclip className="w-4 h-4 text-[#17657A]" />
                <h2 className="font-serif font-bold text-sm text-[#102A38]">
                  Học liệu đính kèm
                </h2>
              </div>

              <div className="space-y-3">
                {/* Attached Item 1 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-14 h-12 rounded-xl overflow-hidden shrink-0">
                      <img
                        src="/assets/card_seagrass.jpg"
                        alt="Hình ảnh nơi sống ven bờ"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-[#102A38] truncate">
                        Hình ảnh nơi sống ven bờ
                      </h3>
                      <span className="text-[10px] text-slate-500">Hình ảnh</span>
                    </div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                {/* Attached Item 2 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-14 h-12 rounded-xl overflow-hidden shrink-0">
                      <img
                        src="/assets/card_clownfish.jpg"
                        alt="Hình ảnh rạn san hô"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-[#102A38] truncate">
                        Hình ảnh rạn san hô
                      </h3>
                      <span className="text-[10px] text-slate-500">Hình ảnh</span>
                    </div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                {/* Attached Item 3 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-14 h-12 rounded-xl overflow-hidden shrink-0">
                      <img
                        src="/assets/card_flow_drawing.png"
                        alt="Phiếu học tập quan sát"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-[#102A38] truncate">
                        Phiếu học tập quan sát
                      </h3>
                      <span className="text-[10px] text-slate-500">Tài liệu in</span>
                    </div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </TeacherShell>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER SCREEN 34: INTERACTIVE LESSON BUILDER (default)
  // ----------------------------------------------------------------------
  return (
    <TeacherShell activeNav="builder">
      <div className="space-y-4">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => navigate('/teacher')}
              className="text-xs font-semibold text-[#17657A] hover:text-[#102A38] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại danh sách bài giảng</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#102A38] tracking-[-0.02em]">
              Soạn bài: Khám phá nơi sống
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => alert('Đã lưu các thay đổi của bài giảng!')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#102A38] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lưu</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/presentation', { query: { step: String(activeStepId) } })}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#102A38] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem góc nhìn của bé</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigate('/presentation', { query: { step: String(activeStepId) } });
              }}
              className="px-5 py-2.5 rounded-xl bg-[#102A38] hover:bg-[#17657A] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Bắt đầu</span>
            </button>
          </div>
        </div>

        {/* 3-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Hoạt động trong bài (3 cols) */}
          <aside className="lg:col-span-3 bg-white rounded-[28px] p-5 shadow-sm border border-slate-200/80 space-y-4">
            <h2 className="font-serif font-bold text-sm text-[#102A38] border-b border-slate-100 pb-2">
              Hoạt động trong bài
            </h2>

            <div className="space-y-2.5">
              {activities.map((act) => {
                const isActive = act.id === activeStepId;
                return (
                  <button
                    key={act.id}
                    type="button"
                    aria-current={isActive ? 'step' : undefined}
                    onClick={event => {
                      if (act.id !== activeStepId) stepMarker.prepare(event.detail > 0);
                      handleSelectStep(act.id);
                    }}
                    className={`lesson-step-control relative w-full p-3 rounded-2xl border text-left cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'border-[#17657A] ring-2 ring-[#17657A]/20 bg-sky-50/40 shadow-xs'
                        : 'border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    {isActive && <span ref={stepMarker.marker} className="lesson-step-marker" data-motion-marker aria-hidden="true" />}
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span className="flex flex-col items-center gap-1">
                        <span
                          className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                            isActive
                              ? 'bg-[#102A38] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {act.id}
                        </span>
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 cursor-grab" aria-hidden="true" />
                      </span>

                      <span className="w-14 h-12 rounded-xl overflow-hidden shadow-2xs shrink-0">
                        <img
                          src={act.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </span>

                      <span className="min-w-0">
                        <span className="block font-bold text-xs text-[#102A38] truncate">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">
                          {act.subtitle}
                        </span>
                      </span>
                    </span>

                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddActivity}
              className="w-full py-3 rounded-2xl border border-dashed border-[#17657A]/40 hover:border-[#17657A] bg-sky-50/50 hover:bg-sky-50 text-[#17657A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm hoạt động</span>
            </button>
          </aside>

          {/* Center Column: Live Activity Preview (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-[28px] p-5 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
              <h2 className="font-serif font-bold text-sm text-[#102A38]">
                Xem trước hoạt động: {activities.find((a) => a.id === activeStepId)?.title}
              </h2>
              <span className="text-[11px] font-bold text-[#17657A]">
                Bước {activeStepId}/{activities.length}
              </span>
            </div>

            {/* Interactive Learner View Simulated Scene */}
            <div className="relative rounded-2xl overflow-hidden bg-sky-950 aspect-[16/11] flex flex-col justify-between p-4 shadow-inner text-white select-none">
              {/* Underwater photographic scene */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('/assets/card_seagrass.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-transparent to-sky-950/70" />

              {/* Top Prompt Pill + Scallop Hint Button */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-white/80 text-[#102A38] flex items-center justify-center shadow-sm hover:bg-white cursor-pointer"
                  aria-label="Quay lại"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#102A38] text-xs font-bold shadow-md border border-white/40">
                  <Volume2 className="w-3.5 h-3.5 text-[#17657A]" />
                  <span>{childInstruction}</span>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Gợi ý cho bé: Rùa biển thích ăn cỏ biển ở dưới đáy!')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#102A38] text-xs font-bold shadow-md border border-white/40 hover:bg-white cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#F67650]" />
                  <span>Gợi ý</span>
                </button>
              </div>

              {/* Main Scene: Synchronized with activeStepId */}
              <div className="relative z-10 flex-1 flex items-center justify-center">
                {(activeStepId === 1 || activeStepId === 3) && (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src="/assets/generated/creatures/green_turtle_hero.jpg"
                        alt="Rùa biển bơi"
                        className="w-40 sm:w-48 rounded-2xl shadow-xl border-2 border-white/50 object-cover"
                      />
                      <span className="px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs font-bold text-white border border-white/20">
                        Rùa biển xanh (Chelonia mydas)
                      </span>
                    </div>

                    {/* Hotspot 1: Vùng nước nông */}
                    <button
                      type="button"
                      onClick={() => setSelectedHotspot('Vùng nước nông')}
                      className={`absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer ${
                        selectedHotspot === 'Vùng nước nông'
                          ? 'bg-amber-400 text-sky-950 scale-105 ring-4 ring-amber-300/40'
                          : 'bg-white/90 text-sky-950 hover:bg-white'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border-2 border-teal-500" />
                      <span>Vùng nước nông</span>
                    </button>

                    {/* Hotspot 2: Thảm cỏ biển (Correct target) */}
                    <button
                      type="button"
                      onClick={() => setSelectedHotspot('Thảm cỏ biển')}
                      className={`absolute bottom-8 left-12 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer ${
                        selectedHotspot === 'Thảm cỏ biển'
                          ? 'bg-emerald-400 text-sky-950 scale-105 ring-4 ring-emerald-300/50'
                          : 'bg-white/90 text-sky-950 hover:bg-white'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Thảm cỏ biển</span>
                    </button>

                    {/* Hotspot 3: Rạn san hô */}
                    <button
                      type="button"
                      onClick={() => setSelectedHotspot('Rạn san hô')}
                      className={`absolute bottom-6 right-8 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer ${
                        selectedHotspot === 'Rạn san hô'
                          ? 'bg-orange-400 text-sky-950 scale-105 ring-4 ring-orange-300/50'
                          : 'bg-white/90 text-sky-950 hover:bg-white'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border-2 border-orange-500" />
                      <span>Rạn san hô</span>
                    </button>
                  </>
                )}

                {activeStepId === 2 && (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src="/assets/card_turtle.jpg"
                      alt="Mô hình 3D Rùa biển"
                      className="w-44 sm:w-52 rounded-2xl shadow-xl border-2 border-[#2EE6CA]/50 object-cover ring-4 ring-[#2EE6CA]/20"
                    />
                    <span className="px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-xs font-bold text-[#2EE6CA] border border-[#2EE6CA]/30">
                      Chế độ xoay quan sát 3D
                    </span>
                  </div>
                )}

                {activeStepId === 4 && (
                  <div className="flex flex-col items-center gap-3 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center max-w-sm">
                    <span className="text-xs font-bold text-[#2EE6CA]">Thử thách lớp học</span>
                    <h4 className="font-serif font-bold text-sm text-white">Rùa biển hô hấp bằng gì?</h4>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-xl bg-white/20 text-xs">Mang</span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/80 text-xs font-bold ring-2 ring-emerald-300">Phổi ✓</span>
                    </div>
                  </div>
                )}

                {activeStepId === 5 && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                    <span className="text-3xl">🏅</span>
                    <h4 className="font-serif font-bold text-sm text-white">Vinh danh & Trao huy hiệu</h4>
                    <span className="text-xs text-white/80">Cả lớp đã hoàn thành xuất sắc!</span>
                  </div>
                )}
              </div>

              {/* Bottom slide dots + Fullscreen */}
              <div className="relative z-10 flex items-center justify-between pt-2">
                <div className="w-6" />
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <span
                      key={d}
                      className={`w-2 h-2 rounded-full ${
                        d === activeStepId ? 'bg-white w-3' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-xs flex items-center justify-center text-white hover:bg-black/60 cursor-pointer"
                  aria-label="Toàn màn hình"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Cài đặt hoạt động (3 cols) */}
          <aside className="lg:col-span-3 bg-white rounded-[28px] p-5 shadow-sm border border-slate-200/80 space-y-4">
            <h2 className="font-serif font-bold text-sm text-[#102A38] border-b border-slate-100 pb-2">
              Cài đặt hoạt động
            </h2>

            <div className="space-y-3 text-xs">
              {/* 1. Hướng dẫn cho trẻ */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Hướng dẫn cho trẻ</label>
                  <span className="text-[10px] text-slate-400">
                    {childInstruction.length}/200
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={childInstruction}
                  onChange={(e) => setChildInstruction(e.target.value)}
                  className="ui-field w-full leading-relaxed resize-none"
                />
              </div>

              {/* 2. Giọng đọc hướng dẫn */}
              <div className="space-y-1.5">
                <label htmlFor="lesson-voice-actor" className="font-bold text-slate-700 block">
                  Giọng đọc hướng dẫn
                </label>
                <div className="flex items-center gap-2">
                  <select
                    id="lesson-voice-actor"
                    value={voiceActor}
                    onChange={(e) => setVoiceActor(e.target.value)}
                    className="min-w-0 flex-1 font-medium"
                  >
                    <option>Giọng nữ (mặc định)</option>
                    <option>Giọng nam ấm áp</option>
                    <option>Giọng cô giáo miền Nam</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleHearAudio}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#102A38] font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Play className="w-3 h-3 fill-[#102A38]" />
                    <span>Nghe thử</span>
                  </button>
                </div>
              </div>

              {/* 3. Cho phép thử lại */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Cho phép thử lại</span>
                  <span className="text-[10px] text-slate-500">
                    Trẻ có thể thử lại khi chọn chưa đúng.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowRetry(!allowRetry)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    allowRetry ? 'bg-[#17657A]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      allowRetry ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* 4. Gợi ý dành cho giáo viên */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">
                    Gợi ý dành cho giáo viên
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {teacherPrompt.length}/200
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={teacherPrompt}
                  onChange={(e) => setTeacherPrompt(e.target.value)}
                  className="ui-field w-full leading-relaxed resize-none"
                />
              </div>

              {/* 5. Tùy chọn nâng cao */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                  className="w-full flex items-center justify-between text-slate-700 font-bold hover:text-[#102A38] transition-colors py-1 cursor-pointer"
                >
                  <span>Tùy chọn nâng cao</span>
                  {advancedOpen ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {advancedOpen && (
                  <div className="space-y-2 pt-2 text-[11px] text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#17657A]" />
                      <span>Tự động phát lời dặn khi bé vào màn hình</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#17657A]" />
                      <span>Kích hoạt hiệu ứng sóng nước Three.js</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </TeacherShell>
  );
}
