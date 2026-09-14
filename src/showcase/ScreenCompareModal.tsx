import { useState } from 'react';
import { ScreenMeta, ConceptKey } from './registry';
import { useRouter } from '../app/router';
import {
  X,
  Columns,
  ExternalLink,
  Laptop,
} from 'lucide-react';

interface ScreenCompareModalProps {
  screen: ScreenMeta;
  onClose: () => void;
}

export function ScreenCompareModal({ screen, onClose }: ScreenCompareModalProps) {
  const { navigate } = useRouter();

  // For multi-variant screens
  const [activeTabConcept, setActiveTabConcept] = useState<ConceptKey>(screen.variants[0].key);
  const [layoutMode, setLayoutMode] = useState<'split' | 'tabs'>('split');

  const handleLaunchConcept = (concept: ConceptKey) => {
    onClose();
    navigate(screen.route, { query: { concept } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-[96vw] h-[94vh] bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        {/* Modal Top Header */}
        <div className="px-5 py-3 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-950">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-sky-900/60 text-sky-400 font-mono text-xs font-bold border border-sky-700/50">
              {screen.code}
            </span>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span>So sánh phương án: {screen.name}</span>
                <span className="text-xs font-normal text-sky-400 font-mono">
                  ({screen.variants.length} phương án)
                </span>
              </h3>
              <p className="text-xs text-neutral-400 hidden sm:block">
                Cả 2 phương án chạy runtime độc lập trong iframe. Bạn có thể tương tác trực tiếp trên từng khung nhìn.
              </p>
            </div>
          </div>

          {/* Controls: Mode Switch & Close */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-neutral-800 rounded-xl p-0.5 border border-neutral-700 text-xs">
              <button
                onClick={() => setLayoutMode('split')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  layoutMode === 'split'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Xem song song 2 bên"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Song song</span>
              </button>

              <button
                onClick={() => setLayoutMode('tabs')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  layoutMode === 'tabs'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Chuyển đổi theo tab"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theo Tab</span>
              </button>
            </div>

            {/* If in Tabs mode, render concept tab selector */}
            {layoutMode === 'tabs' && (
              <div className="flex items-center gap-1 bg-neutral-800 rounded-xl p-0.5 border border-neutral-700 text-xs">
                {screen.variants.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setActiveTabConcept(v.key)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      activeTabConcept === v.key
                        ? 'bg-sky-700 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer ml-1"
              title="Đóng (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 bg-neutral-950 p-2 sm:p-3 overflow-hidden">
          {layoutMode === 'split' ? (
            /* Split Screen Mode: side-by-side or stacked on tiny screens */
            <div className={`grid h-full gap-3 ${screen.variants.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
              {screen.variants.map((v) => (
                <div
                  key={v.key}
                  className="flex flex-col h-full bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-lg"
                >
                  {/* Pane Header */}
                  <div className="px-4 py-2 bg-neutral-850 border-b border-neutral-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span className="font-bold text-white">{v.label}</span>
                      <span className="text-neutral-400 text-[11px] truncate">({v.themeTitle})</span>
                    </div>

                    <button
                      onClick={() => handleLaunchConcept(v.key)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600/80 hover:bg-sky-600 text-white font-medium text-[11px] transition cursor-pointer shadow-xs shrink-0"
                    >
                      <span>Mở toàn màn hình</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Interactive Live Component iFrame */}
                  <div className="flex-1 relative bg-white overflow-hidden">
                    <iframe
                      src={`${screen.route}?concept=${v.key}`}
                      title={`${screen.name} - ${v.label}`}
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Tabbed Single Viewport Mode */
            <div className="flex flex-col h-full bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-lg">
              {(() => {
                const currentVar = screen.variants.find((v) => v.key === activeTabConcept) || screen.variants[0];
                return (
                  <>
                    <div className="px-4 py-2 bg-neutral-850 border-b border-neutral-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                        <span className="font-bold text-white text-sm">{currentVar.label}</span>
                        <span className="text-neutral-400">({currentVar.themeTitle})</span>
                      </div>

                      <button
                        onClick={() => handleLaunchConcept(currentVar.key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition cursor-pointer shadow-xs"
                      >
                        <span>Mở toàn màn hình {currentVar.label}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 relative bg-white overflow-hidden">
                      <iframe
                        src={`${screen.route}?concept=${currentVar.key}`}
                        title={`${screen.name} - ${currentVar.label}`}
                        className="w-full h-full border-0"
                      />
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
