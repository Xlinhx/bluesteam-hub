// SSR mock setup prior to React and page imports
if (typeof globalThis.window === 'undefined') {
  const sessionStorageStore: Record<string, string> = {};
  const localStorageStore: Record<string, string> = {};
  (globalThis as any).window = {
    location: { pathname: '/teacher/live', search: '', href: 'http://localhost:5173/teacher/live' },
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
    createElement: () => ({
      getContext: () => null,
    }),
  };
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { teacherSyncStore, INITIAL_SYNC_STATE } from '../src/services/teacherSyncStore';
import { oceanShowcaseStore } from '../src/demo/storage/oceanShowcaseStore';
import { oceanAudio } from '../src/shared/sound/oceanAudio';
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';

// Import production components to verify rendering contracts
import { TeacherLiveConsolePage, CANONICAL_LIVE_CONSOLE_STEPS } from '../src/pages/teacher/TeacherLiveConsolePage';
import { PresentationPage } from '../src/pages/teacher/PresentationPage';

function renderWithProviders(element: React.ReactElement, pathname = '/teacher/live', search = ''): string {
  if (typeof window !== 'undefined') {
    window.location.pathname = pathname;
    window.location.search = search;
  }
  return renderToString(
    React.createElement(
      I18nProvider,
      null,
      React.createElement(RouterProvider, null, element)
    )
  );
}

describe('Milestone 5 Finding 3: Classroom Attention Bell & Focus Synchronization Contract', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    teacherSyncStore.resetSession();
    oceanShowcaseStore.resetAll();
  });

  afterEach(() => {
    teacherSyncStore.resetSession();
    oceanShowcaseStore.resetAll();
    vi.useRealTimers();
  });

  describe('1. teacherSyncStore Attention Bell State & Broadcast Contract', () => {
    it('should initialize with attentionAlert: false', () => {
      const state = teacherSyncStore.getState();
      expect(state.attentionAlert).toBe(false);
      expect(INITIAL_SYNC_STATE.attentionAlert).toBe(false);
    });

    it('should broadcast attentionAlert: true when triggerAttentionBell() is called', () => {
      let receivedAlert = false;
      let notificationCount = 0;

      const unsub = teacherSyncStore.subscribe((state) => {
        notificationCount++;
        receivedAlert = state.attentionAlert;
      });

      teacherSyncStore.triggerAttentionBell(3500);

      expect(receivedAlert).toBe(true);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);
      expect(teacherSyncStore.getState().attentionAlertTimestamp).toBeDefined();

      unsub();
    });

    it('should automatically reset attentionAlert to false after durationMs expires', () => {
      teacherSyncStore.triggerAttentionBell(3000);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // Advance timers by 2999ms: should still be true
      vi.advanceTimersByTime(2999);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // Advance by 2ms (total 3001ms): should reset to false
      vi.advanceTimersByTime(2);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);
    });

    it('should handle rapid consecutive bell triggers by refreshing the timer without leaks', () => {
      teacherSyncStore.triggerAttentionBell(2000);
      vi.advanceTimersByTime(1500);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // Retrigger with 2000ms: resets timer
      teacherSyncStore.triggerAttentionBell(2000);
      vi.advanceTimersByTime(1000); // 1000ms into second trigger (2500ms since first)
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      // Advance remaining 1001ms: now expires
      vi.advanceTimersByTime(1001);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);
    });

    it('should allow manual dismissal via setAttentionAlert(false)', () => {
      teacherSyncStore.triggerAttentionBell(5000);
      expect(teacherSyncStore.getState().attentionAlert).toBe(true);

      teacherSyncStore.setAttentionAlert(false);
      expect(teacherSyncStore.getState().attentionAlert).toBe(false);
    });
  });

  describe('2. TeacherLiveConsolePage Attention Bell UI & Quick Action Controls', () => {
    it('should render dedicated "Chuông tập trung" button in top session bar', () => {
      const html = renderWithProviders(React.createElement(TeacherLiveConsolePage));
      expect(html).toContain('Chuông tập trung');
    });

    it('should render dedicated "Chuông chú ý" button in activity controls area', () => {
      const html = renderWithProviders(React.createElement(TeacherLiveConsolePage));
      expect(html).toContain('Điều khiển hoạt động');
      expect(html).toContain('Chuông chú ý');
      expect(html).toContain('Tạm dừng');
      expect(html).toContain('Nghe lại');
      expect(html).toContain('Hiện gợi ý');
    });

    it('should export and render the 5 canonical pedagogical steps', () => {
      expect(CANONICAL_LIVE_CONSOLE_STEPS).toHaveLength(5);
      expect(CANONICAL_LIVE_CONSOLE_STEPS[0].id).toBe(1);
      expect(CANONICAL_LIVE_CONSOLE_STEPS[4].id).toBe(5);

      const html = renderWithProviders(React.createElement(TeacherLiveConsolePage));
      expect(html).toMatch(/5.*bước/);
      expect(html).toContain('Quan sát và khám phá');
      expect(html).toContain('Thảo luận cùng lớp');
      expect(html).toContain('Hoạt động tương tác');
      expect(html).toContain('Củng cố và mở rộng');
      expect(html).toContain('Vinh danh &amp; Trao huy hiệu STEAM');
    });
  });

  describe('3. PresentationPage Reactive Visual Focus Indicator', () => {
    it('should NOT render focus indicator banner when attentionAlert is false', () => {
      teacherSyncStore.setAttentionAlert(false);
      const html = renderWithProviders(React.createElement(PresentationPage), '/presentation');
      expect(html).not.toContain('Cả lớp cùng chú ý lên màn hình nhé!');
      expect(html).not.toContain('Cô giáo đang rung chuông tập trung');
    });

    it('should render gentle visual focus indicator banner when attentionAlert is true', () => {
      teacherSyncStore.setAttentionAlert(true);
      const html = renderWithProviders(React.createElement(PresentationPage), '/presentation');
      expect(html).toContain('Cả lớp cùng chú ý lên màn hình nhé!');
      expect(html).toContain('Cô giáo đang rung chuông tập trung');
      expect(html).toContain('ring-4');
    });
  });

  describe('4. oceanAudio Engine Chime Pitch Verification', () => {
    it('should support playChime with frequency 659.25 (E5) and duration 0.4 without errors', () => {
      expect(() => {
        oceanAudio.playChime(659.25, 0.4);
      }).not.toThrow();
    });
  });
});
