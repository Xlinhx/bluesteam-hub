import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { InteractiveWorldArtwork } from '../src/shared/ui/navigation/InteractiveWorldArtwork';
import { INTERACTIVE_ARTWORK, INTERACTIVE_BACKDROP } from '../src/shared/data/interactiveArtwork';
import { TEACHER_AVATARS } from '../src/shared/data/teacherAvatars';
import type { InteractiveCategoryKind } from '../src/shared/data/categoryArtworkMap';
import { LivingOceanLandingPage } from '../src/domains/public/landing/LivingOceanLandingPage';
import { I18nProvider } from '../src/shared/i18n/I18nContext';
import { RouterProvider } from '../src/app/router';

describe('Production artwork survives repository cleanup', () => {
  it('retains both responsive renditions of every rendered landing artwork', () => {
    const html = renderToStaticMarkup(<I18nProvider><RouterProvider><LivingOceanLandingPage /></RouterProvider></I18nProvider>);
    const urls = [...new Set(html.match(/\/assets\/[^"\s,]+\.webp/g) || [])];
    expect(urls.length).toBeGreaterThanOrEqual(6);
    for (const url of urls) expect(existsSync(`public${url}`), url).toBe(true);
  });

  it('retains assets referenced by the HTML entry, including the browser favicon', () => {
    const html = readFileSync('index.html', 'utf8');
    const urls = html.match(/\/assets\/[^"\s]+/g) || [];
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(existsSync(`public${url}`), url).toBe(true);
  });

  it('resolves every image used by the rendered interactive worlds, including computed sprite URLs', () => {
    for (const kind of Object.keys(INTERACTIVE_ARTWORK) as InteractiveCategoryKind[]) {
      const html = renderToStaticMarkup(<InteractiveWorldArtwork kind={kind} />);
      const urls = html.match(/\/assets\/[^"\s)]+\.webp/g) || [];
      expect(urls.length).toBeGreaterThan(0);
      for (const url of urls) expect(existsSync(`public${url}`), url).toBe(true);
    }
  });

  it('retains canonical backdrops, category artwork and persisted teacher avatar variants', () => {
    const urls = [
      ...Object.values(INTERACTIVE_ARTWORK),
      ...INTERACTIVE_BACKDROP.flatMap(layer => [layer.src, layer.mobile]),
      ...TEACHER_AVATARS.map(avatar => avatar.imageSrc),
    ];
    for (const url of urls) expect(existsSync(`public${url}`), url).toBe(true);
  });
});
