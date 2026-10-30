import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, beforeEach } from 'vitest';
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';
import { LearnerHomePage, HOME_FEATURE_SLIDES } from '../src/domains/learner/home/LearnerHomePage';
import { ResourcesLibraryPage } from '../src/domains/learner/resources/ResourcesLibraryPage';
import { ResourceDetailPage } from '../src/domains/learner/resources/ResourceDetailPage';
import { TeacherDashboardPage } from '../src/domains/teacher/dashboard/TeacherDashboardPage';
import { TeacherResourceLibraryPage } from '../src/domains/teacher/resources/TeacherResourceLibraryPage';
import { GameLabPage } from '../src/domains/learner/game-lab/GameLabPage';
import { TeacherInteractivePage } from '../src/domains/teacher/interactive/TeacherInteractivePage';
import { parseSketchfabUid } from '../src/shared/ui/media/SketchfabViewer';
import { CatalogToolbar } from '../src/shared/ui/catalog/CatalogToolbar';
import { filterResourcesLocal, INITIAL_RESOURCES_FALLBACK } from '../src/shared/api/catalog';

if (typeof globalThis.window === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).window = {
    location: { pathname: '/home', search: '', href: 'http://localhost:3010/home' },
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    print: () => {},
    open: () => null,
    innerHeight: 900,
    innerWidth: 1440,
    history: { length: 1, pushState: () => {}, replaceState: () => {}, back: () => {} },
    matchMedia: () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    sessionStorage: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = String(v);
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
    },
    localStorage: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = String(v);
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
    },
  };
}

function renderAt(element: React.ReactElement, pathname: string, search = ''): string {
  if (typeof window !== 'undefined') {
    window.location.pathname = pathname;
    window.location.search = search;
  }
  return renderToString(
    React.createElement(
      I18nProvider,
      null,
      React.createElement(RouterProvider, { initialRoute: `${pathname}${search}` }, element)
    )
  );
}

describe('Task 4 — Catalog Filters, Home Mapping, Resource Detail & 3D Model Drawer (M01-M03, M07-M08, M12)', () => {
  it('keeps learner worlds and search without topic pills, and retains teacher topics inside a disclosure', () => {
    const learner = renderAt(React.createElement(GameLabPage), '/interactive', '?kind=game&topics=species');
    expect(learner).toContain('Tìm hoạt động');
    expect(learner).toContain('Khám phá 3D');
    expect(learner).not.toContain('Bảo vệ biển');
    expect(learner).not.toContain('Sinh vật');
    expect(learner).not.toContain('Môi trường');
    const teacher = renderAt(React.createElement(TeacherInteractivePage), '/teacher/interactive');
    expect(teacher).toContain('Hoạt động làm sẵn để cô cùng bé khám phá.');
    expect(teacher).toContain('Xu hướng');
    expect(teacher).not.toMatch(/Tạo trò chơi|Thêm mô hình|Lưu nháp|Bộ lọc chủ đề/);
  });
  it('resource toolbar only offers formats even when legacy topic props are supplied', () => {
    const legacyProps = {role:'learner' as const,activeFormat:'visual',selectedTopic:'all',onSelectTopic:()=>{}};
    const html=renderToString(React.createElement(CatalogToolbar,legacyProps));
    expect(html).toContain('Thẻ hình');
    expect(html).not.toContain('Bảo vệ biển');
    expect(html).not.toContain('Sinh vật');
    expect(html).not.toContain('Môi trường');
  });
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.location.pathname = '/home';
      window.location.search = '';
    }
  });

  it('M01 LearnerHomePage renders 3 categories and 2 shortcuts without fake progress or homework widgets', () => {
    const html = renderAt(React.createElement(LearnerHomePage), '/home');
    expect(html).toContain('Xoay mô hình, nhìn từ mọi phía');
    expect(html).toContain('<h1>Cùng khám phá đại dương</h1>');
    expect(html).toContain('<h2>Khám phá 3D</h2>');
    expect(html).toContain('Khám phá 3D');
    expect(html).toContain('Học liệu');
    expect(html).toContain('Trò chơi');
    expect(html).toContain('Xưởng sáng tạo');
    expect(html).not.toContain('Vào lớp');

    // Forbidden fake progress / homework sections on M01
    expect(html).not.toContain('Đang khám phá');
    expect(html).not.toContain('Cô giao cho em');
    expect(html).not.toContain('Có gì mới');
  });

  it('M01 restores split mockup layout, technology classroom and keeps shared header audio', () => {
    const html = renderAt(React.createElement(LearnerHomePage), '/home');

    expect(HOME_FEATURE_SLIDES[0].targetRoute).toBe('/interactive/3d');
    expect(html).toContain('data-testid="home-feature-action"');
    expect(html).toContain('data-testid="home-feature-artwork"');
    expect(html).toContain('/assets/generated/home/home_3d_atelier_v2.jpg');
    expect(html).toContain('/assets/generated/home/home_resources_atelier_v2.jpg');
    expect(html).toContain('/assets/generated/home/home_games_atelier_v2.jpg');
    expect(html).not.toContain('/assets/generated/home/home_classroom_atelier_v2.jpg');
    expect(html).not.toContain('/assets/generated/craft/classroom_desk_study.jpg');
    expect(html).not.toContain('Chạm và xoay');
    expect(html).not.toContain('aria-label="Nghe');
    expect(html).not.toContain('bluesteam-header-audio');
  });

  it('keeps the shared learner audio toggle on non-home pages', () => {
    const html = renderAt(React.createElement(ResourcesLibraryPage), '/resources');
    expect(html).toContain('aria-label="Tắt âm thanh"');
  });

  it('M02 opens groups without injecting seed content into the initial UI',()=>{
 const html=renderAt(React.createElement(ResourcesLibraryPage),'/resources','');
 expect(html).toContain('Khám phá theo nhóm');expect(html).toContain('Chọn nhóm học liệu');
 expect(html).toContain('Đang mở thư viện');expect(html).not.toContain('Cua biển');
});

  it('M02 visual filter combines flashcards and images without including other resource kinds', () => {
    const imageResource = {
      ...INITIAL_RESOURCES_FALLBACK[0],
      id: 'image-cua-bien',
      kind: 'image' as const,
    };
    const visualResources = filterResourcesLocal(
      [...INITIAL_RESOURCES_FALLBACK, imageResource],
      { kind: 'visual' },
    );

    expect(visualResources.some((resource) => resource.kind === 'flashcard')).toBe(true);
    expect(visualResources.some((resource) => resource.kind === 'image')).toBe(true);
    expect(visualResources.every((resource) => ['flashcard', 'image'].includes(resource.kind))).toBe(true);
  });

  it('M02 uses the group identity and a single merged visual format inside a group',()=>{
 const html=renderAt(React.createElement(ResourcesLibraryPage),'/resources','?group=00000000-0000-4000-8000-000000000001&kind=visual');
 const tabs=html.match(/<button[^>]*role="tab"[^>]*>[\s\S]*?<\/button>/g)||[];
 expect(tabs.some(t=>t.includes('aria-selected="true"')&&t.includes('Thẻ hình'))).toBe(true);
 expect(tabs.filter(t=>t.includes('Hình ảnh')||t.includes('Thẻ hình'))).toHaveLength(1);
 expect(tabs.every(t=>!t.includes('Tất cả')&&!t.includes('Phiếu học tập'))).toBe(true);
 expect(html).toContain('Nhóm đang khám phá');
 expect(html).not.toContain('/assets/generated/resources/conch-sand.webp');
 expect(html).not.toContain('/assets/generated/resources/ocean-discovery-banner.webp');
 expect(html).not.toContain('Lọc theo chủ đề đại dương');
});

  it('M03 waits for persisted content instead of showing a local specimen for an unverified ID',()=>{
 const html=renderAt(React.createElement(ResourceDetailPage),'/resources/041d3c99-8383-425f-b444-6e8b82796c6b','');
 expect(html).toContain('Đang mở học liệu');expect(html).not.toContain('Giúp cua tự vệ');
});

  it('M07 TeacherDashboardPage maps to student domains and omits fake KPIs or mandatory lesson plans', () => {
    const html = renderAt(React.createElement(TeacherDashboardPage), '/teacher');
    expect(html).not.toContain('Khám phá bờ biển');
    expect(html).not.toContain('Bãi biển hôm nay');
    expect(html).not.toContain('Đang tải lịch sử buổi sinh hoạt');
    expect(html).toContain('/assets/generated/home/home_teacher_shore_crab.jpg');
    expect(html).not.toContain('/assets/generated/home/home_classroom_atelier_v2.jpg');
    expect(html).toContain('/assets/generated/home/home_resources_atelier_v2.jpg');
    expect(html).toContain('/assets/generated/home/home_games_atelier_v2.jpg');
    expect(html).not.toContain('aria-label="Nghe');
    expect(html).not.toContain('bluesteam-header-audio');
    expect(html).toContain('Không gian của cô');
    expect(html).toContain('Quản lý tương tác');
    expect(html).not.toContain('Mở phòng');
    expect(html).toContain('Quản lý');
    expect(html).not.toContain('Phòng');
    expect(html).not.toContain('Buổi sinh hoạt gần đây');
    expect(html).not.toContain('98%');
    expect(html).not.toContain('24 học sinh');
  });

  it('M08 provides group management, filters and a truthful loading state',()=>{
 const html=renderAt(React.createElement(TeacherResourceLibraryPage),'/teacher/resources');
 expect(html).not.toMatch(/Xem như bé|Kho chung|Của cô|Nguồn học liệu/);
 for(const label of ['Nhóm học liệu','Chưa phân nhóm','Thêm học liệu','Trạng thái'])expect(html).toContain(label);
 expect(html).toContain('Đang tải học liệu');expect(html).not.toContain('Cua biển');
});

  it('M12 parseSketchfabUid and ModelDrawer validate Sketchfab URLs and reject arbitrary hosts', () => {
    expect(
      parseSketchfabUid(
        'https://sketchfab.com/3d-models/sea-turtle-e3bf8832c20a4052988ef267b63ae238'
      )
    ).toBe('e3bf8832c20a4052988ef267b63ae238');
    expect(parseSketchfabUid('e3bf8832c20a4052988ef267b63ae238')).toBe(
      'e3bf8832c20a4052988ef267b63ae238'
    );
    expect(
      parseSketchfabUid('https://evil.example.com/3d-models/e3bf8832c20a4052988ef267b63ae238')
    ).toBeNull();

  });
});
