import { Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { oceanAudio, type SpeechProfile } from '../../../shared/audio/oceanAudio';

export function OceanListen({ text, label, recording, profile, iconOnly, onPlay }: {
  text: string; label: string; recording?: string; profile?: SpeechProfile; iconOnly?: boolean; onPlay?: () => void;
}) {
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => { setUnavailable(false); }, [text]);
  return <><button type="button" className={iconOnly ? 'observation-name-audio' : 'ocean-content-listen'} aria-label={label}
    onClick={() => {
      onPlay?.();
      if (recording) { setUnavailable(false); void oceanAudio.playNarration(recording, text, { profile }); }
      else setUnavailable(!oceanAudio.speak(text, 'vi', { profile }));
    }}><Volume2 size={18} /> {!iconOnly && label}</button>
    {unavailable && <small role="status">Thiết bị này chưa phát được giọng đọc tiếng Việt.</small>}</>;
}
