import { expect, test, type Page } from '@playwright/test';

const runtimeErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(({ page }) => { expect(runtimeErrors.get(page) || []).toEqual([]); });

async function login(page: Page, role: 'teacher' | 'student') {
  const response = await page.request.post('/api/v1/auth/login', {
    data: role === 'teacher'
      ? { role, email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' }
      : { role, email: 'hocsinh', password: 'hocsinh' },
  });
  expect(response.ok()).toBeTruthy();
}
async function recordHomeMotion(page: Page) {
  await page.addInitScript(() => {
    const calls: Array<{ duration: number; target: string }> = [];
    (window as any).__homeMotion = calls;
    const native = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (this.closest('.learner-home,.teacher-home')) calls.push({
        duration: typeof options === 'number' ? options : Number(options?.duration || 0), target: this.className.toString(),
      });
      return native.call(this, frames, options);
    };
  });
}
const homeRunning = (page: Page) => page.evaluate(() => document.getAnimations().filter(animation => {
  const target = (animation.effect as KeyframeEffect | null)?.target;
  return target instanceof Element && target.closest('.learner-home,.teacher-home') && animation.playState === 'running';
}).length);

for (const role of ['teacher', 'student'] as const) {
  const path = role === 'teacher' ? '/teacher' : '/home';
  const root = role === 'teacher' ? '.teacher-home' : '.learner-home';
  test(`${role} home: layered introduction, stable controls, immediate interruption and shorter return`, async ({ page }) => {
    await login(page, role); await recordHomeMotion(page);
    await page.goto(path);
    await expect.poll(() => page.evaluate(() => (window as any).__homeMotion.length)).toBeGreaterThan(0);
    const durations = await page.evaluate(() => (window as any).__homeMotion.map((call: any) => call.duration));
    expect(Math.max(...durations)).toBeGreaterThanOrEqual(1700);
    expect(Math.max(...durations)).toBeLessThanOrEqual(2400);
    expect(durations.length).toBeGreaterThan(12);
    expect(await page.locator(`${root} .home-primary`).evaluate(el => getComputedStyle(el).transform)).toBe('none');
    await page.keyboard.press('Tab');
    await expect.poll(() => homeRunning(page)).toBe(0);
    await expect(page.locator(root)).toHaveAttribute('data-entrance', 'interrupted');
    await page.reload();
    await expect(page.locator(root)).toHaveAttribute('data-entrance', 'return');
    const returnDurations = await page.evaluate(() => (window as any).__homeMotion.map((call: any) => call.duration));
    expect(returnDurations.length).toBeGreaterThan(0);
    expect(Math.max(...returnDurations)).toBeLessThanOrEqual(900);
  });

  test(`${role} home: reduced motion and responsive geometry`, async ({ page }) => {
    await login(page, role); await recordHomeMotion(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const [width, height] of [[1920, 1027], [1366, 768], [768, 1024], [390, 844]]) {
      await page.setViewportSize({ width, height }); await page.goto(path);
      await expect(page.locator(root)).toHaveAttribute('data-entrance', 'reduced');
      expect(await page.evaluate(() => (window as any).__homeMotion.length)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      if (role === 'teacher' && width >= 768) {
        const geometry = await page.locator(root).evaluate(el => {
          const shell = el.closest('.bluesteam-role-shell')!;
          const reserved = parseFloat(getComputedStyle(shell).paddingBottom) || 0;
          return { bottom: el.getBoundingClientRect().bottom, reserved, viewport: innerHeight };
        });
        expect(Math.abs(geometry.bottom + geometry.reserved - geometry.viewport)).toBeLessThanOrEqual(1);
      }
      await page.locator(`${root} img`).evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode().catch(() => undefined))));
      await page.screenshot({ path: `artifacts/home-motion-${role}-${width}.png`, fullPage: true });
    }
  });
}

test('learner gallery retargets rapid selection, preserves routes, keyboard focus and selected area', async ({ page }) => {
  await login(page, 'student'); await page.goto('/home');
  const tabs = page.getByRole('tab');
  for (const index of [2, 1, 0, 2, 0, 1, 2]) await tabs.nth(index).click({ force: true });
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.home-feature-copy h2')).toHaveText('Trò chơi đại dương');
  await expect.poll(() => homeRunning(page)).toBe(0);
  expect(await page.locator('[data-testid="home-feature-artwork"]').evaluate(el => getComputedStyle(el).filter)).toBe('none');
  await tabs.nth(2).focus(); await page.keyboard.press('ArrowLeft');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  expect(await page.locator('[data-testid="home-feature-artwork"]').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  const next = page.getByRole('button', { name: 'Mục tiếp theo' });
  await next.focus(); await page.keyboard.press('Enter');
  await expect(next).toBeFocused();
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  await page.getByTestId('home-feature-action').click();
  await expect(page).toHaveURL(/\/interactive\?kind=game$/);
  await page.goBack();
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.learner-home')).toHaveAttribute('data-entrance', 'return');
});

test('changing motion preference or viewport during entrance cancels Home timelines', async ({ page }) => {
  await login(page, 'student'); await recordHomeMotion(page); await page.goto('/home');
  await expect.poll(() => page.evaluate(() => (window as any).__homeMotion.length)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.learner-home')).toHaveAttribute('data-entrance', 'reduced');
  await expect.poll(() => homeRunning(page)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => sessionStorage.removeItem('bluesteam.home.entrance.v3.learner'));
  await page.reload();
  await expect.poll(() => page.evaluate(() => (window as any).__homeMotion.length)).toBeGreaterThan(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => homeRunning(page)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('Home remains usable when Home storage and WAAPI are unavailable', async ({ page }) => {
  await login(page, 'student');
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, 'animate', { value: undefined, configurable: true });
    const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key.startsWith('bluesteam.home.')) throw Error('Home storage blocked');
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('bluesteam.home.')) throw Error('Home storage blocked');
      return set.call(this, key, value);
    };
  });
  await page.goto('/home');
  await page.getByRole('tab', { name: 'Trò chơi' }).click();
  await expect(page.locator('.home-feature-copy h2')).toHaveText('Trò chơi đại dương');
  await page.getByTestId('home-feature-action').click();
  await expect(page).toHaveURL(/\/interactive\?kind=game$/);
});

test('teacher Home keeps every tool destination and the creative shortcut', async ({ page }) => {
  await login(page, 'teacher');
  const routes = ['/teacher/interactive?kind=model3d', '/teacher/resources', '/teacher/interactive?kind=game'];
  for (const [index, route] of routes.entries()) {
    await page.goto('/teacher');
    await page.locator('.teacher-home-domains > button').nth(index).click();
    await expect(page).toHaveURL(url => `${url.pathname}${url.search}` === route);
  }
  await page.goto('/teacher');
  await page.getByRole('button', { name: 'Quản lý sáng tạo' }).click();
  await expect(page).toHaveURL(/\/teacher\/creative$/);
});

test('Home exit opens from the selected card and holds the old scene until the destination is ready', async ({ page }) => {
  await login(page, 'teacher');
  await page.addInitScript(() => {
    (window as any).__homeJourneys = 0;
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = ((update: any) => { (window as any).__homeJourneys++; return start(update); }) as typeof document.startViewTransition;
  });
  await page.goto('/teacher');
  await page.route('**/api/v1/auth/session', async route => {
    await new Promise(resolve => setTimeout(resolve, 250)); await route.continue();
  });
  await page.locator('.teacher-home-domains > button').nth(1).click();
  await expect(page).toHaveURL(/\/teacher\/resources$/);
  await expect.poll(() => page.evaluate(() => (window as any).__homeJourneys)).toBe(1);
  await expect(page.locator('html')).toHaveAttribute('data-home-journey', 'opening');
  expect(await page.locator('html').evaluate(el => parseFloat(getComputedStyle(el).getPropertyValue('--home-journey-radius')))).toBeGreaterThan(700);
  await expect(page.locator('.teacher-resource-library')).toBeVisible();
  await expect(page.locator('html')).not.toHaveAttribute('data-home-journey');
  expect(await page.locator('.bluesteam-app-header').evaluate(el => (el as HTMLElement).style.viewTransitionName)).toBe('');
});

test('reduced motion bypasses the Home snapshot transition', async ({ page }) => {
  await login(page, 'teacher'); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/teacher');
  await page.locator('.teacher-home-domains > button').nth(1).click();
  await expect(page).toHaveURL(/\/teacher\/resources$/);
  await expect(page.locator('html')).not.toHaveAttribute('data-home-journey');
});

test('Home snapshot waits for actual destination results rather than capturing its loader', async ({ page }) => {
  await login(page, 'teacher');
  await page.addInitScript(() => {
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = ((update: any) => start(async () => {
      await update();
      (window as any).__homeResultsReady = document.querySelector('.teacher-resource-table-wrap')?.getAttribute('aria-busy');
    })) as typeof document.startViewTransition;
  });
  await page.goto('/teacher');
  await page.route('**/api/v1/teacher/resources?*', async route => {
    await new Promise(resolve => setTimeout(resolve, 400));
    await route.fulfill({ json: { items: [], total: 0, nextCursor: null } });
  });
  await page.locator('.teacher-home-domains > button').nth(1).click();
  await expect.poll(() => page.evaluate(() => (window as any).__homeResultsReady)).toBe('false');
});

test('touch navigation uses the pressed card as its origin even when the browser does not focus it', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3010', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await login(page, 'teacher'); await page.goto('/teacher');
  const card = page.locator('.teacher-home-domains > button').nth(2);
  await card.scrollIntoViewIfNeeded();
  const rect = await card.boundingBox();
  await card.evaluate(el => el.addEventListener('focus', () => (el as HTMLElement).blur()));
  await card.tap();
  await expect(page.locator('html')).toHaveAttribute('data-home-journey', 'opening');
  const origin = await page.locator('html').evaluate(el => ({ x: parseFloat((el as HTMLElement).style.getPropertyValue('--home-journey-x')), y: parseFloat((el as HTMLElement).style.getPropertyValue('--home-journey-y')) }));
  expect(Math.abs(origin.x - rect!.x - rect!.width / 2)).toBeLessThan(2);
  expect(Math.abs(origin.y - rect!.y - rect!.height / 2)).toBeLessThan(2);
  await expect(page).toHaveURL(/\/teacher\/interactive\?kind=game$/);
  await context.close();
});

test('browser Back during the Home aperture settles the old transition immediately', async ({ page }) => {
  await login(page, 'teacher'); await page.goto('/teacher');
  await page.locator('.teacher-home-domains > button').nth(1).click();
  await expect(page).toHaveURL(/\/teacher\/resources$/);
  await expect(page.locator('html')).toHaveAttribute('data-home-journey', 'opening');
  await page.goBack();
  await expect(page.locator('html')).not.toHaveAttribute('data-home-journey', { timeout: 300 });
  await expect(page.locator('.teacher-home')).toBeVisible();
});

test('Home stays readable on short laptops and narrow phones, with no clipped actions', async ({ page }) => {
  for (const role of ['teacher', 'student'] as const) {
    await login(page, role); await page.emulateMedia({ reducedMotion: 'reduce' });
    const path = role === 'teacher' ? '/teacher' : '/home';
    const root = role === 'teacher' ? '.teacher-home' : '.learner-home';
    for (const [width, height] of [[1920, 600], [1440, 600], [1366, 600], [1024, 600], [320, 740]]) {
      await page.setViewportSize({ width, height }); await page.goto(path);
      await expect(page.locator(root)).toBeVisible();
      if (role === 'student') await page.getByRole('tab', { name: 'Trò chơi', exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      const geometry = await page.locator(root).evaluate(el => {
        const rect = el.getBoundingClientRect();
        const action = el.querySelector('.home-primary')!.getBoundingClientRect();
        const copy = el.querySelector('.home-split-copy')!.getBoundingClientRect();
        const shortcut = el.querySelector('.home-shortcuts')!.getBoundingClientRect();
        return { bottom: rect.bottom, shortcutBottom: shortcut.bottom, actionBottom: action.bottom, copyBottom: copy.bottom };
      });
      expect(geometry.actionBottom).toBeLessThanOrEqual(geometry.copyBottom + 1);
      expect(geometry.shortcutBottom).toBeLessThanOrEqual(geometry.bottom + 1);
      await page.locator(`${root} .home-shortcut`).scrollIntoViewIfNeeded();
      await expect(page.locator(`${root} .home-shortcut`)).toBeInViewport();
    }
  }
});

test('selection copy remains immediately readable and the specimen follows the chosen category', async ({ page }) => {
  await login(page, 'student'); await page.goto('/home');
  for (const [label, form] of [['Trò chơi', 'fish'], ['Học liệu', 'kelp'], ['3D', 'shell']]) {
    await page.getByRole('tab', { name: label, exact: true }).click();
    const copy = await page.locator('.home-feature-copy h2').evaluate(el => ({ clip: getComputedStyle(el).clipPath, duration: parseFloat(getComputedStyle(el).animationDuration) }));
    expect(copy.clip).toBe('none'); expect(copy.duration).toBeLessThanOrEqual(.3);
    const mark = page.locator(`.home-specimen-mark [data-form="${form}"]`);
    await expect(mark).toHaveCSS('opacity', '1');
    await expect(page.locator('.home-specimen-mark')).toBeInViewport();
  }
});

test('unsupported View Transitions preserve immediate Home navigation', async ({ page }) => {
  await login(page, 'teacher');
  await page.addInitScript(() => Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true }));
  await page.goto('/teacher');
  await page.locator('.teacher-home-domains > button').nth(2).click();
  await expect(page).toHaveURL(/\/teacher\/interactive\?kind=game$/);
  await expect(page.locator('html')).not.toHaveAttribute('data-home-journey');
});

test('keyboard navigation from Home does not start a destination-owned transition', async ({ page }) => {
  await login(page, 'teacher');
  await page.addInitScript(() => {
    (window as any).__homeKeySnapshots = 0;
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = ((update: any) => { (window as any).__homeKeySnapshots++; return start(update); }) as typeof document.startViewTransition;
  });
  await page.goto('/teacher');
  await page.locator('.teacher-home-domains > button').nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/teacher\/resources$/);
  expect(await page.evaluate(() => (window as any).__homeKeySnapshots)).toBe(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-home-journey');
});

test('the first destination action interrupts the aperture instead of waiting for it', async ({ page }) => {
  await login(page, 'teacher'); await page.goto('/teacher');
  await page.locator('.teacher-home-domains > button').nth(1).click();
  await expect(page.locator('.teacher-resource-library')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-home-journey', 'opening');
  await page.getByRole('button', { name: 'Thêm học liệu', exact: true }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-home-journey', { timeout: 300 });
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
});

test('Home releases its navigation listener after every completed exit', async ({ page }) => {
  await login(page, 'teacher');
  await page.addInitScript(() => {
    const live = new Set<EventListenerOrEventListenerObject>();
    (window as any).__homeNavigationListeners = () => live.size;
    const add = window.addEventListener, remove = window.removeEventListener;
    window.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: any) => {
      if (type === 'bluesteam:before-navigate') live.add(listener);
      return add.call(window, type, listener, options);
    }) as typeof window.addEventListener;
    window.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: any) => {
      if (type === 'bluesteam:before-navigate') live.delete(listener);
      return remove.call(window, type, listener, options);
    }) as typeof window.removeEventListener;
  });
  await page.goto('/teacher');
  for (let cycle = 0; cycle < 3; cycle++) {
    await expect(page.locator('.teacher-home')).toBeVisible();
    expect(await page.evaluate(() => (window as any).__homeNavigationListeners())).toBe(1);
    await page.locator('.teacher-home-domains > button').nth(2).click();
    await expect(page).toHaveURL(/\/teacher\/interactive\?kind=game$/);
    await expect(page.locator('html')).not.toHaveAttribute('data-home-journey');
    await expect.poll(() => page.evaluate(() => (window as any).__homeNavigationListeners())).toBe(0);
    await page.goBack();
  }
});
