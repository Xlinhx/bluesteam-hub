import { expect, test } from '@playwright/test';

test('Home uses quiet pearl surfaces and role-specific decorative layers', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of ['/home', '/teacher']) {
    await page.goto(route);
    const shell = page.locator('.home-hub-shell');
    await expect(shell).toHaveCSS('background-color', 'rgb(250, 248, 245)');
    await expect(shell).toHaveCSS('color', 'rgb(18, 56, 75)');
    await expect(page.locator('.bluesteam-header-audio')).toHaveCount(0);
    const copy = page.locator('.home-split-copy');
    await expect(copy).toHaveCSS('background-color', 'rgb(253, 252, 250)');
    const layers = await copy.evaluate(el => {
      const wash = getComputedStyle(el, '::before');
      return { image: wash.backgroundImage, pointer: wash.pointerEvents, animation: wash.animationName };
    });
    expect(layers.image).toContain('home-watercolor-edge-v1.webp');
    expect(layers.image).toContain('home-watercolor-cove-v1.webp');
    expect(layers.pointer).toBe('none');
    expect(layers.animation).toBe('none');
    await expect(page.locator('.home-scene-curtain')).toHaveCount(0);
    await expect(page.locator('.home-shortcut-label').first()).toHaveCSS('background-color', 'rgb(253, 252, 250)');
    {
      const backdrop = await page.locator(route === '/teacher' ? '.teacher-home' : '.learner-home').evaluate(el => {
        const style = getComputedStyle(el);
        return { color: style.backgroundColor, images: style.backgroundImage };
      });
      expect(backdrop.color).toBe('rgb(230, 244, 249)');
      expect(backdrop.images).toContain('home-watercolor-ribbon-v1.webp');
      expect(backdrop.images).toContain('home-watercolor-cove-v1.webp');
      if (route === '/teacher') await expect(page.locator('[data-home-data]')).toHaveCSS('background-color', 'rgb(253, 252, 250)');
    }
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
    await page.screenshot({ path: `artifacts/home-background-design/implemented-${route.slice(1)}-desktop.png`, fullPage: true });
  }
  for (const name of ['edge', 'cove', 'ribbon']) {
    const asset = await request.get(`/assets/generated/home/home-watercolor-${name}-v1.webp`);
    expect(asset.status()).toBe(200);
    expect(asset.headers()['content-type']).toContain('image/webp');
    expect((await asset.body()).length).toBeLessThan(250_000);
  }
  await page.goto('/resources');
  await expect(page.locator('.bluesteam-header-audio')).toHaveCount(1);
  await expect(page.locator('.home-hub-shell')).toHaveCount(0);
});

test('mobile Home keeps the last action clear of fixed navigation when scrolled to the end', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of ['/home', '/teacher']) {
    await page.goto(route);
    await expect(page.locator(route === '/teacher' ? '.teacher-home' : '.learner-home')).toHaveCSS('background-color', 'rgb(230, 244, 249)');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const lastAction = route === '/home'
      ? page.locator('.home-shortcut').last()
      : page.locator('[data-home-data]');
    const rect = await lastAction.boundingBox();
    expect(rect!.y + rect!.height).toBeLessThanOrEqual(740 - 68);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
    await page.screenshot({ path: `artifacts/home-background-design/implemented-${route.slice(1)}-mobile.png`, fullPage: true });
  }
});
