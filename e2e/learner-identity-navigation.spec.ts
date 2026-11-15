import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, role: 'student' | 'teacher') {
  await page.goto(`/login?role=${role}`);
  const account = role === 'student' ? 'hocsinh' : 'giaovien';
  await page.locator('[name=email]').fill(account);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(account);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(role === 'student' ? /\/home$/ : /\/teacher$/);
}

test('learner can browse twenty avatars, cancel changes, and persist a coastal animal', async ({ page }) => {
  await login(page, 'student');
  const identity = page.getByRole('button', { name: 'Đổi tên và ảnh đại diện', exact: true });
  const originalSrc = await identity.locator('img').getAttribute('src');
  await identity.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Tên của bé', { exact: true })).toBeVisible();
  const keys = new Set<string>();
  for (let i = 0; i < 3; i++) {
    for (const key of await dialog.locator('.animal-option img').evaluateAll(images => images.map(img => img.getAttribute('data-avatar')!))) keys.add(key);
    if (i < 2) await dialog.getByRole('button', { name: 'Trang con vật tiếp theo', exact: true }).click();
  }
  expect(keys.size).toBe(20);
  await expect(dialog.getByRole('button', { name: 'Trang con vật tiếp theo', exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Dưới biển', exact: true }).click();
  await expect(dialog.getByRole('status')).toHaveText('14 bạn · Trang 1/2');
  await dialog.getByRole('button', { name: 'Trang con vật tiếp theo', exact: true }).click();
  await expect(dialog.locator('.animal-option')).toHaveCount(6);
  await dialog.getByRole('button', { name: 'Ao hồ', exact: true }).click();
  await expect(dialog.locator('.animal-option')).toHaveCount(3);
  await dialog.getByRole('button', { name: 'Ven biển', exact: true }).click();
  await expect(dialog.locator('.animal-option')).toHaveCount(3);
  await dialog.getByRole('button', { name: 'Rái cá', exact: true }).click();
  await dialog.getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(identity.locator('img')).toHaveAttribute('src', originalSrc!);
  await identity.click();
  await dialog.getByRole('button', { name: 'Ven biển', exact: true }).click();
  await dialog.getByRole('button', { name: 'Rái cá', exact: true }).click();
  await dialog.getByLabel('Tên của bé', { exact: true }).fill('Bé Mây');
  await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
  await page.reload();
  await expect(identity.locator('img')).toHaveAttribute('src', /chibi\/avatar-otter.webp$/);
  await expect(page.locator('.bluesteam-header-name')).toHaveText('Bé Mây');
  await identity.click();
  await expect(dialog.getByRole('button', { name: 'Rái cá', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(dialog.getByRole('status')).toHaveText('20 bạn · Trang 2/3');
});

test('desktop navigation has the requested order, gamepad icon and ocean learning destination', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page, 'student');
  const nav = page.getByRole('navigation', { name: 'Điều hướng học sinh', exact: true });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('button')).toHaveText(['Trang chủ', 'Học liệu', 'Học tập', 'Tương tác', 'Sáng tạo', 'Hồ sơ']);
  await expect(nav.locator('[data-nav-key=interactive] svg')).toHaveClass(/lucide-gamepad-2/);
  for (const label of ['3D', 'Học liệu', 'Trò chơi']) await expect(page.getByRole('tab', { name: label, exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Học liệu', exact: true }).click();
  await expect(page.getByTestId('home-feature-action')).toHaveText('Mở học liệu');
  await nav.getByRole('button', { name: 'Học tập', exact: true }).click();
  await expect(page).toHaveURL(/\/learning$/);
  await expect(page.getByRole('heading', { name: 'Chọn đường khám phá', exact: true })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Học tập', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Theo chiều dọc', exact: true })).toBeVisible();
});

test('six mobile menu targets and avatar controls fit small screens', async ({ page }) => {
  await login(page, 'student');
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    const nav = page.getByRole('navigation', { name: 'Điều hướng chính di động', exact: true });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('button')).toHaveText(['Trang chủ', 'Học liệu', 'Học tập', 'Tương tác', 'Sáng tạo', 'Hồ sơ']);
    for (const button of await nav.getByRole('button').all()) {
      await expect(button).toBeInViewport();
      const bounds = await button.boundingBox();
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole('button', { name: 'Đổi tên và ảnh đại diện', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Dưới biển', exact: true }).click();
    await expect(dialog.locator('.animal-option')).toHaveCount(8);
    for (const button of await dialog.locator('.animal-option').all()) expect((await button.boundingBox())!.width).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await dialog.getByRole('button', { name: 'Hủy', exact: true }).click();
  }
});

test('teacher picker shows adult variants and persists species keys through the account API', async ({ page }) => {
  await login(page, 'teacher');
  const original = (await (await page.request.get('/api/v1/auth/me')).json()).teacher;
  try {
    const legacy = await page.request.patch('/api/v1/auth/me', { data: { displayName: original.displayName, avatarKey: 'dog', avatarMediaId: null } });
    expect(legacy.ok()).toBe(true);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Đổi tên và ảnh giáo viên', exact: true }).locator('img')).toHaveAttribute('src', '/assets/generated/profile/teacher-3d/avatar-otter.webp');
    await page.getByRole('button', { name: 'Đổi tên và ảnh giáo viên', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Hình có sẵn', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Rái cá', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await dialog.getByRole('button', { name: 'Ven biển', exact: true }).click();
    await dialog.getByRole('button', { name: 'Hải cẩu', exact: true }).click();
    await dialog.getByRole('button', { name: /Lưu/, exact: false }).click();
    await expect(dialog).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Đổi tên và ảnh giáo viên', exact: true }).locator('img')).toHaveAttribute('src', '/assets/generated/profile/teacher-3d/avatar-seal.webp');
    const saved = (await (await page.request.get('/api/v1/auth/me')).json()).teacher;
    expect(saved.avatarKey).toBe('seal');
    const invalid = await page.request.patch('/api/v1/auth/me', { data: { displayName: saved.displayName, avatarKey: 'unknown-animal', avatarMediaId: null } });
    expect(invalid.status()).toBe(400);
  } finally {
    expect((await page.request.patch('/api/v1/auth/me', { data: { displayName: original.displayName, avatarKey: original.avatarKey, avatarMediaId: original.avatarMediaId } })).ok()).toBe(true);
  }
});
