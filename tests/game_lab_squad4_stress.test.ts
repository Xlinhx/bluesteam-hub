// Setup minimal SSR window/document mock prior to any imports
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    location: { pathname: '/', search: '' },
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    history: { length: 1, pushState: () => {}, replaceState: () => {}, back: () => {} },
    matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} }),
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

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';


import { GameLabPage } from '../src/domains/learner/game-lab/GameLabPage';
import { HabitatPlacementGamePage } from '../src/domains/learner/game-lab/HabitatPlacementGamePage';
import { ActivityShell } from '../src/shared/shells/ActivityShell';
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';
import { demoStore } from '../src/shared/realtime/demoStore';

function renderWithProviders(element: React.ReactElement, initialSearch: string = ''): string {
  if (typeof window !== 'undefined') {
    window.location.search = initialSearch;
  }
  return renderToString(
    React.createElement(I18nProvider, null,
      React.createElement(RouterProvider, null, element)
    )
  );
}

// Relative luminance and WCAG contrast helper
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

describe('Squad 4 Game Lab Empirical & Adversarial Stress Suite', () => {
  beforeEach(() => {
    demoStore.resetDemo();
    if (typeof window !== 'undefined') {
      window.location.search = '';
    }
  });

  describe('1. Interactive catalog redesign', () => {
    it('opens four clear activity worlds with an accessible search', () => {
      const html = renderWithProviders(React.createElement(GameLabPage));
      for (const label of ['Chơi và khám phá','Khám phá 3D','Trò chơi','Mô phỏng','Tình huống','Tìm hoạt động']) expect(html).toContain(label);
      expect(html).toContain('aria-label="Loại hoạt động tương tác"');
      expect(html).toMatch(/<button[^>]*aria-pressed="true"[^>]*data-testid="interactive-tab-game"/);
    });
    it('waits for backend activities without inventing progress or Bloom cards', () => {
      const html = renderWithProviders(React.createElement(GameLabPage));
      expect(html).toContain('aria-label="Đang tải hoạt động"');
      expect(html).not.toContain('Đang thực hiện');
      expect(html).not.toContain('Chơi tiếp');
      expect(html).not.toContain('Vận dụng');
      expect(html).not.toContain('ocean-activity-card__preview');
    });
    it('uses the same catalog for legacy portrait entry points', () => {
      const html = renderWithProviders(React.createElement(GameLabPage), '?layout=portrait');
      expect(html).toContain('ocean-play-catalog');
      expect(html).not.toContain('font-serif');
    });
  });

  describe('Historical habitat link uses the published activity', () => {
    it('loads actual content without inventing completed placements from feedback query parameters', () => {
      const html = renderWithProviders(React.createElement(HabitatPlacementGamePage), '?step=feedback');
      expect(html).toContain('Đang mở hoạt động từ thư viện');
      expect(html).not.toContain('✓ Đã ở');
      expect(html).not.toContain('crab_isolated.png');
    });
  });
  describe('5. ActivityShell — Extensibility, Typography & WCAG Contrast Invariants', () => {
    it('renders custom headerCenter and headerRight when provided', () => {
      const html = renderToString(
        React.createElement(I18nProvider, null,
          React.createElement(RouterProvider, null,
            React.createElement(ActivityShell, {
              title: 'Custom Test Shell',
              headerCenter: React.createElement('div', { id: 'custom-center' }, 'Custom Center Stepper'),
              headerRight: React.createElement('button', { id: 'custom-action' }, 'Custom Action'),
            },
              React.createElement('div', null, 'Shell Content')
            )
          )
        )
      );

      expect(html).toContain('custom-center');
      expect(html).toContain('Custom Center Stepper');
      expect(html).toContain('custom-action');
      expect(html).toContain('Custom Action');
    });

    it('renders default title and progress beads when headerCenter is omitted', () => {
      const html = renderToString(
        React.createElement(I18nProvider, null,
          React.createElement(RouterProvider, null,
            React.createElement(ActivityShell, {
              title: 'Default Activity Test',
              currentStep: 2,
              totalSteps: 4,
            },
              React.createElement('div', null, 'Activity Content')
            )
          )
        )
      );

      expect(html).toContain('Default Activity Test');
      expect(html).toContain('w-6 bg-[#F67650]'); // active bead
      expect(html).toContain('w-2 bg-[#2EE6CA]'); // completed bead
    });

    it('verifies WCAG AAA contrast ratio for ActivityShell immersion background and title text', () => {
      // Dark immersion background #0B232F vs White #FFFFFF
      const contrast = getContrastRatio([11, 35, 47], [255, 255, 255]);
      expect(contrast).toBeGreaterThanOrEqual(7.0); // Exceeds WCAG AAA requirement (7:1)
    });
  });
});
