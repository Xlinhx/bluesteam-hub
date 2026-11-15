import { expect, test } from '@playwright/test';

test('teacher top cards match the learner order, artwork and corresponding teacher tools', async ({ page }) => {
  expect((await page.request.post('/api/v1/auth/login', { data: { role: 'student', email: 'hocsinh', password: 'hocsinh' } })).ok()).toBeTruthy();
  await page.goto('/home');
  await expect(page.locator('.home-selector')).toHaveCount(3);
  const learnerCards = await page.locator('.home-selector').evaluateAll(cards => cards.map(card => ({
    label: card.querySelector('.home-selector-label span')?.textContent,
    image: card.querySelector('img')?.getAttribute('src'),
  })));
  expect(learnerCards.map(card => card.label)).toEqual(['3D', 'Học liệu', 'Trò chơi']);
  expect((await page.request.post('/api/v1/auth/login', { data: { role: 'teacher', email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' } })).ok()).toBeTruthy();
  await page.goto('/teacher');
  const teacherCards = page.locator('.teacher-home-domains > button');
  const teacherData = await teacherCards.evaluateAll(cards => cards.map(card => ({
    label: card.querySelector('.teacher-domain-label span')?.textContent,
    image: card.querySelector('img')?.getAttribute('src'),
  })));
  expect(teacherData).toEqual(learnerCards);
  const destinations = ['/teacher/interactive?kind=model3d', '/teacher/resources', '/teacher/interactive?kind=game'];
  for (let index = 0; index < destinations.length; index++) {
    await page.goto('/teacher');
    await teacherCards.nth(index).click();
    await expect(page).toHaveURL(url => `${url.pathname}${url.search}` === destinations[index]);
  }
  await page.goto('/teacher');
  await expect(page.locator('.teacher-home-shortcuts > button')).toHaveCount(1);
  await expect(page.locator('.teacher-home-shortcuts')).toContainText('Quản lý sáng tạo');
  await expect(page.locator('.teacher-home-shortcuts')).not.toContainText('Phòng sinh hoạt');

  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const nav = page.getByRole('navigation', {
      name: viewport.width < 800 ? 'Điều hướng giáo viên di động' : 'Điều hướng giáo viên',
      exact: true,
    });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('button')).toHaveText([
      'Trang chủ', 'Học liệu', /Học tập.*Sắp có/, 'Tương tác', 'Sáng tạo', 'Hồ sơ',
    ]);
    await expect(nav.getByRole('button', { name: /Học tập/ })).toBeDisabled();
    await expect(nav.getByRole('button', { name: 'Tương tác' }).locator('svg')).toHaveClass(/lucide-gamepad-2/);

    for (const card of await teacherCards.all()) {
      const art = await card.locator('.teacher-domain-art').boundingBox();
      const label = await card.locator('.teacher-domain-label').boundingBox();
      expect(label!.y).toBeGreaterThanOrEqual(art!.y + art!.height);
      expect(label!.height).toBeGreaterThanOrEqual(44);
    }

    const profile = nav.getByRole('button', { name: 'Hồ sơ', exact: true });
    await profile.click();
    const dialog = page.getByRole('dialog', { name: 'Hồ sơ giáo viên' });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/teacher$/);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(profile).toBeFocused();
  }
});
