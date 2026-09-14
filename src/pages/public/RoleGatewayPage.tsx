import { useState } from 'react';
import { useRouter } from '../../app/router';
import { demoStore } from '../../demo/storage/demoStore';
import { BlueSteamLogo } from '../../shared/components/BlueSteamLogo';
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
      avatarKey: 'turtle',
    });
    navigate('/home');
  };

  const handleTeacherEntry = () => {
    demoStore.setProfile({
      role: 'teacher',
      id: 'teacher-linh',
      name: 'Cô Linh',
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
      {/* Background Image: Coastal Terrace Balcony */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/backgrounds/coastal_balcony_ocean.jpg"
          alt="Coastal terrace overlooking ocean"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cursor-pointer focus:outline-none"
        >
          <BlueSteamLogo size="lg" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 rounded-full bg-white/90 hover:bg-white text-[#102A38] font-extrabold text-xs shadow-md border border-white/80 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <User className="w-4 h-4 text-[#17657A]" />
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
          <div className="flex justify-center text-[#17657A]">
            <svg width="64" height="12" viewBox="0 0 64 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6C8 2 14 10 20 6C26 2 32 10 38 6C44 2 50 10 56 6C59 4 61 5 62 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
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
            <div className="relative -mt-6 z-10 mx-auto px-6 py-2 rounded-full bg-white shadow-lg border border-slate-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#17657A] text-white flex items-center justify-center font-black text-xs">
                🌊
              </div>
              <span className="font-editorial font-black text-base text-[#102A38]">An</span>
            </div>

            {/* 5 Feature Icons */}
            <div className="grid grid-cols-5 gap-1 my-5 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <BookOpen className="w-5 h-5 text-[#17657A]" />
                <span className="text-[11px] font-bold text-slate-600">Học liệu</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <GraduationCap className="w-5 h-5 text-[#17657A]" />
                <span className="text-[11px] font-bold text-slate-600">Học tập</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <MessageSquare className="w-5 h-5 text-[#17657A]" />
                <span className="text-[11px] font-bold text-slate-600">Tương tác</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Lightbulb className="w-5 h-5 text-[#17657A]" />
                <span className="text-[11px] font-bold text-slate-600">Sáng tạo</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <User className="w-5 h-5 text-[#17657A]" />
                <span className="text-[11px] font-bold text-slate-600">Hồ sơ</span>
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
            <div className="relative -mt-6 z-10 mx-auto px-6 py-2 rounded-full bg-white shadow-lg border border-slate-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#102A38] text-white flex items-center justify-center font-black text-xs">
                🌊
              </div>
              <span className="font-editorial font-black text-base text-[#102A38]">Cô Linh</span>
            </div>

            {/* 5 Feature Icons */}
            <div className="grid grid-cols-5 gap-1 my-5 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Tv className="w-5 h-5 text-[#102A38]" />
                <span className="text-[11px] font-bold text-slate-600">Bài giảng</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <FileText className="w-5 h-5 text-[#102A38]" />
                <span className="text-[11px] font-bold text-slate-600">Giáo án</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Folder className="w-5 h-5 text-[#102A38]" />
                <span className="text-[11px] font-bold text-slate-600">Học liệu</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Gamepad2 className="w-5 h-5 text-[#102A38]" />
                <span className="text-[11px] font-bold text-slate-600">Game & Sim</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <User className="w-5 h-5 text-[#102A38]" />
                <span className="text-[11px] font-bold text-slate-600">Hồ sơ</span>
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
