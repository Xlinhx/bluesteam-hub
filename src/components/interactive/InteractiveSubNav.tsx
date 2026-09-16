import { useRouter } from '../../app/router';
import { Gamepad2, Compass } from 'lucide-react';
import { IsometricCubeIcon } from '../3d/Ocean3DSvgs';

export type InteractiveTabKey = 'games' | 'simulations' | '3d';

export interface InteractiveSubNavProps {
  activeTab: InteractiveTabKey;
  className?: string;
}

export function InteractiveSubNav({ activeTab, className = '' }: InteractiveSubNavProps) {
  const { navigate } = useRouter();

  return (
    <div
      className={`inline-flex items-center p-1 sm:p-1.5 rounded-full bg-[#FAF7F0] border border-[#EAE5DB] shadow-[0_2px_8px_rgba(16,42,56,0.06)] relative z-20 ${className}`}
    >
      {/* 1. Trò chơi khám phá */}
      <button
        type="button"
        onClick={() => navigate('/interactive')}
        className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-extrabold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
          activeTab === 'games'
            ? 'bg-[#0E2942] text-white shadow-sm'
            : 'text-[#102A38]/80 hover:text-[#102A38] hover:bg-[#EAE4D5]/60'
        }`}
      >
        <Gamepad2 className={`w-4 h-4 ${activeTab === 'games' ? 'text-white' : 'text-[#102A38]'}`} />
        <span>Trò chơi khám phá</span>
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-[#E2DCD0] mx-0.5" />

      {/* 2. Mô phỏng tình huống */}
      <button
        type="button"
        onClick={() => navigate('/interactive/simulations')}
        className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-extrabold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
          activeTab === 'simulations'
            ? 'bg-[#0E2942] text-white shadow-sm'
            : 'text-[#102A38]/80 hover:text-[#102A38] hover:bg-[#EAE4D5]/60'
        }`}
      >
        <Compass className={`w-4 h-4 ${activeTab === 'simulations' ? 'text-white' : 'text-[#102A38]'}`} />
        <span>Mô phỏng tình huống</span>
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-[#E2DCD0] mx-0.5" />

      {/* 3. Khám phá 3D */}
      <button
        type="button"
        onClick={() => navigate('/interactive/3d')}
        className={`px-5 sm:px-6 py-2 rounded-full text-xs sm:text-[13px] font-extrabold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
          activeTab === '3d'
            ? 'bg-[#0E2942] text-white shadow-sm'
            : 'text-[#102A38]/80 hover:text-[#102A38] hover:bg-[#EAE4D5]/60'
        }`}
      >
        <IsometricCubeIcon className={`w-4 h-4 ${activeTab === '3d' ? 'text-white' : 'text-[#102A38]'}`} />
        <span>Khám phá 3D</span>
      </button>
    </div>
  );
}
