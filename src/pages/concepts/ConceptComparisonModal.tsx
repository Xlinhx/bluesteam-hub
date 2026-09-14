import { useState } from 'react';
import { ConceptId, CONCEPTS } from './ConceptTypes';
import { X, Check, Eye, Maximize2, Layers } from 'lucide-react';

interface ConceptComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConcept: ConceptId;
  onSelectConcept: (conceptId: ConceptId) => void;
}

export function ConceptComparisonModal({
  isOpen,
  onClose,
  activeConcept,
  onSelectConcept,
}: ConceptComparisonModalProps) {
  const [selectedMockupPreview, setSelectedMockupPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-[#071521] border border-sky-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-900/60 bg-[#05111b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white tracking-wide">
                Bảng So Sánh Chi Tiết 3 Phương Án Landing Page
              </h2>
              <p className="text-xs font-sans text-sky-200/70">
                Đối chiếu trực tiếp cấu trúc, thị giác và luồng sư phạm theo ảnh reference gốc và thiết kế mockup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-sky-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng bảng so sánh"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - 3 Columns Side-by-Side */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(CONCEPTS) as ConceptId[]).map((cId) => {
              const concept = CONCEPTS[cId];
              const isCurrent = activeConcept === cId;

              return (
                <div
                  key={cId}
                  className={`flex flex-col rounded-xl border transition-all duration-200 overflow-hidden ${
                    isCurrent
                      ? 'border-sky-400 bg-sky-950/40 shadow-lg shadow-sky-900/30 ring-1 ring-sky-400/50'
                      : 'border-sky-900/50 bg-[#091b29]/70 hover:border-sky-700/80'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-sky-900/50 bg-[#051421]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                        Phương Án {concept.shortKey.toUpperCase()}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40">
                          <Check className="w-3 h-3" /> Đang chọn
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-serif font-bold text-white leading-snug">
                      {concept.title.split('—')[1]?.trim() || concept.title}
                    </h3>
                    <p className="text-xs text-sky-200/75 mt-0.5">{concept.subtitle}</p>
                  </div>

                  {/* Mockup Preview Thumbnail */}
                  <div className="relative group bg-[#020b12] border-b border-sky-900/50 aspect-[3/4] overflow-hidden">
                    <img
                      src={concept.mockupUrl}
                      alt={concept.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedMockupPreview(concept.mockupUrl)}
                        className="px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded text-xs font-mono flex items-center gap-1.5 backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Xem ảnh mockup</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectConcept(cId);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-sky-400 text-slate-950 font-bold'
                            : 'bg-sky-600 hover:bg-sky-500 text-white shadow'
                        }`}
                      >
                        {isCurrent ? 'Đang hiển thị' : 'Xem phương án này'}
                      </button>
                    </div>
                  </div>

                  {/* Spec Comparison Checklist */}
                  <div className="p-4 flex-1 space-y-3.5 text-xs">
                    <div>
                      <span className="font-mono text-[10px] text-sky-400 uppercase tracking-wider block">
                        Sinh vật chủ đạo (Hero)
                      </span>
                      <p className="text-slate-200 font-sans mt-0.5 leading-relaxed">
                        {concept.heroCreature}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-sky-900/40">
                      <span className="font-mono text-[10px] text-sky-400 uppercase tracking-wider block">
                        Trọng tâm sư phạm
                      </span>
                      <p className="text-slate-200 font-sans mt-0.5 leading-relaxed">
                        {concept.pedagogicalFocus}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-sky-900/40">
                      <span className="font-mono text-[10px] text-sky-400 uppercase tracking-wider block">
                        Ngôn ngữ thị giác & Bố cục
                      </span>
                      <p className="text-slate-200 font-sans mt-0.5 leading-relaxed">
                        {concept.visualLanguage}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-sky-900/40">
                      <span className="font-mono text-[10px] text-sky-400 uppercase tracking-wider block">
                        Tông màu chủ đạo
                      </span>
                      <p className="text-slate-300 font-sans mt-0.5 leading-relaxed">
                        {concept.colorScheme}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Select Action */}
                  <div className="p-3 border-t border-sky-900/50 bg-[#05111b]/80">
                    <button
                      onClick={() => {
                        onSelectConcept(cId);
                        onClose();
                      }}
                      className={`w-full py-2.5 px-4 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50'
                          : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Phương án đang mở</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Chuyển sang phương án này</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-sky-900/60 bg-[#040e16] text-xs font-mono text-sky-300/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Bạn có thể chuyển qua lại bất kỳ lúc nào qua thanh điều hướng phía trên</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-sky-900/60 hover:bg-sky-800 text-white transition-colors cursor-pointer"
          >
            Đóng bảng
          </button>
        </div>
      </div>

      {/* High-Res Mockup Image Fullscreen Lightbox */}
      {selectedMockupPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95">
          <div className="relative max-w-4xl max-h-[95vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedMockupPreview(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
              title="Đóng bản phóng to"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="overflow-auto max-h-[85vh] rounded-xl border border-sky-700/50">
              <img
                src={selectedMockupPreview}
                alt="Mockup phóng to"
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="mt-3 text-xs font-mono text-sky-300">
              Ảnh mockup thiết kế chi tiết (Độ phân giải đầy đủ)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
