import { useState } from 'react';
import { useRouter } from '../../app/router';
import { demoStore } from '../../demo/storage/demoStore';
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
} from 'lucide-react';

export function RoleGatewayPage() {
  const { navigate } = useRouter();
  const [pin, setPin] = useState(['', '', '', '']);

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
    if (val.length > 1) val = val.slice(-1);
    const newPin = [...pin];
    newPin[index] = val;
    setPin(newPin);
    if (val && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none bg-[#EAF2F6]">
      {/* Background Image: Coastal Study Desk Terrace */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/backgrounds/coastal_balcony_study_entry.jpg"
          alt="Coastal study terrace overlooking ocean"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-5 flex items-center justify-end">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-6 py-2 rounded-full border border-[#102A38]/50 bg-white/40 hover:bg-white/70 backdrop-blur-md text-[#102A38] font-editorial font-semibold text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs"
        >
          <User className="w-4 h-4 fill-[#102A38] text-[#102A38]" />
          <span>Đăng nhập</span>
        </button>
      </header>

      {/* Main Role Selection Area */}
      <main className="relative z-20 max-w-6xl mx-auto w-full px-6 py-4 flex flex-col items-center">
        {/* Title & Wave Underline */}
        <div className="text-center mb-8">
          <h1 className="font-editorial font-black text-4xl sm:text-5xl text-[#102A38] drop-shadow-sm tracking-[-0.02em] mb-2">
            Bắt đầu cùng BlueSTEAM
          </h1>
          <div className="flex flex-col items-center gap-1 text-[#17657A]">
            <svg width="64" height="8" viewBox="0 0 64 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4C8 1 14 7 20 4C26 1 32 7 38 4C44 1 50 7 56 4C59 2.5 61 3.5 62 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <svg width="64" height="8" viewBox="0 0 64 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4C8 1 14 7 20 4C26 1 32 7 38 4C44 1 50 7 56 4C59 2.5 61 3.5 62 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 2 Role Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 w-full max-w-4xl">
          {/* Card 1: Student (Bé An) */}
          <div className="rounded-[32px] bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(16,42,56,0.12)] border border-white/90 p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-200">
            {/* Upper Artwork */}
            <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-inner bg-amber-50">
              <img
                src="/assets/generated/craft/child_sketchbook_whale.jpg"
                alt="Bé An khám phá"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Overlapping Persona Badge */}
            <div className="relative -mt-7 z-10 mx-auto px-5 py-2 rounded-full bg-white shadow-lg border border-slate-100 flex items-center gap-2.5 transition-transform hover:scale-105">
              <img
                src="/assets/avatars/an_student_avatar.png"
                alt="Bé An - Học sinh"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#17657A]/20 shadow-xs shrink-0"
              />
              <div className="flex flex-col text-left">
                <span className="font-editorial font-black text-base text-[#102A38] leading-tight">An</span>
                <span className="text-[10px] font-bold text-[#17657A] leading-tight">Học sinh</span>
              </div>
            </div>

            {/* 5 Feature Icons - enlarged 50% */}
            <div className="grid grid-cols-5 gap-1 my-5 text-center items-end">
              <div className="flex flex-col items-center gap-1.5">
                <BookOpen className="w-[30px] h-[30px] text-[#17657A]" strokeWidth={1.8} />
                <span className="text-[11px] font-bold text-slate-700">Học liệu</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <GraduationCap className="w-[30px] h-[30px] text-[#17657A]" strokeWidth={1.8} />
                <span className="text-[11px] font-bold text-slate-700">Học tập</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <MessageSquare className="w-[30px] h-[30px] text-[#17657A]" strokeWidth={1.8} />
                <span className="text-[11px] font-bold text-slate-700">Tương tác</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Lightbulb className="w-[30px] h-[30px] text-[#17657A]" strokeWidth={1.8} />
                <span className="text-[11px] font-bold text-slate-700">Sáng tạo</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <User className="w-[30px] h-[30px] text-[#17657A]" strokeWidth={1.8} />
                <span className="text-[11px] font-bold text-slate-700">Hồ sơ</span>
              </div>
            </div>

            {/* Primary Action */}
            <button
              type="button"
              onClick={handleStudentEntry}
              className="w-full py-4 rounded-2xl bg-[#17657A] hover:bg-[#125061] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Khám phá cùng bé</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Teacher (Cô Linh) */}
          <div className="rounded-[32px] bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(16,42,56,0.12)] border border-white/90 p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-200">
            {/* Upper Artwork */}
            <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-inner bg-sky-50">
              <img
                src="/assets/generated/craft/teacher_lesson_desk.jpg"
                alt="Không gian giáo viên Cô Linh"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Overlapping Persona Badge */}
            <div className="relative -mt-7 z-10 mx-auto px-5 py-2 rounded-full bg-white shadow-lg border border-slate-100 flex items-center gap-2.5 transition-transform hover:scale-105">
              <img
                src="/assets/avatars/linh_teacher_headshot.png"
                alt="Cô Linh - Giáo viên"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#102A38]/20 shadow-xs shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/assets/avatar_colinh.png';
                }}
              />
              <div className="flex flex-col text-left">
                <span className="font-editorial font-black text-base text-[#102A38] leading-tight">Cô Linh</span>
                <span className="text-[10px] font-bold text-[#102A38] leading-tight">Giáo viên</span>
              </div>
            </div>

            {/* 5 Feature Icons - enlarged 50% */}
            <div className="grid grid-cols-5 gap-1 my-5 text-center items-end">
              <div className="flex flex-col items-center gap-1.5">
                <Tv className="w-[30px] h-[30px] text-[#102A38]" strokeWidth={1.8} />
                <span className="text-[11px] font-bold text-slate-700">Bài giảng</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <FileText className="w-[30px] h-[30px] text-[#102A38]" strokeWidth={1.8} />
                <span className="text-[11px] font-bold text-slate-700">Giáo án</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Folder className="w-[30px] h-[30px] text-[#102A38]" strokeWidth={1.8} />
                <span className="text-[11px] font-bold text-slate-700">Học liệu</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Gamepad2 className="w-[30px] h-[30px] text-[#102A38]" strokeWidth={1.8} />
                <span className="text-[11px] font-bold text-slate-700">Game & Sim</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <User className="w-[30px] h-[30px] text-[#102A38]" strokeWidth={1.8} />
                <span className="text-[11px] font-bold text-slate-700">Hồ sơ</span>
              </div>
            </div>

            {/* Primary Action */}
            <button
              type="button"
              onClick={handleTeacherEntry}
              className="w-full py-4 rounded-2xl bg-[#102A38] hover:bg-[#0A1D27] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Không gian giáo viên</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Bar: Join Class PIN */}
      <footer className="relative z-20 w-full px-6 py-6 flex justify-center">
        <div className="rounded-full bg-white/95 backdrop-blur-md shadow-[0_12px_36px_rgba(16,42,56,0.15)] border border-white/90 px-8 py-3.5 flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-[#102A38]">
            <LogIn className="w-4 h-4 text-[#17657A]" />
            <span>Vào lớp bằng mã</span>
          </div>

          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((idx) => (
              <input
                key={idx}
                id={`pin-${idx}`}
                type="text"
                maxLength={1}
                value={pin[idx]}
                onChange={(e) => handlePinChange(idx, e.target.value)}
                placeholder="•"
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-center font-black text-base text-[#102A38] focus:outline-none focus:ring-2 focus:ring-[#17657A]"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate('/join')}
            className="px-7 py-2.5 rounded-full bg-[#17657A] hover:bg-[#125061] text-white text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
          >
            Vào lớp
          </button>
        </div>
      </footer>
    </div>
  );
}
