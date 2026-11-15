import { test, expect } from '@playwright/test';

test('a late login response never takes over a journey the user has left', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let release = () => {};
  const response = new Promise<void>(resolve => { release = resolve; });
  let requested = false;
  let responseAttempted = false;
  await page.route('**/api/v1/auth/login', async route => {
    requested = true; await response;
    try { await route.fulfill({ json: { account: { id: 'audit-delayed', role: 'teacher', displayName: 'Kiểm tra phản hồi muộn', email: 'audit@example.test' } } }); }
    finally { responseAttempted = true; }
  });
  await page.goto('/login');
  await page.getByLabel('Email giáo viên', { exact: true }).fill('audit@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('valid-test-password');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect.poll(() => requested).toBe(true);
  await page.getByRole('button', { name: 'Chọn vai trò', exact: true }).click();
  await expect(page).toHaveURL(/\/entry$/);
  release(); await expect.poll(() => responseAttempted).toBe(true);
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(page).toHaveURL(/\/entry$/);
  expect(await page.evaluate(() => sessionStorage.getItem('bluesteam_teacher_session'))).toBeNull();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hãy bắt đầu cùng Blue STEAM Hub');
});

test('mobile route change never morphs two different labels into one object', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const doc = document as any;
    const start = doc.startViewTransition?.bind(doc);
    if (!start) return;
    doc.startViewTransition = (update: () => void) => {
      const transition = start(update);
      transition.ready.then(() => {
        const rail = document.querySelector('.account-roles');
        (window as any).__mobileRailName = rail ? getComputedStyle(rail).viewTransitionName : 'missing';
      }).catch(() => {});
      return transition;
    };
  });
  await page.goto('/entry');
  test.skip(!await page.evaluate(() => 'startViewTransition' in document), 'Browser has no snapshot API');
  await page.getByRole('button', { name: 'Khám phá cùng bé', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__mobileRailName)).toBe('none');
});

test('mobile form controls remain reachable at touch size and support keyboard entry', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/login');
  for (const name of ['Hiện mật khẩu', 'Chọn vai trò', 'Đăng ký ngay']) {
    const bounds = await page.getByRole('button', { name, exact: true }).boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
  const password = page.getByLabel('Mật khẩu', { exact: true });
  await password.fill('visible-audit');
  await page.getByRole('button', { name: 'Hiện mật khẩu', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await expect(password).toHaveValue('visible-audit');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('decorative light settles into the same resting state without a final jump', async ({ page }) => {
  await page.goto('/entry');
  const states = await page.locator('.fieldwork-wash').first().evaluate(element => {
    const animation = element.getAnimations().find(item => item.constructor.name === 'Animation');
    const effect = animation?.effect as KeyframeEffect | null;
    const frames = effect?.getKeyframes();
    const final = frames?.[frames.length - 1];
    animation?.cancel();
    const resting = getComputedStyle(element);
    return { finalOpacity: Number(final?.opacity), restingOpacity: Number(resting.opacity), restingTransform: resting.transform };
  });
  expect(states.restingOpacity).toBe(states.finalOpacity);
  expect(states.restingTransform).toBe('none');
});

test('expressive entry motion finishes and releases its timelines', async ({ page }) => {
  await page.goto('/entry');
  await expect.poll(() => page.locator('.entry-page').evaluate(root => root.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length), { timeout: 18000, intervals: [250, 500, 1000] }).toBe(0);
  expect(await page.locator('.entry-page').evaluate(root => root.getAnimations({ subtree: true }).length)).toBe(0);
  await page.getByRole('button', { name: 'Khám phá cùng bé', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Đăng nhập cho bé');
  await page.getByLabel('Email phụ huynh', { exact: true }).focus();
  await expect.poll(() => page.locator('.account-page').evaluate(root => root.getAnimations({ subtree: true }).filter(animation => animation.constructor.name === 'Animation').length)).toBe(0);
});

for (const width of [1440, 390]) {
  test(`title stays separated from supporting copy throughout its ${width}px entrance`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (frames, options) {
        const animation = animate.call(this, frames, options);
        if (this.id === 'account-title') { animation.pause(); animation.currentTime = 0; }
        return animation;
      };
    });
    await page.goto('/login');
    const gap = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.querySelector('.account-description')!.getBoundingClientRect().top - document.querySelector('#account-title')!.getBoundingClientRect().bottom;
    });
    expect(gap).toBeGreaterThanOrEqual(4);
  });
}
