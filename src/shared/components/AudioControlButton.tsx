import { useState, useEffect } from 'react';
import { oceanAudio } from '../sound/oceanAudio';

export interface AudioControlButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  onToggle?: (speaking: boolean) => void;
}

export function AudioControlButton({
  size = 'md',
  className = '',
  onClick,
  onToggle,
}: AudioControlButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(oceanAudio.speaking);
  const [isMuted, setIsMuted] = useState(oceanAudio.isSpeechMuted);

  useEffect(() => {
    const unsubscribe = oceanAudio.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsubscribe;
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (onToggle) {
      onToggle(isSpeaking);
      return;
    }
    const nextMuted = !isMuted;
    oceanAudio.setSpeechMuted(nextMuted);
    oceanAudio.setAmbientMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  const dimensions = {
    sm: 'w-11 h-11 min-w-[44px] min-h-[44px]',
    md: 'w-14 h-14 min-w-[56px] min-h-[56px]',
    lg: 'w-16 h-16 min-w-[64px] min-h-[64px]',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      className={`relative inline-flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17657A]/40 active:scale-95 ${
        isMuted
          ? 'bg-[#EFEAE1]/90 text-[#12384B]/40 border border-[#12384B]/10 shadow-2xs'
          : isSpeaking
          ? 'bg-[#17657A] text-white shadow-[0_4px_16px_rgba(23,101,122,0.45)] ring-4 ring-[#2EE6CA]/50'
          : 'bg-white/90 hover:bg-white text-[#12384B] border border-[#12384B]/10 shadow-[0_2px_8px_rgba(18,56,75,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] hover:border-[#12384B]/20 hover:shadow-xs'
      } ${dimensions[size]} ${className}`}
    >
      {/* Sound waves animation while speaking */}
      {isSpeaking && !isMuted && (
        <span className="absolute -inset-1.5 rounded-full border-2 border-[#2EE6CA] animate-ping pointer-events-none" />
      )}

      {isMuted ? (
        // Muted icon
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        // Speaker active icon
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
    </button>
  );
}
