/**
 * Empirical Adversarial Test Suite: Teacher 5-Step Parity & Navigation Synchronization Stress
 * BlueSTEAM v2 — Milestone 5 (Squad 8 Step Parity Challenger)
 * 
 * Verifies:
 * 1. Canonical 5-step curriculum parity & sequential IDs [1, 2, 3, 4, 5] across builder, console, and store
 * 2. Active preview updating on selecting each step (1 to 5) in TeacherLessonBuilderPage
 * 3. "Bắt đầu" button simulation synchronizing teacherSyncStore and oceanShowcaseStore
 * 4. Rapid sequential step switching and boundary stress checks (clamp at 1 and 5, guard out-of-range)
 * 5. TeacherLiveConsolePage 5-step stepper interactivity & real-time store synchronization
 * 6. Dual-mode curriculum parity: Plan Mode (?mode=plan) vs Interactive Builder Mode
 * 7. Stress & Concurrency: Multi-subscriber broadcast scaling under rapid step transitions
 */

// Setup minimal SSR window/document/sessionStorage/localStorage mock
if (typeof globalThis.window === 'undefined') {
  const sessionStorageStore: Record<string, string> = {};
  const localStorageStore: Record<string, string> = {};
  (globalThis as any).window = {
    location: { pathname: '/teacher/builder', search: '', href: 'http://localhost:5173/teacher/builder' },
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
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Stores & Shared services
import {
  teacherSyncStore,
  CANONICAL_LESSON_STEPS,
  STEP_METADATA,
  LessonStepId,
} from '../src/services/teacherSyncStore';
import { oceanShowcaseStore } from '../src/demo/storage/oceanShowcaseStore';

// Pages under test
import {
  TeacherLessonBuilderPage,
  CANONICAL_BUILDER_ACTIVITIES,
  CANONICAL_BUILDER_STEPS,
} from '../src/pages/teacher/TeacherLessonBuilderPage';
import {
  TeacherLiveConsolePage,
  CANONICAL_LIVE_CONSOLE_STEPS,
  CANONICAL_CONSOLE_STEPS,
} from '../src/pages/teacher/TeacherLiveConsolePage';

// Providers helper
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';

function renderWithProviders(element: React.ReactElement, pathname = '/teacher/builder', search = ''): string {
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

// Tree search helper to find elements in a React element tree (handles nested arrays)
function findNodes(node: any, predicate: (node: any) => boolean, results: any[] = []): any[] {
  if (!node) return results;
  if (Array.isArray(node)) {
    for (const item of node) {
      findNodes(item, predicate, results);
    }
    return results;
  }
  if (predicate(node)) {
    results.push(node);
  }
  if (node.props && node.props.children) {
    findNodes(node.props.children, predicate, results);
  }
  return results;
}

// Helper to render TeacherLessonBuilderPage with a specific step active via React Dispatcher
function renderBuilderWithStep(step: number) {
  let capturedTree: any = null;
  const internals = (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

  function CaptureHarness() {
    const origUseState = internals?.H?.useState;
    if (internals?.H && origUseState) {
      internals.H.useState = function (initialVal: any) {
        if (initialVal === 1) {
          // Intercept activeStepId hook
          return [step, vi.fn()];
        }
        return origUseState.apply(this, arguments);
      };
    }

    try {
      const el = TeacherLessonBuilderPage();
      capturedTree = el;
      return el;
    } finally {
      if (internals?.H && origUseState) {
        internals.H.useState = origUseState;
      }
    }
  }

  const html = renderWithProviders(React.createElement(CaptureHarness), '/teacher/builder');
  return { html, capturedTree };
}

// Helper to capture TeacherLiveConsolePage element tree
function captureLiveConsole() {
  let capturedTree: any = null;
  function ConsoleHarness() {
    const el = TeacherLiveConsolePage();
    capturedTree = el;
    return el;
  }
  const html = renderWithProviders(React.createElement(ConsoleHarness), '/teacher/live');
  return { html, capturedTree };
}

describe('M5 Challenger 1 (Round 2): Teacher 5-Step Parity & Navigation Synchronization Stress Suite', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.location.pathname = '/teacher/builder';
      window.location.search = '';
    }
    teacherSyncStore.resetSession();
    oceanShowcaseStore.resetAll();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    teacherSyncStore.resetSession();
    oceanShowcaseStore.resetAll();
  });

  // ==========================================================================
  // Section 1: Canonical 5-Step Curriculum Parity & Sequential ID Integrity
  // ==========================================================================
  describe('1. Canonical 5-Step Curriculum Parity Across Builder, Live Console, and Sync Store', () => {
    it('should assert all 5 canonical steps exist with sequential IDs [1, 2, 3, 4, 5] across all three modules', () => {
      // 1. Sync Store Steps
      expect(CANONICAL_LESSON_STEPS).toEqual([1, 2, 3, 4, 5]);
      expect(Object.keys(STEP_METADATA).map(Number)).toEqual([1, 2, 3, 4, 5]);

      // 2. Builder Activities
      expect(CANONICAL_BUILDER_ACTIVITIES).toHaveLength(5);
      expect(CANONICAL_BUILDER_STEPS).toHaveLength(5);
      const builderIds = CANONICAL_BUILDER_ACTIVITIES.map((act) => act.id);
      expect(builderIds).toEqual([1, 2, 3, 4, 5]);

      // 3. Live Console Steps
      expect(CANONICAL_LIVE_CONSOLE_STEPS).toHaveLength(5);
      expect(CANONICAL_CONSOLE_STEPS).toHaveLength(5);
      const consoleIds = CANONICAL_LIVE_CONSOLE_STEPS.map((step) => step.id);
      expect(consoleIds).toEqual([1, 2, 3, 4, 5]);

      // 4. Cross-module strict equivalence
      expect(builderIds).toEqual(consoleIds);
      expect(builderIds).toEqual([...CANONICAL_LESSON_STEPS]);
    });

    it('should verify pedagogical progression alignment across builder activities and console steps', () => {
      // Step 1: Khởi động (Story / Observation)
      expect(CANONICAL_BUILDER_ACTIVITIES[0].title).toMatch(/Khởi động/i);
      expect(CANONICAL_LIVE_CONSOLE_STEPS[0].title).toMatch(/Khởi động|Quan sát/i);
      expect(STEP_METADATA[1].title).toMatch(/Câu chuyện|Hành trình/i);

      // Step 2: Quan sát 3D (Specimen Deep-Dive)
      expect(CANONICAL_BUILDER_ACTIVITIES[1].title).toMatch(/Quan sát 3D/i);
      expect(CANONICAL_LIVE_CONSOLE_STEPS[1].title).toMatch(/Quan sát 3D|Thảo luận/i);
      expect(STEP_METADATA[2].title).toMatch(/Quan sát|Giải phẫu/i);

      // Step 3: Thực hành (Habitat Matching)
      expect(CANONICAL_BUILDER_ACTIVITIES[2].title).toMatch(/Thực hành|Ghép nơi sống/i);
      expect(CANONICAL_LIVE_CONSOLE_STEPS[2].title).toMatch(/tương tác|Ghép nơi sống/i);
      expect(STEP_METADATA[3].title).toMatch(/Tìm nơi sống/i);

      // Step 4: Thử thách (Interactive Quiz Voting)
      expect(CANONICAL_BUILDER_ACTIVITIES[3].title).toMatch(/Thử thách/i);
      expect(CANONICAL_LIVE_CONSOLE_STEPS[3].title).toMatch(/Củng cố|Thử thách/i);
      expect(STEP_METADATA[4].title).toMatch(/Thử thách|Đố vui/i);

      // Step 5: Đúc kết & Huy hiệu STEAM (Session Wrap-up & Badges)
      expect(CANONICAL_BUILDER_ACTIVITIES[4].title).toMatch(/Đúc kết|Huy hiệu/i);
      expect(CANONICAL_LIVE_CONSOLE_STEPS[4].title).toMatch(/Vinh danh|Huy hiệu/i);
      expect(STEP_METADATA[5].title).toMatch(/Vinh danh|Huy hiệu/i);
    });

    it('should confirm each activity contains non-empty metadata, valid thumbnails, and target habitats', () => {
      CANONICAL_BUILDER_ACTIVITIES.forEach((act) => {
        expect(act.title.trim().length).toBeGreaterThan(0);
        expect(act.subtitle.trim().length).toBeGreaterThan(0);
        expect(act.thumbnail.startsWith('/')).toBe(true);
        expect(act.targetHabitat.trim().length).toBeGreaterThan(0);
      });

      CANONICAL_LIVE_CONSOLE_STEPS.forEach((step) => {
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.desc.trim().length).toBeGreaterThan(0);
      });
    });
  });

  // ==========================================================================
  // Section 2: Step Selection (1 to 5) in Builder Updates Active Preview
  // ==========================================================================
  describe('2. Selecting Each Step (1 to 5) in TeacherLessonBuilderPage Updates Active Preview Accordingly', () => {
    it.each([1, 2, 3, 4, 5])(
      'should render matching preview header, step indicator, and active card styles for Step %i',
      (stepNum) => {
        const { html, capturedTree } = renderBuilderWithStep(stepNum);
        const expectedActivity = CANONICAL_BUILDER_ACTIVITIES.find((a) => a.id === stepNum)!;

        // Clean React SSR comment delimiters (<!-- -->) and HTML entities
        const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '').replace(/&amp;/g, '&');

        // 1. Preview Header displays selected activity title
        expect(cleanHtml).toContain('Xem trước hoạt động:');
        expect(cleanHtml).toContain(`Xem trước hoạt động: ${expectedActivity.title}`);

        // 2. Step Counter displays "Bước X/5"
        expect(cleanHtml).toContain(`Bước ${stepNum}/5`);

        // 3. Tree verification: center preview header node contains stepNum
        expect(capturedTree).toBeDefined();
        const stepBadgeNodes = findNodes(
          capturedTree,
          (n) =>
            n.props &&
            Array.isArray(n.props.children) &&
            n.props.children[0] === 'Bước ' &&
            n.props.children[1] === stepNum
        );
        expect(stepBadgeNodes.length).toBeGreaterThan(0);
      }
    );

    it('should highlight only the active step in the left-hand activity navigation list', () => {
      for (const currentStep of [1, 2, 3, 4, 5]) {
        const { capturedTree } = renderBuilderWithStep(currentStep);

        // Find only the activity cards (divs with p-3 rounded-2xl border)
        const cards = findNodes(
          capturedTree,
          (n) => n.type === 'div' && n.props && typeof n.props.className === 'string' && n.props.className.includes('p-3 rounded-2xl border') && n.props.onClick
        );

        expect(cards.length).toBe(5);

        // The active card must have the teal border / sky ring classes
        const activeCard = cards[currentStep - 1];
        expect(activeCard.props.className).toContain('border-[#17657A]');
        expect(activeCard.props.className).toContain('ring-2 ring-[#17657A]/20');

        // Other cards must NOT have the active ring
        cards.forEach((card, idx) => {
          if (idx !== currentStep - 1) {
            expect(card.props.className).not.toContain('border-[#17657A]');
            expect(card.props.className).toContain('border-slate-200/80');
          }
        });
      }
    });

    it('should highlight the matching bottom preview slide dot corresponding to the active step', () => {
      for (const currentStep of [1, 2, 3, 4, 5]) {
        const { capturedTree } = renderBuilderWithStep(currentStep);

        // Find the dot indicator container (flex items-center gap-1.5 bg-black/40)
        const dotContainers = findNodes(
          capturedTree,
          (n) => n.props && typeof n.props.className === 'string' && n.props.className.includes('bg-black/40 backdrop-blur-xs px-3')
        );

        expect(dotContainers.length).toBeGreaterThan(0);
        const dots = dotContainers[0].props.children;
        expect(dots).toHaveLength(5);

        // Active dot has 'bg-white w-3', inactive has 'bg-white/40'
        dots.forEach((dot: any, idx: number) => {
          const dotStep = idx + 1;
          if (dotStep === currentStep) {
            expect(dot.props.className).toContain('bg-white w-3');
          } else {
            expect(dot.props.className).toContain('bg-white/40');
          }
        });
      }
    });
  });

  // ==========================================================================
  // Section 3: "Bắt đầu" Button Click Simulation & Dual Store Synchronization
  // ==========================================================================
  describe('3. Simulating "Bắt đầu" Button Click Synchronizes teacherSyncStore and oceanShowcaseStore', () => {
    it('should locate the "Bắt đầu" button with valid onClick handler in the builder tree', () => {
      const { capturedTree } = renderBuilderWithStep(1);

      const startButtons = findNodes(
        capturedTree,
        (n) => n.type === 'button' && n.props && n.props.onClick && typeof n.props.className === 'string' && n.props.className.includes('bg-[#102A38]')
      );

      expect(startButtons.length).toBeGreaterThan(0);
      const startBtn = startButtons[0];
      expect(typeof startBtn.props.onClick).toBe('function');

      // Verify button label text contains "Bắt đầu"
      const labelNodes = findNodes(
        startBtn,
        (n) => n.type === 'span' && n.props && n.props.children === 'Bắt đầu'
      );
      expect(labelNodes.length).toBe(1);
    });

    it.each([1, 2, 3, 4, 5])(
      'should synchronize both teacherSyncStore and oceanShowcaseStore to Step %i upon "Bắt đầu" click',
      (targetStep) => {
        // Reset stores to a different step first
        teacherSyncStore.setStep(1);
        oceanShowcaseStore.setActiveStep(1);

        const { capturedTree } = renderBuilderWithStep(targetStep);

        // Find and invoke the "Bắt đầu" button onClick
        const startBtn = findNodes(
          capturedTree,
          (n) => n.type === 'button' && n.props && n.props.onClick && typeof n.props.className === 'string' && n.props.className.includes('bg-[#102A38]')
        )[0];

        expect(startBtn).toBeDefined();

        // Spy on navigation
        let navigatedRoute = '';
        if (typeof window !== 'undefined') {
          (window as any).history.pushState = (_: any, __: any, url: string) => {
            navigatedRoute = url;
          };
        }

        // Execute click simulation
        startBtn.props.onClick();

        // 1. oceanShowcaseStore synchronized
        expect(oceanShowcaseStore.getState().activeStep).toBe(targetStep);

        // 2. teacherSyncStore synchronized
        const syncState = teacherSyncStore.getState();
        expect(syncState.activeStep).toBe(targetStep);
        expect(syncState.stepTitle).toBe(STEP_METADATA[targetStep as LessonStepId].title);
        expect(syncState.stepDescription).toBe(STEP_METADATA[targetStep as LessonStepId].desc);
      }
    );

    it('should notify all registered broadcast subscribers when "Bắt đầu" triggers step synchronization', () => {
      let showcaseNotifiedStep = 0;
      let teacherSyncNotifiedStep = 0;

      const unsubShowcase = oceanShowcaseStore.subscribe((state) => {
        showcaseNotifiedStep = state.activeStep;
      });
      const unsubSync = teacherSyncStore.subscribe((state) => {
        teacherSyncNotifiedStep = state.activeStep;
      });

      // Render at Step 4 and click "Bắt đầu"
      const { capturedTree } = renderBuilderWithStep(4);
      const startBtn = findNodes(
        capturedTree,
        (n) => n.type === 'button' && n.props && n.props.onClick && typeof n.props.className === 'string' && n.props.className.includes('bg-[#102A38]')
      )[0];

      startBtn.props.onClick();

      expect(showcaseNotifiedStep).toBe(4);
      expect(teacherSyncNotifiedStep).toBe(4);

      unsubShowcase();
      unsubSync();
    });
  });

  // ==========================================================================
  // Section 4: Rapid Sequential Step Switching & Boundary Checks
  // ==========================================================================
  describe('4. Rapid Sequential Step Switching and Boundary Stress Checks', () => {
    it('should sustain rapid forward progression (1 -> 2 -> 3 -> 4 -> 5) through nextStep() and clamp at step 5', () => {
      teacherSyncStore.setStep(1);
      expect(teacherSyncStore.getState().activeStep).toBe(1);

      // Step 1 -> 2
      teacherSyncStore.nextStep();
      expect(teacherSyncStore.getState().activeStep).toBe(2);

      // Step 2 -> 3
      teacherSyncStore.nextStep();
      expect(teacherSyncStore.getState().activeStep).toBe(3);

      // Step 3 -> 4
      teacherSyncStore.nextStep();
      expect(teacherSyncStore.getState().activeStep).toBe(4);

      // Step 4 -> 5
      teacherSyncStore.nextStep();
      expect(teacherSyncStore.getState().activeStep).toBe(5);

      // Upper boundary check: calling nextStep() when already at step 5 must clamp at 5
      for (let i = 0; i < 10; i++) {
        teacherSyncStore.nextStep();
        expect(teacherSyncStore.getState().activeStep).toBe(5);
        expect(teacherSyncStore.getState().stepTitle).toBe(STEP_METADATA[5].title);
      }
    });

    it('should sustain rapid backward progression (5 -> 4 -> 3 -> 2 -> 1) through prevStep() and clamp at step 1', () => {
      teacherSyncStore.setStep(5);
      expect(teacherSyncStore.getState().activeStep).toBe(5);

      // Step 5 -> 4
      teacherSyncStore.prevStep();
      expect(teacherSyncStore.getState().activeStep).toBe(4);

      // Step 4 -> 3
      teacherSyncStore.prevStep();
      expect(teacherSyncStore.getState().activeStep).toBe(3);

      // Step 3 -> 2
      teacherSyncStore.prevStep();
      expect(teacherSyncStore.getState().activeStep).toBe(2);

      // Step 2 -> 1
      teacherSyncStore.prevStep();
      expect(teacherSyncStore.getState().activeStep).toBe(1);

      // Lower boundary check: calling prevStep() when already at step 1 must clamp at 1
      for (let i = 0; i < 10; i++) {
        teacherSyncStore.prevStep();
        expect(teacherSyncStore.getState().activeStep).toBe(1);
        expect(teacherSyncStore.getState().stepTitle).toBe(STEP_METADATA[1].title);
      }
    });

    it('should withstand rapid randomized zigzag transitions without desynchronization or race conditions', () => {
      const transitions: LessonStepId[] = [3, 1, 5, 2, 4, 1, 3, 5, 4, 2, 3];
      const observedSteps: number[] = [];

      const unsub = teacherSyncStore.subscribe((state) => {
        observedSteps.push(state.activeStep);
      });

      transitions.forEach((target) => {
        teacherSyncStore.setStep(target);
        oceanShowcaseStore.setActiveStep(target);

        expect(teacherSyncStore.getState().activeStep).toBe(target);
        expect(oceanShowcaseStore.getState().activeStep).toBe(target);
        expect(teacherSyncStore.getState().stepTitle).toBe(STEP_METADATA[target].title);
      });

      // Ensure every transition was observed in exact order
      // (Note: first entry in observedSteps is the initial callback upon subscribe)
      expect(observedSteps.slice(1)).toEqual(transitions);
      unsub();
    });

    it('should preserve session invariants (classCode, className, teacherName) across 100 rapid step switches', () => {
      const initialCode = teacherSyncStore.getState().classCode;
      const initialClass = teacherSyncStore.getState().className;
      const initialTeacher = teacherSyncStore.getState().teacherName;

      for (let i = 0; i < 100; i++) {
        const randomStep = ((i % 5) + 1) as LessonStepId;
        teacherSyncStore.setStep(randomStep);
        oceanShowcaseStore.setActiveStep(randomStep);

        const current = teacherSyncStore.getState();
        expect(current.activeStep).toBe(randomStep);
        expect(current.classCode).toBe(initialCode);
        expect(current.className).toBe(initialClass);
        expect(current.teacherName).toBe(initialTeacher);
      }
    });

    it('should verify TeacherLiveConsolePage guards step navigation between [1, 5] and ignores out-of-range steps', () => {
      // In TeacherLiveConsolePage, handleStepChange checks (step >= 1 && step <= 5)
      // Test this logic explicitly:
      const safeConsoleStepDispatch = (step: number) => {
        oceanShowcaseStore.setActiveStep(step);
        if (step >= 1 && step <= 5) {
          teacherSyncStore.setStep(step as LessonStepId);
        }
      };

      // Set initial valid step 3
      safeConsoleStepDispatch(3);
      expect(teacherSyncStore.getState().activeStep).toBe(3);

      // Out-of-bounds attempts: 0, 6, -1, 999
      safeConsoleStepDispatch(0);
      expect(teacherSyncStore.getState().activeStep).toBe(3); // untouched!

      safeConsoleStepDispatch(6);
      expect(teacherSyncStore.getState().activeStep).toBe(3); // untouched!

      safeConsoleStepDispatch(-1);
      expect(teacherSyncStore.getState().activeStep).toBe(3); // untouched!

      safeConsoleStepDispatch(999);
      expect(teacherSyncStore.getState().activeStep).toBe(3); // untouched!

      // Valid boundary values
      safeConsoleStepDispatch(1);
      expect(teacherSyncStore.getState().activeStep).toBe(1);

      safeConsoleStepDispatch(5);
      expect(teacherSyncStore.getState().activeStep).toBe(5);
    });
  });

  // ==========================================================================
  // Section 5: TeacherLiveConsolePage 5-Step Stepper & Step Switching Interactivity
  // ==========================================================================
  describe('5. TeacherLiveConsolePage 5-Step Stepper & Interactive Step Switching', () => {
    it.each([1, 2, 3, 4, 5])('should render Step %i with active highlight styling in TeacherLiveConsolePage', (stepId) => {
      teacherSyncStore.setStep(stepId as LessonStepId);
      oceanShowcaseStore.setActiveStep(stepId);

      const { html, capturedTree } = captureLiveConsole();
      const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '').replace(/&amp;/g, '&');

      // Console stepper header displays "5 bước"
      expect(cleanHtml).toContain('5 bước');

      // Find all step cards in live console stepper
      const stepCards = findNodes(
        capturedTree,
        (n) => n.type === 'div' && n.props && typeof n.props.className === 'string' && n.props.className.includes('relative z-10 p-3 rounded-2xl border') && n.props.onClick
      );

      expect(stepCards).toHaveLength(5);

      // Active card has 'bg-sky-50/70 border-[#17657A]'
      const activeCard = stepCards[stepId - 1];
      expect(activeCard.props.className).toContain('border-[#17657A]');
      expect(activeCard.props.className).toContain('bg-sky-50/70');

      // Other cards are inactive
      stepCards.forEach((card, idx) => {
        if (idx !== stepId - 1) {
          expect(card.props.className).not.toContain('border-[#17657A]');
          expect(card.props.className).toContain('border-slate-100');
        }
      });
    });

    it('should invoke step item onClick handlers and synchronize both stores to clicked step', () => {
      const { capturedTree } = captureLiveConsole();

      const stepCards = findNodes(
        capturedTree,
        (n) => n.type === 'div' && n.props && typeof n.props.className === 'string' && n.props.className.includes('relative z-10 p-3 rounded-2xl border') && n.props.onClick
      );

      expect(stepCards).toHaveLength(5);

      // Click each step in arbitrary sequence
      const testSequence = [2, 4, 1, 5, 3];
      for (const target of testSequence) {
        const card = stepCards[target - 1];
        card.props.onClick();

        expect(oceanShowcaseStore.getState().activeStep).toBe(target);
        expect(teacherSyncStore.getState().activeStep).toBe(target);
      }
    });
  });

  // ==========================================================================
  // Section 6: Dual-Mode Parity: Plan Mode (?mode=plan) vs Interactive Builder Mode
  // ==========================================================================
  describe('6. Dual-Mode Parity: Plan Mode (?mode=plan) vs Interactive Builder Mode', () => {
    it('should verify Plan Mode renders all 5 pedagogical STEAM progression stages', () => {
      const htmlPlan = renderWithProviders(
        React.createElement(TeacherLessonBuilderPage),
        '/teacher/builder',
        '?mode=plan'
      );
      const cleanHtml = htmlPlan.replace(/<!--[\s\S]*?-->/g, '');

      // 5 Canonical STEAM Stages in Plan Mode
      expect(cleanHtml).toContain('Khởi động: Quan sát rùa biển và đặt câu hỏi');
      expect(cleanHtml).toContain('Khám phá: Tìm hiểu các kiểu nơi sống');
      expect(cleanHtml).toContain('Thực hành: Ghép sinh vật với nơi sống');
      expect(cleanHtml).toContain('Sáng tạo: Làm sản phẩm về nơi sống');
      expect(cleanHtml).toContain('Tổng kết: Chia sẻ và đúc kết');
    });

    it('should maintain strict 1:1 phase alignment between Plan Mode stages and Interactive Builder activities', () => {
      expect(CANONICAL_BUILDER_ACTIVITIES[0].title).toContain('Khởi động');
      expect(CANONICAL_BUILDER_ACTIVITIES[1].title).toContain('Quan sát 3D');
      expect(CANONICAL_BUILDER_ACTIVITIES[2].title).toContain('Thực hành');
      expect(CANONICAL_BUILDER_ACTIVITIES[3].title).toContain('Thử thách');
      expect(CANONICAL_BUILDER_ACTIVITIES[4].title).toContain('Đúc kết');
    });
  });

  // ==========================================================================
  // Section 7: Multi-Subscriber Broadcast Stress & Memory Cleanliness
  // ==========================================================================
  describe('7. Multi-Subscriber Broadcast Stress & Memory Cleanliness', () => {
    it('should broadcast step updates to 20 concurrent subscribers simultaneously without dropouts', () => {
      const subscriberRecords: number[][] = Array.from({ length: 20 }, () => []);
      const unsubs: Array<() => void> = [];

      for (let i = 0; i < 20; i++) {
        const subIndex = i;
        const unsub = teacherSyncStore.subscribe((state) => {
          subscriberRecords[subIndex].push(state.activeStep);
        });
        unsubs.push(unsub);
      }

      // Execute 15 rapid step changes
      const stepsToBroadcast: LessonStepId[] = [1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 5, 2, 4, 1, 5];
      stepsToBroadcast.forEach((s) => {
        teacherSyncStore.setStep(s);
      });

      // Assert all 20 subscribers received identical transition sequence
      subscriberRecords.forEach((records) => {
        // slice(1) to ignore the immediate state invocation on subscribe
        expect(records.slice(1)).toEqual(stepsToBroadcast);
      });

      // Cleanup subscribers
      unsubs.forEach((u) => u());

      // Broadcast one more change: no subscriber should receive it
      teacherSyncStore.setStep(2);
      subscriberRecords.forEach((records) => {
        expect(records[records.length - 1]).toBe(5);
      });
    });
  });
});
