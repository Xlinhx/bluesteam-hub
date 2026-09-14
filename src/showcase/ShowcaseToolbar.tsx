import { useState } from 'react';
import { useRouter } from '../app/router';
import {
  SCREENS_REGISTRY,
  ConceptKey,
  getScreenByRoute,
  getScreenByIndex,
  getStoredConcept,
  setStoredConcept,
} from './registry';
import {
  BLUESTEAM_V2_SCREENS,
  getV2ScreenByRoute,
  getV2ScreenByIndex,
} from './v2ScreensData';
import { MockupModal } from './MockupModal';
import { ScreenCompareModal } from './ScreenCompareModal';
import { V2ScreenModal } from './V2ScreenModal';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Grid3X3,
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  Tv,
  Award,
} from 'lucide-react';

export type ViewportMode = 'desktop' | 'tablet' | 'presentation';

interface ShowcaseToolbarProps {
  viewportMode?: ViewportMode;
  onViewportChange?: (mode: ViewportMode) => void;
}

export function ShowcaseToolbar({ viewportMode: controlledViewport, onViewportChange }: ShowcaseToolbarProps = {}) {
  const { currentPath, query, navigate } = useRouter();
  const [internalViewport, setInternalViewport] = useState<ViewportMode>('desktop');
  const viewportMode = controlledViewport || internalViewport;
  const handleViewportChange = (mode: ViewportMode) => {
    setInternalViewport(mode);
    onViewportChange?.(mode);
  };
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMockupOpen, setIsMockupOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isV2ModalOpen, setIsV2ModalOpen] = useState(false);

  // Identify screen from route
  const currentV2Screen = getV2ScreenByRoute(currentPath);
  const currentV1Screen = getScreenByRoute(currentPath) || SCREENS_REGISTRY[0];

  // Read active concept for v1
  const currentConcept: ConceptKey =
    (query.concept as ConceptKey) || getStoredConcept(currentV1Screen.id);

  // Handle switching concept for v1
  const handleConceptSelect = (concept: ConceptKey) => {
    setStoredConcept(currentV1Screen.id, concept);
    navigate(currentV1Screen.route, { query: { concept } });
  };

  // Handle Next/Prev navigation
  const handlePrevV2Screen = () => {
    if (currentV2Screen && currentV2Screen.index > 1) {
      const prev = getV2ScreenByIndex(currentV2Screen.index - 1);
      if (prev) navigate(prev.route);
    } else if (currentV1Screen.index > 1) {
      const prev = getScreenByIndex(currentV1Screen.index - 1);
      if (prev) {
        const prevConcept = getStoredConcept(prev.id);
        navigate(prev.route, { query: { concept: prevConcept } });
      }
    }
  };

  const handleNextV2Screen = () => {
    if (currentV2Screen && currentV2Screen.index < 39) {
      const next = getV2ScreenByIndex(currentV2Screen.index + 1);
      if (next) navigate(next.route);
    } else if (currentV1Screen.index < 14) {
      const next = getScreenByIndex(currentV1Screen.index + 1);
      if (next) {
        const nextConcept = getStoredConcept(next.id);
        navigate(next.route, { query: { concept: nextConcept } });
      }
    }
  };

  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900/95 text-white text-xs font-mono font-semibold rounded-full shadow-2xl border border-sky-700/60 hover:border-sky-400 hover:bg-neutral-800 transition-all cursor-pointer backdrop-blur-md"
          title="Mở thanh điều khiển Showcase"
        >
          <Grid3X3 className="w-4 h-4 text-sky-400" />
          {currentV2Screen ? (
            <span className="flex items-center gap-1.5">
              <span className="text-sky-300 font-bold">#{String(currentV2Screen.index).padStart(2, '0')}/39</span>
              <span>·</span>
              <span className="truncate max-w-[160px] sm:max-w-[220px]">{currentV2Screen.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </span>
          ) : (
            <span>
              {currentV1Screen.code}/14 · {currentV1Screen.name} ({currentConcept.toUpperCase()})
            </span>
          )}
          <ChevronUp className="w-4 h-4 text-neutral-400" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Modals */}
      {isV2ModalOpen && currentV2Screen && (
        <V2ScreenModal
          screen={currentV2Screen}
          onClose={() => setIsV2ModalOpen(false)}
        />
      )}

      {isMockupOpen && (
        <MockupModal
          screen={currentV1Screen}
          initialConcept={currentConcept}
          onClose={() => setIsMockupOpen(false)}
        />
      )}

      {isCompareOpen && (
        <ScreenCompareModal
          screen={currentV1Screen}
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      {/* Main Floating Toolbar */}
      <aside
        aria-label="Ocean Showcase Controller"
        className="fixed bottom-3 inset-x-4 max-w-6xl mx-auto z-50 bg-neutral-950/95 backdrop-blur-md text-neutral-200 border border-sky-900/60 rounded-2xl px-4 py-2 text-xs font-mono transition-all shadow-2xl"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Screen Sequence Stepper & Dropdown */}
          <div className="flex items-center gap-2">
            {/* Hub Button */}
            <button
              onClick={() => navigate('/showcase')}
              className="px-2.5 py-1 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-700/60 text-sky-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Về trang Showcase Hub"
            >
              <Grid3X3 className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">SHOWCASE HUB</span>
            </button>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
              <button
                onClick={handlePrevV2Screen}
                disabled={currentV2Screen ? currentV2Screen.index <= 1 : currentV1Screen.index <= 1}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Màn hình trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-1.5 font-bold text-sky-400">
                {currentV2Screen
                  ? `#${String(currentV2Screen.index).padStart(2, '0')}/39`
                  : `${currentV1Screen.code}/14`}
              </span>

              <button
                onClick={handleNextV2Screen}
                disabled={currentV2Screen ? currentV2Screen.index >= 39 : currentV1Screen.index >= 14}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Màn hình tiếp theo"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Jump to screen dropdown */}
            <select
              value={currentV2Screen ? `v2-${currentV2Screen.index}` : currentV1Screen.id}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('v2-')) {
                  const idx = parseInt(val.replace('v2-', ''), 10);
                  const s = getV2ScreenByIndex(idx);
                  if (s) navigate(s.route);
                } else {
                  const s = SCREENS_REGISTRY.find((x) => x.id === val);
                  if (s) {
                    const c = getStoredConcept(s.id);
                    navigate(s.route, { query: { concept: c } });
                  }
                }
              }}
              className="bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-sky-500 cursor-pointer max-w-[190px] sm:max-w-[260px] truncate"
            >
              <optgroup label="BlueSTEAM v2 (39 Màn Hình Chuẩn Mực)">
                {BLUESTEAM_V2_SCREENS.map((s) => (
                  <option key={`v2-${s.index}`} value={`v2-${s.index}`}>
                    #{String(s.index).padStart(2, '0')}. {s.name} ({s.route})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Concept Variants v1 (14 Màn Hình Di Sản)">
                {SCREENS_REGISTRY.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}. {s.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Center: Screen status & Visual Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentV2Screen ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800/60 text-sky-300 text-[11px]">
                    {currentV2Screen.squad}
                  </span>
                  {currentV2Screen.score && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" />
                      {currentV2Screen.score}/100
                    </span>
                  )}
                </div>

                {/* V2 Inspection Modal Button */}
                <button
                  onClick={() => setIsV2ModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-700/60 rounded-lg transition cursor-pointer"
                  title="Xem mockup gốc và ảnh chụp kiểm chứng"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Đối chiếu Mockup</span>
                </button>
              </>
            ) : (
              <>
                {/* Concept Switcher Buttons for V1 */}
                <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                  <span className="px-2 text-neutral-500 font-semibold uppercase text-[11px]">
                    Concept:
                  </span>
                  {currentV1Screen.variants.map((v) => {
                    const isSelected = currentConcept === v.key;
                    return (
                      <button
                        key={v.key}
                        onClick={() => handleConceptSelect(v.key)}
                        className={`px-2.5 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-sky-600 text-white font-semibold shadow-xs'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                        title={v.themeTitle}
                      >
                        <span>{v.key.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Reference Mockup Button for V1 */}
                <button
                  onClick={() => setIsMockupOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded-lg transition cursor-pointer"
                  title="Xem ảnh mockup gốc để kiểm chứng"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Mockup v1</span>
                </button>
              </>
            )}

            {/* Viewport Dimension */}
            <div className="hidden lg:flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
              <button
                onClick={() => handleViewportChange('desktop')}
                className={`p-1.5 rounded cursor-pointer ${
                  viewportMode === 'desktop' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Toàn màn hình Desktop"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleViewportChange('tablet')}
                className={`p-1.5 rounded cursor-pointer ${
                  viewportMode === 'tablet' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Khung nhìn Máy tính bảng (Học sinh)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleViewportChange('presentation')}
                className={`p-1.5 rounded cursor-pointer ${
                  viewportMode === 'presentation' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Khung nhìn Trình chiếu 16:9 (Lớp học)"
              >
                <Tv className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Collapse Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer flex items-center gap-1.5"
              title="Thu gọn thanh điều khiển"
            >
              <span className="text-[11px] text-neutral-400">Thu gọn</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
