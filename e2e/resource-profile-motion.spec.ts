import { test, expect, type Page } from '@playwright/test';
import { seedLocalProfile } from './fixtures/local-profile';

async function learner(page: Page) {
  expect((await page.request.post('/api/v1/auth/login', { data: { role: 'student', email: 'hocsinh', password: 'hocsinh' } })).ok()).toBe(true);
  await page.goto('/resources');
}

test('learner bookmark, chooser, detail return and mobile reduced motion remain usable', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await learner(page);
  const save = page.getByRole('button', { name: /^Lưu / }).first();
  await expect(save).toBeVisible();
  const bookmarkRequests: string[] = [];
  const trackCatalog = (request: import('@playwright/test').Request) => { if (/\/api\/v1\/(resources|resource-groups)\?/.test(request.url())) bookmarkRequests.push(request.url()); };
  page.on('request', trackCatalog);
  await save.click();
  await expect(page.getByRole('button', { name: /^Bỏ lưu / }).first()).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  page.off('request', trackCatalog);
  expect(bookmarkRequests).toEqual([]);
  const chooser = page.getByRole('button', { name: 'Chọn nhóm học liệu', exact: true });
  await chooser.click(); await expect(page.locator('dialog[open]')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.locator('dialog[open]')).toHaveCount(0); await expect(chooser).toBeFocused();
  const open = page.getByRole('button', { name: /^Mở học liệu:/ }).first();
  const title = await open.getAttribute('aria-label');
  await open.click(); await expect(page).toHaveURL(/\/resources\//); await page.goBack();
  await expect(page.getByRole('button', { name: title!, exact: true }).first()).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  await chooser.click(); await expect(page.locator('dialog[open]')).toBeVisible();
  expect(await page.locator('dialog').evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  await page.getByRole('button', { name: 'Đóng chọn nhóm' }).click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('profile uses actual artwork geometry, closes during entrance and restores focus', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await learner(page); await seedLocalProfile(page); await page.goto('/profile');
  const art = page.locator('.profile-art').first(); await expect(art).toBeVisible();
  await page.evaluate(() => {
    const animate = Element.prototype.animate;
    (window as any).__artMotion = [];
    Element.prototype.animate = function (frames, options) {
      if (this.matches('.artwork-full-view')) (window as any).__artMotion.push(frames);
      return animate.call(this, frames, options);
    };
  });
  await art.click(); await expect(page.locator('.artwork-full-view')).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as any).__artMotion.length)).toBeGreaterThan(0);
  const frames = await page.evaluate(() => (window as any).__artMotion[0]);
  expect(frames[0].transform).toMatch(/translate\(.+scale\(/);
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(art).toBeFocused();
  await art.click(); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await art.click(); await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.locator('.artwork-full-view').evaluate(node => node.getAnimations().length)).toBe(0);
  await page.keyboard.press('Escape'); await expect(art).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('closing an unfinished artwork entrance returns to the original thumbnail geometry', async ({ page }) => {
  await learner(page); await seedLocalProfile(page); await page.goto('/profile');
  await page.evaluate(() => {
    const animate = Element.prototype.animate;
    (window as any).__artFrames = [];
    Element.prototype.animate = function (frames, options) {
      const animation = animate.call(this, frames, options);
      if (this.matches('.artwork-full-view')) {
        (window as any).__artFrames.push(frames);
        if ((window as any).__artFrames.length === 1) { animation.pause(); animation.currentTime = 90; }
      }
      return animation;
    };
  });
  await page.locator('.profile-art').first().click();
  await expect.poll(() => page.evaluate(() => (window as any).__artFrames.length)).toBe(1);
  await page.keyboard.press('Escape');
  const frames = await page.evaluate(() => (window as any).__artFrames);
  expect(frames[1][1].transform).toBe(frames[0][0].transform);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('teacher dialogs preserve focus, forms and drawer layout when motion is interrupted', async ({ page }) => {
  expect((await page.request.post('/api/v1/auth/login', { data: { email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' } })).ok()).toBe(true);
  await page.goto('/teacher/resources');
  const add = page.getByRole('button', { name: 'Thêm học liệu', exact: true });
  await add.click(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('textbox', { name: 'Tên học liệu', exact: true }).fill('Chưa lưu');
  page.once('dialog', dialog => { expect(dialog.type()).toBe('confirm'); void dialog.accept(); });
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(add).toBeFocused();
  await add.click(); await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.getByRole('dialog').evaluate(node => node.getAnimations({ subtree: true }).length), { timeout:1000 }).toBe(0);
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 }); await add.click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  const identity = page.getByRole('button', { name: 'Đổi tên và ảnh giáo viên' });
  await identity.click(); await expect(page.getByRole('dialog', { name: 'Hồ sơ giáo viên' })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(identity).toBeFocused();
});

test('cancel buttons use the same exit motion as Escape without saving', async ({ page }) => {
  await learner(page); await page.goto('/profile');
  await page.getByRole('button', { name: 'Đổi tên và hình', exact: true }).click();
  await page.evaluate(() => {
    (window as any).__exitCount = 0;
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (this.matches('.ocean-modal') && typeof options === 'object' && options.fill === 'forwards') (window as any).__exitCount++;
      return animate.call(this, frames, options);
    };
  });
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__exitCount)).toBe(1);
});

test('loading more artworks does not steal focus after the user moves elsewhere', async ({ page }) => {
  await learner(page); await seedLocalProfile(page);
  await page.evaluate(async () => {
    const { creativeStorage } = await import('/src/shared/creative/creativeStorage.ts');
    const original = (await creativeStorage.getCompletedArtworkPage('drawing', { limit: 1 })).items[0];
    for (let index = 0; index < 8; index++) await creativeStorage.saveArtwork({ ...original, id: `motion-more-${index}`, type: 'drawing', title: `Tranh kiểm tra ${index}`, isDraft: false, createdAt: Date.now() + index } as any);
  });
  await page.goto('/profile');
  const drawings = page.locator('[data-artwork-section=drawing]');
  await expect(drawings.locator('.profile-art')).toHaveCount(6);
  await page.evaluate(async () => {
    const { creativeStorage } = await import('/src/shared/creative/creativeStorage.ts');
    const read = creativeStorage.getCompletedArtworkPage.bind(creativeStorage);
    creativeStorage.getCompletedArtworkPage = async (kind, options) => {
      if (options?.cursor) await new Promise<void>(resolve => { (window as any).__releaseMore = resolve; });
      return read(kind, options);
    };
  });
  await drawings.locator('.profile-show-more').click();
  await expect.poll(() => page.evaluate(() => typeof (window as any).__releaseMore)).toBe('function');
  const other = page.getByRole('button', { name: 'Bắt đầu sáng tạo', exact: true });
  await other.focus();
  await page.evaluate(() => (window as any).__releaseMore());
  await expect(drawings.locator('.profile-art')).toHaveCount(10);
  await expect(other).toBeFocused();
});

test('album changes remain immediate during repeated input and reduced motion changes', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await learner(page);
  const catalog = await (await page.request.get('/api/v1/resources?kind=visual&limit=1')).json();
  const item = await (await page.request.get(`/api/v1/resources/${catalog.items[0].id}`)).json();
  const album = ['/assets/generated/craft/child_crayon_turtle.jpg', '/assets/generated/craft/artwork_crayon_coral.png'];
  await page.route(`**/api/v1/resources/${item.id}`, route => route.fulfill({ json: { ...item, content: { ...item.content, albumUrls: album } } }));
  await page.goto(`/resources/${item.id}`);
  const image = page.locator('.observation-photo > img');
  await expect(image).toHaveAttribute('src', album[0]);
  await page.getByRole('button', { name: 'Ảnh tiếp theo', exact: true }).click();
  await expect(image).toHaveAttribute('src', album[1]);
  await page.getByRole('button', { name: 'Ảnh trước', exact: true }).click();
  await expect(image).toHaveAttribute('src', album[0]);
  expect(await image.evaluate(node => node.getAnimations().length)).toBeLessThanOrEqual(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // CDP updates the media setting before the browser dispatches its change event.
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect.poll(() => image.evaluate(node => node.getAnimations().length), { timeout: 1000 }).toBe(0);
  await page.getByRole('button', { name: 'Ảnh tiếp theo', exact: true }).click();
  await expect(image).toHaveAttribute('src', album[1]);
  expect(await image.evaluate(node => node.getAnimations().length)).toBe(0);
  expect(errors).toEqual([]);
});

test('membership feedback waits for success and uses the committing button, not an unrelated click', async ({ page }) => {
  // This spatial assertion requires the sidebar destination and committing
  // control to be visible together; narrow-screen interactions have separate cases.
  await page.setViewportSize({width:1440,height:900});
  expect((await page.request.post('/api/v1/auth/login', { data: { email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' } })).ok()).toBe(true);
  const result = await (await page.request.get('/api/v1/teacher/resource-groups?limit=6')).json();
  const group = { ...result.items[0], isSeed: false };
  await page.route('**/api/v1/teacher/resource-groups?**', route => route.fulfill({ json: { items: [group], total: 1, nextCursor: null } }));
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(`**/api/v1/teacher/resource-groups/${group.id}/members`, async route => { await gate; await route.fulfill({ json: { ok: true } }); });
  await page.goto('/teacher/resources');
  await expect(page.locator('.teacher-resource-table-wrap[aria-busy=false]')).toBeVisible();
  await page.locator('tbody input[type=checkbox]').first().check();
  await page.locator('.resource-target-trigger').click();
  await page.locator('.teacher-group-picker-list > button').first().click();
  await page.evaluate(() => {
    const animate = Element.prototype.animate;
    (window as any).__transfers = [];
    Element.prototype.animate = function (frames, options) {
      if (this.matches('.resource-transfer-token')) (window as any).__transfers.push(frames);
      return animate.call(this, frames, options);
    };
  });
  const commit = page.getByRole('button', { name: 'Thêm vào nhóm khác', exact: true });
  await commit.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.addEventListener('click',event=>{
    const source=(event.target as Element).closest('[data-resource-transfer]');
    if(source){const rect=source.getBoundingClientRect();(window as any).__commitRect={x:rect.x,y:rect.y,width:rect.width,height:rect.height};}
  },true));
  await commit.click();
  const rect=await page.evaluate(()=>(window as any).__commitRect);
  expect(await page.evaluate(() => (window as any).__transfers.length)).toBe(0);
  await page.getByRole('button', { name: 'Thêm học liệu', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Đóng', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  release();
  await expect(page.locator('.resource-save-notice')).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as any).__transfers.length)).toBe(1);
  const frames = await page.evaluate(() => (window as any).__transfers[0]);
  expect(frames[0].transform).toBe(`translate(${rect.x + rect.width / 2}px, ${rect.y + rect.height / 2}px)`);
  // The same success text/target may recur before the previous highlight expires.
  await expect(page.locator('.teacher-resource-table-wrap[aria-busy=false]')).toBeVisible();
  await page.locator('tbody input[type=checkbox]').first().check();
  await commit.click();
  await expect.poll(() => page.evaluate(() => (window as any).__transfers.length)).toBe(2);
});
