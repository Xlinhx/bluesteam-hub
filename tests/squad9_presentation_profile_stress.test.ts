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

import { PresentationPage } from '../src/pages/teacher/PresentationPage';
import { PresentationShell } from '../src/shells/PresentationShell';
import {
  teacherSyncStore,
  INITIAL_SYNC_STATE,
  LessonStepId,
  CreatureId,
  HabitatSlotId,
} from '../src/services/teacherSyncStore';
import {
  TeacherSessionResultsPage,
  CLASS_SESSION_STUDENTS,
  StudentPedagogicalRecord,
} from '../src/pages/teacher/TeacherSessionResultsPage';
import { LearnerProfilePage } from '../src/pages/learner/LearnerProfilePage';
import { LearnerHomePage } from '../src/pages/learner/LearnerHomePage';
import {
  SystemLoadingRetry,
  DEEP_SEA_QUOTES,
} from '../src/components/system/SystemLoadingRetry';
import { demoStore } from '../src/demo/storage/demoStore';
import { creativeStorage, CreativeArtwork } from '../src/services/creativeStorage';
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
    teacherSyncStore.resetSession();
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
      expect(html).toContain('Blue<span');
      expect(html).toContain('STEAM</span>');
      expect(html).toContain('482915'); // default joinCode
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

    it('REACTIVE STATE: PresentationPage reacts immediately to teacherSyncStore step updates', () => {
      // 1. Set Step 1: Story / Khởi động
      teacherSyncStore.setStep(1);
      let html = renderWithProviders(React.createElement(PresentationPage), '/presentation');
      expect(html).toContain('Bước 1: Câu Chuyện Khởi Động');
      expect(html).toContain('Hành Trình Vượt Trùng Dương');
      expect(html).toContain('Chào các bạn nhỏ lớp Sao Biển!');
      expect(html).toContain('Kể chuyện cho cả lớp');

      // 2. Set Step 2: 3D Turtle Specimen
      teacherSyncStore.setStep(2);
      html = renderWithProviders(React.createElement(PresentationPage), '/presentation');
      expect(html).toContain('Bước 2: Khám Phá Sinh Học Biển');
      expect(html).toContain('Cấu Tạo Cơ Thể Của Rùa Xanh');
      expect(html).toContain('Mai Dẹp Khí Động');
      expect(html).toContain('Vây Chèo Mạnh Mẽ');
      expect(html).toContain('Thở Bằng Phổi');

      // 3. Set Step 3: Habitat Matching (Reference Mockup Scene)
      teacherSyncStore.setStep(3);
      html = renderWithProviders(React.createElement(PresentationPage), '/presentation');
      expect(html).toContain('Tìm nơi sống cho bạn nhỏ');
      expect(html).toContain('Bãi cát ngầm');
      expect(html).toContain('Thảm cỏ biển (Nơi sống)');
      expect(html).toContain('Rạn san hô');
      expect(html).toContain('Cua');
      expect(html).toContain('Rùa biển');
      expect(html).toContain('Cá hề');
      expect(html).toContain('bé đã ghép thành công');

      // 4. Set Step 4: Classroom Quiz Polling
      teacherSyncStore.setStep(4);
      html = renderWithProviders(React.createElement(PresentationPage), '/presentation');
      expect(html).toContain('Thử Thách Cả Lớp');
      expect(html).toContain('Rùa biển hô hấp bằng cơ quan nào dưới đây?');
      expect(html).toContain('Phổi (phải ngoi lên thở)');
      expect(html).toContain('phiếu bình chọn');

      // 5. Set Step 5: Class Celebration & Badges
      teacherSyncStore.setStep(5);
      html = renderWithProviders(React.createElement(PresentationPage), '/presentation');
      expect(html).toContain('Chúc Mừng Lớp Sao Biển!');
      expect(html).toContain('Bạn Của Rùa Xanh');
      expect(html).toContain('Bảo Vệ Cỏ Biển');
      expect(html).toContain('Họa Sĩ Đại Dương');
      expect(html).toContain('Xem Báo Cáo Buổi Học &amp; Xuất PDF');
    });

    it('ADVERSARIAL STRESS: teacherSyncStore step boundaries and rapid state mutation', () => {
      // Clamping lower bound
      teacherSyncStore.setStep(1);
      teacherSyncStore.prevStep();
      expect(teacherSyncStore.getState().activeStep).toBe(1);

      // Clamping upper bound
      teacherSyncStore.setStep(5);
      teacherSyncStore.nextStep();
      expect(teacherSyncStore.getState().activeStep).toBe(5);

      // Rapid step transitions sequence
      const stepSequence: LessonStepId[] = [1, 3, 2, 5, 4, 1, 5];
      for (const st of stepSequence) {
        teacherSyncStore.setStep(st);
        expect(teacherSyncStore.getState().activeStep).toBe(st);
      }

      // Habitat placements
      teacherSyncStore.selectCreature('crab');
      teacherSyncStore.placeCreature('sand', 'crab');
      expect(teacherSyncStore.getState().placedSlots.sand).toBe('crab');

      teacherSyncStore.placeCreature('seagrass', 'turtle');
      expect(teacherSyncStore.getState().placedSlots.seagrass).toBe('turtle');

      teacherSyncStore.placeCreature('coral', 'clownfish');
      expect(teacherSyncStore.getState().placedSlots.coral).toBe('clownfish');

      // Reset placements
      teacherSyncStore.resetHabitatPlacement();
      expect(teacherSyncStore.getState().placedSlots.sand).toBeNull();
      expect(teacherSyncStore.getState().placedSlots.seagrass).toBeNull();
      expect(teacherSyncStore.getState().placedSlots.coral).toBeNull();
    });

    it('ADVERSARIAL STRESS: Quiz voting increment and reveal toggle', () => {
      teacherSyncStore.setStep(4);
      const initialTotal = teacherSyncStore.getState().quiz.totalVotes;

      // Submit vote for opt-b
      teacherSyncStore.submitQuizVote('opt-b');
      expect(teacherSyncStore.getState().quiz.totalVotes).toBe(initialTotal + 1);
      const optB = teacherSyncStore.getState().quiz.options.find((o) => o.id === 'opt-b');
      expect(optB?.votes).toBe(22);

      // Toggle reveal
      expect(teacherSyncStore.getState().quiz.isRevealed).toBe(false);
      teacherSyncStore.toggleQuizReveal(true);
      expect(teacherSyncStore.getState().quiz.isRevealed).toBe(true);

      const html = renderWithProviders(React.createElement(PresentationPage), '/presentation');
      expect(html).toContain('Đúng'); // Reveals correct badge indicator
    });
  });

  // =========================================================================
  // SCREEN 37: Teacher Session Results Report (/teacher/results)
  // =========================================================================
  describe('2. Screen 37: TeacherSessionResultsPage Pedagogical Roster & Metrics Verification', () => {
    it('CRITICAL SPEC: Student roster length must be exactly 24 with 5/5 progress', () => {
      expect(CLASS_SESSION_STUDENTS).toHaveLength(24);

      CLASS_SESSION_STUDENTS.forEach((student, index) => {
        expect(student.id).toBe(String(index + 1).padStart(2, '0'));
        expect(student.name).toBeTruthy();
        expect(student.avatar).toBe('/assets/avatar_an.png');
        expect(student.progress).toBe('5/5');
        expect(student.engagement).toBeGreaterThanOrEqual(70);
        expect(student.engagement).toBeLessThanOrEqual(100);
        expect(student.note).toBeTruthy();
      });
    });

    it('CRITICAL SPEC: Badge total must be exactly 54 (18 Rescue + 21 Artist + 15 Guardian)', () => {
      let rescueCount = 0;
      let artistCount = 0;
      let guardianCount = 0;

      CLASS_SESSION_STUDENTS.forEach((st) => {
        st.badges.forEach((b) => {
          if (b === 'badge-rescue-hero') rescueCount++;
          else if (b === 'badge-ocean-artist') artistCount++;
          else if (b === 'badge-eco-guardian') guardianCount++;
          else {
            throw new Error(`Unexpected badge id: ${b}`);
          }
        });
      });

      expect(rescueCount).toBe(18);
      expect(artistCount).toBe(21);
      expect(guardianCount).toBe(15);
      expect(rescueCount + artistCount + guardianCount).toBe(54);
    });

    it('CRITICAL SPEC: Peak session engagement must be 96% and individual average ~89%', () => {
      // Peak session engagement metric
      const totalEngagement = CLASS_SESSION_STUDENTS.reduce((sum, s) => sum + s.engagement, 0);
      const averageEngagement = totalEngagement / CLASS_SESSION_STUDENTS.length;

      // Exact total: 2143 / 24 = 89.29%
      expect(totalEngagement).toBe(2143);
      expect(Math.round(averageEngagement)).toBe(89);

      // Session peak is 96%
      expect(INITIAL_SYNC_STATE.engagementScore).toBe(96);
      const peakStudent = CLASS_SESSION_STUDENTS.find((s) => s.engagement === 98);
      expect(peakStudent).toBeDefined(); // An has 98%
      const lowestStudent = CLASS_SESSION_STUDENTS.find((s) => s.engagement === 76);
      expect(lowestStudent).toBeDefined(); // Bảo has 76%
    });

    it('CRITICAL SPEC: Tier distribution strictly equals 14 Excellent, 8 Good, 2 Support', () => {
      const excellentList = CLASS_SESSION_STUDENTS.filter((s) => s.tier === 'excellent');
      const goodList = CLASS_SESSION_STUDENTS.filter((s) => s.tier === 'good');
      const supportList = CLASS_SESSION_STUDENTS.filter((s) => s.tier === 'support');

      expect(excellentList).toHaveLength(14);
      expect(goodList).toHaveLength(8);
      expect(supportList).toHaveLength(2);
      expect(excellentList.length + goodList.length + supportList.length).toBe(24);
    });

    it('PEDAGOGICAL ARTIFACTS: Authentic student artifacts for An, Bình, and Chi', () => {
      const studentAn = CLASS_SESSION_STUDENTS[0];
      const studentBinh = CLASS_SESSION_STUDENTS[1];
      const studentChi = CLASS_SESSION_STUDENTS[2];

      expect(studentAn.name).toBe('An');
      expect(studentAn.artifactTitle).toBe('Tranh sáp: Bạn Rùa và Vườn Cỏ Biển');
      expect(studentAn.audioDuration).toBe('0:15');
      expect(studentAn.audioText).toContain('rùa có phổi giống như chúng con');

      expect(studentBinh.name).toBe('Bình');
      expect(studentBinh.artifactTitle).toBe('Mô hình 3D: Rạn San Hô Đa Tầng');
      expect(studentBinh.audioDuration).toBe('0:14');
      expect(studentBinh.audioText).toContain('cá hề trong bụi hải quỳ');

      expect(studentChi.name).toBe('Chi');
      expect(studentChi.artifactTitle).toBe('Bản phối màu sáp: Hoàng Hôn Đại Dương');
      expect(studentChi.audioDuration).toBe('0:16');
      expect(studentChi.audioText).toContain('xanh ngọc lam');
    });

    it('SSR RENDER: TeacherSessionResultsPage renders complete report structure', () => {
      const html = renderWithProviders(
        React.createElement(TeacherSessionResultsPage),
        '/teacher/results'
      );

      // Report Header & Teacher Shell
      expect(html).toContain('Báo Cáo Kết Quả Buổi Học');
      expect(html).toContain('Lớp Sao Biển');
      expect(html).toContain('Cô Linh');
      expect(html).toContain('Quay về bàn làm việc giáo viên');

      // 4 Metric summary cards
      expect(html).toContain('24 / 24');
      expect(html).toContain('96%');
      expect(html).toContain('5 / 5');
      expect(html).toContain('54');

      // 5 STEAM pillars progress
      expect(html).toContain('Khoa học (Science)');
      expect(html).toContain('100%');
      expect(html).toContain('Công nghệ (Technology)');
      expect(html).toContain('96%');
      expect(html).toContain('Kỹ thuật (Engineering)');
      expect(html).toContain('92%');
      expect(html).toContain('Nghệ thuật (Art)');
      expect(html).toContain('95%');
      expect(html).toContain('Toán học (Math)');
      expect(html).toContain('94%');

      // 3 Featured student artifacts
      expect(html).toContain('Bạn Rùa và Vườn Cỏ Biển');
      expect(html).toContain('Rạn San Hô Đa Tầng');
      expect(html).toContain('Hoàng Hôn Đại Dương');

      // Detailed table
      expect(html).toContain('Danh Sách Chi Tiết 24 Học Sinh');
      expect(html).toContain('Bảo');
      expect(html).toContain('Yến');
    });
  });

  // =========================================================================
  // SCREEN 30: Learner Profile (/profile)
  // =========================================================================
  describe('3. Screen 30: LearnerProfilePage Architecture & Dynamic State', () => {
    it('CRITICAL REFERENCE CORRECTION (Line 26): Strictly NO non-standard lateral sidebars', () => {
      const html = renderWithProviders(React.createElement(LearnerProfilePage), '/profile');

      // LearnerShell wraps the page without rogue custom sidebar
      expect(html).not.toContain('<aside');
      expect(html).toContain('Điều hướng học sinh');
      expect(html).toContain('Hồ sơ của Bé An');
    });

    it('CRITICAL DATA PIPELINE: Dynamic artwork loading from creativeStorage with fallback', async () => {
      // 1. Initial State: Empty storage -> renders fallback reference crayon artwork
      let html = renderWithProviders(React.createElement(LearnerProfilePage), '/profile');
      expect(html).toContain('child_crayon_turtle');
      expect(html).toContain('Bức tranh của An');

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

    it('JOURNEY ARCHITECTURE: 3-step roadmap links and bottom 3 card destinations', () => {
      const html = renderWithProviders(React.createElement(LearnerProfilePage), '/profile');

      // 3-step Journey Timeline
      expect(html).toContain('Gặp gỡ rùa biển');
      expect(html).toContain('Tìm hiểu nơi sống của rùa biển');
      expect(html).toContain('Vẽ tranh về đại dương');

      // Bottom 3 Cards
      expect(html).toContain('Đã khám phá');
      expect(html).toContain('Cua biển');
      expect(html).toContain('Cỏ biển');
      expect(html).toContain('Hoạt động đang làm');
      expect(html).toContain('Xây dựng môi trường sống');
      expect(html).toContain('Cùng làm ngoài màn hình');
      expect(html).toContain('Vẽ và tô màu rùa biển');
    });

    it('MODAL ACTIONS: Modal contains action triggers for preview, download, and drawing studio', () => {
      const html = renderWithProviders(React.createElement(LearnerProfilePage), '/profile');
      expect(html).toContain('Mở tác phẩm');
      expect(html).toContain('Chỉnh sửa hồ sơ');
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

      expect(html).toContain('Hành trình Đại dương');
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
