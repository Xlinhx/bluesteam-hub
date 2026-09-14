import { useState } from 'react';
import { useRouter } from '../../app/router';
import { TeacherShell } from '../../shells/TeacherShell';
import {
  Search,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Play,
  Plus,
  Bookmark,
  Target,
  BookOpen,
  Gamepad2,
  Video,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';

export interface ResourceItem {
  id: string;
  title: string;
  type: 'Tương tác' | 'Video' | 'Bài giảng' | 'Hình ảnh' | 'Bản đồ';
  description: string;
  thumbnail: string;
  ageGroup: string;
  theme: string;
  objectives: string[];
  instructionText: string;
}

export const SAMPLE_RESOURCES: ResourceItem[] = [
  {
    id: 'find-habitat',
    title: 'Tìm nơi sống',
    type: 'Tương tác',
    description: 'Khám phá nơi sống của các sinh vật biển và ghép đúng môi trường.',
    thumbnail: '/assets/card_clownfish.jpg',
    ageGroup: '5-6 tuổi (Lá)',
    theme: 'Hệ sinh thái biển',
    objectives: [
      'Nhận biết một số môi trường sống trong hệ sinh thái biển.',
      'Quan sát đặc điểm của sinh vật biển.',
      'Ghép sinh vật với môi trường sống phù hợp.',
    ],
    instructionText:
      'Kéo thả các sinh vật vào đúng môi trường sống. Hãy quan sát đặc điểm của mỗi sinh vật và môi trường để lựa chọn phù hợp.',
  },
  {
    id: 'marine-creatures-habitat',
    title: 'Sinh vật biển và môi trường sống',
    type: 'Video',
    description: 'Tìm hiểu đặc điểm nơi sống của các sinh vật biển phổ biến.',
    thumbnail: '/assets/card_turtle.jpg',
    ageGroup: '4-5 tuổi (Chồi)',
    theme: 'Động vật biển',
    objectives: [
      'Quan sát chuyển động và cách bơi của rùa biển, sứa và cá.',
      'Hiểu vì sao mỗi loài cần môi trường biển sạch để sinh trưởng.',
    ],
    instructionText:
      'Xem video phóng sự đại dương và thảo luận cùng cô về các loài sinh vật biển.',
  },
  {
    id: 'coral-ecosystem',
    title: 'Hệ sinh thái rạn san hô',
    type: 'Bài giảng',
    description: 'Giới thiệu các thành phần trong đại dương và mối liên hệ giữa chúng.',
    thumbnail: '/assets/card_kelp.jpg',
    ageGroup: '5-6 tuổi (Lá)',
    theme: 'Khám phá khoa học',
    objectives: [
      'Nhận diện rạn san hô là ngôi nhà chung của các sinh vật nhiệt đới.',
      'Nhận biết mối quan hệ hỗ trợ lẫn nhau giữa san hô và cá hề.',
    ],
    instructionText:
      'Trình chiếu bài giảng tương tác và cho trẻ tương tác đặt câu hỏi trên màn hình.',
  },
  {
    id: 'ocean-environments',
    title: 'Các kiểu môi trường biển',
    type: 'Hình ảnh',
    description: 'Hình ảnh minh họa các môi trường sống dưới biển và vùng ven bờ.',
    thumbnail: '/assets/card_tidal.jpg',
    ageGroup: '3-4 tuổi (Mầm)',
    theme: 'Hoạt động góc',
    objectives: [
      'Phân biệt vùng nước nông, bãi triều và rừng ngập mặn.',
      'Rèn luyện kỹ năng quan sát qua bộ tranh phóng to chất lượng cao.',
    ],
    instructionText:
      'In hoặc hiển thị ảnh chụp thực tế cho trẻ làm quen trong góc học tập thiên nhiên.',
  },
  {
    id: 'coastal-vietnam',
    title: 'Khám phá vùng biển quê hương',
    type: 'Bản đồ',
    description: 'Tìm hiểu các khu vực biển và hệ sinh thái đặc trưng ở Việt Nam.',
    thumbnail: '/assets/map_island_journey.jpg',
    ageGroup: '5-6 tuổi (Lá)',
    theme: 'Kể chuyện sinh thái',
    objectives: [
      'Biết biển đảo Việt Nam giàu đẹp với nhiều danh lam thắng cảnh.',
      'Nuôi dưỡng tình yêu thiên nhiên và ý thức giữ gìn bãi biển quê hương.',
    ],
    instructionText:
      'Khám phá hải trình ven biển Việt Nam từ vịnh Hạ Long đến Côn Đảo, Phú Quốc.',
  },
];

export function TeacherResourceLibraryPage() {
  const { navigate } = useRouter();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAge, setSelectedAge] = useState<string[]>(['5-6 tuổi (Lá)']);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Tương tác']);
  const [selectedThemes, setSelectedThemes] = useState<string[]>(['Hệ sinh thái biển']);
  const [selectedResourceId, setSelectedResourceId] = useState('find-habitat');

  // Accordion toggle states
  const [ageOpen, setAgeOpen] = useState(true);
  const [typeOpen, setTypeOpen] = useState(true);
  const [themeOpen, setThemeOpen] = useState(true);

  // Selected item
  const activeResource =
    SAMPLE_RESOURCES.find((r) => r.id === selectedResourceId) || SAMPLE_RESOURCES[0];

  const toggleAge = (val: string) => {
    setSelectedAge((prev) =>
      prev.includes(val) ? prev.filter((a) => a !== val) : [...prev, val]
    );
  };

  const toggleType = (val: string) => {
    setSelectedTypes((prev) =>
      prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]
    );
  };

  const toggleTheme = (val: string) => {
    setSelectedThemes((prev) =>
      prev.includes(val) ? prev.filter((th) => th !== val) : [...prev, val]
    );
  };

  return (
    <TeacherShell activeNav="library">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pedagogical Filter Sidebar (3 cols) */}
        <aside className="lg:col-span-3 bg-white rounded-[28px] p-5 shadow-sm border border-slate-200/80 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm học liệu, chủ đề hoặc từ khóa..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#102A38] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17657A]/30 transition-all"
            />
          </div>

          {/* Group 1: Độ tuổi (STRICT CORRECTION: Preschool only Mầm/Chồi/Lá) */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setAgeOpen(!ageOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#102A38] hover:text-[#17657A] transition-colors pb-2 cursor-pointer"
            >
              <span>Độ tuổi</span>
              {ageOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {ageOpen && (
              <div className="space-y-2 pt-1 text-xs text-slate-700">
                {['3-4 tuổi (Mầm)', '4-5 tuổi (Chồi)', '5-6 tuổi (Lá)'].map((age) => (
                  <label
                    key={age}
                    className="flex items-center gap-2.5 cursor-pointer hover:text-[#102A38] select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAge.includes(age)}
                      onChange={() => toggleAge(age)}
                      className="w-4 h-4 rounded text-[#17657A] focus:ring-[#17657A] border-slate-300"
                    />
                    <span>{age}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Group 2: Loại học liệu */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setTypeOpen(!typeOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#102A38] hover:text-[#17657A] transition-colors pb-2 cursor-pointer"
            >
              <span>Loại học liệu</span>
              {typeOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {typeOpen && (
              <div className="space-y-2 pt-1 text-xs text-slate-700">
                {[
                  'Bài giảng',
                  'Video',
                  'Tương tác',
                  'Phiếu học tập',
                  'Bản đồ',
                  'Hình ảnh',
                ].map((t) => (
                  <label
                    key={t}
                    className="flex items-center gap-2.5 cursor-pointer hover:text-[#102A38] select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(t)}
                      onChange={() => toggleType(t)}
                      className="w-4 h-4 rounded text-[#17657A] focus:ring-[#17657A] border-slate-300"
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Group 3: Chủ đề (Kindergarten STEAM Categories) */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setThemeOpen(!themeOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#102A38] hover:text-[#17657A] transition-colors pb-2 cursor-pointer"
            >
              <span>Chủ đề</span>
              {themeOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {themeOpen && (
              <div className="space-y-2 pt-1 text-xs text-slate-700">
                {[
                  'Hệ sinh thái biển',
                  'Động vật biển',
                  'Thực vật biển',
                  'Khám phá khoa học',
                  'Hoạt động góc',
                  'Kể chuyện sinh thái',
                  'Bảo vệ môi trường',
                  'Đại dương và con người',
                ].map((th) => (
                  <label
                    key={th}
                    className="flex items-center gap-2.5 cursor-pointer hover:text-[#102A38] select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedThemes.includes(th)}
                      onChange={() => toggleTheme(th)}
                      className="w-4 h-4 rounded text-[#17657A] focus:ring-[#17657A] border-slate-300"
                    />
                    <span>{th}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Middle Column: Results List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-serif font-bold text-lg text-[#102A38]">
              Kết quả tìm kiếm
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {SAMPLE_RESOURCES.length} học liệu
            </span>
          </div>

          <div className="space-y-3">
            {SAMPLE_RESOURCES.map((item) => {
              const isSelected = item.id === selectedResourceId;
              const renderTypeBadge = () => {
                switch (item.type) {
                  case 'Tương tác':
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-[#F67650] text-[10px] font-bold border border-orange-200">
                        <Gamepad2 className="w-3 h-3" />
                        Tương tác
                      </span>
                    );
                  case 'Video':
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200">
                        <Video className="w-3 h-3" />
                        Video
                      </span>
                    );
                  case 'Bài giảng':
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                        <BookOpen className="w-3 h-3" />
                        Bài giảng
                      </span>
                    );
                  case 'Hình ảnh':
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        <ImageIcon className="w-3 h-3" />
                        Hình ảnh
                      </span>
                    );
                  case 'Bản đồ':
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                        <MapPin className="w-3 h-3" />
                        Bản đồ
                      </span>
                    );
                  default:
                    return null;
                }
              };

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedResourceId(item.id)}
                  className={`p-3.5 rounded-[22px] bg-white border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs hover:shadow-sm ${
                    isSelected
                      ? 'border-[#17657A] ring-2 ring-[#17657A]/20 bg-sky-50/20'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-18 h-14 rounded-xl overflow-hidden shadow-xs shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        {renderTypeBadge()}
                      </div>
                      <h3 className="font-bold text-sm text-[#102A38] truncate">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 shrink-0"
                    aria-label="Thao tác"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detail Preview Pane (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-5">
          {/* Interactive Scene Banner */}
          <div className="relative rounded-[22px] overflow-hidden bg-sky-950 min-h-[260px] p-5 flex flex-col justify-between text-white shadow-inner">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{ backgroundImage: `url('/assets/card_seagrass.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-sky-950/60 via-transparent to-sky-950/90" />

            {/* Top Overlay Tag & Title */}
            <div className="relative z-10 space-y-1">
              <h2 className="text-2xl font-serif font-bold text-white drop-shadow">
                {activeResource.title}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/90 text-white text-[10px] font-bold">
                <Gamepad2 className="w-3 h-3" />
                {activeResource.type}
              </span>
            </div>

            {/* Interactive Habitat Target Zones & Creature Tokens Matching Mockup */}
            <div className="relative z-10 flex items-end justify-between gap-4 pt-4">
              {/* Left creature tokens list */}
              <div className="flex flex-col gap-1.5 bg-black/40 backdrop-blur-xs p-2 rounded-2xl border border-white/20">
                {['🐟', '🐢', '🐠', '⭐', '🌿'].map((icon, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-xl bg-white text-base flex items-center justify-center shadow-xs cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                    title="Sinh vật biển kéo thả"
                  >
                    {icon}
                  </div>
                ))}
              </div>

              {/* Right Drop Zones */}
              <div className="flex-1 space-y-2">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs border border-dashed border-white/60 text-center">
                  <span className="text-[11px] font-bold text-white block">
                    Vùng ven bờ (cỏ biển)
                  </span>
                  <div className="h-4 border border-dashed border-white/30 rounded mt-1" />
                </div>
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs border border-dashed border-white/60 text-center">
                  <span className="text-[11px] font-bold text-white block">
                    Rạn san hô
                  </span>
                  <div className="h-4 border border-dashed border-white/30 rounded mt-1" />
                </div>
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs border border-dashed border-white/60 text-center">
                  <span className="text-[11px] font-bold text-white block">
                    Vùng nước sâu
                  </span>
                  <div className="h-4 border border-dashed border-white/30 rounded mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Mục tiêu */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#102A38]">
                Mục tiêu
              </h3>
            </div>
            <ul className="space-y-1.5 pl-10 text-xs text-slate-600">
              {activeResource.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Hướng dẫn hoạt động */}
          <div className="space-y-2.5 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-[#17657A] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#102A38]">
                {activeResource.title}
              </h3>
            </div>
            <p className="pl-10 text-xs text-slate-600 leading-relaxed">
              {activeResource.instructionText}
            </p>
          </div>

          {/* 3 Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/interactive/habitat-placement')}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#102A38] hover:bg-[#17657A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Thử hoạt động</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/teacher/builder')}
              className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#102A38] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm vào bài giảng</span>
            </button>

            <button
              type="button"
              onClick={() => alert('Đã lưu học liệu vào danh sách yêu thích của cô!')}
              className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#102A38] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Bookmark className="w-4 h-4" />
              <span>Lưu</span>
            </button>
          </div>
        </div>
      </div>
    </TeacherShell>
  );
}

export const TeacherLibraryPage = TeacherResourceLibraryPage;
export default TeacherResourceLibraryPage;
