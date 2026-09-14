import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { useI18n } from '../../shared/i18n/I18nContext';
import { LearnerShell } from '../../shells/LearnerShell';
import { creativeStorage, CreativeArtwork } from '../../services/creativeStorage';
import { 
  Palette, 
  Box, 
  Plus, 
  Edit2, 
  Sprout, 
  Mountain, 
  Shell, 
  Trash2 
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

  return (
    <LearnerShell activeNav="creative">
      <div className="min-h-screen bg-[#f5f1e8] pb-16 relative selection:bg-teal-100 selection:text-teal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
          {/* Top Title Section */}
          <div className="relative text-center space-y-2 pt-2">
            {/* Top Wooden Banner Tag */}
            <div className="inline-flex items-center gap-2 px-6 py-1.5 rounded-2xl bg-[#e6d7b8] border-2 border-[#caa876] text-[#784e1b] shadow-xs font-black text-sm transform -rotate-1">
              <span className="text-base">⭐</span>
              <span>{locale === 'vi' ? 'Sáng tạo' : 'Creative Studio'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[#102A38] tracking-[-0.02em]">
              {locale === 'vi' ? 'Đại dương mang dấu ấn của bé' : 'Your Ocean, Your Touch'}
            </h1>
          </div>

          {/* Upper Section: 2 Canvases (Crayon Whale Free Drawing & Tô Màu Octopus) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Crayon Whale Drawing Canvas */}
            <div
              onClick={() => navigate('/creative/drawing')}
              className="lg:col-span-7 bg-white rounded-[28px] p-4 sm:p-5 shadow-[0_8px_24px_rgba(18,56,75,0.06)] hover:shadow-[0_12px_32px_rgba(18,56,75,0.12)] transition-all border border-[#17657A]/15 relative group cursor-pointer flex flex-col justify-between"
            >
              {/* Crayon Tool Palette on Left */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 p-2 rounded-2xl bg-white/95 backdrop-blur-xs shadow-md border border-black/5 z-20 pointer-events-none">
                <div className="w-3.5 h-8 rounded-full bg-sky-500 shadow-xs ring-1 ring-sky-600/20" />
                <div className="w-3.5 h-8 rounded-full bg-red-500 shadow-xs ring-1 ring-red-600/20" />
                <div className="w-3.5 h-8 rounded-full bg-emerald-500 shadow-xs ring-1 ring-emerald-600/20" />
                <div className="w-3.5 h-8 rounded-full bg-amber-400 shadow-xs ring-1 ring-amber-500/20" />
                <div className="w-3.5 h-6 rounded-md bg-gray-200 border border-gray-300 shadow-xs" />
              </div>

              {/* Main Artwork Container */}
              <div className="rounded-2xl overflow-hidden h-[300px] sm:h-[350px] relative bg-[#faf7f0] border border-black/5">
                <img
                  src="/assets/generated/craft/child_crayon_whale_ocean.jpg"
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
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#17657A] hover:bg-[#124d5d] text-white font-extrabold text-sm shadow-[0_4px_12px_rgba(23,101,122,0.35)] transition-transform active:scale-95 cursor-pointer min-h-[48px]"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>{locale === 'vi' ? 'Vẽ tự do' : 'Free Drawing'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Tô Màu Octopus */}
            <div
              onClick={() => navigate('/creative/drawing?template=octopus')}
              className="lg:col-span-5 bg-white rounded-[28px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(18,56,75,0.06)] hover:shadow-[0_12px_32px_rgba(18,56,75,0.12)] transition-all border border-[#17657A]/15 relative group cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2.5 text-[#102A38] font-bold text-base">
                  <Palette className="w-5 h-5 text-[#F67650]" />
                  <span>{locale === 'vi' ? 'Tô màu' : 'Coloring'}</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#17657A]/10 text-[#17657A]">
                  {locale === 'vi' ? 'Mẫu Bạch tuộc' : 'Octopus Pattern'}
                </span>
              </div>

              <div className="relative flex-1 flex items-center justify-center p-2">
                <div className="w-full h-[260px] flex items-center justify-center overflow-hidden rounded-2xl bg-[#faf8f5] border border-black/5 p-2">
                  <img
                    src="/assets/generated/craft/octopus_coloring_lineart.jpg"
                    alt="Octopus Coloring"
                    className="max-h-full w-auto object-contain group-hover:scale-103 transition-transform duration-300"
                  />
                </div>

                {/* Vertical Color Swatches on right */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 rounded-full bg-white/95 backdrop-blur-xs border border-gray-200 shadow-md pointer-events-none">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 ring-1 ring-black/10" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-1 ring-black/10" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 ring-1 ring-black/10" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-1 ring-black/10" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#17657A] ring-1 ring-black/10" />
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-1 ring-black/10" />
                  <div className="w-3.5 h-3.5 rounded-full bg-white border border-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Xây một nơi sống (3D Diorama & Shelf Organizer) */}
          <div className="bg-white rounded-[28px] p-6 shadow-[0_8px_24px_rgba(18,56,75,0.06)] border border-[#17657A]/15 space-y-4">
            {/* Header Plank Tag */}
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-xl bg-[#e6d7b8] border border-[#caa876] text-[#784e1b] font-bold text-sm">
              <span>🏠</span>
              <span>{locale === 'vi' ? 'Xây một nơi sống' : 'Build A Habitat'}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left 7 Cols: Sand Tray Miniature Habitat */}
              <div
                onClick={() => navigate('/creative/habitat')}
                className="lg:col-span-7 rounded-2xl overflow-hidden h-[260px] sm:h-[300px] border border-black/10 shadow-inner group cursor-pointer relative bg-[#f7eedf]"
              >
                <img
                  src="/assets/generated/craft/sand_diorama_tray_habitat.jpg"
                  alt="Sand Diorama Habitat"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>

              {/* Right 5 Cols: Wooden Shelf Organizer & Start Button */}
              <div className="lg:col-span-5 flex flex-col justify-between h-[260px] sm:h-[300px] space-y-4">
                {/* Tabs */}
                <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveShelfTab('plants')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                      activeShelfTab === 'plants' ? 'bg-[#17657A] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>{locale === 'vi' ? 'Thực vật' : 'Plants'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveShelfTab('rocks')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                      activeShelfTab === 'rocks' ? 'bg-[#17657A] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Mountain className="w-3.5 h-3.5" />
                    <span>{locale === 'vi' ? 'Đá' : 'Rocks'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveShelfTab('corals')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                      activeShelfTab === 'corals' ? 'bg-[#17657A] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>🪸</span>
                    <span>{locale === 'vi' ? 'San hô' : 'Corals'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveShelfTab('other')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                      activeShelfTab === 'other' ? 'bg-[#17657A] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Shell className="w-3.5 h-3.5" />
                    <span>{locale === 'vi' ? 'Vật liệu khác' : 'Other'}</span>
                  </button>
                </div>

                {/* Wooden Compartment Organizer Grid */}
                <div className="flex-1 bg-[#d8be92] rounded-2xl p-3 border-2 border-[#b89a69] grid grid-cols-4 gap-2 items-center justify-items-center shadow-inner">
                  <div className="w-14 h-14 bg-[#f8edd9] rounded-xl flex items-center justify-center text-xl shadow-xs border border-[#caa876]">🌿</div>
                  <div className="w-14 h-14 bg-[#f8edd9] rounded-xl flex items-center justify-center text-xl shadow-xs border border-[#caa876]">🌾</div>
                  <div className="w-14 h-14 bg-[#f8edd9] rounded-xl flex items-center justify-center text-xl shadow-xs border border-[#caa876]">🪨</div>
                  <div className="w-14 h-14 bg-[#f8edd9] rounded-xl flex items-center justify-center text-xl shadow-xs border border-[#caa876]">🐚</div>
                </div>

                {/* Start Building CTA */}
                <button
                  type="button"
                  onClick={() => navigate('/creative/habitat')}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#17657A] hover:bg-[#124d5d] text-white font-extrabold text-sm shadow-[0_4px_12px_rgba(23,101,122,0.3)] transition-transform active:scale-95 cursor-pointer min-h-[48px]"
                >
                  <Box className="w-4 h-4" />
                  <span>{locale === 'vi' ? 'Bắt đầu xây' : 'Start Building'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section: Tác phẩm của An */}
          <div className="bg-white rounded-[28px] p-6 shadow-[0_8px_24px_rgba(18,56,75,0.06)] border border-[#17657A]/15 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#102A38] font-serif font-black text-lg">
                <span className="text-xl">🖼️</span>
                <span>{locale === 'vi' ? 'Tác phẩm của An' : "An's Artworks"}</span>
              </div>

              {/* Clean counter badge (replaces auto-generated slogan per REFERENCE_CORRECTIONS.md) */}
              <div className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F6F3EB] text-[#17657A] border border-[#17657A]/15">
                {artworks.length} {locale === 'vi' ? 'tác phẩm đã lưu' : 'saved artworks'}
              </div>
            </div>

            <div className="flex items-center gap-5 flex-wrap">
              {/* Render Saved Artworks */}
              {artworks.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    if (art.type === 'drawing') {
                      navigate(`/creative/drawing?id=${art.id}`);
                    } else {
                      navigate(`/creative/habitat?id=${art.id}`);
                    }
                  }}
                  className="w-56 h-36 rounded-2xl overflow-hidden border border-black/10 shadow-xs hover:shadow-md transition-all cursor-pointer group relative bg-[#faf8f5]"
                  title={art.title}
                >
                  {art.previewDataUrl ? (
                    <img
                      src={art.previewDataUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                className="w-56 h-36 rounded-2xl border-2 border-dashed border-[#17657A]/30 hover:border-[#17657A] flex flex-col items-center justify-center gap-2 text-[#17657A]/70 hover:text-[#17657A] transition-all cursor-pointer bg-[#faf8f5]/60 hover:bg-white group shadow-xs hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-[#17657A]/10 group-hover:bg-[#17657A]/15 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold tracking-wide">
                  {locale === 'vi' ? 'Tạo mới' : 'Create New'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
