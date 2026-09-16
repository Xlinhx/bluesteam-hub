import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { useI18n } from '../../shared/i18n/I18nContext';
import { LearnerShell } from '../../shells/LearnerShell';
import { creativeStorage, CreativeArtwork } from '../../services/creativeStorage';
import { 
  Box, 
  Plus, 
  Edit2, 
  Trash2,
  Paintbrush
} from 'lucide-react';

export function CreativeStudioPage() {
  const { navigate } = useRouter();
  const { locale } = useI18n();
  const [activeShelfTab, setActiveShelfTab] = useState<'plants' | 'rocks' | 'corals' | 'other'>('plants');
  const [artworks, setArtworks] = useState<CreativeArtwork[]>([]);

  // Load real saved artworks from IndexedDB / creativeStorage
  useEffect(() => {
    let isMounted = true;
    async function loadArtworks() {
      try {
        const stored = await creativeStorage.getArtworks();
        if (isMounted) {
          // If storage is initially empty, seed with An's turtle drawing so learner sees immediate work
          if (stored.length === 0) {
            const initialArt: CreativeArtwork = {
              id: 'starter-turtle-art',
              type: 'drawing',
              title: locale === 'vi' ? 'Bức tranh Rùa Xanh' : 'Green Turtle Drawing',
              createdAt: Date.now() - 3600000,
              previewDataUrl: '/assets/generated/craft/child_crayon_turtle.jpg',
              drawingData: {
                template: 'turtle',
                canvasDataUrl: '/assets/generated/craft/child_crayon_turtle.jpg',
              },
            };
            setArtworks([initialArt]);
          } else {
            setArtworks(stored);
          }
        }
      } catch (err) {
        console.warn('Failed to load artworks from creativeStorage:', err);
      }
    }
    loadArtworks();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  const handleDeleteArtwork = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(locale === 'vi' ? 'Bé có chắc muốn xóa tác phẩm này không?' : 'Delete this artwork?')) {
      await creativeStorage.deleteArtwork(id);
      setArtworks((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // 7 Ocean color swatches for the "Tô màu" card
  const colorDots = [
    { name: 'Red Coral', bg: 'bg-[#F26B55]' },
    { name: 'Orange', bg: 'bg-[#FB923C]' },
    { name: 'Warm Yellow', bg: 'bg-[#FBBF24]' },
    { name: 'Teal Green', bg: 'bg-[#10B981]' },
    { name: 'Ocean Blue', bg: 'bg-[#0284C7]' },
    { name: 'Navy Blue', bg: 'bg-[#1E3A8A]' },
    { name: 'White', bg: 'bg-white border border-gray-300' },
  ];

  return (
    <LearnerShell activeNav="creative">
      <div className="min-h-screen bg-[#F5EFE6] bg-[url('/assets/creative/creative_studio_bg.jpg')] bg-cover bg-top bg-no-repeat pb-16 relative selection:bg-teal-100 selection:text-teal-900">
        {/* Subtle warm overlay to blend ambient studio lighting */}
        <div className="absolute inset-0 bg-[#F6F1E7]/25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-7 relative z-10">
          
          {/* Top Header Row: Starfish Wooden Badge & Central Title */}
          <div className="relative flex flex-col md:flex-row items-center justify-between pt-2 pb-1 gap-4">
            {/* Top Left: Starfish Wooden Plaque "Sáng tạo" */}
            <div 
              onClick={() => navigate('/creative')}
              className="md:absolute md:left-0 md:top-0 z-20 cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
              title={locale === 'vi' ? 'Góc Sáng tạo' : 'Creative Studio'}
            >
              <img 
                src="/assets/creative/badge_sangtao.png" 
                alt="⭐ Sáng tạo" 
                className="h-16 sm:h-20 lg:h-22 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] -rotate-3 group-hover:rotate-0 transition-transform duration-300"
              />
            </div>

            {/* Central Page Heading: Classic Serif Dark Navy */}
            <div className="w-full text-center md:pt-1">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-black text-[#102A38] tracking-[-0.02em] drop-shadow-xs">
                {locale === 'vi' ? 'Đại dương mang dấu ấn của bé' : 'Your Ocean, Your Touch'}
              </h1>
            </div>
          </div>

          {/* Section 1: 2 Canvases (Vẽ tự do & Tô màu) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left 7 Cols: Crayon Free Drawing Canvas ("Vẽ tự do") */}
            <div
              onClick={() => navigate('/creative/drawing')}
              className="lg:col-span-7 bg-[#FAF7F0]/95 backdrop-blur-xs rounded-[32px] p-4 sm:p-5 shadow-[0_12px_28px_rgba(18,56,75,0.08)] hover:shadow-[0_16px_36px_rgba(18,56,75,0.14)] transition-all border border-[#caa876]/40 relative group cursor-pointer flex flex-col justify-between"
            >
              {/* Floating Vertical Crayon Palette Dock on Left */}
              <div 
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none transition-transform group-hover:scale-105 duration-300"
                title="Bút sáp màu"
              >
                <img 
                  src="/assets/creative/crayon_palette_dock.png" 
                  alt="Crayon Dock" 
                  className="w-11 sm:w-13 h-auto object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.22)]"
                />
              </div>

              {/* Main Crayon Drawing Canvas */}
              <div className="rounded-2xl overflow-hidden h-[300px] sm:h-[350px] relative bg-[#fffdfa] border border-[#e6dbc8] shadow-inner">
                <img
                  src="/assets/creative/child_crayon_whale_ocean.jpg"
                  alt="Child Crayon Whale Drawing"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />

                {/* Bottom Right CTA Button */}
                <div className="absolute bottom-4 right-4 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/creative/drawing');
                    }}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#0E5970] hover:bg-[#094354] text-white font-extrabold text-sm shadow-[0_6px_16px_rgba(14,89,112,0.4)] transition-all active:scale-95 cursor-pointer min-h-[46px]"
                  >
                    <Edit2 className="w-4 h-4 stroke-[2.5]" />
                    <span>{locale === 'vi' ? 'Vẽ tự do' : 'Free Drawing'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Octopus Coloring Card ("Tô màu") */}
            <div
              onClick={() => navigate('/creative/drawing?template=octopus')}
              className="lg:col-span-5 bg-[#FAF7F0]/95 backdrop-blur-xs rounded-[32px] p-5 sm:p-6 shadow-[0_12px_28px_rgba(18,56,75,0.08)] hover:shadow-[0_16px_36px_rgba(18,56,75,0.14)] transition-all border border-[#caa876]/40 relative group cursor-pointer flex flex-col justify-between"
            >
              {/* Header: Tô màu */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2.5 text-[#102A38] font-bold text-base sm:text-lg">
                  <Paintbrush className="w-5 h-5 text-[#102A38]" />
                  <span>{locale === 'vi' ? 'Tô màu: Mẫu Bạch tuộc' : 'Coloring: Octopus'}</span>
                </div>
              </div>

              {/* Octopus Lineart Artwork Container & Floating Color Dots Palette */}
              <div className="relative flex-1 flex items-center justify-center p-1">
                <div className="w-full h-[260px] sm:h-[285px] flex items-center justify-center overflow-hidden rounded-2xl bg-white border border-[#e6dbc8] p-3 shadow-inner">
                  <img
                    src="/assets/creative/octopus_coloring_page.jpg"
                    alt="Octopus Coloring Lineart"
                    className="max-h-full w-auto object-contain group-hover:scale-103 transition-transform duration-300"
                  />
                </div>

                {/* Vertical Color Dots Dock on Right (7 Dots) */}
                <div 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-gray-200/90 shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-10 pointer-events-none group-hover:scale-105 transition-transform"
                  title="Bảng màu tô"
                >
                  {colorDots.map((dot, idx) => (
                    <div
                      key={idx}
                      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full ${dot.bg} shadow-xs ring-1 ring-black/10`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Xây một nơi sống (Full-Bleed Recessed Diorama Shelf & Organizer) */}
          <div className="rounded-[32px] overflow-hidden border-3 border-[#caa876]/60 shadow-[0_16px_36px_rgba(18,56,75,0.1)] bg-[#FAF7F0]/95 backdrop-blur-xs p-4 sm:p-5 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Left 7 Cols: Full-Bleed 3D Miniature Ocean Sand Habitat */}
              <div
                onClick={() => navigate('/creative/habitat')}
                className="lg:col-span-7 rounded-2xl overflow-hidden relative group cursor-pointer border border-[#caa876]/40 shadow-inner bg-[#4B8DA5]/10 min-h-[260px] sm:min-h-[300px] flex items-center"
              >
                <img
                  src="/assets/creative/ocean_diorama_habitat.jpg"
                  alt="Ocean Diorama Habitat"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />

                {/* Top-Left Pinned Torn-Parchment Tag "🏠 Xây một nơi sống" */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F6EEDF]/95 backdrop-blur-xs border border-[#caa876] text-[#102A38] font-serif font-black text-sm sm:text-base shadow-[0_4px_12px_rgba(0,0,0,0.15)] transform -rotate-1 group-hover:rotate-0 transition-transform">
                    <span className="text-base">🏠</span>
                    <span>{locale === 'vi' ? 'Xây một nơi sống' : 'Build A Habitat'}</span>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Wooden Shelf Organizer & Start Building Button */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-3 sm:gap-4">
                
                {/* Top Category Capsule Tabs */}
                <div className="bg-[#EFE8D8] rounded-2xl p-1.5 flex items-center justify-between border border-[#caa876]/40 shadow-inner text-xs sm:text-sm font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveShelfTab('plants')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                      activeShelfTab === 'plants'
                        ? 'bg-white text-[#0E5970] shadow-sm font-extrabold'
                        : 'text-[#5B4834] hover:text-[#102A38]'
                    }`}
                  >
                    <span>🌿</span>
                    <span>{locale === 'vi' ? 'Thực vật' : 'Plants'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveShelfTab('rocks')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                      activeShelfTab === 'rocks'
                        ? 'bg-white text-[#0E5970] shadow-sm font-extrabold'
                        : 'text-[#5B4834] hover:text-[#102A38]'
                    }`}
                  >
                    <span>🪨</span>
                    <span>{locale === 'vi' ? 'Đá' : 'Rocks'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveShelfTab('corals')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                      activeShelfTab === 'corals'
                        ? 'bg-white text-[#0E5970] shadow-sm font-extrabold'
                        : 'text-[#5B4834] hover:text-[#102A38]'
                    }`}
                  >
                    <span>🪸</span>
                    <span>{locale === 'vi' ? 'San hô' : 'Corals'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveShelfTab('other')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                      activeShelfTab === 'other'
                        ? 'bg-white text-[#0E5970] shadow-sm font-extrabold'
                        : 'text-[#5B4834] hover:text-[#102A38]'
                    }`}
                  >
                    <span>🐚</span>
                    <span>{locale === 'vi' ? 'Vật liệu khác' : 'Other'}</span>
                  </button>
                </div>

                {/* 8-Compartment Wooden Craft Shelf (Exact Mockup Match) */}
                <div 
                  onClick={() => navigate('/creative/habitat')}
                  className="rounded-2xl overflow-hidden border-2 border-[#b8955a] shadow-inner bg-[#d8be92]/30 p-1 cursor-pointer group flex items-center justify-center"
                >
                  <img
                    src="/assets/creative/wooden_craft_shelf.png"
                    alt="Wooden Craft Shelf Organizer"
                    className="w-full h-auto max-h-[190px] object-contain group-hover:scale-102 transition-transform duration-300"
                  />
                </div>

                {/* Start Building CTA Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/creative/habitat')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3 rounded-full bg-[#0E5970] hover:bg-[#094354] text-white font-extrabold text-sm sm:text-base shadow-[0_6px_16px_rgba(14,89,112,0.4)] transition-all active:scale-95 cursor-pointer min-h-[48px]"
                  >
                    <Box className="w-5 h-5 stroke-[2.5]" />
                    <span>{locale === 'vi' ? 'Bắt đầu xây' : 'Start Building'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Tác phẩm của An & Bottom Shelf Decor */}
          <div className="rounded-[32px] border border-[#caa876]/40 shadow-[0_12px_28px_rgba(18,56,75,0.08)] bg-[#FAF7F0]/95 backdrop-blur-xs p-6 sm:pl-24 relative">
            {/* Bottom-Left Coral Reef Decor: Permanently anchored to the bottom shelf */}
            <div className="absolute -bottom-3 left-2 sm:left-3 z-20 pointer-events-none hidden sm:block">
              <img
                src="/assets/creative/bottom_left_corals.png"
                alt="Coral reef decoration"
                className="w-28 sm:w-36 lg:w-40 h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
              />
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              {/* Left Side: Title & Artworks row */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5 text-[#102A38] font-serif font-black text-xl sm:text-2xl">
                    <span className="text-2xl">🖼️</span>
                    <span>{locale === 'vi' ? 'Tác phẩm của An' : "An's Artworks"}</span>
                  </div>

                  <div className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EFE8D8] text-[#0E5970] border border-[#caa876]/40">
                    {artworks.length} {locale === 'vi' ? 'tác phẩm đã lưu' : 'saved artworks'}
                  </div>
                </div>

                {/* Artwork Slots (An's Turtle Drawing + New Artwork Slot) */}
                <div className="flex items-center gap-5 flex-wrap">
                  {/* Saved Artworks */}
                  {artworks.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => {
                        if (art.type === 'drawing') {
                          navigate('/creative/drawing?id=' + art.id);
                        } else {
                          navigate('/creative/habitat?id=' + art.id);
                        }
                      }}
                      className="w-56 h-36 rounded-2xl overflow-hidden border border-[#caa876]/50 shadow-sm hover:shadow-md transition-all cursor-pointer group relative bg-white"
                      title={art.title}
                    >
                      {art.previewDataUrl ? (
                        <img
                          src={art.previewDataUrl}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                          {art.title}
                        </div>
                      )}

                      {/* Artwork title badge overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-between text-white">
                        <span className="text-xs font-bold truncate max-w-[130px]">{art.title}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteArtwork(e, art.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/20 text-white/90 hover:text-red-300 transition-opacity"
                          title={locale === 'vi' ? 'Xóa tranh' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Slot: Create New Artwork ("Tạo mới" strictly per REFERENCE_CORRECTIONS.md) */}
                  <div
                    onClick={() => navigate('/creative/drawing')}
                    className="w-56 h-36 rounded-2xl border-2 border-dashed border-[#0E5970]/35 hover:border-[#0E5970] flex flex-col items-center justify-center gap-2 text-[#0E5970]/80 hover:text-[#0E5970] transition-all cursor-pointer bg-[#F7F2E7]/60 hover:bg-white group shadow-xs hover:shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0E5970]/10 group-hover:bg-[#0E5970]/15 flex items-center justify-center transition-colors">
                      <Plus className="w-5 h-5 text-[#0E5970]" />
                    </div>
                    <span className="text-xs font-extrabold tracking-wide">
                      {locale === 'vi' ? 'Tạo mới' : 'Create New'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Wooden Signpost decoration */}
              <div className="hidden lg:flex items-center justify-end pointer-events-none">
                <img
                  src="/assets/creative/bottom_right_signpost.png"
                  alt="Creative studio signpost decoration"
                  className="w-52 xl:w-60 h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.16)]"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </LearnerShell>
  );
}
