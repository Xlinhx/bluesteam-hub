import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { VISUAL_USAGE_FIXTURE_14_DAYS } from './fixtures/interactive-visual';

const output = 'screenshots/interactive-teacher-v6';
const teacher = { email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' };

test('teacher library, 14-day visual fixture, detail and preview', async ({ page }) => {
  mkdirSync(output, { recursive: true });
  expect((await page.request.post('/api/v1/auth/login', { data: teacher })).ok()).toBeTruthy();
  const errors: string[] = [];
  const failedImages: string[] = [];
  let previewWrites = 0;
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.request().resourceType() === 'image' && response.status() >= 400) failedImages.push(response.url()); });
  page.on('request', request => { if (request.method() === 'POST' && request.url().includes('/interactive-usage/runs')) previewWrites++; });
  for (const viewport of [{width:1536,height:1024}, {width:390,height:844}]) {
    const suffix = viewport.width === 390 ? 'mobile' : 'desktop';
    await page.setViewportSize(viewport);
    await page.goto('/teacher/interactive?kind=game');
    await expect(page.locator('.curated-card').first()).toBeVisible();
    await page.locator('.interactive-seascape__layer img').evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
    await page.locator('.curated-card .activity-thumbnail').evaluateAll(images => Promise.all(images.map(image => { const img = image as HTMLImageElement; img.loading = 'eager'; return img.decode(); })));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${output}/library-${suffix}-final.png` });
    await page.getByRole('button', {name:'Xem thử', exact:true}).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(previewWrites).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.route('**/api/v1/teacher/interactive-usage?**', async route => {
      const response = await route.fetch();
      const report = await response.json();
      report.meta.availableFrom = '2026-10-01T00:00:00+07:00';
      report.meta.filter.asOf = '2026-10-26T12:00:00+07:00';
      report.daily = VISUAL_USAGE_FIXTURE_14_DAYS;
      report.rows = [
        ['fa993c7f-53e4-49cf-bde5-0f8582e1c04a', 'Về đúng nhà', 8, 6],
        ['d895988a-da2a-466e-88e0-f52c3a6de53a', 'Tìm bóng hình', 6, 5],
        ['cab7e857-13c6-4005-b96d-2ee902bd079b', 'Chọn con vật', 4, 3],
      ].map(([contentId, title, opens, interactedRuns]) => ({
        contentType:'activity', contentId, kind:'game', title, coverUrl:null,
        availableVersions:[1], defaultVersion:1, lastOpenedAt:'2026-10-25T05:00:00Z', opens, interactedRuns,
      }));
      report.nextCursor = null;
      for (const [key, value] of Object.entries({opens:18, interactedRuns:14, usedActivities:3})) {
        report.summary[key] = {value, coverage:'collected', availableFrom: report.meta.availableFrom};
      }
      await route.fulfill({response, json:report});
    });
    await page.goto('/teacher/interactive?kind=game&view=usage&range=14');
    await expect(page.locator('.usage-summary')).toContainText('18');
    await expect(page.getByRole('button', {name:'Xuất số liệu'}).locator('span')).toBeVisible();
    await expect(page.locator('.usage-chart-caption')).toContainText('10 lượt trong 7 ngày gần đây · 8 lượt');
    await page.locator('.usage-activity-row .activity-thumbnail').evaluateAll(images => Promise.all(images.map(image => { const img = image as HTMLImageElement; img.loading = 'eager'; return img.decode(); })));
    await page.screenshot({path:`${output}/trends-${suffix}-fixture.png`});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.unroute('**/api/v1/teacher/interactive-usage?**');
    await page.goto('/teacher/interactive?kind=game&view=usage');
    await expect(page.locator('.usage-activity-row').first()).toBeVisible();
    await page.getByRole('button',{name:'Xem chi tiết'}).first().click();
    await expect(page.locator('.usage-identity')).toBeVisible();
    await page.screenshot({path:`${output}/detail-${suffix}-live.png`});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  expect(errors).toEqual([]);
  expect(failedImages).toEqual([]);
});

test('learner keeps grouping, audio and search on the shared seascape', async ({ page }) => {
  const learnerDir = 'screenshots/interactive-learner-v6';
  mkdirSync(learnerDir, { recursive:true });
  expect((await page.request.post('/api/v1/auth/login', {data:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
  let usageWrites = 0;
  page.on('request', request => { if (request.method() === 'POST' && request.url().includes('/interactive-usage/runs')) usageWrites++; });
  for (const viewport of [{width:1536,height:1024},{width:390,height:844}]) {
    await page.setViewportSize(viewport);
    await page.goto('/interactive?kind=game');
    await expect(page.getByRole('heading',{name:'Ngôi nhà đại dương'})).toBeVisible();
    await expect(page.getByLabel('Nghe hướng dẫn trang Tương tác')).toBeVisible();
    await page.getByLabel('Nghe hướng dẫn trang Tương tác').click();
    await page.locator('.interactive-seascape__layer img, .interactive-world__creature, .ocean-activity-card .activity-thumbnail').evaluateAll(images => Promise.all(images.map(image => { const img = image as HTMLImageElement; img.loading = 'eager'; return img.decode(); })));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({path:`${learnerDir}/library-${viewport.width === 390 ? 'mobile' : 'desktop'}-final.png`});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const groups = page.getByRole('combobox',{name:'Chọn nhóm hoạt động'});
    await groups.selectOption('__all');
    await expect(page).toHaveURL(/view=all/);
    await groups.selectOption('');
    await expect(page.getByRole('heading',{name:'Ngôi nhà đại dương'})).toBeVisible();
    const groupId = await groups.locator('option').nth(2).getAttribute('value');
    await groups.selectOption(groupId!);
    await expect(page).toHaveURL(/groupId=/);
    await expect(page.getByRole('button',{name:'Về các nhóm'})).toBeVisible();
    await groups.selectOption('');
    await expect(page.getByRole('heading',{name:'Ngôi nhà đại dương'})).toBeVisible();
    await page.getByLabel('Tìm hoạt động',{exact:true}).fill('Về đúng nhà');
    await page.getByRole('button',{name:'Tìm',exact:true}).click();
    await expect(page).toHaveURL(/q=/);
    await expect(page.getByRole('heading',{name:'Về đúng nhà'}).first()).toBeVisible();
    expect(usageWrites).toBe(0);
  }
});

test('learner matches teacher world and card widths across screen sizes', async ({ page }) => {
  for (const viewport of [{width:1536,height:1024},{width:768,height:1024},{width:390,height:844},{width:360,height:800},{width:430,height:932}]) {
    await page.setViewportSize(viewport);
    expect((await page.request.post('/api/v1/auth/login', {data:teacher})).ok()).toBeTruthy();
    await page.goto('/teacher/interactive?kind=game');
    await expect(page.locator('.curated-card').first()).toBeVisible();
    const teacherWorld = await page.locator('.interactive-world').first().boundingBox();
    const teacherCard = await page.locator('.curated-card').first().boundingBox();
    expect((await page.request.post('/api/v1/auth/login', {data:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
    await page.goto('/interactive?kind=game');
    await expect(page.locator('.ocean-activity-card').first()).toBeVisible();
    const learnerWorld = await page.locator('.interactive-world').first().boundingBox();
    const learnerCard = await page.locator('.ocean-activity-card').first().boundingBox();
    expect(Math.abs(learnerWorld!.width-teacherWorld!.width)).toBeLessThanOrEqual(1);
    expect(learnerWorld!.height).toBe(teacherWorld!.height);
    expect(Math.abs(learnerCard!.width-teacherCard!.width)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.locator('.ocean-play-button').first().scrollIntoViewIfNeeded();
    const play = await page.locator('.ocean-play-button').first().boundingBox();
    expect(play!.height).toBeGreaterThanOrEqual(44);
    if (viewport.width<768) expect(play!.y+play!.height).toBeLessThanOrEqual(viewport.height-60);
    await page.screenshot({path:`screenshots/interactive-learner-v6/cards-${viewport.width}-final.png`});
  }
  await page.getByRole('button',{name:'Mở nhóm'}).first().click();
  await expect(page).toHaveURL(/groupId=/);
  await page.getByRole('button',{name:'Chơi ngay',exact:true}).first().click();
  await expect(page).toHaveURL(/\/interactive\/activities\//);
});

test('detail analysis variants and error state stay distinct', async ({ page }) => {
  expect((await page.request.post('/api/v1/auth/login', { data: teacher })).ok()).toBeTruthy();
  const contentId = 'fa993c7f-53e4-49cf-bde5-0f8582e1c04a';
  const metrics = (value: number | null) => ({value,coverage:value === null ? 'not_collected' : 'collected',availableFrom:'2026-10-01T00:00:00+07:00'});
  const choice = {id:'choice',label:'Giữ biển sạch',answeredRuns:6,choices:[{id:'a',label:'Nhặt rác',count:4},{id:'b',label:'Để lại',count:2}]};
  const analyses = {
    game: {definitionVersion:1,type:'game_first_answer',mechanic:'sorting',items:[{id:'a',label:'Cá ngựa',answeredRuns:6,firstIncorrectRuns:3,answers:[{id:'x',label:'Rạn san hô',count:3},{id:'y',label:'Cỏ biển',count:3}]}]},
    simulation: {definitionVersion:1,type:'simulation_steps',interactedRuns:6,steps:[{id:'a',label:'Bờ biển',visitedRuns:6},{id:'b',label:'Ngoài khơi',visitedRuns:4}]},
    scenario: {definitionVersion:1,type:'scenario_choices',scenes:[choice]},
    model3d: {definitionVersion:1,type:'model_opens',daily:VISUAL_USAGE_FIXTURE_14_DAYS.map(day=>({localDate:day.localDate,opens:day.opens})),interactionStatus:'not_collected'},
  };
  let kind: keyof typeof analyses = 'game';
  let failDetail = false;
  await page.route('**/api/v1/teacher/interactive-usage?**', route => route.fulfill({json:{meta:{filter:{kind,from:'2026-10-11T17:00:00Z',to:'2026-10-25T17:00:00Z',asOf:'2026-10-26T05:00:00Z',timezone:'Asia/Saigon'},availableFrom:'2026-10-01T00:00:00+07:00',metricDefinitionVersion:1,scope:'standalone_aggregate'},summary:{opens:metrics(8),interactedRuns:metrics(kind==='model3d'?null:6),usedActivities:metrics(1)},rows:[{contentType:kind==='model3d'?'model3d':'activity',contentId,kind,title:'Hoạt động minh họa',coverUrl:null,availableVersions:[1],defaultVersion:1,lastOpenedAt:null,opens:8,interactedRuns:kind==='model3d'?null:6}],nextCursor:null,daily:VISUAL_USAGE_FIXTURE_14_DAYS}}));
  await page.route('**/api/v1/teacher/interactive-usage/contents/**', route => failDetail ? route.fulfill({status:503,json:{message:'Không tải được'}}) : route.fulfill({json:{kind,version:1,opens:8,interactedRuns:kind==='model3d'?null:6,sections:[],analysis:analyses[kind]}}));
  for (const entry of ['game','simulation','scenario','model3d'] as const) {
    kind = entry;
    for (const viewport of [{width:1536,height:1024},{width:390,height:844}]) {
      await page.setViewportSize(viewport);
      await page.goto(`/teacher/interactive?kind=${kind}&view=usage&contentId=${contentId}&range=14`);
      await expect(page.locator('.usage-analysis-layout')).toBeVisible();
      await page.screenshot({path:`${output}/detail-${kind}-${viewport.width===390?'mobile':'desktop'}-fixture.png`, fullPage:true});
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      if (kind==='model3d') await expect(page.locator('.usage-summary')).toContainText('—');
    }
  }
  failDetail = true; kind = 'game';
  await page.goto(`/teacher/interactive?kind=game&view=usage&contentId=${contentId}`);
  await expect(page.getByRole('alert')).toContainText('Chưa tải được chi tiết');
  await page.screenshot({path:`${output}/detail-error-mobile-fixture.png`});
});

test('responsive reading area and compact worlds avoid overflow and unneeded artwork', async ({ page }) => {
  expect((await page.request.post('/api/v1/auth/login',{data:teacher})).ok()).toBeTruthy();
  const worlds: string[] = [];
  page.on('request', request => { if (/world-(model3d|game|simulation|scenario)\.webp/.test(request.url())) worlds.push(request.url()); });
  await page.goto('/teacher/interactive?kind=game&view=usage');
  await expect(page.locator('.interactive-worlds--compact')).toBeVisible();
  expect(worlds).toEqual([]);
  expect(await page.locator('iframe, canvas').count()).toBe(0);
  for (const viewport of [{width:1440,height:900},{width:1366,height:768},{width:768,height:1024},{width:360,height:800},{width:430,height:932}]) {
    await page.setViewportSize(viewport);
    await page.goto('/teacher/interactive?kind=game');
    await expect(page.locator('.curated-card').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${viewport.width}px`).toBeTruthy();
    if (viewport.width < 768) {
      const button = page.locator('.curated-card__actions button').last();
      await button.scrollIntoViewIfNeeded();
      const box = await button.boundingBox();
      expect(box && box.y + box.height <= viewport.height - 60).toBeTruthy();
    }
  }
});

test('shared coast stays fixed in the viewport while the content scrolls', async ({ page }) => {
  expect((await page.request.post('/api/v1/auth/login', {data:teacher})).ok()).toBeTruthy();
  for (const viewport of [{width:1536,height:1024},{width:390,height:844}]) {
    await page.setViewportSize(viewport);
    await page.goto('/teacher/interactive?kind=game');
    await expect(page.locator('.curated-card').first()).toBeVisible();
    await page.locator('.interactive-seascape__layer img').evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
    const coast = page.locator('.interactive-seascape__artwork');
    const before = await coast.boundingBox();
    await page.evaluate(() => window.scrollTo(0, Math.min(600, document.documentElement.scrollHeight - innerHeight)));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    const after = await coast.boundingBox();
    expect(after?.y).toBe(before?.y);
    await page.screenshot({path:`${output}/coast-${viewport.width === 390 ? 'mobile' : 'desktop'}-scrolled.png`});
  }
});
