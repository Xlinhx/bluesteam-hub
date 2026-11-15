import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  const account = await page.request.post('/api/v1/auth/register', { data: {
    role: 'student', email: `${crypto.randomUUID()}@example.test`, password: 'Ocean-test-123', displayName: 'Bé Na',
  } });
  expect(account.status()).toBe(201);
});

test('drags through one coastline, zooms to a species and retains progress', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/learning');
  const world = page.getByRole('region', { name: 'Học tập' });
  const terrain = world.locator('[data-camera]');
  const flycam = await world.locator('.learning-map-art').getAttribute('src');
  await expect(world.getByRole('button', { name: 'Phóng to' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Bờ biển', exact: true }).click();
  await expect(world).toHaveAttribute('data-point-count', '62');
  await expect(terrain).toHaveAttribute('data-photo', 'ready');
  const overview = await terrain.getAttribute('data-camera');
  const backdrop = await page.locator('.learning-map-art').getAttribute('src');
  expect(backdrop).not.toBe(flycam);
  await page.mouse.move(820, 410);
  await page.mouse.wheel(130, 0);
  await expect(terrain).not.toHaveAttribute('data-camera', overview!);
  const afterWheel = await terrain.getAttribute('data-camera');
  await page.mouse.down();
  await page.mouse.move(600, 330, { steps: 14 });
  await page.mouse.up();
  await expect(terrain).not.toHaveAttribute('data-camera', afterWheel!);
  await expect(page.locator('.learning-map-art')).toHaveAttribute('src', backdrop!);
  await expect(page).toHaveURL(/spot=shore$/);
  await page.getByRole('button', { name: 'Giới thiệu', exact: true }).click();
  const audio = page.waitForResponse(response => response.url().endsWith('/intro-shore.mp3') && response.ok());
  await page.getByRole('button', { name: 'Nghe giới thiệu' }).click();
  expect((await audio).headers()['content-type']).toContain('audio/mpeg');
  await page.getByRole('button', { name: 'Đóng giới thiệu' }).click();
  await page.getByRole('navigation', { name: 'Điểm khám phá' }).getByRole('button', { name: 'Vũng triều', exact: true }).click();
  await expect(world.locator('.learning-map-art')).toHaveAttribute('src', backdrop!);
  await page.getByRole('button', { name: 'Phóng to' }).click();
  await page.getByRole('button', { name: 'Phóng to' }).click();
  await page.getByLabel('Nhóm sinh vật').selectOption('Động vật – Thân mềm');
  const beforeCard = await terrain.getAttribute('data-camera');
  await page.getByRole('button', { name: 'Hàu', exact: true }).click();
  await page.getByRole('button', { name: 'Đánh dấu đã học' }).click();
  await expect(page.getByRole('status').getByText('ĐÃ HỌC')).toBeVisible();
  await page.getByRole('button', { name: 'Đóng thẻ sinh vật' }).click();
  await expect(terrain).toHaveAttribute('data-camera', beforeCard!);
  await page.getByRole('button', { name: 'Hàu', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('status').getByText('ĐÃ HỌC')).toBeVisible();
});

test('supports the depth view and catalogue at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/learning');
  await page.getByRole('button', { name: 'Mục lục' }).click();
  await page.getByRole('group', { name: 'Học liệu', exact: true }).getByRole('button', { name: 'Học liệu', exact: true }).click({ timeout: 5000 });
  await page.getByLabel('Tìm sinh vật').fill('thiếu mắt xích');
  await expect(page.getByRole('button', { name: /Rong sụn.*thiếu mắt xích/ })).toContainText('ô trống');
  await page.getByRole('button', { name: 'Đóng mục lục' }).click();
  await page.getByRole('button', { name: 'Chiều dọc' }).click();
  await page.getByRole('button', { name: 'Vùng nước giữa', exact: true }).click();
  const world = page.getByRole('region', { name: 'Học tập' });
  await expect(world).toHaveAttribute('data-point-count', '20');
  await expect(page.locator('.learning-map-art')).toHaveAttribute('src', /habitat-midwater/);
  const camera = world.locator('[data-camera]');
  const before = (await camera.getAttribute('data-camera'))!.split(',').map(Number);
  const touch = await page.context().newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 130, y: 380, id: 1 }, { x: 260, y: 480, id: 2 }] });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 80, y: 340, id: 1 }, { x: 310, y: 520, id: 2 }] });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(async () => Number((await camera.getAttribute('data-camera'))!.split(',')[2])).toBeGreaterThan(before[2]);
  await page.getByRole('button', { name: 'Cá đèn', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Cá đèn.*Myctophidae/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('returns from a catalogue card to the same page without losing the search', async ({ page }) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/learning?axis=horizontal&view=world&spot=dunes');
  await page.getByRole('button', { name: 'Mục lục', exact: true }).click();
  const library = page.locator('.learning-world-library');
  await expect(library.locator('.learning-world-tile')).toHaveCount(6);
  const results = (await library.locator('.learning-library-results').boundingBox())!;
  const lastTile = (await library.locator('.learning-world-tile').last().boundingBox())!;
  expect(lastTile.y + lastTile.height).toBeLessThanOrEqual(results.y + results.height + 1);
  await library.getByRole('button', { name: 'Trang tiếp theo' }).click();
  await expect(library.getByLabel('Phân trang')).toContainText('7–12');
  const item = library.locator('.learning-world-tile').first();
  const title = (await item.locator('strong').innerText()).trim();
  await library.getByRole('button', { name: title, exact: true }).click();
  await expect(library.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await library.getByRole('button', { name: 'Về mục lục', exact: true }).click();
  await expect(library.getByLabel('Phân trang')).toContainText('7–12');
  await library.getByLabel('Tìm sinh vật').fill('muống');
  await library.getByRole('button', { name: 'Muống biển', exact: true }).click();
  await library.getByRole('button', { name: 'Về mục lục', exact: true }).click();
  await expect(library.getByRole('textbox', { name: 'Tìm sinh vật', exact: true })).toHaveValue('muống');
  await expect(library.locator('.learning-world-tile')).toHaveCount(1);
});

test('opens a microscope at the sand sample and keeps the dunes camera', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/learning');
  await page.getByRole('button', { name: 'Khu vực cồn cát', exact: true }).click();
  const camera = page.locator('[data-camera]');
  const position = await camera.getAttribute('data-camera');
  await page.getByRole('button', { name: 'Mẫu cát ẩm', exact: true }).click();
  const lens = page.getByRole('region', { name: 'Kính quan sát mẫu cát ẩm' });
  await expect(lens.getByRole('img')).toBeVisible();
  await lens.getByRole('button', { name: 'Giun tròn sống trong cát' }).click();
  await expect(page.getByRole('heading', { name: 'Giun tròn sống trong cát' })).toBeVisible();
  await expect(camera).toHaveAttribute('data-camera', position!);
  await page.getByRole('button', { name: 'Đóng thẻ sinh vật' }).click();
  await expect(lens).toBeVisible();
  await expect(camera).toHaveAttribute('data-camera', position!);
});

test('keeps the reading action inside the catalogue on laptop and phone', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [{ width: 1366, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/learning?axis=horizontal&view=world&spot=dunes&organism=dunes-2');
    await page.getByRole('button', { name: 'Mục lục', exact: true }).click();
    const library = page.locator('.learning-world-library');
    const action = library.getByRole('button', { name: 'Đánh dấu đã học', exact: true });
    await expect(action).toBeInViewport({ ratio: 1 });
    const panel = (await library.boundingBox())!;
    const button = (await action.boundingBox())!;
    expect(button.y + button.height).toBeLessThanOrEqual(panel.y + panel.height);
    await library.locator('.learning-world-reader-body article').last().scrollIntoViewIfNeeded();
    await expect(action).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  }
});

test('pans a proportionate depth overview and keeps the catalogue beside its selected card', async ({ page }) => {
  await page.setViewportSize({ width: 1880, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/learning?axis=vertical');
  const camera = page.locator('[data-camera]');
  await expect(camera).toHaveAttribute('data-photo', 'ready');
  const before = (await camera.getAttribute('data-camera'))!.split(',').map(Number);
  const proportions = await page.locator('.learning-map-art').evaluate((image: HTMLImageElement) => {
    const box = image.getBoundingClientRect();
    return Math.abs(box.width / box.height - image.naturalWidth / image.naturalHeight);
  });
  expect(proportions).toBeLessThan(0.005);
  await page.mouse.move(800, 500);
  await page.mouse.wheel(140, 480);
  await expect.poll(async () => Number((await camera.getAttribute('data-camera'))!.split(',')[1])).toBeGreaterThan(before[1] + 300);
  await page.getByRole('navigation', { name: 'Tầng nước biển' }).getByRole('button', { name: /Vùng nước giữa/ }).click();
  await expect(page.locator('.learning-map-art')).toHaveAttribute('src', /habitat-midwater/);
  const localCamera = (await camera.getAttribute('data-camera'))!.split(',').map(Number);
  await page.mouse.move(900, 450);
  await page.mouse.down();
  await page.mouse.move(760, 350, { steps: 10 });
  await page.mouse.up();
  await expect.poll(async () => Number((await camera.getAttribute('data-camera'))!.split(',')[1])).toBeGreaterThan(localCamera[1]);
  await page.goto('/learning?axis=horizontal&view=world&spot=dunes');
  await page.getByRole('button', { name: 'Mục lục', exact: true }).click();
  const library = page.locator('.learning-world-library');
  await library.getByRole('button', { name: 'Muống biển', exact: true }).click();
  await expect(library.getByRole('heading', { name: 'Muống biển', exact: true })).toBeVisible();
  const catalogue = (await library.locator('.learning-world-catalog').boundingBox())!;
  const detail = (await library.locator('.learning-world-reader').boundingBox())!;
  expect(catalogue.x + catalogue.width).toBeLessThanOrEqual(detail.x + 2);
  await library.getByRole('button', { name: 'Đóng thẻ sinh vật' }).click();
  await expect(library).toBeVisible();
  await expect(page).not.toHaveURL(/organism=/);
  await page.goto('/learning?axis=horizontal&view=world&spot=dunes&organism=dunes-15');
  const crab = page.getByRole('button', { name: 'Cua ma', exact: true });
  await expect(crab).toHaveAttribute('data-selected', 'true');
  const crabPoint = (await crab.boundingBox())!;
  const crabCard = (await page.locator('.learning-map-reader .learning-world-reader').boundingBox())!;
  expect(crabPoint.x + crabPoint.width).toBeLessThan(crabCard.x);
});
