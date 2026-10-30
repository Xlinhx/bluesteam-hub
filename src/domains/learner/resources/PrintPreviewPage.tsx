import { useState } from 'react';
import { useRouter } from '../../../app/router';
import { LearnerShell } from '../../../shared/shells/LearnerShell';
import { oceanAudio } from '../../../shared/audio/oceanAudio';
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

      {/* Main Page Container with Ocean Ambient Atmosphere */}
      <div className="relative min-h-[calc(100vh-72px)] bg-gradient-to-b from-[#F2F8F9] via-[#FAF8F5] to-[#EBF5F8] text-[#102A38] font-sans select-none px-6 lg:px-12 py-8 overflow-hidden">
        {/* AMBIENT OCEAN DECORATIONS (Outside Cards - 2 Sides & Bottom) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          {/* Left ambient: Soft sea-kelp silhouette & bubbles */}
          <div className="absolute left-0 top-1/4 -translate-x-6 opacity-15 text-[#17657A]">
            <svg className="w-48 h-96" viewBox="0 0 100 200" fill="currentColor">
              <path d="M20 200 C 15 150, 45 120, 25 70 C 15 40, 35 15, 20 0 C 10 20, 0 50, 5 90 C 10 130, -5 160, 20 200 Z" />
              <path d="M50 200 C 40 140, 70 100, 55 50 C 45 20, 60 5, 50 0 C 40 15, 30 45, 35 80 C 40 120, 25 155, 50 200 Z" opacity="0.7" />
              <path d="M75 200 C 70 160, 90 130, 80 80 C 70 50, 85 20, 75 0 C 65 20, 55 50, 60 90 C 65 130, 50 165, 75 200 Z" opacity="0.5" />
            </svg>
          </div>
          {/* Left floating bubbles */}
          <div className="absolute left-10 top-36 w-4 h-4 rounded-full border-2 border-[#17657A]/20 bg-white/30 backdrop-blur-xs animate-pulse" />
          <div className="absolute left-20 top-64 w-2.5 h-2.5 rounded-full border border-[#2EE6CA]/30 bg-teal-100/20" />
          <div className="absolute left-8 bottom-48 w-6 h-6 rounded-full border-2 border-[#17657A]/15 bg-white/20" />

          {/* Right ambient: Coral reef silhouettes & schooling fish */}
          <div className="absolute right-0 bottom-0 translate-x-4 opacity-15 text-[#17657A]">
            <svg className="w-56 h-72" viewBox="0 0 160 200" fill="currentColor">
              <path d="M40 200 C 45 160, 30 130, 50 90 C 60 70, 45 40, 55 10 C 65 30, 80 50, 75 80 C 85 110, 65 140, 80 200 Z" />
              <path d="M100 200 C 105 150, 90 120, 115 80 C 125 60, 110 30, 125 0 C 135 25, 145 50, 135 85 C 145 115, 125 150, 140 200 Z" opacity="0.8" />
              <path d="M140 200 C 135 170, 150 140, 145 110 C 140 85, 155 60, 150 30 C 158 50, 160 80, 155 115 C 150 145, 160 170, 160 200 Z" opacity="0.6" />
            </svg>
          </div>
          {/* Right swimming fish silhouettes */}
          <div className="absolute right-12 top-40 opacity-20 text-[#17657A]">
            <svg className="w-24 h-14" viewBox="0 0 100 60" fill="currentColor">
              <path d="M10 20 Q 30 10, 50 20 Q 30 30, 10 20 Z M 10 20 L 0 12 L 0 28 Z" />
              <path d="M45 38 Q 60 30, 75 38 Q 60 46, 45 38 Z M 45 38 L 38 32 L 38 44 Z" opacity="0.8" />
              <path d="M65 15 Q 78 7, 90 15 Q 78 23, 65 15 Z M 65 15 L 59 10 L 59 20 Z" opacity="0.6" />
            </svg>
          </div>
          {/* Right floating bubbles */}
          <div className="absolute right-16 top-28 w-5 h-5 rounded-full border-2 border-[#2EE6CA]/25 bg-teal-100/20" />
          <div className="absolute right-24 bottom-60 w-3 h-3 rounded-full border border-[#17657A]/20 bg-white/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto space-y-8">
          {/* Breadcrumbs */}
          <div className="no-print flex items-center justify-between text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="hover:text-[#17657A] cursor-pointer flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Trang chủ</span>
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

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-[#17657A]/15 text-[#17657A] text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#2EE6CA]" />
              Xưởng sáng tạo thủ công
            </span>
          </div>

          {/* Page Heading with Ocean Accent */}
          <div className="no-print space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#102A38] tracking-[-0.02em]">
                In và tô màu đại dương
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Những tranh vẽ về sinh vật biển giúp em khám phá đại dương qua sắc màu.
            </p>
          </div>

          {/* 3-Column Center Stage: Thumbnails (col-2) + A4 Sheet (col-6) + Controls (col-4) */}
          {/* 3-Column Balanced Stage: Thumbnails (col-2) + A4 Sheet (col-5) + Controls (col-5) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Page Thumbnails (col-span-2) */}
            <div className="no-print lg:col-span-2 flex flex-col gap-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
                Danh sách trang ({selectedPage}/2)
              </span>

              {/* Page 1 Thumbnail */}
              <div
                onClick={() => setSelectedPage(1)}
                className={`p-3 rounded-2xl bg-white shadow-xs border transition-all cursor-pointer flex flex-col items-center gap-2 hover:-translate-y-0.5 ${
                  selectedPage === 1
                    ? 'border-2 border-[#17657A] ring-2 ring-[#17657A]/20 shadow-md bg-sky-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-full h-32 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-1 relative">
                  <img
                    src="/assets/generated/craft/octopus_coloring_lineart.jpg"
                    alt="Trang 1: Bạch tuộc"
                    className="w-full h-full object-contain"
                  />
                  {selectedPage === 1 && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#17657A] text-white flex items-center justify-center text-[10px] font-black">
                      ✓
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-xs font-black text-[#102A38] block">Trang 1</span>
                  <span className="text-[10px] text-slate-400 font-medium">Bạch tuộc đại dương</span>
                </div>
              </div>

              {/* Page 2 Thumbnail */}
              <div
                onClick={() => setSelectedPage(2)}
                className={`p-3 rounded-2xl bg-white shadow-xs border transition-all cursor-pointer flex flex-col items-center gap-2 hover:-translate-y-0.5 ${
                  selectedPage === 2
                    ? 'border-2 border-[#17657A] ring-2 ring-[#17657A]/20 shadow-md bg-sky-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-full h-32 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-1 relative">
                  <img
                    src="/assets/generated/craft/coral_coloring_lineart.jpg"
                    alt="Trang 2: Rạn san hô"
                    className="w-full h-full object-contain"
                  />
                  {selectedPage === 2 && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#17657A] text-white flex items-center justify-center text-[10px] font-black">
                      ✓
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-xs font-black text-[#102A38] block">Trang 2</span>
                  <span className="text-[10px] text-slate-400 font-medium">Vườn san hô nhiệt đới</span>
                </div>
              </div>
            </div>

            {/* Center A4 Sheet Preview (col-span-5) */}
            <div className="lg:col-span-5 flex justify-center items-start">
              <div
                id="printable-sheet"
                className="w-full bg-white rounded-[28px] shadow-[0_12px_36px_rgba(18,56,75,0.12)] border border-[#17657A]/20 p-6 sm:p-7 flex flex-col justify-between aspect-[1/1.414] ring-1 ring-black/5 relative overflow-hidden transition-all duration-300"
              >
                {/* Subtle top ocean strip on preview paper */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#17657A] via-[#2EE6CA] to-[#F67650]" />

                {/* Printable Header */}
                <div className="border-b-2 border-dashed border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <span className="font-serif font-black text-sm text-[#102A38] uppercase tracking-wider block">
                      BlueSTEAM • Sinh vật biển
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold">
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
                    className="w-full h-full object-contain max-h-[460px] filter contrast-105"
                  />
                </div>

                {/* Printable Footer */}
                <div className="border-t-2 border-dashed border-slate-200 pt-2 flex items-center justify-between text-[9px] text-slate-400 font-bold">
                  <span>Khám phá đại dương xanh • BlueSTEAM v2</span>
                  <span>Trang {selectedPage} / 2</span>
                </div>
              </div>
            </div>

            {/* Right Action & Print Settings (col-span-5) - Structured, Squared corners, matches height & occupies area per user mockup */}
            <div className="no-print lg:col-span-5 rounded-2xl bg-white shadow-[0_12px_36px_rgba(18,56,75,0.08)] border border-[#17657A]/20 p-6 sm:p-7 flex flex-col justify-between space-y-6 relative overflow-hidden">
              {/* Subtle oceanic accent bar at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#17657A] via-[#2EE6CA] to-[#17657A]" />

              <div className="space-y-5">
                {/* Header matching user uploaded mockup image */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 shadow-xs border border-rose-100/80">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-2xl text-[#102A38] tracking-tight">
                      Tranh tô màu đại dương
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Tải về hoặc in trực tiếp để cùng tô màu và khám phá thế giới biển.
                    </p>
                  </div>
                </div>

                {/* Primary & Secondary Action Buttons */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full py-3.5 rounded-xl bg-[#17657A] hover:bg-[#125061] text-white font-black text-sm shadow-md flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95"
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
                    className="w-full py-3.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#17657A]/25 text-[#102A38] font-black text-sm shadow-xs flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Printer className="w-4 h-4 text-[#17657A]" />
                    <span>In tài liệu</span>
                  </button>
                </div>

                {/* Print Options Section matching Mockup */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                    Tùy chọn in
                  </span>

                  {/* Paper Size Option */}
                  <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-[#102A38] bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Khổ A4 (210 × 297 mm)</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  {/* Color Mode Option */}
                  <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-[#102A38] bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center text-[8px] font-black">
                        ◐
                      </div>
                      <span>Đen trắng (Tiết kiệm mực)</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Educational Print Specs & Quality Guarantee (fills height proportionally) */}
                <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">Chất lượng nét in:</span>
                    <span className="font-bold text-[#17657A]">300 DPI Vector nét cao</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">Giấy đề xuất:</span>
                    <span className="font-bold text-[#102A38]">Giấy vẽ A4 (80 - 120 gsm)</span>
                  </div>
                </div>
              </div>

              {/* Bottom: Helpful Tip Callout matching user's uploaded mockup */}
              <div className="p-4 rounded-xl bg-[#EDF6F8] border border-[#17657A]/15 flex items-start gap-3">
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
