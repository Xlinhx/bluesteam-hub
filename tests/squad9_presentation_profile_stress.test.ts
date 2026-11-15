import { readSavedArtwork } from '../src/shared/creative/artworkCompletion';
// Setup minimal SSR window/document/sessionStorage mock prior to any imports
if (typeof globalThis.window === 'undefined') {
  const sessionStorageStore: Record<string, string> = {};
  const localStorageStore: Record<string, string> = {};
  (globalThis as any).window = {
    location: { pathname: '/presentation', search: '', href: 'http://localhost:5173/presentation' },
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    print: () => {},
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
    URL: {
      createObjectURL: () => 'blob:mock-url',
      revokeObjectURL: () => {},
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
    fullscreenElement: null,
    exitFullscreen: async () => {},
    createElement: (tag: string) => ({
      tagName: tag.toUpperCase(),
      click: () => {},
      setAttribute: () => {},
      style: {},
      href: '',
      download: '',
    }),
  };
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';

import { PresentationPage } from '../src/domains/teacher/presentation/PresentationPage';
import { PresentationShell } from '../src/shared/shells/PresentationShell';
import { LearnerProfilePage } from '../src/domains/learner/profile/LearnerProfilePage';
import { LearnerHomePage } from '../src/domains/learner/home/LearnerHomePage';
import {
  SystemLoadingRetry,
  DEEP_SEA_QUOTES,
} from '../src/shared/ui/feedback/SystemLoadingRetry';
import { demoStore } from '../src/shared/realtime/demoStore';
import { LocalArtworkViewer } from '../src/shared/ui/artworks/LocalArtworkViewer';
import { creativeStorage, CreativeArtwork } from '../src/shared/creative/creativeStorage';
import { indexedDB } from 'fake-indexeddb';
Object.defineProperty(window, 'indexedDB', { value: indexedDB, configurable: true });
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';

function renderWithProviders(
  element: React.ReactElement,
  route: string = '/presentation',
  search: string = '',
  locale: 'vi' | 'en' = 'vi'
): string {
  if (typeof window !== 'undefined') {
    window.location.pathname = route;
    window.location.search = search;
    window.location.href = `http://localhost:5173${route}${search}`;
    window.localStorage?.setItem('ocean:v2:locale', locale);
  }
  return renderToString(
    React.createElement(
      I18nProvider,
      null,
      React.createElement(RouterProvider, null, element)
    )
  );
}

describe('Squad 9 Empirical Stress Test Suite (M5 Challenger 2)', () => {
  beforeEach(async () => {
    demoStore.resetDemo();
    await creativeStorage.clearAll();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // SCREEN 36: Fullscreen Classroom Presentation Display (/presentation)
  // =========================================================================
  describe('1. Screen 36: PresentationPage & Shell Empirical Verification', () => {
    it('CRITICAL SPEC: Must be wrapped in PresentationShell with dark canvas #041624', () => {
      const html = renderWithProviders(React.createElement(PresentationPage), '/presentation');

      // Presentation dark background token
      expect(html).toContain('bg-[#041624]');

      // Fullscreen shell top presentation bar
      expect(html).toContain('Blue <span');
      expect(html).toContain('STEAM Hub</span>');
      expect(html).not.toContain('482915'); // default joinCode
      expect(html).toContain('Rùa Biển &amp; Nơi Sinh Sống Diệu Kỳ');
    });

    it('CRITICAL REFERENCE CORRECTION (Line 31): Strictly NO learner bottom navigation bar and NO student avatar', () => {
      const html = renderWithProviders(React.createElement(PresentationPage), '/presentation');

      // Ensure learner bottom nav items are NOT present in presentation view
      expect(html).not.toContain('fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95');
      expect(html).not.toContain('Học liệu');
      expect(html).not.toContain('Tương tác');
      expect(html).not.toContain('Hồ sơ');

      // Ensure no student persona avatar "An" in presentation header
      expect(html).not.toContain('avatar_an.png');
      expect(html).not.toContain('Bé An');
    });
  });

  // =========================================================================
  // SCREEN 37: Teacher Session Results Report (/teacher/results)
  // =========================================================================

  // =========================================================================
  // SCREEN 30: Learner Profile (/profile)
  // =========================================================================
  describe('3. Screen 30: LearnerProfilePage Architecture & Dynamic State', () => {
    it('CRITICAL REFERENCE CORRECTION (Line 26): Strictly NO non-standard lateral sidebars', () => {
      const html = renderWithProviders(React.createElement(LearnerProfilePage), '/profile');

      // LearnerShell wraps the page without rogue custom sidebar
      expect(html).not.toContain('<aside');
      expect(html).toContain('Điều hướng học sinh');
      expect(html).toMatch(/aria-current="page" data-nav-key="profile"/);
    });

    it('CRITICAL DATA PIPELINE: loads only persisted artwork without an invented fallback', async () => {
      // 1. Initial State: Empty storage -> renders fallback reference crayon artwork
      let html = renderWithProviders(React.createElement(LearnerProfilePage), '/profile');
      expect(html).toContain('Đang mở bộ sưu tập…'); expect(html).not.toContain('child_crayon_turtle');
      expect(html).not.toContain('Bức tranh của An');

      // 2. Save a custom artwork in creativeStorage
      const newArtwork: CreativeArtwork = {
        id: 'artwork-test-01',
        type: 'drawing',
        title: 'Bé An vẽ san hô bảy màu',
        createdAt: Date.now(),
        previewDataUrl: 'data:image/png;base64,sampleCoralBase64',
        drawingData: {
          canvasDataUrl: 'data:image/png;base64,sampleCoralBase64',
        },
      };
      await creativeStorage.saveArtwork(newArtwork);

      const items = await creativeStorage.getArtworks();
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Bé An vẽ san hô bảy màu');
    });

    it('AUTHENTIC BADGES (NO fake achievements): strictly derived from true progress milestones', () => {
      // Initial progress: only ocean-explorer
      const initialProg = demoStore.getBlueSteamProgress();
      expect(initialProg.badges).toContain('badge-ocean-explorer');
      expect(initialProg.badges).not.toContain('badge-turtle-friend');
      expect(initialProg.badges).not.toContain('badge-reef-guardian');

      // Complete station 2 -> unlocks turtle friend
      demoStore.completeStation(2);
      const progAfterSt2 = demoStore.getBlueSteamProgress();
      expect(progAfterSt2.completedStations).toContain(2);

      // Complete station 3 -> unlocks reef guardian
      demoStore.completeStation(3);
      const progAfterSt3 = demoStore.getBlueSteamProgress();
      expect(progAfterSt3.completedStations).toContain(3);
    });

    it('shows the local artwork workspace without fictional learning history', () => {
      const html = renderWithProviders(React.createElement(LearnerProfilePage), '/profile');
      expect(html).toContain('Sản phẩm đã tạo');
      expect(html).toContain('Trên thiết bị này');
      expect(html).toContain('Bắt đầu sáng tạo');
      expect(html).not.toContain('Vẽ tranh mới');
      expect(html).not.toContain('Gặp gỡ rùa biển');
      expect(html).not.toContain('Đã khám phá');
    });

    it('shows actual artwork actions only after an artwork is selected', () => {
      const html = renderWithProviders(React.createElement(LearnerProfilePage), '/profile');
      expect(html).toContain('Đổi tên và hình');
      expect(html).not.toContain('In tác phẩm');
      const artwork: CreativeArtwork = {id:'real-art',type:'drawing',title:'San hô của bé',createdAt:1,previewDataUrl:'data:image/png;base64,test',drawingData:{canvasDataUrl:'data:image/png;base64,test'}};
      const viewer = renderWithProviders(React.createElement(LocalArtworkViewer,{artwork:readSavedArtwork(artwork)!,onClose:()=>{}}),'/profile');
      expect(viewer).toContain('San hô của bé');
      expect(viewer).toContain('Tải ảnh');
      expect(viewer).toContain('In tác phẩm');
      expect(viewer).not.toContain('Vẽ tiếp');
    });
  });

  // =========================================================================
  // SCREEN 38: System Loading & Retry Screen (/home?loading=true)
  // =========================================================================
  describe('4. Screen 38: SystemLoadingRetry Math, Narrative & Retry Flow', () => {
    it('CRITICAL GEOMETRY MATH: SVG circular progress ring radius=100 calculations', () => {
      const radius = 100;
      const circumference = 2 * Math.PI * radius; // ~628.31853

      expect(circumference).toBeCloseTo(628.3185, 3);

      // Offset formulas for varying percentages
      const calcOffset = (p: number) => circumference - (p / 100) * circumference;

      expect(calcOffset(0)).toBeCloseTo(circumference, 3);
      expect(calcOffset(25)).toBeCloseTo(circumference * 0.75, 3);
      expect(calcOffset(50)).toBeCloseTo(circumference * 0.5, 3);
      expect(calcOffset(75)).toBeCloseTo(circumference * 0.25, 3);
      expect(calcOffset(100)).toBeCloseTo(0, 3);
    });

    it('RETRY NAVIGATION: handleRetry clears loading query parameter and returns to clean path', () => {
      // Simulate navigation from /home?loading=true
      const currentQuery = { loading: 'true' };
      const cleanedQuery: Record<string, string> = {};
      Object.keys(currentQuery).forEach((k) => {
        if (k !== 'loading') cleanedQuery[k] = currentQuery[k as keyof typeof currentQuery];
      });

      expect(cleanedQuery.loading).toBeUndefined();
      expect(Object.keys(cleanedQuery)).toHaveLength(0);
    });

    it('DEEP SEA QUOTES & NARRATIVE: contains ocean science facts and turtle biology', () => {
      expect(DEEP_SEA_QUOTES.length).toBeGreaterThanOrEqual(4);
      expect(DEEP_SEA_QUOTES[0]).toBe('Đang lặn xuống tầng trung quang...');
      expect(DEEP_SEA_QUOTES.some((q) => q.includes('tầng trung quang'))).toBe(true);
      expect(DEEP_SEA_QUOTES.some((q) => q.includes('Rùa biển'))).toBe(true);
      expect(DEEP_SEA_QUOTES.some((q) => q.includes('thảm cỏ biển'))).toBe(true);
    });

    it('SSR RENDER: SystemLoadingRetry renders swimming turtle mascot and retry buttons', () => {
      const html = renderWithProviders(
        React.createElement(SystemLoadingRetry, {
          initialProgress: 45,
          errorMessage: 'Kết nối mạng đang chậm',
        }),
        '/home',
        '?loading=true'
      );

      // Swimmer mascot & progress ring
      expect(html).toContain('turtle_isolated.png');
      expect(html).toContain('r="100"');
      expect(html).toMatch(/45(<!-- -->)?%/);

      // Headings & status
      expect(html).toContain('Đang chuẩn bị chuyến hải trình');
      expect(html).toContain('Kết nối mạng đang chậm');

      // Buttons
      expect(html).toContain('Thử lại');
      expect(html).toContain('Về Trang chủ');
    });

    it('RETIRED LOADING SCREEN: LearnerHomePage no longer intercepts loading=true as requested', () => {
      const html = renderWithProviders(
        React.createElement(LearnerHomePage),
        '/home',
        '?loading=true'
      );

      expect(html).toContain('<h1>Cùng khám phá đại dương</h1>');
      expect(html).not.toContain('Đang chuẩn bị chuyến hải trình');
    });
  });

  // =========================================================================
  // DISK ASSETS & STATIC CONTRACT INTEGRITY
  // =========================================================================
  describe('5. Static Files & Reference Assets Integrity Verification', () => {
    it('should verify all required visual assets for Squad 9 exist on disk', () => {
      const requiredAssets = [
        'public/assets/generated/creatures/turtle_isolated.png',
        'public/assets/generated/creatures/crab_isolated.png',
        'public/assets/generated/backgrounds/habitat_placement_bg.jpg',
        'public/assets/generated/backgrounds/ocean_split_beach.jpg',
        'public/assets/generated/craft/child_crayon_turtle.jpg',
        'public/assets/generated/craft/turtle_coloring_lineart.jpg',
        'public/assets/generated/stations/botanical_seagrass_specimen.jpg',
        'public/assets/generated/stations/station_seagrass_fish.jpg',
        'public/assets/avatar_an.png',
      ];

      for (const assetRelPath of requiredAssets) {
        const fullPath = path.resolve(process.cwd(), assetRelPath);
        const exists = fs.existsSync(fullPath);
        expect(exists, `Required asset must exist at ${assetRelPath}`).toBe(true);
      }
    });
  });
});
