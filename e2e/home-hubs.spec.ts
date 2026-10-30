import { expect, test } from '@playwright/test';

const sizes = [
  [320, 740], [375, 812], [768, 1024], [1024, 768],
  [1280, 720], [1366, 768], [1440, 900], [1920, 1080],
] as const;

test('Docker revalidates HTML at every Home entry after deployment', async ({ request }) => {
  for (const route of ['/home', '/teacher', '/index.html']) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toContain('no-cache');
    expect(response.headers()['cache-control']).toContain('must-revalidate');
  }
});

test('reviewed photographs load from the deployed frontend for both roles', async ({ page, request }) => {
  const artwork = [
    '/assets/generated/home/home_3d_atelier_v2.jpg',
    '/assets/generated/home/home_resources_atelier_v2.jpg',
    '/assets/generated/home/home_games_atelier_v2.jpg',
    '/assets/generated/home/home_classroom_atelier_v2.jpg',
  ];
  for (const path of artwork) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/jpeg');
    expect((await response.body()).length).toBeLessThan(600_000);
  }
  for (const route of ['/home', '/teacher']) {
    await page.goto(route);
    await expect(page.locator('.home-hub-shell img[src*="atelier_v2"]')).toHaveCount(route === '/home' ? 7 : 4);
    await expect.poll(() => page.locator('.home-hub-shell img').evaluateAll(images =>
      images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)
    )).toBe(true);
  }
});

test('3D hero keeps the shell tip and digital model visible on short laptop screens', async ({ page }) => {
  // Landmarks measured in the approved 1672 × 941 photograph, independent of CSS.
  const landmarks = [{ x:580, y:120 }, { x:1300, y:490 }];
  for (const [width, height] of [[1280,720], [1366,768], [1440,900]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/home');
    const image = page.locator('.home-feature-gallery img[data-artwork="3d"]');
    await expect.poll(() => image.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(1672);
    const visible = await image.evaluate((el, points) => {
      const img = el as HTMLImageElement;
      const box = img.getBoundingClientRect();
      const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
      const [px, py] = getComputedStyle(img).objectPosition.split(' ').map(parseFloat);
      const offsetX = (box.width - img.naturalWidth * scale) * px / 100;
      const offsetY = (box.height - img.naturalHeight * scale) * py / 100;
      return points.map(point => ({ x:point.x * scale + offsetX, y:point.y * scale + offsetY, width:box.width, height:box.height }));
    }, landmarks);
    for (const point of visible) {
      expect(point.x, `${width}px: horizontal subject crop`).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(point.width);
      expect(point.y, `${width}px: shell tip / digital model crop`).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(point.height);
    }
  }
});

test('both Home layouts fit their viewports and keep actions inside their sections', async ({ page }) => {
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    for (const route of ['/home', '/teacher']) {
      await page.goto(route);
      await expect(page.locator('.home-hub-shell')).toBeVisible();
      await expect(page.locator('.bluesteam-header-audio')).toHaveCount(0);
      if (route === '/home') {
        for (const name of ['3D', 'Học liệu', 'Trò chơi']) {
          await page.getByRole('tab', { name, exact: true }).click();
          const layout = await page.evaluate(() => {
            const panel = document.querySelector('.home-feature-copy')!.getBoundingClientRect();
            const action = document.querySelector('.home-primary')!.getBoundingClientRect();
            return { right: action.right <= panel.right + 1, bottom: action.bottom <= panel.bottom + 1,
              pageHeight: document.documentElement.scrollHeight,
              shortcuts: document.querySelector('.home-shortcuts')!.getBoundingClientRect().bottom };
          });
          expect(layout.right, `${width}px ${name}: CTA width`).toBe(true);
          expect(layout.bottom, `${width}px ${name}: CTA height`).toBe(true);
          if (width >= 1280) {
            expect(layout.pageHeight, `${width}px ${name}: no desktop scroll`).toBeLessThanOrEqual(height);
            expect(layout.shortcuts).toBeLessThanOrEqual(height);
          }
        }
      } else {
        const contained = await page.evaluate(() => {
          const panel = document.querySelector('.teacher-home-copy')!.getBoundingClientRect();
          const action = document.querySelector('.teacher-home-primary')!.getBoundingClientRect();
          return action.right <= panel.right + 1 && action.bottom <= panel.bottom + 1;
        });
        expect(contained, `${width}px teacher CTA`).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
});

test('selector supports keyboard, rapid reversal, and reduced motion without moving layout', async ({ page }) => {
  await page.goto('/home');
  const first = page.getByRole('tab', { name: '3D', exact: true });
  await first.focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Trò chơi', exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Trò chơi đại dương', exact: true })).toBeVisible();
  await page.keyboard.press('Home');
  await expect(first).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'Trò chơi', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(first).toHaveAttribute('aria-selected', 'true');
  const before = await page.locator('.home-shortcuts').boundingBox();
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Mục tiếp theo', exact: true }).click();
    await page.getByRole('button', { name: 'Mục trước', exact: true }).click();
  }
  await expect(first).toHaveAttribute('aria-selected', 'true');
  expect(await page.locator('.home-shortcuts').boundingBox()).toEqual(before);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Mục tiếp theo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Kho học liệu', exact: true })).toBeVisible();
  expect(await page.locator('.home-feature-gallery img').first().evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  expect(await page.locator('.home-feature-gallery img').evaluateAll(els => els.flatMap(el => el.getAnimations()).length)).toBe(0);
});

test('Home actions open the intended destinations', async ({ page }) => {
  await page.goto('/home');
  await page.getByTestId('home-feature-action').click();
  await expect(page).toHaveURL(/\/interactive\/3d$/);
  await page.goto('/home');
  await page.getByRole('tab', { name: 'Học liệu', exact: true }).click();
  await page.getByTestId('home-feature-action').click();
  await expect(page).toHaveURL(/\/resources$/);
  await page.goto('/home');
  await page.getByRole('tab', { name: 'Trò chơi', exact: true }).click();
  const activityRequest = page.waitForRequest(request => new URL(request.url()).pathname === '/api/v1/activities');
  await page.getByTestId('home-feature-action').click();
  await expect(page).toHaveURL(/\/interactive\?kind=game$/);
  expect(new URL((await activityRequest).url()).searchParams.get('kind')).toBe('game');
  await expect(page.getByRole('tab', { name: 'Trò chơi', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.goto('/teacher');
  await page.locator('.teacher-home-domains').getByRole('button', { name: 'Học liệu', exact: true }).click();
  await expect(page).toHaveURL(/\/teacher\/resources$/);
  for (const [home, selector, name, destination] of [
    ['/home', '.home-shortcuts', 'Xưởng sáng tạo', '/creative'],
    ['/teacher', '.teacher-home-domains', '3D', '/teacher/interactive?kind=model3d'],
    ['/teacher', '.teacher-home-domains', 'Trò chơi', '/teacher/interactive?kind=game'],
    ['/teacher', '.teacher-home-shortcuts', 'Quản lý sáng tạo', '/teacher/creative'],
  ]) {
    await page.goto(home);
    await page.locator(selector).getByRole('button', { name, exact: true }).click();
    await expect(page).toHaveURL(url => `${url.pathname}${url.search}` === destination);
  }
});


test('small touch screens keep utilities and shortcut actions usable', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    for (const route of ['/home', '/teacher']) {
      await page.goto(`${test.info().project.use.baseURL || 'http://127.0.0.1:3010'}${route}`);
      const utilityName = route === '/home' ? 'Tiện ích học tập' : 'Mở menu giáo viên';
      await page.getByRole('button', { name: utilityName, exact: true }).tap();
      await expect(page.getByRole('button', { name: utilityName, exact: true })).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('.bluesteam-header-audio')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Chuyển đổi ngôn ngữ / Language toggle', exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: utilityName, exact: true })).toHaveAttribute('aria-expanded', 'false');
      const shortcut = page.locator('.home-shortcuts').getByRole('button').last();
      await shortcut.scrollIntoViewIfNeeded();
      await shortcut.tap();
      await expect(page).toHaveURL(url => route === '/home'
        ? url.pathname === '/creative'
        : url.pathname === '/teacher/creative');
    }
  } finally {
    await context.close();
  }
});
