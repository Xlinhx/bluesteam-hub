import { test, expect } from '@playwright/test';

const url = '/resources/eb359c36-c0ab-4ce2-9a55-c6acdc118394?kind=flashcard';

test('observation layout preserves photo proportions, fact details and icon-only bookmark', async ({ page }) => {
  await page.setViewportSize({ width: 1513, height: 1039 });
  await page.goto(url);
  await expect(page.getByRole('heading', { name: 'San hô', exact: true })).toBeVisible();
  const save = page.getByRole('button', { name: 'Lưu học liệu', exact: true });
  await expect(save).toHaveText('');
  await expect(page.getByText('Rạn san hô rực rỡ như khu vườn dưới đáy biển.', { exact: true })).toBeVisible();
  const photo = page.locator('.observation-photo');
  await expect(photo).toBeVisible();
  const bounds = await photo.boundingBox();
  expect(bounds!.width / bounds!.height).toBeCloseTo(906 / 780, 1);
  await expect(page.getByText('environment', { exact: true })).toHaveCount(0);
  await save.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Bỏ lưu học liệu' })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Bỏ lưu học liệu' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Mở Sao biển' })).toBeVisible();
  await page.screenshot({ path: 'screenshots/resource-detail-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Mở Sao biển' }).click();
  await expect(page.getByRole('heading', { name: 'Sao biển', exact: true })).toBeVisible();
});

test('mobile and reduced motion keep controls accessible and avoid horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  await expect(page.getByRole('heading', { name: 'San hô', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Nghe thuyết minh San hô' })).toBeVisible();
  const save = page.getByRole('button', { name: 'Lưu học liệu', exact: true });
  await save.focus();
  await expect(save).toBeFocused();
  expect(await save.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  const animations = await page.locator('.resource-observation').evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length);
  expect(animations).toBe(0);
  await page.screenshot({ path: 'screenshots/resource-detail-mobile.png', fullPage: true });
});

for (const width of [360, 390, 430, 768]) {
  test(`mobile reading order and compact header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(url);
    const title = page.getByRole('heading', { name: 'San hô', exact: true });
    await expect(title).toBeVisible();
    const photo = await page.locator('.observation-photo').boundingBox();
    const titleBox = await title.boundingBox();
    expect(titleBox!.y + titleBox!.height).toBeLessThan(photo!.y);
    const header = await page.locator('header').boundingBox();
    expect(header!.height).toBeLessThanOrEqual(76);
    const formats = await page.getByLabel('Định dạng học liệu', { exact: true }).boundingBox();
    const facts = await page.getByLabel('Đặc điểm nổi bật cho bé', { exact: true }).boundingBox();
    expect(formats!.y + formats!.height).toBeLessThanOrEqual(facts!.y);
    expect(formats!.y + formats!.height).toBeLessThan(776);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await expect(page.getByRole('navigation', { name: 'Điều hướng chính di động' })).toBeVisible();
    const menu = page.getByRole('button', { name: 'Tiện ích học tập' });
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#learner-header-utilities button').first()).toBeFocused();
    await expect(page.getByRole('button', { name: 'Vào lớp', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
    if (width === 390) {
      await page.screenshot({ path: 'screenshots/resource-detail-mobile-optimized.png', fullPage: true });
      await page.screenshot({ path: 'screenshots/resource-detail-mobile-viewport.png' });
    }
  });
}

test('narration can stop, restart and settle on speech completion; missing formats explain availability', async ({ page }) => {
  await page.addInitScript(() => {
    // Speech synthesis is an OS boundary: drive its completion explicitly.
    let utterance: SpeechSynthesisUtterance | undefined;
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => [], cancel: () => { utterance = undefined; },
      speak: (value: SpeechSynthesisUtterance) => { utterance = value; value.onstart?.(new Event('start') as SpeechSynthesisEvent); },
    } });
    (window as any).finishTestSpeech = () => utterance?.onend?.(new Event('end') as SpeechSynthesisEvent);
  });
  await page.goto(url);
  const listen = page.getByRole('button', { name: 'Nghe thuyết minh San hô' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await listen.click();
  const stop = page.getByRole('button', { name: 'Dừng nghe San hô' });
  await expect(stop).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('.listening-wave i').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await stop.click();
  await expect(listen).toHaveAttribute('aria-pressed', 'false');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await listen.click();
  expect(await page.locator('.listening-wave i').first().evaluate(el => getComputedStyle(el).animationName)).toBe('observation-voice');
  await page.evaluate(() => (window as any).finishTestSpeech());
  await expect(listen).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Video', exact: true })).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('button', { name: 'Video', exact: true })).toHaveAttribute('title', 'Video: chưa có học liệu');
  await expect(page).toHaveURL(/eb359c36/);
});

test('album keyboard controls change the specimen within a stable frame', async ({ page }) => {
  await page.goto('/resources/454149d0-93e1-475a-a1b6-8feacf5182dd?kind=flashcard');
  await expect(page.getByRole('heading', { name: 'Cua biển', exact: true })).toBeVisible();
  const frame = page.locator('.observation-photo');
  const before = await frame.boundingBox();
  const image = frame.locator('img');
  const first = await image.getAttribute('src');
  await page.getByRole('button', { name: 'Ảnh tiếp theo' }).focus();
  await page.keyboard.press('Enter');
  await expect(image).not.toHaveAttribute('src', first!);
  expect(await frame.boundingBox()).toEqual(before);
  await page.getByRole('button', { name: 'Ảnh trước' }).click();
  await expect(image).toHaveAttribute('src', first!);
});
