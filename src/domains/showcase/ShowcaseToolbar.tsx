import { useState } from 'react';
import { useRouter } from '../../app/router';
import { BLUESTEAM_V2_SCREENS, getV2ScreenByRoute, getV2ScreenByIndex } from './v2ScreensData';
import { V2ScreenModal } from './V2ScreenModal';
import { ChevronLeft, ChevronRight, Eye, Grid3X3, ChevronDown, ChevronUp, Monitor, Smartphone, Tv } from 'lucide-react';

export type ViewportMode = 'desktop' | 'tablet' | 'presentation';
interface ShowcaseToolbarProps {
  viewportMode?: ViewportMode;
  onViewportChange?: (mode: ViewportMode) => void;
}

export function ShowcaseToolbar({ viewportMode: controlledViewport, onViewportChange }: ShowcaseToolbarProps = {}) {
  const { currentPath, navigate } = useRouter();
  const [internalViewport, setInternalViewport] = useState<ViewportMode>('desktop');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentScreen = getV2ScreenByRoute(currentPath);
  const viewportMode = controlledViewport || internalViewport;
  const changeViewport = (mode: ViewportMode) => {
    setInternalViewport(mode);
    onViewportChange?.(mode);
  };
  const openScreen = (index: number) => {
    const screen = getV2ScreenByIndex(index);
    if (screen) { setIsModalOpen(false); navigate(screen.route, { query: { showcase: '1' } }); }
  };

  if (isCollapsed) return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => setIsCollapsed(false)} title="Mở thanh điều khiển Showcase"
        className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900/95 text-white text-xs font-mono rounded-full shadow-2xl border border-sky-700/60 cursor-pointer">
        <Grid3X3 className="w-4 h-4 text-sky-400" />
        <span>{currentScreen ? '#' + currentScreen.index + '/39 · ' + currentScreen.name : 'Showcase'}</span>
        <ChevronUp className="w-4 h-4" />
      </button>
    </div>
  );

  return <>
    {isModalOpen && currentScreen && <V2ScreenModal screen={currentScreen} onClose={() => setIsModalOpen(false)} />}
    <aside aria-label="Ocean Showcase Controller" className="fixed bottom-3 inset-x-4 max-w-6xl mx-auto z-50 bg-neutral-950/95 text-neutral-200 border border-sky-900/60 rounded-2xl px-4 py-2 text-xs font-mono shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/showcase')} title="Về Showcase" className="p-2 cursor-pointer"><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => openScreen((currentScreen?.index || 1) - 1)} disabled={!currentScreen || currentScreen.index <= 1} title="Màn hình trước" className="p-2 disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
          <select aria-label="Chọn màn hình" value={currentScreen?.index || ''} onChange={e => openScreen(Number(e.target.value))} className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 max-w-[260px]">
            <option value="" disabled>Chọn màn hình</option>
            {BLUESTEAM_V2_SCREENS.map(screen => <option key={screen.reviewId} value={screen.index}>{screen.index}. {screen.name}</option>)}
          </select>
          <button onClick={() => openScreen((currentScreen?.index || 39) + 1)} disabled={!currentScreen || currentScreen.index >= BLUESTEAM_V2_SCREENS.length} title="Màn hình tiếp theo" className="p-2 disabled:opacity-30 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsModalOpen(true)} disabled={!currentScreen} className="flex items-center gap-1.5 px-3 py-1 border border-sky-700/60 rounded-lg disabled:opacity-30 cursor-pointer"><Eye className="w-4 h-4" />Đối chiếu ảnh lịch sử</button>
          <div className="hidden lg:flex gap-1">
            <button onClick={() => changeViewport('desktop')} aria-pressed={viewportMode === 'desktop'} title="Desktop" className="p-2 cursor-pointer"><Monitor className="w-4 h-4" /></button>
            <button onClick={() => changeViewport('tablet')} aria-pressed={viewportMode === 'tablet'} title="Tablet" className="p-2 cursor-pointer"><Smartphone className="w-4 h-4" /></button>
            <button onClick={() => changeViewport('presentation')} aria-pressed={viewportMode === 'presentation'} title="Trình chiếu" className="p-2 cursor-pointer"><Tv className="w-4 h-4" /></button>
          </div>
          <button onClick={() => setIsCollapsed(true)} title="Thu gọn" className="p-2 cursor-pointer"><ChevronDown className="w-4 h-4" /></button>
        </div>
      </div>
    </aside>
  </>;
}
