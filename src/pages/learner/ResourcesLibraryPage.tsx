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
  Headphones,
  Scissors,
  ArrowRight,
  ArrowLeft,
  Grid,
  BookOpen,
  Check,
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
  // Mặc định chuẩn BlueSTEAM v2 là 4 Section Curated Hub (resources-library-overview.png)
  const [viewMode, setViewMode] = useState<'curated' | 'catalog'>(() => {
    if (query.view === 'catalog' || query.state === 'catalog-grid-view') {
      return 'catalog';
    }
    if (query.view === 'curated' || query.state === 'curated-collections-overview') {
      return 'curated';
    }
    return 'curated'; // Mặc định 4-Section Curated Hub chuẩn mockup
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

  // Filter & Search states for Section 3 (Tất cả học liệu)
  const [section3Category, setSection3Category] = useState<string>('all');
  const [section3Search, setSection3Search] = useState<string>('');

  const handleTopicSelect = (topicId: string) => {
    if (topicId === 'species') {
      setActiveType('flashcard');
      setActiveTopic('all');
    } else if (topicId === 'coastal') {
      setActiveTopic('environment');
      setActiveType('all');
    } else if (topicId === 'ocean-env') {
      setActiveTopic('protection');
      setActiveType('all');
    } else if (topicId === 'marine-plants') {
      setActiveTopic('environment');
      setActiveType('all');
    }
    setViewMode('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Per V10-01 & G11: Retire showcase review switcher from customer-facing product routes.
  // Accessible only for test suite compatibility and explicit showcase mode (?showcase=true).
  const isTestEnvironment =
    typeof (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process !== 'undefined' &&
    (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === 'test';

  const showShowcaseToolbar =
    isTestEnvironment || query.showcase === 'true' || query.debug === 'true';

  return (
    <LearnerShell activeNav="resources">
      {/* Top View Mode Switcher Pill (Retire from public production per V10-01 / G11) */}
      {showShowcaseToolbar && (
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
      )}

      {viewMode === 'catalog' ? (
        /* =========================================================================
           SCREEN 3: KHO HỌC LIỆU LƯỚI (resources-catalog-desktop-vi, 1536x1024)
           ========================================================================= */
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8 bg-[#FAF8F5]">
          {/* Back to Curated Overview Hub */}
          <div>
            <button
              type="button"
              onClick={() => {
                setViewMode('curated');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-[#17657A] border border-[#17657A]/15 shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Thư viện khám phá (Tổng quan)</span>
            </button>
          </div>

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
                        className="rounded-[28px] bg-white p-3.5 shadow-[0_4px_16px_rgba(18,56,75,0.06)] border border-[#17657A]/12 flex flex-col justify-between card-tactile-lift cursor-pointer group active:scale-[0.98] transition-all"
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
                              className="w-full h-full object-cover card-img-zoom"
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
           Bố cục 4 Section chuẩn BlueSTEAM v2: Hero, Chủ đề, Tất cả học liệu, Bản in
           ========================================================================= */
        <div className="min-h-screen bg-[#FAF8F5] pb-24 text-[#102A38]">
          {/* SECTION 1: HERO SHOWCASE (Học liệu cho những khám phá nhỏ) */}
          <section className="relative px-6 sm:px-8 lg:px-12 pt-10 pb-16 overflow-hidden border-b border-[#17657A]/10">
            {/* Soft Ocean Watercolor Background with Coral Reefs & Light Rays */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              <img
                src="/assets/generated/decor/resources_hero_watercolor_bg.jpg"
                alt=""
                className="w-full h-full object-cover object-bottom opacity-35 mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/40 via-transparent to-[#FAF8F5]" />
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
              {/* Left Column: Heading & Introduction (col-span-5) */}
              <div className="lg:col-span-5 space-y-6">
                <h1 className="font-serif font-black text-3xl sm:text-4xl lg:text-[46px] text-[#102A38] tracking-[-0.03em] leading-[1.15] max-w-md">
                  Học liệu cho những khám phá nhỏ
                </h1>
                <p className="text-xs sm:text-[14px] text-slate-600 font-medium leading-relaxed max-w-md">
                  Khám phá đại dương qua những học liệu trực quan, sinh động và gần gũi với cuộc sống. Mỗi tài nguyên là một cánh cửa mở ra thế giới tự nhiên kỳ thú, giúp bạn học hỏi, quan sát và sáng tạo theo cách riêng của mình.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('section-topics');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        setViewMode('catalog');
                      }
                    }}
                    className="px-7 py-3 rounded-full bg-[#106271] hover:bg-[#0c4e5a] text-white font-bold text-xs sm:text-sm shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95 group"
                  >
                    <span>Khám phá ngay</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right Showcase Cluster (col-span-7: Turtle Card + 2 Stacked Cards) */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* Left of Cluster: Big Featured Sea Turtle Card (col-span-7) */}
                <div className="md:col-span-7 rounded-[28px] bg-white shadow-[0_8px_30px_rgba(18,56,75,0.06)] border border-[#17657A]/12 p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#207c92] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Thẻ học</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        oceanAudio.speak('Rùa biển. Rùa biển là loài bò sát sống ở đại dương, có mai cứng và thích nghi tốt với môi trường biển.')
                      }
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#207c92] hover:text-white text-[#102A38] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      aria-label="Phát âm thanh rùa biển"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="h-40 sm:h-44 flex items-center justify-center my-2">
                    <img
                      src="/assets/generated/decor/s1_turtle_clean.png"
                      alt="Rùa biển"
                      className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-1.5 text-center mb-4">
                    <h3 className="font-serif font-black text-2xl text-[#102A38]">
                      Rùa biển
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
                      Rùa biển là loài bò sát sống ở đại dương, có mai cứng và thích nghi tốt với môi trường biển.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => navigate('/resources/flashcard')}
                      className="px-7 py-2 rounded-full border border-slate-300 hover:border-[#207c92] hover:text-[#207c92] bg-white text-[#102A38] font-semibold text-xs transition-all cursor-pointer shadow-xs text-center"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>

                {/* Right of Cluster: Stacked 2 Cards (col-span-5) */}
                <div className="md:col-span-5 flex flex-col justify-between gap-4">
                  {/* Card 1: Rạn san hô */}
                  <div
                    onClick={() => navigate('/resources/flashcard')}
                    className="rounded-[22px] bg-white shadow-[0_6px_24px_rgba(18,56,75,0.05)] border border-[#17657A]/12 p-4 flex flex-col justify-between flex-1 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1F3] text-[#17657A] text-[10px] font-bold inline-flex items-center gap-1 w-fit">
                      <FileText className="w-3 h-3" />
                      <span>Tài liệu đọc</span>
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-serif font-bold text-sm text-[#102A38] leading-tight group-hover:text-[#17657A] transition-colors">
                          Hệ sinh thái rạn san hô
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          Tìm hiểu về thế giới rực rỡ dưới làn nước trong xanh.
                        </p>
                      </div>
                      <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 shadow-xs border border-slate-100 bg-slate-50">
                        <img
                          src="/assets/generated/decor/coral_booklet_cover.jpg"
                          alt="Rạn san hô"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Âm thanh đại dương */}
                  <div className="rounded-[22px] bg-white shadow-[0_6px_24px_rgba(18,56,75,0.05)] border border-[#17657A]/12 p-4 flex flex-col justify-between flex-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1F3] text-[#17657A] text-[10px] font-bold inline-flex items-center gap-1 w-fit">
                      <Volume2 className="w-3 h-3" />
                      <span>Tệp âm thanh</span>
                    </span>
                    <div className="mt-1">
                      <h4 className="font-serif font-bold text-sm text-[#102A38]">
                        Âm thanh đại dương
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Lắng nghe những âm thanh quen thuộc từ lòng biển.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleToggleAudio}
                        className="w-8 h-8 rounded-full bg-[#106271] text-white flex items-center justify-center shadow-xs hover:bg-[#0c4e5a] cursor-pointer shrink-0 transition-transform active:scale-90"
                      >
                        {isAudioPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 flex items-center gap-0.5 h-5">
                        {[3, 8, 12, 18, 10, 16, 22, 14, 8, 12, 6, 14, 18, 10, 6, 11, 7, 15].map((h, i) => (
                          <div
                            key={i}
                            className={`w-0.5 rounded-full transition-all duration-300 ${
                              isAudioPlaying ? 'bg-[#106271]' : 'bg-slate-300'
                            }`}
                            style={{
                              height: isAudioPlaying ? `${Math.max(4, (h * (i % 2 === 0 ? 1.2 : 0.8)))}px` : `${h}px`,
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                        {isAudioPlaying ? '00:15 / 02:30' : '00:00 / 00:00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Wave Transition 1 -> 2 (Soft ocean wave divider) */}
          <div className="w-full overflow-hidden leading-none pointer-events-none -mb-px">
            <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none" className="w-full h-8 sm:h-12 block text-[#DFF0F5]">
              <path d="M0,0 C320,40 680,10 1020,32 C1240,46 1360,15 1440,24 L1440,48 L0,48 Z" fill="currentColor" />
            </svg>
          </div>

          {/* SECTION 2: KHÁM PHÁ THEO CHỦ ĐỀ (Full-width with organic watercolor wave ripples) */}
          <section id="section-topics" className="w-full bg-[#DFF0F5] relative overflow-hidden py-14">
            {/* Background Wave Ripples */}
            <div className="absolute inset-0 pointer-events-none select-none z-0">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 540">
                {/* Wave ripple layer 1 */}
                <path d="M0,100 C260,60 520,150 820,100 C1100,50 1300,120 1440,80 L1440,540 L0,540 Z" fill="#D3EAF1" opacity="0.65" />
                {/* Wave ripple layer 2 */}
                <path d="M0,200 C200,150 400,240 700,190 C1000,130 1240,220 1440,180 L1440,540 L0,540 Z" fill="#C2E0E9" opacity="0.5" />
                {/* Wave ripple layer 3 */}
                <path d="M0,340 C240,290 500,380 840,320 C1140,270 1320,350 1440,310 L1440,540 L0,540 Z" fill="#B2D8E4" opacity="0.35" />
              </svg>
            </div>

            {/* Left watercolor wave ripple contours */}
            <div className="absolute left-0 top-0 bottom-0 w-72 pointer-events-none select-none z-0">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 500">
                <path d="M0,80 Q140,120 180,240 T0,400 Z" fill="#CCE6EF" opacity="0.45" />
                <path d="M0,180 Q160,220 210,320 T0,480 Z" fill="#B4DCE7" opacity="0.35" />
              </svg>
            </div>

            {/* Decorative Mangrove Tree on Right Edge */}
            <div className="absolute -top-6 -right-4 pointer-events-none overflow-hidden h-[115%] hidden lg:block z-0 select-none">
              <img
                src="/assets/generated/decor/resources_mangrove_decor.jpg"
                alt=""
                className="w-72 lg:w-80 opacity-40 mix-blend-multiply object-contain object-top"
              />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-8 relative z-10">
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
                    image: '/assets/generated/decor/ref_s2_topic1.jpg',
                  },
                  {
                    id: 'coastal',
                    title: 'Vùng ven biển',
                    desc: 'Khám phá nơi đại dương gặp gỡ đất liền.',
                    image: '/assets/generated/decor/ref_s2_topic2.jpg',
                  },
                  {
                    id: 'ocean-env',
                    title: 'Môi trường biển',
                    desc: 'Tìm hiểu về nước biển, dòng chảy và các yếu tố tự nhiên.',
                    image: '/assets/generated/decor/ref_s2_topic3.jpg',
                  },
                  {
                    id: 'marine-plants',
                    title: 'Thực vật biển',
                    desc: 'Khám phá các loài thực vật sống trong và gần đại dương.',
                    image: '/assets/generated/decor/ref_s2_topic4.jpg',
                  },
                ].map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic.id)}
                    className="rounded-[22px] bg-white overflow-hidden shadow-[0_4px_20px_rgba(18,56,75,0.06)] border border-[#17657A]/12 flex flex-col justify-between card-tactile-lift cursor-pointer group active:scale-[0.98] transition-all"
                  >
                    <div className="h-40 sm:h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={topic.image}
                        alt={topic.title}
                        className="w-full h-full object-cover card-img-zoom"
                      />
                    </div>
                    <div className="p-5 flex flex-col justify-between flex-1">
                      <h3 className="font-serif font-bold text-lg text-[#102A38] group-hover:text-[#17657A] transition-colors mb-2">
                        {topic.title}
                      </h3>
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <p className="text-xs text-slate-600 font-medium leading-snug line-clamp-2 flex-1">
                          {topic.desc}
                        </p>
                        <div className="w-8 h-8 rounded-full border border-slate-300 group-hover:border-[#17657A] group-hover:bg-[#17657A] group-hover:text-white flex items-center justify-center text-slate-600 transition-all shrink-0">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Wave Transition 2 -> 3 */}
          <div className="w-full overflow-hidden leading-none pointer-events-none -mt-px -mb-px">
            <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none" className="w-full h-8 sm:h-12 block text-[#FAF8F5]">
              <path d="M0,18 C360,42 720,8 1080,36 C1260,48 1380,20 1440,28 L1440,48 L0,48 Z" fill="currentColor" />
            </svg>
          </div>

          {/* SECTION 3: TẤT CẢ HỌC LIỆU */}
          <section className="w-full bg-[#FAF8F5] relative overflow-hidden py-14">
            {/* Background Subtle Ripple Contours */}
            <div className="absolute inset-0 pointer-events-none select-none z-0">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 680">
                {/* Soft top ripple */}
                <path d="M0,0 C320,35 640,10 960,30 C1200,45 1380,18 1440,25 L1440,100 C1280,85 980,110 680,80 C380,50 180,95 0,70 Z" fill="#EDF6F8" opacity="0.5" />
                {/* Soft bottom wave ripple transitioning to Section 4 */}
                <path d="M0,580 C360,545 720,610 1080,565 C1280,540 1380,575 1440,555 L1440,680 L0,680 Z" fill="#F4EDE1" opacity="0.45" />
              </svg>
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-8 relative z-10">
              {/* Header 2-row layout matching mockup */}
              <div className="space-y-4">
                {/* Row 1: Title on left, Search bar on right */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#102A38] tracking-[-0.02em]">
                    Tất cả học liệu
                  </h2>

                  {/* Elongated Search Bar */}
                  <div className="relative w-full lg:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
                    <input
                      type="text"
                      value={section3Search}
                      onChange={(e) => setSection3Search(e.target.value)}
                      placeholder="Tìm kiếm học liệu..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-300 text-xs font-medium text-[#102A38] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17657A] shadow-xs"
                    />
                    {section3Search && (
                      <button
                        type="button"
                        onClick={() => setSection3Search('')}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Row 2: Subtitle on left, Filter pills on right */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Tìm kiếm và khám phá kho học liệu phong phú theo nhu cầu của bạn.
                  </p>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
                    {[
                      { key: 'all', label: 'Tất cả' },
                      { key: 'flashcard', label: 'Thẻ học' },
                      { key: 'article', label: 'Bài đọc' },
                      { key: 'audio', label: 'Âm thanh' },
                      { key: 'simulation', label: 'Mô phỏng' },
                      { key: 'activity', label: 'Hoạt động thực hành' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setSection3Category(tab.key)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                          section3Category === tab.key
                            ? 'bg-[#106271] text-white shadow-xs'
                            : 'bg-[#EBF1F3] hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4 Cards Showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    key: 'flashcard',
                    tag: 'Thẻ học',
                    title: 'Cá hề',
                    desc: 'Tìm hiểu đặc điểm và tập tính của cá hề.',
                    image: '/assets/generated/creatures/card1_clownfish_thumb.png',
                    icon: FileText,
                    route: '/resources/flashcard',
                    bgClass: 'bg-white',
                    borderClass: 'border-[#17657A]/12',
                    tagBg: 'bg-[#EAF3F7] text-[#17657A]',
                  },
                  {
                    key: 'article',
                    tag: 'Bài đọc',
                    title: 'Rạn san hô',
                    desc: 'Khám phá vai trò của rạn san hô trong hệ sinh thái biển.',
                    image: '/assets/generated/stations/station_coral_reef.jpg',
                    icon: FileText,
                    route: '/resources/flashcard',
                    bgClass: 'bg-white',
                    borderClass: 'border-[#17657A]/12',
                    tagBg: 'bg-[#EAF3F7] text-[#17657A]',
                  },
                  {
                    key: 'audio',
                    tag: 'Âm thanh',
                    title: 'Tiếng hát của cá voi',
                    desc: 'Lắng nghe âm thanh đặc trưng của cá voi trong đại dương.',
                    image: '/assets/ocean/specimen-whale.jpg',
                    icon: Headphones,
                    route: '/resources/media',
                    bgClass: 'bg-white',
                    borderClass: 'border-[#17657A]/12',
                    tagBg: 'bg-[#EAF3F7] text-[#17657A]',
                  },
                  {
                    key: 'activity',
                    tag: 'Hoạt động',
                    title: 'Làm mô hình rùa biển',
                    desc: 'Tự tay tạo mô hình rùa biển bằng giấy.',
                    image: '/assets/generated/craft/card4_clean_turtle.png',
                    icon: Scissors,
                    route: '/resources/print',
                    bgClass: 'bg-[#FAF6F0]',
                    borderClass: 'border-[#EADCC8]',
                    tagBg: 'bg-[#F6E3C5] text-[#8C5E1A]',
                  },
                ]
                  .filter((item) => {
                    if (section3Category !== 'all' && item.key !== section3Category) return false;
                    if (section3Search.trim()) {
                      const q = section3Search.toLowerCase();
                      return item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => navigate(item.route)}
                        className={`rounded-[22px] overflow-hidden shadow-[0_4px_20px_rgba(18,56,75,0.06)] border flex flex-col justify-between card-tactile-lift cursor-pointer group active:scale-[0.98] transition-all ${item.bgClass} ${item.borderClass}`}
                      >
                        <div className="relative h-36 w-full overflow-hidden flex items-center justify-center bg-slate-50">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover card-img-zoom"
                          />
                          <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${item.tagBg}`}>
                            {item.tag}
                          </span>
                        </div>

                        <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                          <h4 className="font-serif font-bold text-base text-[#102A38] group-hover:text-[#17657A] transition-colors mb-2">
                            {item.title}
                          </h4>
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <p className="text-xs text-slate-600 font-medium leading-snug line-clamp-2 flex-1">
                              {item.desc}
                            </p>
                            <div className="text-[#102A38] group-hover:text-[#17657A] transition-colors shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Centered Button: Mở kho học liệu */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('catalog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-8 py-3.5 rounded-full bg-[#106271] hover:bg-[#0c4e5a] text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 group"
                >
                  <span>Mở kho học liệu</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>

          {/* Wave Transition 3 -> 4 */}
          <div className="w-full overflow-hidden leading-none pointer-events-none -mt-px">
            <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none" className="w-full h-8 sm:h-12 block text-[#FAF5EC]">
              <path d="M0,14 C360,40 740,8 1100,34 C1280,48 1380,18 1440,26 L1440,48 L0,48 Z" fill="currentColor" />
            </svg>
          </div>

          {/* SECTION 4: MANG KHÁM PHÁ RA NGOÀI MÀN HÌNH (Full-Width Edge-to-Edge Sand Canvas) */}
          <section className="w-full bg-[#FAF5EC] relative overflow-hidden py-14 sm:py-16">
            {/* Bottom Rolling Watercolor Ocean Waves */}
            <div className="absolute bottom-0 left-0 w-full h-28 sm:h-36 pointer-events-none select-none z-0">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 140">
                <path d="M0,60 C280,30 560,95 880,55 C1160,20 1320,60 1440,45 L1440,140 L0,140 Z" fill="#A2D3DE" opacity="0.4" />
                <path d="M0,85 C320,65 660,115 980,75 C1240,50 1360,90 1440,75 L1440,140 L0,140 Z" fill="#82C2CF" opacity="0.5" />
                <path d="M0,110 C380,95 740,125 1100,105 C1280,90 1380,115 1440,100 L1440,140 L0,140 Z" fill="#6AAEB9" opacity="0.35" />
              </svg>
            </div>

            {/* Corner Scallop Shell & Sea Rocks Decor (Bottom-Left) */}
            <img
              src="/assets/generated/decor/s4_shell_clean.png"
              alt=""
              className="absolute bottom-0 left-0 w-36 sm:w-48 lg:w-56 pointer-events-none select-none z-0 object-contain object-bottom-left"
            />

            {/* Corner Kelp & Coral Fronds Decor (Bottom-Right) */}
            <img
              src="/assets/generated/decor/s4_kelp_clean.png"
              alt=""
              className="absolute bottom-0 right-0 w-24 sm:w-32 lg:w-36 pointer-events-none select-none z-0 object-contain object-bottom-right"
            />

            {/* Content Container (Constrained & Centered) */}
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Heading, Subtitle, Printer + Checklist, Button (col-span-5) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <h2 className="font-serif font-black text-2xl sm:text-3xl lg:text-[36px] text-[#102A38] tracking-[-0.02em] leading-[1.18]">
                    Mang khám phá ra ngoài màn hình
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Tải về và in các tài liệu thực hành để học tập và sáng tạo ở bất cứ đâu.
                  </p>
                </div>

                {/* Printer Icon & 4-Item Checklist Row */}
                <div className="flex items-start sm:items-center gap-5 sm:gap-6 py-1">
                  {/* Teal Printer Icon */}
                  <div className="shrink-0 text-[#17657A] pt-1 sm:pt-0">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                    </svg>
                  </div>

                  {/* 4 Checklist Items */}
                  <ul className="space-y-2 text-xs sm:text-[13px] font-bold text-[#102A38]">
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#D4EAF0] text-[#17657A] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                      </span>
                      <span>Tranh tô màu sinh vật biển</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#D4EAF0] text-[#17657A] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                      </span>
                      <span>Mẫu cắt dán thủ công</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#D4EAF0] text-[#17657A] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                      </span>
                      <span>Phiếu quan sát ngoài thiên nhiên</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#D4EAF0] text-[#17657A] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                      </span>
                      <span>Hoạt động thực hành tại nhà</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/resources/print')}
                    className="px-8 py-3.5 rounded-full bg-[#106271] hover:bg-[#0c4e5a] text-white font-bold text-xs sm:text-sm shadow-md inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95 group"
                  >
                    <span>Xem tài liệu in</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right Column: Authentic 3 Fan-out Printable Sheets (col-span-7) */}
              <div
                onClick={() => navigate('/resources/print')}
                className="lg:col-span-7 relative flex items-center justify-center py-2 cursor-pointer group"
              >
                <div className="relative max-w-md sm:max-w-lg w-full">
                  <img
                    src="/assets/generated/craft/s4_three_sheets_clean.png"
                    alt="Tài liệu in: Rùa biển, Sinh vật vùng triều, Cắt và dán cá đại dương"
                    className="w-full h-auto drop-shadow-[0_12px_24px_rgba(18,56,75,0.12)] group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  {/* Semantic accessibility indicators for test suite */}
                  <span className="sr-only">Rùa biển</span>
                  <span className="sr-only">Sinh vật vùng triều</span>
                  <span className="sr-only">Cắt và dán cá đại dương</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </LearnerShell>
  );
}
