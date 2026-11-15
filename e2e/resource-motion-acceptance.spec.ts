import { test, expect, type Page } from '@playwright/test';

async function authenticate(page: Page, teacher = false) {
  const response = await page.request.post('/api/v1/auth/login', { data: teacher ? { role: 'teacher', email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' } : { role: 'student', email: 'hocsinh', password: 'hocsinh' } });
  expect(response.ok()).toBe(true);
}
async function calm(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.oceanTransition || '')).toBe('');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll<HTMLImageElement>('img')].filter(image => image.getBoundingClientRect().top < innerHeight && image.getBoundingClientRect().bottom > 0).map(image => image.decode().catch(() => {})));
    await Promise.all(document.getAnimations().filter(animation => animation.playState === 'running' && Number.isFinite(animation.effect?.getTiming().iterations) && Number(animation.effect?.getTiming().duration) < 3000).map(animation => animation.finished.catch(() => {})));
  });
}
async function fits(page: Page) { expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
async function shot(page: Page, name: string) { await calm(page); await fits(page); await page.screenshot({ path: `artifacts/acceptance-${name}.png` }); }

test('the uploaded image bridges catalog/detail in both directions and back does not replay the shelf', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await authenticate(page); await page.goto('/resources');
  await page.getByRole('button', {name:/^Mở nhóm /}).first().click();
  await expect(page.getByLabel('Danh sách học liệu')).toBeVisible(); await calm(page);
  await page.evaluate(() => {
    (window as any).__shelfEntrances = 0;
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) { if (this.matches('.resource-surface,.resource-group-portrait,.resource-tile-grid article img')) (window as any).__shelfEntrances++; return animate.call(this, frames, options); };
    (window as any).__bridges = [];
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (update: any) => {
      const transition = start(update);
      void transition.ready.then(() => (window as any).__bridges.push({ names: [...document.querySelectorAll('img')].map(image => image.style.viewTransitionName).filter(Boolean), id: document.documentElement.dataset.oceanResource }), () => {});
      return transition;
    };
  });
  const first = page.getByLabel('Danh sách học liệu').locator('article').first();
  const id = await first.getAttribute('data-resource-id');
  await first.getByRole('button', { name: /^Mở học liệu:/ }).first().click();
  await expect(page.locator('.observation-photo')).toBeVisible(); await calm(page);
  let bridges = await page.evaluate(() => (window as any).__bridges);
  expect(bridges[0]).toEqual({ names: ['ocean-resource-image'], id });
  await shot(page, 'learner-observation-desktop');
  await page.goBack(); await expect(first).toBeVisible(); await calm(page);
  bridges = await page.evaluate(() => (window as any).__bridges);
  expect(bridges[1]).toEqual({ names: ['ocean-resource-image'], id });
  expect(await page.evaluate(() => (window as any).__shelfEntrances)).toBe(0);
  expect(await page.locator('[style*="ocean-resource-image"]').count()).toBe(0);
  expect(errors).toEqual([]);
});

test('group selection, search error/retry, empty saved and keyboard focus stay clear', async ({ page }) => {
  await authenticate(page); await page.goto('/resources'); await calm(page);
  const open = page.getByRole('button', { name: 'Chọn nhóm học liệu', exact: true });
  await open.click(); const chooser = page.locator('.resource-group-chooser');
  await expect(chooser.locator('.resource-group-choices button').first()).toBeVisible();
  await shot(page, 'learner-group-chooser');
  await chooser.getByRole('searchbox').fill('khong-co-nhom-nao-998');
  await expect(chooser.getByText('Chưa tìm thấy nhóm. Bé thử tên khác nhé.')).toBeVisible();
  // Native search consumes the first Escape to clear its nonempty value.
  await page.keyboard.press('Escape'); await expect(chooser.getByRole('searchbox')).toHaveValue('');
  await page.keyboard.press('Escape'); await expect(chooser).toHaveCount(0); await expect(open).toBeFocused();
  await page.getByRole('button', {name:/^Mở nhóm /}).first().click();
  await expect(page.locator('.resource-group-heading')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.resource-tile-grid[aria-label] article').first()).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 768 }); await shot(page, 'learner-group-tablet');
  let failure = true;
  await page.route('**/api/v1/resources?**', route => failure ? route.fulfill({ status: 503, json: { code: 'UNAVAILABLE', message: 'Tạm gián đoạn để kiểm tra khả năng thử lại.' } }) : route.continue());
  await page.getByRole('searchbox', { name: 'Tìm học liệu', exact: true }).fill('c');
  await expect(page.getByRole('alert')).toContainText('Tạm gián đoạn');
  failure = false; await page.getByRole('alert').getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.goto('/resources?saved=1');
  await expect(page.locator('.resource-empty')).toContainText('Bé chưa lưu học liệu nào.');
  await page.setViewportSize({ width: 390, height: 844 }); await shot(page, 'learner-empty-saved-mobile');
});

test('teacher workspaces, nested preview and unsaved dialog errors retain data at every width', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await authenticate(page, true); await page.goto('/teacher/resources');
  await expect(page.locator('.teacher-resource-table-wrap')).toHaveAttribute('aria-busy', 'false');
  await page.setViewportSize({ width: 1440, height: 1000 }); await shot(page, 'teacher-library-desktop');
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 768 }); await shot(page, `teacher-library-${width}`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const create = page.getByRole('button', { name: 'Thêm học liệu', exact: true });
  await create.click(); const editor = page.getByRole('dialog', { name: 'Thêm học liệu', exact: true });
  const title = editor.getByRole('textbox', { name: 'Tên học liệu', exact: true });
  await title.fill('Nội dung chưa lưu được giữ nguyên');
  await editor.getByRole('button', { name: 'Xem trước', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Xem học liệu', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Xem học liệu', exact: true })).toHaveCount(0);
  await expect(title).toHaveValue('Nội dung chưa lưu được giữ nguyên');
  await editor.getByRole('tab', { name: 'Nhóm & liên kết', exact: true }).click();
  await shot(page, 'teacher-editor-links');
  await editor.getByRole('tab', { name: 'Nội dung', exact: true }).click();
  const keep = page.waitForEvent('dialog').then(dialog => dialog.dismiss());
  await page.keyboard.press('Escape'); await keep; await expect(editor).toBeVisible();
  const discard = page.waitForEvent('dialog').then(dialog => dialog.accept());
  await editor.getByRole('button', { name: 'Hủy', exact: true }).click(); await discard; await expect(editor).toHaveCount(0);
  await expect(create).toBeFocused();
  await page.getByRole('button', { name: 'Tạo nhóm học liệu', exact: true }).click();
  const group = page.getByRole('dialog', { name: 'Tạo nhóm', exact: true });
  await group.getByRole('textbox', { name: 'Tên nhóm', exact: false }).fill('Nhóm không ghi vào cơ sở dữ liệu');
  await page.route('**/api/v1/teacher/resource-groups', route => route.request().method() === 'POST' ? route.fulfill({ status: 503, json: { code: 'UNAVAILABLE', message: 'Chưa lưu được nhóm trong lần thử này.' } }) : route.continue());
  await group.getByRole('button', { name: 'Tạo nhóm', exact: true }).click();
  await expect(group.getByRole('alert')).toContainText('Chưa lưu được nhóm');
  await expect(group.getByRole('textbox', { name: 'Tên nhóm', exact: false })).toHaveValue('Nhóm không ghi vào cơ sở dữ liệu');
  await page.setViewportSize({ width: 390, height: 844 });
  await group.getByRole('alert').scrollIntoViewIfNeeded(); await expect(group.getByRole('alert')).toBeInViewport();
  await shot(page, 'teacher-group-error-mobile');
  page.once('dialog', dialog => dialog.accept()); await page.keyboard.press('Escape');
  await expect(group).toHaveCount(0);
  await page.getByRole('button', { name: 'Đổi tên và ảnh giáo viên' }).click();
  await shot(page, 'teacher-identity-mobile'); await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});

test('background session verification preserves a live chooser and draft on focus or temporary network failure', async ({ page }) => {
  await authenticate(page, true); await page.goto('/teacher/resources');
  await expect(page.locator('.teacher-resource-table-wrap')).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('button', { name: 'Thêm học liệu', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Thêm học liệu', exact: true });
  const input = editor.getByRole('textbox', { name: 'Tên học liệu', exact: true });
  await input.fill('Bản đang sửa không được mất khi kiểm tra phiên');
  await page.route('**/api/v1/auth/session', route => route.fulfill({ status: 503, json: { code: 'UNAVAILABLE', message: 'Temporary test outage' } }));
  const response = page.waitForResponse('**/api/v1/auth/session');
  await page.evaluate(() => window.dispatchEvent(new Event('focus'))); await response;
  await expect(input).toHaveValue('Bản đang sửa không được mất khi kiểm tra phiên');
  await page.unroute('**/api/v1/auth/session');
  const retry = page.waitForResponse('**/api/v1/auth/session');
  await page.evaluate(() => window.dispatchEvent(new Event('focus'))); await retry;
  await expect(input).toHaveValue('Bản đang sửa không được mất khi kiểm tra phiên');
  await page.route('**/api/v1/auth/session', route => route.fulfill({ status: 401, json: { code: 'UNAUTHORIZED', message: 'Expired test session' } }));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page).toHaveURL(/\/login\?role=teacher/);
  await expect(editor).toHaveCount(0);
});

test('disabled animation and mid-navigation cancellation keep all content usable', async ({ page }) => {
  await authenticate(page); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/resources'); await expect(page.locator('.resource-group-section').first()).toBeVisible();
  expect(await page.locator('.resource-library').evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Hồ sơ', exact: true }).first().click();
  await expect(page.locator('.learner-profile')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Học liệu', exact: true }).first().click();
  await expect(page.locator('.resource-library')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.oceanTransition || '')).toBe('');
  expect(await page.evaluate(() => document.documentElement.dataset.oceanResource)).toBeUndefined();
  await page.evaluate(() => { (Element.prototype as any).animate = undefined; });
  await page.getByRole('button', { name: 'Chọn nhóm học liệu', exact: true }).click();
  await expect(page.locator('dialog[open]')).toBeVisible(); await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 }); await fits(page);
});
