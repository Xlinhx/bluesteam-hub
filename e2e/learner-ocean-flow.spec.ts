import { expect, test } from '@playwright/test';

test.use({ launchOptions:{args:['--enable-unsafe-swiftshader']} });

test('learner explores source zones, keeps a study log and plays source media', async ({ page }) => {
  const registration = await page.request.post('/api/v1/auth/register', { data: {
    role: 'student', email: `${crypto.randomUUID()}@example.test`, password: 'Ocean-test-123', displayName: 'Bé Na',
  } });
  expect(registration.status()).toBe(201);
  const profile = await page.request.put('/api/v1/learner-ocean/profile', {
    data: { name: 'Bé Na', school: 'Trường Xanh', schoolYear: '2026–2027', className: '1A' },
  });
  expect(profile.status()).toBe(200);

  await page.goto('/learning');
  await expect(page.getByRole('heading', {name:'Chọn đường khám phá'})).toBeVisible();
  await page.getByRole('button', {name:'Khu vực đánh bắt', exact:true}).click();
  await expect(page.getByRole('navigation', {name:'Điểm khám phá'}).getByRole('button', {name:'Rạn san hô'})).toBeVisible();
  await page.goto('/learning?axis=vertical&zone=upper&view=intro');
  await expect(page.getByRole('button', {name:'Nghe giới thiệu',exact:true})).toBeVisible();
  await page.getByRole('button', {name:'Chọn nhóm sinh vật',exact:true}).click();
  await page.getByRole('button', {name:/Động vật có vú biển/}).click();
  await page.getByLabel('Tìm sinh vật').fill('ca heo mui chai');
  await expect(page).toHaveURL(/q=ca\+heo\+mui\+chai/);
  await page.getByRole('button', {name:'Cá heo mũi chai',exact:true}).click();
  await page.getByRole('button', {name:'Quan sát trong vùng'}).click();
  await expect(page.getByRole('heading', {name:'Cá heo thở dưới nước được không?'})).toBeVisible();
  await page.getByRole('button', {name:'Phóng to',exact:true}).click();
  const dolphin = page.locator('.learning-dive-dolphin');
  const camera = await dolphin.getAttribute('style');
  await page.getByRole('button', {name:'Quan sát',exact:true}).click();
  await page.getByRole('button', {name:'Mở thẻ sinh vật'}).click();
  await page.getByRole('button', {name:'Bơi tiếp'}).click();
  await expect(dolphin).toHaveAttribute('style', camera!);
  await page.getByRole('button', {name:'Mở thẻ sinh vật'}).click();
  await page.getByRole('button', {name:'Ghi vào sổ'}).click();
  await expect(page.getByText('ĐÃ GHI VÀO SỔ', {exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByText('ĐÃ GHI VÀO SỔ', {exact:true})).toBeVisible();
  await page.goto('/profile');
  await expect(page.getByRole('button', {name:'Cá heo mũi chai',exact:true})).toBeVisible();

  await page.setViewportSize({width:390,height:844});
  await page.goto('/learning?axis=horizontal&view=world&spot=reef');
  await expect(page.getByRole('heading', { name: 'Rạn san hô', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'San hô cành', exact: true }).click();
  const card = page.getByRole('region', { name: 'San hô cành', exact: true });
  await expect(card.getByRole('heading', { name: 'San hô cành' })).toBeVisible();
  const narration = page.waitForResponse(response => /\/reef-4-\d+\.mp3$/.test(response.url()) && response.ok());
  await card.getByRole('button', { name: 'Nghe', exact: true }).click();
  expect((await narration).headers()['content-type']).toContain('audio/mpeg');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('the real model loads and Model Inspector grants exactly one award', async ({ page }) => {
  const registration = await page.request.post('/api/v1/auth/register', { data: {
    role: 'student', email: `${crypto.randomUUID()}@example.test`, password: 'Ocean-test-123', displayName: 'Bé Mây',
  } });
  expect(registration.status()).toBe(201);
  const unverifiedObservation = await page.request.post('/api/v1/learner-ocean/model-runs', {
    data:{modelId:'digitallife-72b',mode:'vr'},
  });
  expect(unverifiedObservation.status()).toBe(403);
  await page.goto('/learning?zone=upper&view=organism&selected=upper-5');
  await page.getByRole('button', {name:'Quan sát 3D'}).click();
  await expect(page.locator('.learning-model-canvas canvas')).toBeVisible();
  const inspector = page.getByRole('button', {name:'Model Inspector'});
  await expect(inspector).toBeEnabled();
  await inspector.click();
  await expect(page.getByText('+100 điểm khám phá!', {exact:true})).toBeVisible();
  await expect(inspector).toHaveAttribute('aria-pressed','true');
  await inspector.click();
  await inspector.click();
  await expect(page.getByText('Bé đã nhận điểm cho chế độ này trên mô hình.', {exact:true})).toBeVisible();
});

test('source images and shared species progress survive the active catalog', async ({ page }) => {
  const api = '/api/v1/learner-ocean/';
  const registration = await page.request.post('/api/v1/auth/register', { data: {
    role:'student', email:`${crypto.randomUUID()}@example.test`, password:'Ocean-test-123', displayName:'Bé Mây',
  } });
  expect(registration.status()).toBe(201);
  for (const id of ['reef-13','reef-15']) {
    const item = await (await page.request.get(api + 'items/' + id)).json();
    expect(item.images).toHaveLength(1);
    expect((await page.request.get(item.images[0])).headers()['content-type']).toContain('image/webp');
  }
  const profile = await page.request.put(api + 'profile', {
    data:{name:'Bé Mây',school:'Trường Xanh',schoolYear:'2026–2027',className:'1A'},
  });
  expect(profile.status()).toBe(200);
  expect((await page.request.post(api + 'studied/upper-23')).status()).toBe(201);
  expect((await (await page.request.get(api + 'items/reef-19')).json()).learned).toBe(true);
  expect((await page.request.post(api + 'studied/reef-19')).status()).toBe(201);
  expect((await (await page.request.get(api + 'profile')).json()).learned).toBe(1);
  expect((await (await page.request.get(api + 'history')).json()).items).toHaveLength(1);
});
