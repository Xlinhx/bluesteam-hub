import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { demoStore } from '../../demo/storage/demoStore';
import { TiltCard } from '../../shared/components/TiltCard';
import { OceanMotesCanvas } from '../../shared/components/OceanMotesCanvas';
import {
  User,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  FileText,
  Folder,
  Gamepad2,
  Tv,
  LogIn,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface FeatureTileProps {
  icon: React.ReactNode;
  label: string;
  delayMs: number;
  theme: 'student' | 'teacher';
  mounted: boolean;
  prefersReducedMotion: boolean;
}

function FeatureTile({
  icon,
  label,
  delayMs,
  theme,
  mounted,
  prefersReducedMotion,
}: FeatureTileProps) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 p-1 sm:p-1.5 rounded-xl transition-all duration-200 cursor-pointer group/icon active:scale-95 select-none"
      style={{
        opacity: prefersReducedMotion ? 1 : mounted ? 1 : 0,
        transform: prefersReducedMotion
          ? 'none'
          : mounted
          ? 'translateY(0)'
          : 'translateY(12px)',
        transition: prefersReducedMotion
          ? 'none'
          : `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, opacity 0.4s ease-out ${delayMs}ms`,
      }}
    >
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-200 group-hover/icon:-translate-y-1 group-hover/icon:scale-110 group-hover/icon:shadow-md ${
          theme === 'student'
            ? 'bg-[#17657A]/10 text-[#17657A] group-hover/icon:bg-[#17657A]/20 group-hover/icon:text-[#0c404f]'
            : 'bg-[#102A38]/10 text-[#102A38] group-hover/icon:bg-[#102A38]/20 group-hover/icon:text-[#17657A]'
        }`}
      >
        {icon}
      </div>
      <span className="text-[11px] font-bold text-slate-700 tracking-tight transition-colors group-hover/icon:text-[#102A38]">
        {label}
      </span>
    </div>
  );
}

interface PersonaBadgeProps {
  avatarSrc: string;
  fallbackSrc?: string;
  name: string;
  role: string;
  delayMs: number;
  theme: 'student' | 'teacher';
  mounted: boolean;
  prefersReducedMotion: boolean;
}

function PersonaBadge({
  avatarSrc,
  fallbackSrc,
  name,
  role,
  delayMs,
  theme,
  mounted,
  prefersReducedMotion,
}: PersonaBadgeProps) {
  const [imgSrc, setImgSrc] = useState(avatarSrc);

  return (
    <div
      className="relative -mt-7 z-10 mx-auto px-5 py-2 rounded-full bg-white shadow-lg border border-slate-100 flex items-center gap-2.5 transition-all duration-200 hover:scale-105 hover:shadow-xl group/badge cursor-pointer"
      style={{
        opacity: prefersReducedMotion ? 1 : mounted ? 1 : 0,
        transform: prefersReducedMotion
          ? 'none'
          : mounted
          ? 'translateY(0) scale(1)'
          : 'translateY(8px) scale(0.92)',
        transition: prefersReducedMotion
          ? 'none'
          : `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delayMs}ms, opacity 0.4s ease-out ${delayMs}ms`,
      }}
    >
      <img
        src={imgSrc}
        alt={`${name} - ${role}`}
        className={`w-10 h-10 rounded-full object-cover shadow-xs shrink-0 ring-2 transition-transform duration-200 group-hover/badge:scale-105 ${
          theme === 'student' ? 'ring-[#17657A]/25' : 'ring-[#102A38]/25'
        }`}
        onError={() => {
          if (fallbackSrc && imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          }
        }}
      />
      <div className="flex flex-col text-left">
        <span className="font-editorial font-black text-base text-[#102A38] leading-tight">
          {name}
        </span>
        <span
          className={`text-[10px] font-bold leading-tight ${
            theme === 'student' ? 'text-[#17657A]' : 'text-[#102A38]'
          }`}
        >
          {role}
        </span>
      </div>
    </div>
  );
}

export function RoleGatewayPage() {
  const { navigate } = useRouter();
  const [pin, setPin] = useState(['', '', '', '']);
  const [lastChangedIdx, setLastChangedIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    setMounted(true);
  }, []);

  const handleStudentEntry = () => {
    demoStore.setProfile({
      role: 'student',
      id: 'student-an',
      name: 'Bé An',
      avatarKey: '/assets/avatar_an.png',
      gender: 'boy',
      age: '5',
    });
    navigate('/home');
  };

  const handleTeacherEntry = () => {
    demoStore.setProfile({
      role: 'teacher',
      id: 'teacher-linh',
      name: 'Cô Linh',
      avatarKey: '/assets/avatars/linh_teacher_headshot.png',
    });
    navigate('/teacher');
  };

  const handlePinChange = (index: number, val: string) => {
    // Multi-digit paste handling
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 4).split('');
      if (digits.length > 0) {
        const newPin = [...pin];
        digits.forEach((d, i) => {
          if (index + i < 4) newPin[index + i] = d;
        });
        setPin(newPin);
        const nextIdx = Math.min(3, index + digits.length);
        document.getElementById(`pin-${nextIdx}`)?.focus();
        return;
      }
    }

    const sanitized = val.slice(-1);
    const newPin = [...pin];
    newPin[index] = sanitized;
    setPin(newPin);

    if (sanitized) {
      setLastChangedIdx(index);
      setTimeout(() => setLastChangedIdx(null), 300);
      if (index < 3) {
        const nextInput = document.getElementById(`pin-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const isPinComplete = pin.every((d) => d.trim().length > 0);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none bg-[#EAF2F6]">
      {/* Background Image: Coastal Study Desk Terrace with Cinematic Breathe */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className={`w-full h-full ${prefersReducedMotion ? '' : 'animate-ocean-breathe-hero'}`}
          style={{
            transform: prefersReducedMotion ? 'none' : mounted ? 'scale(1)' : 'scale(1.04)',
            opacity: prefersReducedMotion ? 1 : mounted ? 1 : 0.7,
            transition: 'transform 2.0s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease-out',
          }}
        >
          <img
            src="/assets/generated/backgrounds/coastal_balcony_study_entry.jpg"
            alt="Coastal study terrace overlooking ocean"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
        {/* Subtle living atmospheric motes drifting across the balcony */}
        <OceanMotesCanvas count={24} color="rgba(23, 101, 122, 0.35)" />
      </div>

      {/* Top Header: Drops in smoothly */}
      <header
        className="relative z-20 w-full px-6 sm:px-12 py-5 flex items-center justify-end"
        style={{
          transform: prefersReducedMotion ? 'none' : mounted ? 'translateY(0)' : 'translateY(-12px)',
          opacity: prefersReducedMotion ? 1 : mounted ? 1 : 0,
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 100ms, opacity 0.5s ease-out 100ms',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="group px-6 py-2 rounded-full border border-[#102A38]/40 bg-white/50 hover:bg-white/80 backdrop-blur-md text-[#102A38] font-editorial font-semibold text-sm flex items-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 shadow-xs hover:shadow-md hover:border-[#102A38]/70"
        >
          <User className="w-4 h-4 text-[#102A38] transition-transform duration-200 group-hover:scale-110" />
          <span>Đăng nhập</span>
        </button>
      </header>

      {/* Main Role Selection Area */}
      <main className="relative z-20 max-w-6xl mx-auto w-full px-6 py-4 flex flex-col items-center">
        {/* Title & Animated Dynamic Wave Underlines */}
        <div
          className="text-center mb-8"
          style={{
            transform: prefersReducedMotion ? 'none' : mounted ? 'translateY(0)' : 'translateY(16px)',
            opacity: prefersReducedMotion ? 1 : mounted ? 1 : 0,
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 120ms, opacity 0.6s ease-out 120ms',
          }}
        >
          <h1 className="font-editorial font-black text-4xl sm:text-5xl text-[#102A38] drop-shadow-sm tracking-[-0.02em] mb-2.5">
            Bắt đầu cùng BlueSTEAM
          </h1>
          <div className="flex flex-col items-center gap-1 text-[#17657A]">
            <svg
              width="68"
              height="8"
              viewBox="0 0 64 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={prefersReducedMotion ? '' : 'animate-wave-line'}
            >
              <path
                d="M2 4C8 1 14 7 20 4C26 1 32 7 38 4C44 1 50 7 56 4C59 2.5 61 3.5 62 4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <svg
              width="68"
              height="8"
              viewBox="0 0 64 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={prefersReducedMotion ? '' : 'animate-wave-line'}
              style={{ animationDirection: 'alternate-reverse', animationDuration: '4.5s' }}
            >
              <path
                d="M2 4C8 1 14 7 20 4C26 1 32 7 38 4C44 1 50 7 56 4C59 2.5 61 3.5 62 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeOpacity="0.75"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* 2 Role Cards Side-by-Side with Staggered Kinetic Entrances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 w-full max-w-4xl">
          {/* ========================================================
              CARD 1: STUDENT (Bé An) - Stagger Delay 180ms
          ======================================================== */}
          <div
            style={{
              transform: prefersReducedMotion ? 'none' : mounted ? 'translateY(0)' : 'translateY(24px)',
              opacity: prefersReducedMotion ? 1 : mounted ? 1 : 0,
              transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 180ms, opacity 0.7s ease-out 180ms',
            }}
          >
            <TiltCard
              maxTilt={6}
              glare={true}
              className="rounded-[32px] bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(16,42,56,0.12)] hover:shadow-[0_28px_60px_rgba(16,42,56,0.18)] border border-white/90 p-6 flex flex-col justify-between group transition-shadow duration-300"
            >
              {/* Upper Artwork */}
              <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-inner bg-amber-50">
                <img
                  src="/assets/generated/craft/child_sketchbook_whale.jpg"
                  alt="Bé An khám phá"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Overlapping Persona Badge */}
              <PersonaBadge
                avatarSrc="/assets/avatars/an_student_avatar.png"
                fallbackSrc="/assets/avatar_an.png"
                name="An"
                role="Học sinh"
                delayMs={280}
                theme="student"
                mounted={mounted}
                prefersReducedMotion={prefersReducedMotion}
              />

              {/* 5 Feature Icons - Decomposed Staggered Entrance */}
              <div className="grid grid-cols-5 gap-1 my-5 text-center items-end">
                <FeatureTile
                  icon={<BookOpen className="w-5 h-5" strokeWidth={1.8} />}
                  label="Học liệu"
                  delayMs={320}
                  theme="student"
                  mounted={mounted}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <FeatureTile
                  icon={<GraduationCap className="w-5 h-5" strokeWidth={1.8} />}
                  label="Học tập"
                  delayMs={360}
                  theme="student"
                  mounted={mounted}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <FeatureTile
                  icon={<MessageSquare className="w-5 h-5" strokeWidth={1.8} />}
                  label="Tương tác"
                  delayMs={400}
                  theme="student"
                  mounted={mounted}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <FeatureTile
                  icon={<Lightbulb className="w-5 h-5" strokeWidth={1.8} />}
                  label="Sáng tạo"
                  delayMs={440}
                  theme="student"
                  mounted={mounted}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <FeatureTile
                  icon={<User className="w-5 h-5" strokeWidth={1.8} />}
                  label="Hồ sơ"
                  delayMs={480}
                  theme="student"
                  mounted={mounted}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleStudentEntry}
                className="group/btn w-full py-4 rounded-2xl bg-[#17657A] hover:bg-[#125061] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] cursor-pointer btn-shimmer-sweep hover:shadow-xl hover:shadow-[#17657A]/30"
              >
                <span>Khám phá cùng bé</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1.5" />
              </button>
            </TiltCard>
          </div>

          {/* ========================================================
              CARD 2: TEACHER (Cô Linh) - Stagger Delay 300ms
          ======================================================== */}
          <div
            style={{
              transform: prefersReducedMotion ? 'none' : mounted ? 'translateY(0)' : 'translateY(24px)',
              opacity: prefersReducedMotion ? 1 : mounted ? 1 : 0,
              transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 300ms, opacity 0.7s ease-out 300ms',
            }}
          >
            <TiltCard
              maxTilt={6}
              glare={true}
              className="rounded-[32px] bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(16,42,56,0.12)] hover:shadow-[0_28px_60px_rgba(16,42,56,0.18)] border border-white/90 p-6 flex flex-col justify-between group transition-shadow duration-300"
            >
              {/* Upper Artwork */}
              <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-inner bg-sky-50">
                <img
                  src="/assets/generated/craft/teacher_lesson_desk.jpg"
                  alt="Không gian giáo viên Cô Linh"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Overlapping Persona Badge */}
              <PersonaBadge
                avatarSrc="/assets/avatars/linh_teacher_headshot.png"
                fallbackSrc="/assets/avatar_colinh.png"
                name="Cô Linh"
                role="Giáo viên"
                delayMs={400}
                theme="teacher"
                mounted={mounted}
                prefersReducedMotion={prefersReducedMotion}
              />

              {/* 5 Feature Icons - Decomposed Staggered Entrance */}
              <div className="grid grid-cols-5 gap-1 my-5 text-center items-end">
                <FeatureTile
                  icon={<Tv className="w-5 h-5" strokeWidth={1.8} />}
                  label="Bài giảng"
                  delayMs={440}
                  theme="teacher"
                  mounted={mounted}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <FeatureTile
                  icon={<FileText className="w-5 h-5" strokeWidth={1.8} />}
                  label="Giáo án"
                  delayMs={480}
                  theme="teacher"
                  mounted={mounted}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <FeatureTile
                  icon={<Folder className="w-5 h-5" strokeWidth={1.8} />}
                  label="Học liệu"
                  delayMs={520}
                  theme="teacher"
                  mounted={mounted}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <FeatureTile
                  icon={<Gamepad2 className="w-5 h-5" strokeWidth={1.8} />}
                  label="Game & Sim"
                  delayMs={560}
                  theme="teacher"
                  mounted={mounted}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <FeatureTile
                  icon={<User className="w-5 h-5" strokeWidth={1.8} />}
                  label="Hồ sơ"
                  delayMs={600}
                  theme="teacher"
                  mounted={mounted}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleTeacherEntry}
                className="group/btn w-full py-4 rounded-2xl bg-[#102A38] hover:bg-[#0A1D27] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] cursor-pointer btn-shimmer-sweep hover:shadow-xl hover:shadow-[#102A38]/30"
              >
                <span>Không gian giáo viên</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1.5" />
              </button>
            </TiltCard>
          </div>
        </div>
      </main>

      {/* Bottom Bar: Join Class PIN Dock with Tactile Spring Cells */}
      <footer
        className="relative z-20 w-full px-6 py-6 flex justify-center"
        style={{
          transform: prefersReducedMotion ? 'none' : mounted ? 'translateY(0)' : 'translateY(24px)',
          opacity: prefersReducedMotion ? 1 : mounted ? 1 : 0,
          transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 450ms, opacity 0.6s ease-out 450ms',
        }}
      >
        <div className="rounded-full bg-white/95 backdrop-blur-md shadow-[0_14px_40px_rgba(16,42,56,0.16)] border border-white/90 px-6 sm:px-8 py-3.5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 transition-all">
          <div className="flex items-center gap-2 text-xs font-black text-[#102A38]">
            <LogIn className="w-4 h-4 text-[#17657A] shrink-0" />
            <span>Vào lớp bằng mã</span>
          </div>

          {/* 4 Tactile PIN Cells */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((idx) => {
              const isPopping = lastChangedIdx === idx;
              const hasVal = Boolean(pin[idx]);
              return (
                <input
                  key={idx}
                  id={`pin-${idx}`}
                  type="text"
                  maxLength={1}
                  value={pin[idx]}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(idx, e)}
                  placeholder="•"
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-center font-black text-base text-[#102A38] placeholder-slate-300 focus:outline-none transition-all duration-200 cursor-pointer select-text ${
                    hasVal
                      ? 'bg-[#17657A]/10 border-2 border-[#17657A] shadow-xs'
                      : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                  } focus:ring-2 focus:ring-[#17657A]/40 focus:border-[#17657A] focus:scale-105 ${
                    isPopping && !prefersReducedMotion ? 'animate-digit-pop' : ''
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => navigate('/join')}
            className={`group px-6 sm:px-7 py-2.5 rounded-full text-white text-xs font-black shadow-md cursor-pointer transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${
              isPinComplete
                ? 'bg-[#17657A] hover:bg-[#125061] shadow-[#17657A]/40 shadow-lg scale-[1.02]'
                : 'bg-[#17657A] hover:bg-[#125061]'
            } btn-shimmer-sweep`}
          >
            {isPinComplete && <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />}
            <span>Vào lớp</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
