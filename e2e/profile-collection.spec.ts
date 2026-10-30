import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const shots = path.resolve('artifacts/verification/profile-collection');
test.beforeAll(() => fs.mkdirSync(shots, { recursive: true }));
async function login(page: Page) {
  await page.goto('/login?role=student');
  await page.locator('[name=email]').fill('hocsinh');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('hocsinh');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
}
async function seed(page: Page, count = 2, broken = false) {
  await page.evaluate(async ({ count, broken }) => {
    const { creativeStorage } = await import('/src/shared/creative/creativeStorage.ts');
    await creativeStorage.clearAll();
    const toData = async (url: string) => {
      const response = await fetch(url); if (!response.ok) throw Error(url);
      const blob = await response.blob(); return await new Promise<string>(resolve => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.readAsDataURL(blob); });
    };
    const images = [await toData('/assets/generated/craft/child_crayon_turtle.jpg'), await toData('/assets/generated/creative/crayon-fish-v2.png'), await toData('/assets/generated/profile/profile-habitat-preview.png')];
    const kinds = ['drawing', 'scan', 'habitat'] as const;
    const names = ['Bạn rùa và khu vườn san hô', 'Bạn cá sáp màu của con', 'Một góc biển xanh'];
    for (let k = 0; k < kinds.length; k++) for (let i = 0; i < count; i++) {
      await creativeStorage.saveArtwork({ id: `${kinds[k]}-${i}`, type: kinds[k], title: `${names[k]} ${i + 1}`, createdAt: 1792890000000 - i * 86400000, completedAt: 1792890000000 - i * 86400000, isDraft: false, previewDataUrl: broken && k === 0 && i === 0 ? 'data:image/png;base64,broken' : images[k], ...(k === 0 ? { drawingData: { canvasDataUrl: images[0] } } : k === 1 ? { scanData: { schemaVersion: 1, originalDataUrl: images[1], cutoutDataUrl: images[1], crop: { x: 0, y: 0, width: 100, height: 100 }, environmentId: 'reef', motion: 'swim' } } : { habitatData: { items: [] } }) });
    }
    await creativeStorage.saveArtwork({ id: 'unfinished', type: 'drawing', title: 'Bản nháp không trưng bày', isDraft: true, createdAt: Date.now(), previewDataUrl: images[0], drawingData: { canvasDataUrl: images[0] } });
  }, { count, broken });
  await page.goto('/profile');
}
const region = (page: Page, kind: string) => page.locator(`[data-artwork-section="${kind}"]`);
const shoot = async (page: Page, name: string) => {
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.locator('.profile-art img').evaluateAll(images => images.every(i => (i as HTMLImageElement).complete))).toBe(true);
  await page.screenshot({ path: path.join(shots, name + '.png'), fullPage: true, animations: 'disabled' });
};

test('all three completed collections reveal independently and exclude drafts', async ({ page }) => {
  await login(page); await seed(page, 14);
  await expect(page.locator('[data-artwork-section] h3')).toHaveText(['Tranh vẽ & tô màu', 'Tranh quét', 'Sa bàn / Nơi sống']);
  for (const kind of ['drawing', 'scan', 'habitat']) {
    await expect(region(page, kind).locator('.profile-section-count')).toHaveText('14');
    await expect(region(page, kind).locator('.profile-art')).toHaveCount(6);
  }
  await region(page, 'drawing').getByRole('button', { name: 'Xem thêm 6 tác phẩm' }).click();
  await expect(region(page, 'drawing').locator('.profile-art')).toHaveCount(12);
  await region(page, 'drawing').getByRole('button', { name: 'Xem thêm 2 tác phẩm' }).click();
  await expect(region(page, 'drawing').locator('.profile-art')).toHaveCount(14);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(region(page, 'drawing').locator('.profile-art')).toHaveCount(14);
  await expect(region(page, 'scan').locator('.profile-art')).toHaveCount(6);
  await expect(page.getByText('Bản nháp không trưng bày')).toHaveCount(0);
});

test('profile reads bounded indexed batches and retries a failed next page without clearing tiles', async ({ page }) => {
  await login(page); await seed(page, 14);
  await page.addInitScript(() => {
    const originalCursor = IDBIndex.prototype.openCursor;
    const originalGetAll = IDBObjectStore.prototype.getAll;
    (window as any).__collectionReads = 0;
    (window as any).__collectionBatches = [];
    (window as any).__failMore = false;
    IDBObjectStore.prototype.getAll = function (...args) {
      if (location.pathname === '/profile' && this.name === 'ocean_artworks') throw Error('Full artwork reads are forbidden in profile');
      return originalGetAll.apply(this, args);
    };
    IDBIndex.prototype.openCursor = function (...args) {
      if ((window as any).__failMore) throw new Error('Next page temporarily unavailable');
      const request = originalCursor.apply(this, args);
      const batch = { reads: 0 }; (window as any).__collectionBatches.push(batch);
      request.addEventListener('success', () => { if (request.result) { (window as any).__collectionReads++; batch.reads++; } });
      return request;
    };
  });
  await page.reload();
  await expect(region(page, 'drawing').locator('.profile-art')).toHaveCount(6);
  await expect(region(page, 'scan').locator('.profile-art')).toHaveCount(6);
  await expect(region(page, 'habitat').locator('.profile-art')).toHaveCount(6);
  const initialReads = await page.evaluate(() => (window as any).__collectionReads);
  expect(await page.evaluate(() => (window as any).__collectionBatches.every((batch: any) => batch.reads === 7))).toBe(true);
  await page.evaluate(() => { (window as any).__failMore = true; });
  await region(page, 'drawing').getByRole('button', { name: 'Xem thêm 6 tác phẩm' }).click();
  await expect(region(page, 'drawing').getByRole('alert')).toContainText('Chưa tải được');
  await region(page, 'drawing').screenshot({ path: path.join(shots, 'paging-error.png'), animations: 'disabled' });
  await expect(region(page, 'drawing').locator('.profile-art')).toHaveCount(6);
  await expect(region(page, 'drawing').locator('.profile-section-count')).toHaveText('14');
  await page.evaluate(() => { (window as any).__failMore = false; });
  await region(page, 'drawing').getByRole('button', { name: 'Thử tải thêm lần nữa' }).click();
  await expect(region(page, 'drawing').locator('.profile-art')).toHaveCount(12);
  await expect(region(page, 'drawing').getByRole('alert')).toHaveCount(0);
  await region(page, 'drawing').screenshot({ path: path.join(shots, 'paging-loaded.png'), animations: 'disabled' });
  expect(await page.evaluate(() => (window as any).__collectionReads)).toBe(initialReads + 7);
  await expect(region(page, 'scan').locator('.profile-art')).toHaveCount(6);
});

test('actual desktop tablet mobile renders and readonly viewers retain focus and saved image', async ({ page }) => {
  await login(page); await seed(page, 3);
  for (const [width, height, name] of [[1440, 900, 'desktop'], [768, 1024, 'tablet'], [390, 844, 'mobile'], [320, 740, 'small-mobile']] as const) {
    await page.setViewportSize({ width, height });
    const geometry = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, offenders: [...document.querySelectorAll('body *')].map(e => ({ class: e.className, right: e.getBoundingClientRect().right })).filter(e => e.right > innerWidth + 1).slice(0, 8) }));
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), { message: JSON.stringify(geometry) }).toBeLessThanOrEqual(width);
    await shoot(page, name);
    if (name === 'desktop') await page.screenshot({ path: path.join(shots, 'desktop-viewport.png'), animations: 'disabled' });
    if (name === 'mobile' || name === 'tablet') {
      await page.screenshot({ path: path.join(shots, `${name}-viewport.png`), animations: 'disabled' });
      for (const kind of ['scan', 'habitat']) {
        await page.evaluate(kind => {
          const section = document.querySelector(`[data-artwork-section="${kind}"]`)!;
          const headerHeight = document.querySelector('.bluesteam-app-header')?.getBoundingClientRect().height || 64;
          scrollTo({ top: section.getBoundingClientRect().top + scrollY - headerHeight - 12, behavior: 'instant' });
        }, kind);
        await page.screenshot({ path: path.join(shots, `${name}-${kind}.png`), animations: 'disabled' });
      }
      await page.evaluate(() => scrollTo(0, 0));
    }
  }
  await page.setViewportSize({ width: 1536, height: 1024 });
  await shoot(page, 'desktop-manifest');
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const kind of ['drawing', 'scan', 'habitat']) {
    const tile = region(page, kind).locator('.profile-art').first();
    const source = await tile.locator('img').getAttribute('src');
    await tile.click(); const dialog = page.getByRole('dialog');
    await expect(dialog.locator('.artwork-full-view img')).toHaveAttribute('src', source!);
    await expect(dialog.getByRole('button', { name: /Làm tiếp|Vẽ tiếp|Chỉnh sửa|Mở lại/ })).toHaveCount(0);
    await expect(dialog.getByRole('link', { name: 'Tải ảnh', exact: true })).toBeVisible();
    await page.screenshot({ path: path.join(shots, `viewer-${kind}.png`), animations: 'disabled' });
    const download = page.waitForEvent('download');
    await dialog.getByRole('link', { name: 'Tải ảnh', exact: true }).click();
    const file = await download;
    const expected = Buffer.from(source!.split(',')[1], 'base64');
    expect(crypto.createHash('sha256').update(fs.readFileSync((await file.path())!)).digest('hex')).toBe(crypto.createHash('sha256').update(expected).digest('hex'));
    expect(file.suggestedFilename()).toMatch(kind === 'drawing' ? /\.jpg$/ : /\.png$/);
    await page.evaluate(() => { window.open = () => null; });
    await dialog.getByRole('button', { name: 'In tác phẩm', exact: true }).click();
    await expect(dialog.getByRole('status')).toContainText('cửa sổ in');
    await expect.poll(() => dialog.evaluate(el => ({ x: Math.round(el.getBoundingClientRect().x), y: Math.round(el.getBoundingClientRect().y), fillsBackdrop: Math.abs(el.getBoundingClientRect().width - el.parentElement!.clientWidth) <= 1, height: Math.round(el.getBoundingClientRect().height) }))).toEqual({ x: 0, y: 0, fillsBackdrop: true, height: 900 });
    await page.screenshot({ path: path.join(shots, `viewer-${kind}-print-blocked.png`), animations: 'disabled' });
    await page.evaluate(() => {
      window.open = () => {
        const frame = document.createElement('iframe'); frame.hidden = true; document.body.appendChild(frame);
        return { document: frame.contentDocument!, closed: false, focus() {}, print() { (window as any).__printedImage = frame.contentDocument!.querySelector('img')?.src; frame.remove(); }, close() { frame.remove(); } } as unknown as Window;
      };
    });
    await dialog.getByRole('button', { name: 'In tác phẩm', exact: true }).click();
    await expect.poll(() => page.evaluate(() => (window as any).__printedImage)).toBe(source);
    await page.keyboard.press('Escape'); await expect(tile).toBeFocused();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await region(page, 'scan').locator('.profile-art').first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'In tác phẩm' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'In tác phẩm' })).toBeVisible();
  expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({ path: path.join(shots, 'viewer-mobile.png'), animations: 'disabled' });
});

test('collection refresh keeps loaded records on failure and committed deletions refresh counts', async ({ page }) => {
  await login(page); await seed(page, 1);
  await expect(page.locator('.profile-art')).toHaveCount(3);
  await page.evaluate(() => {
    const original = indexedDB.open.bind(indexedDB);
    (window as any).__restoreArtworks = () => { indexedDB.open = original; };
    indexedDB.open = () => { throw new DOMException('Blocked', 'SecurityError'); };
    window.dispatchEvent(new Event('bluesteam:creative-artworks-changed'));
  });
  await expect(page.getByRole('alert')).toContainText('Chưa cập nhật');
  await expect(page.locator('.profile-art')).toHaveCount(3);
  await page.evaluate(() => (window as any).__restoreArtworks());
  await page.getByRole('button', { name: /Thử lại/, exact: false }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.evaluate(async () => {
    const { creativeStorage } = await import('/src/shared/creative/creativeStorage.ts');
    await creativeStorage.deleteArtwork('drawing-0');
    await creativeStorage.deleteArtwork('habitat-0');
  });
  await expect(page.locator('.profile-section-count')).toHaveText(['0', '1', '0']);
});

test('an older completed refresh cannot replace a newer collection result', async ({ page }) => {
  await login(page); await seed(page, 1);
  await expect(page.locator('.profile-art')).toHaveCount(3);
  await page.evaluate(async () => {
    const original = IDBDatabase.prototype.transaction;
    let held = 0;
    IDBDatabase.prototype.transaction = function (...args) {
      const tx = original.apply(this, args);
      if (args[1] === 'readonly' && held++ < 3) {
        tx.addEventListener('complete', event => {
          const completion = tx.oncomplete;
          event.stopImmediatePropagation();
          setTimeout(() => completion?.call(tx, event), 300);
        }, { capture: true });
      }
      return tx;
    };
    window.dispatchEvent(new Event('bluesteam:creative-artworks-changed'));
    await new Promise(resolve => setTimeout(resolve, 50));
    IDBDatabase.prototype.transaction = original;
    const { creativeStorage } = await import('/src/shared/creative/creativeStorage.ts');
    await creativeStorage.deleteArtwork('drawing-0');
    await creativeStorage.deleteArtwork('habitat-0');
  });
  await expect(page.locator('.profile-section-count')).toHaveText(['0', '1', '0']);
  await page.waitForTimeout(350);
  await expect(page.locator('.profile-section-count')).toHaveText(['0', '1', '0']);
});

test('draft-only empty sections and broken previews have distinct actionable states', async ({ page }) => {
  await login(page); await seed(page, 1, true);
  const tile = region(page, 'drawing').locator('.profile-art');
  await expect(tile.getByText('Chưa mở được ảnh')).toBeVisible();
  await tile.click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'In tác phẩm' })).toBeDisabled();
  await page.keyboard.press('Escape'); await shoot(page, 'broken-preview');
  await seed(page, 0);
  await expect(page.locator('.profile-section-count')).toHaveText(['0', '0', '0']);
  await expect(region(page, 'scan').getByRole('button', { name: 'Quét tranh' })).toBeVisible();
  await shoot(page, 'empty');
  await region(page, 'scan').getByRole('button', { name: 'Quét tranh', exact: true }).click();
  await expect(page).toHaveURL(/\/creative\/scan(?:\?draft=scan-[^&]+)?$/);
});

test('an initial database error is not presented as an empty collection and retry recovers', async ({ page }) => {
  await login(page);
  await page.addInitScript(() => {
    const open = indexedDB.open.bind(indexedDB);
    (window as any).__restoreDatabase = () => { indexedDB.open = open; };
    indexedDB.open = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto('/profile');
  await expect(page.getByRole('alert')).toContainText('Chưa đọc được tác phẩm');
  await expect(page.locator('[data-artwork-section]')).toHaveCount(0);
  await page.evaluate(() => (window as any).__restoreDatabase());
  await page.getByRole('button', { name: /Thử lại/ }).click();
  await expect(page.locator('.profile-section-count')).toHaveText(['0', '0', '0']);
});

test('a legacy tab blocking the collection upgrade has a recoverable message and retains its artwork', async ({ page, context }) => {
  const oldTab = await context.newPage();
  try {
    await oldTab.goto('/login?role=student');
    await oldTab.evaluate(() => new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('ocean_creative_db', 2);
      request.onupgradeneeded = () => request.result.createObjectStore('ocean_artworks', { keyPath: 'id' });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result; (window as any).__legacyDatabase = db;
        const tx = db.transaction('ocean_artworks', 'readwrite');
        tx.objectStore('ocean_artworks').put({ id: 'legacy-before-paging', type: 'drawing', title: 'Tranh cũ được giữ lại', createdAt: 100, previewDataUrl: '', drawingData: { canvasDataUrl: 'legacy-layer' } });
        tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
      };
    }));
    await login(page); await page.goto('/profile');
    await expect(page.getByRole('alert')).toContainText('Đóng các tab BlueSTEAM cũ');
    await oldTab.evaluate(() => (window as any).__legacyDatabase.close());
    await page.getByRole('button', { name: /Thử lại/ }).click();
    await expect(page.getByRole('heading', { name: 'Tranh cũ được giữ lại', exact: true })).toBeVisible();
    await expect(region(page, 'drawing').locator('.profile-section-count')).toHaveText('1');
    await page.reload();
    await expect(region(page, 'drawing').locator('.profile-art')).toHaveCount(1);
  } finally { await oldTab.close(); }
});

test('collection details remain readable with long titles, English, reduced motion and narrow layouts', async ({ page }) => {
  await login(page); await seed(page, 3);
  await page.evaluate(async () => {
    const { creativeStorage } = await import('/src/shared/creative/creativeStorage.ts');
    const art = (await creativeStorage.getArtworkById('drawing-0'))!;
    await creativeStorage.saveArtwork({ ...art, title: 'Đại dương của con '.repeat(8) });
  });
  await page.reload(); await expect(page.locator('.profile-art')).toHaveCount(9);
  const contrast = await page.locator('.profile-gallery-title .coral').evaluate(el => {
    const css = getComputedStyle(el);
    const luminance = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
    const values = [luminance(css.color), luminance(css.backgroundColor)].sort((a, b) => b - a);
    return (values[0] + .05) / (values[1] + .05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.profile-art').first().hover();
  expect(await page.locator('.profile-art').first().evaluate(el => getComputedStyle(el).transform)).toBe('none');
  for (const width of [1024, 720, 320]) {
    await page.setViewportSize({ width, height: 768 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.evaluate(() => localStorage.setItem('ocean:v2:locale', 'en'));
  await page.reload();
  await expect(page.locator('[data-artwork-section] h3')).toHaveText(['Drawing & colouring', 'Scanned drawings', 'Dioramas / Habitats']);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({ path: path.join(shots, 'english-small.png'), fullPage: true, animations: 'disabled' });
});

test('real drawing, scan and habitat producers complete into the matching section without losing drafts or original work', async ({ page }) => {
  // This data-preservation test must not wait on the unrelated remote editorial fonts.
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await login(page); await seed(page, 0);
  await page.goto('/creative/drawing?template=blank');
  const paint = page.getByTestId('drawing-canvas'); await expect(paint).toBeVisible();
  const box = (await paint.boundingBox())!;
  await page.mouse.move(box.x + 80, box.y + 80); await page.mouse.down(); await page.mouse.move(box.x + 150, box.y + 120, { steps: 8 }); await page.mouse.up();
  await page.getByRole('button', { name: 'Lưu tiến trình', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đã lưu tiến trình');
  const drawingUrl = page.url();
  await page.goto('/profile'); await expect(region(page, 'drawing').locator('.profile-art')).toHaveCount(0);
  await page.goto(drawingUrl); await page.getByRole('button', { name: 'Hoàn thành', exact: true }).click();
  await expect(page.locator('.creative-finished')).toContainText('Đã lưu vào Hồ sơ');
  const original = await page.evaluate(async () => { const { creativeStorage } = await import('/src/shared/creative/creativeStorage.ts'); return (await creativeStorage.getArtworks()).find(a => a.isDraft === false)!; });
  const revisionId = await page.evaluate(async original => { const { createRevisionDraft } = await import('/src/shared/creative/artworkLifecycle.ts'); return (await createRevisionDraft(original)).id; }, original);
  await page.goto('/creative/drawing?id=' + revisionId);
  await expect(paint).toBeVisible();
  await page.getByRole('button', { name: 'Lưu tiến trình', exact: true }).click();
  await page.goto('/profile'); await expect(region(page, 'drawing').locator('.profile-art')).toHaveCount(1);
  expect(await page.evaluate(async id => { const { creativeStorage } = await import('/src/shared/creative/creativeStorage.ts'); return creativeStorage.getArtworkById(id); }, original.id)).toEqual(original);

  await page.goto('/creative/habitat');
  await page.getByRole('button', { name: 'Thêm cảnh', exact: true }).click(); await page.getByRole('button', { name: 'Tạo cảnh', exact: true }).click();
  await page.getByRole('button', { name: 'Hoàn thành', exact: true }).click();
  await expect(page.locator('.creative-finished')).toContainText('Đã lưu vào Hồ sơ');
  await page.goto('/profile'); await expect(region(page, 'habitat').locator('.profile-art')).toHaveCount(1);
  await expect(region(page, 'habitat').getByText('2 cảnh', { exact: true })).toBeVisible();

  await page.goto('/creative/scan');
  const image = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 400; c.height = 300; const x = c.getContext('2d')!; x.fillStyle = '#fff'; x.fillRect(0, 0, 400, 300); x.strokeStyle = '#17657a'; x.lineWidth = 12; x.beginPath(); x.ellipse(200, 150, 90, 65, 0, 0, Math.PI * 2); x.stroke(); return c.toDataURL().split(',')[1]; });
  await page.locator('input[type=file]').last().setInputFiles({ name: 'fish.png', mimeType: 'image/png', buffer: Buffer.from(image, 'base64') });
  await page.getByRole('button', { name: 'Tách nền và xem lại' }).click();
  await page.getByRole('checkbox', { name: 'Đã xem lại nét vẽ và phần trắng trong con vật' }).check();
  await page.getByRole('button', { name: 'Hoàn thành', exact: true }).click();
  await expect(page.locator('.creative-finished')).toContainText('Đã lưu vào Hồ sơ');
  await page.goto('/profile'); await expect(region(page, 'scan').locator('.profile-art')).toHaveCount(1);
  await page.reload(); await expect(page.locator('.profile-art')).toHaveCount(3);
});
