import { expect, test } from '@playwright/test';

const roles = {
  learner: ['/home', '/resources', '/interactive', '/studio', '/profile'],
  teacher: ['/teacher', '/teacher/resources', '/teacher/interactive', '/teacher/creative'],
};

for (const width of [1920, 1440, 1400, 1366, 390, 320]) {
  for (const [role, routes] of Object.entries(roles)) {
    test(`${role}: stable header across menu screens at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(routes[0]);
      await page.evaluate(() => document.fonts.ready);
      const header = page.locator('.bluesteam-app-header');
      const geometry = () => page.evaluate(() => {
        const header = document.querySelector<HTMLElement>('.bluesteam-app-header')!;
        const desktop = header.querySelector<HTMLElement>('nav')!;
        const nav = getComputedStyle(desktop).visibility !== 'hidden' && desktop.getBoundingClientRect().width > 0
          ? desktop : document.querySelector<HTMLElement>('.bluesteam-app-header + nav')!;
        const measure = (el: Element) => {
          const { x, y, width, height } = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return { x, y, width, height, font: style.fontSize, weight: style.fontWeight };
        };
        return {
          header: { ...measure(header), background: getComputedStyle(header).backgroundColor },
          logo: measure(header.querySelector('img')!),
          actions: measure(header.querySelector('.bluesteam-header-actions')!),
          tabs: [...nav.querySelectorAll('button')].map(measure),
        };
      });
      const baseline = await geometry();
      for (let step = 0; step <= routes.length; step++) {
        const index = step % routes.length;
        if (step > 0) {
          const desktop = header.locator('.bluesteam-primary-nav');
          const nav = await desktop.isVisible() ? desktop : page.locator('.bluesteam-app-header + nav');
          await nav.locator('button').nth(index).click();
          await page.waitForURL(url => url.pathname === routes[index], { waitUntil: 'domcontentloaded' });
          await page.evaluate(() => document.fonts.ready);
        }
        await expect(page.locator('.bluesteam-header-audio')).toHaveCount(1);
        await expect.poll(geometry, { message: `${role}: ${routes[index]} shifted header geometry` }).toEqual(baseline);
        if (await header.locator('.bluesteam-primary-nav').isVisible()) {
          const logo = await header.locator('img').first().boundingBox();
          const nav = await header.locator('nav').boundingBox();
          const actions = await header.locator('.bluesteam-header-actions').boundingBox();
          expect(logo!.x + logo!.width).toBeLessThanOrEqual(nav!.x);
          expect(nav!.x + nav!.width).toBeLessThanOrEqual(actions!.x);
        } else {
          await header.locator('.bluesteam-utilities-toggle').click();
          await expect(header.locator('.bluesteam-header-audio')).toBeVisible();
          await page.keyboard.press('Escape');
          await expect(header.locator('.bluesteam-utilities-toggle')).toBeFocused();
          for (const box of (await geometry()).tabs) {
            expect(box.width).toBeGreaterThanOrEqual(56);
            expect(box.height).toBeGreaterThanOrEqual(56);
          }
        }
        // Assert this shell's bounds; page-specific content has separate responsive tests.
        for (const region of [header, page.locator('.bluesteam-app-header + nav')]) {
          if (!await region.isVisible()) continue;
          const box = (await region.boundingBox())!;
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width);
        }
      }
      await page.screenshot({ path: `artifacts/header-unified-${role}-${width}.png` });
    });
  }
}

test('new tabs trigger compact navigation by content width and expand when space returns', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/teacher');
  await page.evaluate(() => document.fonts.ready);
  const header = page.locator('.bluesteam-app-header');
  await expect(header.locator('.bluesteam-primary-nav')).toBeVisible();
  const font = await header.locator('.bluesteam-nav-link').first().evaluate(el => getComputedStyle(el).fontSize);
  // Simulate one additional registry entry in both existing menu renderers.
  await page.evaluate(() => {
    for (const selector of ['.bluesteam-primary-nav', '.bluesteam-app-header + nav']) {
      const nav = document.querySelector(selector)!;
      const button = nav.querySelector('button')!.cloneNode(true) as HTMLButtonElement;
      button.removeAttribute('aria-current');
      button.dataset.navKey = 'future';
      button.querySelector('span:last-child')!.textContent = 'Dự án nghiên cứu đại dương';
      nav.append(button);
    }
  });
  await expect(header.locator('.bluesteam-primary-nav')).toBeHidden();
  await expect(page.locator('.bluesteam-app-header + nav button').last()).toBeVisible();
  await page.setViewportSize({ width: 2400, height: 900 });
  await expect(header.locator('.bluesteam-primary-nav')).toBeVisible();
  await expect(header.locator('.bluesteam-nav-link').first()).toHaveCSS('font-size', font);
  await expect(header.locator('.bluesteam-utilities-toggle')).toBeHidden();
  await page.setViewportSize({ width: 320, height: 900 });
  const mobile = page.locator('.bluesteam-app-header + nav');
  await expect(mobile).toBeVisible();
  await mobile.locator('button').last().scrollIntoViewIfNeeded();
  await expect(mobile.locator('button').last()).toBeInViewport();
  const label = mobile.locator('button').last().locator('span').last();
  expect((await label.boundingBox())!.height).toBeLessThanOrEqual(24);
});

test('shared tabs use the same axis and spacing for both roles; language selection preserves it', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 900 });
  const dimensions = [];
  for (const route of ['/home', '/teacher']) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const measure = () => page.locator('.bluesteam-primary-nav button').evaluateAll(buttons => buttons.slice(0,4).map(el => {
      const { x, y, width, height } = el.getBoundingClientRect();
      return { x, y, width, height };
    }));
    dimensions.push(await measure());
    await page.locator('.bluesteam-header-language > button').click();
    await page.locator('.bluesteam-header-language > div').getByRole('button', { name: 'English' }).click();
    expect(await measure()).toEqual(dimensions.at(-1));
    await page.locator('.bluesteam-header-language > button').click();
    await page.locator('.bluesteam-header-language > div').getByRole('button', { name: 'Tiếng Việt' }).click();
  }
  expect(dimensions[0]).toEqual(dimensions[1]);
});
