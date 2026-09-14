import { useState } from 'react';
import { useRouter } from '../../app/router';
import { demoStore } from '../../demo/storage/demoStore';
import { BlueSteamLogo } from '../../shared/components/BlueSteamLogo';
import { LanguageToggle } from '../../shared/components/LanguageToggle';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export function TeacherLoginPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('linh.nguyen@mamnon.edu.vn');
  const [password, setPassword] = useState('daiduong2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    demoStore.setProfile({
      role: 'teacher',
      id: 'teacher-linh',
      name: 'Cô Linh',
    });
    setTimeout(() => {
      navigate('/teacher');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF9F6] text-[#12384B] font-sans selection:bg-teal-100 selection:text-teal-900 select-none">
      {/* ========================================================= */}
      {/* LEFT PANEL: Naturalist Field Journal & Coastal Vista (50%)*/}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-[480px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 overflow-hidden">
        {/* Full Bleed Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/generated/backgrounds/field_journal_coastal_rocks.jpg"
            alt="Sổ tay thực địa đại dương bên ghềnh đá"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Top-Left Brand Logo */}
        <div className="relative z-10">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer focus:outline-none flex flex-col items-start"
          >
            <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-white/80 mb-2 hover:bg-white transition-colors">
              <BlueSteamLogo size="lg" />
            </div>
            <span className="text-xs font-black tracking-widest text-[#102A38] uppercase bg-white/85 backdrop-blur-sm px-3.5 py-1 rounded-full shadow-xs">
              Học cùng đại dương
            </span>
          </button>
        </div>

        {/* Bottom pedagogical note */}
        <div className="relative z-10">
          <div className="max-w-xs p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-md">
            <p className="text-xs text-[#102A38] font-bold leading-relaxed">
              Không gian quản lý bài giảng, giáo án tương tác và học liệu số dành cho giáo viên mầm non & tiểu học.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: Clean Adult Login Form (50%)                */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-8 sm:p-14 lg:p-20 bg-[#FAF9F6] overflow-hidden">
        {/* Top-Right Language Switcher */}
        <div className="w-full flex justify-end">
          <LanguageToggle />
        </div>

        {/* Centered Login Box */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <h1 className="font-editorial font-black text-4xl sm:text-5xl text-[#102A38] tracking-[-0.02em] mb-8">
            Đăng nhập
          </h1>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#102A38]">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-sm font-semibold text-[#102A38] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17657A] focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#102A38]">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white border border-slate-300 text-sm font-semibold text-[#102A38] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17657A] focus:border-transparent transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                className="text-xs font-bold text-[#102A38] hover:text-[#17657A] hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-[#F67650] hover:bg-[#E5633D] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>{isSubmitting ? 'Đang xác thực...' : 'Đăng nhập'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/entry')}
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-[#102A38]/30 text-[#102A38] font-bold text-sm shadow-xs flex items-center justify-center cursor-pointer transition-all active:scale-95"
              >
                Tạo tài khoản
              </button>
            </div>

            {/* Return to Home Link */}
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 text-xs font-extrabold text-[#17657A] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về trang chủ</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Right pedagogical tag */}
        <div className="w-full flex justify-end items-end pt-6 relative">
          <div className="text-right space-y-1">
            <p className="text-[11px] font-black tracking-widest uppercase text-[#17657A]">
              BlueSTEAM Education Suite
            </p>
            <p className="text-[10px] font-bold tracking-wider text-slate-500">
              Hệ sinh thái học liệu & giáo cụ biển chuẩn mực
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
