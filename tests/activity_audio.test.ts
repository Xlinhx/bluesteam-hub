import { afterEach, describe, expect, it, vi } from 'vitest';
import { oceanAudio } from '../src/shared/audio/oceanAudio';

afterEach(() => { oceanAudio.stop(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Activity audio ownership', () => {
  it('plays the uploaded recording and stops it when another narration starts', async () => {
    const recordings: any[] = [];
    class Recording {
      volume = 1; onended: (() => void) | null = null; onerror: (() => void) | null = null;
      pause = vi.fn(); play = vi.fn().mockResolvedValue(undefined);
      constructor(public src: string) { recordings.push(this); }
    }
    vi.stubGlobal('Audio', Recording);
    await oceanAudio.playNarration('/recording-one.mp3', 'Hướng dẫn');
    expect(recordings[0].play).toHaveBeenCalledOnce();
    await oceanAudio.playNarration('/recording-two.mp3', 'Vật thể');
    expect(recordings[0].pause).toHaveBeenCalledOnce();
    expect(recordings[1].src).toBe('/recording-two.mp3');
    oceanAudio.stop();
    expect(recordings[1].pause).toHaveBeenCalledOnce();
  });

  it('falls back to text after a recording fails, but never after it was replaced', async () => {
    const recordings: any[] = [];
    class Recording {
      volume = 1; onended: (() => void) | null = null; onerror: (() => void) | null = null;
      pause = vi.fn(); play = vi.fn().mockResolvedValue(undefined);
      constructor(public src: string) { recordings.push(this); }
    }
    vi.stubGlobal('Audio', Recording);
    const speak = vi.spyOn(oceanAudio, 'speak').mockReturnValue(true);
    await oceanAudio.playNarration('/old.mp3', 'Cũ');
    const staleError = recordings[0].onerror;
    await oceanAudio.playNarration('/new.mp3', 'Mới');
    staleError?.();
    expect(speak).not.toHaveBeenCalled();
    recordings[1].onerror?.();
    expect(speak).toHaveBeenCalledWith('Mới');
  });
});

it('uses a calm Vietnamese resource voice without playing a chime over the first word', () => {
  class Utterance { constructor(public text: string) {} }
  const defaultVoice = { lang: 'en-US', name: 'Default English' };
  const basicVoice = { lang: 'vi-VN', name: 'Tiếng Việt' };
  const naturalVoice = { lang: 'vi-VN', name: 'Vietnamese Natural' };
  const synthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [defaultVoice, basicVoice, naturalVoice] };
  vi.stubGlobal('window', { speechSynthesis: synthesis });
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
  const chime = vi.spyOn(oceanAudio, 'playChime').mockImplementation(() => {});
  expect(oceanAudio.speak('Bé nhìn xem!   Đây là san hô não; có những đường rãnh nhỏ.', { profile:'learner-resource' })).toBe(true);
  expect(synthesis.speak).toHaveBeenCalledWith(expect.objectContaining({
    text:'Bé nhìn xem! Đây là san hô não. Có những đường rãnh nhỏ.',
    lang:'vi-VN', rate:0.87, pitch:1.04, voice:naturalVoice,
  }));
  expect(chime).not.toHaveBeenCalled();
});
