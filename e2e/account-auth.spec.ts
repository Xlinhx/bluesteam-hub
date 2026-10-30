import { test, expect } from '@playwright/test';

const email = `auth-browser-${Date.now()}@example.test`;
const password = 'Ocean-test-123';

test('seeded test accounts accept short login aliases but registration still requires email', async ({ page }) => {
  for (const [role, alias, destination] of [['teacher', 'giaovien', '/teacher'], ['student', 'hocsinh', '/home']]) {
    await page.goto(`/login?role=${role}`);
    await page.locator('[name=email]').fill(alias);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(alias);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await page.reload();
    await expect(page.getByRole('button', { name: /Đăng xuất tài khoản/ })).toBeVisible();
    await page.getByRole('button', { name: /Đăng xuất tài khoản/ }).click();
    await page.goto(`/register?role=${role}`);
    await page.locator('[name=email]').fill(alias);
    await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
    await expect(page.getByText('Vui lòng nhập email hợp lệ.')).toBeVisible();
  }
});

for (const role of ['teacher', 'student'] as const) {
  test(`${role}: registration, validation, login, reload and logout use a real role-specific session`, async ({ page }) => {
    const name = role === 'teacher' ? 'Cô Mai kiểm thử' : 'Bé Na kiểm thử';
    const home = role === 'teacher' ? '/teacher' : '/home';
    const otherHome = role === 'teacher' ? '/home' : '/teacher';
    const otherRole = role === 'teacher' ? 'student' : 'teacher';
    await page.goto(`/register?role=${role}`);
    await page.getByLabel(role === 'teacher' ? 'Tên hiển thị' : 'Tên bé', { exact: true }).fill(name);
    await page.getByLabel(role === 'teacher' ? 'Email giáo viên' : 'Email phụ huynh', { exact: true }).fill(email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
    await page.getByLabel('Nhập lại mật khẩu', { exact: true }).fill('Different-123');
    await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
    await expect(page.getByText('Mật khẩu nhập lại chưa khớp.')).toBeVisible();
    await expect(page.getByLabel('Nhập lại mật khẩu', { exact: true })).toBeFocused();
    await page.getByLabel('Nhập lại mật khẩu', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Hiện mật khẩu', exact: true }).click();
    await expect(page.getByLabel('Mật khẩu', { exact: true })).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${home}$`));
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    const logout = () => page.getByRole('button', { name: `Đăng xuất tài khoản ${role === 'teacher' ? 'giáo viên' : 'học sinh'}` }).click();
    await logout();
    await expect(page).toHaveURL(new RegExp(`/login\\?role=${role}$`));
    await page.goto(home);
    await expect(page).toHaveURL(new RegExp(`/login\\?role=${role}$`));
    await page.getByLabel(role === 'teacher' ? 'Email giáo viên' : 'Email phụ huynh', { exact: true }).fill(email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill('Wrong-password-123');
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Email hoặc mật khẩu chưa đúng');
    await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${home}$`));
    await page.goto(otherHome);
    await expect(page).toHaveURL(new RegExp(`/login\\?role=${otherRole}$`));
    await page.goto(home);
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await logout();
  });
}

test('mobile registration reports invalid and duplicate email without overflow or losing input', async ({ page, request }) => {
  const duplicateEmail = `duplicate-${Date.now()}@example.test`;
  const response = await request.post('/api/v1/auth/register', { data: { role: 'student', email: duplicateEmail, password, displayName: 'Bé kiểm thử' } });
  expect(response.status()).toBe(201);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/register?role=student');
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
  await expect(page.getByText('Vui lòng nhập email hợp lệ.')).toBeVisible();
  await page.getByLabel('Tên bé', { exact: true }).fill('Bé khác');
  await page.getByLabel('Email phụ huynh', { exact: true }).fill(duplicateEmail);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByLabel('Nhập lại mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Email này đã được đăng ký');
  await expect(page.getByLabel('Tên bé', { exact: true })).toHaveValue('Bé khác');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?role=student$/);
  await page.getByRole('button', { name: 'Giáo viên', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?role=teacher$/);
});
