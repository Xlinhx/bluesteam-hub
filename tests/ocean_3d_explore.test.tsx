// SSR mock setup prior to React and page imports
if (typeof globalThis.window === 'undefined') {
  const sessionStorageStore: Record<string, string> = {};
  const localStorageStore: Record<string, string> = {};
  (globalThis as any).window = {
    location: { pathname: '/interactive/3d', search: '', href: 'http://localhost:5173/interactive/3d' },
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    print: () => {},
    open: () => null,
    alert: () => {},
    innerHeight: 1024,
    innerWidth: 1536,
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
  (globalThis as any).document = {
    title: 'BlueSTEAM',
    createElement: () => ({
      getContext: () => null,
      setAttribute: () => {},
    }),
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
  };
}

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { RouterProvider } from '../src/app/router';
import { I18nProvider } from '../src/shared/i18n/I18nContext';
import { Ocean3DExplorePage } from '../src/domains/learner/atlas/Ocean3DExplorePage';
import { InteractiveSubNav } from '../src/shared/ui/navigation/InteractiveSubNav';
import { TurtleCard3DCanvas } from '../src/domains/learner/creature-viewer/components/TurtleCard3DCanvas';
import {
  DragToRotateIcon,
  DragToRotateBadge,
  IsometricCubeIcon,
  OceanSparkleIcon,
  RightArrowNavIcon,
  OrganicWaveDivider,
  StarfishOutlineDoodle,
  FloatingBubbleIcon,
} from '../src/shared/ui/visuals/Ocean3DSvgs';

function renderWithProviders(element: React.ReactElement): string {
  return renderToString(
    React.createElement(
      I18nProvider,
      null,
      React.createElement(RouterProvider, null, element)
    )
  );
}

describe('BlueSTEAM v2 - Khám Phá 3D (Ocean 3D Exploration)', () => {
  it('should render all standard SVGs correctly with valid path geometries', () => {
    const dragRotateHtml = renderToString(<DragToRotateIcon />);
    expect(dragRotateHtml).toContain('<svg');
    expect(dragRotateHtml).toContain('viewBox="0 0 32 32"');
    expect(dragRotateHtml).toContain('ellipse');

    const badgeHtml = renderToString(<DragToRotateBadge />);
    expect(badgeHtml).toContain('Kéo để xoay');

    const cubeHtml = renderToString(<IsometricCubeIcon />);
    expect(cubeHtml).toContain('<svg');
    expect(cubeHtml).toContain('viewBox="0 0 24 24"');

    const sparkleHtml = renderToString(<OceanSparkleIcon />);
    expect(sparkleHtml).toContain('<svg');
    expect(sparkleHtml).toContain('text-[#2EE6CA]');

    const arrowHtml = renderToString(<RightArrowNavIcon />);
    expect(arrowHtml).toContain('<svg');
    expect(arrowHtml).toContain('d="M4 10 H16"');

    const waveHtml = renderToString(<OrganicWaveDivider />);
    expect(waveHtml).toContain('<svg');
    expect(waveHtml).toContain('viewBox="0 0 1440 64"');

    const starfishHtml = renderToString(<StarfishOutlineDoodle />);
    expect(starfishHtml).toContain('<svg');

    const bubbleHtml = renderToString(<FloatingBubbleIcon size={24} />);
    expect(bubbleHtml).toContain('<svg');
    expect(bubbleHtml).toContain('width="24"');
  });

  it('should render 3-tab InteractiveSubNav with 3D exploration active', () => {
    const html = renderWithProviders(<InteractiveSubNav activeTab="3d" />);
    expect(html).toContain('Trò chơi khám phá');
    expect(html).toContain('Mô phỏng tình huống');
    expect(html).toContain('Khám phá 3D');
    // Active tab has dark navy background
    expect(html).toContain('bg-[#0E2942]');
  });

  it('should render TurtleCard3DCanvas with fallback or canvas container and badge', () => {
    const html = renderToString(<TurtleCard3DCanvas showBadge={true} />);
    expect(html).toContain('Kéo để xoay');
    expect(html).toBeDefined();
  });

  it('should render Ocean3DExplorePage with reverted card layout, representative sea turtle image and no other mockups', () => {
    const html = renderWithProviders(<Ocean3DExplorePage />);

    // Header banner text matching mockup
    expect(html).toContain('Gặp gỡ những người bạn');
    expect(html).toContain('đại dương');
    expect(html).toContain('Chọn một bạn, xoay thật gần và cùng khám phá.');

    // Main section title and search
    expect(html).toContain('Bé muốn ngắm bạn nào?');
    expect(html).toContain('aria-label="Tìm sinh vật"');
    expect(html).toContain('Rùa biển');

    // Representative generated sea turtle image
    expect(html).toContain('/assets/generated/creatures/sea_turtle_card.jpg');

    // Ensure other mockup cards are removed as requested
    expect(html).not.toContain('Cá hề');
    expect(html).not.toContain('Sứa biển');
    expect(html).not.toContain('Cá ngựa');
    expect(html).not.toContain('Sao biển');
    expect(html).not.toContain('Vỏ sò');

    // Inspect CTA button
    expect(html).toContain('Quan sát');

    // Navigation shell active state
    expect(html).toContain('Tương tác');
  });
});
