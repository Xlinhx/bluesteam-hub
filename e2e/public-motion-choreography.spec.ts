import { test, expect } from '@playwright/test';

// Inspect the actual browser timelines before they can finish; avoid screenshot timing guesses.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    (window as any).__publicMotion = [];
    Element.prototype.animate = function (frames, options) {
      (window as any).__publicMotion.push({
        target: this.className instanceof SVGAnimatedString ? this.className.baseVal : this.className,
        duration: typeof options === 'number' ? options : options?.duration,
        delay: typeof options === 'object' ? options.delay || 0 : 0,
      });
      return animate.call(this, frames, options);
    };
  });
});

test('entry connects image, persona and features on a slower readable timeline', async ({ page }) => {
  await page.goto('/entry');
  const motion = await page.evaluate(() => (window as any).__publicMotion as { target: string; duration: number; delay: number }[]);
  for (const target of ['entry-role-art', 'entry-persona', 'entry-feature']) {
    expect(motion.some(a => a.target.includes(target) && a.duration >= 850)).toBe(true);
  }
  const art = motion.find(a => a.target.includes('entry-role-art'))!;
  const badge = motion.find(a => a.target.includes('entry-persona'))!;
  expect(badge.delay).toBeGreaterThan(art.delay);
  await page.getByRole('button', { name: 'Khám phá cùng bé', exact: true }).focus();
  expect(await page.locator('.entry-page').evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.constructor.name === 'Animation').length)).toBe(0);
});

test('login connects the coastal image, identity and form without disabling input', async ({ page }) => {
  await page.goto('/login');
  const motion = await page.evaluate(() => (window as any).__publicMotion as { target: string; duration: number; delay: number }[]);
  for (const target of ['account-coast-image', 'account-logo', 'account-description', 'account-input-wrap']) {
    expect(motion.some(a => a.target.includes(target) && a.duration >= 750)).toBe(true);
  }
  await expect(page.getByLabel('Email giáo viên', { exact: true })).toBeEnabled();
  await page.getByLabel('Email giáo viên', { exact: true }).fill('test@example.com');
  await expect(page.getByLabel('Email giáo viên', { exact: true })).toHaveValue('test@example.com');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.account-page').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test('entry composes drawn currents, coral and measured card connections over several seconds', async ({ page }) => {
  await page.goto('/entry');
  await expect.poll(() => page.locator('.entry-page img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await expect(page.locator('.entry-backdrop img')).toHaveAttribute('src', '/assets/generated/public-fieldwork/marine-field-station.webp');
  const motion = await page.evaluate(() => (window as any).__publicMotion as { target: string; duration: number; delay: number }[]);
  expect(Math.max(...motion.map(a => a.duration + a.delay))).toBeGreaterThanOrEqual(4000);
  await expect(page.locator('.fieldwork-current path')).toHaveCount(7);
  await expect(page.locator('.entry-connections path')).toHaveCount(6);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.locator('.entry-connections path').evaluateAll(paths => paths.every(path => {
      const length = (path as SVGPathElement).getTotalLength();
      return length > 10 && Number.isFinite(length);
    }))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('selected role photo owns the forward and reverse native page transition', async ({ page }) => {
  await page.addInitScript(() => {
    const doc = document as any;
    if (!doc.startViewTransition) return;
    const start = doc.startViewTransition.bind(doc);
    (window as any).__journeySnapshots = [];
    doc.startViewTransition = (update: () => void) => {
      const transition = start(update);
      transition.ready.then(() => {
        (window as any).__journeySnapshots.push({
          direction: document.documentElement.dataset.publicJourney,
          role: document.documentElement.dataset.publicRole,
          name: getComputedStyle(document.querySelector('.account-coast-image,.entry-role-card[data-role=student] .entry-role-art')).viewTransitionName,
          imageOnly: !document.querySelector('.account-coast-image')?.contains(document.querySelector('.account-logo')),
        });
      }).catch(() => {});
      return transition;
    };
  });
  await page.goto('/entry');
  test.skip(!await page.evaluate(() => 'startViewTransition' in document), 'Browser has no native snapshots');
  await page.getByRole('button', { name: 'Khám phá cùng bé', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?role=student$/);
  await expect(page.locator('.account-main')).toHaveCSS('background-color', 'rgb(250, 248, 245)');
  await expect.poll(() => page.evaluate(() => (window as any).__journeySnapshots.length)).toBe(1);
  expect(await page.evaluate(() => (window as any).__journeySnapshots[0])).toEqual({ direction: 'forward', role: 'student', name: 'public-art', imageOnly: true });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.publicJourney)).toBeUndefined();
  expect(await page.locator('.account-coast-image,#account-title').evaluateAll(elements => elements.flatMap(element => element.getAnimations()).filter(animation => animation.constructor.name === 'Animation').length)).toBe(0);
  expect(await page.locator('.fieldwork-current path,.fieldwork-chart').evaluateAll(elements => elements.flatMap(element => element.getAnimations()).filter(animation => animation.constructor.name === 'Animation').length)).toBe(0);
  await page.goBack();
  await expect.poll(() => page.evaluate(() => (window as any).__journeySnapshots.length)).toBe(2);
  expect(await page.evaluate(() => (window as any).__journeySnapshots[1].direction)).toBe('back');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length)).toBe(0);
});

test('changing account role keeps the established scenery at rest', async ({ page }) => {
  await page.goto('/login?role=teacher');
  await page.getByRole('button', { name: 'Học sinh', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Đăng nhập cho bé');
  expect(await page.locator('.account-coast-image,.ocean-fieldwork').evaluateAll(elements =>
    elements.flatMap(element => element.getAnimations({ subtree: true })).filter(animation => animation.constructor.name === 'Animation').length,
  )).toBe(0);
});
