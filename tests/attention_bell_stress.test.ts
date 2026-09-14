// SSR mock setup prior to React and page imports
if (typeof globalThis.window === 'undefined') {
  const sessionStorageStore: Record<string, string> = {};
  const localStorageStore: Record<string, string> = {};
  (globalThis as any).window = {
    location: { pathname: '/presentation', search: '', href: 'http://localhost:5173/presentation' },
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    print: () => {},
    open: () => null,
    alert: () => {},
    innerHeight: 1024,
    innerWidth: 1536,
    history: { length: 1, pushState: () => {}, replaceState: () => {}, back: () => {} },
    matchMedia: () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    sessionStorage: {
      getItem: (key: string) => sessionStorageStore[key] ?? null,
      setItem: (key: string, val: string) => {
        sessionStorageStore[key] = String(val);
      },
      removeItem: (key: string) => {
        delete sessionStorageStore[key];
      },
      clear: () => {
        for (const k of Object.keys(sessionStorageStore)) {
          delete sessionStorageStore[k];
        }
      },
    },
    localStorage: {
      getItem: (key: string) => localStorageStore[key] ?? null,
      setItem: (key: string, val: string) => {
        localStorageStore[key] = String(val);
      },
      removeItem: (key: string) => {
        delete localStorageStore[key];
      },
      clear: () => {
        for (const k of Object.keys(localStorageStore)) {
          delete localStorageStore[k];
        }
      },
    },
  };
}

if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = (globalThis as any).window.sessionStorage;
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = (globalThis as any).window.localStorage;
}

if (typeof globalThis.document === 'undefined') {
  (globalThis as any).document = {
    body: { style: {} },
    documentElement: {
      style: { setProperty: () => {}, getPropertyValue: () => '' },
      classList: { add: () => {}, remove: () => {} },
      requestFullscreen: async () => {},
    },
    fullscreenElement: null,
    exitFullscreen: async () => {},
    createElement: () => ({
      getContext: () => null,
    }),
  };
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

import {
  teacherSyncStore,
  INITIAL_SYNC_STATE,
  CANONICAL_LESSON_STEPS,
  LessonStepId,
} from '../src/services/teacherSyncStore';
import { oceanAudio } from '../src/shared/sound/oceanAudio';
import { oceanAudio as serviceOceanAudio } from '../src/services/oceanAudio';
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';
import { PresentationPage } from '../src/pages/teacher/PresentationPage';
import { TeacherLiveConsolePage } from '../src/pages/teacher/TeacherLiveConsolePage';

// Render helper providing Router and I18n context
function renderWithProviders(element: React.ReactElement, pathname = '/presentation', search = ''): string {
  if (typeof window !== 'undefined') {
    window.location.pathname = pathname;
    window.location.search = search;
    window.location.href = `http://localhost:5173${pathname}${search}`;
  }
  return renderToString(
    React.createElement(
      I18nProvider,
      null,
      React.createElement(RouterProvider, null, element)
    )
  );
}

// Mock Web Audio API primitives for empirical testing
class MockAudioParam {
  value = 0;
  setValueAtTime = vi.fn((val: number) => {
    this.value = val;
  });
  exponentialRampToValueAtTime = vi.fn((val: number) => {
    this.value = val;
  });
  linearRampToValueAtTime = vi.fn((val: number) => {
    this.value = val;
  });
}

class MockGainNode {
  gain = new MockAudioParam();
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockOscillatorNode {
  type = 'sine';
  frequency = new MockAudioParam();
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  state: AudioContextState = 'running';
  currentTime = 10;
  destination = {};
  createOscillator = vi.fn(() => new MockOscillatorNode());
  createGain = vi.fn(() => new MockGainNode());
  resume = vi.fn().mockResolvedValue(undefined);
}

describe('Milestone 5 Challenger 2: Attention Bell Adversarial & Empirical Stress Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    teacherSyncStore.resetSession();
    // Reset cached AudioContext in oceanAudio player
    (oceanAudio as any).audioCtx = null;
    oceanAudio.setAmbientMuted(false);
    oceanAudio.setVolume(1.0);
  });

  afterEach(() => {
    teacherSyncStore.resetSession();
    (oceanAudio as any).audioCtx = null;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. RAPID CONSECUTIVE INVOCATIONS, CONCURRENCY & RACE CONDITIONS
  // =========================================================================
  describe('1. Rapid Concurrency & Timer Restart Stress', () => {
    it('STRESS-1.1: Rapid-fire burst of 100 consecutive invocations maintains alert state without corruption', () => {
      let stateChangeCount = 0;
      const unsub = teacherSyncStore.subscribe((state) => {
        if (state.attentionAlert) stateChangeCount++;
      });

      // Synchronously fire 100 rapid triggers
      for (let i = 0; i < 100; i++) {
        teacherSyncStore.triggerAttentionBell(3000);
      }

      const finalState = teacherSyncStore.getState();
      expect(finalState.attentionAlert).toBe(true);
      expect(finalState.isAudioPlaying).toBe(true);
      expect(finalState.activeAudioText).toContain('Chuông chú ý');
      expect(finalState.attentionAlertTimestamp).toBeDefined();
      expect(stateChangeCount).toBeGreaterThanOrEqual(100);

      // Advance by 2999ms: must STILL be active
      vi.advanceTimersByTime(2999);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // Advance by 2ms (total 3001ms): must cleanly expire to false
      vi.advanceTimersByTime(2);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);
      expect(teacherSyncStore.getState().isAudioPlaying).toBe(false);
      expect(teacherSyncStore.getState().activeAudioText).toBeNull();
      expect(teacherSyncStore.getState().attentionAlertTimestamp).toBeUndefined();

      // Ensure no zombie timers fire late
      vi.advanceTimersByTime(10000);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);

      unsub();
    });

    it('STRESS-1.2: Asynchronous staggered timer restarts preserve expiration horizon correctly', () => {
      // Trigger 1 at t=0 (scheduled expire t=3000)
      teacherSyncStore.triggerAttentionBell(3000);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // t=1000: Trigger 2 for 3000ms (scheduled expire t=4000)
      vi.advanceTimersByTime(1000);
      teacherSyncStore.triggerAttentionBell(3000);

      // t=2500: Trigger 3 for 2000ms (scheduled expire t=4500)
      vi.advanceTimersByTime(1500);
      teacherSyncStore.triggerAttentionBell(2000);

      // t=4000: Trigger 4 for 1500ms (scheduled expire t=5500)
      vi.advanceTimersByTime(1500);
      teacherSyncStore.triggerAttentionBell(1500);

      // At t=5499ms (1499ms after Trigger 4), should still be active
      vi.advanceTimersByTime(1499);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // At t=5501ms (1501ms after Trigger 4), should expire
      vi.advanceTimersByTime(2);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);

      // Advance another 20000ms to guarantee no ghost timers
      vi.advanceTimersByTime(20000);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);
    });

    it('STRESS-1.3: Invariant preservation: bell triggers do NOT mutate unrelated session states', () => {
      // Seed custom classroom state
      teacherSyncStore.setStep(4);
      teacherSyncStore.placeCreature('coral', 'clownfish');
      teacherSyncStore.submitQuizVote('opt-b');
      teacherSyncStore.toggleQuizReveal(true);

      const beforeState = teacherSyncStore.getState();
      expect(beforeState.activeStep).toBe(4);
      expect(beforeState.placedSlots.coral).toBe('clownfish');
      expect(beforeState.quiz.isRevealed).toBe(true);
      expect(beforeState.quiz.totalVotes).toBe(25);

      // Blast 50 triggers
      for (let i = 0; i < 50; i++) {
        teacherSyncStore.triggerAttentionBell(1000);
      }
      vi.advanceTimersByTime(1001);

      const afterState = teacherSyncStore.getState();
      // Attention bell reset cleanly
      expect(afterState.attentionAlert).toBe(false);

      // Invariants must be strictly preserved
      expect(afterState.classCode).toBe(beforeState.classCode);
      expect(afterState.className).toBe(beforeState.className);
      expect(afterState.teacherName).toBe(beforeState.teacherName);
      expect(afterState.topicTitle).toBe(beforeState.topicTitle);
      expect(afterState.activeStep).toBe(4);
      expect(afterState.stepTitle).toBe(beforeState.stepTitle);
      expect(afterState.placedSlots.coral).toBe('clownfish');
      expect(afterState.quiz.isRevealed).toBe(true);
      expect(afterState.quiz.totalVotes).toBe(25);
      expect(afterState.connectedCount).toBe(beforeState.connectedCount);
      expect(afterState.totalStudents).toBe(beforeState.totalStudents);
    });

    it('STRESS-1.4: Zero and extreme duration boundary values execute safely', () => {
      // 0ms duration
      teacherSyncStore.triggerAttentionBell(0);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);
      vi.advanceTimersByTime(1);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);

      // 1ms duration
      teacherSyncStore.triggerAttentionBell(1);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);
      vi.advanceTimersByTime(1);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);

      // Large duration: 1 hour (3,600,000ms)
      teacherSyncStore.triggerAttentionBell(3_600_000);
      vi.advanceTimersByTime(3_599_999);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);
      vi.advanceTimersByTime(2);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);
    });

    it('STRESS-1.5: Resilient notification: listener exception does not crash store or block other subscribers', () => {
      let sub1Called = 0;
      let sub3Called = 0;

      const unsub1 = teacherSyncStore.subscribe(() => {
        sub1Called++;
      });
      // Faulty listener that throws on subsequent notification (not on initial subscribe)
      let throwOnTrigger = false;
      const unsub2 = teacherSyncStore.subscribe(() => {
        if (throwOnTrigger) {
          throw new Error('Hostile external subscriber crashed during bell event!');
        }
      });
      const unsub3 = teacherSyncStore.subscribe(() => {
        sub3Called++;
      });

      throwOnTrigger = true;
      expect(() => {
        teacherSyncStore.triggerAttentionBell(2000);
      }).not.toThrow();

      expect(sub1Called).toBeGreaterThanOrEqual(2); // Initial + trigger
      expect(sub3Called).toBeGreaterThanOrEqual(2); // Initial + trigger
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      unsub1();
      unsub2();
      unsub3();
    });

    it('STRESS-1.6: Subscriber self-unsubscription during bell notification does not cause iteration error', () => {
      let unsubSelf: (() => void) | null = null;
      let triggerSeen = false;

      unsubSelf = teacherSyncStore.subscribe((state) => {
        if (state.attentionAlert) {
          triggerSeen = true;
          if (unsubSelf) unsubSelf();
        }
      });

      expect(() => {
        teacherSyncStore.triggerAttentionBell(1500);
      }).not.toThrow();

      expect(triggerSeen).toBe(true);
    });
  });

  // =========================================================================
  // 2. AUTOMATIC EXPIRATION & MANUAL RESET LIFECYCLE
  // =========================================================================
  describe('2. Automatic Expiration & Manual Reset Lifecycle', () => {
    it('RESET-2.1: Pre-emptive cancellation via setAttentionAlert(false) kills scheduled timer', () => {
      teacherSyncStore.triggerAttentionBell(6000);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // Advance by 1500ms
      vi.advanceTimersByTime(1500);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // Teacher manually dismisses bell
      teacherSyncStore.setAttentionAlert(false);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);
      expect(teacherSyncStore.getState().isAudioPlaying).toBe(false);
      expect(teacherSyncStore.getState().activeAudioText).toBeNull();
      expect(teacherSyncStore.getState().attentionAlertTimestamp).toBeUndefined();

      // Fast-forward past the original 6000ms deadline (to 10000ms)
      vi.advanceTimersByTime(8500);
      // Must remain false and not resurrect
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);
    });

    it('RESET-2.2: Sticky focus mode via setAttentionAlert(true) does NOT auto-expire until manual dismiss', () => {
      teacherSyncStore.setAttentionAlert(true);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);
      expect(teacherSyncStore.getState().attentionAlertTimestamp).toBeDefined();

      // Advance 10 minutes (600,000ms)
      vi.advanceTimersByTime(600_000);
      // Must stay sticky
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // Dismiss
      teacherSyncStore.setAttentionAlert(false);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);
    });

    it('RESET-2.3: Overriding sticky focus mode with auto-expiring trigger establishes new countdown', () => {
      teacherSyncStore.setAttentionAlert(true);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // Trigger with explicit 2000ms duration
      teacherSyncStore.triggerAttentionBell(2000);
      vi.advanceTimersByTime(2001);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);
    });

    it('RESET-2.4: Session reset cancels any pending attention bell timer and restores initial state', () => {
      teacherSyncStore.triggerAttentionBell(5000);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // Reset entire session
      teacherSyncStore.resetSession();
      const state = teacherSyncStore.getState();
      expect(state.attentionAlert).toBe(false);
      expect(state.activeStep).toBe(INITIAL_SYNC_STATE.activeStep);

      // Advance 10000ms: no delayed action fires
      vi.advanceTimersByTime(10000);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);
    });
  });

  // =========================================================================
  // 3. PRESENTATIONPAGE VISUAL OVERLAY BANNER RENDERING & DISMISSAL
  // =========================================================================
  describe('3. PresentationPage Visual Overlay Banner Rendering & Clean Dismissal', () => {
    it('VISUAL-3.1: Renders high-contrast attention banner & glowing halo when attentionAlert is active', () => {
      teacherSyncStore.setAttentionAlert(true);
      const html = renderWithProviders(React.createElement(PresentationPage), '/presentation');

      // Glowing Halo Vignette
      expect(html).toContain('ring-4 ring-inset ring-[#2EE6CA]/60');
      expect(html).toContain('shadow-[inset_0_0_90px_rgba(46,230,202,0.45)]');
      expect(html).toContain('animate-pulse');

      // Floating Focus Banner Content
      expect(html).toContain('Cả lớp cùng chú ý lên màn hình nhé!');
      expect(html).toContain('Cô giáo đang rung chuông tập trung');
      expect(html).toContain('✨');

      // Presentation dark canvas & metadata intact
      expect(html).toContain('bg-[#041624]');
      expect(html).toContain('482915');
      expect(html).toContain('Rùa Biển &amp; Nơi Sinh Sống Diệu Kỳ');
    });

    it('VISUAL-3.2: Clean and complete removal: no remnant halo or text when dismissed', () => {
      teacherSyncStore.setAttentionAlert(false);
      const html = renderWithProviders(React.createElement(PresentationPage), '/presentation');

      expect(html).not.toContain('Cả lớp cùng chú ý lên màn hình nhé!');
      expect(html).not.toContain('Cô giáo đang rung chuông tập trung');
      expect(html).not.toContain('ring-4 ring-inset ring-[#2EE6CA]/60');
      expect(html).not.toContain('shadow-[inset_0_0_90px_rgba(46,230,202,0.45)]');
    });

    it('VISUAL-3.3: Rapid toggling between active and dismissed preserves markup integrity', () => {
      for (let i = 0; i < 5; i++) {
        // Activate
        teacherSyncStore.setAttentionAlert(true);
        let html = renderWithProviders(React.createElement(PresentationPage), '/presentation');
        expect(html).toContain('Cả lớp cùng chú ý lên màn hình nhé!');
        expect(html).toContain('ring-4 ring-inset ring-[#2EE6CA]/60');

        // Deactivate
        teacherSyncStore.setAttentionAlert(false);
        html = renderWithProviders(React.createElement(PresentationPage), '/presentation');
        expect(html).not.toContain('Cả lớp cùng chú ý lên màn hình nhé!');
        expect(html).not.toContain('ring-4 ring-inset ring-[#2EE6CA]/60');
      }
    });

    it('VISUAL-3.4: Attention banner renders seamlessly across all 5 canonical lesson steps without obscuring layout', () => {
      CANONICAL_LESSON_STEPS.forEach((step: LessonStepId) => {
        teacherSyncStore.setStep(step);
        teacherSyncStore.setAttentionAlert(true);

        const activeHtml = renderWithProviders(React.createElement(PresentationPage), '/presentation');
        expect(activeHtml).toContain('Cả lớp cùng chú ý lên màn hình nhé!');
        expect(activeHtml).toContain(`Bước ${step}/5`);

        teacherSyncStore.setAttentionAlert(false);
        const inactiveHtml = renderWithProviders(React.createElement(PresentationPage), '/presentation');
        expect(inactiveHtml).not.toContain('Cả lớp cùng chú ý lên màn hình nhé!');
        expect(inactiveHtml).toContain(`Bước ${step}/5`);
      });
    });

    it('VISUAL-3.5: REFERENCE_CORRECTIONS.md Line 31 Compliance: NEVER render student bottom nav or student avatar', () => {
      // Test both with alert active and inactive
      [true, false].forEach((alertState) => {
        teacherSyncStore.setAttentionAlert(alertState);
        const html = renderWithProviders(React.createElement(PresentationPage), '/presentation');

        // No learner bottom nav
        expect(html).not.toContain('fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95');
        expect(html).not.toContain('Học liệu');
        expect(html).not.toContain('Tương tác');
        expect(html).not.toContain('Hồ sơ');

        // No student avatar "An"
        expect(html).not.toContain('avatar_an.png');
        expect(html).not.toContain('Bé An');
      });
    });
  });

  // =========================================================================
  // 4. TEACHER LIVE CONSOLE BELL CONTROLS & REACTIVITY
  // =========================================================================
  describe('4. TeacherLiveConsolePage Attention Bell Quick Controls', () => {
    it('CONSOLE-4.1: Live Console renders persistent top bar quick button and activity panel bell control', () => {
      const html = renderWithProviders(React.createElement(TeacherLiveConsolePage), '/teacher/live');

      // Top bar quick access button
      expect(html).toContain('aria-label="Chuông tập trung"');
      expect(html).toContain('Chuông tập trung');

      // Activity panel button
      expect(html).toContain('Chuông chú ý');
      expect(html).toContain('Điều khiển hoạt động');
    });

    it('CONSOLE-4.2: Teacher Live Console sync contract: broadcasts alert state and instructional text to subscribers', () => {
      let latestSyncState = teacherSyncStore.getState();
      const unsub = teacherSyncStore.subscribe((state) => {
        latestSyncState = state;
      });

      // Trigger bell
      teacherSyncStore.triggerAttentionBell(3500);
      expect(latestSyncState.attentionAlert).toBe(true);
      expect(latestSyncState.isAudioPlaying).toBe(true);
      expect(latestSyncState.activeAudioText).toBe('🔔 Chuông chú ý: Cả lớp hướng lên màn hình cùng cô!');

      // Dismiss bell
      teacherSyncStore.setAttentionAlert(false);
      expect(latestSyncState.attentionAlert).toBe(false);
      expect(latestSyncState.isAudioPlaying).toBe(false);
      expect(latestSyncState.activeAudioText).toBeNull();

      unsub();
    });
  });

  // =========================================================================
  // 5. AUDIO CHIME EXECUTION SAFETY & WEB AUDIO ERROR ABSORPTION
  // =========================================================================
  describe('5. Audio Chime Execution Safety & Error Absorption', () => {
    it('AUDIO-5.1: playAttentionChime() executes safely with default parameters (659.25Hz E5, 0.4s)', () => {
      expect(() => {
        oceanAudio.playAttentionChime();
      }).not.toThrow();
    });

    it('AUDIO-5.2: playAttentionChime() synthesizes expected oscillator nodes when Web Audio API is available', () => {
      const mockCtx = new MockAudioContext();
      (window as any).AudioContext = vi.fn(() => mockCtx);
      (oceanAudio as any).audioCtx = null; // Force creation

      oceanAudio.playAttentionChime(659.25, 0.4);

      expect(mockCtx.createOscillator).toHaveBeenCalled();
      expect(mockCtx.createGain).toHaveBeenCalled();
    });

    it('AUDIO-5.3: Absorbs missing window.AudioContext (SSR / unsupported browser) without throwing', () => {
      (window as any).AudioContext = undefined;
      (window as any).webkitAudioContext = undefined;
      (oceanAudio as any).audioCtx = null;

      expect(() => {
        oceanAudio.playAttentionChime(659.25, 0.4);
      }).not.toThrow();
    });

    it('AUDIO-5.4: Absorbs AudioContext constructor failure (e.g. system resource exhaustion or security error)', () => {
      (window as any).AudioContext = vi.fn(() => {
        throw new Error('Audio hardware unavailable: device in exclusive use');
      });
      (oceanAudio as any).audioCtx = null;

      expect(() => {
        oceanAudio.playAttentionChime(659.25, 0.4);
      }).not.toThrow();
    });

    it('AUDIO-5.5: Absorbs suspended AudioContext and resume() rejection (autoplay policy restriction)', () => {
      const mockCtx = new MockAudioContext();
      mockCtx.state = 'suspended';
      mockCtx.resume = vi.fn().mockImplementation(() => {
        throw new Error('Autoplay policy: user interaction gesture required');
      });
      (window as any).AudioContext = vi.fn(() => mockCtx);
      (oceanAudio as any).audioCtx = null;

      expect(() => {
        oceanAudio.playAttentionChime(659.25, 0.4);
      }).not.toThrow();
    });

    it('AUDIO-5.6: Absorbs oscillator / gain node creation failure gracefully', () => {
      const mockCtx = new MockAudioContext();
      mockCtx.createOscillator = vi.fn(() => {
        throw new DOMException('Cannot create oscillator in invalid state', 'InvalidStateError');
      });
      (window as any).AudioContext = vi.fn(() => mockCtx);
      (oceanAudio as any).audioCtx = null;

      expect(() => {
        oceanAudio.playAttentionChime(659.25, 0.4);
      }).not.toThrow();
    });

    it('AUDIO-5.7: Suppresses chime playback when ambientMuted is true', () => {
      const mockCtx = new MockAudioContext();
      (window as any).AudioContext = vi.fn(() => mockCtx);
      (oceanAudio as any).audioCtx = null;

      oceanAudio.setAmbientMuted(true);
      expect(oceanAudio.isAmbientMuted).toBe(true);

      oceanAudio.playAttentionChime(659.25, 0.4);
      expect(mockCtx.createOscillator).not.toHaveBeenCalled();

      // Restore
      oceanAudio.setAmbientMuted(false);
      oceanAudio.playAttentionChime(659.25, 0.4);
      expect(mockCtx.createOscillator).toHaveBeenCalled();
    });

    it('AUDIO-5.8: Handles volume extremes and clamping without throwing', () => {
      const mockCtx = new MockAudioContext();
      (window as any).AudioContext = vi.fn(() => mockCtx);
      (oceanAudio as any).audioCtx = null;

      // Test negative, zero, fraction, and overflow volume
      [-5, 0, 0.25, 0.75, 1.0, 50].forEach((vol) => {
        oceanAudio.setVolume(vol);
        expect(() => {
          oceanAudio.playAttentionChime(659.25, 0.4);
        }).not.toThrow();
      });
    });

    it('AUDIO-5.9: Service re-export parity: src/services/oceanAudio provides exact same singleton instance', () => {
      expect(serviceOceanAudio).toBe(oceanAudio);
      expect(typeof serviceOceanAudio.playAttentionChime).toBe('function');

      expect(() => {
        serviceOceanAudio.playAttentionChime(659.25, 0.4);
      }).not.toThrow();
    });
  });
});
