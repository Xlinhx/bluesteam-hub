import { test, expect } from '@playwright/test';

test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

test('mobile landing gives its artwork and shell study a deliberate readable entrance', async ({ page }) => {
  await page.goto('/');
  const duration = (selector: string) => page.locator(selector).evaluate(element =>
    element.getAnimations().filter(animation => animation.constructor.name === 'Animation').map(animation => Number(animation.effect?.getTiming().duration)));
  expect(await duration('.landing-hero-art')).toEqual([2000]);
  expect(await duration('.shell-spiral')).toEqual([2600]);
  await page.locator('.landing-jelly-scene').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.jellyfish-study path').evaluateAll(paths => paths.filter(path => path.getAnimations().length > 0).length)).toBeGreaterThan(10);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.editorial-landing').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
});

for (const width of [320, 360]) {
  test(`small mobile landing keeps every header control inside ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Mở menu điều hướng' })).toBeInViewport();
    const action = page.locator('.public-header-actions .public-join');
    const bounds = (await action.boundingBox())!;
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    await action.tap();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hãy bắt đầu cùng Blue STEAM Hub');
  });
}

for (const [width, height] of [[320, 568], [360, 800], [390, 844], [430, 932], [640, 360]]) {
  test(`mobile coast keeps its scenery and readable form at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/login?role=student');
    const coast = page.locator('.account-coast');
    await expect(coast).toBeVisible();
    const bounds = (await coast.boundingBox())!;
    expect(bounds.height).toBeGreaterThanOrEqual(150);
    expect(bounds.height).toBeLessThanOrEqual(250);
    await expect(coast.locator('.account-logo')).toBeVisible();
    await expect(coast.locator('.fieldwork-current')).toBeVisible();
    await expect(coast.locator('.fieldwork-coral')).toBeVisible();
    await expect(page.locator('#account-email')).toHaveCSS('font-size', '16px');
    await page.getByLabel('Email phụ huynh', { exact: true }).fill('mobile@example.test');
    await page.getByLabel('Mật khẩu', { exact: true }).fill('mobile-password');
    await page.setViewportSize({ width, height: Math.min(height, 420) });
    await page.locator('#account-password').scrollIntoViewIfNeeded();
    await expect(page.locator('#account-password')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const role of ['student', 'teacher']) {
  test(`mobile ${role} photograph connects to the coastal header and back`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      const doc = document as any;
      const start = doc.startViewTransition.bind(doc);
      (window as any).__mobileArt = [];
      doc.startViewTransition = (update: () => void) => {
        const selected = document.activeElement?.closest('.entry-role-card');
        const source = selected?.querySelector('.entry-role-art') || document.querySelector('.account-coast-image');
        const before = source && getComputedStyle(source).viewTransitionName;
        const transition = start(update);
        transition.ready.then(() => {
          const target = document.querySelector('.account-coast-image') || document.querySelector(`.entry-role-card[data-role="${document.documentElement.dataset.publicRole}"] .entry-role-art`);
          (window as any).__mobileArt.push({ before, after: target && getComputedStyle(target).viewTransitionName });
        }).catch(() => {});
        return transition;
      };
    });
    await page.goto('/entry');
    await page.locator(`.entry-role-card[data-role=${role}] .entry-role-action`).tap();
    await expect.poll(() => page.evaluate(() => (window as any).__mobileArt)).toEqual([{ before: 'public-art', after: 'public-art' }]);
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.publicJourney)).toBeUndefined();
    await expect(page.locator('.account-coast')).toBeInViewport();
    await page.getByRole('button', { name: 'Chọn vai trò', exact: true }).tap();
    await expect.poll(() => page.evaluate(() => (window as any).__mobileArt.length)).toBe(2);
    expect(errors).toEqual([]);
  });
}

test('mobile form waits for its travelling photograph before revealing copy', async ({ page }) => {
  await page.addInitScript(() => {
    const doc = document as any;
    const start = doc.startViewTransition.bind(doc);
    doc.startViewTransition = (update: () => void) => {
      const transition = start(update);
      transition.ready.then(() => {
        const animation = document.getAnimations().find(item => (item.effect as KeyframeEffect)?.pseudoElement === '::view-transition-new(public-form-copy)');
        (window as any).__mobileCopyFound = !!animation;
        (window as any).__mobileCoastOverlays = ['.account-logo', '.account-coast-copy'].map(selector => getComputedStyle(document.querySelector(selector)!).viewTransitionName);
        if (animation) { animation.pause(); animation.currentTime = 850; }
        (window as any).__mobileCopyOpacity = getComputedStyle(document.documentElement, '::view-transition-new(public-form-copy)').opacity;
        animation?.play();
      }).catch(() => {});
      return transition;
    };
  });
  await page.goto('/entry');
  await page.locator('.entry-role-card[data-role=student] .entry-role-action').tap();
  await expect.poll(() => page.evaluate(() => (window as any).__mobileCopyFound)).toBe(true);
  expect(await page.evaluate(() => (window as any).__mobileCoastOverlays)).toEqual(['public-brand', 'public-coast-copy']);
  await expect.poll(() => page.evaluate(() => (window as any).__mobileCopyOpacity)).toBe('0');
});

test('touching a mobile field interrupts the scenic transition immediately', async ({ page }) => {
  await page.goto('/entry');
  await page.locator('.entry-role-card[data-role=student] .entry-role-action').tap();
  await page.getByLabel('Email phụ huynh', { exact: true }).focus();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.publicJourney), { timeout: 750, intervals: [50, 100] }).toBeUndefined();
  await page.getByLabel('Email phụ huynh', { exact: true }).fill('interrupt@example.test');
  await expect(page.getByLabel('Email phụ huynh', { exact: true })).toHaveValue('interrupt@example.test');
});

for (const throughLanding of [false, true]) {
test(`the second mobile role introduces its objects after ${throughLanding ? 'landing navigation' : 'direct entry'}`, async ({ page }) => {
  await page.goto(throughLanding ? '/' : '/entry');
  if (throughLanding) {
    await page.locator('.public-header-actions a[href="/entry"]').tap();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.publicJourney)).toBeUndefined();
  }
  await page.waitForTimeout(4500);
  const teacher = page.locator('.entry-role-card[data-role=teacher]');
  expect(await teacher.locator('.entry-role-art img').evaluate(element => element.getAnimations().length)).toBe(0);
  await teacher.scrollIntoViewIfNeeded();
  await expect.poll(() => teacher.locator('.entry-role-art img').evaluate(element => element.getAnimations().filter(animation => animation.constructor.name === 'Animation').length)).toBe(1);
  await expect.poll(() => teacher.locator('.entry-connections path').first().evaluate(element => element.getAnimations().length)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await teacher.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
});
}

test('reduced motion keeps the complete mobile scene and reachable registration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/register?role=student');
  await expect(page.locator('.account-coast')).toBeVisible();
  expect(await page.locator('.account-page').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  await page.getByLabel('Tên bé', { exact: true }).fill('Bé Na');
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).tap();
  await expect(page.getByLabel('Email phụ huynh', { exact: true })).toBeFocused();
  await expect(page.getByLabel('Email phụ huynh', { exact: true })).toBeInViewport();
});

test('landscape phones retain readable fields without iOS focus zoom or clipping', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/login?role=student');
  await expect(page.locator('.account-coast')).toBeVisible();
  await expect(page.locator('#account-email')).toHaveCSS('font-size', '16px');
  await page.getByLabel('Email phụ huynh', { exact: true }).fill('landscape@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('landscape-password');
  await page.locator('#account-password').scrollIntoViewIfNeeded();
  await expect(page.locator('#account-password')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
