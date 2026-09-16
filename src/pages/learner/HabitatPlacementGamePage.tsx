import { useState, useEffect, useRef, useCallback } from 'react';
import type React from 'react';
import { useRouter } from '../../app/router';
import { ActivityShell } from '../../shells/ActivityShell';
import {
  Eye,
  Hand,
  RotateCcw,
  Compass,
  Search,
  Check,
  Edit3,
  Volume2,
  Award,
  Glasses,
  Sprout,
  Play,
} from 'lucide-react';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import { demoStore } from '../../demo/storage/demoStore';
import { UnderwaterCausticsLayer } from './components/UnderwaterCausticsLayer';

export function HabitatPlacementGamePage() {
  const { query, navigate } = useRouter();

  // Mode: 'recognition' | 'placement' | 'feedback'
  const [step, setStep] = useState<'recognition' | 'placement' | 'feedback'>(() => {
    if (query.step === 'recognition') return 'recognition';
    if (query.step === 'feedback' || query.state === 'feedback') return 'feedback';
    return 'placement';
  });

  const [isPaused, setIsPaused] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<'sand' | 'seagrass' | 'coral' | null>(null);
  const [isTurtlePlaced, setIsTurtlePlaced] = useState(false);
  const [isCrabPlaced, setIsCrabPlaced] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('Tuyệt vời lắm bé ơi!');

  // =========================================================================
  // DRAG & DROP STATE ENGINE (Hỗ trợ kéo thả sinh vật mượt mà)
  // =========================================================================
  const [isDragging, setIsDragging] = useState<'turtle' | 'crab' | null>(null);
  const [dragCoord, setDragCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredZone, setHoveredZone] = useState<'sand' | 'seagrass' | 'coral' | null>(null);

  // Zone DOM References for physical collision detection
  const sandZoneRef = useRef<HTMLDivElement>(null);
  const seagrassZoneRef = useRef<HTMLDivElement>(null);
  const coralZoneRef = useRef<HTMLDivElement>(null);

  // Helper to detect which zone a coordinate falls into
  const checkHitZone = useCallback((clientX: number, clientY: number): 'sand' | 'seagrass' | 'coral' | null => {
    const checkRect = (el: HTMLElement | null) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    };

    if (checkRect(seagrassZoneRef.current)) return 'seagrass';
    if (checkRect(sandZoneRef.current)) return 'sand';
    if (checkRect(coralZoneRef.current)) return 'coral';
    return null;
  }, []);

  // Global pointer move & up handlers during active drag
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDragCoord({ x: e.clientX, y: e.clientY });
      const zone = checkHitZone(e.clientX, e.clientY);
      setHoveredZone(zone);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const zone = checkHitZone(e.clientX, e.clientY);

      if (isDragging === 'turtle') {
        if (zone === 'seagrass') {
          // Success drop into seagrass!
          setSelectedPlacement('seagrass');
          setIsTurtlePlaced(true);
          speakInstruction('Chính xác! Rùa biển xanh bơi lội và ăn cỏ biển xanh mướt!');
          setCelebrationMessage('Rùa xanh đã về thảm cỏ biển!');
          setShowCelebration(true);
          demoStore.completeActivity('game-habitat-placement');
          setTimeout(() => {
            setShowCelebration(false);
            changeStep('feedback');
          }, 1200);
        } else if (zone === 'sand') {
          setSelectedPlacement('sand');
          speakInstruction('Bãi cát ven bờ là nơi rùa mẹ lên đẻ trứng, nhưng thức ăn chính của rùa xanh là cỏ biển cơ! Bé thử kéo rùa vào thảm cỏ nhé!');
        } else if (zone === 'coral') {
          setSelectedPlacement('coral');
          speakInstruction('Rạn san hô là nhà của cá hề và cá bướm, rùa xanh thích ăn cỏ biển hơn! Bé kéo rùa vào thảm cỏ xanh nhé!');
        }
      } else if (isDragging === 'crab') {
        if (zone === 'sand') {
          setIsCrabPlaced(true);
          speakInstruction('Chính xác! Cua biển đào hang trên bãi cát ven bờ và kiếm ăn ở khe đá!');
          setCelebrationMessage('Cua biển đã về bãi cát ven bờ!');
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 1400);
        } else if (zone) {
          speakInstruction('Bạn cua cần bờ cát ẩm để đào hang! Bé thử thả cua vào bãi cát bên trái nhé!');
        }
      }

      setIsDragging(null);
      setHoveredZone(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, checkHitZone]);

  // Start dragging turtle
  const startDragTurtle = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging('turtle');
    setDragCoord({ x: e.clientX, y: e.clientY });
  };

  // Start dragging crab (in feedback step)
  const startDragCrab = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging('crab');
    setDragCoord({ x: e.clientX, y: e.clientY });
  };

  // Synchronize state with URL query parameters deterministically
  useEffect(() => {
    if (query.step === 'recognition' && step !== 'recognition') {
      setStep('recognition');
    } else if ((query.step === 'feedback' || query.state === 'feedback') && step !== 'feedback') {
      setStep('feedback');
    } else if (!query.step && query.state !== 'feedback' && step !== 'placement') {
      setStep('placement');
    }
  }, [query.step, query.state]);

  const changeStep = (newStep: 'recognition' | 'placement' | 'feedback') => {
    setStep(newStep);
    navigate(`/interactive/habitat-placement?step=${newStep}`, { replace: true });
  };

  const speakInstruction = (text: string) => {
    oceanAudio.speak(text);
  };

  const handleHint = () => {
    if (step === 'recognition') {
      speakInstruction('Bạn bạch tuộc màu nâu đỏ đang cuộn 8 chiếc xúc tu ở giữa rạn san hô và bãi cát đó bé ơi!');
    } else if (step === 'placement') {
      speakInstruction('Gợi ý khoa học NOAA: Rùa biển xanh trưởng thành là loài ăn cỏ biển, hãy đưa rùa về thảm cỏ xanh mướt nhé!');
    } else {
      speakInstruction('Bé ơi, bạn cua cần bờ cát và các hốc đá ven bờ để đào hang và tìm thức ăn!');
    }
  };

  // Custom Header Stepper for ActivityShell matching both Mockup 2 & Mockup 3
  const customHeaderCenter =
    step === 'feedback' ? (
      <div className="p-1 sm:p-1.5 rounded-full bg-[#EAE5DA]/70 border border-[#12384B]/10 shadow-[inset_0_1px_2px_rgba(16,42,56,0.06)] backdrop-blur-xs flex items-center gap-1.5 sm:gap-2.5 select-none">
        <button
          type="button"
          onClick={() => changeStep('recognition')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-200/90 text-xs font-bold text-[#102A38] shadow-2xs hover:bg-white hover:border-[#12384B]/20 hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
        >
          <Glasses className="w-3.5 h-3.5 text-[#15586E]" />
          <span>Quan sát</span>
        </button>

        <div className="w-2.5 sm:w-4 h-[1.5px] bg-[#12384B]/20 rounded-full" />

        <button
          type="button"
          onClick={() => changeStep('placement')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-200/90 text-xs font-bold text-[#102A38] shadow-2xs hover:bg-white hover:border-[#12384B]/20 hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
        >
          <Hand className="w-3.5 h-3.5 text-[#15586E]" />
          <span>Sắp xếp</span>
        </button>

        <div className="w-2.5 sm:w-4 h-[1.5px] bg-[#12384B]/20 rounded-full" />

        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#15586E] text-white text-xs font-black shadow-md border border-[#104354] shadow-[0_3px_10px_rgba(21,88,110,0.35)] scale-102">
          <Play className="w-3 h-3 text-[#2EE6CA] fill-current" />
          <span>Thử</span>
        </div>

        <div className="w-2.5 sm:w-4 h-[1.5px] bg-[#12384B]/20 rounded-full" />

        <button
          type="button"
          onClick={() => navigate('/resources')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-200/90 text-xs font-bold text-[#102A38] shadow-2xs hover:bg-white hover:border-[#12384B]/20 hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
        >
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span>Khám phá tiếp</span>
        </button>
      </div>
    ) : (
      <div className="p-1 sm:p-1.5 rounded-full bg-[#EAE5DA]/70 border border-[#12384B]/10 shadow-[inset_0_1px_2px_rgba(16,42,56,0.06)] backdrop-blur-xs flex items-center gap-1.5 sm:gap-2.5 select-none">
        <button
          type="button"
          onClick={() => changeStep('recognition')}
          className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-95 border shadow-2xs ${
            step === 'recognition'
              ? 'bg-[#15586E] text-white shadow-md border-[#15586E] shadow-[0_3px_10px_rgba(21,88,110,0.35)] scale-102'
              : 'bg-white/95 text-[#102A38] border-slate-200/80 hover:bg-white hover:border-[#12384B]/20 hover:shadow-xs'
          }`}
        >
          <Glasses className={`w-4 h-4 ${step === 'recognition' ? 'text-[#2EE6CA]' : 'text-[#15586E]'}`} />
          <span>Quan sát</span>
        </button>

        <div className="w-3 sm:w-6 h-[1.5px] bg-[#12384B]/20 rounded-full" />

        <button
          type="button"
          onClick={() => changeStep('placement')}
          className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-95 border shadow-2xs ${
            step === 'placement'
              ? 'bg-[#15586E] text-white shadow-md border-[#15586E] shadow-[0_3px_10px_rgba(21,88,110,0.35)] scale-102'
              : 'bg-white/95 text-[#102A38] border-slate-200/80 hover:bg-white hover:border-[#12384B]/20 hover:shadow-xs'
          }`}
        >
          <Hand className={`w-4 h-4 ${step === 'placement' ? 'text-[#2EE6CA]' : 'text-[#15586E]'}`} />
          <span>Thử đặt</span>
        </button>

        <div className="w-3 sm:w-6 h-[1.5px] bg-[#12384B]/20 rounded-full" />

        <button
          type="button"
          onClick={() => changeStep('feedback')}
          className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-95 border shadow-2xs ${
            (step as string) === 'feedback'
              ? 'bg-[#15586E] text-white shadow-md border-[#15586E] shadow-[0_3px_10px_rgba(21,88,110,0.35)] scale-102'
              : 'bg-white/95 text-[#102A38] border-slate-200/80 hover:bg-white hover:border-[#12384B]/20 hover:shadow-xs'
          }`}
        >
          <Sprout className={`w-4 h-4 ${(step as string) === 'feedback' ? 'text-[#2EE6CA]' : 'text-emerald-600'}`} />
          <span>Khám phá</span>
        </button>
      </div>
    );

  return (
    <ActivityShell
      title="Ghép Nơi Sống"
      variant="light"
      onBack={() => navigate('/interactive')}
      onHint={handleHint}
      isPaused={isPaused}
      onTogglePause={() => setIsPaused(!isPaused)}
      headerCenter={customHeaderCenter}
      showLogo={true}
    >
      <div className="relative w-full h-[calc(100vh-72px)] bg-[#0B232F] overflow-hidden select-none font-sans flex flex-col justify-between">
        {/* ========================================================================= */}
        {/* SCENARIO 1: RECOGNITION ROUND ("Cùng quan sát") - Screen 18               */}
        {/* ========================================================================= */}
        {step === 'recognition' && (
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
            {/* Full-Bleed Recognition Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/generated/backgrounds/recognition_round_bg.jpg"
                alt="Nhận diện sinh vật biển trên rạn san hô"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Top Challenge Sub-header */}
            <div className="relative z-20 px-8 py-5 flex items-start justify-between">
              <div>
                <span className="text-xs font-black tracking-widest uppercase text-white/90 drop-shadow">
                  Game Lab
                </span>
                <h1 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-white drop-shadow-md tracking-[-0.02em]">
                  Cùng quan sát
                </h1>
                <button
                  type="button"
                  onClick={() => speakInstruction('Nhấn vào sinh vật mà bạn tìm thấy trên đáy biển!')}
                  className="flex items-center gap-2 text-xs font-bold text-white/95 mt-1.5 drop-shadow hover:opacity-90 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#102A38] text-white flex items-center justify-center shadow-sm">
                    <span className="text-[10px] pl-0.5">▶</span>
                  </div>
                  <span>Nhấn vào sinh vật mà bạn tìm thấy</span>
                </button>
              </div>

              {/* Center Floating Prompt Pill */}
              <div className="absolute left-1/2 -translate-x-1/2 top-5 px-7 py-3 rounded-full bg-white/95 backdrop-blur-md shadow-2xl border border-white/90 flex items-center gap-3">
                <Search className="w-5 h-5 text-[#15586E]" />
                <span className="font-serif font-black text-xl text-[#102A38] tracking-tight">
                  Tìm bạn bạch tuộc
                </span>
              </div>

              {/* Right Hint Trigger Button */}
              <button
                type="button"
                onClick={handleHint}
                className="px-5 py-2.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-white/90 text-xs font-extrabold text-[#102A38] flex items-center gap-2 cursor-pointer hover:bg-white transition-all active:scale-95"
              >
                <span className="text-base">💡</span>
                <span>Gợi ý</span>
              </button>
            </div>

            {/* Target Creature Interactive Rings situated directly on seabed */}
            <div className="relative z-10 w-full flex-1">
              {/* Target 1: Marine Crab (Left) */}
              <div
                onClick={() => speakInstruction('Đây là bạn cua biển với lớp vỏ cứng và đôi càng khỏe!')}
                className="absolute left-[16%] top-[54%] -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full border-2 border-white shadow-[0_0_25px_rgba(255,255,255,0.8)] hover:scale-105 transition-transform cursor-pointer group flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full border-2 border-white/40 animate-ping opacity-25" />
                <span className="opacity-0 group-hover:opacity-100 text-xs font-black text-white bg-black/60 px-3 py-1 rounded-full transition-opacity absolute bottom-2">
                  Cua biển
                </span>
              </div>

              {/* Target 2: Octopus (Center) - The goal! */}
              <div
                onClick={() => {
                  speakInstruction('Chính xác! Bạn đã tìm thấy bạn bạch tuộc với 8 chiếc xúc tu dẻo dai!');
                  setShowCelebration(true);
                  demoStore.unlockCreature('asset-specimen-clownfish');
                  setTimeout(() => {
                    setShowCelebration(false);
                    changeStep('placement');
                  }, 1400);
                }}
                className="absolute left-[49%] top-[54%] -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-white shadow-[0_0_35px_rgba(255,255,255,0.9)] hover:scale-105 transition-transform cursor-pointer group flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full border-2 border-white/50 animate-ping opacity-30" />
                <span className="opacity-0 group-hover:opacity-100 text-xs font-black text-white bg-black/60 px-3 py-1 rounded-full transition-opacity absolute bottom-2">
                  Bạch tuộc
                </span>
              </div>

              {/* Target 3: Jellyfish (Right) */}
              <div
                onClick={() => speakInstruction('Đây là bạn sứa biển trong suốt dập dềnh trong làn nước!')}
                className="absolute left-[83%] top-[45%] -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full border-2 border-white shadow-[0_0_25px_rgba(255,255,255,0.8)] hover:scale-105 transition-transform cursor-pointer group flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full border-2 border-white/40 animate-ping opacity-25" />
                <span className="opacity-0 group-hover:opacity-100 text-xs font-black text-white bg-black/60 px-3 py-1 rounded-full transition-opacity absolute bottom-2">
                  Sứa biển
                </span>
              </div>
            </div>

            {/* Bottom Floating Stepper Tray */}
            <div className="relative z-20 mx-auto mb-6 px-8 py-3.5 rounded-full bg-white/95 backdrop-blur-md shadow-2xl border border-white/90 flex items-center gap-6 sm:gap-10 text-xs font-black text-[#102A38]">
              <div className="flex items-center gap-2 border-b-2 border-[#15586E] pb-1">
                <div className="w-6 h-6 rounded-full bg-[#15586E] text-white flex items-center justify-center">
                  <Eye className="w-3.5 h-3.5 text-[#2EE6CA]" />
                </div>
                <span>Quan sát</span>
              </div>

              <div className="w-8 h-0.5 bg-slate-200" />

              <div
                onClick={() => changeStep('placement')}
                className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-[#102A38]"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                  <Hand className="w-3.5 h-3.5" />
                </div>
                <span>Chọn</span>
              </div>

              <div className="w-8 h-0.5 bg-slate-200" />

              <div
                onClick={() => changeStep('feedback')}
                className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-[#102A38]"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
                <span>Thử lại</span>
              </div>

              <div className="w-8 h-0.5 bg-slate-200" />

              <div
                onClick={() => navigate('/resources')}
                className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-[#102A38]"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <span>Khám phá tiếp</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO 2: HABITAT PLACEMENT ("Tìm nơi sống cho rùa") - Screen 19        */}
        {/* ========================================================================= */}
        {step === 'placement' && (
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
            {/* Split-View Panoramic 3-Habitat Background with Living Caustics & Fish */}
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/generated/backgrounds/habitat_placement_bg.jpg"
                alt="3 vùng môi trường sống biển: Bãi cát, Cỏ biển, San hô"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

              {/* Underwater Caustics & Surface God Rays & Swimming Reef Fish */}
              <UnderwaterCausticsLayer
                waterLineRatio={0.335}
                showFish={true}
                showBubbles={true}
                showRays={true}
                showCaustics={true}
              />
            </div>

            {/* Challenge Title Banner with Voiceover Trigger & Physical Soundwave Arcs */}
            <div className="relative z-20 flex items-center justify-center gap-3.5 pt-6">
              <h2 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-[#102A38] drop-shadow-sm tracking-[-0.02em]">
                Tìm nơi sống cho rùa
              </h2>
              <button
                type="button"
                onClick={() =>
                  speakInstruction(
                    'Tìm nơi sống cho rùa. Bé hãy kéo hoặc chạm bạn rùa vào thảm cỏ biển xanh mướt nhé!'
                  )
                }
                className="relative w-12 h-12 rounded-full bg-[#1c6b8c] hover:bg-[#15586E] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white/70 group shrink-0"
                aria-label="Nghe lại câu hỏi"
              >
                <Volume2 className="w-6 h-6 text-[#2EE6CA]" />
                <div className="absolute -right-3 top-2 flex flex-col gap-1 pointer-events-none">
                  <span className="w-2 h-1 rounded-full bg-[#1c6b8c] rotate-45 transform origin-left" />
                  <span className="w-2.5 h-1 rounded-full bg-[#1c6b8c] origin-left" />
                  <span className="w-2 h-1 rounded-full bg-[#1c6b8c] -rotate-45 transform origin-left" />
                </div>
              </button>
            </div>

            {/* 3 Clearly Stratified Ecological Zones with Dotted Ellipse Rings */}
            <div className="relative z-10 w-full flex-1 min-h-[360px]">
              {/* Zone 1: Bãi Cát (Sand / Coastal Shoreline) */}
              <div
                ref={sandZoneRef}
                onClick={() => {
                  setSelectedPlacement('sand');
                  speakInstruction('Bãi cát ven bờ là nơi rùa mẹ lên đẻ trứng, nhưng thức ăn chính của rùa xanh là cỏ biển cơ!');
                }}
                className={`absolute left-[16%] top-[55%] -translate-x-1/2 -translate-y-1/2 w-64 h-28 rounded-[50%] border-2 border-dashed transition-all cursor-pointer flex items-center justify-center group ${
                  hoveredZone === 'sand' || selectedPlacement === 'sand'
                    ? 'border-amber-400 bg-amber-400/25 shadow-[0_0_35px_rgba(251,191,36,0.9)] scale-105'
                    : 'border-white/90 shadow-[0_0_25px_rgba(255,255,255,0.7)] hover:border-white hover:scale-105'
                }`}
              >
                <span className="opacity-0 group-hover:opacity-100 text-xs font-black text-white bg-black/60 px-3 py-1 rounded-full transition-opacity">
                  Bãi cát ven bờ
                </span>
              </div>

              {/* Zone 2: Thảm Cỏ Biển (Seagrass Meadow) - Scientifically Correct! */}
              <div
                ref={seagrassZoneRef}
                onClick={() => {
                  setSelectedPlacement('seagrass');
                  setIsTurtlePlaced(true);
                  speakInstruction('Chính xác! Rùa biển xanh bơi lội và ăn cỏ biển xanh mướt!');
                  setShowCelebration(true);
                  demoStore.completeActivity('game-habitat-placement');
                  setTimeout(() => {
                    setShowCelebration(false);
                    changeStep('feedback');
                  }, 1200);
                }}
                className={`absolute left-[49%] top-[55%] -translate-x-1/2 -translate-y-1/2 w-76 h-32 rounded-[50%] border-2 border-dashed transition-all cursor-pointer flex items-center justify-center group ${
                  hoveredZone === 'seagrass' || selectedPlacement === 'seagrass'
                    ? 'border-emerald-300 bg-emerald-400/30 shadow-[0_0_40px_rgba(52,211,153,0.95)] scale-105 animate-pulse'
                    : 'border-white/95 shadow-[0_0_30px_rgba(255,255,255,0.8)] hover:border-white hover:scale-105'
                }`}
              >
                <span className="opacity-0 group-hover:opacity-100 text-xs font-black text-white bg-black/60 px-3 py-1 rounded-full transition-opacity">
                  {hoveredZone === 'seagrass' ? '✨ Thả vào đây nhé! ✨' : 'Thảm cỏ biển nông'}
                </span>
              </div>

              {/* Zone 3: Rạn San Hô (Coral Reef) */}
              <div
                ref={coralZoneRef}
                onClick={() => {
                  setSelectedPlacement('coral');
                  speakInstruction('Rạn san hô rực rỡ là nhà của cá hề và cá bướm, rùa xanh hay ghé qua nhưng thích cỏ biển hơn!');
                }}
                className={`absolute left-[84%] top-[54%] -translate-x-1/2 -translate-y-1/2 w-64 h-28 rounded-[50%] border-2 border-dashed transition-all cursor-pointer flex items-center justify-center group ${
                  hoveredZone === 'coral' || selectedPlacement === 'coral'
                    ? 'border-amber-400 bg-amber-400/25 shadow-[0_0_35px_rgba(251,191,36,0.9)] scale-105'
                    : 'border-white/90 shadow-[0_0_25px_rgba(255,255,255,0.7)] hover:border-white hover:scale-105'
                }`}
              >
                <span className="opacity-0 group-hover:opacity-100 text-xs font-black text-white bg-black/60 px-3 py-1 rounded-full transition-opacity">
                  Rạn san hô
                </span>
              </div>

              {/* Placed Turtle Animation in Center Seagrass */}
              {isTurtlePlaced && (
                <div className="absolute left-[49%] top-[55%] -translate-x-1/2 -translate-y-1/2 w-56 h-36 pointer-events-none animate-in zoom-in-75 duration-500">
                  <img
                    src="/assets/generated/creatures/turtle_isolated.png"
                    alt="Rùa xanh đang bơi trong thảm cỏ"
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
                  />
                </div>
              )}
            </div>

            {/* Bottom Dock Tray matching bluesteam-v2-game-lab-habitat-placement.png */}
            <div className="relative z-30 w-full bg-[#FAF8F5] rounded-t-[40px] shadow-[0_-10px_35px_rgba(0,0,0,0.12)] border-t border-white/80 px-8 sm:px-12 py-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                {/* Left: Turtle Sticker with Coral Outline & Name - DRAGGABLE */}
                <div className="flex items-center gap-6">
                  <div
                    onPointerDown={startDragTurtle}
                    onClick={() => speakInstruction('Bé hãy kéo bạn rùa hoặc chạm vào thảm cỏ biển ở giữa để đặt bạn rùa về nhà nhé!')}
                    className={`relative -mt-16 sm:-mt-20 group cursor-grab active:cursor-grabbing transition-transform select-none ${
                      isDragging === 'turtle' ? 'opacity-30 scale-95' : 'hover:scale-105 active:scale-95'
                    }`}
                    title="Kéo hoặc chạm bạn rùa thả vào nơi sống"
                  >
                    <div className="p-2.5 rounded-3xl bg-white shadow-2xl border-[3.5px] border-[#F67650] transform -rotate-6">
                      <img
                        src="/assets/generated/creatures/turtle_isolated.png"
                        alt="Rùa xanh biển"
                        draggable={false}
                        className="w-36 h-24 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] pointer-events-none"
                      />
                    </div>
                    <div className="text-center font-serif font-black text-2xl text-[#102A38] mt-2 tracking-tight">
                      Rùa xanh
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="h-16 w-[1.5px] bg-slate-200/80 hidden sm:block" />
                </div>

                {/* Center-Left: Hand Tap Instruction Pill */}
                <div className="px-8 py-3.5 rounded-full bg-[#EAF3F7] border border-[#D5E6EE] shadow-xs flex items-center gap-3 text-sm font-bold text-[#102A38]">
                  <Hand className="w-5 h-5 text-[#15586E]" />
                  <span>Chạm rùa, rồi chạm nơi sống</span>
                </div>

                {/* Right: Auxiliary Action Buttons */}
                <div className="flex items-center gap-4">
                  {/* "Quan sát" Button (disabled before placement) */}
                  <button
                    type="button"
                    disabled={!selectedPlacement}
                    onClick={() => changeStep('recognition')}
                    className={`px-8 py-3.5 rounded-full text-sm font-extrabold flex items-center gap-2.5 shadow-xs transition-all ${
                      selectedPlacement
                        ? 'bg-[#15586E] text-white hover:bg-[#102A38] cursor-pointer active:scale-95'
                        : 'bg-[#ACB8C0] text-white/80 cursor-not-allowed opacity-80'
                    }`}
                  >
                    <Glasses className="w-5 h-5" />
                    <span>Quan sát</span>
                  </button>

                  {/* "Gợi ý" Scallop Shell Button matching Mockup 2 */}
                  <button
                    type="button"
                    onClick={handleHint}
                    className="px-7 py-3 rounded-full bg-gradient-to-r from-[#FFFDF8] to-[#FFF8E7] hover:from-white hover:to-[#FFF4D4] border-2 border-[#E5A93C] text-[#B87D1A] text-sm font-black flex items-center gap-2.5 shadow-[0_4px_12px_rgba(229,169,60,0.2)] cursor-pointer transition-all active:scale-95 min-h-[56px]"
                  >
                    <svg
                      className="w-6 h-6 shrink-0"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M16 4C9 4 4 10 5 18C5.5 22 8 26 13 28L14 27C14.5 25.5 15.2 24.5 16 24.5C16.8 24.5 17.5 25.5 18 27L19 28C24 26 26.5 22 27 18C28 10 23 4 16 4Z"
                        fill="#FFF4D4"
                        stroke="#E5A93C"
                        strokeWidth="2.2"
                        strokeLinejoin="round"
                      />
                      <path d="M16 6V24" stroke="#E5A93C" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M11 9C12.5 14 13.5 19 14.5 24" stroke="#E5A93C" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M21 9C19.5 14 18.5 19 17.5 24" stroke="#E5A93C" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>Gợi ý</span>
                  </button>
                </div>
              </div>

              {/* Bottom Pagination Dots */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="w-3 h-3 rounded-full bg-[#15586E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO 3: HABITAT FEEDBACK ("Quan sát rồi thử điều chỉnh") - Screen 20  */}
        {/* ========================================================================= */}
        {step === 'feedback' && (
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
            {/* Split Ocean Background with Living Caustics & Fish */}
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/generated/backgrounds/habitat_placement_bg.jpg"
                alt="Điều chỉnh nơi sống sinh vật"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

              {/* Underwater Caustics & Fish */}
              <UnderwaterCausticsLayer
                waterLineRatio={0.335}
                showFish={true}
                showBubbles={true}
                showRays={true}
                showCaustics={true}
              />
            </div>

            {/* Title & Question */}
            <div className="relative z-20 text-center pt-4">
              <h1 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-[#102A38] drop-shadow-md mb-1 tracking-tight">
                Quan sát rồi thử điều chỉnh
              </h1>
              <p className="font-serif font-black text-xl text-[#102A38]/90 drop-shadow">
                Bạn cua cần nơi nào?
              </p>
            </div>

            {/* Center Interactive Living Stage */}
            <div className="relative z-10 w-full flex-1 min-h-[360px]">
              {/* Turtle happily placed in center seagrass meadow */}
              <div
                onClick={() => setShowBioModal(true)}
                className="absolute left-[48%] top-[60%] -translate-x-1/2 -translate-y-1/2 w-64 h-40 transition-all cursor-pointer group"
                title="Bấm để xem giải thích sinh thái"
              >
                <img
                  src="/assets/generated/creatures/turtle_isolated.png"
                  alt="Rùa xanh trong thảm cỏ biển"
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/90 text-[11px] font-extrabold text-[#15586E] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ✓ Thảm cỏ biển
                </div>
              </div>

              {/* Clownfish happily placed in right coral reef anemone */}
              <div
                onClick={() => setShowBioModal(true)}
                className="absolute left-[84%] top-[58%] -translate-x-1/2 -translate-y-1/2 w-32 h-26 transition-all cursor-pointer group"
                title="Bấm để xem giải thích sinh thái"
              >
                <img
                  src="/assets/generated/creatures/clownfish_isolated.png"
                  alt="Cá hề trong rạn san hô"
                  className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/90 text-[11px] font-extrabold text-[#15586E] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ✓ Rạn san hô
                </div>
              </div>

              {/* Crab: Either placed on left sandy shoreline OR hovering in open water with '?' */}
              {isCrabPlaced ? (
                <div
                  onClick={() => setShowBioModal(true)}
                  className="absolute left-[16%] top-[56%] -translate-x-1/2 -translate-y-1/2 w-40 h-28 cursor-pointer group transition-all"
                  title="Bấm để xem giải thích sinh thái"
                >
                  <img
                    src="/assets/generated/creatures/crab_isolated.png"
                    alt="Cua biển trên bãi cát"
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/90 text-[11px] font-extrabold text-[#15586E] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ✓ Bãi cát ven bờ
                  </div>
                </div>
              ) : (
                <div
                  onPointerDown={startDragCrab}
                  onClick={() => {
                    speakInstruction('Bé hãy kéo bạn cua hoặc bấm vào bãi cát ven bờ bên trái để đưa cua về nhà nhé!');
                  }}
                  className={`absolute left-[62%] top-[34%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing select-none ${
                    isDragging === 'crab' ? 'opacity-30 scale-95' : 'hover:scale-105 transition-transform'
                  }`}
                  title="Kéo hoặc chạm bạn cua về bãi cát"
                >
                  <div className="w-9 h-9 rounded-full bg-white/95 text-[#102A38] font-serif font-black text-xl flex items-center justify-center shadow-lg border-2 border-slate-200 mb-1.5 ring-2 ring-white/60 animate-bounce">
                    ?
                  </div>
                  <img
                    src="/assets/generated/creatures/crab_isolated.png"
                    alt="Cua cần tìm nơi sống"
                    draggable={false}
                    className="w-40 h-28 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] pointer-events-none"
                  />
                </div>
              )}

              {/* Left Sand Drop Target for Crab */}
              {!isCrabPlaced && (
                <div
                  ref={sandZoneRef}
                  onClick={() => {
                    setIsCrabPlaced(true);
                    speakInstruction('Chính xác! Cua biển đào hang trên bãi cát ven bờ và kiếm ăn ở khe đá!');
                    setShowCelebration(true);
                    setTimeout(() => setShowCelebration(false), 1500);
                  }}
                  className={`absolute left-[16%] top-[55%] -translate-x-1/2 -translate-y-1/2 w-64 h-28 rounded-[50%] border-2 border-dashed transition-all cursor-pointer flex items-center justify-center group ${
                    hoveredZone === 'sand'
                      ? 'border-emerald-300 bg-emerald-400/30 shadow-[0_0_35px_rgba(52,211,153,0.95)] scale-105 animate-pulse'
                      : 'border-white/90 shadow-[0_0_25px_rgba(255,255,255,0.7)] hover:border-white hover:scale-105'
                  }`}
                >
                  <span className="text-xs font-black text-white bg-black/60 px-3.5 py-1.5 rounded-full">
                    {hoveredZone === 'sand' ? '✨ Thả Cua vào đây! ✨' : 'Chạm để đặt Cua vào Bãi cát'}
                  </span>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* BOTTOM DOCK TRAY: STRICT REFERENCE_CORRECTIONS.MD COMPLIANCE              */}
            {/* "Không nhân đôi vật đã đặt trong dock"                                    */}
            {/* ========================================================================= */}
            <div className="relative z-20 mx-auto mb-3 px-10 py-3.5 rounded-[32px] bg-white/95 backdrop-blur-md shadow-2xl border border-white/90 flex items-center gap-8 sm:gap-12">
              {/* Slot 1: Crab (Waiting for placement OR Placed) */}
              <div
                onClick={() => !isCrabPlaced && speakInstruction('Hãy đặt bạn cua vào bãi cát ven bờ bên trái!')}
                className={`flex flex-col items-center gap-1 cursor-pointer ${
                  isCrabPlaced ? 'opacity-60' : 'animate-pulse'
                }`}
              >
                <div className="w-24 h-16 flex items-center justify-center">
                  <img
                    src="/assets/generated/creatures/crab_isolated.png"
                    alt="Cua biển"
                    className="w-full h-full object-contain filter drop-shadow-xs"
                  />
                </div>
                <span className="text-[11px] font-extrabold text-[#102A38]">
                  {isCrabPlaced ? '✓ Đã về bãi cát' : 'Chờ đặt'}
                </span>
              </div>

              {/* Slot 2: Clownfish - Already placed in coral reef! DO NOT DUPLICATE */}
              <div className="flex flex-col items-center gap-1 opacity-50">
                <div className="w-24 h-16 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/50 flex items-center justify-center relative">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <span className="text-[11px] font-bold text-emerald-800">
                  ✓ Đã ở Rạn san hô
                </span>
              </div>

              {/* Slot 3: Sea Turtle - Already placed in seagrass meadow! DO NOT DUPLICATE */}
              <div className="flex flex-col items-center gap-1 opacity-50">
                <div className="w-28 h-16 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/50 flex items-center justify-center relative">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <span className="text-[11px] font-bold text-emerald-800">
                  ✓ Đã ở Thảm cỏ biển
                </span>
              </div>
            </div>

            {/* Bottom 2 Action Buttons matching Mockup */}
            <div className="relative z-20 mx-auto mb-6 flex items-center gap-5">
              <button
                type="button"
                onClick={() => changeStep('placement')}
                className="px-10 py-3.5 rounded-full bg-[#E8F1F5] hover:bg-[#D9E9F0] border border-[#CADEE8] text-[#102A38] font-black text-base shadow flex items-center gap-3 cursor-pointer transition-all active:scale-95"
              >
                <Edit3 className="w-5 h-5 text-[#15586E]" />
                <span>Sửa cách đặt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPlacement(null);
                  setIsCrabPlaced(false);
                  setIsTurtlePlaced(false);
                  changeStep('placement');
                }}
                className="px-12 py-3.5 rounded-full bg-[#15586E] hover:bg-[#102A38] text-white font-black text-base shadow-xl flex items-center gap-3 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5 text-[#2EE6CA]" />
                <span>Thử lại</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ACTIVE DRAGGING FLOATING GHOST (Theo sát con trỏ khi đang kéo)             */}
        {/* ========================================================================= */}
        {isDragging && (
          <div
            className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-75"
            style={{ left: `${dragCoord.x}px`, top: `${dragCoord.y}px` }}
          >
            {isDragging === 'turtle' && (
              <div className="p-3 rounded-3xl bg-white/90 shadow-2xl border-4 border-[#F67650] transform scale-110 -rotate-3 backdrop-blur-xs">
                <img
                  src="/assets/generated/creatures/turtle_isolated.png"
                  alt="Kéo rùa xanh"
                  className="w-36 h-24 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                />
              </div>
            )}
            {isDragging === 'crab' && (
              <div className="p-2 rounded-2xl bg-white/90 shadow-2xl border-4 border-[#2EE6CA] transform scale-110 rotate-3 backdrop-blur-xs">
                <img
                  src="/assets/generated/creatures/crab_isolated.png"
                  alt="Kéo cua biển"
                  className="w-32 h-22 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                />
              </div>
            )}
          </div>
        )}

        {/* Celebration Particle Overlay */}
        {showCelebration && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
            <div className="p-8 rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border border-emerald-200 flex flex-col items-center gap-3 animate-in zoom-in-95 duration-300">
              <span className="text-5xl animate-bounce">🌟 🐢 🌿</span>
              <span className="font-serif font-black text-2xl text-[#102A38]">
                {celebrationMessage}
              </span>
            </div>
          </div>
        )}

        {/* Biological NOAA Explanation Modal */}
        {showBioModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 select-none">
            <div className="max-w-xl w-full bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-[#EAE4D5] flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-[#15586E]" />
                  <h3 className="font-serif font-black text-2xl text-[#102A38]">
                    Hệ sinh thái & Thích nghi sinh học
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBioModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-sm text-[#102A38] leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-[#EAF3F7] border border-[#D5E6EE]">
                  <strong className="text-[#15586E]">🌿 Rùa xanh & Thảm cỏ biển:</strong> Rùa xanh trưởng thành là loài rùa biển duy nhất ăn thực vật (cỏ biển và tảo). Chúng giúp cắt tỉa thảm cỏ biển, kích thích chồi non phát triển và duy trì hệ sinh thái ven bờ khỏe mạnh (theo NOAA).
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <strong className="text-amber-800">🪸 Cá hề & Rạn san hô:</strong> Cá hề sống cộng sinh an toàn giữa các xúc tu có độc của hải quỳ trong rạn san hô để trốn kẻ thù.
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-800">🦀 Cua biển & Bãi cát:</strong> Cua đào hang dưới bãi cát ẩm và nấp dưới khe đá ven bờ khi thủy triều rút để bảo vệ cơ thể.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBioModal(false)}
                className="w-full py-3.5 rounded-full bg-[#15586E] hover:bg-[#102A38] text-white font-black text-sm shadow-md transition-colors cursor-pointer"
              >
                Đã hiểu rồi!
              </button>
            </div>
          </div>
        )}
      </div>
    </ActivityShell>
  );
}
