// BlueSTEAM v2 Ocean Audio Engine
// Web Audio chime generator + multi-locale Speech Synthesis with fallback safety

export type AudioLocale = 'vi' | 'en';
export type SpeechProfile = 'learner-resource';
type SpeechOptions = { profile?: SpeechProfile; onStart?: () => void; onEnd?: () => void };

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
  private recording: HTMLAudioElement | null = null;

  public async playNarration(url: string | undefined, fallbackText: string, fallbackOptions?: SpeechOptions): Promise<void> {
    this.stop();
    if (this.speechMuted) return;
    const speakFallback = () => fallbackOptions ? this.speak(fallbackText, fallbackOptions) : this.speak(fallbackText);
    if (!url || typeof Audio === 'undefined') { speakFallback(); return; }
    const recording = new Audio(url);
    this.recording = recording;
    recording.volume = this.volume;
    const finish = () => {
      if (this.recording !== recording) return;
      this.recording = null;
      recording.onended = null; recording.onerror = null;
      this.notify(false);
    };
    const fail = () => {
      if (this.recording !== recording) return;
      recording.pause();
      finish();
      speakFallback();
    };
    recording.onended = finish;
    recording.onerror = fail;
    this.notify(true);
    try { await recording.play(); } catch { fail(); }
  }

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
    localeOrOptions?: AudioLocale | SpeechOptions | (() => void),
    optionsParam?: SpeechOptions
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
      const learnerResource = options?.profile === 'learner-resource' && locale === 'vi';
      const spokenText = learnerResource
        ? text.trim().replace(/\s+/g, ' ').replace(/;\s*(\p{L})/gu, (_, letter: string) => '. ' + letter.toLocaleUpperCase('vi'))
        : text;
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = locale === 'vi' ? 'vi-VN' : 'en-US';
      utterance.rate = learnerResource ? 0.87 : locale === 'vi' ? 0.95 : 0.92;
      utterance.pitch = learnerResource ? 1.04 : 1.08;
      utterance.volume = this.volume;

      // Match system voice for target locale
      const voices = window.speechSynthesis.getVoices();
      if (locale === 'vi') {
        const viVoices = voices.filter(v => /^vi(?:[-_]|$)/i.test(v.lang) || /vietnam/i.test(v.name));
        const preferredVoice = learnerResource && viVoices.find(v => /natural|neural|online|google/i.test(v.name));
        const viVoice = preferredVoice || viVoices[0];
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
      if (!learnerResource) this.playChime(587.33, 0.3);
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      this.notify(false);
      options?.onEnd?.();
      return false;
    }
  }

  public stop() {
    if (this.recording) {
      this.recording.onended = null;
      this.recording.onerror = null;
      this.recording.pause();
      this.recording = null;
    }
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
    if (this.recording) this.recording.volume = this.volume;
  }

  public get isSpeechMuted(): boolean {
    return this.speechMuted;
  }

  public get isAmbientMuted(): boolean {
    return this.ambientMuted;
  }
}

export const oceanAudio = new OceanAudioPlayer();
