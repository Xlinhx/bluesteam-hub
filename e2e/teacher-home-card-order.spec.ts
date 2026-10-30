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
});
