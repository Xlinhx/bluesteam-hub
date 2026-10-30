import { expect, test } from '@playwright/test';

test('each Home replays its measured entrance on reload and menu return', async ({ page }) => {
  for (const route of ['/home', '/teacher']) {
    await page.goto(route);
    const root = page.locator('.learner-home, .teacher-home');
    await expect(root).toHaveAttribute('data-entrance', 'open');
    await expect(root.locator('.home-scene-curtain')).toHaveCount(0);
    await expect.poll(() => root.evaluate(el => el.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
    // Entrance layers must not cover actions or change layout geometry.
    await expect(page.locator('.home-primary').first()).toBeEnabled();
    const initial = await root.boundingBox();
    await expect.poll(() => root.evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBe(0);
    expect(await root.boundingBox()).toEqual(initial);
    await page.reload();
    await expect(root).toHaveAttribute('data-entrance', 'open');
    const durations = await root.evaluate(el => el.getAnimations({ subtree: true }).map(a => Number(a.effect?.getComputedTiming().endTime)));
    expect(durations.length).toBeGreaterThan(0);
    expect(Math.max(...durations)).toBeGreaterThanOrEqual(1700);
    expect(Math.max(...durations)).toBeLessThanOrEqual(2100);
    await page.getByRole('button', { name: 'Học liệu', exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(route === '/home' ? '/resources$' : '/teacher/resources$'));
    await page.getByRole('button', { name: 'Trang chủ', exact: true }).first().click();
    await expect(root).toHaveAttribute('data-entrance', 'open');
    const replay = await root.evaluate(el => el.getAnimations({ subtree: true }).map(a => Number(a.effect?.getComputedTiming().endTime)));
    expect(Math.max(...replay)).toBeGreaterThanOrEqual(1700);
  }
});

test('returning preserves the learner selection and input cancels the entrance immediately', async ({ page }) => {
  await page.goto('/home');
  await page.getByRole('tab', { name: 'Học liệu', exact: true }).click();
  await expect(page.locator('.learner-home')).toHaveAttribute('data-entrance', 'interrupted');
  await page.getByTestId('home-feature-action').click();
  await expect(page).toHaveURL(/\/resources/);
  await page.goBack();
  await expect(page.getByRole('tab', { name: 'Học liệu', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Học liệu', exact: true })).toHaveAttribute('aria-selected', 'true');
});

test('both Homes skip spatial entrances with reduced motion on desktop and mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/home', '/teacher']) {
      await page.goto(route);
      const root = page.locator('.learner-home, .teacher-home');
      await expect(root).toHaveAttribute('data-entrance', 'reduced');
      expect(await root.evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
});

test('entrance frames keep desktop and mobile controls in place without overflow', async ({ browser }) => {
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const route of ['/home', '/teacher']) {
      await page.goto(route);
      const root = page.locator('.learner-home, .teacher-home');
      await expect(root).toHaveAttribute('data-entrance', 'open');
      const action = page.locator('.home-primary').first();
      const bounds = await action.boundingBox();
      const count = await root.evaluate(el => {
        const animations = el.getAnimations({ subtree: true });
        animations.forEach(animation => { animation.pause(); animation.currentTime = 450; });
        return animations.length;
      });
      expect(count).toBeGreaterThan(0);
      await page.screenshot({ path: `artifacts/home-motion-${route.slice(1)}-${width}-mid.png` });
      expect(await action.boundingBox()).toEqual(bounds);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await root.evaluate(el => el.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
      await action.focus();
      await expect(action).toBeFocused();
      expect(await action.boundingBox()).toEqual(bounds);
    }
    await context.close();
  }
});
