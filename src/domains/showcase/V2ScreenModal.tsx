import { useState } from 'react';
import { V2ScreenMeta } from './v2ScreensData';
import { useRouter } from '../../app/router';
import { X, ExternalLink, Columns, Eye, Image as ImageIcon, CheckCircle2, Award } from 'lucide-react';

interface V2ScreenModalProps {
  screen: V2ScreenMeta;
  onClose: () => void;
}

export function V2ScreenModal({ screen, onClose }: V2ScreenModalProps) {
  const { navigate } = useRouter();
  const [viewMode, setViewMode] = useState<'screenshot' | 'reference' | 'split'>('screenshot');
  const [zoomLevel, setZoomLevel] = useState<1 | 1.25 | 1.5>(1);

  const screenshotUrl = '/' + screen.screenshotPath;
  const mockupUrl = screen.referencePath?.startsWith('artifacts/')
    ? '/' + screen.referencePath
    : screen.referencePath?.startsWith('docs/mockups/')
      ? '/mockups/' + screen.referencePath.slice('docs/mockups/'.length)
      : null;

  const handleOpenLiveRoute = () => {
    onClose();
    navigate(screen.route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-[#0c1a2e] border border-sky-800/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-sky-900/60 flex flex-wrap items-center justify-between gap-3 bg-[#071322]/90">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-500/40 text-sky-400 font-mono text-xs font-bold">
              #{String(screen.index).padStart(2, '0')} / 39
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-white">
                  {screen.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  VERIFIED
                </span>
                {screen.score && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-950 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    {screen.score}/100 Rubric
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {screen.squad} · {screen.squadName} · Route: <span className="text-sky-300">{screen.route}</span> · Viewport: {screen.viewport.width}x{screen.viewport.height}
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
              <button
                onClick={() => setViewMode('screenshot')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'screenshot'
                    ? 'bg-sky-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ảnh Nghiệm thu</span>
              </button>
              {mockupUrl && (
                <>
                  <button
                    onClick={() => setViewMode('reference')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'reference'
                        ? 'bg-sky-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Mockup Gốc</span>
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'split'
                        ? 'bg-sky-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>So sánh 2 bên</span>
                  </button>
                </>
              )}
            </div>

            {/* Action buttons */}
            <button
              onClick={handleOpenLiveRoute}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <span>Vào xem thực tế</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Image Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950/70 flex items-center justify-center">
          {viewMode === 'screenshot' && (
            <div className="max-w-full max-h-full flex flex-col items-center">
              <img
                src={screenshotUrl}
                alt={`Screenshot ${screen.name}`}
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                className="max-h-[64vh] object-contain rounded-2xl shadow-2xl border border-sky-900/50 transition-transform duration-200"
              />
              <p className="text-xs text-slate-400 mt-3 font-mono">
                Ảnh chụp Playwright kiểm thử thực tế tại {screen.viewport.width}x{screen.viewport.height}
              </p>
            </div>
          )}

          {viewMode === 'reference' && mockupUrl && (
            <div className="max-w-full max-h-full flex flex-col items-center">
              <img
                src={mockupUrl}
                alt={`Mockup gốc ${screen.name}`}
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                className="max-h-[64vh] object-contain rounded-2xl shadow-2xl border border-amber-900/50 transition-transform duration-200"
              />
              <p className="text-xs text-amber-400/90 mt-3 font-mono">
                Bản tham chiếu lịch sử: {screen.referencePath?.split('/').pop()}
              </p>
            </div>
          )}

          {viewMode === 'split' && mockupUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full h-full max-h-[68vh]">
              <div className="flex flex-col items-center bg-slate-900/40 p-3 rounded-2xl border border-sky-900/40 overflow-hidden">
                <span className="text-xs font-bold text-sky-400 mb-2 font-mono">GIAO DIỆN THỰC THI (VERIFIED SCREENSHOT)</span>
                <div className="flex-1 overflow-auto flex items-center justify-center">
                  <img src={screenshotUrl} alt="Implementation" className="max-h-[56vh] object-contain rounded-xl" />
                </div>
              </div>
              <div className="flex flex-col items-center bg-slate-900/40 p-3 rounded-2xl border border-amber-900/40 overflow-hidden">
                <span className="text-xs font-bold text-amber-400 mb-2 font-mono">MOCKUP DESIGN GỐC (REFERENCE PNG)</span>
                <div className="flex-1 overflow-auto flex items-center justify-center">
                  <img src={mockupUrl} alt="Reference Mockup" className="max-h-[56vh] object-contain rounded-xl" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="px-6 py-3 border-t border-sky-900/60 bg-[#071322] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            {screen.setupSteps.length > 0 && (
              <div className="max-w-xl truncate">
                <span className="text-slate-400 font-medium">Kịch bản:</span>{' '}
                <span className="text-slate-200">{screen.setupSteps.join(' · ')}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">Thu phóng:</span>
            <div className="inline-flex rounded-lg bg-slate-900 border border-slate-700 p-0.5">
              {[1, 1.25, 1.5].map((z) => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z as any)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                    zoomLevel === z ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {z}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
