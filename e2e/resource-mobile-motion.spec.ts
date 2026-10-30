import { test, expect, type Page } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
async function login(page: Page) {
  expect((await page.request.post('/api/v1/auth/login', { data: { role: 'student', email: 'hocsinh', password: 'hocsinh' } })).ok()).toBe(true);
}

test('touch mobile keeps layered choreography, immediate taps and spatial image navigation', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    (window as any).__mobileCast = []; (window as any).__mobileEntrances = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      const animation = animate.call(this, frames, options);
      (window as any).__mobileCast.push({ classes: this.getAttribute('class'), frames, duration: typeof options === 'object' ? options.duration : options });
      if (this.closest('.resource-library') && typeof options === 'object' && Number(options.duration) >= 700) {
        animation.pause(); (window as any).__mobileEntrances.push(animation);
      }
      return animation;
    };
  });
  await login(page); await page.goto('/resources');
  await expect(page.locator('.resource-group-section')).toHaveCount(3);
  await expect.poll(() => page.evaluate(() => (window as any).__mobileCast.some((item: any) => item.classes === 'ocean-cabinet-reef'))).toBe(true);
  const cast = await page.evaluate(() => (window as any).__mobileCast);
  const reef = cast.find((item: any) => item.classes === 'ocean-cabinet-reef');
  expect(reef.duration).toBe(1150);
  expect(reef.frames[0].transform).toContain('rotate(');
  const surface = cast.find((item: any) => item.classes === 'resources-banner-art');
  expect(surface.frames[0].clipPath).toBe('inset(82% 0 0 0 round 36px)');
  expect(cast.some((item: any) => item.frames[0]?.strokeDashoffset === '1' && item.duration === 1500)).toBe(true);
  await page.locator('.ocean-cabinet-reef').first().evaluate((image: HTMLImageElement) => image.decode());
  for (const time of [180, 650]) {
    await page.evaluate(time => { for (const animation of (window as any).__mobileEntrances as Animation[]) animation.currentTime = Number(animation.effect?.getTiming().delay || 0) + time; }, time);
    await page.screenshot({ path: `artifacts/mobile-motion-library-${time}.png` });
  }
  const save = page.getByRole('button', { name: /^Lưu / }).first();
  await save.tap(); await expect(page.getByRole('button', { name: /^Bỏ lưu / }).first()).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => { for (const animation of (window as any).__mobileEntrances as Animation[]) { try { animation.finish(); } catch {} } });
  const choose = page.getByRole('button', { name: 'Chọn nhóm học liệu', exact: true });
  await choose.tap(); await expect(page.locator('dialog[open]')).toBeVisible();
  expect(await page.locator('.resource-library').evaluate(node => node.getAnimations({ subtree: true }).filter(animation => !(animation instanceof CSSAnimation) && animation.effect instanceof KeyframeEffect && animation.effect.target instanceof Element && !animation.effect.target.closest('dialog')).map(animation => ({ type: animation.constructor.name, target: (animation.effect as KeyframeEffect).target?.getAttribute('class') })))).toEqual([]);
  await expect(page.locator('.resource-current-pulse')).toHaveCount(0);
  await page.getByRole('button', { name: 'Đóng chọn nhóm' }).tap(); await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.evaluate(() => {
    (window as any).__touchBridge = false;
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (update: any) => {
      const transition = start(update);
      void transition.ready.then(() => { (window as any).__touchBridge = !!document.querySelector('[style*="ocean-resource-image"]'); }, () => {});
      return transition;
    };
  });
  await page.getByRole('button', { name: /^Mở học liệu:/ }).first().tap();
  await expect(page.locator('.observation-photo')).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as any).__touchBridge)).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.oceanTransition || '')).toBe('');
  await page.getByRole('button', { name: 'Hồ sơ', exact: true }).tap();
  await expect(page.locator('.profile-collection-section')).toHaveCount(3);
  await expect.poll(() => page.evaluate(() => (window as any).__mobileCast.some((item: any) => item.classes === 'ocean-cabinet-reef' && item.duration === 1250))).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.oceanTransition || '')).toBe('');
  expect(errors).toEqual([]);
});

test('touch mobile reduced motion keeps content and tap feedback usable without decorative motion', async ({ page }) => {
  await login(page); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/resources');
  await expect(page.locator('.resource-group-section')).toHaveCount(3);
  expect(await page.locator('.resource-library').evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  await page.getByRole('button', { name: 'Chọn nhóm học liệu', exact: true }).tap();
  await expect(page.locator('dialog[open]')).toBeVisible(); await expect(page.locator('.resource-current-pulse')).toHaveCount(0);
  await page.getByRole('button', { name: 'Đóng chọn nhóm' }).tap(); await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test('group chooser keeps its position while delayed results arrive', async ({ page }) => {
  await login(page); await page.goto('/resources');
  await expect(page.locator('.resource-group-section')).toHaveCount(3);
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/v1/resource-groups?**', async route => { await pending; await route.continue(); });
  await page.getByRole('button', { name: 'Chọn nhóm học liệu', exact: true }).tap();
  const dialog = page.locator('dialog[open]');
  await expect(dialog.getByRole('button', {name:'Đóng chọn nhóm'})).toBeFocused();
  await expect(dialog.getByRole('status')).toBeVisible();
  await dialog.evaluate(async node => { await new Promise(requestAnimationFrame); await Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => {}))); });
  const before = (await dialog.boundingBox())!;
  release();
  await expect(dialog.locator('.resource-group-choices button').first()).toBeVisible();
  const after = (await dialog.boundingBox())!;
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);
});

test('dialog taps activate once, scrolling stays scrolling and keyboard activation remains native', async ({ page }) => {
  await login(page); await page.goto('/resources'); await expect(page.locator('.resource-group-section')).toHaveCount(3);
  await page.evaluate(() => {
    (window as any).__dialogActivations = 0;
    document.addEventListener('click', event => { if ((event.target as Element).closest('.resource-group-select')) (window as any).__dialogActivations++; });
  });
  const choose = page.getByRole('button', { name: 'Chọn nhóm học liệu', exact: true });
  for (let count = 1; count <= 2; count++) {
    await choose.tap(); await expect(page.locator('dialog[open]')).toBeVisible();
    await page.getByRole('button', { name: 'Đóng chọn nhóm' }).tap(); await expect(page.locator('dialog[open]')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).__dialogActivations)).toBe(count);
    await expect(choose).toBeFocused();
  }
  await choose.press('Enter'); await expect(page.locator('dialog[open]')).toBeVisible();
  expect(await page.evaluate(() => (window as any).__dialogActivations)).toBe(3);
  await page.keyboard.press('Escape'); await expect(page.locator('dialog[open]')).toHaveCount(0);
  await choose.scrollIntoViewIfNeeded();
  const box = (await choose.boundingBox())!, before = await page.evaluate(() => scrollY);
  const cdp = await page.context().newCDPSession(page);
  const x = Math.round(box.x + box.width / 2), y = Math.round(box.y + box.height / 2);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 6; step++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 24 }] }); await page.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__dialogActivations)).toBe(3);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
});
