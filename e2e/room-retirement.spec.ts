import { test, expect } from '@playwright/test';

test('retired room routes return 404 without room requests, while retained pages remain usable', async ({ page }) => {
  const roomRequests: string[] = [];
  page.on('request', request => { if (/\/api\/v1\/(?:teacher\/)?rooms(?:\/|\?|$)|socket\.io/.test(request.url())) roomRequests.push(request.url()); });
  for (const route of ['/join','/teacher/rooms','/teacher/rooms/123','/room/123','/teacher/live','/teacher/results','/room/123/present']) {
    await page.goto(route);
    await expect(page.getByText('Mã lỗi 404')).toBeVisible();
  }
  await page.goto('/home');
  await expect(page.getByRole('heading', {name:'Cùng khám phá đại dương'})).toBeVisible();
  await expect(page.getByRole('button', {name:/Vào lớp|Phòng học|Tạo phòng/})).toHaveCount(0);
  await page.goto('/profile');
  await expect(page.getByRole('button', {name:'Đổi tên và hình',exact:true})).toBeVisible();
  await page.goto('/teacher');
  await expect(page.getByRole('heading', {name:'Không gian của cô'})).toBeVisible();
  await expect(page.locator('header [data-nav-key="rooms"]')).toHaveCount(0);
  await expect(page.getByRole('button', {name:'Đổi tên và ảnh giáo viên'})).toBeVisible();
  for (const route of ['/resources','/interactive','/creative','/teacher/resources','/teacher/interactive','/teacher/creative']) {
    await page.goto(route);
    await expect(page.getByText('Mã lỗi 404')).toHaveCount(0);
    await expect(page.locator('main')).toBeVisible();
  }
  await page.goto('/presentation?step=2');
  await expect(page.getByText(/Bước 2\/5/)).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText(/Bước 3\/5/)).toBeVisible();
  expect(roomRequests).toEqual([]);
});

test('Docker gallery keeps author identity, notes and authorized downloads without room filters', async ({page}) => {
  expect((await page.request.post('/api/v1/auth/login',{data:{email:'colinh@bluesteam.edu.vn',password:'daiduong2026'}})).ok()).toBeTruthy();
  const response = await page.request.get('/api/v1/teacher/artworks?limit=100');
  expect(response.ok()).toBeTruthy();
  const {items,total} = await response.json();
  expect(total).toBeGreaterThanOrEqual(26);
  expect(items[0].participantAlias).toBeTruthy();
  await page.goto('/teacher/creative?tab=artworks');
  await expect(page.locator('.creative-template')).toHaveCount(Math.min(total,6));
  await expect(page.getByRole('combobox',{name:/phòng/i})).toHaveCount(0);
  const item = items.find((art: {teacherNote:string|null}) => art.teacherNote !== null);
  expect(item).toBeTruthy();
  await page.goto('/teacher/creative?tab=artworks&artworkId='+item.id);
  await expect(page.locator('textarea')).toBeVisible();
  const before = await page.locator('textarea').inputValue();
  const note = 'Ghi chú xác minh bảo toàn tác phẩm';
  try {
    expect((await page.request.put('/api/v1/teacher/artworks/'+item.id+'/note',{data:{note}})).ok()).toBeTruthy();
    await page.reload();
    await expect(page.locator('textarea')).toHaveValue(note);
    expect((await page.request.get('/api/v1/teacher/artworks/'+item.id+'/download')).ok()).toBeTruthy();
  } finally {
    expect((await page.request.put('/api/v1/teacher/artworks/'+item.id+'/note',{data:{note:before}})).ok()).toBeTruthy();
  }
});
