import { useState, useRef } from 'react';
import { useRouter } from '../../../app/router';
import { usePublicMotion } from '../components/usePublicMotion';
import './entry-motion.css';
import { OceanFieldwork, RoleConnections } from '../components/OceanFieldwork';
import {
  User,
  BookOpen,
  Gamepad2,
  Palette,
  ChevronRight,
} from 'lucide-react';

interface FeatureTileProps {
  icon: React.ReactNode;
  label: string;
  theme: 'student' | 'teacher';
}

function FeatureTile({
  icon,
  label,
  theme,
}: FeatureTileProps) {
  return (
    <div
      className="entry-feature flex flex-col items-center gap-1.5 p-1 sm:p-1.5 rounded-xl transition-colors duration-200 group/icon select-none"
    >
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-colors duration-200  ${
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
  theme: 'student' | 'teacher';
}

function PersonaBadge({
  avatarSrc,
  fallbackSrc,
  name,
  role,
  theme,
}: PersonaBadgeProps) {
  const [imgSrc, setImgSrc] = useState(avatarSrc);

  return (
    <div
      className="entry-persona relative -mt-7 z-10 mx-auto px-5 py-2 rounded-full bg-white shadow-lg border border-slate-100 flex items-center gap-2.5 transition-colors duration-200  group/badge"
    >
      <img
        src={imgSrc}
        alt={`${name} - ${role}`}
        className={`w-10 h-10 rounded-full object-cover shadow-xs shrink-0 ring-2 transition-transform duration-200  ${
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
  const root = useRef<HTMLDivElement>(null);
  usePublicMotion(root, 'entry');

  const handleStudentEntry = () => {
    navigate('/login', { query: { role: 'student' }, preserveQuery: false });
  };

  const handleTeacherEntry = () => {
    navigate('/login', { query: { role: 'teacher' }, preserveQuery: false });
  };

  return (
    <div ref={root} className="entry-page relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none bg-[#EAF2F6]">
      {/* Background Image: Coastal Study Desk Terrace */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="entry-backdrop w-full h-full">
          <img
            src="/assets/generated/public-fieldwork/marine-field-station.webp"
            alt="Trạm thám hiểm khoa học biển"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="entry-atmosphere absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      </div>

      <OceanFieldwork variant="entry" />
      {/* Top Header */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-5 flex items-center justify-end">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="group px-6 py-2.5 min-h-[48px] rounded-full border border-[#102A38]/40 bg-white/60 hover:bg-white/90 backdrop-blur-md text-[#102A38] font-editorial font-semibold text-sm flex items-center gap-2 cursor-pointer transition-colors duration-200 active:scale-95 shadow-xs"
        >
          <User className="w-4 h-4 text-[#102A38]" />
          <span>Đăng nhập giáo viên</span>
        </button>
      </header>

      {/* Main Role Selection Area */}
      <main className="relative z-20 max-w-6xl mx-auto w-full px-6 py-4 flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="font-editorial font-black text-4xl sm:text-5xl text-[#102A38] drop-shadow-sm tracking-[-0.02em] mb-2.5">
            Bắt đầu cùng BlueSTEAM
          </h1>
          <div className="flex flex-col items-center gap-1 text-[#17657A]">
            <svg width="68" height="8" viewBox="0 0 64 8" fill="none" aria-hidden="true">
              <path
                className="entry-wave" pathLength="1" strokeDasharray="1"
                d="M2 4C8 1 14 7 20 4C26 1 32 7 38 4C44 1 50 7 56 4C59 2.5 61 3.5 62 4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* 2 Role Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 w-full max-w-4xl">
          {/* CARD 1: LEARNER */}
          <div>
            <div
              data-role="student" className="entry-role-card rounded-[32px] bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(16,42,56,0.12)] border border-white/90 p-6 flex flex-col justify-between group transition-shadow duration-300"
            >
              <RoleConnections />
              <div className="entry-role-art relative w-full h-56 rounded-2xl overflow-hidden shadow-inner bg-amber-50">
                <img
                  src="/assets/generated/craft/child_sketchbook_whale.jpg"
                  alt="Bé khám phá đại dương"
                  className="w-full h-full object-cover object-center "
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
              </div>

              <PersonaBadge
                avatarSrc="/assets/avatars/an_student_avatar.png"
                fallbackSrc="/assets/avatar_an.png"
                name="Góc của Bé"
                role="Khám phá & Sáng tạo"
                theme="student"
              />

              {/* Learner activities */}
              <div className="grid grid-cols-3 gap-2 my-5 text-center items-end">
                <FeatureTile
                  icon={<BookOpen className="w-5 h-5" strokeWidth={1.8} />}
                  label="Học liệu"
                  theme="student"
                />
                <FeatureTile
                  icon={<Gamepad2 className="w-5 h-5" strokeWidth={1.8} />}
                  label="Tương tác"
                  theme="student"
                />
                <FeatureTile
                  icon={<Palette className="w-5 h-5" strokeWidth={1.8} />}
                  label="Sáng tạo"
                  theme="student"
                />
              </div>

              <button
                type="button"
                onClick={handleStudentEntry}
                className="entry-role-action group/btn w-full py-4 min-h-[56px] rounded-2xl bg-[#17657A] hover:bg-[#125061] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-colors duration-200 active:scale-[0.97] cursor-pointer"
              >
                <span>Khám phá cùng bé</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1.5" />
              </button>
            </div>
          </div>

          {/* CARD 2: TEACHER */}
          <div>
            <div
              data-role="teacher" className="entry-role-card rounded-[32px] bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(16,42,56,0.12)] border border-white/90 p-6 flex flex-col justify-between group transition-shadow duration-300"
            >
              <RoleConnections />
              <div className="entry-role-art relative w-full h-56 rounded-2xl overflow-hidden shadow-inner bg-sky-50">
                <img
                  src="/assets/generated/craft/teacher_lesson_desk.jpg"
                  alt="Không gian giáo viên"
                  className="w-full h-full object-cover object-center "
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
              </div>

              <PersonaBadge
                avatarSrc="/assets/avatars/linh_teacher_headshot.png"
                fallbackSrc="/assets/avatar_colinh.png"
                name="Thầy Cô"
                role="Chuẩn bị nội dung khám phá"
                theme="teacher"
              />

              {/* Teacher activities */}
              <div className="grid grid-cols-3 gap-2 my-5 text-center items-end">
                <FeatureTile
                  icon={<BookOpen className="w-5 h-5" strokeWidth={1.8} />}
                  label="Học liệu"
                  theme="teacher"
                />
                <FeatureTile
                  icon={<Gamepad2 className="w-5 h-5" strokeWidth={1.8} />}
                  label="Tương tác"
                  theme="teacher"
                />
                <FeatureTile
                  icon={<Palette className="w-5 h-5" strokeWidth={1.8} />}
                  label="Sáng tạo"
                  theme="teacher"
                />
              </div>

              <button
                type="button"
                onClick={handleTeacherEntry}
                className="entry-role-action group/btn w-full py-4 min-h-[56px] rounded-2xl bg-[#102A38] hover:bg-[#0A1D27] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-colors duration-200 active:scale-[0.97] cursor-pointer"
              >
                <span>Không gian giáo viên</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1.5" />
              </button>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
