import { expect, test } from '@playwright/test';

for (const role of ['teacher', 'student'] as const) {
  test(`${role} catalog search returns focus after clearing the query`, async ({ page }) => {
    const login = await page.request.post('/api/v1/auth/login', {
      data: role === 'teacher'
        ? { role, email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' }
        : { role, email: 'hocsinh', password: 'hocsinh' },
    });
    expect(login.ok()).toBe(true);
    await page.goto(role === 'teacher' ? '/teacher/resources' : '/resources');

    const search = page.getByRole('searchbox', { name: 'Tìm học liệu', exact: true }).first();
    await search.fill('cá');
    await page.getByRole('button', { name: 'Xóa tìm học liệu', exact: true }).first().click({ timeout: 5000 });
    await expect(search).toHaveValue('');
    await expect(search).toBeFocused();
    await page.keyboard.type('san ho');
    await expect(search).toHaveValue('san ho');
  });
}
