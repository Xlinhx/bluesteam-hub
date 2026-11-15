import { expect, test } from '@playwright/test';

test('class settings preserve drafts and apply the invitation policy to new pupils', async ({ page, browser, baseURL }) => {
  const endpoint = '/api/v1/teacher/classroom';
  const stamp = crypto.randomUUID();
  const register = (role: 'teacher' | 'student') => ({
    role, email: `${role}-settings-${stamp}@example.test`, password: 'Ocean-test-123',
    displayName: role === 'teacher' ? 'Cô kiểm tra thiết lập' : 'Bé tham gia bằng mã',
  });
  expect((await page.request.post('/api/v1/auth/register', { data: register('teacher') })).status()).toBe(201);
  const school = await page.request.post(`${endpoint}/schools`, { data: { name: 'Trường thử thiết lập' } });
  expect(school.ok()).toBe(true);
  const classroom = await page.request.post(`${endpoint}/classes`, { data: {
    schoolId: (await school.json()).id, year: '2026–2027', name: 'Lá 1', ageGroup: '5–6 tuổi',
  } });
  expect(classroom.ok()).toBe(true);
  const { id } = await classroom.json();
  await page.goto('/teacher/profile');
  await page.getByRole('button', { name: 'Thiết lập lớp', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Thiết lập lớp Lá 1', exact: true })).toBeVisible();
  await expect(page.getByText(/^Mã lớp CL-/)).toBeVisible();
  const title = page.getByRole('textbox', { name: 'Tên lớp', exact: true });
  const policy = page.getByRole('switch', { name: 'Cô duyệt yêu cầu tham gia' });
  await expect(policy).toBeChecked();
  const code = await page.locator('.teacher-invite-code').innerText();
  const pendingPupil = await browser.newContext({ baseURL });
  try {
    const pendingAccount = register('student');
    expect((await pendingPupil.request.post('/api/v1/auth/register', { data: { ...pendingAccount, email: `pending-${pendingAccount.email}` } })).status()).toBe(201);
    const firstRequest = await pendingPupil.request.post('/api/v1/learner-ocean/join-class', { data: { code } });
    expect(await firstRequest.json()).toMatchObject({ status: 'pending' });
    await title.fill('Lá nháp');
    await policy.uncheck();
    await page.getByRole('button', { name: 'Hủy thay đổi', exact: true }).click();
    await expect(title).toHaveValue('Lá 1');
    await expect(policy).toBeChecked();
    await policy.uncheck();
    await Promise.all([
      page.waitForResponse(response => response.url().endsWith(`/classes/${id}`) && response.request().method() === 'PATCH' && response.ok()),
      page.getByRole('button', { name: 'Lưu thiết lập', exact: true }).click(),
    ]);
    const repeated = await pendingPupil.request.post('/api/v1/learner-ocean/join-class', { data: { code } });
    expect(await repeated.json()).toMatchObject({ status: 'pending' });
  } finally {
    await pendingPupil.close();
  }
  await page.reload();
  await page.getByRole('button', { name: 'Thiết lập lớp', exact: true }).click();
  await expect(policy).not.toBeChecked();
  await expect(page.locator('.teacher-invite-code')).toHaveText(code);
  const pupil = await browser.newContext({ baseURL });
  try {
    expect((await pupil.request.post('/api/v1/auth/register', { data: register('student') })).status()).toBe(201);
    const joined = await pupil.request.post('/api/v1/learner-ocean/join-class', { data: { code } });
    expect(joined.status()).toBe(201);
    expect(await joined.json()).toMatchObject({ status: 'active' });
    const enrollments = await pupil.request.get('/api/v1/learner-ocean/enrollments');
    expect((await enrollments.json()).items).toEqual([expect.objectContaining({ className: 'Lá 1', contextId: expect.any(String), status: 'active' })]);
  } finally {
    await pupil.close();
  }
  await page.getByRole('button', { name: 'Chuẩn bị lớp năm học mới' }).click();
  const preparation = page.getByRole('dialog', { name: 'Chuẩn bị lớp năm học mới' });
  await expect(preparation.getByRole('textbox', { name: 'Năm học mới' })).toHaveValue('2027–2028');
  await preparation.getByRole('textbox', { name: 'Tên lớp mới' }).fill('Lá 2');
  await preparation.getByRole('button', { name: 'Tạo lớp năm học mới', exact: true }).click();
  await expect(preparation).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Thiết lập lớp Lá 1', exact: true })).toBeVisible();
  const classes = await page.request.get(endpoint);
  expect((await classes.json()).classes).toContainEqual(expect.objectContaining({ name: 'Lá 2', year: '2027–2028' }));
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
