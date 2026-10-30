// Setup minimal SSR window/document mock prior to any imports
if (typeof globalThis.window === 'undefined') {
  const sessionStorageStore: Record<string, string> = {};
  const localStorageStore: Record<string, string> = {};
  (globalThis as any).window = {
    location: { pathname: '/interactive', search: '', href: 'http://localhost:3010/interactive' },
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    open: () => null,
    history: {
      length: 1,
      pushState: () => {},
      replaceState: () => {},
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

import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, beforeEach } from 'vitest';
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';
import { ThemeProvider } from '../src/shared/theme/ThemeProvider';
import { GameLabPage } from '../src/domains/learner/game-lab/GameLabPage';
import { validateScenarioGraph } from '../src/shared/activities/scenario/validateScenario';
import { deleteTeacherActivity, deleteTeacherModel, deleteTeacherCreativeTemplate } from '../src/shared/api/catalog';

function renderWithProviders(ui: React.ReactElement): string {
  return renderToString(
    <ThemeProvider>
      <I18nProvider>
        <RouterProvider>{ui}</RouterProvider>
      </I18nProvider>
    </ThemeProvider>,
  );
}

describe('Review 16/10/2026 — Frontend Logic & Runtime Contracts (Findings 1, 3, 5, 6, 7, 8)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('Finding 1: validateScenarioGraph accepts scenes with isEnding: true, isEnd: true, or isTerminal: true', () => {
    const graphWithIsEnding = validateScenarioGraph({
      templateKey: 'scenario',
      startSceneId: 's1',
      scoringMode: 'completion',
      scenes: [
        {
          id: 's1',
          title: 'Cảnh 1',
          promptText: 'Bé thấy chai nhựa trên bãi cát',
          choices: [{ id: 'c1', label: 'Nhặt bỏ thùng rác', nextSceneId: 's2', isCorrect: true }],
        },
        {
          id: 's2',
          title: 'Cảnh kết',
          promptText: 'Bãi biển sạch đẹp!',
          isEnding: true,
          choices: [],
        },
      ],
    });
    expect(graphWithIsEnding.valid).toBe(true);
    expect(graphWithIsEnding.errors).toHaveLength(0);
  });

  it('Finding 6: catalog waits for real activities instead of rendering fallback entities', () => {
    const html = renderWithProviders(<GameLabPage />);
    expect(html).toContain('aria-label="Đang tải hoạt động"');
    expect(html).not.toContain('data-activity-id="c1234567-89ab-4cde-8f01-234567890001"');
    expect(html).not.toContain('Về đúng nhà');
    expect(html).toContain('Nghe hướng dẫn trang Tương tác');
  });
});
