import { test, expect } from '@playwright/test';

test.describe('Editorial landing', () => {
  test('introduces the whole platform and keeps the public destinations usable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Một đại dương. Muôn cách khám phá.',
    );
    const navigation = page.getByRole('navigation', { name: 'Điều hướng công khai', exact: true });
    for (const [label, route] of [
      ['Học liệu', '/resources'],
      ['Tương tác', '/interactive'],
      ['Sáng tạo', '/studio'],
    ]) {
      await expect(navigation.getByRole('link', { name: label })).toHaveAttribute('href', route);
    }
    await expect(page.getByRole('link', { name: 'Đăng nhập', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Đăng nhập', exact: true })).toHaveCount(0);
    await page.locator('.public-header-actions a[href="/entry"]').first().click();
    await expect(page).toHaveURL(/\/entry$/);
    await expect(page.getByText('Hãy bắt đầu cùng Blue STEAM Hub')).toBeVisible();
  });

  test('photo comparison responds to keyboard and pointer without moving the images', async ({ page }) => {
    await page.goto('/');
    const range = page.getByRole('slider', { name: 'Chuyển giữa ảnh thật và tranh vẽ' });
    await range.scrollIntoViewIfNeeded();
    await range.focus();
    await range.press('Home');
    await expect(range).toHaveValue('0');
    await range.press('End');
    await expect(range).toHaveValue('100');
    const frame = page.getByTestId('ocean-comparison');
    const mask = await frame.evaluate(element => getComputedStyle(element).maskImage);
    const maskUrl = mask.match(/url\("?([^"\)]+)"?\)/)?.[1];
    expect(maskUrl).toBeTruthy();
    const maskType = await page.evaluate(async url => {
      const response = await fetch(url);
      return response.headers.get('content-type');
    }, maskUrl!);
    expect(maskType).toContain('image/svg+xml');
    const initialBounds = await frame.boundingBox();
    expect(initialBounds).not.toBeNull();
    const bounds = initialBounds!;
    await page.mouse.move(bounds.x + bounds.width * 0.25, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width * 0.7, bounds.y + bounds.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect.poll(async () => Number(await range.inputValue())).toBeGreaterThan(60);
    await expect.poll(async () => Number(await range.inputValue())).toBeLessThan(80);
    expect(await frame.boundingBox()).toEqual(initialBounds);
  });

  test('menu hover centers the icon without reflowing the navigation', async ({ page }) => {
    await page.goto('/');
    const item = page.getByRole('navigation', { name: 'Điều hướng công khai', exact: true })
      .getByRole('link', { name: 'Học liệu' });
    const before = await item.boundingBox();
    await item.hover();
    await expect(item.locator('.public-nav-label')).toHaveCSS('opacity', '0');
    expect(await item.boundingBox()).toEqual(before);
    const icon = await item.locator('.public-nav-icon').boundingBox();
    expect(Math.abs(icon!.x + icon!.width / 2 - (before!.x + before!.width / 2))).toBeLessThan(2);
    await page.mouse.move(0, 0);
    await expect(item.locator('.public-nav-label')).toHaveCSS('opacity', '1');
  });

  for (const width of [1440, 1366, 1024, 768, 390]) {
    test(`keeps images, headings and controls within the ${width}px viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      await page.locator('footer').scrollIntoViewIfNeeded();
      await expect.poll(() => page.evaluate(() => [...document.images].every(
        (image) => image.complete && image.naturalWidth > 0,
      ))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('.public-header-actions a[href="/entry"]').first()).toBeInViewport();
    });
  }

  test('mobile menu is dismissible and retains navigation labels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Mở menu điều hướng' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Menu điều hướng' });
    await expect(dialog.getByRole('link', { name: 'Sáng tạo' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await dialog.getByRole('link', { name: 'Học liệu' }).click();
    // Learning resources require a learner session; anonymous navigation reaches its login.
    await expect(page).toHaveURL(/\/login\?role=student$/);
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  });

  test('reduced motion leaves the content and comparison fully usable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.landing-hero-object')).toHaveCSS('animation-name', 'none');
    const range = page.getByRole('slider', { name: 'Chuyển giữa ảnh thật và tranh vẽ' });
    await range.scrollIntoViewIfNeeded();
    await range.focus();
    await range.press('End');
    await expect(range).toHaveValue('100');
  });

  test('language switching translates the landing and keeps destinations intact', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Chuyển đổi ngôn ngữ / Language toggle' }).click();
    await page.getByRole('button', { name: 'English', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('One ocean. Endless discoveries.');
    await expect(page.getByRole('slider', { name: 'Compare photograph and illustration' })).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.public-desktop-nav a').last()).toHaveAttribute('href', '/studio');
  });
});
