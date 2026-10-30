import { test, expect } from '@playwright/test';

test('role changes retain keyboard focus and clear credentials in the new account space', async ({ page }) => {
  await page.goto('/login?role=teacher');
  await page.getByLabel('Email giáo viên', { exact: true }).fill('teacher@example.com');
  const student = page.getByRole('button', { name: 'Học sinh', exact: true });
  await student.focus();
  await student.press('Enter');
  await expect(student).toBeFocused();
  await expect(page.getByLabel('Email phụ huynh', { exact: true })).toHaveValue('');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Đăng nhập cho bé');
});

test('turning reduced motion on settles artwork already following the pointer', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.landing-hero');
  const box = (await hero.boundingBox())!;
  await page.mouse.move(box.x + box.width * .85, box.y + box.height * .6);
  await expect.poll(() => page.locator('.landing-hero-object').evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.landing-hero-object')).toHaveCSS('transform', 'none');
  expect(await page.locator('.editorial-landing').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
});

for (const width of [1440, 390]) {
  test(`public flow remains usable at ${width}px with reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/entry');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('main').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
    await page.getByRole('button', { name: 'Khám phá cùng bé', exact: true }).click();
    await expect(page).toHaveURL(/\/login\?role=student$/);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page.getByLabel('Email phụ huynh', { exact: true })).toBeFocused();
    await expect(page.getByLabel('Email phụ huynh', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    await page.getByRole('button', { name: 'Đăng ký ngay' }).click();
    await expect(page.getByLabel('Tên bé', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('rapid role and mode changes, including history back, settle on the current selection', async ({ page }) => {
  await page.goto('/login?role=teacher');
  for (const role of ['Học sinh', 'Giáo viên', 'Học sinh']) {
    await page.getByRole('button', { name: role, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Đăng ký ngay' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Đăng ký cho bé');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Đăng nhập cho bé');
  await expect(page.locator('[name=displayName]')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  // Viewport acknowledgement can precede the browser's resize event and render frame.
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(await page.locator('.account-page').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test('content and controls work when the Web Animations API is unavailable', async ({ page }) => {
  await page.addInitScript(() => { Element.prototype.animate = undefined as unknown as typeof Element.prototype.animate; });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.locator('.public-header-actions a[href="/entry"]').click();
  await page.getByRole('button', { name: 'Không gian giáo viên', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Đăng nhập giáo viên');
  expect(errors).toEqual([]);
});

test('form transition starts at the current field position after validation changes the layout', async ({ page }) => {
  // Fallback geometry is independent of the native snapshot path covered separately.
  await page.addInitScript(() => { (document as any).startViewTransition = undefined; });
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/register?role=teacher');
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
  await expect(page.getByLabel('Email giáo viên', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect.poll(() => page.locator('.account-page').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
  const before = await page.locator('#account-email').evaluate(el => el.closest('.account-field')!.getBoundingClientRect().top);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.locator('.account-page')).toHaveAttribute('data-mode', 'login');
  const geometry = await page.locator('#account-email').evaluate(el => {
    const field = el.closest('.account-field')!;
    const animation = field.getAnimations()[0];
    if (!animation) return { origin: null };
    animation.pause(); animation.currentTime = 0;
    return { origin: field.getBoundingClientRect().top };
  });
  expect(geometry.origin).not.toBeNull();
  expect(Math.abs(before - geometry.origin!)).toBeLessThan(2);
});
