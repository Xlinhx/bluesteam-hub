import { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../app/router';
import { PublicShell } from '../../shells/PublicShell';
import { BlueSteamLogo } from '../../shared/components/BlueSteamLogo';
import { OceanCausticsOverlay } from '../../shared/components/OceanCausticsOverlay';
import { OceanMotesCanvas } from '../../shared/components/OceanMotesCanvas';
import { TiltCard } from '../../shared/components/TiltCard';
import {
  ArrowRight,
  Recycle,
  Trash2,
  FileText,
  Gamepad2,
  Image as ImageIcon,
  Sprout,
  AlertTriangle,
} from 'lucide-react';

const CREATURES_CONFIG = {
  jellyfish: {
    name: 'Sứa biển',
    desc: 'Cơ thể trong suốt, di chuyển nhẹ nhàng theo dòng nước.',
    galleryImg: '/assets/generated/stations/aquarium_gallery_jellyfish.jpg',
    thumbImg: '/assets/generated/creatures/thumb_jellyfish_tile.jpg',
    detailUrl: '/3dmodel/jellyfish',
  },
  clownfish: {
    name: 'Cá hề',
    desc: 'Màu sắc rực rỡ, sống cộng sinh an toàn giữa các xúc tu hải quỳ.',
    galleryImg: '/assets/generated/stations/aquarium_gallery_clownfish.jpg',
    thumbImg: '/assets/generated/creatures/thumb_clownfish_tile.jpg',
    detailUrl: '/3dmodel/clownfish',
  },
  starfish: {
    name: 'Sao biển',
    desc: 'Hình sao độc đáo, di chuyển nhẹ nhàng trên đáy cát và rạn đá.',
    galleryImg: '/assets/generated/stations/aquarium_gallery_starfish.jpg',
    thumbImg: '/assets/generated/creatures/thumb_starfish_tile.jpg',
    detailUrl: '/3dmodel/starfish',
  },
  shell: {
    name: 'Vỏ sò',
    desc: 'Lớp vỏ vôi cứng cáp bảo vệ sinh vật trước sóng biển mạnh mẽ.',
    galleryImg: '/assets/generated/stations/aquarium_gallery_shell.jpg',
    thumbImg: '/assets/generated/creatures/thumb_shell_tile.jpg',
    detailUrl: '/3dmodel/shell',
  },
} as const;

type CreatureKey = keyof typeof CREATURES_CONFIG;

function useLandingSections() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({
    s1: true,
    s2: false,
    s3: false,
    s4: false,
    s5: false,
    s6: false,
    s7: false,
  });

  const section1Ref = useRef<HTMLElement | null>(null);
  const section2Ref = useRef<HTMLElement | null>(null);
  const section3Ref = useRef<HTMLElement | null>(null);
  const section4Ref = useRef<HTMLElement | null>(null);
  const section5Ref = useRef<HTMLElement | null>(null);
  const section6Ref = useRef<HTMLElement | null>(null);
  const section7Ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const mqHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', mqHandler);

    const refEntries: Array<[string, React.RefObject<HTMLElement | null>]> = [
      ['s1', section1Ref],
      ['s2', section2Ref],
      ['s3', section3Ref],
      ['s4', section4Ref],
      ['s5', section5Ref],
      ['s6', section6Ref],
      ['s7', section7Ref],
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = refEntries.find(([, r]) => r.current === entry.target);
            if (match) {
              const key = match[0];
              setRevealed((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
            }
          }
        });
      },
      {
        rootMargin: '0px 0px -6% 0px',
        threshold: 0.08,
      }
    );

    refEntries.forEach(([, r]) => {
      if (r.current) observer.observe(r.current);
    });

    return () => {
      mq.removeEventListener('change', mqHandler);
      observer.disconnect();
    };
  }, []);

  return {
    prefersReducedMotion,
    revealed,
    refs: {
      section1Ref,
      section2Ref,
      section3Ref,
      section4Ref,
      section5Ref,
      section6Ref,
      section7Ref,
    },
  };
}

export function LivingOceanLandingPage() {
  const { navigate } = useRouter();
  const { prefersReducedMotion, revealed, refs } = useLandingSections();

  // Beat 2/3: Active creature thumbnail in aquarium tank
  const [activeCreature, setActiveCreature] = useState<CreatureKey>('jellyfish');

  // Beat 4: Selected action choice
  const [selectedAction, setSelectedAction] = useState<number | null>(0);

  // Beat 5: Creative Studio Tactile Selection
  const [activeMaterial, setActiveMaterial] = useState<string>('da');
  const [activeSpecimen, setActiveSpecimen] = useState<string>('bluefish');

  return (
    <PublicShell variant="landing">
      <div className="relative min-h-screen w-full bg-[#FAF9F6] text-[#12384B] font-sans overflow-x-hidden selection:bg-teal-100 select-none">
        {/* ========================================================
            BEAT 0: HERO - MỘT LẦN CHẠM, CẢ ĐẠI DƯƠNG MỞ RA
        ======================================================== */}
        <section
          ref={refs.section1Ref}
          className="relative w-full h-[620px] sm:h-[720px] flex items-center overflow-hidden scroll-mt-16"
          id="beat1"
        >
          {/* Split Ocean Photo Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            <div
              className={`w-full h-full ${prefersReducedMotion ? '' : 'animate-ocean-breathe-hero'}`}
              style={{
                transform: prefersReducedMotion ? 'none' : revealed.s1 ? 'scale(1)' : 'scale(1.06)',
                transition: 'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <img
                src="/assets/generated/backgrounds/ocean_split_hero_lighthouse.jpg"
                alt="Mặt nước biển và rùa biển bơi lội với ngọn hải đăng"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />

            {/* Living Aquatic Optical Layers (Submerged half: ~38% to 100%) */}
            <div className="absolute inset-x-0 top-[38%] bottom-0 overflow-hidden pointer-events-none">
              {/* Undulating sunlight caustics and swaying sunbeams on the turtle and coral */}
              <OceanCausticsOverlay opacity={0.80} />
              {/* Buoyant glowing bubbles & plankton motes floating upward */}
              <OceanMotesCanvas count={28} />
            </div>

            {/* Shimmering liquid waterline refraction line along the 38% boundary */}
            <div className="absolute inset-x-0 top-[37.8%] h-2.5 pointer-events-none overflow-hidden opacity-70">
              <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-cyan-100/40 to-transparent waterline-wave-animate blur-[1px]" />
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12">
            <div className="max-w-2xl space-y-6">
              <h1 className="font-editorial font-normal sm:font-medium text-3xl sm:text-5xl md:text-6xl text-white tracking-[-0.015em] leading-[1.2] drop-shadow-md animate-hero-text-1">
                Một lần chạm.<br />
                Cả đại dương mở ra.
              </h1>
              <p className="text-base sm:text-xl text-white/90 font-light leading-relaxed drop-shadow max-w-xl animate-hero-text-2">
                Khám phá thế giới đại dương qua học liệu, trò chơi<br className="hidden sm:inline" /> và hoạt động sáng tạo dành cho bé.
              </p>
              <div className="pt-2 animate-hero-cta">
                <button
                  type="button"
                  onClick={() => navigate('/entry')}
                  className="group btn-shimmer-sweep px-7 py-3 rounded-full bg-[#F67650] hover:bg-[#ff6236] text-white font-bold text-sm shadow-xl flex items-center gap-2.5 transition-all duration-200 cursor-pointer hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#F67650]/40 active:scale-[0.97] active:duration-100 focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>Bắt đầu khám phá</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 1: MỘT ĐẠI DƯƠNG. NHIỀU THẾ GIỚI. (ATLAS HORIZONTAL)
        ======================================================== */}
        <section
          ref={refs.section2Ref}
          className="relative w-full bg-[#F7F4EB] text-[#102A38] overflow-hidden scroll-mt-16"
          id="beat2"
        >
          {/* Environmental Background Ocean Transect Panorama */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div
              className={`w-full h-full ${prefersReducedMotion ? '' : 'animate-transect-drift'}`}
              style={{
                transform: prefersReducedMotion ? 'none' : revealed.s2 ? 'scale(1)' : 'scale(1.06)',
                opacity: prefersReducedMotion ? 1 : revealed.s2 ? 1 : 0.7,
                transition: 'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.4s ease-out',
              }}
            >
              <img
                src="/assets/generated/backgrounds/ocean_transect_5zones_panorama.jpg"
                alt="Mặt cắt ngang đại dương từ bờ biển đến đáy sâu"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Submerged fluid atmosphere: Caustics and floating plankton motes across underwater strata */}
            <div className="absolute inset-x-0 top-[22%] bottom-0 overflow-hidden pointer-events-none">
              <OceanCausticsOverlay opacity={0.30} />
              <OceanMotesCanvas count={24} />
            </div>
          </div>

          {/* Foreground Content Layer */}
          <div className="relative z-10 w-full pt-12 sm:pt-14 pb-0">
            {/* Section Header: Title, Subtitle, CTA Button */}
            <div
              className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-4 sm:mb-6"
              style={{
                transform: prefersReducedMotion ? 'none' : revealed.s2 ? 'translateY(0)' : 'translateY(16px)',
                opacity: prefersReducedMotion ? 1 : revealed.s2 ? 1 : 0,
                transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease-out',
              }}
            >
              <div>
                <h2 className="font-editorial font-normal sm:font-medium text-3xl sm:text-4xl md:text-5xl text-[#102A38] tracking-[-0.015em] mb-2.5">
                  Một đại dương. Nhiều thế giới.
                </h2>
                <p className="text-sm sm:text-base text-[#12384B]/80 font-normal">
                  Cùng khám phá các vùng sinh cảnh và những điều kỳ thú dưới mặt biển.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/entry')}
                className="group btn-shimmer-sweep inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#17657A]/40 bg-white/80 hover:bg-white text-[#17657A] font-medium text-xs sm:text-sm hover:border-[#17657A] hover:shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <span>Khám phá tương tác</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>

            {/* 5 Interactive Zone Labels & Pointer Lines positioned to land on the waterline */}
            <div className="relative w-full h-24 sm:h-28 pointer-events-none">
              {/* Pin 1: Bờ biển và vùng triều (15.5%) */}
              <button
                type="button"
                onClick={() => navigate('/entry')}
                className="pointer-events-auto absolute left-[15.5%] top-0 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus-visible:outline-none"
                style={{
                  transform: prefersReducedMotion ? 'none' : revealed.s2 ? 'translateY(0)' : 'translateY(-16px)',
                  opacity: prefersReducedMotion ? 1 : revealed.s2 ? 1 : 0,
                  transition: 'transform 1.0s cubic-bezier(0.16, 1, 0.3, 1) 0ms, opacity 0.8s ease-out 0ms',
                }}
              >
                <span className="text-xs sm:text-sm font-semibold text-[#102A38] text-center leading-tight mb-2 group-hover:text-[#17657A] transition-colors whitespace-nowrap">
                  Bờ biển<br className="sm:hidden" /> và vùng triều
                </span>
                <div className="w-[1px] h-14 sm:h-18 bg-[#102A38]/50 group-hover:bg-[#17657A] transition-colors" />
                <div className="relative w-3 h-3 rounded-full bg-white shadow-xs border-2 border-[#102A38] -mt-0.5 group-hover:scale-125 group-hover:border-[#17657A] transition-all">
                  {revealed.s2 && !prefersReducedMotion && (
                    <div className="absolute inset-0 rounded-full border border-[#17657A]/60 pin-ripple-halo pointer-events-none" />
                  )}
                </div>
              </button>

              {/* Pin 2: Rạn san hô (33.5%) */}
              <button
                type="button"
                onClick={() => navigate('/entry')}
                className="pointer-events-auto absolute left-[33.5%] top-3 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus-visible:outline-none"
                style={{
                  transform: prefersReducedMotion ? 'none' : revealed.s2 ? 'translateY(0)' : 'translateY(-16px)',
                  opacity: prefersReducedMotion ? 1 : revealed.s2 ? 1 : 0,
                  transition: 'transform 1.0s cubic-bezier(0.16, 1, 0.3, 1) 100ms, opacity 0.8s ease-out 100ms',
                }}
              >
                <span className="text-xs sm:text-sm font-semibold text-[#102A38] text-center leading-tight mb-2 group-hover:text-[#17657A] transition-colors whitespace-nowrap">
                  Rạn san hô
                </span>
                <div className="w-[1px] h-16 sm:h-20 bg-[#102A38]/50 group-hover:bg-[#17657A] transition-colors" />
                <div className="relative w-3 h-3 rounded-full bg-white shadow-xs border-2 border-[#102A38] -mt-0.5 group-hover:scale-125 group-hover:border-[#17657A] transition-all">
                  {revealed.s2 && !prefersReducedMotion && (
                    <div className="absolute inset-0 rounded-full border border-[#17657A]/60 pin-ripple-halo pointer-events-none" />
                  )}
                </div>
              </button>

              {/* Pin 3: Vùng nước mở (53.9%) */}
              <button
                type="button"
                onClick={() => navigate('/entry')}
                className="pointer-events-auto absolute left-[53.9%] top-3 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus-visible:outline-none"
                style={{
                  transform: prefersReducedMotion ? 'none' : revealed.s2 ? 'translateY(0)' : 'translateY(-16px)',
                  opacity: prefersReducedMotion ? 1 : revealed.s2 ? 1 : 0,
                  transition: 'transform 1.0s cubic-bezier(0.16, 1, 0.3, 1) 200ms, opacity 0.8s ease-out 200ms',
                }}
              >
                <span className="text-xs sm:text-sm font-semibold text-[#102A38] text-center leading-tight mb-2 group-hover:text-[#17657A] transition-colors whitespace-nowrap">
                  Vùng nước mở
                </span>
                <div className="w-[1px] h-16 sm:h-20 bg-[#102A38]/50 group-hover:bg-[#17657A] transition-colors" />
                <div className="relative w-3 h-3 rounded-full bg-white shadow-xs border-2 border-[#102A38] -mt-0.5 group-hover:scale-125 group-hover:border-[#17657A] transition-all">
                  {revealed.s2 && !prefersReducedMotion && (
                    <div className="absolute inset-0 rounded-full border border-[#17657A]/60 pin-ripple-halo pointer-events-none" />
                  )}
                </div>
              </button>

              {/* Pin 4: Vùng biển sâu (72.6%) */}
              <button
                type="button"
                onClick={() => navigate('/entry')}
                className="pointer-events-auto absolute left-[72.6%] top-3 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus-visible:outline-none"
                style={{
                  transform: prefersReducedMotion ? 'none' : revealed.s2 ? 'translateY(0)' : 'translateY(-16px)',
                  opacity: prefersReducedMotion ? 1 : revealed.s2 ? 1 : 0,
                  transition: 'transform 1.0s cubic-bezier(0.16, 1, 0.3, 1) 300ms, opacity 0.8s ease-out 300ms',
                }}
              >
                <span className="text-xs sm:text-sm font-semibold text-[#102A38] text-center leading-tight mb-2 group-hover:text-[#17657A] transition-colors whitespace-nowrap">
                  Vùng biển sâu
                </span>
                <div className="w-[1px] h-16 sm:h-20 bg-[#102A38]/50 group-hover:bg-[#17657A] transition-colors" />
                <div className="relative w-3 h-3 rounded-full bg-white shadow-xs border-2 border-[#102A38] -mt-0.5 group-hover:scale-125 group-hover:border-[#17657A] transition-all">
                  {revealed.s2 && !prefersReducedMotion && (
                    <div className="absolute inset-0 rounded-full border border-[#17657A]/60 pin-ripple-halo pointer-events-none" />
                  )}
                </div>
              </button>

              {/* Pin 5: Đáy đại dương (92.2%) */}
              <button
                type="button"
                onClick={() => navigate('/entry')}
                className="pointer-events-auto absolute left-[92.2%] top-3 -translate-x-1/2 flex flex-col items-center group cursor-pointer focus-visible:outline-none"
                style={{
                  transform: prefersReducedMotion ? 'none' : revealed.s2 ? 'translateY(0)' : 'translateY(-16px)',
                  opacity: prefersReducedMotion ? 1 : revealed.s2 ? 1 : 0,
                  transition: 'transform 1.0s cubic-bezier(0.16, 1, 0.3, 1) 400ms, opacity 0.8s ease-out 400ms',
                }}
              >
                <span className="text-xs sm:text-sm font-semibold text-[#102A38] text-center leading-tight mb-2 group-hover:text-[#17657A] transition-colors whitespace-nowrap">
                  Đáy đại dương
                </span>
                <div className="w-[1px] h-16 sm:h-20 bg-[#102A38]/50 group-hover:bg-[#17657A] transition-colors" />
                <div className="relative w-3 h-3 rounded-full bg-white shadow-xs border-2 border-[#102A38] -mt-0.5 group-hover:scale-125 group-hover:border-[#17657A] transition-all">
                  {revealed.s2 && !prefersReducedMotion && (
                    <div className="absolute inset-0 rounded-full border border-[#17657A]/60 pin-ripple-halo pointer-events-none" />
                  )}
                </div>
              </button>
            </div>

            {/* Naturally proportioned underwater stage spacer to showcase the 5 zones */}
            <div className="w-full h-[420px] sm:h-[520px] md:h-[600px] lg:h-[680px] xl:h-[720px]" />
          </div>
        </section>

        {/* ========================================================
            BEAT 2 & 3: QUAN SÁT THẬT GẦN (AQUARIUM EXHIBITION GALLERY)
        ======================================================== */}
        <section
          ref={refs.section3Ref}
          className="relative w-full min-h-[560px] sm:min-h-[620px] flex items-center bg-[#06131C] text-white overflow-hidden scroll-mt-16 pt-8 pb-14 sm:pt-10 sm:pb-16"
          id="beat3"
        >
          {/* Atmospheric Museum Aquarium Background with Smooth Seamless Crossfade */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            {(Object.keys(CREATURES_CONFIG) as CreatureKey[]).map((key) => {
              const item = CREATURES_CONFIG[key];
              const isCurrent = activeCreature === key;
              return (
                <div
                  key={key}
                  className={`absolute inset-0 w-full h-full ${
                    isCurrent && !prefersReducedMotion ? 'animate-aquarium-drift' : ''
                  }`}
                  style={{
                    opacity: isCurrent ? 1 : 0,
                    zIndex: isCurrent ? 1 : 0,
                    transform: prefersReducedMotion
                      ? 'none'
                      : isCurrent
                      ? revealed.s3
                        ? 'scale(1)'
                        : 'scale(1.05)'
                      : 'scale(1.05)',
                    transition:
                      'opacity 0.9s ease-in-out, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <img
                    src={item.galleryImg}
                    alt={item.name}
                    loading="eager"
                    className="w-full h-full object-cover object-[62%_center] sm:object-[58%_center] lg:object-[54%_center]"
                  />
                </div>
              );
            })}
            {/* Seamless Left-to-Right gradient: starts 100% solid dark navy (#06131C) on the left behind the text, then blends softly into the exhibition hall right after the text */}
            <div className="absolute inset-0 z-2 bg-gradient-to-r from-[#06131C] via-[#06131C] via-[32%] sm:via-[36%] lg:via-[40%] to-transparent" />
            {/* Soft bottom blend to transition smoothly into Beat 4 */}
            <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 z-2 bg-gradient-to-t from-black/40 to-transparent" />
            {/* Ambient tank water caustics and glowing motes */}
            <div className="absolute inset-y-0 right-0 w-3/4 overflow-hidden pointer-events-none opacity-40 z-1">
              <OceanCausticsOverlay opacity={0.35} />
              <OceanMotesCanvas count={20} />
            </div>
          </div>

          {/* Foreground Grid Layout */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            {/* Left Column (5 cols): Heading (no line break), Subtitle (break before 'mô hình 3D'), CTA button */}
            <div
              className="lg:col-span-5 space-y-6"
              style={{
                transform: prefersReducedMotion ? 'none' : revealed.s3 ? 'translateY(0)' : 'translateY(16px)',
                opacity: prefersReducedMotion ? 1 : revealed.s3 ? 1 : 0,
                transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease-out',
              }}
            >
              <h2 className="font-editorial font-medium text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-5xl text-white tracking-[-0.015em] leading-tight whitespace-nowrap">
                Quan sát thật gần
              </h2>
              <p className="text-base sm:text-lg text-white/80 font-light leading-relaxed">
                Khám phá các sinh vật biển qua<br />
                mô hình 3D, hình ảnh và thuyết minh sinh động.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(CREATURES_CONFIG[activeCreature].detailUrl)}
                  className="group btn-shimmer-sweep px-7 py-3 rounded-full bg-white hover:bg-white/95 text-[#071723] font-semibold text-sm sm:text-base shadow-xl inline-flex items-center gap-2.5 cursor-pointer transition-all duration-200 active:scale-[0.97] hover:scale-[1.02] hover:shadow-2xl"
                >
                  <span>Khám phá sinh vật</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Center Empty Space (3 cols) on desktop: Exposes the illuminated cylindrical tank and secondary background tanks */}
            <div className="hidden lg:block lg:col-span-3 min-h-[440px]" aria-hidden="true" />

            {/* Right Column (4 cols): Floating Info Card & 4 Creature Selector Thumbnails */}
            <div className="lg:col-span-4 flex flex-col justify-between items-start lg:items-end min-h-[360px] sm:min-h-[440px] space-y-8 lg:space-y-0">
              {/* Creature Info Card with 3D Tilt & Specular Glare */}
              <div
                className="w-full max-w-sm"
                style={{
                  transform: prefersReducedMotion ? 'none' : revealed.s3 ? 'translateY(0)' : 'translateY(16px)',
                  opacity: prefersReducedMotion ? 1 : revealed.s3 ? 1 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 120ms, opacity 0.9s ease-out 120ms',
                }}
              >
                <TiltCard
                  maxTilt={8}
                  glare={true}
                  className="w-full rounded-2xl"
                >
                  <div className="w-full p-6 rounded-2xl bg-[#091A27]/85 backdrop-blur-md border border-white/10 shadow-2xl space-y-3">
                    <div key={activeCreature} className="animate-text-swap">
                      <h3 className="font-editorial font-medium text-2xl text-white tracking-tight">
                        {CREATURES_CONFIG[activeCreature].name}
                      </h3>
                      <p className="text-sm text-white/75 font-light leading-relaxed min-h-[44px]">
                        {CREATURES_CONFIG[activeCreature].desc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(CREATURES_CONFIG[activeCreature].detailUrl)}
                      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#2EE6CA] hover:text-[#5ef3dc] hover:underline cursor-pointer pt-2 transition-colors"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                    </button>
                  </div>
                </TiltCard>
              </div>

              {/* 4 Bottom Thumbnails */}
              <div className="flex items-center gap-3 pt-2" role="tablist" aria-label="Chọn sinh vật quan sát">
                {(Object.keys(CREATURES_CONFIG) as CreatureKey[]).map((key) => {
                  const item = CREATURES_CONFIG[key];
                  const isSelected = activeCreature === key;
                  return (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      key={key}
                      onClick={() => setActiveCreature(key)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 p-0.5 bg-[#041624] focus-visible:ring-2 focus-visible:ring-[#2EE6CA] active:scale-95 tactile-pebble ${
                        isSelected
                          ? 'border-2 border-[#2EE6CA] shadow-[0_0_16px_rgba(46,230,202,0.45)] ring-2 ring-[#2EE6CA]/30 scale-105'
                          : 'border border-white/15 opacity-70 hover:opacity-100 hover:border-white/40 hover:scale-[1.02]'
                      }`}
                      aria-label={`Xem ${item.name}`}
                    >
                      <img
                        src={item.thumbImg}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 4: MỘT LỰA CHỌN NHỎ (SIMULATION CHOICE)
        ======================================================== */}
        <section
          ref={refs.section4Ref}
          className="relative w-full h-[520px] sm:h-[540px] flex items-center overflow-hidden scroll-mt-16"
          id="beat4"
        >
          {/* Sandy Beach Bottle Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div
              className={`w-full h-full ${prefersReducedMotion ? '' : 'animate-shore-surge'}`}
              style={{
                transform: prefersReducedMotion ? 'none' : revealed.s4 ? 'scale(1)' : 'scale(1.06)',
                opacity: prefersReducedMotion ? 1 : revealed.s4 ? 1 : 0.7,
                transition: 'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease-out',
              }}
            >
              <img
                src="/assets/generated/backgrounds/glass_bottle_beach_cleanup.jpg"
                alt="Chai thủy tinh dạt vào bãi cát bờ biển"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-white/5" />
            {/* Top gradient blend connecting seamlessly with Beat 3 */}
            <div className="absolute inset-x-0 top-0 h-20 sm:h-28 bg-gradient-to-b from-[#06131C] via-[#06131C]/40 to-transparent pointer-events-none z-1" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Text */}
            <div
              className="max-w-lg space-y-4"
              style={{
                transform: prefersReducedMotion ? 'none' : revealed.s4 ? 'translateY(0)' : 'translateY(16px)',
                opacity: prefersReducedMotion ? 1 : revealed.s4 ? 1 : 0,
                transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease-out',
              }}
            >
              <h2 className="font-editorial font-normal sm:font-medium text-3xl sm:text-4xl md:text-5xl text-[#102A38] tracking-[-0.015em]">
                Một lựa chọn nhỏ
              </h2>
              <p className="text-base sm:text-lg text-[#12384B]/80 font-light leading-relaxed">
                Những hành động hôm nay có thể tạo nên<br className="hidden sm:inline" /> thay đổi lớn cho đại dương ngày mai.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/entry')}
                  className="group btn-shimmer-sweep px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-[#12384B] font-bold text-xs shadow-md border border-slate-200 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>Chọn hành động</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Right Choice Card: Bạn sẽ làm gì? - Wrapped in TiltCard with Specular Glare */}
            <div
              className="max-w-md w-full"
              style={{
                transform: prefersReducedMotion ? 'none' : revealed.s4 ? 'translateY(0)' : 'translateY(16px)',
                opacity: prefersReducedMotion ? 1 : revealed.s4 ? 1 : 0,
                transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 120ms, opacity 0.9s ease-out 120ms',
              }}
            >
              <TiltCard
                maxTilt={6}
                glare={true}
                className="rounded-[28px] w-full"
              >
                <div className="rounded-[28px] bg-white/95 backdrop-blur-md shadow-2xl border border-white/80 p-6 sm:p-8 w-full">
                  <h3 className="font-editorial font-medium text-2xl text-[#102A38] tracking-[-0.015em] mb-6">
                    Bạn sẽ làm gì?
                  </h3>

                  <div className="grid grid-cols-3 gap-3.5">
                    <button
                      type="button"
                      onClick={() => setSelectedAction(0)}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all cursor-pointer tactile-pebble group ${
                        selectedAction === 0
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-300 scale-105'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <Recycle className={`w-8 h-8 text-emerald-600 transition-transform duration-200 ${selectedAction === 0 ? 'scale-110' : 'group-hover:scale-105'}`} />
                      <span className="text-xs font-bold text-[#12384B] leading-tight">
                        Nhặt rác<br />trên bãi biển
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedAction(1)}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all cursor-pointer tactile-pebble group ${
                        selectedAction === 1
                          ? 'bg-slate-100 border-slate-500 shadow-md ring-2 ring-slate-300 scale-105'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <Trash2 className={`w-8 h-8 text-slate-500 transition-transform duration-200 ${selectedAction === 1 ? 'scale-110' : 'group-hover:scale-105'}`} />
                      <span className="text-xs font-bold text-[#12384B] leading-tight">
                        Bỏ qua<br />và đi tiếp
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedAction(2)}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all cursor-pointer tactile-pebble group ${
                        selectedAction === 2
                          ? 'bg-teal-50/90 border-[#17657A] shadow-md ring-2 ring-teal-300 scale-105'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <svg className={`w-8 h-8 text-[#17657A] transition-transform duration-200 ${selectedAction === 2 ? 'scale-110' : 'group-hover:scale-105'}`} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 22c4.5 0 6.5-4 11-4 4.5 0 6.5 4 11 4 1.5 0 2-.5 3-1" />
                        <path d="M4 17c3-1 6-7 11-7 4 0 7 3 8 7" />
                        <path d="M15 10c1.5-3 4-5 7-4-1 2-2 4-4 5" />
                      </svg>
                      <span className="text-xs font-bold text-[#12384B] leading-tight">
                        Mang về<br />tái chế
                      </span>
                    </button>
                  </div>

                  {/* Instant Environmental Feedback Banner with Styled SVG Badges */}
                  {selectedAction === 0 && (
                    <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 flex items-start gap-3 text-xs text-emerald-800 shadow-xs animate-feedback-pop">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        <Sprout className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold leading-relaxed pt-0.5">
                        Tuyệt vời! Dọn sạch rác bãi biển giúp ngăn nhựa trôi ra khơi và bảo vệ tổ rùa non.
                      </span>
                    </div>
                  )}
                  {selectedAction === 1 && (
                    <div className="mt-5 p-3.5 rounded-2xl bg-slate-100/90 border border-slate-300/90 flex items-start gap-3 text-xs text-slate-700 shadow-xs animate-feedback-pop">
                      <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold leading-relaxed pt-0.5">
                        Rác vẫn nằm lại bãi biển. Khi thủy triều dâng cao, chúng sẽ bị cuốn ra biển sâu.
                      </span>
                    </div>
                  )}
                  {selectedAction === 2 && (
                    <div className="mt-5 p-3.5 rounded-2xl bg-teal-50/90 border border-[#17657A]/30 flex items-start gap-3 text-xs text-[#17657A] shadow-xs animate-feedback-pop">
                      <div className="w-6 h-6 rounded-lg bg-[#17657A]/15 text-[#17657A] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        <Recycle className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold leading-relaxed pt-0.5">
                        Sáng kiến hay! Thu gom chai nhựa để tái chế giúp giảm thiểu rác thải tuần hoàn.
                      </span>
                    </div>
                  )}
                </div>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 5: ĐẠI DƯƠNG CỦA BÉ (CREATIVE STUDIO DIORAMA)
        ======================================================== */}
        <section
          ref={refs.section5Ref}
          className="relative w-full min-h-[560px] lg:min-h-[620px] flex items-center overflow-hidden scroll-mt-16"
          id="beat5"
        >
          {/* Handcrafted Diorama Wooden Tray Background matching Mockup */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div
              className={`w-full h-full ${prefersReducedMotion ? '' : 'animate-diorama-warmth'}`}
              style={{
                transform: prefersReducedMotion ? 'none' : revealed.s5 ? 'scale(1)' : 'scale(1.06)',
                opacity: prefersReducedMotion ? 1 : revealed.s5 ? 1 : 0.7,
                transition: 'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease-out',
              }}
            >
              <img
                src="/assets/generated/craft/ocean_diorama_wood_tray_mockup.jpg"
                alt="Mô hình khay gỗ rạn san hô đất nặn của bé trên bàn gỗ ấm áp"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/20 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8 py-10">
            {/* Left Text */}
            <div
              className="max-w-md space-y-4 shrink-0"
              style={{
                transform: prefersReducedMotion ? 'none' : revealed.s5 ? 'translateY(0)' : 'translateY(16px)',
                opacity: prefersReducedMotion ? 1 : revealed.s5 ? 1 : 0,
                transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease-out',
              }}
            >
              <h2 className="font-editorial font-medium text-4xl sm:text-5xl text-[#102A38] tracking-[-0.02em] whitespace-nowrap">
                Đại dương của bé
              </h2>
              <p className="text-base sm:text-lg text-[#12384B]/80 font-normal leading-relaxed">
                Thỏa sức sáng tạo, xây dựng môi trường sống<br className="hidden sm:inline" /> lý tưởng cho các sinh vật biển.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/creative')}
                  className="group btn-shimmer-sweep px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-[#12384B] font-bold text-xs shadow-md border border-slate-200 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>Bắt đầu sáng tạo</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Both Flanking Tactile Craft Tool Palettes: Left Card and Right Card flanking diorama */}
            <div className="flex-1 w-full flex items-center justify-between lg:pl-6 xl:pl-10 select-none">
              {/* Left Material Palette (Flanking the left side of the diorama tray) */}
              <div
                style={{
                  transform: prefersReducedMotion ? 'none' : revealed.s5 ? 'translateX(0)' : 'translateX(-16px)',
                  opacity: prefersReducedMotion ? 1 : revealed.s5 ? 1 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 120ms, opacity 0.9s ease-out 120ms',
                }}
              >
                <TiltCard
                  maxTilt={6}
                  glare={true}
                  className="min-w-[145px] rounded-[24px]"
                >
                  <div className="flex flex-col gap-2 p-3.5 rounded-[24px] bg-white/95 backdrop-blur-md shadow-2xl border border-white/80">
                    <button
                      type="button"
                      onClick={() => setActiveMaterial('da')}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer tactile-pebble ${
                        activeMaterial === 'da'
                          ? 'bg-amber-100/90 text-[#102A38] shadow-xs ring-1 ring-amber-300'
                          : 'bg-amber-50/70 hover:bg-amber-50 text-[#102A38]'
                      }`}
                    >
                      <img
                        src="/assets/generated/craft/icons/craft_icon_stone.jpg"
                        alt="Đá"
                        className="w-5 h-5 object-contain mix-blend-multiply"
                      />
                      <span>Đá</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMaterial('sanho')}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer tactile-pebble ${
                        activeMaterial === 'sanho'
                          ? 'bg-rose-100/90 text-[#102A38] shadow-xs ring-1 ring-rose-300'
                          : 'bg-rose-50/70 hover:bg-rose-50 text-[#102A38]'
                      }`}
                    >
                      <img
                        src="/assets/generated/craft/icons/craft_icon_coral.jpg"
                        alt="San hô"
                        className="w-5 h-5 object-contain mix-blend-multiply"
                      />
                      <span>San hô</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMaterial('caybien')}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer tactile-pebble ${
                        activeMaterial === 'caybien'
                          ? 'bg-emerald-100/90 text-[#102A38] shadow-xs ring-1 ring-emerald-300'
                          : 'bg-emerald-50/70 hover:bg-emerald-50 text-[#102A38]'
                      }`}
                    >
                      <img
                        src="/assets/generated/craft/icons/craft_icon_seaweed.jpg"
                        alt="Cây biển"
                        className="w-5 h-5 object-contain mix-blend-multiply"
                      />
                      <span>Cây biển</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMaterial('hang')}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer tactile-pebble ${
                        activeMaterial === 'hang'
                          ? 'bg-slate-200/90 text-[#102A38] shadow-xs ring-1 ring-slate-400'
                          : 'bg-slate-100/70 hover:bg-slate-100 text-[#102A38]'
                      }`}
                    >
                      <img
                        src="/assets/generated/craft/icons/craft_icon_cave.jpg"
                        alt="Hang trú ẩn"
                        className="w-5 h-5 object-contain mix-blend-multiply"
                      />
                      <span>Hang trú ẩn</span>
                    </button>
                  </div>
                </TiltCard>
              </div>

              {/* Center Spacer: Let the diorama tray in the background breathe naturally */}
              <div className="hidden lg:block flex-1 min-w-[220px] xl:min-w-[300px]" />

              {/* Right Specimen Palette "Chọn sinh vật" (Standing upright at right side of diorama tray) */}
              <div
                style={{
                  transform: prefersReducedMotion ? 'none' : revealed.s5 ? 'translateX(0)' : 'translateX(16px)',
                  opacity: prefersReducedMotion ? 1 : revealed.s5 ? 1 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 200ms, opacity 0.9s ease-out 200ms',
                }}
              >
                <TiltCard
                  maxTilt={6}
                  glare={true}
                  className="min-w-[155px] rounded-[24px]"
                >
                  <div className="flex flex-col gap-2.5 p-3.5 rounded-[24px] bg-[#FAF3E8]/95 backdrop-blur-md shadow-2xl border border-amber-200/70">
                    <span className="text-xs font-bold text-[#102A38] text-center border-b border-amber-200/60 pb-1.5">
                      Chọn sinh vật
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveSpecimen('bluefish')}
                        className={`p-1.5 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 tactile-pebble ${
                          activeSpecimen === 'bluefish'
                            ? 'bg-white shadow-sm ring-2 ring-sky-400'
                            : 'bg-sky-50/70 hover:bg-white border border-sky-100/50'
                        }`}
                        title="Cá xanh"
                      >
                        <img
                          src="/assets/generated/craft/icons/craft_creature_bluefish.jpg"
                          alt="Cá xanh"
                          className="w-8 h-8 object-contain mix-blend-multiply"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSpecimen('bluecoral')}
                        className={`p-1.5 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 tactile-pebble ${
                          activeSpecimen === 'bluecoral'
                            ? 'bg-white shadow-sm ring-2 ring-blue-400'
                            : 'bg-blue-50/70 hover:bg-white border border-blue-100/50'
                        }`}
                        title="San hô xanh"
                      >
                        <img
                          src="/assets/generated/craft/icons/craft_creature_bluecoral.jpg"
                          alt="San hô xanh"
                          className="w-8 h-8 object-contain mix-blend-multiply"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSpecimen('shell')}
                        className={`p-1.5 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 tactile-pebble ${
                          activeSpecimen === 'shell'
                            ? 'bg-white shadow-sm ring-2 ring-amber-400'
                            : 'bg-amber-50/70 hover:bg-white border border-amber-100/50'
                        }`}
                        title="Vỏ sò"
                      >
                        <img
                          src="/assets/generated/craft/icons/craft_creature_shell.jpg"
                          alt="Vỏ sò"
                          className="w-8 h-8 object-contain mix-blend-multiply"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSpecimen('plant')}
                        className={`p-1.5 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 tactile-pebble ${
                          activeSpecimen === 'plant'
                            ? 'bg-white shadow-sm ring-2 ring-emerald-400'
                            : 'bg-emerald-50/70 hover:bg-white border border-emerald-100/50'
                        }`}
                        title="Cây biển"
                      >
                        <img
                          src="/assets/generated/craft/icons/craft_creature_plant.jpg"
                          alt="Cây biển"
                          className="w-8 h-8 object-contain mix-blend-multiply"
                        />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSpecimen('starfish')}
                      className={`p-1.5 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 mx-auto w-12 tactile-pebble ${
                        activeSpecimen === 'starfish'
                          ? 'bg-white shadow-sm ring-2 ring-orange-400'
                          : 'bg-orange-50/70 hover:bg-white border border-orange-100/50'
                      }`}
                      title="Sao biển"
                    >
                      <img
                        src="/assets/generated/craft/icons/craft_creature_starfish.jpg"
                        alt="Sao biển"
                        className="w-8 h-8 object-contain mix-blend-multiply"
                      />
                    </button>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 6: CÙNG CÔ KHÁM PHÁ (TEACHER & RESOURCE HUB)
        ======================================================== */}
        <section
          ref={refs.section6Ref}
          className="relative w-full bg-[#FAF9F6] border-y border-slate-200/60 py-12 sm:py-16 scroll-mt-16"
          id="beat6"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
            <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 xl:gap-10 justify-between">
              {/* Left Column: Heading + Description + Action */}
              <div
                className="lg:w-[300px] xl:w-[340px] shrink-0 flex flex-col justify-between self-stretch"
                style={{
                  transform: prefersReducedMotion ? 'none' : revealed.s6 ? 'translateY(0)' : 'translateY(16px)',
                  opacity: prefersReducedMotion ? 1 : revealed.s6 ? 1 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease-out',
                }}
              >
                <div>
                  <h2 className="font-editorial font-bold text-3xl sm:text-4xl text-[#102A38] tracking-[-0.02em] mb-3 leading-[1.2] whitespace-nowrap">
                    Cùng cô khám phá
                  </h2>
                  <p className="text-sm sm:text-base text-[#12384B]/80 font-medium leading-relaxed mb-6 max-w-[280px]">
                    Các bài giảng được thiết kế sinh động, dễ áp dụng trong lớp học và tại nhà.
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => navigate('/resources')}
                    className="group btn-shimmer-sweep px-5 py-2 sm:py-2.5 rounded-full border border-[#102A38]/30 hover:border-[#17657A] text-[#102A38] hover:text-[#17657A] font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-2 cursor-pointer transition-all w-fit hover:scale-[1.02] active:scale-95"
                  >
                    <span>Xem bài giảng</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Right Column: "Dành cho giáo viên" Link + 4 Cards */}
              <div className="flex-1 w-full flex flex-col min-w-0">
                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={() => navigate('/teacher')}
                    className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#17657A] hover:underline cursor-pointer"
                  >
                    <span>Dành cho giáo viên</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>

                {/* 4 Cards Grid with Staggered Scroll Elevation, 3D Tilt, and Zoom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                  {/* Card 1 - Sinh cảnh rạn san hô */}
                  <div
                    style={{
                      transform: prefersReducedMotion ? 'none' : revealed.s6 ? 'translateY(0)' : 'translateY(16px)',
                      opacity: prefersReducedMotion ? 1 : revealed.s6 ? 1 : 0,
                      transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0ms, opacity 0.9s ease-out 0ms',
                    }}
                  >
                    <TiltCard
                      maxTilt={6}
                      glare={true}
                      onClick={() => navigate('/resources')}
                      className="group rounded-2xl bg-white shadow-sm border border-slate-200/70 flex flex-col overflow-hidden card-tactile-lift cursor-pointer active:scale-[0.98]"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src="/assets/generated/stations/station_coral_reef.jpg"
                          alt="Sinh cảnh rạn san hô"
                          className="w-full h-full object-cover card-img-zoom"
                          style={{
                            transform: prefersReducedMotion ? 'none' : revealed.s6 ? 'scale(1)' : 'scale(1.08)',
                            transition: 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0ms',
                          }}
                        />
                      </div>
                      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
                        <h4 className="font-bold text-xs xl:text-[13px] text-[#102A38] tracking-tight mb-3 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-[#17657A] transition-colors">
                          Sinh cảnh rạn san hô
                        </h4>
                        <div className="flex items-center justify-between mt-auto gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-[#EAF2F8] text-[#17657A] text-[11px] sm:text-xs font-semibold whitespace-nowrap">
                            Bài giảng
                          </span>
                          <FileText className="w-6 h-6 text-[#17657A] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.8} />
                        </div>
                      </div>
                    </TiltCard>
                  </div>

                  {/* Card 2 - Bảo vệ động vật biển */}
                  <div
                    style={{
                      transform: prefersReducedMotion ? 'none' : revealed.s6 ? 'translateY(0)' : 'translateY(16px)',
                      opacity: prefersReducedMotion ? 1 : revealed.s6 ? 1 : 0,
                      transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 120ms, opacity 0.9s ease-out 120ms',
                    }}
                  >
                    <TiltCard
                      maxTilt={6}
                      glare={true}
                      onClick={() => navigate('/resources')}
                      className="group rounded-2xl bg-white shadow-sm border border-slate-200/70 flex flex-col overflow-hidden card-tactile-lift cursor-pointer active:scale-[0.98]"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src="/assets/generated/creatures/green_turtle_hero.jpg"
                          alt="Bảo vệ động vật biển"
                          className="w-full h-full object-cover card-img-zoom"
                          style={{
                            transform: prefersReducedMotion ? 'none' : revealed.s6 ? 'scale(1)' : 'scale(1.08)',
                            transition: 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1) 120ms',
                          }}
                        />
                      </div>
                      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
                        <h4 className="font-bold text-xs xl:text-[13px] text-[#102A38] tracking-tight mb-3 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-[#17657A] transition-colors">
                          Bảo vệ động vật biển
                        </h4>
                        <div className="flex items-center justify-between mt-auto gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-[#EAF2F8] text-[#17657A] text-[11px] sm:text-xs font-semibold whitespace-nowrap">
                            Giáo án
                          </span>
                          <FileText className="w-6 h-6 text-[#17657A] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.8} />
                        </div>
                      </div>
                    </TiltCard>
                  </div>

                  {/* Card 3 - Mangrove Ecosystem */}
                  <div
                    style={{
                      transform: prefersReducedMotion ? 'none' : revealed.s6 ? 'translateY(0)' : 'translateY(16px)',
                      opacity: prefersReducedMotion ? 1 : revealed.s6 ? 1 : 0,
                      transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 240ms, opacity 0.9s ease-out 240ms',
                    }}
                  >
                    <TiltCard
                      maxTilt={6}
                      glare={true}
                      onClick={() => navigate('/resources')}
                      className="group rounded-2xl bg-white shadow-sm border border-slate-200/70 flex flex-col overflow-hidden card-tactile-lift cursor-pointer active:scale-[0.98]"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src="/assets/generated/stations/mangrove_coastal_ecosystem.jpg"
                          alt="Hệ sinh thái ven biển rừng ngập mặn"
                          className="w-full h-full object-cover card-img-zoom"
                          style={{
                            transform: prefersReducedMotion ? 'none' : revealed.s6 ? 'scale(1)' : 'scale(1.08)',
                            transition: 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1) 240ms',
                          }}
                        />
                      </div>
                      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
                        <h4 className="font-bold text-xs xl:text-[13px] text-[#102A38] tracking-tight mb-3 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-[#17657A] transition-colors">
                          Hệ sinh thái ven biển
                        </h4>
                        <div className="flex items-center justify-between mt-auto gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-[#E6F4F1] text-[#17657A] text-[11px] sm:text-xs font-semibold whitespace-nowrap">
                            Học liệu
                          </span>
                          <ImageIcon className="w-6 h-6 text-[#17657A] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.8} />
                        </div>
                      </div>
                    </TiltCard>
                  </div>

                  {/* Card 4 - Deep Ocean Simulation */}
                  <div
                    style={{
                      transform: prefersReducedMotion ? 'none' : revealed.s6 ? 'translateY(0)' : 'translateY(16px)',
                      opacity: prefersReducedMotion ? 1 : revealed.s6 ? 1 : 0,
                      transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 360ms, opacity 0.9s ease-out 360ms',
                    }}
                  >
                    <TiltCard
                      maxTilt={6}
                      glare={true}
                      onClick={() => navigate('/entry')}
                      className="group rounded-2xl bg-white shadow-sm border border-slate-200/70 flex flex-col overflow-hidden card-tactile-lift cursor-pointer active:scale-[0.98]"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src="/assets/generated/backgrounds/whale_hero_gamelab.jpg"
                          alt="Khám phá đại dương sâu"
                          className="w-full h-full object-cover card-img-zoom"
                          style={{
                            transform: prefersReducedMotion ? 'none' : revealed.s6 ? 'scale(1)' : 'scale(1.08)',
                            transition: 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1) 360ms',
                          }}
                        />
                      </div>
                      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
                        <h4 className="font-bold text-xs xl:text-[13px] text-[#102A38] tracking-tight mb-3 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-[#17657A] transition-colors">
                          Khám phá đại dương sâu
                        </h4>
                        <div className="flex items-center justify-between mt-auto gap-2">
                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#EBF2FA] text-[#1D5C8A] text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">
                            Game & Simulation
                          </span>
                          <Gamepad2 className="w-6 h-6 text-[#17657A] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.8} />
                        </div>
                      </div>
                    </TiltCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BEAT 7: BẮT ĐẦU CÙNG BÉ (SUNSET COASTAL CTA)
        ======================================================== */}
        <section
          ref={refs.section7Ref}
          className="relative w-full h-[500px] sm:h-[520px] flex items-center justify-end overflow-hidden"
          id="beat7"
        >
          {/* Sunset Rocky Coast Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div
              className={`w-full h-full ${prefersReducedMotion ? '' : 'animate-sunset-drift'}`}
              style={{
                transform: prefersReducedMotion ? 'none' : revealed.s7 ? 'scale(1)' : 'scale(1.06)',
                opacity: prefersReducedMotion ? 1 : revealed.s7 ? 1 : 0.7,
                transition: 'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease-out',
              }}
            >
              <img
                src="/assets/generated/backgrounds/sunset_rocky_coast.jpg"
                alt="Hoàng hôn trên ghềnh đá ngọn hải đăng"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-l from-amber-50/70 via-transparent to-transparent" />
            {/* Subtle warm sunset caustic shimmering across water surface */}
            <OceanCausticsOverlay opacity={0.16} />
          </div>

          <div
            className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 flex justify-end"
            style={{
              transform: prefersReducedMotion ? 'none' : revealed.s7 ? 'translateY(0)' : 'translateY(16px)',
              opacity: prefersReducedMotion ? 1 : revealed.s7 ? 1 : 0,
              transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease-out',
            }}
          >
            <div className="max-w-md space-y-6 text-left">
              <h2 className="font-editorial font-normal sm:font-medium text-3xl sm:text-4xl md:text-5xl text-[#102A38] tracking-[-0.015em]">
                Bắt đầu cùng bé
              </h2>
              <p className="text-base sm:text-lg text-[#12384B]/80 font-light leading-relaxed">
                Mở ra những trải nghiệm ý nghĩa cho<br className="hidden sm:inline" /> hôm nay và mai sau.
              </p>
              <div className="flex justify-start pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/entry')}
                  className="group btn-shimmer-sweep px-7 py-3 rounded-full bg-[#F67650] hover:bg-[#ff6236] text-white font-bold text-sm shadow-xl flex items-center gap-2.5 transition-all duration-200 cursor-pointer hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#F67650]/40 active:scale-[0.97]"
                >
                  <span>Bắt đầu khám phá</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            PUBLIC FOOTER
        ======================================================== */}
        <footer className="w-full bg-[#FAF9F6] border-t border-slate-200/60 py-8 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#0B3558]">
          <BlueSteamLogo size="sm" />

          <div className="flex items-center gap-6">
            <button type="button" className="hover:text-[#0284C7] transition-colors cursor-pointer">
              Về BlueSTEAM
            </button>
            <button type="button" className="hover:text-[#0284C7] transition-colors cursor-pointer">
              Hỗ trợ
            </button>
            <button type="button" className="hover:text-[#0284C7] transition-colors cursor-pointer">
              Liên hệ
            </button>
          </div>

          <div className="text-[#0B3558]/80 font-medium">
            Vì một đại dương xanh hơn
          </div>
        </footer>
      </div>
    </PublicShell>
  );
}
