import {test, expect} from '@playwright/test';
import fs from 'node:fs';

const output = 'artifacts/c04-repair';
test.beforeEach(async ({page}) => {
  await page.route('**/api/v1/auth/session', route => route.fulfill({json: {account: {id: 'c04-visual-fixture', role: 'student', displayName: 'Bé An'}}}));
  await page.route('**/api/v1/creative-templates/*', route => route.fulfill({json: {
    id: 'c04-template', kind: 'drawing', title: 'Rùa biển xanh',
    payload: {outlineUrl: '/assets/generated/craft/turtle_coloring_lineart_v2.png', fillMaskUrl: '/assets/generated/craft/turtle_coloring_lineart_v2.png', materials: [{id: 'fish', title: 'Cá nhỏ', payload: {stampId: 'fish'}}]},
  }}));
  await page.goto('/creative/drawing?template=template:c04-proof&fromCreative=1');
  await expect(page.getByRole('button', {name: 'Lưu tiến trình', exact: true})).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(output, {recursive: true});
});

for (const width of [1486, 1366, 1024, 768, 390, 320]) {
  test(`C04 ${width}: palette geometry, paint preservation and return navigation`, async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({width, height: 1126});
    const choose = page.getByRole('button', {name: 'Chọn tranh', exact: true});
    await expect(page.getByRole('button', {name: 'Quay lại', exact: true})).toHaveCount(0);
    const heading = await page.locator('.creative-local-heading h2').boundingBox();
    const back = await choose.boundingBox();
    expect(back!.x + back!.width).toBeLessThan(heading!.x);
    await expect(page.locator('.creative-stamp-library')).toHaveCount(0);
    await expect(page.locator('.drawing-basic-colors .drawing-swatch')).toHaveCount(14);
    const canvas = page.getByTestId('drawing-canvas');
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + box.width * .45, box.y + box.height * .45);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .55, box.y + box.height * .5, {steps: 5});
    await page.mouse.up();
    const paint = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
    const initialSize = await canvas.boundingBox();
    await page.screenshot({path: `${output}/${width}-closed.png`, fullPage: true});
    await page.getByRole('button', {name: 'Thêm màu', exact: true}).click();
    await expect(page.getByRole('dialog', {name: 'Thêm màu'})).toBeVisible();
    await expect(page.locator('.drawing-shades .drawing-swatch')).toHaveCount(24);
    const toolbar = (await page.locator('.drawing-toolbar').boundingBox())!;
    for (const button of await page.locator('.drawing-toolbar button').all()) {
      const bounds = (await button.boundingBox())!;
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(toolbar.x + toolbar.width + 1);
    }
    if (width > 800) {
      const stage = (await page.getByTestId('creative-drawing-stage').boundingBox())!;
      const panel = (await page.getByRole('dialog', {name: 'Thêm màu'}).boundingBox())!;
      expect(panel.x).toBeGreaterThanOrEqual(stage.x + stage.width);
      const chips = await page.locator('.drawing-basic-colors .drawing-swatch').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().y));
      expect(new Set(chips.map(Math.round)).size).toBe(1);
    } else {
      const paper = (await canvas.boundingBox())!;
      const panel = (await page.getByRole('dialog', {name: 'Thêm màu'}).boundingBox())!;
      expect(paper.y).toBeLessThan(panel.y - 60);
    }
    expect(await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).toBe(paint);
    if (width <= 800) await page.screenshot({path: `${output}/${width}-open-viewport.png`});
    await page.screenshot({path: `${output}/${width}-open.png`, fullPage: true});
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', {name: 'Thêm màu'})).toHaveCount(0);
    expect((await canvas.boundingBox())!.width).toBeCloseTo(initialSize!.width, 0);
    expect(await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).toBe(paint);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', {name: 'Hoàn tác', exact: true}).click();
    expect(await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).not.toBe(paint);
    await page.getByRole('button', {name: 'Làm lại', exact: true}).click();
    expect(await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).toBe(paint);
    await page.getByRole('button', {name: 'Thêm màu', exact: true}).click();
    await page.locator('.drawing-shades .drawing-swatch').first().click();
    await page.getByRole('button', {name: 'Dùng màu này', exact: true}).click();
    await expect(page.getByRole('dialog', {name: 'Thêm màu'})).toHaveCount(0);
    await expect(page.locator('.drawing-palette-row>strong small')).toHaveText('Màu mở rộng');
    expect(await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).toBe(paint);
    await page.getByRole('button', {name: 'Lưu tiến trình', exact: true}).click();
    await page.reload();
    await expect(page.getByRole('button', {name: 'Lưu tiến trình', exact: true})).toBeEnabled();
    await expect.poll(() => canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).toBe(paint);
    await page.getByTestId('drawing-tool-stamp').click();
    await expect(page.locator('.creative-stamp-library')).toBeVisible();
    await page.getByTestId('drawing-tool-brush').click();
    await expect(page.locator('.creative-stamp-library')).toHaveCount(0);
    await choose.click();
    await expect(page).toHaveURL(/\/creative\/coloring/);
    expect(errors).toEqual([]);
  });
}
