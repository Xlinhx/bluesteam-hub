import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from '../../app/router';
import { useI18n } from '../../shared/i18n/I18nContext';
import { ActivityShell } from '../../shells/ActivityShell';
import { creativeStorage, CreativeArtwork } from '../../services/creativeStorage';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  drawCrayonStroke,
  drawEraserStroke,
  drawMarineStamp,
  floodFill,
  DrawingTool,
  MarineStampType,
  Point
} from './drawing_engine';
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Save, 
  Paintbrush, 
  Eraser, 
  PaintBucket, 
  Star, 
  ChevronUp, 
  Play,
  Download,
  RotateCcw,
  Sparkles,
  Check,
  Palette
} from 'lucide-react';

interface ColoringTemplate {
  id: string;
  nameVi: string;
  nameEn: string;
  imageSrc: string;
}

const TEMPLATES: ColoringTemplate[] = [
  {
    id: 'turtle',
    nameVi: 'Rùa Xanh',
    nameEn: 'Sea Turtle',
    imageSrc: '/assets/generated/craft/turtle_coloring_lineart.jpg',
  },
  {
    id: 'octopus',
    nameVi: 'Bạch tuộc',
    nameEn: 'Octopus',
    imageSrc: '/assets/generated/craft/octopus_coloring_lineart.jpg',
  },
  {
    id: 'coral',
    nameVi: 'Rạn san hô',
    nameEn: 'Coral Reef',
    imageSrc: '/assets/generated/craft/coral_coloring_lineart.jpg',
  },
  {
    id: 'blank',
    nameVi: 'Trang giấy trắng',
    nameEn: 'Blank Paper',
    imageSrc: '',
  },
];

export function CreativeDrawingPage() {
  const { navigate } = useRouter();
  const { locale } = useI18n();

  // Canvas & Interaction state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<Point | null>(null);

  // Tools & Styling
  const [activeTool, setActiveTool] = useState<DrawingTool>('brush');
  const [selectedStamp, setSelectedStamp] = useState<MarineStampType>('starfish');
  const [selectedColor, setSelectedColor] = useState('#1E7E48'); // Living Ocean dark green default
  const [brushSize, setBrushSize] = useState<number>(3); // 1 to 5 (maps to 4, 8, 14, 22, 32px)
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<ColoringTemplate>(TEMPLATES[0]);

  // Undo / Redo history
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Palette: 14 Living Ocean hues
  const colors = [
    '#1A1A1A', // Black
    '#7F8C8D', // Slate Grey
    '#8D5524', // Shell Brown
    '#E74C3C', // Coral Red
    '#F67650', // BlueSTEAM Coral
    '#E67E22', // Sunlight Amber
    '#F1C40F', // Beach Sand Yellow
    '#82C91E', // Seagrass Lime
    '#1E7E48', // Deep Forest Green
    '#2EE6CA', // BlueSTEAM Reef Teal
    '#4DABF7', // Sky Aqua
    '#1C7ED6', // Ocean Deep Blue
    '#7950F2', // Twilight Purple
    '#FFFFFF', // Wave Foam White
  ];

  // Map brush size index (1-5) to actual pixel widths
  const sizeMap: Record<number, number> = {
    1: 4,
    2: 8,
    3: 14,
    4: 22,
    5: 32,
  };

  const currentStrokeWidth = sizeMap[brushSize] || 14;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Push state to undo stack
  const pushHistoryState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Truncate future if user was in middle of stack
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(imgData);
    if (newHistory.length > 25) {
      newHistory.shift();
    }
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;

    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  // Initialize Canvas & Template
  const initCanvasWithTemplate = useCallback((template: ColoringTemplate, clearHistory = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set ivory textured paper color
    ctx.fillStyle = '#FAF7F0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (template.imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = template.imageSrc;
      img.onload = () => {
        // Draw template lineart centered maintaining aspect ratio
        const scale = Math.min((canvas.width * 0.9) / img.width, (canvas.height * 0.9) / img.height);
        const nw = img.width * scale;
        const nh = img.height * scale;
        const nx = (canvas.width - nw) / 2;
        const ny = (canvas.height - nh) / 2;

        ctx.drawImage(img, nx, ny, nw, nh);
        if (clearHistory) {
          historyRef.current = [];
          historyIndexRef.current = -1;
          pushHistoryState();
        }
      };
    } else {
      if (clearHistory) {
        historyRef.current = [];
        historyIndexRef.current = -1;
        pushHistoryState();
      }
    }
  }, [pushHistoryState]);

  // Resize canvas according to container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const targetW = Math.floor(rect.width);
      const targetH = Math.floor(rect.height);

      if (targetW > 50 && targetH > 50 && (canvas.width !== targetW || canvas.height !== targetH)) {
        // Save current canvas content before resize
        let prevData: ImageData | null = null;
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          try {
            prevData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          } catch (e) {
            // ignore
          }
        }

        canvas.width = targetW;
        canvas.height = targetH;

        if (prevData && ctx) {
          ctx.fillStyle = '#FAF7F0';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.putImageData(prevData, 0, 0);
        } else {
          initCanvasWithTemplate(activeTemplate, false);
        }
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [activeTemplate, initCanvasWithTemplate]);

  // Check URL params for template or saved artwork ID
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const templateParam = params.get('template');
    const idParam = params.get('id');

    if (idParam) {
      creativeStorage.getArtworkById(idParam).then((art) => {
        if (art && art.previewDataUrl) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const img = new Image();
          img.src = art.previewDataUrl;
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            pushHistoryState();
          };
        }
      });
    } else if (templateParam) {
      const matched = TEMPLATES.find((t) => t.id === templateParam);
      if (matched) {
        setActiveTemplate(matched);
        initCanvasWithTemplate(matched, true);
      }
    } else {
      // Default template is turtle
      initCanvasWithTemplate(TEMPLATES[0], true);
    }
  }, [initCanvasWithTemplate, pushHistoryState]);

  // Pointer coordinate calculation
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    const pt = getCoordinates(e);

    if (activeTool === 'bucket') {
      floodFill(ctx, Math.floor(pt.x), Math.floor(pt.y), selectedColor, canvas.width, canvas.height);
      pushHistoryState();
      oceanAudio.playChime(660, 0.4);
      return;
    }

    if (activeTool === 'stamp') {
      drawMarineStamp(ctx, pt, selectedStamp, selectedColor, brushSize / 2.5);
      pushHistoryState();
      oceanAudio.playChime(880, 0.3);
      return;
    }

    setIsDrawing(true);
    lastPointRef.current = pt;

    // Single click dot
    if (activeTool === 'brush') {
      drawCrayonStroke(ctx, pt, pt, selectedColor, currentStrokeWidth);
    } else if (activeTool === 'eraser') {
      drawEraserStroke(ctx, pt, pt, currentStrokeWidth * 1.5);
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPt = getCoordinates(e);

    if (activeTool === 'brush') {
      drawCrayonStroke(ctx, lastPointRef.current, currentPt, selectedColor, currentStrokeWidth);
    } else if (activeTool === 'eraser') {
      drawEraserStroke(ctx, lastPointRef.current, currentPt, currentStrokeWidth * 1.5);
    }

    lastPointRef.current = currentPt;
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPointRef.current = null;
      pushHistoryState();
    }
  };

  // Undo Handler
  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyIndexRef.current -= 1;
    const prevData = historyRef.current[historyIndexRef.current];
    if (prevData) {
      ctx.putImageData(prevData, 0, 0);
    }
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyIndexRef.current += 1;
    const nextData = historyRef.current[historyIndexRef.current];
    if (nextData) {
      ctx.putImageData(nextData, 0, 0);
    }
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  // Clear Canvas Handler
  const handleClearCanvas = () => {
    if (confirm(locale === 'vi' ? 'Bé có muốn xóa hết để vẽ lại không?' : 'Clear canvas to start over?')) {
      initCanvasWithTemplate(activeTemplate, false);
      pushHistoryState();
      oceanAudio.playChime(440, 0.4);
      showToast(locale === 'vi' ? 'Đã làm sạch trang vẽ!' : 'Canvas cleared!');
    }
  };

  // Save Artwork to IndexedDB / creativeStorage
  const handleSaveArtwork = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSaving(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const newArtwork: CreativeArtwork = {
        id: `drawing-${Date.now()}`,
        type: 'drawing',
        title: locale === 'vi' ? `Tranh vẽ của An (${activeTemplate.nameVi})` : `An's Drawing (${activeTemplate.nameEn})`,
        createdAt: Date.now(),
        previewDataUrl: dataUrl,
        drawingData: {
          template: activeTemplate.id,
          canvasDataUrl: dataUrl,
        },
      };

      await creativeStorage.saveArtwork(newArtwork);
      oceanAudio.playChime(784, 0.6);
      showToast(locale === 'vi' ? '🎉 Đã lưu tranh vào bộ sưu tập của bé!' : '🎉 Saved to collection!');
    } catch (err) {
      console.error('Error saving artwork:', err);
      showToast(locale === 'vi' ? 'Lưu chưa thành công, bé thử lại nhé!' : 'Save failed, please retry!');
    } finally {
      setIsSaving(false);
    }
  };

  // Download PNG file
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `bluesteam-tranh-cua-an-${Date.now()}.png`;
    a.click();
    showToast(locale === 'vi' ? '📥 Đang tải ảnh về máy...' : '📥 Downloading image...');
  };

  // Custom right controls inside ActivityShell header
  const customHeaderRight = (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Undo Button - >= 48px on mobile, >= 56px touch target compliant */}
      <button
        type="button"
        onClick={handleUndo}
        disabled={!canUndo}
        aria-label="Undo"
        className={`p-2.5 rounded-2xl flex items-center justify-center min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] transition-all cursor-pointer ${
          canUndo
            ? 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
            : 'bg-white/5 text-white/30 cursor-not-allowed'
        }`}
        title={locale === 'vi' ? 'Hoàn tác' : 'Undo'}
      >
        <Undo2 className="w-5 h-5" />
      </button>

      {/* Redo Button */}
      <button
        type="button"
        onClick={handleRedo}
        disabled={!canRedo}
        aria-label="Redo"
        className={`p-2.5 rounded-2xl flex items-center justify-center min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] transition-all cursor-pointer ${
          canRedo
            ? 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
            : 'bg-white/5 text-white/30 cursor-not-allowed'
        }`}
        title={locale === 'vi' ? 'Làm lại' : 'Redo'}
      >
        <Redo2 className="w-5 h-5" />
      </button>

      {/* Clear Canvas Button */}
      <button
        type="button"
        onClick={handleClearCanvas}
        aria-label="Clear Canvas"
        className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] transition-all active:scale-95 cursor-pointer"
        title={locale === 'vi' ? 'Vẽ lại từ đầu' : 'Start Over'}
      >
        <RotateCcw className="w-5 h-5 text-amber-300" />
      </button>

      {/* Download PNG Button */}
      <button
        type="button"
        onClick={handleDownloadPNG}
        aria-label="Download PNG"
        className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] transition-all active:scale-95 cursor-pointer"
        title={locale === 'vi' ? 'Tải ảnh PNG' : 'Download PNG'}
      >
        <Download className="w-5 h-5 text-[#2EE6CA]" />
      </button>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSaveArtwork}
        disabled={isSaving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#125345] hover:bg-[#0e4237] text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer min-h-[48px] sm:min-h-[56px] border border-white/15"
      >
        <Save className="w-4 h-4 text-[#2EE6CA]" />
        <span className="hidden md:inline">{locale === 'vi' ? 'Lưu tác phẩm' : 'Save Artwork'}</span>
      </button>
    </div>
  );

  return (
    <ActivityShell
      title={locale === 'vi' ? 'Bức tranh của An' : "An's Drawing"}
      onBack={() => navigate('/creative')}
      headerRight={customHeaderRight}
    >
      <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 lg:p-6 select-none relative overflow-hidden bg-[#0B232F]/60">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-[#12384B]/95 text-white border-2 border-[#2EE6CA] shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
            <Sparkles className="w-5 h-5 text-[#F67650]" />
            <span className="font-bold text-sm">{toastMessage}</span>
          </div>
        )}

        {/* Desktop / Large Screen Workspace Card (1536x1024) */}
        <div className="flex-1 flex flex-col bg-white rounded-[28px] p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)] border border-[#17657A]/20 gap-4 overflow-hidden">
          {/* Sub-Header inside Card (strictly matching bluesteam-v2-creative-drawing.png) */}
          <div className="hidden lg:flex items-center justify-between bg-white rounded-2xl px-6 py-3 shadow-xs border border-black/5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/creative')}
                className="p-2 rounded-full hover:bg-gray-100 text-[#12384B] transition-colors cursor-pointer"
                title="Quay lại"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-black text-[#102A38] font-serif tracking-[-0.02em]">
                {locale === 'vi' ? 'Bức tranh của An' : "An's Drawing"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className={`p-2.5 rounded-xl transition-colors ${
                  canUndo ? 'text-gray-700 hover:bg-gray-100 cursor-pointer' : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Undo"
              >
                <Undo2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className={`p-2.5 rounded-xl transition-colors ${
                  canRedo ? 'text-gray-700 hover:bg-gray-100 cursor-pointer' : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Redo"
              >
                <Redo2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleSaveArtwork}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#125345] hover:bg-[#0e4237] text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>{locale === 'vi' ? 'Lưu tác phẩm' : 'Save Artwork'}</span>
              </button>
            </div>
          </div>

          {/* Main Stage: Left Tool Dock + Canvas Stage + Right Suggestions Panel */}
          <div className="flex-1 flex gap-4 min-h-[420px] overflow-hidden">
            {/* Left Vertical Tool Dock (Hidden on mobile/tablet where bottom dock is active) */}
            <div className="hidden lg:flex w-20 bg-white rounded-3xl p-3 shadow-xs border border-black/5 flex-col items-center gap-4 shrink-0">
              {/* Cọ vẽ sáp (Crayon Brush) */}
              <button
                type="button"
                onClick={() => setActiveTool('brush')}
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer transition-all ${
                  activeTool === 'brush'
                    ? 'bg-[#2EE6CA]/25 text-[#102A38] ring-2 ring-[#2EE6CA] shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={locale === 'vi' ? 'Cọ vẽ sáp màu' : 'Crayon Brush'}
              >
                <Paintbrush className="w-5 h-5" />
                <span>{locale === 'vi' ? 'Cọ vẽ' : 'Brush'}</span>
              </button>

              {/* Tẩy (Eraser) */}
              <button
                type="button"
                onClick={() => setActiveTool('eraser')}
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer transition-all ${
                  activeTool === 'eraser'
                    ? 'bg-[#2EE6CA]/25 text-[#102A38] ring-2 ring-[#2EE6CA] shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={locale === 'vi' ? 'Tẩy xoá nét' : 'Eraser'}
              >
                <Eraser className="w-5 h-5" />
                <span>{locale === 'vi' ? 'Tẩy' : 'Eraser'}</span>
              </button>

              {/* Tô màu (Paint Bucket Fill) */}
              <button
                type="button"
                onClick={() => setActiveTool('bucket')}
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer transition-all ${
                  activeTool === 'bucket'
                    ? 'bg-[#2EE6CA]/25 text-[#102A38] ring-2 ring-[#2EE6CA] shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={locale === 'vi' ? 'Đổ màu mảng' : 'Color Fill'}
              >
                <PaintBucket className="w-5 h-5" />
                <span>{locale === 'vi' ? 'Tô màu' : 'Fill'}</span>
              </button>

              {/* Con dấu (Marine Stamps) */}
              <button
                type="button"
                onClick={() => setActiveTool('stamp')}
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer transition-all ${
                  activeTool === 'stamp'
                    ? 'bg-[#2EE6CA]/25 text-[#102A38] ring-2 ring-[#2EE6CA] shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={locale === 'vi' ? 'Đóng dấu sinh vật' : 'Stamps'}
              >
                <Star className="w-5 h-5" />
                <span>{locale === 'vi' ? 'Con dấu' : 'Stamp'}</span>
              </button>

              {/* Stamp Sub-selector if Stamp is active */}
              {activeTool === 'stamp' && (
                <div className="flex flex-col gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200 mt-2">
                  {(['starfish', 'shell', 'bubble', 'turtle', 'fish', 'coral'] as MarineStampType[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStamp(st)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all ${
                        selectedStamp === st ? 'bg-[#17657A] text-white' : 'hover:bg-gray-200'
                      }`}
                    >
                      {st === 'starfish' ? '⭐' : st === 'shell' ? '🐚' : st === 'bubble' ? '🫧' : st === 'turtle' ? '🐢' : st === 'fish' ? '🐟' : '🪸'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Center Canvas Work Area (Responsive auto-resize with paper texture) */}
            <div 
              ref={containerRef}
              className="flex-1 bg-white rounded-3xl shadow-xs border border-black/5 overflow-hidden flex items-center justify-center p-2 sm:p-4 relative min-w-0"
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border border-black/10 shadow-inner flex items-center justify-center bg-[#FAF7F0] relative cursor-crosshair touch-none">
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full h-full block touch-none"
                  style={{ touchAction: 'none' }}
                />
              </div>
            </div>

            {/* Right Suggestions / Templates Panel ("Mẫu gợi ý") */}
            <div className={`w-72 bg-white rounded-3xl p-4 shadow-xs border border-black/5 flex-col space-y-3 shrink-0 ${
              isGuideOpen ? 'flex' : 'hidden lg:flex lg:w-16'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-bold text-sm text-[#102A38]">
                  {locale === 'vi' ? 'Mẫu gợi ý' : 'Suggestions'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(!isGuideOpen)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <ChevronUp className={`w-4 h-4 transition-transform ${isGuideOpen ? '' : 'rotate-180'}`} />
                </button>
              </div>

              {isGuideOpen && (
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        setActiveTemplate(tmpl);
                        initCanvasWithTemplate(tmpl, true);
                        showToast(`${locale === 'vi' ? 'Đã đổi sang mẫu:' : 'Selected template:'} ${locale === 'vi' ? tmpl.nameVi : tmpl.nameEn}`);
                      }}
                      className={`p-2 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
                        activeTemplate.id === tmpl.id
                          ? 'border-[#17657A] bg-[#17657A]/5 ring-2 ring-[#17657A]/20'
                          : 'border-gray-200 hover:border-gray-300 bg-[#faf8f5]'
                      }`}
                    >
                      <div className="w-16 h-14 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center shrink-0">
                        {tmpl.imageSrc ? (
                          <img src={tmpl.imageSrc} alt={tmpl.nameVi} className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-xs text-gray-400 font-bold">Trắng</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-[#102A38] truncate">
                          {locale === 'vi' ? tmpl.nameVi : tmpl.nameEn}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {tmpl.id === 'blank' ? (locale === 'vi' ? 'Vẽ tự do' : 'Free draw') : (locale === 'vi' ? 'Tô màu theo viền' : 'Coloring outline')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Palette & Thickness Controls (Desktop & Standard View) */}
          <div className="hidden lg:flex bg-white rounded-3xl p-4 shadow-xs border border-black/5 flex-wrap items-center justify-between gap-6">
            {/* Colors Swatches */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-[#12384B]">
                {locale === 'vi' ? 'Màu sắc' : 'Colors'}
              </span>
              <div className="flex items-center gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c);
                      if (activeTool === 'eraser') setActiveTool('brush');
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full shadow-xs transition-transform cursor-pointer border border-black/15 ${
                      selectedColor === c ? 'ring-4 ring-[#17657A]/40 scale-110' : 'hover:scale-105'
                    }`}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Brush Thickness */}
            <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
              <span className="text-xs font-extrabold text-[#12384B]">
                {locale === 'vi' ? 'Độ dày nét vẽ' : 'Line Thickness'}
              </span>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBrushSize(s)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                      brushSize === s ? 'bg-[#17657A]/15 ring-2 ring-[#17657A]' : 'hover:bg-gray-100'
                    }`}
                    title={`${sizeMap[s]}px`}
                  >
                    <div
                      className="rounded-full bg-[#102A38]"
                      style={{ width: `${s * 3.5}px`, height: `${s * 3.5}px` }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* CTA: Cho tranh chuyển động */}
            <div className="ml-auto">
              <button
                type="button"
                onClick={() => navigate('/creative/habitat?mode=run')}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#17657A] hover:bg-[#124d5d] text-white font-extrabold text-sm shadow-[0_4px_12px_rgba(23,101,122,0.3)] transition-transform active:scale-95 cursor-pointer min-h-[48px]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{locale === 'vi' ? 'Cho tranh chuyển động' : 'Animate Artwork'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SCREEN 39: Tablet Responsive Bottom Tool Dock (1024x768 & Touch)    */}
        {/* Child-friendly bottom dock ergonomics with touch targets >= 56px     */}
        {/* ==================================================================== */}
        <div className="lg:hidden w-full bg-white/95 backdrop-blur-md rounded-[28px] p-3 shadow-2xl border-2 border-[#17657A]/20 flex flex-col gap-3 mt-2">
          {/* Top Row: Primary Tools with min-w-[56px] min-h-[56px] */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            {/* Cọ vẽ */}
            <button
              type="button"
              onClick={() => setActiveTool('brush')}
              className={`flex-1 min-w-[56px] min-h-[56px] rounded-2xl flex items-center justify-center gap-1.5 font-extrabold text-xs cursor-pointer transition-all ${
                activeTool === 'brush'
                  ? 'bg-[#2EE6CA]/30 text-[#102A38] ring-2 ring-[#2EE6CA] shadow-xs'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Paintbrush className="w-5 h-5 text-[#17657A]" />
              <span>{locale === 'vi' ? 'Cọ vẽ' : 'Brush'}</span>
            </button>

            {/* Tẩy */}
            <button
              type="button"
              onClick={() => setActiveTool('eraser')}
              className={`flex-1 min-w-[56px] min-h-[56px] rounded-2xl flex items-center justify-center gap-1.5 font-extrabold text-xs cursor-pointer transition-all ${
                activeTool === 'eraser'
                  ? 'bg-[#2EE6CA]/30 text-[#102A38] ring-2 ring-[#2EE6CA] shadow-xs'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Eraser className="w-5 h-5 text-[#F67650]" />
              <span>{locale === 'vi' ? 'Tẩy' : 'Eraser'}</span>
            </button>

            {/* Tô màu */}
            <button
              type="button"
              onClick={() => setActiveTool('bucket')}
              className={`flex-1 min-w-[56px] min-h-[56px] rounded-2xl flex items-center justify-center gap-1.5 font-extrabold text-xs cursor-pointer transition-all ${
                activeTool === 'bucket'
                  ? 'bg-[#2EE6CA]/30 text-[#102A38] ring-2 ring-[#2EE6CA] shadow-xs'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <PaintBucket className="w-5 h-5 text-[#E67E22]" />
              <span>{locale === 'vi' ? 'Tô màu' : 'Fill'}</span>
            </button>

            {/* Con dấu */}
            <button
              type="button"
              onClick={() => setActiveTool('stamp')}
              className={`flex-1 min-w-[56px] min-h-[56px] rounded-2xl flex items-center justify-center gap-1.5 font-extrabold text-xs cursor-pointer transition-all ${
                activeTool === 'stamp'
                  ? 'bg-[#2EE6CA]/30 text-[#102A38] ring-2 ring-[#2EE6CA] shadow-xs'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Star className="w-5 h-5 text-amber-500" />
              <span>{locale === 'vi' ? 'Con dấu' : 'Stamp'}</span>
            </button>

            {/* Mẫu gợi ý Toggle */}
            <button
              type="button"
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="min-w-[56px] min-h-[56px] px-3 rounded-2xl bg-[#17657A]/10 text-[#17657A] flex items-center justify-center gap-1 font-bold text-xs"
            >
              <Palette className="w-4 h-4" />
              <span>{locale === 'vi' ? 'Mẫu' : 'Templates'}</span>
            </button>
          </div>

          {/* Bottom Row: Living Ocean Colors (Thumb scrollable with min-w-[56px] targets) */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSelectedColor(c);
                  if (activeTool === 'eraser') setActiveTool('brush');
                }}
                style={{ backgroundColor: c }}
                className={`min-w-[56px] min-h-[56px] rounded-2xl shadow-xs transition-transform cursor-pointer border-2 border-black/15 flex items-center justify-center shrink-0 ${
                  selectedColor === c ? 'ring-4 ring-[#17657A]/50 scale-105' : 'active:scale-95'
                }`}
              >
                {selectedColor === c && (
                  <Check className={`w-5 h-5 ${c === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ActivityShell>
  );
}
