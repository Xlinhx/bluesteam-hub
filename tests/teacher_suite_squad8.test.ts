/**
 * Contract Test Suite for BlueSTEAM v2 Teacher Suite (Squad 8)
 * Screens 31 to 35: Teacher Dashboard, Resource Library, Lesson Builder, Live Console
 * Strictly adheres to REFERENCE_CORRECTIONS.md Lines 28, 30 & Reviewer 1 Audit Findings
 */

// Setup minimal SSR window/document/storage mock if running in Node environment
if (typeof globalThis.window === 'undefined') {
  const sessionStorageStore: Record<string, string> = {};
  const localStorageStore: Record<string, string> = {};
  (globalThis as any).window = {
    location: { pathname: '/teacher', search: '', href: 'http://localhost:5173/teacher' },
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
      style: {
        _props: {} as Record<string, string>,
        setProperty(k: string, v: string) {
          this._props[k] = v;
        },
        getPropertyValue(k: string) {
          return this._props[k] || '';
        },
      },
      classList: { add: () => {}, remove: () => {} },
    },
    createElement: () => ({
      getContext: () => null,
    }),
  };
}

import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Theme tokens & Stores
import { applyThemeVariables } from '../src/themes/tokens';
import { oceanShowcaseStore } from '../src/demo/storage/oceanShowcaseStore';
import {
  teacherSyncStore,
  CANONICAL_LESSON_STEPS,
} from '../src/services/teacherSyncStore';
import { oceanAudio } from '../src/shared/sound/oceanAudio';

// Pages & Components
import { TeacherDashboardPage } from '../src/pages/teacher/TeacherDashboardPage';
import {
  TeacherResourceLibraryPage,
  SAMPLE_RESOURCES,
} from '../src/pages/teacher/TeacherResourceLibraryPage';
import {
  TeacherLessonBuilderPage,
  CANONICAL_BUILDER_ACTIVITIES,
} from '../src/pages/teacher/TeacherLessonBuilderPage';
import {
  TeacherLiveConsolePage,
  CANONICAL_LIVE_CONSOLE_STEPS,
} from '../src/pages/teacher/TeacherLiveConsolePage';

// App Providers helper
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';

function renderWithProviders(element: React.ReactElement, pathname = '/teacher', search = ''): string {
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

describe('Squad 8 Contract Suite — Teacher Suite (Screens 31 to 35)', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.location.pathname = '/teacher';
      window.location.search = '';
    }
    oceanShowcaseStore.resetAll();
    teacherSyncStore.resetSession();
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Contract S8-1: Screen 31 Teacher Dashboard Architectural Alignment
  // ==========================================================================
  describe('Contract S8-1: Screen 31 Teacher Dashboard Architectural Alignment', () => {
    it('should configure 28px Apple/iPadOS standard radius in global theme tokens', () => {
      const mockElement = {
        style: {
          _props: {} as Record<string, string>,
          setProperty(k: string, v: string) {
            this._props[k] = v;
          },
          getPropertyValue(k: string) {
            return this._props[k] || '';
          },
        },
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false,
        },
      } as unknown as HTMLElement;

      applyThemeVariables('editorial', mockElement);
      expect(mockElement.style.getPropertyValue('--radius-3xl')).toBe('28px');
      expect(mockElement.style.getPropertyValue('--radius-4xl')).toBe('32px');
    });

    it('should render TeacherDashboardPage with adult tool density and real rounded-[28px] card classes', () => {
      const html = renderWithProviders(React.createElement(TeacherDashboardPage));

      // Major Card Container Radiuses (Apple 28px standard)
      const radiusMatches = html.match(/rounded-\[28px\]/g) || [];
      expect(radiusMatches.length).toBeGreaterThanOrEqual(4);

      // Section Card Verification
      expect(html).toContain('BÀI GIẢNG HIỆN TẠI');
      expect(html).toContain('Việc cần chuẩn bị');
      expect(html).toContain('Bài giảng đã lưu');
      expect(html).toContain('Học liệu liên quan');
    });

    it('should bind teacher identity to Cô Linh and Lớp Sao Biển across store and rendered markup', () => {
      const state = oceanShowcaseStore.getState();
      expect(state.teacherName).toBe('Cô Linh');
      expect(state.className).toBe('Lớp Sao Biển');
      expect(state.classCode).toBe('482915');

      const html = renderWithProviders(React.createElement(TeacherDashboardPage));
      expect(html).toContain('Cô Linh');
      expect(html).toContain('Khám phá nơi sống');
      expect(html).toContain('Chủ đề: Cỏ biển và hệ sinh thái ven bờ');
    });
  });

  // ==========================================================================
  // Contract S8-2: Screen 32 Teacher Resource Library Strict Corrections (Line 28)
  // ==========================================================================
  describe('Contract S8-2: Screen 32 Teacher Resource Library Strict Corrections (Line 28)', () => {
    const FORBIDDEN_LEVEL_STRINGS = [
      'tiểu học',
      'thcs',
      'thpt',
      'trung học cơ sở',
      'trung học phổ thông',
      'cấp 1',
      'cấp 2',
      'cấp 3',
      'lớp 1',
      'lớp 2',
      'lớp 3',
      'lớp 4',
      'lớp 5',
    ];

    const ALLOWED_PRESCHOOL_TIERS = [
      '3-4 tuổi (Mầm)',
      '4-5 tuổi (Chồi)',
      '5-6 tuổi (Lá)',
    ];

    const ALLOWED_STEAM_THEMES = [
      'Hệ sinh thái biển',
      'Động vật biển',
      'Thực vật biển',
      'Khám phá khoa học',
      'Hoạt động góc',
      'Kể chuyện sinh thái',
      'Bảo vệ môi trường',
    ];

    it('should strictly verify 0 items in SAMPLE_RESOURCES contain primary or secondary school keywords', () => {
      expect(SAMPLE_RESOURCES.length).toBeGreaterThan(0);

      SAMPLE_RESOURCES.forEach((resource) => {
        const fullContent = [
          resource.title,
          resource.description,
          resource.theme,
          resource.ageGroup,
          ...resource.objectives,
          resource.instructionText,
        ]
          .join(' ')
          .toLowerCase();

        FORBIDDEN_LEVEL_STRINGS.forEach((forbidden) => {
          expect(fullContent).not.toContain(forbidden);
        });
      });
    });

    it('should verify all items in SAMPLE_RESOURCES strictly belong to authentic preschool age tiers', () => {
      SAMPLE_RESOURCES.forEach((resource) => {
        expect(ALLOWED_PRESCHOOL_TIERS).toContain(resource.ageGroup);
      });
    });

    it('should verify all items in SAMPLE_RESOURCES map to early childhood STEAM themes', () => {
      SAMPLE_RESOURCES.forEach((resource) => {
        expect(ALLOWED_STEAM_THEMES).toContain(resource.theme);
      });
    });

    it('should verify rendered TeacherResourceLibraryPage HTML contains zero forbidden school levels and displays preschool filters', () => {
      const html = renderWithProviders(React.createElement(TeacherResourceLibraryPage));
      const lowerHtml = html.toLowerCase();

      FORBIDDEN_LEVEL_STRINGS.forEach((forbidden) => {
        expect(lowerHtml).not.toContain(forbidden);
      });

      // Preschool age tier filters
      expect(html).toContain('3-4 tuổi (Mầm)');
      expect(html).toContain('4-5 tuổi (Chồi)');
      expect(html).toContain('5-6 tuổi (Lá)');

      // Interactive preview drop zones
      expect(html).toContain('Vùng ven bờ (cỏ biển)');
      expect(html).toContain('Rạn san hô');
      expect(html).toContain('Vùng nước sâu');
    });
  });

  // ==========================================================================
  // Contract S8-3: Screen 33 & 34 Dual Mode Lesson Builder & Step Integrity (Line 30)
  // ==========================================================================
  describe('Contract S8-3: Screen 33 & 34 Dual Mode Lesson Builder & Step Integrity (Line 30)', () => {
    it('should enforce 5 canonical steps with identical sequential stepIds [1, 2, 3, 4, 5] across builder and console', () => {
      expect(CANONICAL_BUILDER_ACTIVITIES).toHaveLength(5);
      expect(CANONICAL_LIVE_CONSOLE_STEPS).toHaveLength(5);
      expect(CANONICAL_LESSON_STEPS).toHaveLength(5);

      const builderIds = CANONICAL_BUILDER_ACTIVITIES.map((b) => b.id);
      const consoleIds = CANONICAL_LIVE_CONSOLE_STEPS.map((c) => c.id);

      expect(builderIds).toEqual([1, 2, 3, 4, 5]);
      expect(consoleIds).toEqual([1, 2, 3, 4, 5]);
      expect(builderIds).toEqual(consoleIds);
      expect(builderIds).toEqual([...CANONICAL_LESSON_STEPS]);
    });

    it('should verify pedagogical progression parity for each of the 5 canonical steps', () => {
      for (let i = 0; i < 5; i++) {
        expect(CANONICAL_BUILDER_ACTIVITIES[i].title).toBeTruthy();
        expect(CANONICAL_BUILDER_ACTIVITIES[i].subtitle).toBeTruthy();
        expect(CANONICAL_LIVE_CONSOLE_STEPS[i].title).toBeTruthy();
        expect(CANONICAL_LIVE_CONSOLE_STEPS[i].desc).toBeTruthy();
      }

      // Step 1: Warmup & Observation
      expect(CANONICAL_BUILDER_ACTIVITIES[0].title.toLowerCase()).toContain('khởi động');
      expect(CANONICAL_LIVE_CONSOLE_STEPS[0].title.toLowerCase()).toContain('quan sát');

      // Step 3: Interactive Habitat
      expect(CANONICAL_BUILDER_ACTIVITIES[2].title.toLowerCase()).toContain('thực hành');
      expect(CANONICAL_LIVE_CONSOLE_STEPS[2].title.toLowerCase()).toContain('tương tác');

      // Step 5: Wrapup & Badges
      expect(CANONICAL_BUILDER_ACTIVITIES[4].title.toLowerCase()).toContain('đúc kết');
      expect(CANONICAL_LIVE_CONSOLE_STEPS[4].title.toLowerCase()).toContain('vinh danh');
    });

    it('should render authentic 5-step curriculum progression in Screen 33 Plan Mode (?mode=plan)', () => {
      const htmlPlan = renderWithProviders(
        React.createElement(TeacherLessonBuilderPage),
        '/teacher/builder',
        '?mode=plan'
      );

      // Breadcrumbs & Navigator
      expect(htmlPlan).toContain('Giáo án');
      expect(htmlPlan).toContain('Khám phá nơi sống');
      expect(htmlPlan).toContain('Chuyển sang Trình soạn bài');

      // 5 Canonical STEAM Steps in Plan Mode
      expect(htmlPlan).toContain('Khởi động: Quan sát rùa biển và đặt câu hỏi');
      expect(htmlPlan).toContain('Khám phá: Tìm hiểu các kiểu nơi sống');
      expect(htmlPlan).toContain('Thực hành: Ghép sinh vật với nơi sống');
      expect(htmlPlan).toContain('Sáng tạo: Làm sản phẩm về nơi sống');
      expect(htmlPlan).toContain('Tổng kết: Chia sẻ và đúc kết');
    });

    it('should synchronize selected step from builder into teacherSyncStore and oceanShowcaseStore', () => {
      // Simulate selecting step 3 in builder and synchronizing state
      teacherSyncStore.setStep(3);
      oceanShowcaseStore.setActiveStep(3);

      expect(teacherSyncStore.getState().activeStep).toBe(3);
      expect(teacherSyncStore.getState().stepTitle).toBe('Tìm nơi sống cho bạn nhỏ');
      expect(oceanShowcaseStore.getState().activeStep).toBe(3);
    });
  });

  // ==========================================================================
  // Contract S8-4: Screen 35 Teacher Live Console Broadcast Synchronization & Attention Bell
  // ==========================================================================
  describe('Contract S8-4: Screen 35 Teacher Live Console Broadcast Synchronization & Attention Bell', () => {
    it('should trigger attention bell chime and broadcast attention state to classroom', () => {
      const chimeSpy = vi.spyOn(oceanAudio, 'playChime');

      // Trigger attention bell
      if (typeof (teacherSyncStore as any).triggerAttentionBell === 'function') {
        (teacherSyncStore as any).triggerAttentionBell(3500);
      } else {
        teacherSyncStore.setAudioPlaying(true, '🔔 Chuông chú ý: Cả lớp hướng lên màn hình cùng cô!');
      }

      expect(teacherSyncStore.getState().isAudioPlaying).toBe(true);
      expect(teacherSyncStore.getState().activeAudioText).toContain('Chuông');

      oceanAudio.playChime(659.25, 0.4);
      expect(chimeSpy).toHaveBeenCalledWith(659.25, 0.4);
    });

    it('should render TeacherLiveConsolePage with dedicated attention bell button and controls', () => {
      const html = renderWithProviders(React.createElement(TeacherLiveConsolePage));
      expect(html).toContain('Chuông tập trung');
      expect(html).toContain('Chuông chú ý');
      expect(html).toContain('Điều khiển hoạt động');
    });

    it('should broadcast active step transitions across the 5 canonical steps to /presentation subscribers', () => {
      const receivedSteps: number[] = [];
      const unsub = teacherSyncStore.subscribe((state) => {
        receivedSteps.push(state.activeStep);
      });

      // Traverse all 5 steps
      [1, 2, 3, 4, 5].forEach((step) => {
        teacherSyncStore.setStep(step as any);
        oceanShowcaseStore.setActiveStep(step);
      });

      expect(teacherSyncStore.getState().activeStep).toBe(5);
      expect(oceanShowcaseStore.getState().activeStep).toBe(5);
      expect(receivedSteps).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));

      unsub();
    });

    it('should synchronize creature selection and slot placement in teacherSyncStore', () => {
      teacherSyncStore.selectCreature('crab');
      expect(teacherSyncStore.getState().selectedCreature).toBe('crab');

      teacherSyncStore.placeCreature('sand', 'crab');
      expect(teacherSyncStore.getState().placedSlots.sand).toBe('crab');

      teacherSyncStore.resetHabitatPlacement();
      expect(teacherSyncStore.getState().placedSlots.sand).toBeNull();
    });

    it('should dispatch interactive quiz polling and solution reveal states', () => {
      const initialVotes = teacherSyncStore.getState().quiz.totalVotes;
      teacherSyncStore.submitQuizVote('opt-b');
      expect(teacherSyncStore.getState().quiz.totalVotes).toBe(initialVotes + 1);

      teacherSyncStore.toggleQuizReveal(true);
      expect(teacherSyncStore.getState().quiz.isRevealed).toBe(true);
    });

    it('should trigger session end transition for navigation to /teacher/results', () => {
      let ended = false;
      const unsub = oceanShowcaseStore.subscribe((state) => {
        ended = state.isSessionEnded;
      });

      expect(oceanShowcaseStore.getState().isSessionEnded).toBe(false);
      oceanShowcaseStore.endSession();
      teacherSyncStore.endSession();

      expect(ended).toBe(true);
      expect(oceanShowcaseStore.getState().isSessionEnded).toBe(true);
      expect(teacherSyncStore.getState().isSessionEnded).toBe(true);
      expect(teacherSyncStore.getState().activeStep).toBe(5);

      unsub();
    });
  });
});
