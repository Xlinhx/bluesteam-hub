import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { oceanAudio } from '../../shared/sound/oceanAudio';
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  Delete,
  Check,
  AlertCircle,
} from 'lucide-react';

export function JoinSessionPage() {
  const { navigate } = useRouter();

  const [digits, setDigits] = useState<string[]>(['4', '8', '2', '9', '1', '5']); // Pre-filled with demo code for convenience
  const [step, setStep] = useState<1 | 2>(1); // 1: Nhập mã, 2: Chọn tên
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDigitPress = (num: string) => {
    setDigits((prev) => {
      if (prev.length < 6) {
        const next = [...prev, num];
        oceanAudio.playChime(440 + next.length * 40, 0.15);
        return next;
      }
      return prev;
    });
    setErrorMessage(null);
  };

  const handleDelete = () => {
    setDigits((prev) => {
      if (prev.length > 0) {
        oceanAudio.playChime(350, 0.1);
        return prev.slice(0, -1);
      }
      return prev;
    });
    setErrorMessage(null);
  };

  const handleClear = () => {
    setDigits([]);
    setErrorMessage(null);
  };

  const handleSubmitCode = () => {
    const code = digits.join('');
    if (code.length === 6) {
      oceanAudio.playChime(659, 0.4);
      setStep(2);
    } else {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã lớp do cô cung cấp (ví dụ: 482915).');
      oceanAudio.playChime(220, 0.5);
    }
  };

  const handleConfirmStudent = () => {
    oceanAudio.speak('Chào mừng bé An đến với lớp Sao Biển!');
    navigate('/student');
  };

  const handleHearGuide = () => {
    oceanAudio.speak('Vào lớp của em. Hãy nhập sáu chữ số mã lớp do cô cung cấp để tham gia nhé!');
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleSubmitCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [digits]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col justify-between pb-28">
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Side: Sea Turtle Banner (7 cols) */}
        <div className="lg:col-span-7 relative bg-sky-950 text-white p-8 sm:p-12 flex flex-col justify-between pb-12 lg:pb-12">
          {/* Turtle Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/assets/generated_sea_turtle.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sky-950/90 via-sky-950/75 to-sky-950/40 pointer-events-none" />

          {/* Top Brand & Back button */}
          <div className="relative z-10 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-3xl font-serif font-bold text-white tracking-tight cursor-pointer"
            >
              Ocean
            </button>

            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về trang chủ</span>
            </button>
          </div>

          {/* Middle Title & Description */}
          <div className="relative z-10 my-auto max-w-lg space-y-4 py-12">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white leading-tight drop-shadow-md">
              Cùng lớp khám phá đại dương
            </h1>
            <p className="text-sm sm:text-base text-sky-100 leading-relaxed drop-shadow">
              Tham gia lớp học để cùng cô và các bạn khám phá những điều kì diệu dưới làn nước xanh!
            </p>
          </div>

          {/* Bottom 3-Step Stepper */}
          <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between max-w-md">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow ${
                step === 1 ? 'bg-sky-500 text-white ring-2 ring-white' : 'bg-emerald-500 text-white'
              }`}>
                {step === 1 ? '1' : <Check className="w-4 h-4" />}
              </span>
              <div className="text-left">
                <span className="font-bold text-xs text-white block">Nhập mã</span>
                <span className="text-[10px] text-sky-200">Mã lớp 6 số</span>
              </div>
            </div>

            <div className="w-8 h-0.5 bg-white/30" />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 2 ? 'bg-sky-500 text-white ring-2 ring-white' : 'bg-white/20 text-neutral-300'
              }`}>
                2
              </span>
              <div className="text-left">
                <span className="font-bold text-xs text-white block">Chọn tên</span>
                <span className="text-[10px] text-sky-200">Bé An</span>
              </div>
            </div>

            <div className="w-8 h-0.5 bg-white/30" />

            {/* Step 3 */}
            <div className="flex items-center gap-2 opacity-60">
              <span className="w-8 h-8 rounded-full bg-white/20 text-neutral-300 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <div className="text-left">
                <span className="font-bold text-xs text-white block">Vào lớp</span>
                <span className="text-[10px] text-sky-200">Sao Biển</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Keypad & Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-8 sm:p-12 flex flex-col justify-between space-y-6 pb-12 lg:pb-12">
          {/* Top Audio Guide */}
          <div className="flex justify-end">
            <button
              onClick={handleHearGuide}
              className="px-4 py-2 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-900 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer border border-sky-100"
            >
              <Volume2 className="w-4 h-4 text-sky-700" />
              <span>Nghe hướng dẫn</span>
            </button>
          </div>

          {/* Form Step 1: Nhập mã */}
          {step === 1 && (
            <div className="max-w-sm mx-auto w-full space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-3xl font-serif font-bold text-sky-950">
                  Vào lớp của em
                </h2>
                <p className="text-xs text-neutral-500">
                  Nhập mã lớp do cô cung cấp để tham gia.
                </p>
              </div>

              {/* 6 Digits Display */}
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const digit = digits[idx];
                  return (
                    <div
                      key={idx}
                      className={`w-11 h-14 sm:w-12 sm:h-16 rounded-2xl border-2 flex items-center justify-center font-mono text-2xl font-bold transition-all ${
                        digit
                          ? 'border-sky-500 bg-sky-50/70 text-sky-950 shadow-sm'
                          : idx === digits.length
                          ? 'border-sky-400 bg-white ring-2 ring-sky-200 text-transparent animate-pulse'
                          : 'border-sky-100 bg-neutral-50 text-neutral-300'
                      }`}
                    >
                      {digit || '•'}
                    </div>
                  );
                })}
              </div>

              {/* Error Notification if any */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="leading-tight">{errorMessage}</p>
                </div>
              )}

              {/* Numeric Keypad (1 to 9, 0, backspace) */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleDigitPress(num)}
                    className="h-13 sm:h-14 rounded-2xl bg-neutral-50 hover:bg-sky-100/70 active:bg-sky-200 border border-sky-100 text-xl font-bold font-mono text-sky-950 shadow-sm transition-all cursor-pointer"
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={handleClear}
                  className="h-13 sm:h-14 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-500 cursor-pointer"
                >
                  Xóa hết
                </button>

                <button
                  onClick={() => handleDigitPress('0')}
                  className="h-13 sm:h-14 rounded-2xl bg-neutral-50 hover:bg-sky-100/70 active:bg-sky-200 border border-sky-100 text-xl font-bold font-mono text-sky-950 shadow-sm transition-all cursor-pointer"
                >
                  0
                </button>

                <button
                  onClick={handleDelete}
                  className="h-13 sm:h-14 rounded-2xl bg-neutral-50 hover:bg-rose-50 border border-sky-100 flex items-center justify-center text-neutral-600 hover:text-rose-600 transition-all cursor-pointer"
                  title="Xóa ký tự"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitCode}
                className="w-full py-4 rounded-2xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Tìm lớp</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Hint banner */}
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-center flex items-center justify-center gap-2 text-xs text-sky-900 font-medium">
                <Volume2 className="w-4 h-4 text-sky-700" />
                <span>Mã lớp ở trên màn hình của cô.</span>
              </div>
            </div>
          )}

          {/* Form Step 2: Chọn danh tính An */}
          {step === 2 && (
            <div className="max-w-sm mx-auto w-full space-y-6 text-center animate-fadeIn">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  ✓ Đã tìm thấy: Lớp Sao Biển
                </span>
                <h2 className="text-2xl font-serif font-bold text-sky-950 pt-2">
                  Em có phải là bé An?
                </h2>
                <p className="text-xs text-neutral-500">
                  Chọn tên của em để cô Linh điểm danh nhé.
                </p>
              </div>

              <div
                onClick={handleConfirmStudent}
                className="p-5 rounded-3xl bg-sky-50 border-2 border-sky-400 shadow-md flex items-center justify-between cursor-pointer hover:bg-sky-100/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/avatar_an.png"
                    alt="Bé An"
                    className="w-14 h-14 rounded-full border-2 border-sky-500 shadow"
                  />
                  <div className="text-left">
                    <h3 className="font-bold text-base text-sky-950">Bé An</h3>
                    <p className="text-xs text-neutral-500">Lớp Sao Biển · 24 bạn</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-sky-900 text-white flex items-center justify-center shadow">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <button
                onClick={handleConfirmStudent}
                className="w-full py-4 rounded-2xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Vào lớp ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setStep(1)}
                className="text-xs text-neutral-500 hover:text-neutral-700 cursor-pointer"
              >
                ← Nhập mã lớp khác
              </button>
            </div>
          )}

          {/* Footer Link */}
          <div className="text-center text-xs text-neutral-500 pt-4 border-t border-sky-100">
            <span>Giáo viên? </span>
            <button
              onClick={() => navigate('/login')}
              className="font-bold text-sky-700 hover:text-sky-900 cursor-pointer underline ml-1"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
