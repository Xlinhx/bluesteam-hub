import { test, expect, type Page } from '@playwright/test';
import { openDeviceProfileCollection } from './fixtures/local-profile';

async function login(page: Page) {
  const response = await page.request.post('/api/v1/auth/login', { data: { role: 'student', email: 'hocsinh', password: 'hocsinh' } });
  expect(response.ok()).toBe(true);
}
async function seedCollection(page: Page) {
  await openDeviceProfileCollection(page);
  await expect(page.locator('.profile-collection-section')).toHaveCount(3);
  await page.evaluate(async () => {
    const blob = await (await fetch('/assets/generated/craft/child_crayon_turtle.jpg')).blob();
    const preview = await new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(blob); });
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('ocean_creative_db'); request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result, transaction = db.transaction('ocean_artworks', 'readwrite');
        for (let index = 0; index < 3; index++) { const now = Date.now() + index, id = `cabinet-fixture-${index}`; transaction.objectStore('ocean_artworks').put({ id, type: 'drawing', title: `Bộ sưu tập đại dương ${index + 1}`, createdAt: now, completedAt: now, isDraft: false, __collectionKey: ['drawing', -now, id], previewDataUrl: preview, submissionState: 'local_only' }); }
        transaction.oncomplete = () => { db.close(); resolve(); }; transaction.onerror = () => reject(transaction.error);
      };
    });
  });
  await page.reload(); await openDeviceProfileCollection(page);
  await expect(page.locator('.profile-art')).toHaveCount(3);
}
async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll<HTMLImageElement>('.ocean-cabinet-reef')].map(image => image.decode().catch(() => {})));
    document.getAnimations().filter(animation => Number.isFinite(animation.effect?.getTiming().iterations)).forEach(animation => { try { animation.finish(); } catch {} });
  });
}

test('a library scene choreographs shapes, headings, portraits and images with distinct timing', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    (window as any).__cast = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      (window as any).__cast.push({ className: `${this.getAttribute('class') || ''} ${this.closest('.resource-banner-content,.resource-group-portrait')?.getAttribute('class') || ''}`, duration: typeof options === 'object' ? options.duration : options });
      return animate.call(this, frames, options);
    };
  });
  await login(page); await page.goto('/resources');
  await expect(page.locator('.resource-group-section').first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as any).__cast.filter((item: any) => Number(item.duration) >= 700).length)).toBeGreaterThan(6);
  for (const name of ['resource-group-portrait', 'resource-banner-content']) await expect.poll(() => page.evaluate(name => (window as any).__cast.some((item: any) => item.className?.includes(name)), name), { message: `Motion cast includes ${name}` }).toBe(true);
  await settle(page);
  await expect(page.locator('.resource-seascape').first()).toHaveCSS('background-image', /resource-group-gallery[.]webp/);
  await page.screenshot({ path: 'artifacts/cabinet-library-1440.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 }); await settle(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const heading = page.locator('.resource-banner-content h2');
  await expect(heading).toBeVisible();
  await page.screenshot({ path: 'artifacts/cabinet-library-390.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('resources and profile navigate through a real scene snapshot and respect reduced motion', async ({ page }) => {
  await login(page); await page.goto('/resources'); await settle(page);
  await page.evaluate(() => {
    (window as any).__sceneSnapshots = 0;
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (update: any) => { (window as any).__sceneSnapshots++; return start(update); };
  });
  await page.getByRole('button', { name: 'Hồ sơ', exact: true }).first().click();
  await expect(page.locator('.learner-profile')).toBeVisible();
  expect(await page.evaluate(() => (window as any).__sceneSnapshots)).toBe(1);
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.oceanTransition || '')).toBe('');
  await seedCollection(page); await settle(page);
  await page.screenshot({ path: 'artifacts/cabinet-profile-1440.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 }); await settle(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'artifacts/cabinet-profile-390.png', fullPage: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => { (window as any).__sceneSnapshots = 0; });
  await page.getByRole('button', { name: 'Học liệu', exact: true }).first().click();
  await expect(page.locator('.resource-library')).toBeVisible();
  expect(await page.evaluate(() => (window as any).__sceneSnapshots)).toBe(0);
  expect(await page.locator('.resource-library').evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
});
