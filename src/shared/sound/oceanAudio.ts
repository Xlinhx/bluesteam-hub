// BlueSTEAM v2 Ocean Audio Engine
// Web Audio chime generator + multi-locale Speech Synthesis with fallback safety

export type AudioLocale = 'vi' | 'en';

export interface AudioStateListener {
  (isSpeaking: boolean): void;
}

class OceanAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private isSpeaking = false;
  private listeners: Set<AudioStateListener> = new Set();
  private speechMuted = false;
  private ambientMuted = false;
  private volume = 1.0;

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((l) => {
      try {
        l(speaking);
      } catch {
        // ignore listener errors
      }
    });
  }

  // Play gentle nature chime (calm ocean bell sound) using Web Audio API
  public playChime(frequency = 523.25, duration = 0.8) {
    if (this.ambientMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + duration);

      const targetGain = 0.2 * this.volume;
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Play dedicated attention bell chime (E5 harmonic tone, 659.25Hz) to gather student focus
  public playAttentionChime(frequency = 659.25, duration = 0.4) {
    this.playChime(frequency, duration);
  }

  // Speak instructional text in Vietnamese or English
  public speak(
    text: string,
    localeOrOptions?: AudioLocale | { onStart?: () => void; onEnd?: () => void } | (() => void),
    optionsParam?: { onStart?: () => void; onEnd?: () => void }
  ): boolean {
    let locale: AudioLocale = 'vi';
    let options = optionsParam;

    if (typeof localeOrOptions === 'string') {
      locale = localeOrOptions;
    } else if (typeof localeOrOptions === 'function') {
      options = { onEnd: localeOrOptions };
    } else if (localeOrOptions && typeof localeOrOptions === 'object') {
      options = localeOrOptions;
    }

    if (this.speechMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options?.onEnd?.();
      return false;
    }

    // Stop current speech before starting new
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale === 'vi' ? 'vi-VN' : 'en-US';
      utterance.rate = locale === 'vi' ? 0.95 : 0.92;
      utterance.pitch = 1.08;
      utterance.volume = this.volume;

      // Match system voice for target locale
      const voices = window.speechSynthesis.getVoices();
      if (locale === 'vi') {
        const viVoice = voices.find(
          (v) => v.lang.toLowerCase().includes('vi') || v.name.toLowerCase().includes('vietnam')
        );
        if (viVoice) utterance.voice = viVoice;
      } else {
        const enVoice = voices.find(
          (v) => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) || v.lang.startsWith('en')
        );
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onstart = () => {
        this.notify(true);
        options?.onStart?.();
      };

      const handleFinish = () => {
        this.notify(false);
        options?.onEnd?.();
      };

      utterance.onend = handleFinish;
      utterance.onerror = () => {
        handleFinish();
      };

      // Play soft pre-chime
      this.playChime(587.33, 0.3);
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      this.notify(false);
      options?.onEnd?.();
      return false;
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.notify(false);
  }

  public get speaking(): boolean {
    return this.isSpeaking;
  }

  public setSpeechMuted(muted: boolean) {
    this.speechMuted = muted;
    if (muted) this.stop();
  }

  public setAmbientMuted(muted: boolean) {
    this.ambientMuted = muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public get isSpeechMuted(): boolean {
    return this.speechMuted;
  }

  public get isAmbientMuted(): boolean {
    return this.ambientMuted;
  }
}

export const oceanAudio = new OceanAudioPlayer();
