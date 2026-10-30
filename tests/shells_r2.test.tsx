// Setup minimal SSR window/document mock prior to any imports
if (typeof globalThis.window === 'undefined') {
  const sessionStorageStore: Record<string, string> = {};
  const localStorageStore: Record<string, string> = {};
  (globalThis as any).window = {
    location: { pathname: '/home', search: '', href: 'http://localhost:3010/home' },
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    history: {
      length: 1,
      pushState: (_s: unknown, _t: string, url: string) => {
        const [p, q] = String(url).split('?');
        (globalThis as any).window.location.pathname = p || '/';
        (globalThis as any).window.location.search = q ? `?${q}` : '';
      },
      replaceState: (_s: unknown, _t: string, url: string) => {
        const [p, q] = String(url).split('?');
        (globalThis as any).window.location.pathname = p || '/';
        (globalThis as any).window.location.search = q ? `?${q}` : '';
      },
      back: () => {},
    },
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
        Object.keys(sessionStorageStore).forEach((k) => delete sessionStorageStore[k]);
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
        Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]);
      },
    },
  };
  (globalThis as any).localStorage = (globalThis as any).window.localStorage;
  (globalThis as any).sessionStorage = (globalThis as any).window.sessionStorage;
}
if (typeof globalThis.document === 'undefined') {
  (globalThis as any).document = {
    title: 'BlueSTEAM',
    body: { style: {} },
    documentElement: {
      style: { setProperty: () => {}, getPropertyValue: () => '' },
      classList: { add: () => {}, remove: () => {}, contains: () => false },
    },
    getElementById: () => ({ focus: () => {} }),
  };
}

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import {
  RouterProvider,
  useRouter,
  parseQuery,
  resolveRouteDomain,
  ROUTE_ALIASES,
} from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';
import { ThemeProvider } from '../src/shared/theme/ThemeProvider';
import { LearnerShell } from '../src/shared/shells/LearnerShell';
import { TeacherShell } from '../src/shared/shells/TeacherShell';
import {
  LEARNER_NAV_ITEMS,
  TEACHER_NAV_ITEMS,
  resolveLearnerActiveNav,
  resolveTeacherActiveNav,
} from '../src/shared/ui/navigation/RoleNavigation';
import { RoleGatewayPage } from '../src/domains/public/onboarding/RoleGatewayPage';
import { AccountAuthPage } from '../src/domains/public/auth/AccountAuthPage';
import {
  CATEGORY_ARTWORK_MAP,
  ANIMAL_AVATARS,
  TOPIC_META_LIST,
} from '../src/shared/data/categoryArtworkMap';
import App from '../src/app/App';

function renderWithProviders(element: React.ReactElement, initialRoute = '/home'): string {
  return renderToString(
    <I18nProvider>
      <RouterProvider initialRoute={initialRoute}>
        <ThemeProvider>{element}</ThemeProvider>
      </RouterProvider>
    </I18nProvider>,
  );
}

describe('Task 2 — Shared Shells, Unified Category Registry, Routes, and Entry (r2)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('provides unified category artwork, topic metadata, and 8 animal avatars from a single registry with existing clean cutout files', () => {
    expect(Object.keys(CATEGORY_ARTWORK_MAP)).toEqual([
      'resources',
      'interactive',
      'creative',
    ]);

    for (const spec of Object.values(CATEGORY_ARTWORK_MAP)) {
      const diskPath = path.join(process.cwd(), 'public', spec.cutoutSrc.replace(/^\//, ''));
      expect(fs.existsSync(diskPath)).toBe(true);
      expect(spec.cutoutSrc).not.toContain('docs/mockups');
    }

    expect(ANIMAL_AVATARS.map((a) => a.key)).toEqual([
      'turtle',
      'crab',
      'clownfish',
      'starfish',
      'dolphin',
      'octopus',
      'seahorse',
      'jellyfish',
    ]);

    for (const avatar of ANIMAL_AVATARS) {
      const diskPath = path.join(process.cwd(), 'public', avatar.imageSrc.replace(/^\//, ''));
      expect(fs.existsSync(diskPath)).toBe(true);
    }

    expect(TOPIC_META_LIST.map((t) => t.key)).toEqual([
      'creatures',
      'coral',
      'layers',
      'conservation',
    ]);
  });

  it('LearnerShell exposes profile as a separate active tab and provides logout', () => {
    expect(LEARNER_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Trang chủ',
      'Học liệu',
      'Tương tác',
      'Sáng tạo',
      'Hồ sơ',
    ]);

    const html = renderWithProviders(
      <LearnerShell activeNav="home">
        <div>Learner Content</div>
      </LearnerShell>,
      '/home',
    );

    expect(html).toContain('Điều hướng học sinh');
    expect(html).toContain('Trang chủ');
    expect(html).toContain('Học liệu');
    expect(html).toContain('Tương tác');
    expect(html).toContain('Sáng tạo');
    expect(html).not.toContain('Vào lớp');
    expect(html).toContain('data-nav-key="profile"');
    expect(html).toContain('Đăng xuất tài khoản học sinh');
    expect(html).not.toContain('Hồ sơ của Bé An');
    expect(resolveLearnerActiveNav('/profile')).toBe('profile');
    const profileHtml = renderWithProviders(<LearnerShell activeNav="profile">Profile</LearnerShell>, '/profile');
    expect(profileHtml).toMatch(/aria-current="page" data-nav-key="profile"/);
    expect(html).not.toContain('Bản đồ đại dương');
    expect(html).not.toContain('>Học tập<');

    // Child route active resolution
    expect(resolveLearnerActiveNav('/interactive/sort')).toBe('interactive');
    expect(resolveLearnerActiveNav('/studio/paint')).toBe('creative');
    expect(resolveLearnerActiveNav('/resources/flashcard/1')).toBe('resources');
  });

  it('TeacherShell renders exact 5 r2 navigation items (Trang chủ, Học liệu, Tương tác, Sáng tạo, Phòng học) without Giáo án or Sổ tay', () => {
    expect(TEACHER_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Trang chủ',
      'Học liệu',
      'Tương tác',
      'Sáng tạo',
    ]);

    const html = renderWithProviders(
      <TeacherShell activeNav="overview">
        <div>Teacher Content</div>
      </TeacherShell>,
      '/teacher',
    );

    expect(html).toContain('Điều hướng giáo viên');
    expect(html).toContain('Trang chủ');
    expect(html).toContain('Học liệu');
    expect(html).toContain('Tương tác');
    expect(html).toContain('Sáng tạo');
    expect(html).not.toContain('Phòng học');
    expect(html).not.toContain('Tạo phòng mới');
    expect(html).not.toContain('>Giáo án<');
    expect(html).not.toContain('>Bài giảng<');
    expect(html).not.toContain('>Sổ tay lớp<');
    expect(html).not.toContain('>Hồ sơ<');

    // Child route active resolution
    expect(resolveTeacherActiveNav('/teacher/interactive/games/new')).toBe('interactive');
    expect(resolveTeacherActiveNav('/teacher/rooms/live')).toBe('overview');
    expect(resolveTeacherActiveNav('/teacher/creative')).toBe('creative');
  });

  it('Router scopes query parameters by domain and exposes ROUTE_ALIASES', () => {
    expect(resolveRouteDomain('/resources')).toBe('learner');
    expect(resolveRouteDomain('/teacher/resources')).toBe('teacher');
    expect(resolveRouteDomain('/login')).toBe('public');
    expect(ROUTE_ALIASES['/teacher/lessons']).toBe('/teacher');
    expect(ROUTE_ALIASES['/teacher/classes']).toBeUndefined();

    let capturedRoute = '';
    let capturedQuery: Record<string, string> = {};
    function Probe() {
      const { currentRoute, query } = useRouter();
      capturedRoute = currentRoute;
      capturedQuery = query;
      return <div>{currentRoute}</div>;
    }

    renderWithProviders(<Probe />, '/resources?type=3d&topic=coral&roomId=room-123');
    expect(capturedRoute).toBe('/resources');
    expect(capturedQuery).toEqual({
      type: '3d',
      topic: 'coral',
      roomId: 'room-123',
    });
    expect(parseQuery('?type=card&q=rua')).toEqual({ type: 'card', q: 'rua' });
  });

  it('RoleGatewayPage (/entry) renders Vào phòng của cô entry button and does not show fake Giáo án / Hồ sơ tiles', () => {
    const html = renderWithProviders(<RoleGatewayPage />, '/entry');
    expect(html).toContain('Bắt đầu cùng BlueSTEAM');
    expect(html).toContain('Khám phá cùng bé');
    expect(html).toContain('Không gian giáo viên');
    expect(html).not.toContain('Vào phòng của cô');
    expect(html).not.toContain('>Giáo án<');
    expect(html).not.toContain('>Hồ sơ<');
  });

  it('AccountAuthPage (/login) provides real registration and explicit roles', () => {
    const html = renderWithProviders(<AccountAuthPage />, '/login');
    expect(html).toContain('Đăng nhập giáo viên');
    expect(html).toContain('Đăng ký ngay');
    expect(html).toContain('Học sinh');
    expect(html).not.toContain('Tài khoản giáo viên được cấp bởi quản trị viên nhà trường');
  });

  it('App renders a true NotFoundPage (404) on unknown routes instead of silently falling back to landing page', () => {
    const html = renderWithProviders(<App />, '/duong-dan-khong-ton-tai-404');
    expect(html).toContain('Mã lỗi 404');
    expect(html).toContain('Không tìm thấy trang này');
    expect(html).toContain('/duong-dan-khong-ton-tai-404');
  });
});
