import { useState } from 'react';
import { ConceptId, CONCEPTS } from './ConceptTypes';
import { ConceptComparisonModal } from './ConceptComparisonModal';
import {
  Layers,
  Sparkles,
  BookOpen,
  Monitor,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  X,
} from 'lucide-react';

interface ConceptSwitcherProps {
  activeConcept: ConceptId;
  onSelectConcept: (conceptId: ConceptId) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function ConceptSwitcher({
  activeConcept,
  onSelectConcept,
  isMinimized: controlledMinimized,
  onToggleMinimize,
}: ConceptSwitcherProps) {
  const [internalMinimized, setInternalMinimized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMockupPreviewOpen, setIsMockupPreviewOpen] = useState(false);

  const isMinimized = controlledMinimized !== undefined ? controlledMinimized : internalMinimized;
  const toggleMinimize = onToggleMinimize || (() => setInternalMinimized(!internalMinimized));

  const activeMeta = CONCEPTS[activeConcept];

  return (
    <>
      {/* Top Concept Switcher Navigation Bar */}
      {isMinimized ? (
        <div className="fixed top-3 right-4 z-50">
          <button
            onClick={toggleMinimize}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#030e19]/95 hover:bg-[#071d33] text-white border border-sky-500/60 shadow-2xl backdrop-blur-md transition-all cursor-pointer text-xs font-mono group"
            title="Mở thanh điều khiển phương án"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-sky-300">
              {activeMeta.title.split('—')[0].trim()}
            </span>
            <span className="text-slate-300 hidden sm:inline">
              ({activeMeta.title.split('—')[1]?.trim()})
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-sky-400 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      ) : (
        <aside
          aria-label="Thanh điều khiển phương án Landing Page"
          className="sticky top-0 z-40 w-full bg-[#030e19]/96 backdrop-blur-md border-b border-sky-600/40 shadow-xl transition-all"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 min-h-[48px]">
            {/* Left: Active Concept Status */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold hidden sm:inline">
                    Đang duyệt:
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline" />
                  <span className="font-serif font-bold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-none">
                    {activeMeta.title}
                  </span>
                </div>
              </div>

              {/* Mobile Minimize */}
              <button
                onClick={toggleMinimize}
                className="sm:hidden p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                title="Thu nhỏ thanh điều khiển"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            {/* Center: 3 Concept Switch Buttons */}
            <nav
              aria-label="Chọn phương án"
              className="flex items-center gap-1 bg-[#010810]/80 p-1 rounded-xl border border-sky-900/60 w-full sm:w-auto justify-center overflow-x-auto"
            >
              {/* Concept A */}
              <button
                onClick={() => onSelectConcept('concept-a')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeConcept === 'concept-a'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Phương án A: Khám Phá Điện Ảnh (Cinematic Discovery)"
              >
                <Sparkles className="w-3 h-3" />
                <span>Phương án A</span>
              </button>

              {/* Concept B */}
              <button
                onClick={() => onSelectConcept('concept-b')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeConcept === 'concept-b'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Phương án B: Bản Đồ Tri Thức Sống (Scientific Living Atlas)"
              >
                <BookOpen className="w-3 h-3" />
                <span>Phương án B</span>
              </button>

              {/* Concept C */}
              <button
                onClick={() => onSelectConcept('concept-c')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeConcept === 'concept-c'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Phương án C: Hệ Sinh Thái Lớp Học (Living Learning System)"
              >
                <Monitor className="w-3 h-3" />
                <span>Phương án C</span>
              </button>
            </nav>

            {/* Right: Compare Matrix & Mockup Inspector & Minimize */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/90 hover:bg-sky-900 text-sky-200 border border-sky-600/50 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap"
                title="Mở bảng đối chiếu chi tiết cả 3 phương án"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>So sánh 3 bản</span>
              </button>

              <button
                onClick={() => setIsMockupPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap"
                title="Xem ảnh mockup thiết kế gốc chất lượng cao"
              >
                <ImageIcon className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden sm:inline">Ảnh mockup</span>
              </button>

              <button
                onClick={toggleMinimize}
                className="hidden sm:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Thu nhỏ thanh điều khiển"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Comparison Modal */}
      <ConceptComparisonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeConcept={activeConcept}
        onSelectConcept={onSelectConcept}
      />

      {/* Single Concept High-Res Mockup Lightbox */}
      {isMockupPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[95vh] bg-[#051421] border border-sky-700/60 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-sky-900/60 bg-[#030e17]">
              <div>
                <span className="text-xs font-mono text-sky-400 uppercase tracking-wider block">
                  Ảnh Mockup Thiết Kế Gốc
                </span>
                <h4 className="text-sm font-serif font-bold text-white">
                  {activeMeta.title}
                </h4>
              </div>
              <button
                onClick={() => setIsMockupPreviewOpen(false)}
                className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng ảnh mockup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-[#020b12]">
              <img
                src={activeMeta.mockupUrl}
                alt={activeMeta.title}
                className="max-w-full h-auto rounded-lg border border-sky-900/40 shadow-2xl"
              />
            </div>

            <div className="px-5 py-2.5 border-t border-sky-900/60 bg-[#030e17] flex items-center justify-between text-xs font-mono text-sky-300/80">
              <span>Độ phân giải gốc 768 × 1376</span>
              <a
                href={activeMeta.mockupUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sky-400 hover:underline"
              >
                <span>Mở trong tab mới</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
