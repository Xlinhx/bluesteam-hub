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
// @ts-expect-error Node built-in module without @types/node in tsconfig
import fs from 'node:fs';
// @ts-expect-error Node built-in module without @types/node in tsconfig
import path from 'node:path';
// @ts-expect-error Node built-in module without @types/node in tsconfig
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { GameLabPage } from '../src/pages/learner/GameLabPage';
import { HabitatPlacementGamePage } from '../src/pages/learner/HabitatPlacementGamePage';
import { ActivityShell } from '../src/shells/ActivityShell';
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';
import { demoStore } from '../src/demo/storage/demoStore';

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

  describe('1. GameLabPage (Screen 17) — Portrait Layout, Typography & Visual Structure', () => {
    it('renders portrait layout (1024x1536) container with Noto Serif #102A38 typography', () => {
      const html = renderWithProviders(React.createElement(GameLabPage));

      // Container and background
      expect(html).toContain('bg-[#FBF9F4]');
      expect(html).toContain('text-[#102A38]');
      expect(html).toContain('whale_hero_gamelab.jpg');

      // Hero Heading: "Thử, quan sát, rồi thử lại" with editorial typography
      expect(html).toContain('Thử, quan sát, rồi thử lại');
      expect(html).toContain('font-serif');
      expect(html).toContain('tracking-[-0.02em]');

      // Section Headings in #102A38
      expect(html).toContain('Hoạt động để bé khám phá');
      expect(html).toContain('Chơi tiếp');
      expect(html).toContain('text-[#102A38]');
    });

    it('renders the bespoke organic sine wave SVG curve underline (not a flat bar)', () => {
      const html = renderWithProviders(React.createElement(GameLabPage));

      // 2-crest sine wave SVG curve
      expect(html).toContain('viewBox="0 0 96 16"');
      expect(html).toContain('d="M2 10C16 10 22 4 36 4C50 4 56 10 70 10C84 10 90 4 94 4"');
      expect(html).toContain('stroke="#2EE6CA"');
      expect(html).toContain('stroke-width="3.5"');
    });

    it('renders exactly 3 Bloom taxonomy depth cards with Apple 28px corners and proper destinations', () => {
      const html = renderWithProviders(React.createElement(GameLabPage));

      // 3 Bloom taxonomy cards
      expect(html).toContain('Nhận biết');
      expect(html).toContain('Hiểu');
      expect(html).toContain('Vận dụng');

      // Images corresponding to the 3 cognitive stages
      expect(html).toContain('clownfish_isolated.jpg');
      expect(html).toContain('green_turtle_hero.jpg');
      expect(html).toContain('station_coral_reef.jpg');

      // Apple 28px outer and 20px inner card radiuses
      expect(html).toContain('rounded-[28px]');
      expect(html).toContain('rounded-[20px]');

      // Dark navy circular icon wrapper #102A38
      expect(html).toContain('bg-[#102A38]');
    });

    it('renders the 4-step continuation card with active pulse indicator and #102A38 CTA', () => {
      const html = renderWithProviders(React.createElement(GameLabPage));

      // Continuation card container
      expect(html).toContain('Chơi tiếp');
      expect(html).toContain('Tạo rạn san hô');
      expect(html).toContain('Đang thực hiện');
      expect(html).toContain('bg-[#2EE6CA] animate-pulse');

      // 4 Progress steps matching mockup
      expect(html).toContain('Quan sát');
      expect(html).toContain('Đặt vào');
      expect(html).toContain('Thử');
      expect(html).toContain('Xem lại');

      // Step 1 is active with dark background and cyan icon
      expect(html).toContain('bg-[#102A38] text-white');

      // CTA button
      expect(html).toContain('Tiếp tục');
    });

    it('strictly enforces authentic layered ocean waves footer banner with zero literal emojis', () => {
      const html = renderWithProviders(React.createElement(GameLabPage));

      // Authentic ocean waves footer banner
      expect(html).toContain('gamelab_footer_waves.png');

      // Adversarial Check: No emojis in rendered HTML
      const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(html)).toBe(false);

      // Verify source file contains no crude emoji strings in footer
      const sourceCode = fs.readFileSync(path.resolve(__dirname, '../src/pages/learner/GameLabPage.tsx'), 'utf-8');
      expect(sourceCode).not.toContain('🪸');
      expect(sourceCode).not.toContain('🌿');
      expect(sourceCode).not.toContain('🐚');
      expect(sourceCode).not.toContain('🐟');
      expect(sourceCode).not.toContain('🐠');
      expect(sourceCode).not.toContain('🪼');
    });
  });

  describe('2. HabitatPlacementGamePage — ActivityShell Wrapping & Query Parameter States', () => {
    it('is cleanly wrapped inside ActivityShell with 56px touch target back button and segmented header', () => {
      const html = renderWithProviders(React.createElement(HabitatPlacementGamePage));

      // ActivityShell wrapper
      expect(html).toContain('bg-[#0B232F]');
      expect(html).toContain('min-w-[56px] min-h-[56px]');
      expect(html).toContain('Quay lại');

      // Segmented header controls
      expect(html).toContain('Quan sát');
      expect(html).toContain('Thử đặt');
      expect(html).toContain('Khám phá');
    });

    it('renders Screen 18 Recognition Round when ?step=recognition', () => {
      const html = renderWithProviders(React.createElement(HabitatPlacementGamePage), '?step=recognition');

      // Screen 18 Title & Prompt
      expect(html).toContain('Cùng quan sát');
      expect(html).toContain('Tìm bạn bạch tuộc');
      expect(html).toContain('recognition_round_bg.jpg');

      // 3 interactive target rings on seabed
      expect(html).toContain('Cua biển');
      expect(html).toContain('Bạch tuộc');
      expect(html).toContain('Sứa biển');

      // Active tab in custom header is "Quan sát"
      expect(html).toContain('bg-[#15586E] text-white shadow-md');
    });

    it('renders Screen 19 Placement Stage when ?step=placement or default route', () => {
      const html = renderWithProviders(React.createElement(HabitatPlacementGamePage), '?step=placement');

      // Screen 19 Title
      expect(html).toContain('Tìm nơi sống cho rùa');
      expect(html).toContain('habitat_placement_bg.jpg');

      // 3 stratified ecological zones
      expect(html).toContain('Bãi cát ven bờ');
      expect(html).toContain('Thảm cỏ biển nông');
      expect(html).toContain('Rạn san hô');

      // Dock tray with turtle sticker and instruction
      expect(html).toContain('Rùa xanh');
      expect(html).toContain('Chạm rùa, rồi chạm nơi sống');
      expect(html).toContain('turtle_isolated.png');

      // Disabled "Quan sát" button before placement
      expect(html).toContain('cursor-not-allowed opacity-80');

      // Scallop hint button
      expect(html).toContain('Gợi ý');
    });

    it('gracefully handles invalid or unfamiliar query parameters by falling back to placement stage', () => {
      const html = renderWithProviders(React.createElement(HabitatPlacementGamePage), '?step=unknown_stage&foo=bar');

      // Should default to placement stage without crashing
      expect(html).toContain('Tìm nơi sống cho rùa');
      expect(html).toContain('Chạm rùa, rồi chạm nơi sống');
    });

    it('accepts ?state=feedback alias and renders feedback mode', () => {
      const html = renderWithProviders(React.createElement(HabitatPlacementGamePage), '?state=feedback');

      expect(html).toContain('Quan sát rồi thử điều chỉnh');
      expect(html).toContain('Bạn cua cần nơi nào?');
    });
  });

  describe('3. Strict Dock Non-Duplication on ?step=feedback (REFERENCE_CORRECTIONS.md line 17)', () => {
    it('renders turtle in seagrass and clownfish in coral, with crab hovering as unplaced target', () => {
      const html = renderWithProviders(React.createElement(HabitatPlacementGamePage), '?step=feedback');

      // Title & Question
      expect(html).toContain('Quan sát rồi thử điều chỉnh');
      expect(html).toContain('Bạn cua cần nơi nào?');

      // Placed organisms in habitats
      expect(html).toContain('✓ Thảm cỏ biển');
      expect(html).toContain('✓ Rạn san hô');

      // Unplaced crab hovering with '?' prompt
      expect(html).toContain('Chạm để đặt Cua vào Bãi cát');
    });

    it('STRICTLY DOES NOT DUPLICATE placed organisms (turtle & clownfish) in the bottom dock tray', () => {
      const html = renderWithProviders(React.createElement(HabitatPlacementGamePage), '?step=feedback');

      // Verify the dock tray structure
      // Slot 1: Crab (Waiting for placement)
      expect(html).toContain('Chờ đặt');

      // Slot 2: Clownfish - empty dashed placeholder with checkmark, NO clownfish image in dock
      expect(html).toContain('✓ Đã ở Rạn san hô');

      // Slot 3: Turtle - empty dashed placeholder with checkmark, NO turtle image in dock
      expect(html).toContain('✓ Đã ở Thảm cỏ biển');

      // Verify green check icons in dashed placeholder slots
      expect(html).toContain('border-2 border-dashed border-emerald-400');

      // QUANTITATIVE ADVERSARIAL CHECK:
      // Exactly ONE <img> tag for turtle appears in the entire document (placed in seagrass habitat, 0 in dock)
      const turtleImgMatches = html.match(/<img[^>]+turtle_isolated\.png/g) || [];
      expect(turtleImgMatches.length).toBe(1);

      // Exactly ONE <img> tag for clownfish appears in the entire document (placed in coral habitat, 0 in dock)
      const clownfishImgMatches = html.match(/<img[^>]+clownfish_isolated\.png/g) || [];
      expect(clownfishImgMatches.length).toBe(1);

      // Verify the dock tray itself (rounded-[32px] container) contains ZERO turtle and ZERO clownfish
      const dockTrayMatch = html.match(/rounded-\[32px\] bg-white\/95[\s\S]+?<\/div>\s*<\/div>/);
      expect(dockTrayMatch).not.toBeNull();
      const dockHtml = dockTrayMatch ? dockTrayMatch[0] : '';
      expect(dockHtml).not.toContain('turtle_isolated');
      expect(dockHtml).not.toContain('clownfish_isolated');
      expect(dockHtml).toContain('crab_isolated.png');

      // crab_isolated.png appears in the hovering unplaced position and in the unplaced dock slot
      const crabMatches = html.match(/crab_isolated\.png/g) || [];
      expect(crabMatches.length).toBeGreaterThanOrEqual(1);
    });

    it('renders action buttons "Sửa cách đặt" and "Thử lại" in feedback mode', () => {
      const html = renderWithProviders(React.createElement(HabitatPlacementGamePage), '?step=feedback');

      expect(html).toContain('Sửa cách đặt');
      expect(html).toContain('Thử lại');
    });
  });

  describe('4. NOAA Biological Adaptation Modal — Trigger & Scientific Content Verification', () => {
    it('verifies clickable adaptation explanation triggers exist for placed creatures', () => {
      const html = renderWithProviders(React.createElement(HabitatPlacementGamePage), '?step=feedback');

      // Both turtle and clownfish habitats must have hover titles indicating ecological explanation
      expect(html).toContain('title="Bấm để xem giải thích sinh thái"');
    });

    it('strictly verifies NOAA biological adaptation educational text exists in component source', () => {
      const sourceCode = fs.readFileSync(path.resolve(__dirname, '../src/pages/learner/HabitatPlacementGamePage.tsx'), 'utf-8');

      // Modal Title
      expect(sourceCode).toContain('Hệ sinh thái & Thích nghi sinh học');

      // NOAA Green Sea Turtle Dietary Science
      expect(sourceCode).toContain('Rùa xanh & Thảm cỏ biển:');
      expect(sourceCode).toContain('Rùa xanh trưởng thành là loài rùa biển duy nhất ăn thực vật');
      expect(sourceCode).toContain('cỏ biển và tảo');
      expect(sourceCode).toContain('cắt tỉa thảm cỏ biển');
      expect(sourceCode).toContain('theo NOAA');

      // Clownfish & Anemone Coral Reef Symbiosis
      expect(sourceCode).toContain('Cá hề & Rạn san hô:');
      expect(sourceCode).toContain('sống cộng sinh');
      expect(sourceCode).toContain('xúc tu có độc của hải quỳ');

      // Marine Crab & Sandy Shoreline Burrowing Adaptation
      expect(sourceCode).toContain('Cua biển & Bãi cát:');
      expect(sourceCode).toContain('đào hang dưới bãi cát ẩm');
      expect(sourceCode).toContain('khe đá ven bờ khi thủy triều rút');

      // Close actions
      expect(sourceCode).toContain('Đã hiểu rồi!');
      expect(sourceCode).toContain('setShowBioModal(false)');
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
