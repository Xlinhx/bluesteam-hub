if (typeof globalThis.window === 'undefined') {
  const sessionStorageStore: Record<string, string> = {};
  const localStorageStore: Record<string, string> = {};
  (globalThis as any).window = {
    location: { pathname: '/', search: '', href: 'http://localhost:3010/' },
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
        for (const k of Object.keys(sessionStorageStore)) delete sessionStorageStore[k];
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
        for (const k of Object.keys(localStorageStore)) delete localStorageStore[k];
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
      toDataURL: () => 'data:image/png;base64,mock',
      style: {},
      setAttribute: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  };
}

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from '../src/app/App';
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';
import { ThemeProvider } from '../src/shared/theme/ThemeProvider';
import { FALLBACK_DEMO_ARTWORKS } from '../src/shared/api/artworks';

function renderRoute(pathname: string, search: string = ''): string {
  window.location.pathname = pathname;
  window.location.search = search;
  window.location.href = `http://localhost:3010${pathname}${search}`;
  return renderToString(
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(
        I18nProvider,
        null,
        React.createElement(RouterProvider, null, React.createElement(App)),
      ),
    ),
  );
}

describe('Task 9 — R2 18 Mockup Surfaces (M01-M18) & 16 Plan-Only Surfaces (P01-P16) Coverage', () => {
  it('renders M01-M18 canonical routes with mandatory UI-SPEC 2.4 corrections enforced', () => {
    const m01 = renderRoute('/home');
    expect(m01).toContain('Xưởng sáng tạo');
    expect(m01).not.toContain('Vào lớp');
    expect(m01).not.toContain('Cô giao cho em');
    expect(m01).not.toContain('Đang khám phá');
    expect(m01).not.toContain('Có gì mới');

    const m02 = renderRoute('/resources');
    expect(m02).toContain('Học liệu');
    expect(m02).toContain('Tìm học liệu');
    expect(m02).toContain('Nghe · Xem · Khám phá');
    expect(m02).not.toContain('Giao cho lớp');

    const m03 = renderRoute('/resources/20000000-0000-4000-8000-000000000101');
    expect(m03).toContain('Đang mở học liệu…');
    expect(m03).not.toContain('Lưu lại');

    const m04 = renderRoute('/interactive');
    expect(m04).toContain('Khám phá 3D');
    expect(m04).toContain('Trò chơi');
    expect(m04).toContain('Tình huống');
    expect(m04).toContain('Mô phỏng');

    const m05 = renderRoute('/room/20000000-0000-4000-8000-000000000601');
    expect(m05).toContain('404'); expect(m05).not.toContain('Khám phá Rạn san hô');

    const m07 = renderRoute('/teacher');
    expect(m07).not.toContain('Mở phòng sinh hoạt');

    const m08 = renderRoute('/teacher/resources');
    expect(m08).toContain('Thêm học liệu');
    expect(m08).not.toContain('Giao bài');

    const m09 = renderRoute('/teacher/interactive');
    expect(m09).toContain('Hoạt động làm sẵn để cô cùng bé khám phá.');
    expect(m09).not.toContain('Tạo trò chơi');

    const m10 = renderRoute('/teacher/interactive/games/20000000-0000-4000-8000-000000000301/edit');
    expect(m10).toContain('Hoạt động làm sẵn để cô cùng bé khám phá.');
    expect(m10).not.toContain('Lưu nháp');

    const m11 = renderRoute('/teacher/interactive/scenarios/20000000-0000-4000-8000-000000000304/edit');
    expect(m11).toContain('Hoạt động làm sẵn để cô cùng bé khám phá.');
    expect(m11).not.toContain('Cảnh 1:');

    const m13 = renderRoute('/teacher/creative');
    expect(m13).toContain('Sáng tạo cùng bé');
    expect(m13).toContain('Biển chung');
    expect(m13).not.toContain('Xây nơi sống');
    expect(m13).toContain('Tô màu');
    expect(m13).not.toContain('Giao cho lớp');

    const m14 = renderRoute('/teacher/rooms');
    expect(m14).toContain('404');
    expect(m14).toContain('404');

    const m15 = renderRoute('/teacher/rooms/20000000-0000-4000-8000-000000000601');
    expect(m15).toContain('404'); expect(m15).not.toContain('482915');

    const m16 = renderRoute('/teacher/rooms/20000000-0000-4000-8000-000000000602/results');
    expect(m16).toContain('404');
    expect(m16).not.toContain('Xuất CSV (UTF-8)');
    expect(m16).not.toContain('96%');

    const m17 = renderRoute('/room/20000000-0000-4000-8000-000000000602/present', '?view=artworks');
    expect(m17).toContain('404');
    expect(m17).not.toContain('presentation-artwork-card-');

    const m18 = renderRoute('/room/20000000-0000-4000-8000-000000000602/present', '?view=scores');
    expect(m18).toContain('404');
  });

  it('renders P01-P16 plan-only surfaces and real 404 for unknown routes', () => {
    expect(renderRoute('/')).not.toContain('Vào lớp');
    expect(renderRoute('/entry')).not.toContain('Vào phòng của cô');
    expect(renderRoute('/login')).toContain('Email');
    const joinHtml = renderRoute('/join');
    expect(joinHtml).toContain('404');
    expect(joinHtml).not.toContain('value="482915"');
    expect(renderRoute('/interactive/3d')).toContain('3D');
    expect(renderRoute('/interactive/simulations')).toContain('Mô phỏng');
    expect(renderRoute('/creative')).toContain('Đại dương mang dấu ấn của bé');
    expect(renderRoute('/create')).toContain('Đại dương mang dấu ấn của bé');
    expect(renderRoute('/creative/drawing')).toContain('Bức tranh của bé');
    expect(renderRoute('/creative/drawing')).not.toContain('room-submit-artwork-btn');
    expect(renderRoute('/profile')).toContain('Trên thiết bị này');
    expect(renderRoute('/route-khong-ton-tai-xyz')).toContain('404');
  });
});
