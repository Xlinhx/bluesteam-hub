import { useState } from 'react';
import { useRouter } from '../../app/router';
import { LearnerShell } from '../../shells/LearnerShell';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  Home,
  Download,
  Printer,
  ChevronDown,
  Info,
  FileText,
  Palette,
  CheckCircle,
} from 'lucide-react';

export function PrintPreviewPage() {
  const { navigate } = useRouter();
  const [selectedPage, setSelectedPage] = useState<1 | 2>(1);
      const [isDownloaded, setIsDownloaded] = useState(false);

  const handlePrint = () => {
    oceanAudio.playChime(659.25, 0.15);
    window.print();
  };

  const handleDownload = () => {
    oceanAudio.playChime(523.25, 0.2);
    setIsDownloaded(true);
    // Simulate instant PDF file generation and download trigger
    const link = document.createElement('a');
    link.href =
      selectedPage === 1
        ? '/assets/generated/craft/octopus_coloring_lineart.jpg'
        : '/assets/generated/craft/coral_coloring_lineart.jpg';
    link.download = `bluesteam-tranh-to-mau-trang-${selectedPage}.jpg`;
    link.click();

    setTimeout(() => setIsDownloaded(false), 3000);
  };

  return (
    <LearnerShell activeNav="resources">
      {/* Print Specific CSS ensuring exact A4 page export without shell noise */}
      <style>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header, nav, aside, footer, .no-print, button {
            display: none !important;
          }
          #printable-sheet {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 10mm !important;
          }
        }
      `}</style>

      <div className="min-h-[calc(100vh-72px)] bg-[#FAF8F5] text-[#102A38] font-sans select-none px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumbs */}
          <div className="no-print flex items-center gap-2 text-xs font-bold text-slate-500">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="hover:text-[#17657A] cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
            <span>›</span>
            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="hover:text-[#17657A] cursor-pointer"
            >
              Học liệu
            </button>
            <span>›</span>
            <span className="text-[#102A38] font-black">In và tô màu</span>
          </div>

          {/* Page Heading */}
          <div className="no-print space-y-1">
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#102A38] tracking-[-0.02em]">
              In và tô màu
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Những tranh vẽ về sinh vật biển giúp em khám phá đại dương qua sắc màu.
            </p>
          </div>

          {/* 3-Column Center Stage: Thumbnails (col-2) + A4 Sheet (col-6) + Controls (col-4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Page Thumbnails (col-span-2) */}
            <div className="no-print lg:col-span-2 flex flex-col gap-4">
              {/* Page 1 Thumbnail */}
              <div
                onClick={() => setSelectedPage(1)}
                className={`p-2.5 rounded-[24px] bg-white shadow-xs border transition-all cursor-pointer flex flex-col items-center gap-2 hover:-translate-y-0.5 ${
                  selectedPage === 1
                    ? 'border-2 border-[#17657A] ring-2 ring-[#17657A]/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-full h-32 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-1">
                  <img
                    src="/assets/generated/craft/octopus_coloring_lineart.jpg"
                    alt="Trang 1: Bạch tuộc"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-black text-[#102A38]">Trang 1</span>
              </div>

              {/* Page 2 Thumbnail */}
              <div
                onClick={() => setSelectedPage(2)}
                className={`p-2.5 rounded-[24px] bg-white shadow-xs border transition-all cursor-pointer flex flex-col items-center gap-2 hover:-translate-y-0.5 ${
                  selectedPage === 2
                    ? 'border-2 border-[#17657A] ring-2 ring-[#17657A]/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-full h-32 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-1">
                  <img
                    src="/assets/generated/craft/coral_coloring_lineart.jpg"
                    alt="Trang 2: Rạn san hô"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-black text-[#102A38]">Trang 2</span>
              </div>
            </div>

            {/* Center A4 Sheet Preview (col-span-6) */}
            <div className="lg:col-span-6 flex justify-center">
              <div
                id="printable-sheet"
                className="w-full max-w-md bg-white rounded-[28px] shadow-[0_16px_48px_rgba(18,56,75,0.12)] border border-[#17657A]/15 p-6 flex flex-col justify-between aspect-[1/1.414]"
              >
                {/* Printable Header */}
                <div className="border-b-2 border-dashed border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <span className="font-serif font-black text-sm text-[#102A38] uppercase tracking-wider block">
                      BlueSTEAM • Sinh vật biển
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {selectedPage === 1 ? 'Bạch tuộc đại dương' : 'Khu vườn san hô nhiệt đới'}
                    </span>
                  </div>

                  <div className="text-right text-[10px] text-slate-400 font-mono">
                    Tên: .......................................
                  </div>
                </div>

                {/* Printable High-Resolution Art */}
                <div className="my-auto py-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      selectedPage === 1
                        ? '/assets/generated/craft/octopus_coloring_lineart.jpg'
                        : '/assets/generated/craft/coral_coloring_lineart.jpg'
                    }
                    alt={selectedPage === 1 ? 'Bạch tuộc tô màu' : 'Rạn san hô tô màu'}
                    className="w-full h-full object-contain max-h-[460px]"
                  />
                </div>

                {/* Printable Footer */}
                <div className="border-t-2 border-dashed border-slate-200 pt-2 flex items-center justify-between text-[9px] text-slate-400 font-bold">
                  <span>Khám phá đại dương xanh • BlueSTEAM v2</span>
                  <span>Trang {selectedPage} / 2</span>
                </div>
              </div>
            </div>

            {/* Right Action & Print Settings (col-span-4) */}
            <div className="no-print lg:col-span-4 rounded-[32px] bg-white shadow-[0_8px_30px_rgba(18,56,75,0.08)] border border-[#17657A]/15 p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 shadow-xs">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-xl text-[#102A38]">
                    Tranh tô màu đại dương
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Tải về hoặc in trực tiếp để cùng tô màu và khám phá thế giới biển.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full py-3.5 rounded-2xl bg-[#17657A] hover:bg-[#125061] text-white font-black text-sm shadow-md flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95"
                >
                  {isDownloaded ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      <span>Đã tải xuống!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Tải bản in</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-[#102A38] font-black text-sm shadow-xs flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4 text-[#17657A]" />
                  <span>In tài liệu</span>
                </button>
              </div>

              {/* Print Options */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                  Tùy chọn in
                </span>

                {/* Paper Size Option */}
                <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-[#102A38] bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Khổ A4 (210 × 297 mm)</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>

                {/* Color Mode Option */}
                <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-[#102A38] bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-[8px] font-black">
                      ◐
                    </div>
                    <span>Đen trắng (Tiết kiệm mực)</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Helpful Tip Callout */}
              <div className="p-4 rounded-2xl bg-[#EDF6F8] border border-[#17657A]/15 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#17657A] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-[#102A38] block">Mẹo nhỏ</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    In ở chế độ đen trắng để tiết kiệm mực và giúp các bé dễ tô viền các nét vẽ hơn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
