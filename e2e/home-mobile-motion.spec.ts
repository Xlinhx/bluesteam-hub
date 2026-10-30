import { test, expect, type Page } from '@playwright/test';
test.skip(({ isMobile }) => !isMobile, 'Run with the Home mobile device projects.');

async function openHome(page: Page, role: 'teacher' | 'student') {
  await page.setViewportSize({ width: 390, height: 650 });
  const response = await page.request.post('/api/v1/auth/login', {
    data: role === 'teacher'
      ? { role, email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' }
      : { role, email: 'hocsinh', password: 'hocsinh' },
  });
  expect(response.ok()).toBeTruthy();
  await page.addInitScript(() => {
    (window as any).__homeMobileCalls = [];
    (window as any).__homeMobileArrivals = [];
    (window as any).__homeMobileSnapshots = 0;
    const snapshot = document.startViewTransition?.bind(document);
    if (snapshot) document.startViewTransition = ((update: any) => {
      (window as any).__homeMobileSnapshots++;
      return snapshot(update);
    }) as typeof document.startViewTransition;
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (this.closest('.learner-home,.teacher-home')) (window as any).__homeMobileCalls.push({
        target: this.className.toString(), options,
      });
      const animation = animate.call(this, frames, options);
      if (this.matches('.bluesteam-role-shell main')) (window as any).__homeMobileArrivals.push(animation);
      return animation;
    };
  });
  await page.goto(role === 'teacher' ? '/teacher' : '/home');
  await expect(page.locator('.home-primary')).toBeVisible();
}

for (const role of ['teacher', 'student'] as const) {
  test(`${role}: mobile artwork below the fold reveals once when reached`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await openHome(page, role);
    await expect.poll(() => page.evaluate(() => (window as any).__homeMobileCalls.length)).toBeGreaterThan(8);
    const count = () => page.evaluate(() => (window as any).__homeMobileCalls.filter((call: any) => call.target === 'home-shortcut-label').length);
    expect(await count()).toBe(0);
    await page.locator('.home-shortcut').scrollIntoViewIfNeeded();
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(count, { timeout: 3000 }).toBe(1);
    // Sample actual moving layers; the button remains a stationary touch target.
    const button = page.locator('.home-shortcut');
    const before = await button.boundingBox();
    const image = button.locator('img');
    await image.evaluate(el => (el as HTMLImageElement).decode());
    await page.screenshot({ path: info.outputPath(`${role}-scroll-reveal.png`) });
    const after = await button.boundingBox();
    expect(Math.abs(before!.y - after!.y)).toBeLessThan(1);
    await page.evaluate(() => scrollTo(0, 0));
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    expect(await count()).toBe(1);
    await expect.poll(() => page.evaluate(() => document.getAnimations().filter(a => {
      const el = (a.effect as KeyframeEffect)?.target;
      return el instanceof Element && el.closest('.home-shortcuts') && a.playState === 'running';
    }).length)).toBe(0);
    expect(errors).toEqual([]);
  });

  test(`${role}: coarse-pointer press animates artwork without moving its hit box`, async ({ page }) => {
    await openHome(page, role);
    const card = page.locator(role === 'teacher' ? '.teacher-home-domains > button' : '.home-selector').first();
    await card.scrollIntoViewIfNeeded();
    // First contact cancels the opening choreography before inspecting press feedback.
    await page.locator('.home-feature-copy,.teacher-home-copy').dispatchEvent('pointerdown', { pointerType: 'touch' });
    const rect = await card.boundingBox();
    await page.mouse.move(rect!.x + rect!.width / 2, rect!.y + rect!.height / 2);
    await page.mouse.down();
    await expect.poll(() => card.locator('img').evaluate(el => Number(getComputedStyle(el).scale))).toBeGreaterThan(1.01);
    const pressed = await card.boundingBox();
    expect(pressed).toEqual(rect);
    await page.mouse.move(1, 1); await page.mouse.up();
    await expect(card.locator('img')).toHaveCSS('scale', '1');
  });

  test(`${role}: mobile reduced motion, rotation and touch navigation stay usable`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openHome(page, role);
    await page.locator('.home-shortcut').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => (window as any).__homeMobileCalls.length)).toBe(0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const [width, height] of [[844, 390], [320, 740], [430, 932]]) {
      await page.setViewportSize({ width, height });
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    }
    await page.locator('.home-primary').scrollIntoViewIfNeeded();
    await page.locator('.home-primary').tap();
    await expect(page).toHaveURL(role === 'teacher' ? /\/teacher\/interactive$/ : /\/interactive\/3d$/);
    await expect.poll(() => page.evaluate(() => (window as any).__homeMobileArrivals.length)).toBeGreaterThan(0);
    expect(await page.evaluate(() => (window as any).__homeMobileSnapshots)).toBe(0);
    // The first new input cancels the arrival, including its main-surface fade.
    await page.keyboard.press('Escape');
    await expect(page.locator('html')).not.toHaveAttribute('data-home-journey');
    expect(await page.evaluate(() => (window as any).__homeMobileArrivals.every((a: Animation) => a.playState !== 'running'))).toBe(true);
    await page.goBack();
    await expect(page.locator('.home-primary')).toBeVisible();
  });
}
