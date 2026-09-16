import { useState } from 'react';
import { useRouter } from '../../app/router';
import { demoStore } from '../../demo/storage/demoStore';
import { BlueSteamLogo } from '../../shared/components/BlueSteamLogo';
import { LanguageToggle } from '../../shared/components/LanguageToggle';
import { OceanMotesCanvas } from '../../shared/components/OceanMotesCanvas';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF8F5] text-[#12384B] font-sans selection:bg-teal-100 selection:text-teal-900 select-none">
      {/* ========================================================= */}
      {/* LEFT PANEL: Naturalist Field Journal & Coastal Vista (50%)*/}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-[380px] lg:min-h-screen flex flex-col justify-start p-8 sm:p-12 overflow-hidden">
        {/* Full Bleed Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/assets/generated/backgrounds/field_journal_coastal_rocks.jpg"
            alt="Sổ tay thực địa đại dương bên ghềnh đá"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
          {/* Subtle coastal sunbeams and floating spray motes */}
          <div className="absolute inset-0 ocean-sunbeams pointer-events-none opacity-30" />
          <OceanMotesCanvas count={16} color="rgba(255, 255, 255, 0.40)" />
        </div>

        {/* Top Brand Logo matching Mockup (Ảnh 1) */}
        <div className="relative z-10 w-full flex justify-center pt-4 sm:pt-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer focus:outline-none group transition-transform duration-200 active:scale-95 text-center flex flex-col items-center"
            aria-label="Về trang chủ BlueSTEAM"
          >
            <BlueSteamLogo
              size="lg"
              variant="mockup"
              showTagline={true}
              className="drop-shadow-[0_2px_12px_rgba(255,255,255,0.85)] hover:opacity-95 transition-opacity"
            />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: Clean Adult Login Form (50%)                */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-8 sm:p-14 lg:p-16 bg-[#FAF8F5] overflow-hidden">
        {/* Top-Right Language Switcher matching Mockup (Ảnh 3) */}
        <div className="w-full flex justify-end relative z-20">
          <LanguageToggle variant="dropdown" />
        </div>

        {/* Centered Login Box matching Mockup (Ảnh 5) */}
        <div className="max-w-md w-full mx-auto my-auto py-6 sm:py-8 relative z-20">
          <h1 className="font-editorial font-bold text-5xl sm:text-[56px] text-[#0A2540] tracking-tight mb-8 leading-none">
            Đăng nhập
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-[#0A2540]">
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
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/90 border border-slate-200 text-sm font-semibold text-[#0A2540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17657A]/40 focus:border-[#17657A] transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-[#0A2540]">
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
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-white/90 border border-slate-200 text-sm font-semibold text-[#0A2540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17657A]/40 focus:border-[#17657A] transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                className="text-xs sm:text-[13px] font-semibold text-[#102A38] hover:text-[#17657A] hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#DC6B52] hover:bg-[#C95A42] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.97] btn-shimmer-sweep"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/entry')}
                className="w-full py-3.5 rounded-xl bg-white/60 hover:bg-white border border-[#102A38] text-[#102A38] font-bold text-sm shadow-2xs flex items-center justify-center cursor-pointer transition-all active:scale-[0.97]"
              >
                Tạo tài khoản
              </button>
            </div>

            {/* Return to Home Link */}
            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#102A38] hover:text-[#17657A] hover:underline cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về trang chủ</span>
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM DECORATION: Ocean Waves & Coral Reef (Ảnh 5)       */}
        {/* ========================================================= */}
        <div className="absolute inset-x-0 bottom-0 h-48 sm:h-56 pointer-events-none overflow-hidden z-10">
          {/* Coral Reef Silhouette rising naturally behind foreground wave */}
          <div className="absolute right-2 sm:right-6 bottom-0 z-0">
            <img
              src="/assets/generated/coral_branch.png"
              alt="Rặng san hô"
              className="w-32 sm:w-40 h-auto object-contain opacity-85 select-none"
            />
          </div>

          {/* Fluid Ocean Waves SVG with Living Wave Undulation */}
          <svg
            className="absolute inset-0 w-full h-full object-cover z-10"
            viewBox="0 0 700 220"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Wave Layer */}
            <path
              d="M0 175C130 140 260 195 440 160C560 135 630 145 700 135V220H0V175Z"
              fill="#E1ECE8"
              fillOpacity="0.85"
              className="wave-sway-1"
            />
            {/* Foreground Wave Layer */}
            <path
              d="M0 192C150 165 290 205 470 170C570 150 645 155 700 150V220H0V192Z"
              fill="#CADBD4"
              className="wave-sway-2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
