import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import { OCEAN_RESOURCES } from '../../content/resourcesData';
import {
  Search,
  Bookmark,
  Image,
  Volume2,
  Video,
  Palette,
  FileText,
  Layout,
  Sprout,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  X,
  Play,
  Pause,
  Printer,
    CheckCircle2,
  Headphones,
  Scissors,
  ArrowRight,
    Grid,
  BookOpen,
} from 'lucide-react';

interface ResourceCardItem {
  id: string;
  title: string;
  type: string;
  typeKey: string;
  topicKey: string;
  icon: any;
  image?: string;
  isAudio?: boolean;
  badge?: string;
  route: string;
}
export function ResourcesLibraryPage() {
  const { query, navigate } = useRouter();

  // Determine initial view: catalog grid vs curated overview
  // Respects query param ?view=catalog vs ?view=curated or state catalog-grid-view vs curated-collections-overview
  const [viewMode, setViewMode] = useState<'curated' | 'catalog'>(() => {
    if (query.view === 'catalog' || query.state === 'catalog-grid-view') {
      return 'catalog';
    }
    if (query.view === 'curated' || query.state === 'curated-collections-overview') {
      return 'curated';
    }
    if (typeof window !== 'undefined' && window.innerHeight > 1100 && window.innerWidth <= 1200) {
      return 'curated'; // Portrait default for 1024x1536
    }
    return 'catalog'; // Desktop 1536x1024 default
  });

  // Sync state if query changes
  useEffect(() => {
    if (query.view === 'catalog' || query.state === 'catalog-grid-view') {
      setViewMode('catalog');
    } else if (query.view === 'curated' || query.state === 'curated-collections-overview') {
      setViewMode('curated');
    }
  }, [query.view, query.state]);

  // Filters for Catalog view
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [activeTopic, setActiveTopic] = useState<string>('all');
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>({
    turtle: true,
  });
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [expandedCatalog, setExpandedCatalog] = useState(false);

  // Audio player state for Curated Overview
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const toggleSave = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      oceanAudio.playChime(next[id] ? 659.25 : 440, 0.15);
      return next;
    });
  };

  const handleToggleAudio = () => {
    if (!isAudioPlaying) {
      setIsAudioPlaying(true);
      oceanAudio.playChime(523.25, 0.4);
      oceanAudio.speak('Bạn đang lắng nghe âm thanh kỳ thú của các rạn san hô và sinh vật biển dưới lòng đại dương sâu thẳm.');
    } else {
      setIsAudioPlaying(false);
      oceanAudio.stop();
    }
  };

  // Base 6 resource cards from reference mockup (bluesteam-v2-resources-catalog.png)
  const canonicalCatalogCards: ResourceCardItem[] = [
    {
      id: 'turtle',
      title: 'Rùa biển xanh',
      type: 'Thẻ hình',
      typeKey: 'flashcard',
      topicKey: 'environment',
      icon: Image,
      image: '/assets/generated/creatures/green_turtle_hero.jpg',
      route: '/resources/flashcard',
    },
    {
      id: 'seagrass',
      title: 'Cỏ biển',
      type: 'Hình ảnh',
      typeKey: 'image',
      topicKey: 'environment',
      icon: Image,
      image: '/assets/generated/stations/botanical_seagrass_specimen.jpg',
      route: '/resources/flashcard',
    },
    {
      id: 'coral-audio',
      title: 'Âm thanh đại dương: Tiếng rạn san hô',
      type: 'Âm thanh',
      typeKey: 'audio',
      topicKey: 'protection',
      icon: Volume2,
      isAudio: true,
      route: '/resources/media',
    },
    {
      id: 'octopus-coloring',
      title: 'Bạch tuộc',
      type: 'Tranh tô màu',
      typeKey: 'coloring',
      topicKey: 'environment',
      icon: Palette,
      image: '/assets/generated/craft/octopus_coloring_lineart.jpg',
      route: '/resources/print',
    },
    {
      id: 'mangrove-poster',
      title: 'Hệ sinh thái ven biển',
      type: 'Poster',
      typeKey: 'poster',
      topicKey: 'protection',
      icon: Layout,
      image: '/assets/generated/stations/mangrove_ecosystem_poster.jpg',
      route: '/resources/print',
    },
    {
      id: 'whale-shark-video',
      title: 'Cá mập voi – Người khổng lồ hiền lành',
      type: 'Video',
      typeKey: 'video',
      topicKey: 'protection',
      icon: Video,
      image: '/assets/generated/stations/whale_shark_video_thumb.jpg',
      badge: 'Đang chuẩn bị',
      route: '/resources/media',
    },
  ];

  // Additional cards derived from OCEAN_RESOURCES for "Xem thêm học liệu"
  const extendedCards: ResourceCardItem[] = useMemo(() => {
    return OCEAN_RESOURCES.map((item) => ({
      id: item.id,
      title: item.titleVi,
      type:
        item.type === 'flashcard'
          ? 'Thẻ hình'
          : item.type === 'video'
          ? 'Video'
          : item.type === 'coloring'
          ? 'Tranh tô màu'
          : 'Phiếu học tập',
      typeKey: item.type,
      topicKey: item.topic === 'abyss' || item.topic === 'reef' ? 'environment' : 'protection',
      icon:
        item.type === 'flashcard'
          ? Image
          : item.type === 'video'
          ? Video
          : item.type === 'coloring'
          ? Palette
          : FileText,
      image:
        item.thumbnailImage ||
        (item.type === 'coloring'
          ? '/assets/generated/craft/coral_coloring_lineart.jpg'
          : '/assets/generated/stations/station_coral_reef.jpg'),
      route:
        item.type === 'flashcard'
          ? '/resources/flashcard'
          : item.type === 'video'
          ? '/resources/media'
          : '/resources/print',
      isAudio: false,
      badge: undefined,
    }));
  }, []);

  const allCards = useMemo(() => {
    if (!expandedCatalog) return canonicalCatalogCards;
    // Combine and deduplicate
    const map = new Map<string, ResourceCardItem>();
    canonicalCatalogCards.forEach((c) => map.set(c.id, c));
    extendedCards.forEach((c) => {
      if (!map.has(c.id)) map.set(c.id, c);
    });
    return Array.from(map.values());
  }, [expandedCatalog, extendedCards]);

  // Filtered list based on Search, Type, Topic, and Saved status
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      if (showOnlySaved && !savedItems[card.id]) return false;
      if (activeType !== 'all' && card.typeKey !== activeType) return false;
      if (activeTopic !== 'all' && card.topicKey !== activeTopic) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return card.title.toLowerCase().includes(q) || card.type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allCards, activeType, activeTopic, searchQuery, showOnlySaved, savedItems]);

  const savedCount = Object.values(savedItems).filter(Boolean).length;

  return (
    <LearnerShell activeNav="resources">
      {/* Top View Mode Switcher Pill (Supports both Screen 3 Catalog & Screen 10 Curated Overview) */}
      <div className="bg-[#FAF8F5] border-b border-[#17657A]/10 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#17657A]/80">
              Chế độ hiển thị:
            </span>
            <div className="inline-flex rounded-2xl bg-white/90 p-1 border border-[#17657A]/15 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('catalog')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'catalog'
                    ? 'bg-[#17657A] text-white shadow-xs'
                    : 'text-[#102A38]/70 hover:text-[#102A38] hover:bg-black/5'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Kho học liệu lưới (Màn 3)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('curated')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'curated'
                    ? 'bg-[#17657A] text-white shadow-xs'
                    : 'text-[#102A38]/70 hover:text-[#102A38] hover:bg-black/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Học liệu tuyển chọn (Màn 10 - Dọc)</span>
              </button>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500 hidden sm:block">
            {viewMode === 'catalog' ? 'Khổ ngang 1536x1024' : 'Khổ dọc 1024x1536'} • Chuẩn BlueSTEAM v2
          </div>
        </div>
      </div>

      {viewMode === 'catalog' ? (
        /* =========================================================================
           SCREEN 3: KHO HỌC LIỆU LƯỚI (resources-catalog-desktop-vi, 1536x1024)
           ========================================================================= */
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8 bg-[#FAF8F5]">
          {/* Header Bar: Title + Search Bar + Saved Items */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#102A38] tracking-[-0.02em]">
              Kho học liệu
            </h1>

            {/* Large Rounded Search Box */}
            <div className="relative flex-1 max-w-2xl w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-[#17657A]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm học liệu"
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-[#17657A]/20 text-sm font-semibold text-[#102A38] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17657A] shadow-[0_2px_8px_rgba(18,56,75,0.04)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#102A38] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Saved Items Button */}
            <button
              type="button"
              onClick={() => setShowOnlySaved(!showOnlySaved)}
              className={`px-5 py-3 rounded-2xl border text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                showOnlySaved
                  ? 'bg-[#17657A] text-white border-[#17657A]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-[#102A38]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${showOnlySaved ? 'fill-white text-white' : 'text-[#17657A]'}`} />
              <span>Đã lưu</span>
              {savedCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  showOnlySaved ? 'bg-white text-[#17657A]' : 'bg-[#17657A]/10 text-[#17657A]'
                }`}>
                  {savedCount}
                </span>
              )}
            </button>
          </div>

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar Filters (col-span-3) */}
            <aside className="lg:col-span-3 space-y-6 bg-white/80 backdrop-blur-sm p-5 rounded-[28px] border border-[#17657A]/12 shadow-[0_4px_20px_rgba(18,56,75,0.04)]">
              {/* Group 1: Loại học liệu */}
              <div className="space-y-2">
                <h3 className="font-serif font-black text-base text-[#102A38] mb-3">
                  Loại học liệu
                </h3>
                <div className="space-y-1 font-bold text-xs text-slate-600">
                  {[
                    { key: 'all', label: 'Tất cả học liệu', icon: BookOpen },
                    { key: 'flashcard', label: 'Thẻ hình', icon: Image },
                    { key: 'image', label: 'Hình ảnh', icon: Image },
                    { key: 'audio', label: 'Âm thanh', icon: Volume2 },
                    { key: 'video', label: 'Video', icon: Video },
                    { key: 'coloring', label: 'Tranh tô màu', icon: Palette },
                    { key: 'worksheet', label: 'Phiếu học tập', icon: FileText },
                    { key: 'poster', label: 'Poster', icon: Layout },
                  ].map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeType === filter.key;
                    return (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => setActiveType(filter.key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#D4EAF2] text-[#102A38] font-black shadow-xs'
                            : 'hover:bg-black/5 text-slate-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#17657A]' : 'text-slate-400'}`} />
                        <span>{filter.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: Chủ đề */}
              <div className="space-y-2 pt-4 border-t border-slate-200/80">
                <h3 className="font-serif font-black text-base text-[#102A38] mb-3">
                  Chủ đề
                </h3>
                <div className="space-y-1 font-bold text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => setActiveTopic('all')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full transition-all cursor-pointer ${
                      activeTopic === 'all'
                        ? 'bg-[#D4EAF2] text-[#102A38] font-black'
                        : 'hover:bg-black/5 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-[#17657A]" />
                      <span>Tất cả chủ đề</span>
                    </div>
                    {activeTopic === 'all' && <X className="w-3.5 h-3.5 opacity-60" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTopic('environment')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      activeTopic === 'environment'
                        ? 'bg-[#D4EAF2] text-[#102A38] font-black'
                        : 'hover:bg-black/5 text-slate-700'
                    }`}
                  >
                    <Sprout className="w-4 h-4 text-[#17657A]" />
                    <span>Môi trường</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTopic('protection')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      activeTopic === 'protection'
                        ? 'bg-[#D4EAF2] text-[#102A38] font-black'
                        : 'hover:bg-black/5 text-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#17657A]" />
                    <span>Bảo vệ biển</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Right Main Content Area (col-span-9) */}
            <main className="lg:col-span-9 space-y-6">
              {/* Featured Banner: Khám phá thảm cỏ biển */}
              <div
                onClick={() => navigate('/resources/media')}
                className="relative w-full rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(18,56,75,0.08)] border border-[#17657A]/15 cursor-pointer group bg-gradient-to-r from-[#E6F4F7] to-[#CEE8F0] transition-all hover:shadow-[0_12px_40px_rgba(18,56,75,0.12)]"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                  {/* Left: Grass Photo */}
                  <div className="md:col-span-5 h-48 md:h-56 overflow-hidden">
                    <img
                      src="/assets/generated/stations/station_seagrass_fish.jpg"
                      alt="Thảm cỏ biển"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Center: Featured Content Text */}
                  <div className="md:col-span-6 p-6 space-y-2">
                    <span className="text-[11px] font-black tracking-widest text-[#17657A] uppercase">
                      Học liệu nổi bật
                    </span>
                    <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#102A38] tracking-[-0.02em]">
                      Khám phá thảm cỏ biển
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      Những “khu rừng xanh dưới biển” – nơi nuôi dưỡng sự sống và giữ cân bằng cho đại dương.
                    </p>
                  </div>

                  {/* Right: Forward Arrow Button */}
                  <div className="md:col-span-1 hidden md:flex items-center justify-center pr-6">
                    <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-[#102A38] group-hover:bg-[#17657A] group-hover:text-white transition-all">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Active Pill */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D4EAF2] text-[#102A38] font-black text-xs">
                  <span>
                    {activeTopic === 'environment'
                      ? 'Môi trường'
                      : activeTopic === 'protection'
                      ? 'Bảo vệ biển'
                      : 'Tất cả chủ đề'}
                  </span>
                  {(activeTopic !== 'all' || activeType !== 'all') && (
                    <X
                      onClick={() => {
                        setActiveTopic('all');
                        setActiveType('all');
                      }}
                      className="w-3.5 h-3.5 cursor-pointer opacity-70 hover:opacity-100"
                    />
                  )}
                </span>
                {showOnlySaved && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17657A] text-white font-black text-xs">
                    <span>Chỉ mục đã lưu ({savedCount})</span>
                    <X
                      onClick={() => setShowOnlySaved(false)}
                      className="w-3.5 h-3.5 cursor-pointer opacity-70 hover:opacity-100"
                    />
                  </span>
                )}
              </div>

              {/* Resource Grid (3 Columns) */}
              {filteredCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCards.map((card) => {
                    const Icon = card.icon;
                    const isSaved = !!savedItems[card.id];

                    return (
                      <div
                        key={card.id}
                        onClick={() => navigate(card.route)}
                        className="rounded-[28px] bg-white p-3.5 shadow-[0_4px_16px_rgba(18,56,75,0.06)] border border-[#17657A]/12 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(18,56,75,0.12)] transition-all cursor-pointer group"
                      >
                        {/* Media Container */}
                        <div className="relative h-44 rounded-2xl overflow-hidden mb-3 bg-slate-100 flex items-center justify-center">
                          {card.isAudio ? (
                            /* Audio Waveform UI */
                            <div className="w-full h-full bg-gradient-to-r from-[#D7EFF7] to-[#C0E7F5] flex items-center justify-center gap-4 px-6">
                              <div className="w-12 h-12 rounded-full bg-[#17657A] text-white flex items-center justify-center shadow-md">
                                <Volume2 className="w-6 h-6" />
                              </div>
                              {/* Simulated Audio Wave Bars */}
                              <div className="flex items-center gap-1 flex-1 h-12 justify-center">
                                {[4, 8, 14, 22, 36, 44, 28, 18, 38, 48, 32, 16, 26, 40, 20, 10, 6].map(
                                  (h, i) => (
                                    <div
                                      key={i}
                                      className="w-1 bg-[#17657A] rounded-full"
                                      style={{ height: `${h}px` }}
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          ) : (
                            <img
                              src={card.image}
                              alt={card.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}

                          {/* Optional Status Badge */}
                          {card.badge && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="px-4 py-1.5 rounded-full bg-white/95 text-xs font-black text-[#102A38] shadow-md">
                                {card.badge}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Content & Type Badge */}
                        <div className="space-y-2 px-1">
                          <h4 className="font-serif font-black text-base text-[#102A38] group-hover:text-[#17657A] transition-colors line-clamp-1">
                            {card.title}
                          </h4>

                          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1">
                            <div className="flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5 text-[#17657A]" />
                              <span>{card.type}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => toggleSave(card.id, e)}
                              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#17657A] transition-colors cursor-pointer"
                              aria-label={isSaved ? 'Bỏ lưu' : 'Lưu học liệu'}
                            >
                              <Bookmark
                                className={`w-4 h-4 ${isSaved ? 'fill-[#17657A] text-[#17657A]' : ''}`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty State (Required per corrections) */
                <div className="text-center py-16 px-6 bg-white rounded-[28px] border border-[#17657A]/15 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#EAF3F7] mx-auto flex items-center justify-center text-3xl">
                    🐢
                  </div>
                  <h3 className="font-serif font-black text-xl text-[#102A38]">
                    Không tìm thấy học liệu phù hợp
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                    Hãy thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc để khám phá toàn bộ kho tài nguyên.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveType('all');
                      setActiveTopic('all');
                      setShowOnlySaved(false);
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#17657A] text-white text-xs font-black shadow-md cursor-pointer hover:bg-[#125061]"
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              )}

              {/* Bottom Button: Xem thêm học liệu */}
              <div className="flex justify-center pt-6">
                <button
                  type="button"
                  onClick={() => setExpandedCatalog(!expandedCatalog)}
                  className="px-8 py-3 rounded-full bg-[#102A38] hover:bg-[#17657A] text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>{expandedCatalog ? 'Thu gọn danh sách' : 'Xem thêm học liệu'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedCatalog ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </main>
          </div>
        </div>
      ) : (
        /* =========================================================================
           SCREEN 10: HỌC LIỆU TUYỂN CHỌN DỌC (resources-library-overview-desktop-vi, 1024x1536)
           ========================================================================= */
        <div className="min-h-screen bg-[#FAF8F5] pb-24 text-[#102A38]">
          {/* SECTION 1: HERO SHOWCASE (Học liệu cho những khám phá nhỏ) */}
          <section className="relative px-8 lg:px-12 pt-10 pb-16 bg-gradient-to-b from-[#E7F3F7] via-[#D5EDF3] to-[#FAF8F5] border-b border-[#17657A]/10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Heading & Introduction (col-span-5) */}
              <div className="lg:col-span-5 space-y-6">
                <h1 className="font-serif font-black text-4xl sm:text-5xl text-[#102A38] tracking-[-0.02em] leading-tight">
                  Học liệu cho những khám phá nhỏ
                </h1>
                <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                  Khám phá đại dương qua những học liệu trực quan, sinh động và gần gũi với cuộc sống. Mỗi tài nguyên là một cánh cửa mở ra thế giới tự nhiên kỳ thú, giúp bạn học hỏi, quan sát và sáng tạo theo cách riêng của mình.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setViewMode('catalog')}
                    className="px-7 py-3.5 rounded-full bg-[#17657A] hover:bg-[#125061] text-white font-black text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <span>Khám phá ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Middle Column: Big Featured Sea Turtle Card (col-span-4) */}
              <div className="lg:col-span-4 rounded-[32px] bg-white p-5 shadow-[0_8px_30px_rgba(18,56,75,0.08)] border border-[#17657A]/15 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#EAF3F7] text-[#17657A] text-xs font-black flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" />
                    <span>Thẻ học</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      oceanAudio.speak('Rùa biển. Rùa biển là loài bò sát sống ở đại dương, có mai cứng và thích nghi tốt với môi trường biển.')
                    }
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#17657A] hover:text-white text-[#17657A] flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Phát âm thanh rùa biển"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-48 rounded-2xl overflow-hidden flex items-center justify-center bg-sky-50">
                  <img
                    src="/assets/generated/creatures/green_turtle_hero.jpg"
                    alt="Rùa biển"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif font-black text-2xl text-[#102A38]">
                    Rùa biển
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Rùa biển là loài bò sát sống ở đại dương, có mai cứng và thích nghi tốt với môi trường biển.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/resources/flashcard')}
                  className="w-full py-2.5 rounded-full border border-[#17657A]/30 text-[#17657A] hover:bg-[#17657A] hover:text-white font-black text-xs transition-all cursor-pointer text-center"
                >
                  Xem chi tiết
                </button>
              </div>

              {/* Right Column: Stacked 2 Cards (col-span-3) */}
              <div className="lg:col-span-3 space-y-4">
                {/* Card 1: Rạn san hô */}
                <div
                  onClick={() => navigate('/resources/flashcard')}
                  className="rounded-[28px] bg-white p-4 shadow-[0_4px_20px_rgba(18,56,75,0.06)] border border-[#17657A]/12 space-y-2 cursor-pointer hover:shadow-md transition-all"
                >
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3F7] text-[#17657A] text-[10px] font-black inline-block">
                    Tài liệu đọc
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-serif font-black text-sm text-[#102A38] leading-tight">
                        Hệ sinh thái rạn san hô
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        Tìm hiểu về thế giới rực rỡ dưới làn nước trong xanh.
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src="/assets/generated/stations/station_coral_reef.jpg"
                        alt="Rạn san hô"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2: Âm thanh đại dương */}
                <div className="rounded-[28px] bg-white p-4 shadow-[0_4px_20px_rgba(18,56,75,0.06)] border border-[#17657A]/12 space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3F7] text-[#17657A] text-[10px] font-black inline-block">
                    Tệp âm thanh
                  </span>
                  <h4 className="font-serif font-black text-sm text-[#102A38]">
                    Âm thanh đại dương
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Lắng nghe những âm thanh quen thuộc từ lòng biển.
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleAudio}
                      className="w-9 h-9 rounded-full bg-[#17657A] text-white flex items-center justify-center shadow-xs hover:bg-[#125061] cursor-pointer shrink-0"
                    >
                      {isAudioPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 flex items-center gap-0.5 h-6">
                      {[3, 8, 12, 18, 10, 16, 22, 14, 8, 12, 6, 14, 18, 10, 6].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isAudioPlaying ? 'bg-[#17657A]' : 'bg-slate-300'
                          }`}
                          style={{
                            height: isAudioPlaying ? `${Math.max(4, (h * (i % 2 === 0 ? 1.2 : 0.8)))}px` : `${h}px`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {isAudioPlaying ? '00:15 / 02:30' : '00:00 / 02:30'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: KHÁM PHÁ THEO CHỦ ĐỀ */}
          <section className="px-8 lg:px-12 py-16 max-w-6xl mx-auto space-y-8">
            <div className="space-y-1">
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#102A38] tracking-[-0.02em]">
                Khám phá theo chủ đề
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Chọn một chủ đề để bắt đầu hành trình khám phá đại dương.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  id: 'species',
                  title: 'Sinh vật biển',
                  desc: 'Làm quen với các loài sinh vật kỳ thú dưới đại dương.',
                  image: '/assets/generated/stations/station_seagrass_fish.jpg',
                },
                {
                  id: 'coastal',
                  title: 'Vùng ven biển',
                  desc: 'Khám phá nơi đại dương gặp gỡ đất liền.',
                  image: '/assets/generated/backgrounds/ocean_split_beach.jpg',
                },
                {
                  id: 'ocean-env',
                  title: 'Môi trường biển',
                  desc: 'Tìm hiểu về nước biển, dòng chảy và các yếu tố tự nhiên.',
                  image: '/assets/bluesteam/bs-atlas-horizontal-bg-v01.jpg',
                },
                {
                  id: 'marine-plants',
                  title: 'Thực vật biển',
                  desc: 'Khám phá các loài thực vật sống trong và gần đại dương.',
                  image: '/assets/bluesteam/bs-habitat-mangrove-bg-v01.jpg',
                },
              ].map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setViewMode('catalog')}
                  className="rounded-[28px] bg-white overflow-hidden shadow-[0_4px_20px_rgba(18,56,75,0.06)] border border-[#17657A]/12 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="h-36 overflow-hidden">
                    <img
                      src={topic.image}
                      alt={topic.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-serif font-black text-lg text-[#102A38] group-hover:text-[#17657A] transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {topic.desc}
                      </p>
                    </div>
                    <div className="flex justify-end pt-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#17657A] group-hover:bg-[#17657A] group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: TẤT CẢ HỌC LIỆU */}
          <section className="px-8 lg:px-12 py-16 bg-[#F1F7F9] border-y border-[#17657A]/10">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#102A38] tracking-[-0.02em]">
                    Tất cả học liệu
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Tìm kiếm và khám phá kho học liệu phong phú theo nhu cầu của bạn.
                  </p>
                </div>

                {/* Search Bar on Right */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm học liệu..."
                    className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-[#17657A]/20 text-xs font-semibold text-[#102A38] focus:outline-none focus:ring-2 focus:ring-[#17657A]"
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[
                  'Tất cả',
                  'Thẻ học',
                  'Bài đọc',
                  'Âm thanh',
                  'Mô phỏng',
                  'Hoạt động thực hành',
                ].map((tag, idx) => (
                  <button
                    key={tag}
                    type="button"
                    className={`px-4 py-2 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${
                      idx === 0
                        ? 'bg-[#17657A] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* 4 Cards Showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    tag: 'Thẻ học',
                    title: 'Cá hề',
                    desc: 'Tìm hiểu đặc điểm và tập tính của cá hề.',
                    image: '/assets/generated/creatures/clownfish_isolated.png',
                    icon: FileText,
                    route: '/resources/flashcard',
                  },
                  {
                    tag: 'Bài đọc',
                    title: 'Rạn san hô',
                    desc: 'Khám phá vai trò của rạn san hô trong hệ sinh thái biển.',
                    image: '/assets/generated/stations/station_coral_reef.jpg',
                    icon: FileText,
                    route: '/resources/flashcard',
                  },
                  {
                    tag: 'Âm thanh',
                    title: 'Tiếng hát của cá voi',
                    desc: 'Lắng nghe âm thanh đặc trưng của cá voi trong đại dương.',
                    image: '/assets/bluesteam/bs-specimen-whale-v01.jpg',
                    icon: Headphones,
                    route: '/resources/media',
                  },
                  {
                    tag: 'Hoạt động',
                    title: 'Làm mô hình rùa biển',
                    desc: 'Tự tay tạo mô hình rùa biển bằng giấy.',
                    image: '/assets/generated/craft/turtle_coloring_lineart.jpg',
                    icon: Scissors,
                    route: '/resources/print',
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => navigate(item.route)}
                      className="rounded-[28px] bg-white p-4 shadow-[0_4px_20px_rgba(18,56,75,0.06)] border border-[#17657A]/12 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3F7] text-[#17657A] text-[10px] font-black">
                            {item.tag}
                          </span>
                        </div>
                        <div className="h-32 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <h4 className="font-serif font-black text-base text-[#102A38]">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {item.desc}
                        </p>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Icon className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Centered Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setViewMode('catalog')}
                  className="px-8 py-3 rounded-full bg-[#17657A] hover:bg-[#125061] text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>Mở kho học liệu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 4: MANG KHÁM PHÁ RA NGOÀI MÀN HÌNH (Printables) */}
          <section className="px-8 lg:px-12 py-16 max-w-6xl mx-auto">
            <div className="rounded-[36px] bg-gradient-to-r from-[#F7F3E9] to-[#EAE3D2] p-8 lg:p-12 border border-[#E5A93C]/20 shadow-[0_8px_32px_rgba(18,56,75,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Checklist & CTA (col-span-5) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-white text-[#17657A] flex items-center justify-center shadow-md">
                  <Printer className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-serif font-black text-3xl text-[#102A38] tracking-[-0.02em]">
                    Mang khám phá ra ngoài màn hình
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Tải về và in các tài liệu thực hành để học tập và sáng tạo ở bất cứ đâu.
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs font-bold text-[#102A38]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#17657A]" />
                    <span>Tranh tô màu sinh vật biển</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#17657A]" />
                    <span>Mẫu cắt dán thủ công</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#17657A]" />
                    <span>Phiếu quan sát ngoài thiên nhiên</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#17657A]" />
                    <span>Hoạt động thực hành tại nhà</span>
                  </li>
                </ul>

                <div>
                  <button
                    type="button"
                    onClick={() => navigate('/resources/print')}
                    className="px-7 py-3.5 rounded-full bg-[#17657A] hover:bg-[#125061] text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <span>Xem tài liệu in</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Fan-out 3D A4 Sheets Display (col-span-7) */}
              <div className="lg:col-span-7 relative flex items-center justify-center py-6">
                <div className="relative w-full max-w-lg h-72 flex items-center justify-center">
                  {/* Sheet 1: Rùa biển (Left tilted) */}
                  <div
                    onClick={() => navigate('/resources/print')}
                    className="absolute -left-2 top-4 w-44 sm:w-48 aspect-[1/1.414] bg-white rounded-xl shadow-xl border border-slate-200 p-3 transform -rotate-8 hover:-translate-y-2 hover:rotate-0 transition-all cursor-pointer z-10"
                  >
                    <span className="font-serif font-black text-[10px] text-center block text-[#102A38] mb-1">
                      Rùa biển
                    </span>
                    <div className="w-full h-44 overflow-hidden flex items-center justify-center">
                      <img
                        src="/assets/generated/craft/turtle_coloring_lineart.jpg"
                        alt="Rùa biển tô màu"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Sheet 2: Sinh vật vùng triều (Center) */}
                  <div
                    onClick={() => navigate('/resources/print')}
                    className="absolute w-44 sm:w-52 aspect-[1/1.414] bg-white rounded-xl shadow-2xl border border-slate-200 p-3.5 transform hover:-translate-y-2 transition-all cursor-pointer z-20"
                  >
                    <span className="font-serif font-black text-[11px] text-center block text-[#102A38] mb-1">
                      Sinh vật vùng triều
                    </span>
                    <div className="w-full h-48 overflow-hidden flex items-center justify-center">
                      <img
                        src="/assets/generated/craft/octopus_coloring_lineart.jpg"
                        alt="Bạch tuộc & sinh vật"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Sheet 3: Cắt và dán (Right tilted) */}
                  <div
                    onClick={() => navigate('/resources/print')}
                    className="absolute -right-2 top-4 w-44 sm:w-48 aspect-[1/1.414] bg-white rounded-xl shadow-xl border border-slate-200 p-3 transform rotate-8 hover:-translate-y-2 hover:rotate-0 transition-all cursor-pointer z-10"
                  >
                    <span className="font-serif font-black text-[10px] text-center block text-[#102A38] mb-1">
                      Cắt và dán cá đại dương
                    </span>
                    <div className="w-full h-44 overflow-hidden flex items-center justify-center">
                      <img
                        src="/assets/generated/craft/coral_coloring_lineart.jpg"
                        alt="Cắt dán cá"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </LearnerShell>
  );
}
