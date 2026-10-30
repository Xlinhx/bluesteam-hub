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
