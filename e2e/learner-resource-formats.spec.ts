import { expect, test } from '@playwright/test';

test('format layout separates discovery and shows an explicit saved state', async ({ page }, testInfo) => {
  await page.setViewportSize({width:1536,height:1024});
  await page.emulateMedia({reducedMotion:'reduce'});
  expect((await page.request.post('/api/v1/auth/login', {
    data: { role: 'student', email: 'hocsinh', password: 'hocsinh' },
  })).ok()).toBe(true);
  await page.goto('/resources?kind=flashcard');
  const card = page.getByLabel('Danh sách học liệu', {exact:true}).locator('article').first();
  const toggle = card.getByRole('button', {name:'Lưu Cá hề', exact:true});
  await expect(toggle).toHaveText('Lưu');
  await expect(page.getByRole('navigation', {name:'Chủ đề học liệu'})).toHaveCount(0);
  await toggle.click();
  await expect(card.getByRole('button', {name:'Bỏ lưu Cá hề', exact:true})).toHaveText('Đã lưu');
  await page.evaluate(async () => {
    window.scrollTo({top:0,behavior:'instant'});
    await document.querySelector<HTMLImageElement>('.resources-banner-art img')?.decode();
  });
  await page.screenshot({path:testInfo.outputPath('flashcards-desktop.png')});
  const filter = page.getByRole('group', {name:'Lọc học liệu'}).getByRole('button', {name:'Đã lưu', exact:true});
  await filter.click();
  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', {name:'Bỏ lưu Cá hề', exact:true}).click();
  await expect(page.getByText('Bé chưa lưu học liệu nào.')).toBeVisible();
  await page.getByRole('button', {name:'Các nhóm học liệu', exact:true}).click();
  await expect(page.getByRole('region', {name:'Thẻ học liệu 2'}).getByRole('button', {name:/^Mở nhóm /})).toBeVisible();
});

test('populated formats use the mockup layouts and audio plays inline', async ({ page }, testInfo) => {
  await page.setViewportSize({width:1536,height:1024});
  await page.emulateMedia({reducedMotion:'reduce'});
  expect((await page.request.post('/api/v1/auth/login', {
    data: {role:'student', email:'hocsinh', password:'hocsinh'},
  })).ok()).toBe(true);
  const pdf = '/assets/learner-content/v1/pdf/flashcards-1.webp';
  const audio = '/assets/learner-content/v3/audio/reef-2-0.mp3';
  await page.route(/\/api\/v1\/resources\?/, route => {
    const kind = new URL(route.request().url()).searchParams.get('kind');
    if (!kind) return route.fallback();
    const titles = kind === 'audio' ? ['Cá hề','Rùa biển','Rạn san hô'] : ['Cá hề'];
    return route.fulfill({json:{total:titles.length,nextCursor:null,items:titles.map((title, index) => ({
      id:`sample-${kind}-${index}`, kind, title, coverUrl:pdf, content:{},
      mediaUrl:kind === 'audio' ? audio : kind === 'download' ? '/assets/learner-content/v1/pdf/book.pdf' : null,
    }))}});
  });
  await page.goto('/resources?kind=audio');
  const results = page.getByLabel('Danh sách học liệu', {exact:true});
  await expect(results).toHaveAttribute('data-layout', 'audio');
  await expect(results).toHaveCSS('display', 'grid');
  await results.getByRole('button', {name:'Phát Cá hề'}).click();
  await expect(results.getByRole('slider', {name:'Vị trí phát Cá hề'})).toBeVisible();
  await expect(results.getByRole('button', {name:'Tạm dừng Cá hề'})).toHaveCSS('border-radius', '50%');
  await page.evaluate(async () => {
    window.scrollTo({top:0,behavior:'instant'});
    await document.querySelector<HTMLImageElement>('.resources-banner-art img')?.decode();
  });
  await page.screenshot({path:testInfo.outputPath('audio-desktop.png')});
  await results.getByRole('button', {name:'Phát Rùa biển'}).click();
  await expect(results.getByRole('button', {name:'Phát Cá hề'})).toBeVisible();
  await results.getByRole('button', {name:'Tạm dừng Rùa biển'}).click();
  await expect(results.getByRole('button', {name:'Phát Rùa biển'})).toBeVisible();
  const formats = page.getByRole('navigation', {name:'Phân loại học liệu'});
  await page.emulateMedia({reducedMotion:'no-preference'});
  for (const [label, target] of [['Hình ảnh','img'], ['Video','.source-cover-action']]) {
    await formats.getByRole('button', {name:label, exact:true}).click();
    const cover = results.getByRole('button', {name:'Mở học liệu: Cá hề', exact:true});
    await cover.hover();
    await expect(cover.locator(target)).not.toHaveCSS('transform', 'none');
    await expect(cover).toHaveCSS('transform', 'none');
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(results.locator('.source-cover-action')).toHaveCSS('transform', 'none');
  await page.setViewportSize({width:320,height:700});
  for (const [label, layout, aspect] of [
    ['Hình ảnh','image','3 / 2'], ['Video','video','16 / 9'], ['Phiếu học tập','worksheet','1 / 1'],
    ['Poster','poster','1 / 1'], ['Tranh tô màu','coloring','1 / 1'],
  ]) {
    await formats.getByRole('button', {name:label, exact:true}).click();
    await expect(results).toHaveAttribute('data-layout', layout);
    await expect(results.getByRole('button', {name:'Mở học liệu: Cá hề'})).toHaveCSS('aspect-ratio', aspect);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  }
  await formats.getByRole('button', {name:'Kho học liệu tải về'}).click();
  await expect(results.getByRole('link', {name:'Tải xuống Cá hề'})).toHaveAttribute('download', '');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('Học liệu opens grouped discovery and keeps the linked resource context', async ({ page }) => {
  const login = await page.request.post('/api/v1/auth/login', {
    data: { role: 'student', email: 'hocsinh', password: 'hocsinh' },
  });
  expect(login.ok()).toBe(true);
  const groups = await (await page.request.get('/api/v1/resource-groups?limit=5')).json();
  const coverUrl = '/assets/generated/resources/shells_beach_card.jpg';
  const longName = 'Nhóm mới về sự sống dọc theo các vùng biển của Việt Nam';
  const fixtureGroups = [
    ...groups.items.map((group: {title: string}) => group.title === 'Rạn san hô'
      ? {...group, coverUrl, coverCrop:{x:.25,y:.75,scale:2}} : group),
    ...Array.from({length:30 - groups.items.length}, (_, index) => ({
      ...groups.items[0], id:`test-extra-group-${index}`, title:index === 0 ? longName : `Nhóm mẫu ${index + 1}`,
      coverUrl:null, memberCount:0, libraryMemberCount:0,
    })),
    {...groups.items[0], title:'Nhóm kiểm thử trang cuối'},
  ];
  await page.route(/\/api\/v1\/resource-groups\?/, async route => {
    const query = new URL(route.request().url()).searchParams;
    if (query.get('limit') !== '5' || query.get('q')) return route.fallback();
    const offset = Number(query.get('cursor') || 0);
    await route.fulfill({json:{items:fixtureGroups.slice(offset,offset + 5),
      total:fixtureGroups.length,nextCursor:offset + 5 < fixtureGroups.length ? String(offset + 5) : null}});
  });
  await page.goto('/resources');
  const formats = page.getByRole('navigation', { name: 'Phân loại học liệu' });
  await expect(formats.getByRole('button', { pressed: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Khám phá theo nhóm' })).toBeVisible();
  const reef = page.getByRole('region', {name:'Rạn san hô',exact:true});
  const deck = page.getByRole('region', {name:'Thẻ học liệu 2',exact:true});
  await expect(page.locator('.resource-group-list .resource-group-section')).toHaveCount(5);
  await expect(page.locator('.resource-group-list article')).toHaveCount(0);
  await expect(reef.locator('img')).toHaveAttribute('src', coverUrl);
  await expect(reef.locator('img')).toHaveCSS('object-position', '25% 75%');
  expect(await reef.locator('img').evaluate(img => img.style.transform)).toBe('translate(25%, -25%) scale(2)');
  const reefGroup = fixtureGroups.find(group => group.title === 'Rạn san hô');
  const reefListing = await (await page.request.get(`/api/v1/resources?groupId=${reefGroup.id}&library=1&limit=5`)).json();
  await expect(reef.getByText(`${reefListing.total} học liệu`, {exact:true})).toBeVisible();
  const noCover = page.getByRole('region', {name:longName,exact:true});
  await expect(noCover.locator('img')).toHaveCount(0);
  await expect(noCover.locator('.resource-group-portrait svg')).toBeVisible();
  await expect(noCover.getByText('0 học liệu')).toBeVisible();
  await expect(page.getByRole('region', {name:'Tảo đỏ',exact:true})).toHaveCount(0);
  await expect(page.getByRole('navigation', {name:'Chủ đề học liệu'})).toHaveCount(0);
  await page.setViewportSize({width:320,height:780});
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await expect(noCover.getByRole('button', {name:`Mở nhóm ${longName}`})).toBeVisible();
  await page.setViewportSize({width:1536,height:1024});
  await deck.getByRole('button', {name:/^Mở nhóm /}).click();
  await expect(page).toHaveURL(/group=/);
  const groupItems = page.getByLabel('Danh sách học liệu',{exact:true});
  await expect(groupItems.locator('article')).toHaveCount(5);
  const firstResource = groupItems.locator('article').first();
  await firstResource.getByRole('button', {name:/^Lưu /}).click();
  await firstResource.getByRole('button', {name:/^Mở học liệu:/}).first().click();
  await expect(page.locator('.resource-observation').getByRole('heading', {name:'Cá hề',exact:true})).toBeVisible();
  await expect(page.getByRole('button', {name:'Bỏ lưu học liệu',exact:true})).toBeVisible();
  await page.locator('.resource-detail-back').click();
  await expect(groupItems.locator('article')).toHaveCount(5);
  await groupItems.locator('article').first().getByRole('button', {name:/^Bỏ lưu /}).click();
  await page.getByRole('button', {name:'Các nhóm học liệu',exact:true}).click();
  const ocean = page.locator('.resource-seascape[data-resource-scene="learner"]');
  await expect(ocean).toHaveCSS('background-repeat', 'no-repeat');
  expect(await ocean.evaluate(node => {
    const style = getComputedStyle(node);
    return style.backgroundImage.includes('resource-group-gallery.webp') &&
      style.maskImage.includes('linear-gradient') && node.getBoundingClientRect().height <= 1100;
  })).toBe(true);
  const groupPager = page.getByRole('navigation', { name: 'Phân trang nhóm' });
  await expect(groupPager.getByText('…', {exact:true})).toBeVisible();
  await expect(groupPager.getByRole('button', { name: 'Trang trước' })).toBeDisabled();
  await groupPager.getByRole('button', { name: 'Trang sau' }).click();
  await expect(groupPager.getByRole('button', { name: 'Trang 2' })).toHaveAttribute('aria-current','page');
  await expect(page).toHaveURL(/catalogPage=2/);
  await expect(deck).toHaveCount(0);
  await groupPager.getByRole('button', { name: 'Trang trước' }).click();
  await expect(reef).toBeVisible();
  await groupPager.getByRole('button', { name: 'Trang 7', exact:true }).click();
  const lastGroup = page.getByRole('button', { name: 'Mở nhóm Nhóm kiểm thử trang cuối', exact:true });
  await expect(lastGroup).toBeVisible();
  await expect(page.locator('.resource-group-list .resource-group-section')).toHaveCount(1);
  await expect(groupPager.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
  await lastGroup.click();
  await expect(groupItems.locator('article').first()).toBeVisible();
  await page.getByRole('button', { name: 'Các nhóm học liệu', exact:true }).click();
  await expect(page).toHaveURL(/catalogPage=7/, { timeout: 3000 });
  await expect(lastGroup).toBeVisible();
  await groupPager.getByRole('button', { name: 'Trang 1', exact:true }).click();
  await expect(reef).toBeVisible();
  await page.locator('.resource-search-row').getByRole('button', { name: 'Chọn nhóm học liệu' }).click();
  const groupPicker = page.getByRole('dialog');
  await groupPicker.getByRole('searchbox', { name: 'Tìm nhóm học liệu' }).fill('Rạn');
  await expect(groupPicker.getByRole('button', { name: 'Rạn san hô' })).toBeVisible();
  await groupPicker.getByRole('button', { name: 'Đóng chọn nhóm' }).click();
  await expect(groupPicker).toBeHidden();
  await page.getByRole('searchbox', { name: 'Tìm học liệu' }).fill('Cá hề');
  await expect(page.getByRole('heading', { name: 'Kết quả tìm kiếm' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mở học liệu: Cá hề', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Chọn nhóm học liệu', exact: true }).click();
  await groupPicker.getByRole('button', { name: 'Rạn san hô' }).click();
  await expect(page.getByRole('heading', { name: 'Trong nhóm này' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Tìm học liệu' })).toHaveValue('Cá hề');
  await expect(page.getByRole('button', { name: 'Mở học liệu: Cá hề', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Các nhóm học liệu' }).click();

  await formats.getByRole('button', { name: 'Flashcards' }).click();
  await expect(formats.getByRole('button', { name: 'Flashcards' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.resource-group-section')).toHaveCount(0);
  const listing = page.getByLabel('Danh sách học liệu', {exact:true});
  await expect(listing.locator('article')).toHaveCount(5);
  await expect(listing).toHaveCSS('display', 'grid');
  await expect(listing.locator('article img').first()).toHaveCSS('object-fit', 'contain');
  const pager = page.getByRole('navigation', { name: 'Phân trang học liệu' });
  await expect(pager.locator('.catalog-pagination-gap')).toBeVisible();
  const flashcards = await (await page.request.get('/api/v1/resources?limit=5&kind=flashcard&page=1&library=1')).json();
  const lastPage = Math.ceil(flashcards.total / 5);
  const lastPageName = `Trang ${lastPage}`;
  const lastCount = flashcards.total - (lastPage - 1) * 5;
  const firstTitle = await listing.getByRole('button', {name:/^Mở học liệu:/}).first().getAttribute('aria-label');
  await pager.getByRole('button', { name:lastPageName, exact:true }).click();
  await expect(page).toHaveURL(new RegExp(`resourcePage=${lastPage}(?:&|$)`));
  await expect(pager.getByRole('button', { name:lastPageName, exact:true })).toHaveAttribute('aria-current','page');
  await expect(listing.locator('article')).toHaveCount(lastCount);
  await expect(listing.getByRole('button', {name:/^Mở học liệu:/}).first()).not.toHaveAttribute('aria-label',firstTitle!);
  await listing.getByRole('button', { name: /^Mở học liệu:/ }).first().click();
  await page.locator('.resource-detail-back').click();
  await expect(pager.getByRole('button', { name:lastPageName, exact:true })).toHaveAttribute('aria-current','page');
  await page.reload();
  await expect(listing.locator('article')).toHaveCount(lastCount);
  await expect(pager.getByRole('button', { name:lastPageName, exact:true })).toHaveAttribute('aria-current','page');
  await pager.getByRole('button', { name:'Trang 1', exact:true }).click();
  await expect(pager.getByRole('button', { name:'Trang 1', exact:true })).toHaveAttribute('aria-current','page');
  await expect(page.locator('.resource-observation')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mở học liệu: Cá hề', exact: true }).first().click();
  await expect(page).toHaveURL(/\/resources\/[0-9a-f-]{36}/);
  await expect(page.locator('.resource-observation').getByRole('heading', { name: 'Cá hề', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mặt sau' }).click();
  await expect(page.getByRole('button', { name: 'Mặt trước' })).toBeEnabled();
  await expect(page.getByRole('link', {name:'Xem trang trong PDF'})).toHaveAttribute('href', /#page=2$/);

  await page.locator('.resource-detail-back').click();
  for (const name of ['Hình ảnh','Audio','Video','Tranh tô màu','Phiếu học tập','Poster','Kho học liệu tải về']) {
    await formats.getByRole('button', { name, exact: true }).click();
    await expect(formats.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Chưa có học liệu trong mục này.', {exact:true})).toBeVisible();
    await expect(listing.locator('article')).toHaveCount(0);
  }

  await page.getByRole('button', { name: 'Các nhóm học liệu', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Khám phá theo nhóm' })).toBeVisible();
  await reef.getByRole('button', { name: 'Mở nhóm Rạn san hô', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Tìm học liệu' }).fill('Cá hề');
  await groupItems.getByRole('button', { name: 'Mở học liệu: Cá hề', exact: true }).first().click();
  const legacy = page.locator('.resource-observation');
  await expect(legacy.getByRole('heading', { name: 'Cá hề', exact: true })).toBeVisible();
  await expect(legacy.getByRole('button', {name:'Flashcard',exact:true})).toHaveAttribute('aria-current','true');
  await legacy.getByRole('button', { name: 'Tô màu' }).click();
  await expect(page).toHaveURL(/\/creative\/drawing\?.*returnResource=/);
});

test('teacher library jumps directly to the last page and resets on search', async ({page}) => {
  const login = await page.request.post('/api/v1/auth/login', {
    data:{role:'teacher',email:'colinh@bluesteam.edu.vn',password:'daiduong2026'},
  });
  expect(login.ok()).toBe(true);
  const groups = await (await page.request.get('/api/v1/teacher/resource-groups?' + new URLSearchParams({q:'Thẻ học liệu 2',limit:'5'}))).json();
  const deck = groups.items.find((group: {title: string}) => group.title === 'Thẻ học liệu 2');
  expect(deck?.memberCount).toBe(27);
  await page.goto('/teacher/resources?group=' + deck.id);
  const rows = page.locator('.teacher-resource-table tbody tr');
  await expect(rows).toHaveCount(5);
  const pager = page.getByRole('navigation', {name:'Phân trang học liệu'});
  await expect(pager.locator('.catalog-pagination-gap')).toBeVisible();
  await pager.getByRole('button', {name:'Trang 6',exact:true}).click();
  await expect(rows).toHaveCount(2);
  await expect(pager.getByRole('button', {name:'Trang 6',exact:true})).toHaveAttribute('aria-current','page');
  await page.getByRole('searchbox', {name:'Tìm học liệu',exact:true}).fill('Cá hề');
  await expect(rows.first()).toContainText('Cá hề');
  await expect(pager).toHaveCount(0);
});

test('a retired saved item can be cleared and the reef recording still plays in its own context', async ({ page }) => {
  expect((await page.request.post('/api/v1/auth/login', {
    data:{role:'student', email:'hocsinh', password:'hocsinh'},
  })).ok()).toBe(true);
  await page.addInitScript(() => localStorage.setItem('bluesteam_ocean_source_bookmarks_v1', JSON.stringify(['book-21'])));
  await page.goto('/resources?kind=worksheet&saved=1&source=1');
  await expect(page.getByText('Học liệu này đã được gỡ khỏi thư viện.')).toBeVisible();
  await page.getByRole('button', {name:'Bỏ lưu', exact:true}).click();
  await expect(page.getByText('Bé chưa lưu học liệu nào.')).toBeVisible();
  await page.goto('/resources/reef-2?source=1&kind=reef');
  const detail = page.locator('.resource-observation');
  await expect(detail.getByRole('heading',{name:'San hô não', exact:true})).toBeVisible();
  const track = page.waitForResponse(response => /\/audio\/reef-2-0\.mp3$/.test(response.url()) && response.ok());
  await detail.getByRole('button',{name:'Nghe đặc điểm', exact:true}).click();
  await track;
  await expect(detail.getByRole('button',{name:'Audio', exact:true})).toHaveCount(0);
});

test('Học liệu keeps grouped filters and the source preview within a 320px screen', async ({ page }, testInfo) => {
  expect((await page.request.post('/api/v1/auth/login', {
    data: { role: 'student', email: 'hocsinh', password: 'hocsinh' },
  })).ok()).toBe(true);
  await page.setViewportSize({ width: 320, height: 650 });
  await page.goto('/resources');
  await expect(page.getByRole('heading', { name: 'Khám phá theo nhóm' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
  const filters = page.getByRole('group', { name: 'Lọc học liệu' });
  const search = filters.getByRole('searchbox', { name: 'Tìm học liệu' });
  await expect(search).toBeVisible();
  await search.click();
  await expect(search).toBeFocused();
  const frame = search.locator('..');
  await expect(frame).toHaveCSS('border-radius', '10px');
  await expect(frame).toHaveCSS('border-width', '1px');
  await expect(frame).toHaveCSS('border-color', 'rgb(40, 103, 121)');
  await expect(frame).toHaveCSS('outline-style', 'none');
  await expect(frame).toHaveCSS('box-shadow', 'none');
  await expect(search).toHaveCSS('border-width', '0px');
  await expect(search).toHaveCSS('outline-style', 'none');
  await expect(search).toHaveCSS('box-shadow', 'none');
  await search.press('Tab');
  const group = filters.getByRole('button', { name: 'Chọn nhóm học liệu' });
  await expect(group).toBeFocused();
  await group.press('Enter');
  const picker = page.getByRole('dialog');
  const groupSearch = picker.getByRole('searchbox', {name:'Tìm nhóm học liệu'});
  await expect(groupSearch).toBeFocused();
  await groupSearch.fill('Thẻ học liệu 2');
  await picker.getByRole('button', {name:'Thẻ học liệu 2',exact:true}).click();
  await expect(picker).toBeHidden();
  await expect(page).toHaveURL(/group=/);
  await search.fill('Cá hề');
  await expect(page).toHaveURL(/q=/);
  const card = page.getByRole('button', { name: 'Mở học liệu: Cá hề', exact: true }).first();
  await expect(card).toBeVisible();
  expect(await filters.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await card.click();
  await expect(page.getByRole('button', { name: 'Mặt sau' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({path:testInfo.outputPath('flashcard-detail-mobile.png'),animations:'disabled'});

});

test('separates photo and flashcard and expands linked formats on a small screen', async ({ page }, testInfo) => {
  expect((await page.request.post('/api/v1/auth/login', {
    data:{role:'student', email:'hocsinh', password:'hocsinh'},
  })).ok()).toBe(true);
  await page.setViewportSize({width:320,height:650});
  const variants = [
    {id:'photo',kind:'image',title:'Ảnh cá hề'},
    {id:'audio-a',kind:'audio',title:'Lời kể thứ nhất'},
    {id:'audio-b',kind:'audio',title:'Lời kể thứ hai'},
    {id:'clip',kind:'video',title:'Video cá hề'},
    {id:'poster',kind:'poster',title:'Poster cá hề'},
  ];
  await page.route('**/api/v1/learner-ocean/items/detail-fixture-*', async route => {
    const id = new URL(route.request().url()).pathname.split('/').at(-1)!;
    const choice = variants.find(variant => 'detail-fixture-' + variant.id === id);
    await route.fulfill({json:{id, kind:choice?.kind || 'flashcard', title:choice?.title || 'Cá hề', group:'Rạn san hô',
      variants:variants.map(variant => ({...variant,id:'detail-fixture-' + variant.id}))}});
  });
  await page.goto('/resources/detail-fixture-card?source=1&kind=flashcard');
  const formats = page.getByRole('group', {name:'Định dạng học liệu'});
  await expect(formats.getByRole('button', {name:'Flashcard',exact:true})).toHaveAttribute('aria-current','true');
  await expect(formats.getByRole('button', {name:'Ảnh',exact:true})).toBeVisible();
  await expect(formats.getByRole('button', {name:'Video',exact:true})).toHaveCount(0);
  await formats.screenshot({path:testInfo.outputPath('dinh-dang-thu-gon.png')});
  await formats.getByRole('button', {name:/Xem thêm/}).click();
  await expect(formats.getByRole('button', {name:'Video',exact:true})).toBeVisible();
  await formats.getByRole('button', {name:/^Audio/}).click();
  const choices = page.getByRole('region',{name:'Chọn học liệu liên kết'});
  await expect(choices.getByRole('button')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const formatSection = page.locator('.observation-format-section');
  await formatSection.evaluate(element => element.scrollIntoView({block:'center'}));
  await formatSection.screenshot({path:testInfo.outputPath('dinh-dang-mo-rong.png')});
  await choices.getByRole('button',{name:'Lời kể thứ hai'}).click();
  await expect(page).toHaveURL(/detail-fixture-audio-b/);
  await expect(formats.getByRole('button', {name:/^Audio/})).toHaveAttribute('aria-current','true');
});
