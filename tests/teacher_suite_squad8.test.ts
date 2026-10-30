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
import { applyThemeVariables } from '../src/shared/theme/tokens';
import { oceanAudio } from '../src/shared/audio/oceanAudio';

// Pages & Components
import { TeacherDashboardPage } from '../src/domains/teacher/dashboard/TeacherDashboardPage';
import {
  TeacherResourceLibraryPage,
} from '../src/domains/teacher/resources/TeacherResourceLibraryPage';
import {
  TeacherLessonBuilderPage,
  CANONICAL_BUILDER_ACTIVITIES,
} from '../src/domains/teacher/lesson-builder/TeacherLessonBuilderPage';

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

    it('should render TeacherDashboardPage (M07) with mockup feature, management row and shared shortcuts', () => {
      const html = renderWithProviders(React.createElement(TeacherDashboardPage));

      expect(html).toContain('class="teacher-home-feature"');
      expect(html).toContain('class="teacher-home-domains"');
      expect((html.match(/class="home-shortcut"/g) || []).length).toBe(1);

      // M07 Section Card Verification (UI-SPEC 2.4 & M07)
      expect(html).toContain('Không gian của cô');
      expect(html).toContain('Quản lý tương tác');
      expect(html).toContain('Quản lý');
      expect(html).toContain('sáng tạo');
      expect(html).not.toContain('Phòng');
      expect(html).not.toContain('sinh hoạt');
      expect(html).not.toContain('Buổi sinh hoạt gần đây');
      // No fake KPIs
      expect(html).not.toContain('98%');
    });
  });

  // ==========================================================================
  // Contract S8-2: Screen 32 Teacher Resource Library Strict Corrections (Line 28)
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
  // Contract S8-3: Screen 33 & 34 Dual Mode Lesson Builder & Step Integrity (Line 30)
  // ==========================================================================
  describe('Contract S8-3: Screen 33 & 34 Dual Mode Lesson Builder & Step Integrity (Line 30)', () => {

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
  });

  // ==========================================================================
  // Contract S8-4: Screen 35 Teacher Live Console Broadcast Synchronization & Attention Bell
  // ==========================================================================
});
