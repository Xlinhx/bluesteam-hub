import { expect, test } from '@playwright/test';

test('activity titles stay centered without covering header controls', async ({ page }) => {
  await page.route('**/api/v1/auth/session', route => route.fulfill({
    json: { account: { id: 'header-test', role: 'student', displayName: 'Bé An' } },
  }));
  await page.route('**/api/v1/models/turtle-test', route => route.fulfill({
    json: { id: 'turtle-test', title: 'Rùa biển xanh', version: 1 },
  }));

  for (const path of ['/interactive/models/turtle-test', '/3dmodel/turtle']) {
    await page.goto(path);
    const header = page.getByRole('banner');
    const title = header.getByRole('heading', { level: 1, name: /Rùa biển xanh/i });
    await expect(title).toBeVisible();

    for (const width of [1536, 1024, 768, 640, 390, 320]) {
      await page.setViewportSize({ width, height: 850 });
      const bar = (await header.boundingBox())!;
      const text = (await title.boundingBox())!;
      expect(Math.abs(text.x + text.width / 2 - (bar.x + bar.width / 2)), `${path} at ${width}px`).toBeLessThan(1);

      for (const item of await header.locator('button:visible, img:visible').all()) {
        const control = (await item.boundingBox())!;
        expect(control.x).toBeGreaterThanOrEqual(bar.x);
        expect(control.x + control.width).toBeLessThanOrEqual(bar.x + bar.width);
        const horizontal = Math.min(text.x + text.width, control.x + control.width) - Math.max(text.x, control.x);
        const vertical = Math.min(text.y + text.height, control.y + control.height) - Math.max(text.y, control.y);
        expect(horizontal > 0 && vertical > 0).toBe(false);
      }
    }
  }
});
