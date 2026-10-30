import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { seedLocalProfile } from './fixtures/local-profile';

const shots = path.resolve('artifacts/verification/profile-rooms');
test.use({ actionTimeout: 15000, viewport: { width: 1440, height: 1000 } });
test.beforeAll(() => fs.mkdirSync(shots, { recursive: true }));
const capture = async (page: Page, name: string) => {
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 3000))]));
  await expect.poll(() => page.locator('img:visible').evaluateAll(images => images.filter(image => !(image as HTMLImageElement).complete || !(image as HTMLImageElement).naturalWidth).map(image => image.getAttribute('src')))).toEqual([]);
  await page.screenshot({ path: path.join(shots, name + '.png'), fullPage: true, animations: 'disabled' });
};
const login = async (page: Page) => {
  const response = await page.request.post('/api/v1/auth/login', { data: { email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' } });
  expect(response.ok()).toBeTruthy();
};
const localArtwork = (page: Page, id: string) => page.evaluate(id => new Promise<any>((resolve, reject) => {
  const open = indexedDB.open('ocean_creative_db');
  open.onerror = () => reject(open.error);
  open.onsuccess = () => { const db = open.result, tx = db.transaction('ocean_artworks'), get = tx.objectStore('ocean_artworks').get(id); get.onsuccess = () => resolve(get.result); get.onerror = () => reject(get.error); tx.oncomplete = () => db.close(); };
}), id);
const fits = async (page: Page) => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();

test('profile shows saved artworks while drafts remain in the creative studio', async ({ page }) => {
  await page.goto('/login?role=student');
  await page.locator('[name=email]').fill('hocsinh');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('hocsinh');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  await seedLocalProfile(page);
  await page.goto('/profile', {waitUntil: 'domcontentloaded'});
  await expect(page.locator('.profile-art')).toHaveCount(3);
  await expect(page.locator('.profile-resume')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Bức tranh đang vẽ' })).toHaveCount(0);
  const draft = await localArtwork(page, 'profile-demo-draft');
  expect(draft.isDraft).toBe(true);
  await page.goto('/creative', {waitUntil: 'domcontentloaded'});
  await page.locator('.creative-progress-item').first().click();
  await expect(page).toHaveURL(/id=profile-demo-draft/);
  expect((await localArtwork(page, 'profile-demo-draft')).drawingData).toEqual(draft.drawingData);
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('ocean_creative_db');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction('ocean_artworks', 'readwrite');
      for (const id of ['profile-demo-turtle', 'profile-demo-coral', 'profile-demo-habitat']) tx.objectStore('ocean_artworks').delete(id);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
  }));
  await page.goto('/profile', {waitUntil: 'domcontentloaded'});
  await expect(page.locator('.profile-section-count')).toHaveText(['0', '0', '0']);
  await expect(page.locator('.profile-art')).toHaveCount(0);
});

test('local identity, artwork download, and both resumable editors preserve real data', async ({ page }) => {
  await page.goto('/login?role=student');
  await page.locator('[name=email]').fill('hocsinh');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('hocsinh');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  await page.goto('/profile', {waitUntil: 'domcontentloaded'});
  await expect(page.locator('.profile-section-count')).toHaveText(['0', '0', '0']);
  await page.getByRole('button', { name: 'Bắt đầu sáng tạo' }).click();
  await expect(page).toHaveURL(/\/creative$/);
  await page.goto('/profile', {waitUntil: 'domcontentloaded'});
  await seedLocalProfile(page);
  await expect(page.locator('.profile-art')).toHaveCount(3);
  await expect(page.locator('.profile-resume')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Bức tranh đang vẽ' })).toHaveCount(0);
  await capture(page, 'P16-learner-profile');
  await page.getByRole('button', { name: 'Đổi tên và hình', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.animal-option')).toHaveCount(8);
  await capture(page, 'P16a-learner-profile-avatar');
  await dialog.getByRole('textbox').fill('Bé Chi');
  await dialog.getByRole('button', { name: 'Sứa', exact: true }).click();
  await dialog.getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Góc của An' })).toBeVisible();
  await page.getByRole('button', { name: 'Đổi tên và hình', exact: true }).click();
  await dialog.getByRole('textbox').fill('Bé Chi');
  await dialog.getByRole('button', { name: 'Sứa', exact: true }).click();
  await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
  await page.reload({waitUntil: 'domcontentloaded'});
  await expect(page.getByRole('heading', { name: 'Góc của Chi' })).toBeVisible();
  await expect(page.locator('.profile-portrait')).toHaveAttribute('data-avatar', 'jellyfish');
  await page.locator('.profile-art').first().click();
  await expect(dialog).toHaveClass(/ocean-modal-full/);
  await expect.poll(() => dialog.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), fillsBackdrop: Math.abs(rect.width - node.parentElement!.clientWidth) <= 1, height: Math.round(rect.height) };
  })).toEqual({x:0,y:0,fillsBackdrop:true,height:1000});
  await expect(dialog.getByText('Đã lưu trên thiết bị', { exact: true })).toBeVisible();
  await capture(page, 'P16b-learner-artwork-detail');
  const download = page.waitForEvent('download');
  await dialog.getByRole('link', { name: 'Tải ảnh' }).click();
  expect((await download).suggestedFilename()).toBe('Bạn rùa của An.jpg');
  await page.keyboard.press('Escape');
  const originalDraft = await localArtwork(page, 'profile-demo-draft');
  await page.goto('/creative', {waitUntil: 'domcontentloaded'});
  await page.locator('.creative-progress-item').first().click();
  await expect(page).toHaveURL(/id=profile-demo-draft/);
  await expect(page.locator('canvas').last()).toBeVisible();
  await expect.poll(() => page.locator('canvas').last().evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let ink = 0; for (let i = 0; i < pixels.length; i += 40) if (pixels[i + 3] > 0 && Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) < 160) ink++;
    return ink;
  })).toBeGreaterThan(100);
  await page.getByRole('button', { name: 'Hoàn thành', exact: true }).click();
  await expect.poll(async () => (await localArtwork(page, 'profile-demo-draft')).isDraft).toBe(false);
  expect((await localArtwork(page, 'profile-demo-draft')).createdAt).toBe(originalDraft.createdAt);
  await page.goto('/profile', {waitUntil: 'domcontentloaded'});
  const originalHabitat = await localArtwork(page, 'profile-demo-habitat');
  const habitatDraftId = await page.evaluate(async source => {
    const { createRevisionDraft } = await import('/src/shared/creative/artworkLifecycle.ts');
    return (await createRevisionDraft(source)).id;
  }, originalHabitat);
  await page.goto('/creative');
  await page.getByRole('button', { name: /Góc biển của An/ }).click();
  await expect(page).toHaveURL(new RegExp('id=' + habitatDraftId));
  await expect(page.locator('canvas').last()).toBeVisible();
  await page.getByRole('button', { name: 'Lưu tiến trình', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đã lưu');
  const savedHabitat = await localArtwork(page, habitatDraftId);
  expect(savedHabitat.habitatData.items).toEqual(expect.arrayContaining([expect.objectContaining({id: 'fixture-rock', assetId: 'rock-arch', x: 0, z: 0})]));
  expect(savedHabitat.previewDataUrl).toMatch(/^data:image\/png/);
  expect(await localArtwork(page, 'profile-demo-habitat')).toEqual(originalHabitat);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/profile', {waitUntil: 'domcontentloaded'});
  await expect(page.locator('.profile-art')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await capture(page, 'profile-mobile');
  await page.locator('.profile-art').first().click();
  expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBeTruthy();
  await page.screenshot({ path: path.join(shots, 'artwork-detail-mobile-top.png'), animations: 'disabled' });
  await dialog.getByRole('link', { name: 'Tải ảnh' }).scrollIntoViewIfNeeded();
  await expect(dialog.getByRole('link', { name: 'Tải ảnh' })).toBeVisible();
  await dialog.getByRole('button', { name: 'In tác phẩm' }).scrollIntoViewIfNeeded();
  await expect(dialog.getByRole('button', { name: 'In tác phẩm' })).toBeVisible();
  await page.screenshot({ path: path.join(shots, 'artwork-detail-mobile.png'), animations: 'disabled' });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('teacher avatar upload preserves its preview and account identity', async ({ page }) => {
  await login(page);
  const original = (await (await page.request.get('/api/v1/auth/me')).json()).teacher;
  try {
  await page.goto('/teacher', {waitUntil: 'domcontentloaded'});
  await page.getByRole('button', { name: 'Đổi tên và ảnh giáo viên' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Tải ảnh', exact: true }).click();
  await dialog.locator('input[type=file]').setInputFiles(path.resolve('public/assets/generated/profile/teacher-linh-portrait.png'));
  await expect(dialog.getByAltText('Ảnh đại diện xem trước')).toHaveAttribute('src', /^data:image/);
  await dialog.getByRole('slider').fill('1.25');
  await page.waitForTimeout(150);
  const preview = await dialog.getByAltText('Ảnh đại diện xem trước').getAttribute('src');
  await capture(page, '07a-teacher-profile-avatar');
  await page.setViewportSize({ width: 390, height: 844 });
  await fits(page);
  await capture(page, 'teacher-avatar-mobile');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await dialog.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(dialog).toHaveCount(0);
  const me = (await (await page.request.get('/api/v1/auth/me')).json()).teacher;
  expect(me.avatarKey).toBeNull();
  const image = await page.request.get(me.avatarUrl);
  const sha = (bytes: Buffer) => crypto.createHash('sha256').update(bytes).digest('hex');
  expect(sha(await image.body())).toBe(sha(Buffer.from(preview!.split(',')[1], 'base64')));
  await page.reload({waitUntil: 'domcontentloaded'});
  await expect(page.getByRole('button', {name:'Đổi tên và ảnh giáo viên'})).toBeVisible();
  } finally {
    expect((await page.request.patch('/api/v1/auth/me', {data:{displayName:original.displayName,avatarKey:original.avatarKey,avatarMediaId:original.avatarMediaId}})).ok()).toBeTruthy();
  }
});
