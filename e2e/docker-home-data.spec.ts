import { expect, test } from '@playwright/test';

// Run against the existing Docker deployment; no request interception or local web server.
test('Docker API reports its database ready through the frontend proxy', async ({ request }) => {
  const response = await request.get('/api/v1/health/ready');
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ status: 'ready', checks: { database: 'up', mediaStorage: 'writable' } });
});


test('authenticated Homes retain their content and fit mobile and desktop', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email giáo viên' }).fill(process.env.E2E_TEACHER_EMAIL || 'colinh@bluesteam.edu.vn');
  await page.getByRole('textbox', { name: 'Mật khẩu', exact: true }).fill(process.env.E2E_TEACHER_PASSWORD || 'daiduong2026');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/teacher$/);
  for (const width of [320, 375, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/home', '/teacher']) {
      await page.goto(route);
      await expect(page.locator('.home-hub-shell')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(page.locator('.home-shortcuts button')).toHaveCount(1);
    }
  }
});
