import { useState } from 'react';
import { ScreenMeta, ConceptKey } from './registry';
import { X, ExternalLink, Check } from 'lucide-react';

interface MockupModalProps {
  screen: ScreenMeta;
  initialConcept?: ConceptKey;
  onClose: () => void;
}

export function MockupModal({ screen, initialConcept = 'a', onClose }: MockupModalProps) {
  const [selectedConcept, setSelectedConcept] = useState<ConceptKey>(() => {
    if (screen.variants.some((v) => v.key === initialConcept)) {
      return initialConcept;
    }
    return screen.defaultVariant;
  });
  const [zoomLevel, setZoomLevel] = useState<1 | 1.5 | 2>(1);

  const activeVariant = screen.variants.find((v) => v.key === selectedConcept) || screen.variants[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-900/60 text-sky-400 font-mono text-xs font-bold border border-sky-700/50">
                {screen.code}
              </span>
              <h3 className="font-serif font-bold text-lg text-white">
                Mockup tham chiếu: {screen.name}
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Ảnh reference gốc được cắt chính xác từ visual design để đối soát giao diện thật.
            </p>
          </div>

          {/* Concept Tabs if multiple */}
          <div className="flex items-center gap-2">
            {screen.variants.length > 1 && (
              <div className="inline-flex rounded-xl bg-neutral-900 p-1 border border-neutral-700">
                {screen.variants.map((v) => {
                  const isActive = v.key === selectedConcept;
                  return (
                    <button
                      key={v.key}
                      onClick={() => setSelectedConcept(v.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-sky-600 text-white font-semibold shadow-sm'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <span>{v.label}</span>
                      {isActive && <Check className="w-3 h-3 text-sky-200" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-neutral-800 rounded-lg p-1 border border-neutral-700 text-xs">
              <button
                onClick={() => setZoomLevel(1)}
                className={`px-2 py-1 rounded cursor-pointer ${zoomLevel === 1 ? 'bg-neutral-700 text-white' : 'text-neutral-400'}`}
                title="100% Fit"
              >
                1x
              </button>
              <button
                onClick={() => setZoomLevel(1.5)}
                className={`px-2 py-1 rounded cursor-pointer ${zoomLevel === 1.5 ? 'bg-neutral-700 text-white' : 'text-neutral-400'}`}
                title="150% Zoom"
              >
                1.5x
              </button>
              <button
                onClick={() => setZoomLevel(2)}
                className={`px-2 py-1 rounded cursor-pointer ${zoomLevel === 2 ? 'bg-neutral-700 text-white' : 'text-neutral-400'}`}
                title="200% Zoom"
              >
                2x
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
              title="Đóng cửa sổ (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Variant Info Pill */}
        <div className="px-6 py-2 bg-neutral-950/40 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-sky-400 font-semibold">{activeVariant.label}:</span>
            <span className="text-neutral-300">{activeVariant.themeTitle}</span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-500">{activeVariant.referenceCropFile}</span>
          </div>
          <a
            href={`/${activeVariant.referenceCropFile}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition"
          >
            <span>Mở ảnh trong tab mới</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Scrollable Image Viewport */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-neutral-950 flex items-center justify-center">
          <div
            className="transition-all duration-200 shadow-2xl rounded-lg overflow-hidden border border-neutral-800"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              maxWidth: zoomLevel === 1 ? '100%' : 'none',
            }}
          >
            <img
              src={`/${activeVariant.referenceCropFile}`}
              alt={`${screen.name} - ${activeVariant.label}`}
              className="w-auto h-auto max-h-[75vh] object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
