import { test, expect, type Page } from '@playwright/test';
import { openDeviceProfileCollection } from './fixtures/local-profile';

async function login(page: Page, teacher = false) {
  expect((await page.request.post('/api/v1/auth/login', { data: teacher ? { role: 'teacher', email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' } : { role: 'student', email: 'hocsinh', password: 'hocsinh' } })).ok()).toBe(true);
}
async function fits(page: Page) {
  const layout=await page.evaluate(() => ({ width:innerWidth, scroll:document.documentElement.scrollWidth, outside:[...document.querySelectorAll('body *')].filter(node=>node.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(node=>({tag:node.tagName,class:node.getAttribute('class'),right:node.getBoundingClientRect().right,width:node.getBoundingClientRect().width})) }));
  expect(layout.scroll,JSON.stringify(layout)).toBeLessThanOrEqual(layout.width);
}

test('learner layouts and identity controls stay usable at 320px, 360px and landscape', async ({ page }) => {
  await login(page); await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const size of [{ width: 320, height: 568 }, { width: 360, height: 740 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size); await page.goto('/resources');
    await expect(page.locator('.resource-group-section').first()).toBeVisible(); await fits(page);
    const title = page.locator('.resource-banner-content h2'); await expect(title).toBeInViewport();
    await page.getByRole('button', { name: 'Chọn nhóm học liệu', exact: true }).click();
    const chooser = page.locator('.resource-group-chooser');
    await chooser.getByRole('searchbox').fill('Rạn');
    await expect(chooser.getByRole('button', { name: 'Đóng chọn nhóm' })).toBeInViewport(); await fits(page);
    await chooser.getByRole('button', { name: 'Đóng chọn nhóm' }).click();
    await page.goto('/profile'); await openDeviceProfileCollection(page); await expect(page.locator('.profile-collection-section')).toHaveCount(3); await fits(page);
    await page.getByRole('button', { name: 'Đổi tên và hình', exact: true }).click();
    const identity = page.getByRole('dialog');
    const input = identity.getByRole('textbox', { name: 'Tên của bé' });
    await input.fill('Tên đang nhập trên điện thoại');
    await page.setViewportSize({ width: size.width, height: Math.min(size.height, 340) });
    await input.focus(); await expect(input).toBeInViewport({ ratio: 1 });
    const cancel = identity.getByRole('button', { name: 'Hủy', exact: true });
    await cancel.scrollIntoViewIfNeeded(); await expect(cancel).toBeInViewport({ ratio: 1 }); await fits(page);
    await cancel.click(); await expect(identity).toHaveCount(0);
    await page.setViewportSize(size);
    await page.screenshot({ path: `artifacts/mobile-profile-${size.width}.png` });
  }
});

test('teacher drawers keep fields and footer reachable on narrow and short viewports', async ({ page }) => {
  await login(page, true); await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const size of [{ width: 320, height: 568 }, { width: 360, height: 740 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size); await page.goto('/teacher/resources');
    await expect(page.locator('.teacher-resource-table-wrap')).toHaveAttribute('aria-busy', 'false'); await fits(page);
    await page.getByRole('button', { name: 'Thêm học liệu', exact: true }).click();
    const editor = page.getByRole('dialog', { name: 'Thêm học liệu', exact: true });
    const input = editor.getByRole('textbox', { name: 'Tên học liệu', exact: true });
    if (await page.evaluate(() => matchMedia('(pointer: coarse)').matches)) await expect(editor.getByRole('button', {name:'Đóng',exact:true})).toBeFocused();
    else await expect(input).toBeFocused();
    await input.fill('Bản đang sửa ở màn hình hẹp');
    await page.setViewportSize({ width: size.width, height: Math.min(size.height, 340) });
    await input.scrollIntoViewIfNeeded(); await expect(input).toBeInViewport({ ratio: 1 });
    for (const action of await editor.locator('footer button').all()) await expect(action).toBeInViewport({ ratio: 1 }); await fits(page);
    await page.screenshot({ path: `artifacts/mobile-teacher-editor-${size.width}.png` });
    page.once('dialog', dialog => dialog.accept());
    await editor.getByRole('button', { name: 'Hủy', exact: true }).click(); await expect(editor).toHaveCount(0);
    await page.setViewportSize(size);
    await page.getByRole('button', { name: 'Tạo nhóm học liệu', exact: true }).click();
    const group = page.getByRole('dialog', { name: 'Tạo nhóm', exact: true });
    await group.getByRole('textbox', { name: 'Tên nhóm', exact: false }).fill('Nhóm kiểm tra');
    await expect(group.getByRole('button', { name: 'Tạo nhóm', exact: true })).toBeInViewport({ ratio: 1 }); await fits(page);
    page.once('dialog', dialog => dialog.accept()); await group.getByRole('button', { name: 'Hủy', exact: true }).click();
    await expect(group).toHaveCount(0);
  }
});
