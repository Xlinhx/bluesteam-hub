import { useState } from 'react';
import { useRouter } from '../../app/router';
import { getStoredConcept, ConceptKey } from '../../showcase/registry';
import { TeacherLayout } from './TeacherLayout';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  Bookmark,
  ChevronDown,
  Play,
  Volume2,
  ArrowRight,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';

export function TeacherLibraryPage() {
  const { query, navigate } = useRouter();

  const activeConcept = (query.concept as ConceptKey) || getStoredConcept('teacherlibrary');
  const [selectedTopic, setSelectedTopic] = useState('Chuyển động biển');
  const [selectedType, setSelectedType] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedLesson, setSelectedLesson] = useState({
    id: 'ocean-currents',
    title: 'Dòng chảy đại dương',
    subtitle: 'Sức mạnh vô hình',
    image: '/assets/hero_buoy_waterline.jpg',
    tag: 'Bài học',
    activitiesCount: 5,
    objective: 'Quan sát chuyển động trên mặt nước và khám phá sức mạnh vô hình của dòng chảy.',
  });

  const handleHearGuide = () => {
    oceanAudio.speak(selectedLesson.objective);
  };

  return (
    <TeacherLayout activeTab="library">
      {/* RENDER CONCEPT A: CINEMATIC DISCOVERY */}
      {activeConcept === 'a' && (
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-serif font-bold text-sky-950">
              Thư viện
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Khám phá bài học và tài nguyên để tạo những tiết học giàu trải nghiệm.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-sky-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 font-semibold flex items-center gap-1.5 cursor-pointer">
                <span>Chủ đề</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              <button className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 font-semibold flex items-center gap-1.5 cursor-pointer">
                <span>Loại tài nguyên</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              <button className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 font-semibold flex items-center gap-1.5 cursor-pointer">
                <span>Có tương tác</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-100 text-neutral-700 font-medium flex items-center gap-1.5 cursor-pointer">
                <span>Sắp xếp: Gần đây</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              <button className="px-3.5 py-2 rounded-xl bg-sky-900 text-white font-semibold flex items-center gap-1.5 cursor-pointer">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Đã lưu</span>
              </button>
            </div>
          </div>

          {/* Grid + Detail Preview Pane */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Resources Grid (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Big Featured Card: Dòng chảy đại dương */}
              <div
                onClick={() => setSelectedLesson({
                  id: 'ocean-currents',
                  title: 'Dòng chảy đại dương',
                  subtitle: 'Sức mạnh vô hình',
                  image: '/assets/hero_buoy_waterline.jpg',
                  tag: 'Bài học',
                  activitiesCount: 5,
                  objective: 'Quan sát chuyển động trên mặt nước và khám phá sức mạnh vô hình của dòng chảy.',
                })}
                className={`group bg-white rounded-3xl overflow-hidden shadow-sm border-2 hover:shadow-md transition-all cursor-pointer ${
                  selectedLesson.id === 'ocean-currents' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-200'
                }`}
              >
                <div className="relative aspect-[16/8] overflow-hidden">
                  <img
                    src="/assets/hero_buoy_waterline.jpg"
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-sky-900/90 text-white text-[10px] font-bold">
                    Bài học
                  </div>
                  <button className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-sky-900 shadow">
                    <Bookmark className={`w-3.5 h-3.5 ${selectedLesson.id === 'ocean-currents' ? 'fill-sky-900' : ''}`} />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-transparent to-transparent flex items-end p-6 text-white justify-between">
                    <div>
                      <h2 className="font-serif font-bold text-2xl drop-shadow">
                        Dòng chảy đại dương
                      </h2>
                      <p className="text-xs text-sky-200 drop-shadow">
                        Sức mạnh vô hình
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-sky-100">
                      <span>5 hoạt động</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-300" />
                        Có tương tác
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: 2 cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div
                  onClick={() => setSelectedLesson({
                    id: 'coral-reef',
                    title: 'Rạn san hô rực rỡ',
                    subtitle: 'Ngôi nhà của muôn loài',
                    image: '/assets/card_clownfish.jpg',
                    tag: 'Bài học',
                    activitiesCount: 5,
                    objective: 'Khám phá sự cộng sinh giữa cá hề và hải quỳ trên rạn san hô nhiệt đới.',
                  })}
                  className={`group bg-white rounded-3xl overflow-hidden shadow-sm border hover:shadow-md transition-all cursor-pointer ${
                    selectedLesson.id === 'coral-reef' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src="/assets/card_clownfish.jpg" alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-neutral-600 shadow">
                      <Bookmark className={`w-3.5 h-3.5 ${selectedLesson.id === 'coral-reef' ? 'fill-sky-900 text-sky-900' : ''}`} />
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-sky-950">Rạn san hô rực rỡ</h3>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <span>5 hoạt động</span>
                      <span>·</span>
                      <span>Có tương tác</span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedLesson({
                    id: 'sea-turtle',
                    title: 'Rùa biển phiêu lưu',
                    subtitle: 'Hành trình dài theo hải lưu',
                    image: '/assets/card_turtle.jpg',
                    tag: 'Bài học',
                    activitiesCount: 4,
                    objective: 'Theo chân rùa biển vượt đại dương theo các dòng hải lưu ấm áp.',
                  })}
                  className={`group bg-white rounded-3xl overflow-hidden shadow-sm border hover:shadow-md transition-all cursor-pointer ${
                    selectedLesson.id === 'sea-turtle' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src="/assets/card_turtle.jpg" alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-neutral-600 shadow">
                      <Bookmark className={`w-3.5 h-3.5 ${selectedLesson.id === 'sea-turtle' ? 'fill-sky-900 text-sky-900' : ''}`} />
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-sky-950">Rùa biển phiêu lưu</h3>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <span>4 hoạt động</span>
                      <span>·</span>
                      <span>Có tương tác</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: 3 cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setSelectedLesson({
                    id: 'kelp-forest',
                    title: 'Rừng tảo biển',
                    subtitle: 'Hệ sinh thái xanh dưới đáy biển',
                    image: '/assets/card_kelp.jpg',
                    tag: 'Mô phỏng',
                    activitiesCount: 4,
                    objective: 'Khám phá rừng tảo biển khổng lồ và cách các loài sinh vật tìm nơi ẩn náu.',
                  })}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border p-3 space-y-2 cursor-pointer hover:shadow-md transition-all ${
                    selectedLesson.id === 'kelp-forest' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'
                  }`}
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden">
                    <img src="/assets/card_kelp.jpg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="font-bold text-xs text-sky-950">Rừng tảo biển</h4>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold">Mô phỏng</span>
                    <span>Có tương tác</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedLesson({
                    id: 'jellyfish',
                    title: 'Sứa biển lung linh',
                    subtitle: 'Vũ điệu phát quang dưới đáy sâu',
                    image: '/assets/card_jellyfish.jpg',
                    tag: 'Video',
                    activitiesCount: 4,
                    objective: 'Tìm hiểu về chuyển động mềm mại và ánh sáng phát quang của sứa biển.',
                  })}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border p-3 space-y-2 cursor-pointer hover:shadow-md transition-all ${
                    selectedLesson.id === 'jellyfish' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'
                  }`}
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden">
                    <img src="/assets/card_jellyfish.jpg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="font-bold text-xs text-sky-950">Sứa biển lung linh</h4>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold">Video</span>
                    <span>Có tương tác</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedLesson({
                    id: 'tide-pool',
                    title: 'Bờ đá thủy triều',
                    subtitle: 'Khám phá thế giới ven biển kỳ thú',
                    image: '/assets/card_tidal.jpg',
                    tag: 'Bài học',
                    activitiesCount: 5,
                    objective: 'Quan sát các hồ triều ven bờ đá và các loài sao biển nhiều màu sắc.',
                  })}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border p-3 space-y-2 cursor-pointer hover:shadow-md transition-all ${
                    selectedLesson.id === 'tide-pool' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'
                  }`}
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden">
                    <img src="/assets/card_tidal.jpg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="font-bold text-xs text-sky-950">Bờ đá thủy triều</h4>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold">Bài học</span>
                    <span>Có tương tác</span>
                  </div>
                </div>
              </div>

              {/* Row 4: 2 new rich cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div
                  onClick={() => setSelectedLesson({
                    id: 'deep-sea-submersible',
                    title: 'Thám hiểm biển sâu',
                    subtitle: 'Bí ẩn vực thẳm và tàu ngầm khoa học',
                    image: '/assets/card_submersible.jpg',
                    tag: 'Mô phỏng 3D',
                    activitiesCount: 5,
                    objective: 'Lên tàu ngầm thám hiểm rọi đèn pha vào các loài sinh vật phát quang đáy đại dương.',
                  })}
                  className={`group bg-white rounded-3xl overflow-hidden shadow-sm border hover:shadow-md transition-all cursor-pointer ${
                    selectedLesson.id === 'deep-sea-submersible' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src="/assets/card_submersible.jpg" alt="Thám hiểm biển sâu" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <button className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-neutral-600 shadow">
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-indigo-900/90 text-white text-[10px] font-bold">
                      Khám phá mới
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-sky-950">Thám hiểm biển sâu</h3>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <span>5 hoạt động</span>
                      <span>·</span>
                      <span>Tàu ngầm & sinh vật phát quang</span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedLesson({
                    id: 'seagrass-meadow',
                    title: 'Đồng cỏ biển diệu kỳ',
                    subtitle: 'Thiên đường của bò biển Dugong',
                    image: '/assets/card_seagrass.jpg',
                    tag: 'Bài học',
                    activitiesCount: 4,
                    objective: 'Khám phá cánh đồng cỏ biển xanh ngát và người bạn bò biển Dugong hiền hòa.',
                  })}
                  className={`group bg-white rounded-3xl overflow-hidden shadow-sm border hover:shadow-md transition-all cursor-pointer ${
                    selectedLesson.id === 'seagrass-meadow' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src="/assets/card_seagrass.jpg" alt="Đồng cỏ biển diệu kỳ" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <button className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-neutral-600 shadow">
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-teal-900/90 text-white text-[10px] font-bold">
                      Sinh thái biển
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-sky-950">Đồng cỏ biển diệu kỳ</h3>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <span>4 hoạt động</span>
                      <span>·</span>
                      <span>Bò biển & thảo nguyên đại dương</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Detail Preview Pane (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-sm">
                <img src={selectedLesson.image} alt={selectedLesson.title} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-sky-900 text-white text-[10px] font-bold">
                  {selectedLesson.tag}
                </span>
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white text-sky-950 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer" onClick={handleHearGuide}>
                    <Play className="w-5 h-5 fill-sky-950 ml-0.5" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-sky-950">
                  {selectedLesson.title}
                </h3>
                <p className="text-xs text-sky-700 font-medium">{selectedLesson.subtitle}</p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 text-[11px] font-semibold">
                    Lớp Sao Biển
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 text-[11px] font-semibold">
                    {selectedLesson.activitiesCount} hoạt động
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-bold text-neutral-800 block">Mục tiêu:</span>
                <p className="text-neutral-600 leading-relaxed">
                  {selectedLesson.objective}
                </p>
              </div>

              {/* Activities check */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-sky-100">
                <span className="font-bold text-neutral-800 block mb-1">Các hoạt động:</span>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>1. Xem</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>2. Khám phá</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>3. Dự đoán</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between font-bold text-sky-950 bg-sky-50 p-1.5 rounded-lg">
                  <span>4. Thử nghiệm</span>
                  <span className="text-[10px] text-sky-700 uppercase">Trọng tâm</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>5. Chia sẻ</span>
                </div>
              </div>

              {/* 3 Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleHearGuide}
                  className="w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-sky-700" />
                  <span>Nghe thử hướng dẫn</span>
                </button>

                <button
                  onClick={() => navigate('/teacher/builder')}
                  className="w-full py-3 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <span>Dùng để soạn bài</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/presentation')}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Xem trước Trình chiếu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER CONCEPT B: SCIENTIFIC ATLAS */}
      {activeConcept === 'b' && (
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-serif font-bold text-sky-950">
              Thư viện
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Tìm kiếm và lọc tài nguyên theo chủ đề, loại hoặc tính năng tương tác.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Secondary Filter Sidebar (3 cols) */}
            <div className="lg:col-span-3 space-y-5">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-4">
                <span className="font-bold text-xs text-neutral-500 uppercase tracking-wider block">
                  Chủ đề
                </span>
                <div className="space-y-1">
                  {[
                    'Tất cả',
                    'Hệ sinh thái',
                    'Sinh vật biển',
                    'Chuyển động biển',
                    'Bờ biển',
                    'Thời tiết & khí hậu',
                  ].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedTopic === topic
                          ? 'bg-sky-900 text-white shadow'
                          : 'text-neutral-700 hover:bg-sky-50'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-sky-100 space-y-1">
                  <span className="font-bold text-xs text-neutral-500 uppercase tracking-wider block mb-2">
                    Loại tài nguyên
                  </span>
                  {['Tất cả', 'Bài học', 'Mô phỏng', 'Video', 'Âm thanh', 'Hình ảnh'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedType === type
                          ? 'bg-sky-50 text-sky-900 border border-sky-200'
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center List View (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Search bar & sorts */}
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-sky-100 flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm chủ đề, bài học, tài nguyên"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-sky-50/50 rounded-xl focus:outline-none"
                  />
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-sky-900 text-white text-xs font-semibold flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Đã lưu</span>
                </button>
              </div>

              {/* Horizontal List Cards */}
              <div className="space-y-3">
                {[
                  { id: 'ocean-currents', title: 'Dòng chảy đại dương', sub: 'Sức mạnh vô hình', tag: 'Bài học', file: '/assets/hero_buoy_waterline.jpg', obj: 'Quan sát chuyển động trên mặt nước và khám phá sức mạnh vô hình của dòng chảy.' },
                  { id: 'coral-reef', title: 'Rạn san hô rực rỡ', sub: 'Ngôi nhà của muôn loài', tag: 'Bài học', file: '/assets/card_clownfish.jpg', obj: 'Khám phá sự cộng sinh giữa cá hề và hải quỳ trên rạn san hô nhiệt đới.' },
                  { id: 'sea-turtle', title: 'Rùa biển phiêu lưu', sub: 'Hành trình dài', tag: 'Bài học', file: '/assets/card_turtle.jpg', obj: 'Theo chân rùa biển vượt đại dương theo các dòng hải lưu ấm áp.' },
                  { id: 'deep-sea-submersible', title: 'Thám hiểm biển sâu', sub: 'Bí ẩn vực thẳm & tàu ngầm', tag: 'Mô phỏng 3D', file: '/assets/card_submersible.jpg', obj: 'Lên tàu ngầm thám hiểm rọi đèn pha vào các loài sinh vật phát quang đáy đại dương.' },
                  { id: 'seagrass-meadow', title: 'Đồng cỏ biển diệu kỳ', sub: 'Thiên đường của bò biển Dugong', tag: 'Bài học', file: '/assets/card_seagrass.jpg', obj: 'Khám phá cánh đồng cỏ biển xanh ngát và người bạn bò biển Dugong hiền hòa.' },
                  { id: 'kelp-forest', title: 'Rừng tảo biển', sub: 'Khu rừng dưới nước', tag: 'Mô phỏng', file: '/assets/card_kelp.jpg', obj: 'Khám phá rừng tảo biển khổng lồ vươn lên đón ánh nắng mặt trời.' },
                  { id: 'jellyfish', title: 'Sứa biển lung linh', sub: 'Vũ điệu trong nước', tag: 'Video', file: '/assets/card_jellyfish.jpg', obj: 'Tìm hiểu về chuyển động mềm mại và ánh sáng phát quang của sứa biển.' },
                  { id: 'tide-pool', title: 'Bờ đá thủy triều', sub: 'Sinh vật vùng triều', tag: 'Bài học', file: '/assets/card_tidal.jpg', obj: 'Quan sát các hồ triều ven bờ đá và các loài sao biển nhiều màu sắc.' },
                ].map((item) => (
                  <div
                    key={item.title}
                    onClick={() => setSelectedLesson({
                      id: item.id,
                      title: item.title,
                      subtitle: item.sub,
                      image: item.file,
                      tag: item.tag,
                      activitiesCount: 5,
                      objective: item.obj,
                    })}
                    className={`p-3 rounded-2xl bg-white border shadow-sm flex items-center justify-between hover:shadow-md transition-all cursor-pointer ${
                      selectedLesson.id === item.id ? 'border-sky-400 ring-2 ring-sky-100' : 'border-sky-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img src={item.file} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-sky-950">{item.title}</h4>
                        <p className="text-[11px] text-neutral-500">{item.sub}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-sky-50 text-[10px] text-sky-800 font-semibold">
                            {item.tag}
                          </span>
                          <span className="text-[10px] text-neutral-400">Có tương tác</span>
                        </div>
                      </div>
                    </div>
                    <Bookmark className={`w-4 h-4 ${selectedLesson.id === item.id ? 'fill-sky-800 text-sky-800' : 'text-neutral-400'}`} />
                  </div>
                ))}
              </div>

              {/* Tài nguyên liên quan bottom */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-sky-950">Tài nguyên liên quan</h4>
                  <span className="text-[11px] text-sky-700 font-semibold cursor-pointer">Xem tất cả ➔</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl overflow-hidden bg-white border border-sky-100 p-2 text-center space-y-1">
                    <img src="/assets/card_whale.jpg" alt="" className="w-full h-12 object-cover rounded-lg" />
                    <span className="text-[10px] font-bold text-neutral-800 block truncate">Dòng biển ven bờ</span>
                  </div>
                  <div className="rounded-xl overflow-hidden bg-white border border-sky-100 p-2 text-center space-y-1">
                    <img src="/assets/card_turtle.jpg" alt="" className="w-full h-12 object-cover rounded-lg" />
                    <span className="text-[10px] font-bold text-neutral-800 block truncate">Cá heo và dòng chảy</span>
                  </div>
                  <div className="rounded-xl overflow-hidden bg-white border border-sky-100 p-2 text-center space-y-1">
                    <img src="/assets/card_kelp.jpg" alt="" className="w-full h-12 object-cover rounded-lg" />
                    <span className="text-[10px] font-bold text-neutral-800 block truncate">Sóng biển</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Preview Drawer (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-sm">
                <img src={selectedLesson.image} alt={selectedLesson.title} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-sky-900 text-white text-[10px] font-bold">
                  {selectedLesson.tag}
                </span>
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white text-sky-950 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer" onClick={handleHearGuide}>
                    <Play className="w-5 h-5 fill-sky-950 ml-0.5" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-sky-950">
                  {selectedLesson.title}
                </h3>
                <p className="text-xs text-sky-700 font-medium">{selectedLesson.subtitle}</p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 text-[11px] font-semibold">
                    Lớp Sao Biển
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 text-[11px] font-semibold">
                    {selectedLesson.activitiesCount} hoạt động
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-bold text-neutral-800 block">Mục tiêu:</span>
                <p className="text-neutral-600 leading-relaxed">
                  {selectedLesson.objective}
                </p>
              </div>

              {/* 5 activities check */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-sky-100">
                <span className="font-bold text-neutral-800 block mb-1">Các hoạt động:</span>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>1. Xem</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>2. Khám phá</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>3. Dự đoán</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between font-bold text-sky-950 bg-sky-50 p-1.5 rounded-lg">
                  <span>4. Thử nghiệm</span>
                  <span className="text-[10px] text-sky-700 uppercase">Trọng tâm</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>5. Chia sẻ</span>
                </div>
              </div>

              {/* 3 Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleHearGuide}
                  className="w-full py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-sky-700" />
                  <span>Nghe thử hướng dẫn</span>
                </button>

                <button
                  onClick={() => navigate('/teacher/builder')}
                  className="w-full py-3 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <span>Dùng để soạn bài</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/presentation')}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Xem trước</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
