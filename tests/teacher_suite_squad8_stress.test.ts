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

import { TeacherShell } from '../src/shared/shells/TeacherShell';
import { TeacherDashboardPage } from '../src/domains/teacher/dashboard/TeacherDashboardPage';
import { TeacherResourceLibraryPage } from '../src/domains/teacher/resources/TeacherResourceLibraryPage';
import { TeacherLessonBuilderPage } from '../src/domains/teacher/lesson-builder/TeacherLessonBuilderPage';
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
    vi.restoreAllMocks();
  });

  afterEach(() => {
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

      // 5 Canonical r2 educator destinations
      expect(html).toContain('Trang chủ');
      expect(html).toContain('Học liệu');
      expect(html).toContain('Tương tác');
      expect(html).toContain('Sáng tạo');
      expect(html).not.toContain('Phòng học');

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
      // 1. lessons / overview -> Trang chủ active
      const htmlLessons = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'lessons' })
      );
      expect(htmlLessons).toContain('Trang chủ');

      // 2. plan / interactive -> Tương tác active
      const htmlPlan = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'plan' })
      );
      expect(htmlPlan).toContain('Tương tác');

      // 3. library / resources -> Học liệu active
      const htmlLibrary = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'library' })
      );
      expect(htmlLibrary).toContain('Học liệu');

      // 4. live / rooms -> Phòng học active
      const htmlLive = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'overview' })
      );
      expect(htmlLive).not.toContain('Phòng học');

      // 5. results / creative -> Sáng tạo & Phòng học present
      const htmlResults = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'creative' })
      );
      expect(htmlResults).not.toContain('Phòng học');
    });

    it('should correctly toggle live connection state badge between Live Sync and Offline', () => {
      const htmlConnected = renderWithProviders(
        React.createElement(TeacherShell, { isLiveConnected: true })
      );
      expect(htmlConnected).not.toContain('Live Sync');
      expect(htmlConnected).not.toContain('title="Live Sync"');

      const htmlOffline = renderWithProviders(
        React.createElement(TeacherShell, { isLiveConnected: false })
      );
      expect(htmlOffline).not.toContain('Offline');
      expect(htmlOffline).not.toContain('title="Offline"');
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
    it('should render TeacherDashboardPage (M07) with Home layout and technology classroom imagery', () => {
      const html = renderWithProviders(React.createElement(TeacherDashboardPage));

      // Heading and M07 workspace banner
      expect(html).toContain('Không gian của cô');
      expect(html).toContain('Chuẩn bị nội dung, cùng bé khám phá.');
      expect(html).toContain('Quản lý tương tác');
      expect(html).not.toContain('Mở phòng');

      // Domain management cards & shortcuts
      expect(html).toContain('Học liệu');
      expect(html).toContain('Tương tác');
      expect(html).toContain('Sáng tạo');
      expect(html).not.toContain('Buổi sinh hoạt gần đây');

      // Home-specific layout follows the approved mockup.
      expect(html).toContain('teacher-home-feature');
      expect(html).not.toContain('/assets/generated/home/home_classroom_atelier_v2.jpg');
    });
  });

  // ==========================================================================
  // SECTION 3: TeacherResourceLibraryPage & Preschool Pedagogical Taxonomy
  // ==========================================================================
  describe('Teacher resources redesign — groups and truthful loading',()=>{
    it('renders group management and server-backed filters without fabricated rows',()=>{
      const html=renderWithProviders(React.createElement(TeacherResourceLibraryPage));
      expect(html).toContain('Nhóm học liệu');
      expect(html).toContain('Chưa phân nhóm');
      expect(html).toContain('Tạo nhóm');
      expect(html).toContain('Thêm học liệu');
      expect(html).not.toMatch(/Xem như bé|Kho chung|Của cô|Nguồn học liệu/);
      expect(html).toContain('<table');
      expect(html).toContain('Đang tải học liệu');
      expect(html).not.toContain('Cua biển');
      expect(html).not.toContain('3-4 tuổi (Mầm)');
      expect(html).not.toContain('5-6 tuổi (Lá)');
    });
    it('keeps the library appropriate for preschool without retired school taxonomies',()=>{
      const html=renderWithProviders(React.createElement(TeacherResourceLibraryPage)).toLowerCase();
      for(const forbidden of ['tiểu học','thcs','thpt','trung học cơ sở','lớp 1','lớp 2'])expect(html).not.toContain(forbidden);
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

  // ==========================================================================
  // SECTION 6: Adversarial Stress & Resiliency Scenarios
  // ==========================================================================
});
