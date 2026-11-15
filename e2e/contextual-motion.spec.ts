import { expect, test, type Page } from '@playwright/test';

test.use({ hasTouch: true });

async function login(page: Page, role: 'teacher' | 'student') {
  const response = await page.request.post('/api/v1/auth/login', {
    data: role === 'teacher'
      ? { role, email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' }
      : { role, email: 'hocsinh', password: 'hocsinh' },
  });
  expect(response.ok()).toBe(true);
}

async function recordMotion(page: Page) {
  await page.addInitScript(() => {
    const offsets: string[] = [];
    const rowDelays: number[] = [];
    Object.assign(window, { markerOffsets: offsets, rosterRowDelays: rowDelays });
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (this.matches('[data-motion-marker]') && Array.isArray(frames)) offsets.push(String(frames[0]?.translate));
      if (this.matches('.roster-table tbody > tr') && typeof options === 'object' && typeof options.delay === 'number') rowDelays.push(options.delay);
      return animate.call(this, frames, options);
    };
  });
}

const offsets = (page: Page) => page.evaluate(() => (window as Window & { markerOffsets?: string[] }).markerOffsets || []);
const rosterDelays = (page: Page) => page.evaluate(() => (window as Window & { rosterRowDelays?: number[] }).rosterRowDelays || []);

async function recordCardMotion(page: Page) {
  await page.addInitScript(() => {
    const events: string[] = [];
    Object.assign(window, { profileCardAnimations: events });
    document.addEventListener('animationstart', event => {
      const card = (event.target as Element).closest('[data-profile-card]');
      if (card) events.push(`${card.getAttribute('data-profile-card')}:${event.animationName}`);
    });
  });
  return () => page.evaluate(() => (window as Window & { profileCardAnimations: string[] }).profileCardAnimations);
}

test('learner cards reveal their own art and only reveal the journal once per visit', async ({ page }) => {
  await login(page, 'student');
  const animations = await recordCardMotion(page);
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto('/profile');
  const progress = page.getByRole('heading', { name: 'Tiến trình học tập' });
  const journal = page.getByRole('heading', { name: 'Hành trình học tập', exact: true });
  await progress.scrollIntoViewIfNeeded();
  await expect.poll(animations).toContain('progress:profile-card-notebook');
  expect(await animations()).not.toContain('journal:profile-card-journal-line');
  await journal.scrollIntoViewIfNeeded();
  await expect.poll(animations).toContain('journal:profile-card-journal-line');
  await page.evaluate(() => scrollTo(0, 0));
  await journal.scrollIntoViewIfNeeded();
  expect((await animations()).filter(name => name === 'journal:profile-card-journal-line')).toHaveLength(1);
});

test('teacher card effects follow the section and respect reduced motion', async ({ page }) => {
  await login(page, 'teacher');
  const animations = await recordCardMotion(page);
  await page.goto('/teacher/profile');
  await expect.poll(animations).toContain('achievement:profile-card-medal');
  await expect.poll(animations).toContain('progress:profile-card-notebook');
  const tabs = page.getByRole('navigation', { name: 'Quản lý hồ sơ' });
  await tabs.getByRole('button', { name: 'Thiết lập lớp' }).click();
  await expect.poll(animations).toContain('settings:profile-card-shore');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const count = (await animations()).length;
  await tabs.getByRole('button', { name: 'Tổng quan lớp' }).click();
  await expect(page.getByRole('heading', { name: 'Thành tích của các bé' })).toBeVisible();
  await expect(page.locator('.teacher-class-overview').locator('[data-profile-card="achievement"]')).toHaveCSS('animation-name', 'none');
  expect(await animations()).toHaveLength(count);
});

test('map motion follows the selected axis and remains optional on touch, keyboard and Back', async ({ page }) => {
  await login(page, 'student');
  await recordMotion(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/learning');
  const zones = page.locator('.learning-zones button');
  await expect(zones.nth(1)).toBeVisible();
  await zones.nth(1).tap();
  await expect(zones.nth(1)).toHaveAttribute('aria-pressed', 'true');
  expect((await offsets(page)).at(-1)).toMatch(/^0px -\d+(?:\.\d+)?px$/);
  await page.getByRole('button', { name: 'Theo chiều ngang' }).tap();
  await zones.nth(1).tap();
  expect((await offsets(page)).at(-1)).toMatch(/^-\d+(?:\.\d+)?px 0px$/);
  const count = (await offsets(page)).length;
  await zones.first().focus();
  await page.keyboard.press('Enter');
  await expect(zones.first()).toHaveAttribute('aria-pressed', 'true');
  expect(await offsets(page)).toHaveLength(count);
  await page.goBack();
  await expect(zones.nth(1)).toHaveAttribute('aria-pressed', 'true');
  expect(await offsets(page)).toHaveLength(count);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await zones.first().tap();
  await expect(zones.first()).toHaveAttribute('aria-pressed', 'true');
  expect(await offsets(page)).toHaveLength(count);
});

test('profile tabs and lesson rows track their real positions while content updates immediately', async ({ page }) => {
  await login(page, 'teacher');
  await recordMotion(page);
  await page.goto('/teacher/profile');
  await expect(page.getByRole('heading', { name: 'Hành trình lớp Lá 1' })).toBeVisible();
  const tabs = page.getByRole('navigation', { name: 'Quản lý hồ sơ' });
  const rows = page.locator('.roster-table tbody > tr');
  await tabs.getByRole('button', { name: 'Danh sách học sinh' }).click();
  await expect(tabs.getByRole('button', { name: 'Danh sách học sinh' })).toHaveAttribute('aria-current', 'page');
  expect((await offsets(page)).at(-1)).toMatch(/^-\d+(?:\.\d+)?px 0px$/);
  await expect(rows.first()).toBeVisible();
  expect((await rosterDelays(page)).slice(0, 2)).toEqual([48, 82]);
  await tabs.getByRole('button', { name: 'Thiết lập lớp' }).click();
  await expect(tabs.getByRole('button', { name: 'Thiết lập lớp' })).toBeFocused();
  await page.setViewportSize({ width: 820, height: 1180 });
  await tabs.getByRole('button', { name: 'Tổng quan lớp' }).click();
  await expect(tabs.getByRole('button', { name: 'Tổng quan lớp' })).toHaveAttribute('aria-current', 'page');
  expect((await offsets(page)).at(-1)).toMatch(/^\d+(?:\.\d+)?px 0px$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.locator('[data-motion-marker]').evaluate(el => el.getAnimations().length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const rowAnimationCount = (await rosterDelays(page)).length;
  await tabs.getByRole('button', { name: 'Danh sách học sinh' }).click();
  await expect(rows.first()).toBeVisible();
  expect(await rosterDelays(page)).toHaveLength(rowAnimationCount);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/teacher/plan');
  const steps = page.locator('.lesson-step-control');
  await steps.nth(1).click();
  await expect(steps.nth(1)).toHaveAttribute('aria-current', 'step');
  await expect(page.getByText('Bước 2/5', { exact: true })).toBeVisible();
  expect((await offsets(page)).at(-1)).toMatch(/^0px -\d+(?:\.\d+)?px$/);
  const count = (await offsets(page)).length;
  await steps.nth(2).focus();
  await page.keyboard.press('Enter');
  await expect(steps.nth(2)).toHaveAttribute('aria-current', 'step');
  await expect(steps.nth(2)).toBeFocused();
  expect(await offsets(page)).toHaveLength(count);
});

test('presentation keeps slides and quiz controls still and limits motion to relevant details', async ({ page }) => {
  await login(page, 'teacher');
  await page.goto('/presentation?step=4');
  await expect(page.getByRole('button', { name: 'Công bố đáp án đúng' })).toBeVisible();
  const bar = page.locator('.presentation-vote-bar').first();
  await expect(bar).toBeAttached();
  await expect(bar).toHaveCSS('transition-property', 'transform');
  const vote = page.getByRole('button', { name: /phiếu \(/ }).first();
  const before = await vote.innerText();
  await vote.focus();
  await page.keyboard.press('Enter');
  await expect(vote).not.toHaveText(before);
  await expect(vote).toBeFocused();
  await page.keyboard.press('ArrowRight');
  const awards = page.locator('.presentation-award');
  await expect(awards).toHaveCount(3);
  const award = awards.first();
  await expect(award).toBeVisible();
  await expect(award).toHaveCSS('animation-name', 'presentation-award-settle');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(award).toHaveCSS('animation-name', 'none');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('button', { name: 'Công bố đáp án đúng' })).toBeVisible();
});

test('a new keyboard action releases an in-flight profile navigation snapshot', async ({ page }) => {
  await login(page, 'student');
  await page.addInitScript(() => {
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = update => {
      const snapshot = start(update);
      if (document.documentElement.dataset.oceanTransition) {
        const skip = snapshot.skipTransition.bind(snapshot);
        snapshot.skipTransition = () => {
          document.documentElement.dataset.testSnapshotSkipped = 'true';
          skip();
        };
      }
      return snapshot;
    };
  });
  await page.goto('/resources');
  await page.getByRole('button', { name: 'Hồ sơ', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-ocean-transition', 'forward');
  await page.keyboard.press('Tab');
  await expect(page.locator('html')).toHaveAttribute('data-test-snapshot-skipped', 'true');
  await expect(page.locator('html')).not.toHaveAttribute('data-ocean-transition');
  await expect(page.getByRole('heading', { name: 'Thông tin cá nhân' })).toBeVisible();
});
