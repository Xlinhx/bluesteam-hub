import { test, expect, type Page } from '@playwright/test';

async function login(page: Page) {
  expect((await page.request.post('/api/v1/auth/login', { data: { role: 'student', email: 'hocsinh', password: 'hocsinh' } })).ok()).toBe(true);
}
async function settled(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.race([Promise.all([...document.images].filter(image => image.getBoundingClientRect().top < innerHeight && image.getBoundingClientRect().bottom > 0).map(image => image.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 1500))]);
    await Promise.all(document.getAnimations().filter(a => Number.isFinite(a.effect?.getTiming().iterations) && Number(a.effect?.getTiming().duration) < 3000).map(a => a.finished.catch(() => {})));
  });
}
async function screenshot(page: Page, name: string) {
  await settled(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `artifacts/acceptance-${name}.png`, fullPage: await page.getByRole('dialog').count() === 0 });
}

test('profile handles storage recovery, all collection kinds, pagination, invalid previews and local identity persistence', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await login(page);
  await page.addInitScript(() => {
    const open = IDBFactory.prototype.open;
    (window as any).__storageUnavailable = !sessionStorage.getItem('acceptance-storage-recovered');
    IDBFactory.prototype.open = function (...args: Parameters<IDBFactory['open']>) {
      if ((window as any).__storageUnavailable) throw new DOMException('Storage unavailable during recovery test', 'SecurityError');
      return open.apply(this, args);
    };
  });
  await page.goto('/profile');
  await expect(page.locator('.profile-read-error [role=alert]')).toBeVisible();
  await page.evaluate(() => { (window as any).__storageUnavailable = false; sessionStorage.setItem('acceptance-storage-recovered', 'true'); });
  await page.locator('.profile-read-error').getByRole('button', { name: 'Thử lại ngay', exact: true }).click();
  await expect(page.locator('.profile-section-empty')).toHaveCount(3);
  await screenshot(page, 'profile-empty');
  await page.evaluate(async () => {
    const image = await (await fetch('/assets/generated/craft/child_crayon_turtle.jpg')).blob();
    const preview = await new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(image); });
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('ocean_creative_db'); request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result, transaction = db.transaction('ocean_artworks', 'readwrite');
        for (const type of ['drawing', 'scan', 'habitat']) for (let index = 0; index < (type === 'drawing' ? 8 : 1); index++) {
          const now = Date.now() - index, id = `acceptance-${type}-${index}`;
          transaction.objectStore('ocean_artworks').put({ id, type, title: type === 'scan' ? 'Ảnh không còn đọc được' : `Tác phẩm ${type} ${index + 1}`, createdAt: now, completedAt: now, isDraft: false, __collectionKey: [type, -now, id], previewDataUrl: type === 'scan' ? 'data:image/png;base64,broken' : preview, submissionState: 'local_only' });
        }
        transaction.oncomplete = () => { db.close(); resolve(); }; transaction.onerror = () => reject(transaction.error);
      };
    });
    window.dispatchEvent(new Event('bluesteam:creative-artworks-changed'));
  });
  const drawings = page.locator('[data-artwork-section=drawing]');
  await expect(drawings.locator('.profile-art')).toHaveCount(6);
  await drawings.locator('.profile-show-more').click();
  await expect(drawings.locator('.profile-art')).toHaveCount(8);
  await expect(drawings.locator('.profile-art').nth(6)).toBeFocused();
  await screenshot(page, 'profile-populated');
  const first = drawings.locator('.profile-art').first();
  await first.click();
  const viewer = page.getByRole('dialog');
  const download = viewer.getByRole('link', { name: 'Tải ảnh', exact: true });
  await expect(download).toBeVisible();
  const file = page.waitForEvent('download'); await download.click();
  expect((await file).suggestedFilename()).toMatch(/\.jpg$/);
  await page.setViewportSize({ width: 390, height: 844 }); await screenshot(page, 'profile-viewer-mobile');
  const viewerGeometry=await viewer.evaluate(node=>({y:node.getBoundingClientRect().y,height:node.getBoundingClientRect().height,backdrop:node.parentElement?.getBoundingClientRect().height,viewport:innerHeight,visual:visualViewport?.height,cssHeight:getComputedStyle(node).height}));
  expect(viewerGeometry.y,JSON.stringify(viewerGeometry)).toBe(0);
  await page.keyboard.press('Escape'); await expect(viewer).toHaveCount(0); await expect(first).toBeFocused();
  await page.locator('[data-artwork-section=scan] .profile-art').click();
  await expect(viewer.locator('.artwork-preview-error')).toBeVisible();
  await expect(viewer.getByRole('button', { name: 'Tải ảnh', exact: true })).toBeDisabled();
  await expect(viewer.getByRole('button', { name: 'In tác phẩm', exact: true })).toBeDisabled();
  await screenshot(page, 'profile-invalid-preview-mobile'); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Đổi tên và hình', exact: true }).click();
  const identity = page.getByRole('dialog', { name: 'Tên và hình của con' });
  await identity.getByRole('textbox', { name: 'Tên của con' }).fill('Bé Khám Phá');
  await identity.locator('.animal-option').nth(1).click();
  const avatar = await identity.locator('.animal-option[aria-pressed=true] img').getAttribute('data-avatar');
  await screenshot(page, 'profile-identity-mobile');
  await identity.getByRole('button', { name: 'Lưu', exact: true }).click();
  await expect(identity).toHaveCount(0);
  await expect(page.locator('.profile-identity h1')).toContainText('Khám Phá');
  await page.reload();
  await expect(page.locator('.profile-identity h1')).toContainText('Khám Phá');
  await expect(page.locator('.profile-portrait')).toHaveAttribute('data-avatar', avatar!);
  await expect(drawings.locator('.profile-art')).toHaveCount(8);
  expect(errors).toEqual([]);
});

test('video, audio and printable details retain media controls, retry and actions on mobile', async ({ page }) => {
  await login(page);
  const response = await (await page.request.get('/api/v1/resources?limit=1')).json();
  const original = await (await page.request.get(`/api/v1/resources/${response.items[0].id}`)).json();
  let kind = 'video';
  await page.route(`**/api/v1/resources/${original.id}`, route => route.fulfill({ json: { ...original, kind, title: `Học liệu ${kind}`, mediaUrl: kind === 'poster' ? original.coverUrl : '/media-test-unavailable', mediaMimeType: kind === 'poster' ? 'image/jpeg' : `${kind}/mp4`, content: { shortFacts: original.content.shortFacts, chapters: kind === 'video' ? [{ title: 'Quan sát', timeSeconds: 0 }] : [] }, related: [], variants: [] } }));
  await page.route('**/media-test-unavailable', route => route.fulfill({ status: 404 }));
  await page.setViewportSize({ width: 390, height: 844 });
  for (const format of ['video', 'audio', 'poster']) {
    kind = format; await page.goto(`/resources/${original.id}`);
    await expect(page.getByRole('heading', { name: `Học liệu ${format}`, exact: true })).toBeVisible();
    if (format !== 'poster') {
      await expect(page.locator(`${format}[controls]`)).toBeVisible();
      await expect(page.getByRole('alert')).toContainText('Không tải được');
      await page.getByRole('alert').getByRole('button', { name: 'Thử lại', exact: true }).click();
      await expect(page.getByRole('alert')).toContainText('Không tải được');
    } else {
      await expect(page.getByRole('button', { name: 'Tải bản in (Người lớn)', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'In A4', exact: true })).toBeVisible();
    }
    await screenshot(page, `learner-${format}-mobile`);
  }
});
