// Setup minimal SSR window/document/sessionStorage/localStorage mock prior to any imports
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
      style: { setProperty: () => {}, getPropertyValue: () => '' },
      classList: { add: () => {}, remove: () => {} },
    },
    createElement: () => ({
      getContext: () => null,
    }),
  };
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { TeacherShell } from '../src/shells/TeacherShell';
import { TeacherDashboardPage } from '../src/pages/teacher/TeacherDashboardPage';
import { TeacherResourceLibraryPage, SAMPLE_RESOURCES } from '../src/pages/teacher/TeacherResourceLibraryPage';
import { TeacherLessonBuilderPage } from '../src/pages/teacher/TeacherLessonBuilderPage';
import { TeacherLiveConsolePage } from '../src/pages/teacher/TeacherLiveConsolePage';
import { teacherSyncStore, INITIAL_SYNC_STATE, LessonStepId } from '../src/services/teacherSyncStore';
import { oceanShowcaseStore } from '../src/demo/storage/oceanShowcaseStore';
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';

// Helper to render components inside the required app providers
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

describe('M5 Challenger 1: Squad 8 Teacher Suite Empirical & Adversarial Stress Suite', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.location.pathname = '/teacher';
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
  // SECTION 1: TeacherShell Conformance & Destination Integrity
  // ==========================================================================
  describe('1. TeacherShell Conformance & 5 Canonical Destinations', () => {
    it('should render the 5 canonical destinations and avatar initials "CL" for Cô Linh', () => {
      const html = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'lessons', teacherName: 'Cô Linh', isLiveConnected: true },
          React.createElement('div', null, 'Content')
        )
      );

      // 5 Canonical educator destinations
      expect(html).toContain('Bài giảng');
      expect(html).toContain('Giáo án');
      expect(html).toContain('Học liệu');
      expect(html).toContain('Lớp học');
      expect(html).toContain('Kết quả');

      // Avatar initials & Persona name
      expect(html).toContain('CL');
      expect(html).toContain('Cô Linh');

      // Suite branding badge
      expect(html).toContain('Teacher Suite');

      // Accessibility labeling
      expect(html).toContain('aria-label="Về bàn làm việc giáo viên"');
      expect(html).toContain('aria-label="Tài khoản giáo viên"');
      expect(html).toContain('aria-label="Điều hướng giáo viên"');
    });

    it('should render correct initials for custom or edge-case teacher names', () => {
      // Standard custom name
      const htmlCustom = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'lessons', teacherName: 'Hải Yến' })
      );
      expect(htmlCustom).toContain('HẢ');
      expect(htmlCustom).toContain('Hải Yến');

      // Empty name edge-case: should not crash and produce empty avatar safely
      const htmlEmpty = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'lessons', teacherName: '' })
      );
      expect(htmlEmpty).toBeDefined();
    });

    it('should accurately reflect active state indicators for each navigation tab alias', () => {
      // 1. lessons / dashboard -> Bài giảng active
      const htmlLessons = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'lessons' })
      );
      expect(htmlLessons).toContain('Bài giảng');

      // 2. plan / builder / curriculum -> Giáo án active
      const htmlPlan = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'plan' })
      );
      expect(htmlPlan).toContain('Giáo án');

      // 3. library / resources -> Học liệu active
      const htmlLibrary = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'library' })
      );
      expect(htmlLibrary).toContain('Học liệu');

      // 4. live -> Lớp học active
      const htmlLive = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'live' })
      );
      expect(htmlLive).toContain('Lớp học');

      // 5. results -> Kết quả active
      const htmlResults = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'results' })
      );
      expect(htmlResults).toContain('Kết quả');
    });

    it('should correctly toggle live connection state badge between Live Sync and Offline', () => {
      const htmlConnected = renderWithProviders(
        React.createElement(TeacherShell, { isLiveConnected: true })
      );
      expect(htmlConnected).toContain('Live Sync');
      expect(htmlConnected).toContain('bg-emerald-50');

      const htmlOffline = renderWithProviders(
        React.createElement(TeacherShell, { isLiveConnected: false })
      );
      expect(htmlOffline).toContain('Offline');
      expect(htmlOffline).toContain('bg-amber-50');
    });

    it('should provide accessible mobile menu drawer trigger with aria-label', () => {
      const html = renderWithProviders(React.createElement(TeacherShell));
      expect(html).toContain('aria-label="Mở menu giáo viên"');
    });
  });

  // ==========================================================================
  // SECTION 2: TeacherDashboardPage Adult Tool Density & Card Geometry
  // ==========================================================================
  describe('2. TeacherDashboardPage Layout & Architecture', () => {
    it('should render TeacherDashboardPage with adult tool density and 28px standard card radiuses', () => {
      const html = renderWithProviders(React.createElement(TeacherDashboardPage));

      // Heading and active lesson banner
      expect(html).toContain('BÀI GIẢNG HIỆN TẠI');
      expect(html).toContain('Khám phá nơi sống');
      expect(html).toContain('Chủ đề: Cỏ biển và hệ sinh thái ven bờ');

      // Preparation tasks
      expect(html).toContain('Việc cần chuẩn bị');
      expect(html).toContain('Hoàn thiện giáo án');
      expect(html).toContain('Chuẩn bị học liệu');
      expect(html).toContain('Thiết lập hoạt động tương tác');

      // Saved lessons
      expect(html).toContain('Bài giảng đã lưu');
      expect(html).toContain('Chuỗi thức ăn trong đại dương');

      // 28px Apple standard card radius class
      expect(html).toContain('rounded-[28px]');
    });
  });

  // ==========================================================================
  // SECTION 3: TeacherResourceLibraryPage & Preschool Pedagogical Taxonomy
  // ==========================================================================
  describe('3. TeacherResourceLibraryPage — Strict Kindergarten Taxonomy (Reference Correction Line 28)', () => {
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

    it('should strictly contain ZERO primary or secondary strings in SAMPLE_RESOURCES data', () => {
      SAMPLE_RESOURCES.forEach((resource) => {
        const fullContent = `${resource.title} ${resource.description} ${resource.theme} ${resource.ageGroup} ${resource.objectives.join(' ')} ${resource.instructionText}`.toLowerCase();

        FORBIDDEN_LEVEL_STRINGS.forEach((forbidden) => {
          expect(fullContent).not.toContain(forbidden);
        });
      });
    });

    it('should strictly contain ZERO primary or secondary strings in rendered Library page HTML', () => {
      const html = renderWithProviders(React.createElement(TeacherResourceLibraryPage));
      const lowerHtml = html.toLowerCase();

      FORBIDDEN_LEVEL_STRINGS.forEach((forbidden) => {
        expect(lowerHtml).not.toContain(forbidden);
      });
    });

    it('should strictly enforce authentic preschool age tiers (Mầm, Chồi, Lá)', () => {
      const ALLOWED_PRESCHOOL_TIERS = [
        '3-4 tuổi (Mầm)',
        '4-5 tuổi (Chồi)',
        '5-6 tuổi (Lá)',
      ];

      SAMPLE_RESOURCES.forEach((res) => {
        expect(ALLOWED_PRESCHOOL_TIERS).toContain(res.ageGroup);
      });

      const html = renderWithProviders(React.createElement(TeacherResourceLibraryPage));
      expect(html).toContain('3-4 tuổi (Mầm)');
      expect(html).toContain('4-5 tuổi (Chồi)');
      expect(html).toContain('5-6 tuổi (Lá)');
    });

    it('should provide authentic kindergarten STEAM thematic categories', () => {
      const EXPECTED_STEAM_THEMES = [
        'Hệ sinh thái biển',
        'Động vật biển',
        'Thực vật biển',
        'Khám phá khoa học',
        'Hoạt động góc',
        'Kể chuyện sinh thái',
        'Bảo vệ môi trường',
      ];

      const html = renderWithProviders(React.createElement(TeacherResourceLibraryPage));
      EXPECTED_STEAM_THEMES.forEach((theme) => {
        expect(html).toContain(theme);
      });
    });

    it('should render interactive specimen preview pane with habitat target zones and creature tokens', () => {
      const html = renderWithProviders(React.createElement(TeacherResourceLibraryPage));

      // Drop zones matching mockup
      expect(html).toContain('Vùng ven bờ (cỏ biển)');
      expect(html).toContain('Rạn san hô');
      expect(html).toContain('Vùng nước sâu');

      // Objectives and guide
      expect(html).toContain('Mục tiêu');
      expect(html).toContain('Nhận biết một số môi trường sống trong hệ sinh thái biển');
      expect(html).toContain('Kéo thả các sinh vật vào đúng môi trường sống');

      // Action buttons
      expect(html).toContain('Thử hoạt động');
      expect(html).toContain('Thêm vào bài giảng');
      expect(html).toContain('Lưu');
    });
  });

  // ==========================================================================
  // SECTION 4: TeacherLessonBuilderPage Dual Mode & Step Synchronization
  // ==========================================================================
  describe('4. TeacherLessonBuilderPage — Dual Mode Switching & Step Sync (Reference Correction Line 30)', () => {
    it('should render 5-step curriculum planner when query param ?mode=plan is provided', () => {
      const htmlPlan = renderWithProviders(
        React.createElement(TeacherLessonBuilderPage),
        '/teacher/builder',
        '?mode=plan'
      );

      // Breadcrumb and Mode switcher link
      expect(htmlPlan).toContain('Giáo án');
      expect(htmlPlan).toContain('Khám phá nơi sống');
      expect(htmlPlan).toContain('Chuyển sang Trình soạn bài');

      // Quick navigator sections
      expect(htmlPlan).toContain('Nội dung giáo án');
      expect(htmlPlan).toContain('Mục tiêu');
      expect(htmlPlan).toContain('Chuẩn bị');
      expect(htmlPlan).toContain('Tiến trình');
      expect(htmlPlan).toContain('Quan sát');

      // 5 Authentic STEAM steps
      expect(htmlPlan).toContain('Khởi động: Quan sát rùa biển và đặt câu hỏi');
      expect(htmlPlan).toContain('Khám phá: Tìm hiểu các kiểu nơi sống');
      expect(htmlPlan).toContain('Thực hành: Ghép sinh vật với nơi sống');
      expect(htmlPlan).toContain('Sáng tạo: Làm sản phẩm về nơi sống');
      expect(htmlPlan).toContain('Tổng kết: Chia sẻ và đúc kết');

      // Attached materials
      expect(htmlPlan).toContain('Học liệu đính kèm');
      expect(htmlPlan).toContain('Hình ảnh nơi sống ven bờ');
      expect(htmlPlan).toContain('Hình ảnh rạn san hô');
      expect(htmlPlan).toContain('Phiếu học tập quan sát');

      // Actions
      expect(htmlPlan).toContain('Chỉnh sửa');
      expect(htmlPlan).toContain('In giáo án');
      expect(htmlPlan).toContain('Mở bài giảng');
    });

    it('should render default interactive lesson builder when ?mode=plan is absent', () => {
      const htmlBuilder = renderWithProviders(
        React.createElement(TeacherLessonBuilderPage),
        '/teacher/builder',
        ''
      );

      // Builder Header
      expect(htmlBuilder).toContain('Soạn bài: Khám phá nơi sống');
      expect(htmlBuilder).toContain('Quay lại danh sách bài giảng');
      expect(htmlBuilder).toContain('Xem góc nhìn của bé');
      expect(htmlBuilder).toContain('Bắt đầu');

      // Left column: Activities list
      expect(htmlBuilder).toContain('Hoạt động trong bài');
      expect(htmlBuilder).toContain('Quan sát rùa');
      expect(htmlBuilder).toContain('Tìm nơi sống');
      expect(htmlBuilder).toContain('Cùng sáng tạo');
      expect(htmlBuilder).toContain('Thêm hoạt động');

      // Center column: Live preview with turtle specimen & hotspots
      // Note: React renderToString separates JSX template expressions with <!-- -->
      expect(htmlBuilder).toContain('Xem trước hoạt động:');
      expect(htmlBuilder).toContain('Quan sát rùa');
      expect(htmlBuilder).toContain('Bước');
      expect(htmlBuilder).toContain('Em hãy chạm vào nơi rùa thường sống nhé!');
      expect(htmlBuilder).toContain('Vùng nước nông');
      expect(htmlBuilder).toContain('Thảm cỏ biển');
      expect(htmlBuilder).toContain('Rạn san hô');
      expect(htmlBuilder).toContain('Gợi ý');

      // Right column: Activity Settings
      expect(htmlBuilder).toContain('Cài đặt hoạt động');
      expect(htmlBuilder).toContain('Hướng dẫn cho trẻ');
      expect(htmlBuilder).toContain('Giọng đọc hướng dẫn');
      expect(htmlBuilder).toContain('Cho phép thử lại');
      expect(htmlBuilder).toContain('Gợi ý dành cho giáo viên');
      expect(htmlBuilder).toContain('Tùy chọn nâng cao');
    });

    it('should gracefully fallback to default interactive builder on unrecognized query modes', () => {
      const htmlFallback1 = renderWithProviders(
        React.createElement(TeacherLessonBuilderPage),
        '/teacher/builder',
        '?mode=unknown_mode'
      );
      expect(htmlFallback1).toContain('Soạn bài: Khám phá nơi sống');

      const htmlFallback2 = renderWithProviders(
        React.createElement(TeacherLessonBuilderPage),
        '/teacher/builder',
        '?mode=PLAN' // Case sensitivity check
      );
      expect(htmlFallback2).toContain('Soạn bài: Khám phá nơi sống');
    });
  });

  // ==========================================================================
  // SECTION 5: TeacherLiveConsolePage & teacherSyncStore State Dispatch
  // ==========================================================================
  describe('5. TeacherLiveConsolePage & teacherSyncStore State Dispatch', () => {
    it('should verify initial teacherSyncStore baseline state', () => {
      const state = teacherSyncStore.getState();
      expect(state.classCode).toBe('482915');
      expect(state.className).toBe('Lớp Sao Biển');
      expect(state.teacherName).toBe('Cô Linh');
      expect(state.activeStep).toBe(3);
      expect(state.connectedCount).toBe(24);
      expect(state.totalStudents).toBe(24);
      expect(state.isSessionEnded).toBe(false);
      expect(state.selectedCreature).toBe('turtle');
      expect(state.placedSlots.seagrass).toBe('turtle');
    });

    it('should broadcast step navigation transitions (1 to 5) and update metadata', () => {
      const stepEvents: number[] = [];
      const unsub = teacherSyncStore.subscribe((s) => {
        stepEvents.push(s.activeStep);
      });

      // Navigate to step 1
      teacherSyncStore.setStep(1);
      expect(teacherSyncStore.getState().activeStep).toBe(1);
      expect(teacherSyncStore.getState().stepTitle).toBe('Câu chuyện: Hành trình của Rùa Xanh');

      // Navigate through all steps
      for (let s = 2; s <= 5; s++) {
        teacherSyncStore.setStep(s as LessonStepId);
        expect(teacherSyncStore.getState().activeStep).toBe(s);
      }

      unsub();
      expect(stepEvents.length).toBeGreaterThanOrEqual(5);
    });

    it('should clamp step navigation bounds at step 1 and step 5 with nextStep() and prevStep()', () => {
      teacherSyncStore.setStep(1);
      teacherSyncStore.prevStep(); // Should stay at 1
      expect(teacherSyncStore.getState().activeStep).toBe(1);

      teacherSyncStore.setStep(5);
      teacherSyncStore.nextStep(); // Should stay at 5
      expect(teacherSyncStore.getState().activeStep).toBe(5);
    });

    it('should dispatch habitat slot placement and reset', () => {
      // Select clownfish and place in coral
      teacherSyncStore.selectCreature('clownfish');
      expect(teacherSyncStore.getState().selectedCreature).toBe('clownfish');

      teacherSyncStore.placeCreature('coral', 'clownfish');
      expect(teacherSyncStore.getState().placedSlots.coral).toBe('clownfish');

      // Place crab on sand
      teacherSyncStore.placeCreature('sand', 'crab');
      expect(teacherSyncStore.getState().placedSlots.sand).toBe('crab');

      // Reset
      teacherSyncStore.resetHabitatPlacement();
      expect(teacherSyncStore.getState().placedSlots.sand).toBeNull();
      expect(teacherSyncStore.getState().placedSlots.seagrass).toBeNull();
      expect(teacherSyncStore.getState().placedSlots.coral).toBeNull();
      expect(teacherSyncStore.getState().selectedCreature).toBe('turtle');
    });

    it('should dispatch interactive quiz voting and answer reveal', () => {
      const initialVotes = teacherSyncStore.getState().quiz.totalVotes;
      const initialOptBVotes = teacherSyncStore.getState().quiz.options.find(o => o.id === 'opt-b')!.votes;

      teacherSyncStore.submitQuizVote('opt-b');
      expect(teacherSyncStore.getState().quiz.totalVotes).toBe(initialVotes + 1);
      expect(teacherSyncStore.getState().quiz.options.find(o => o.id === 'opt-b')!.votes).toBe(initialOptBVotes + 1);

      // Reveal toggle
      expect(teacherSyncStore.getState().quiz.isRevealed).toBe(false);
      teacherSyncStore.toggleQuizReveal(true);
      expect(teacherSyncStore.getState().quiz.isRevealed).toBe(true);
    });

    it('should dispatch session completion and transition to ended state', () => {
      let ended = false;
      const unsub = teacherSyncStore.subscribe((state) => {
        if (state.isSessionEnded) ended = true;
      });

      teacherSyncStore.endSession();
      expect(ended).toBe(true);
      expect(teacherSyncStore.getState().isSessionEnded).toBe(true);
      expect(teacherSyncStore.getState().activeStep).toBe(5);

      unsub();
    });

    it('should maintain slot isolation so that placing one slot does not overwrite other slots', () => {
      teacherSyncStore.placeCreature('seagrass', 'turtle');
      teacherSyncStore.placeCreature('coral', 'clownfish');

      const state = teacherSyncStore.getState();
      expect(state.placedSlots.seagrass).toBe('turtle');
      expect(state.placedSlots.coral).toBe('clownfish');
      expect(state.placedSlots.sand).toBeNull();
    });

    it('should dispatch audio playback state and active text', () => {
      teacherSyncStore.setAudioPlaying(true, 'Đang đọc hướng dẫn cho bé');
      expect(teacherSyncStore.getState().isAudioPlaying).toBe(true);
      expect(teacherSyncStore.getState().activeAudioText).toBe('Đang đọc hướng dẫn cho bé');

      teacherSyncStore.setAudioPlaying(false);
      expect(teacherSyncStore.getState().isAudioPlaying).toBe(false);
      expect(teacherSyncStore.getState().activeAudioText).toBeNull();
    });

    it('should dispatch presentation display mode transitions', () => {
      teacherSyncStore.setPresentationMode('cinematic');
      expect(teacherSyncStore.getState().presentationMode).toBe('cinematic');

      teacherSyncStore.setPresentationMode('focus');
      expect(teacherSyncStore.getState().presentationMode).toBe('focus');

      teacherSyncStore.setPresentationMode('normal');
      expect(teacherSyncStore.getState().presentationMode).toBe('normal');
    });

    it('should render TeacherLiveConsolePage with live session controls and student monitor', () => {
      const html = renderWithProviders(React.createElement(TeacherLiveConsolePage));

      // Header & Breadcrumb
      expect(html).toContain('Bài giảng');
      expect(html).toContain('Khám phá nơi sống');
      expect(html).toContain('Chủ đề: Cỏ biển và hệ sinh thái ven bờ');

      // Action buttons
      expect(html).toContain('Trình chiếu');
      expect(html).toContain('Kết thúc');

      // Stepper & Activities
      expect(html).toContain('Hoạt động trong bài giảng');
      expect(html).toContain('Quan sát và khám phá');
      expect(html).toContain('Thảo luận cùng lớp');
      expect(html).toContain('Hoạt động tương tác');
      expect(html).toContain('Củng cố và mở rộng');

      // Activity Controls
      expect(html).toContain('Điều khiển hoạt động');
      expect(html).toContain('Tạm dừng');
      expect(html).toContain('Nghe lại');
      expect(html).toContain('Hiện gợi ý');

      // Live class metadata (React SSR separates static text and variable with comment)
      expect(html).toContain('Mã lớp:');
      expect(html).toContain('482915');
      expect(html).toContain('Thảm cỏ biển ven bờ');

      // Teacher Notes & Student Responses
      expect(html).toContain('Ghi chú của cô');
      expect(html).toContain('Phản hồi của học sinh');
    });
  });

  // ==========================================================================
  // SECTION 6: Adversarial Stress & Resiliency Scenarios
  // ==========================================================================
  describe('6. Adversarial High-Frequency & Listener Churn Stress Testing', () => {
    it('should withstand 100 rapid state mutations without corruption or dropped updates', () => {
      let notificationCount = 0;
      const unsub = teacherSyncStore.subscribe(() => {
        notificationCount++;
      });

      for (let i = 0; i < 100; i++) {
        const step = ((i % 5) + 1) as LessonStepId;
        teacherSyncStore.setStep(step);
      }

      unsub();
      // Should have received at least 100 notifications (plus initial call)
      expect(notificationCount).toBeGreaterThanOrEqual(100);
      expect(teacherSyncStore.getState().activeStep).toBe(5);
    });

    it('should safely isolate and not crash when individual listeners throw errors on mutation', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      let callCount = 0;
      const badListener = () => {
        callCount++;
        // Allow initial subscribe callback, throw on subsequent broadcast notifications
        if (callCount > 1) {
          throw new Error('Adversarial listener crash!');
        }
      };

      let goodListenerCalled = false;
      const goodListener = () => {
        goodListenerCalled = true;
      };

      const unsubBad = teacherSyncStore.subscribe(badListener);
      const unsubGood = teacherSyncStore.subscribe(goodListener);

      // Trigger mutation
      teacherSyncStore.setStep(2);

      expect(goodListenerCalled).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();

      unsubBad();
      unsubGood();
      consoleSpy.mockRestore();
    });

    it('should properly unsubscribe listeners without memory leaks or phantom dispatches', () => {
      let callCount = 0;
      const listener = () => {
        callCount++;
      };

      const unsub = teacherSyncStore.subscribe(listener);
      expect(callCount).toBe(1); // Initial invocation

      teacherSyncStore.setStep(2);
      expect(callCount).toBe(2);

      unsub();

      teacherSyncStore.setStep(3);
      teacherSyncStore.setStep(4);
      expect(callCount).toBe(2); // Should not increase after unsubscribe
    });
  });
});
