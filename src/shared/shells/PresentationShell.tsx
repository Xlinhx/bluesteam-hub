import React from 'react';
import { useRouter } from '../../app/router';
import { BlueSteamLogo } from '../ui/badges/BlueSteamLogo';
import { Maximize2, Minimize2, LogOut } from 'lucide-react';

export interface PresentationShellProps {
  children: React.ReactNode;
  topicTitle?: string;
  stepIndicator?: string;
  onExit?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function PresentationShell({
  children,
  topicTitle = 'BlueSTEAM · Lớp Học Trực Quan',
  stepIndicator,
  onExit,
  isFullscreen = false,
  onToggleFullscreen,
}: PresentationShellProps) {
  const { navigate } = useRouter();

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      navigate('/teacher');
    }
  };

  return (
    <div className="relative w-screen h-screen min-h-screen bg-[#041624] text-white font-sans overflow-hidden select-none">
      {/* Background Ambience: Subtle oceanic depth gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0c3547]/40 via-[#041624] to-[#010a12] pointer-events-none" />

      {/* Top Presentation Bar - Fullscreen clean presentation header */}
      <header className="absolute top-4 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        {/* Left: Brand Logo & Topic Title */}
        <div className="flex items-center gap-4 bg-[#071e2e]/80 backdrop-blur-md px-5 py-2.5 rounded-[28px] border border-white/15 shadow-2xl pointer-events-auto">
          <BlueSteamLogo size="md" variant="light" />
          <div className="h-6 w-px bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2EE6CA] animate-pulse shrink-0" />
            <span className="font-serif font-black text-sm sm:text-base lg:text-lg tracking-[-0.02em] text-white line-clamp-1">
              {topicTitle}
            </span>
          </div>
          {stepIndicator && (
            <span className="text-xs font-bold text-[#2EE6CA] bg-[#2EE6CA]/15 px-3 py-1 rounded-full border border-[#2EE6CA]/30 hidden md:inline-block">
              {stepIndicator}
            </span>
          )}
        </div>

        {/* Right: Join Code Pill & Presentation Controls */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          )}

          {/* Exit / Return Button */}
          <button
            type="button"
            onClick={handleExit}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Thoát trình chiếu"
            aria-label="Thoát trình chiếu"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Fullscreen Presentation Canvas */}
      <main className="w-full h-full relative flex items-center justify-center z-10">
        {children}
      </main>
    </div>
  );
}
