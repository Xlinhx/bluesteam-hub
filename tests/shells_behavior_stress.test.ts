// Setup minimal SSR window/document mock prior to any imports
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    location: { pathname: '/', search: '' },
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    history: { pushState: () => {}, replaceState: () => {} },
  };
}
if (typeof globalThis.document === 'undefined') {
  (globalThis as any).document = {
    body: { style: {} },
    documentElement: {
      style: { setProperty: () => {}, getPropertyValue: () => '' },
      classList: { add: () => {}, remove: () => {} }
    },
  };
}

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PublicShell } from '../src/shells/PublicShell';
import { PresentationShell } from '../src/shells/PresentationShell';
import { LearnerShell } from '../src/shells/LearnerShell';
import { TeacherShell } from '../src/shells/TeacherShell';
import { ActivityShell } from '../src/shells/ActivityShell';
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';

// Wrap helper with necessary context providers
function renderWithProviders(element: React.ReactElement): string {
  return renderToString(
    React.createElement(I18nProvider, null,
      React.createElement(RouterProvider, null, element)
    )
  );
}

// Relative luminance and WCAG contrast calculator
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = getRelativeLuminance(...rgb1);
  const l2 = getRelativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('M1 Challenger 2: Adversarial Shells & Regression Test Suite', () => {
  describe('1. PublicShell Integrity & Safety', () => {
    it('should render unauthenticated header with correct touch targets and no leaked user avatars', () => {
      const html = renderWithProviders(
        React.createElement(PublicShell, { activeNav: 'resources' },
          React.createElement('div', null, 'Landing Page Content')
        )
      );

      // Verify unauthenticated controls
      expect(html).toContain('Về trang chủ BlueSTEAM');
      expect(html).toContain('Điều hướng công khai');
      expect(html).toContain('Mở menu điều hướng');
      expect(html).toContain('min-w-[48px]');
      expect(html).toContain('min-h-[48px]');

      // Verify zero authenticated avatars leaked into PublicShell
      expect(html).not.toContain('Bé An');
      expect(html).not.toContain('Cô Linh');
      expect(html).not.toContain('CL');
    });
  });

  describe('2. PresentationShell Fullscreen & Join Code Contrast', () => {
    it('should render dark oceanic canvas and exceed WCAG AA 4.5:1 contrast for join code', () => {
      const html = renderWithProviders(
        React.createElement(PresentationShell, {
          joinCode: '482915',
          topicTitle: 'Rạn San Hô Hoàng Sa',
          stepIndicator: 'Bước 2/5',
        },
          React.createElement('div', null, 'Presentation Visual')
        )
      );

      // Verify dark canvas background
      expect(html).toContain('bg-[#041624]');
      expect(html).toContain('w-screen');
      expect(html).toContain('h-screen');

      // Verify topic title with -0.02em tracking
      expect(html).toContain('Rạn San Hô Hoàng Sa');
      expect(html).toContain('tracking-[-0.02em]');

      // Verify join code pill
      expect(html).toContain('482915');
      expect(html).toContain('text-[#F67650]');
      expect(html).toContain('font-mono');

      // Verify join code contrast ratio: Coral #F67650 on Deep Navy #071e2e
      const coralRgb: [number, number, number] = [246, 118, 80]; // #F67650
      const navyPillRgb: [number, number, number] = [7, 30, 46]; // #071e2e
      const ratio = getContrastRatio(coralRgb, navyPillRgb);

      expect(ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA requirement
      expect(ratio).toBeCloseTo(6.1, 0); // Observed 6.1:1 ratio
    });
  });

  describe('3. LearnerShell 5-Item Mobile Bottom Nav & Layout Preservation', () => {
    it('should preserve all 5 bottom nav items with min 56x56px touch targets and bottom clearance', () => {
      const html = renderWithProviders(
        React.createElement(LearnerShell, { activeNav: 'learn', learnerName: 'Bé An' },
          React.createElement('div', null, 'Student Dashboard')
        )
      );

      // Verify bottom nav layout
      expect(html).toContain('Điều hướng chính di động');
      expect(html).toContain('h-[68px]');
      expect(html).toContain('bottom-0');
      expect(html).toContain('fixed');

      // Verify bottom clearance on root container
      expect(html).toContain('pb-20');

      // Verify all 5 canonical items exist in output
      expect(html).toContain('Học liệu');
      expect(html).toContain('Học tập');
      expect(html).toContain('Tương tác');
      expect(html).toContain('Sáng tạo');
      expect(html).toContain('Hồ sơ');

      // Verify minimum 56x56px touch target classes
      expect(html).toContain('min-w-[56px]');
      expect(html).toContain('min-h-[56px]');

      // Verify learner avatar
      expect(html).toContain('Bé An');
      expect(html).toContain('Language toggle');
    });
  });

  describe('4. ActivityShell 56x56px Touch Target & Immersion Controls', () => {
    it('should strictly provide 56x56px touch target on back button and editorial typography', () => {
      const html = renderWithProviders(
        React.createElement(ActivityShell, {
          title: 'Ghép Nơi Sống',
          currentStep: 2,
          totalSteps: 4,
          onBack: () => {},
          onHint: () => {},
          isPaused: false,
          onTogglePause: () => {},
        },
          React.createElement('div', null, 'Game Canvas')
        )
      );

      // Verify back button satisfies min 56x56px touch target
      expect(html).toContain('min-w-[56px]');
      expect(html).toContain('min-h-[56px]');
      expect(html).toContain('Quay lại');

      // Verify editorial typography with -0.02em tracking
      expect(html).toContain('font-serif');
      expect(html).toContain('tracking-[-0.02em]');
      expect(html).toContain('Ghép Nơi Sống');

      // Verify dark immersion canvas
      expect(html).toContain('bg-[#0B232F]');
    });
  });

  describe('5. TeacherShell Persona & Routing Conformance', () => {
    it('should render Teacher Suite persona Cô Linh and 5 canonical educator destinations', () => {
      const html = renderWithProviders(
        React.createElement(TeacherShell, { activeNav: 'lessons', teacherName: 'Cô Linh', isLiveConnected: true },
          React.createElement('div', null, 'Teacher Dashboard')
        )
      );

      // Verify Teacher Suite badge
      expect(html).toContain('Teacher Suite');
      expect(html).toContain('Live Sync');
      expect(html).toContain('Cô Linh');
      expect(html).toContain('CL');

      // Verify teacher destinations
      expect(html).toContain('Bài giảng');
      expect(html).toContain('Giáo án');
      expect(html).toContain('Học liệu');
      expect(html).toContain('Lớp học');
      expect(html).toContain('Kết quả');
      expect(html).toContain('Về bàn làm việc giáo viên');
    });
  });
});
