import { useRouter } from '../../../app/router';
import { PublicShell } from '../../../shared/shells/PublicShell';
import { Compass, Home } from 'lucide-react';

export function NotFoundPage() {
  const { currentRoute, navigate } = useRouter();

  return (
    <PublicShell>
      <div className="min-h-[75vh] flex items-center justify-center px-6 py-16 bg-[#FAF8F5]">
        <div className="max-w-lg w-full rounded-[28px] bg-white border border-[#12384B]/10 shadow-[0_14px_40px_rgba(18,56,75,0.08)] p-8 sm:p-10 text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-[#E4F4F8] text-[#15586E] mx-auto flex items-center justify-center">
            <Compass className="w-10 h-10" />
          </div>
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#EFEAE1] text-[#12384B] text-xs font-bold">
            Mã lỗi 404
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#12384B]">
            Không tìm thấy trang này
          </h1>
          <p className="text-sm text-[#436475] leading-relaxed">
            Đường dẫn <code className="font-mono text-xs bg-[#FAF8F5] px-2 py-0.5 rounded">{currentRoute}</code> không tồn tại hoặc đã được chuyển sang khu vực mới trong BlueSTEAM.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="h-12 min-h-[48px] px-6 rounded-full bg-[#15586E] hover:bg-[#114759] text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Về trang chủ của bé</span>
            </button>

          </div>
        </div>
      </div>
    </PublicShell>
  );
}
