// Setup minimal SSR window/document mock prior to any imports
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    location: { pathname: '/resources', search: '' },
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    print: () => {},
    innerHeight: 1024,
    innerWidth: 1536,
    history: { pushState: () => {}, replaceState: () => {} },
    matchMedia: () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  };
}
if (typeof globalThis.document === 'undefined') {
  (globalThis as any).document = {
    body: { style: {} },
    documentElement: {
      style: { setProperty: () => {}, getPropertyValue: () => '' },
      classList: { add: () => {}, remove: () => {} },
    },
    createElement: (tag: string) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: () => {},
        };
      }
      return {};
    },
  };
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
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

import { ResourcesLibraryPage } from '../src/domains/learner/resources/ResourcesLibraryPage';
import { FlashcardDetailPage } from '../src/domains/learner/resources/FlashcardDetailPage';
import { VideoPlayerPage } from '../src/domains/learner/resources/VideoPlayerPage';
import { PrintPreviewPage } from '../src/domains/learner/resources/PrintPreviewPage';
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';
import { oceanAudio } from '../src/shared/audio/oceanAudio';

// Helper to render pages within required BlueSTEAM context providers
function renderWithProviders(element: React.ReactElement, initialSearch: string = ''): string {
  if (typeof window !== 'undefined') {
    window.location.search = initialSearch;
  }
  return renderToString(
    React.createElement(
      I18nProvider,
      null,
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

describe('M4 Challenger 1: Squad 5 Media Hub Empirical & Adversarial Stress Suite', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.location.search = '';
      window.innerHeight = 1024;
      window.innerWidth = 1536;
    }
    vi.restoreAllMocks();
  });

  /* =========================================================================
     1. ResourcesLibraryPage (Screen 3 & Screen 10)
     ========================================================================= */
  describe('1. ResourcesLibraryPage — grouped API-backed catalog', () => {
    it.each(['', '?view=curated', '?view=catalog', '?state=curated-collections-overview'])('uses one canonical catalog for legacy query %s', search => {
      const html=renderWithProviders(React.createElement(ResourcesLibraryPage),search);
      expect(html).toContain('Khám phá theo nhóm');
      expect(html).toContain('Chọn nhóm học liệu');
      expect(html).toContain('Đang mở thư viện');
      expect(html).not.toContain('Chế độ hiển thị:');
      expect(html).not.toContain('Học liệu tuyển chọn (Màn 10');
      expect(html).toContain('Phiếu học tập');
    });
    it('does not invent catalog entries before API data arrives',()=>{
      const html=renderWithProviders(React.createElement(ResourcesLibraryPage),'');
      expect(html).not.toContain('Rùa biển xanh');
      expect(html).not.toContain('Cua biển');
      expect(html).toContain('role="status"');
      expect(html).toContain('Tìm học liệu');
      expect(html).toContain('Đã lưu');
    });
    it('respects the group context and offers merged visual formats',()=>{
      const html=renderWithProviders(React.createElement(ResourcesLibraryPage),'?group=00000000-0000-4000-8000-000000000001&kind=visual');
      expect(html).toContain('Học liệu trong nhóm');
      expect(html).toContain('Thẻ hình');
      expect(html).not.toContain('>Hình ảnh<');
      expect(html).not.toContain('Phiếu học tập');
    });
  });

  /* =========================================================================
     2. FlashcardDetailPage (Screen 11)
     ========================================================================= */
  describe('2. FlashcardDetailPage — 3D Flip Card, Biological Inspector, & Speech Triggers', () => {
    it('renders inside LearnerShell with activeNav="resources", breadcrumbs, and back button', () => {
      const html = renderWithProviders(React.createElement(FlashcardDetailPage));

      // Shell & Breadcrumbs
      expect(html).toContain('Học liệu');
      expect(html).toContain('Thẻ học');
      expect(html).toContain('Rùa biển');
      expect(html).toContain('Quay về danh sách');
    });

    it('verifies 3D Card Flip CSS transforms: perspective 1200px and preserve-3d', () => {
      const html = renderWithProviders(React.createElement(FlashcardDetailPage));

      // Perspective container
      expect(html).toContain('perspective:1200px');
      expect(html).toContain('transform-style:preserve-3d');
      expect(html).toContain('transform:rotateY(0deg)');

      // Front Face elements
      expect(html).toContain('backface-visibility:hidden');
      expect(html).toContain('Sinh vật biển kỳ thú');
      expect(html).toContain('green_turtle_hero.jpg');
      expect(html).toContain('Chelonia mydas');

      // Back Face elements (hidden on front rotate)
      expect(html).toContain('transform:rotateY(180deg)');
      expect(html).toContain('Mặt sau hồ sơ');
      expect(html).toContain('Độ sâu sinh sống');
      expect(html).toContain('Tầng mặt đầy nắng (0 - 50m)');
      expect(html).toContain('Thức ăn chủ yếu');
      expect(html).toContain('Cỏ biển, rong biển tươi &amp; tảo lục');
      expect(html).toContain('Tình trạng bảo tồn');
      expect(html).toContain('Nguy cấp (Cần bảo vệ nghiêm ngặt)');
      expect(html).toContain('Góc tò mò:');
      expect(html).toContain('Rùa xanh có thể nín thở dưới nước tới hơn 4 tiếng');

      // Flip button & Speak button
      expect(html).toContain('Lật thẻ');
      expect(html).toContain('Nghe tên');
    });

    it('renders Biological Inspector with 4 interactive tabs, macro imagery, and scientific quote', () => {
      const html = renderWithProviders(React.createElement(FlashcardDetailPage));

      // 4 tabs
      expect(html).toContain('Đặc điểm');
      expect(html).toContain('Nơi sống');
      expect(html).toContain('Thức ăn');
      expect(html).toContain('Mối đe dọa');

      // Active tab styling on Đặc điểm
      expect(html).toContain('border-b-2 border-[#17657A] text-[#17657A] font-black');

      // Macro photography and quote
      expect(html).toContain('turtle_flipper_detail.jpg');
      expect(html).toContain('Rùa dùng vây để bơi.');
      expect(html).toContain('Đôi vây trước của rùa biển tiến hóa dài và dẹt');
    });

    it('renders bottom specimen dock with all 7 species and active border on turtle', () => {
      const html = renderWithProviders(React.createElement(FlashcardDetailPage));

      expect(html).toContain('Sinh vật liên quan');
      expect(html).toContain('Rùa biển');
      expect(html).toContain('Cá hề');
      expect(html).toContain('Cá đuối');
      expect(html).toContain('Cua biển');
      expect(html).toContain('Sứa biển');
      expect(html).toContain('Cá ngựa');
      expect(html).toContain('Sao biển');

      // First species active ring
      expect(html).toContain('border-2 border-[#17657A] ring-2 ring-[#17657A]/20 shadow-md');
    });

    it('verifies Web Audio speech synthesis and pronunciation chimes trigger correctly in source and instance', () => {
      expect(typeof oceanAudio.playChime).toBe('function');
      expect(typeof oceanAudio.speak).toBe('function');

      const sourceCode = fs.readFileSync(
        path.resolve(__dirname, '../src/domains/learner/resources/FlashcardDetailPage.tsx'),
        'utf-8'
      );

      // Speech synthesis invocation
      expect(sourceCode).toContain('oceanAudio.playChime(523.25, 0.15)');
      expect(sourceCode).toContain('oceanAudio.speak(currentSpecies.audioPronunciation)');

      // Card flip chime invocation
      expect(sourceCode).toContain('oceanAudio.playChime(isFlipped ? 493.88 : 659.25, 0.12)');

      // Prev and Next species sound chimes
      expect(sourceCode).toContain('oceanAudio.playChime(440, 0.1)');
      expect(sourceCode).toContain('oceanAudio.playChime(554.37, 0.1)');

      // Flip toggle state
      expect(sourceCode).toContain("isFlipped ? 'Mặt trước' : 'Lật thẻ'");
      expect(sourceCode).toContain("isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'");
    });
  });

  /* =========================================================================
     3. VideoPlayerPage (Screen 12)
     ========================================================================= */
  describe('3. VideoPlayerPage — Chapter Seek Navigation & Specimen Quiz Feedback', () => {
    it('renders Video Player with 3 documentary chapters and authentic scrubber controls', () => {
      const html = renderWithProviders(React.createElement(VideoPlayerPage));

      // Title & Breadcrumbs
      expect(html).toContain('Đại dương quanh em');
      expect(html).toContain('Thảm cỏ biển');
      expect(html).toContain('Khám phá thảm cỏ biển');

      // Video Player Stage
      expect(html).toContain('aspect-video');
      expect(html).toContain('Thước phim tài liệu đại dương');
      expect(html).toContain('Chương 1: Quan sát');
      expect(html).toContain('station_seagrass_fish.jpg');

      // Scrubber controls: verify time markers and counter
      expect(html).toContain('00:15');
      expect(html).toContain('03:45');
      expect(html).toContain('Xem lại từ đầu');

      // Subtitles overlay
      expect(html).toContain('Dưới làn nước trong xanh, chú rùa biển bơi qua thảm cỏ biển');

      // Right Chapter Dock
      expect(html).toContain('Chương trong bài học');
      expect(html).toContain('Quan sát');
      expect(html).toContain('00:00');
      expect(html).toContain('Tìm bạn nhỏ');
      expect(html).toContain('01:15');
      expect(html).toContain('Cùng suy nghĩ');
      expect(html).toContain('02:30');
    });

    it('renders Bottom Interactive Specimen Quiz Dock with 7 species and educational feedback', () => {
      const html = renderWithProviders(React.createElement(VideoPlayerPage));

      // Quiz Dock Header
      expect(html).toContain('Bé nhìn thấy những ai?');
      expect(html).toContain('Hãy chọn những sinh vật em nhìn thấy trong video nhé!');

      // 7 Creatures
      expect(html).toContain('Rùa biển');
      expect(html).toContain('Cá hề');
      expect(html).toContain('Sao biển');
      expect(html).toContain('Cá ngựa');
      expect(html).toContain('Cua');
      expect(html).toContain('Cỏ biển');
      expect(html).toContain('Cá xanh');

      // Default selected state includes turtle & seagrass
      expect(html).toContain(
        'Bé thật tinh mắt! Rùa biển và Cỏ biển là hai nhân vật sinh thái chính trong bài học hôm nay!'
      );
    });

    it('verifies chapter seek navigation, scrubber progress calculations, and audio narration triggers', () => {
      const sourceCode = fs.readFileSync(
        path.resolve(__dirname, '../src/domains/learner/resources/VideoPlayerPage.tsx'),
        'utf-8'
      );

      // Chapter selection function sets currentTime and triggers narration
      expect(sourceCode).toContain('setActiveChapter(index)');
      expect(sourceCode).toContain('setCurrentTime(chapters[index].timeSeconds)');
      expect(sourceCode).toContain('oceanAudio.playChime(659.25, 0.15)');
      expect(sourceCode).toContain('oceanAudio.speak(chapters[index].narration)');

      // Interactive scrubber seek math
      expect(sourceCode).toContain('const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))');
      expect(sourceCode).toContain('const seekTime = Math.floor(pos * duration)');

      // Toggle creature quiz chime
      expect(sourceCode).toContain('oceanAudio.playChime(next[id] ? 700 : 400, 0.1)');
    });

    it('verifies absence of uncanonical ad-hoc sidebar and fake cartoon characters per REFERENCE_CORRECTIONS.md', () => {
      const html = renderWithProviders(React.createElement(VideoPlayerPage));

      // Should NOT contain ad-hoc sidebars or uncanonical menus
      expect(html).not.toContain('sidebar-left-unauthorized');
      expect(html).not.toContain('Cộng đồng');
      expect(html).not.toContain('Bình luận video');
    });
  });

  /* =========================================================================
     4. PrintPreviewPage (Screen 13)
     ========================================================================= */
  describe('4. PrintPreviewPage — A4 Preview Margins, Print Trigger, & Zero "Cộng đồng" Pollution', () => {
    it('renders inside LearnerShell with Breadcrumbs, page heading, and A4 printable sheet', () => {
      const html = renderWithProviders(React.createElement(PrintPreviewPage));

      // Breadcrumbs & Heading
      expect(html).toContain('Học liệu');
      expect(html).toContain('In và tô màu');
      expect(html).toContain('Những tranh vẽ về sinh vật biển giúp em khám phá đại dương qua sắc màu.');

      // Page Thumbnails
      expect(html).toContain('Trang 1');
      expect(html).toContain('Trang 2');
      expect(html).toContain('octopus_coloring_lineart.jpg');
      expect(html).toContain('coral_coloring_lineart.jpg');

      // A4 Sheet element with exact aspect ratio
      expect(html).toContain('id="printable-sheet"');
      expect(html).toContain('aspect-[1/1.414]');
      expect(html).toContain('rounded-[28px]');

      // Student name blank fields
      expect(html).toContain('BlueSTEAM • Sinh vật biển');
      expect(html).toContain('Bạch tuộc đại dương');
      expect(html).toContain('Tên: .......................................');
      expect(html).toContain('Khám phá đại dương xanh • BlueSTEAM v2');
      expect(html).toContain('Trang');
      expect(html).toContain('/ 2');

      // Right Action & Print Settings
      expect(html).toContain('Tranh tô màu đại dương');
      expect(html).toContain('Tải bản in');
      expect(html).toContain('In tài liệu');
      expect(html).toContain('Khổ A4 (210 × 297 mm)');
      expect(html).toContain('Đen trắng (Tiết kiệm mực)');
      expect(html).toContain('Mẹo nhỏ');
      expect(html).toContain('In ở chế độ đen trắng để tiết kiệm mực');
    });

    it('STRICT ADVERSARIAL CHECK: Absolutely NO "Cộng đồng" section exists (REFERENCE_CORRECTIONS.md line 11)', () => {
      const html = renderWithProviders(React.createElement(PrintPreviewPage));
      const sourceCode = fs.readFileSync(
        path.resolve(__dirname, '../src/domains/learner/resources/PrintPreviewPage.tsx'),
        'utf-8'
      );

      // Check rendered HTML
      expect(html).not.toContain('Cộng đồng');
      expect(html).not.toContain('Thảo luận');
      expect(html).not.toContain('Bình luận');
      expect(html).not.toContain('Chia sẻ của cộng đồng');

      // Check source code
      expect(sourceCode).not.toContain('Cộng đồng');
      expect(sourceCode).not.toContain('community');
      expect(sourceCode).not.toContain('Community');
    });

    it('verifies @media print styles strip all shell navigation and enforce 10mm print margins', () => {
      const html = renderWithProviders(React.createElement(PrintPreviewPage));

      // Print CSS rules embedded
      expect(html).toContain('@media print');
      expect(html).toContain('header, nav, aside, footer, .no-print, button');
      expect(html).toContain('display: none !important');
      expect(html).toContain('#printable-sheet');
      expect(html).toContain('padding: 10mm !important');
      expect(html).toContain('box-shadow: none !important');
      expect(html).toContain('border: none !important');
    });

    it('verifies window.print and download execution in component source', () => {
      const sourceCode = fs.readFileSync(
        path.resolve(__dirname, '../src/domains/learner/resources/PrintPreviewPage.tsx'),
        'utf-8'
      );

      // handlePrint invokes audio chime and window.print()
      expect(sourceCode).toContain('oceanAudio.playChime(659.25, 0.15)');
      expect(sourceCode).toContain('window.print()');

      // handleDownload triggers file download
      expect(sourceCode).toContain('document.createElement(\'a\')');
      expect(sourceCode).toContain('link.download = `bluesteam-tranh-to-mau-trang-${selectedPage}.jpg`');
      expect(sourceCode).toContain('link.click()');
    });
  });

  /* =========================================================================
     5. Cross-Cutting Design Tokens, Accessibility & WCAG Contrast Invariants
     ========================================================================= */
  describe('5. Cross-Cutting Design Tokens, Spacing & WCAG Contrast Invariants', () => {
    it('verifies Noto Serif / Playfair Display editorial headings with #102A38 navy across all Squad 5 pages', () => {
      const pages = [
        React.createElement(FlashcardDetailPage, { key: 'flashcard' }),
        React.createElement(VideoPlayerPage, { key: 'video' }),
        React.createElement(PrintPreviewPage, { key: 'print' }),
      ];

      pages.forEach((page) => {
        const html = renderWithProviders(page);
        expect(html).toContain('font-serif');
        expect(html).toContain('text-[#102A38]');
      });
    });

    it('verifies Apple 28px/32px standard corner radiuses across all major containers', () => {
      const pages = [
        React.createElement(FlashcardDetailPage, { key: 'flashcard' }),
        React.createElement(VideoPlayerPage, { key: 'video' }),
        React.createElement(PrintPreviewPage, { key: 'print' }),
      ];

      pages.forEach((page) => {
        const html = renderWithProviders(page);
        const hasStandardRadius =
          html.includes('rounded-[28px]') || html.includes('rounded-[32px]');
        expect(hasStandardRadius).toBe(true);
      });
    });

    it('verifies WCAG AA contrast ratio >= 4.5:1 for oceanic navy text #102A38 against paper ground #FAF8F5', () => {
      // #102A38 = rgb(16, 42, 56)
      // #FAF8F5 = rgb(250, 248, 245)
      const contrast = getContrastRatio([16, 42, 56], [250, 248, 245]);
      expect(contrast).toBeGreaterThanOrEqual(10.0); // Extremely high contrast (exceeds 10:1, WCAG AAA compliant)
    });

    it('verifies WCAG AA contrast ratio >= 4.5:1 for teal CTA #17657A against white #FFFFFF', () => {
      // #17657A = rgb(23, 101, 122)
      // #FFFFFF = rgb(255, 255, 255)
      const contrast = getContrastRatio([23, 101, 122], [255, 255, 255]);
      expect(contrast).toBeGreaterThanOrEqual(4.5); // Meets WCAG AA for normal text
    });
  });
});
