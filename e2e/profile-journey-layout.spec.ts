import { expect, test } from '@playwright/test';

for (const { source, fails } of [{ source: '/interactive', fails: false }, { source: '/studio', fails: true }]) {
  test(`the profile transition releases when the personal information settles from ${source}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const account = { id: 'profile-navigation', role: 'student', displayName: 'Bé An', avatarKey: 'turtle' };
    await page.route('**/api/v1/auth/session', route => route.fulfill({ json: { account } }));
    await page.route('**/api/v1/learner-ocean/profile', route => fails
      ? route.fulfill({ status: 503, json: { message: 'Không thể tải hồ sơ' } })
      : route.fulfill({ json: { name: account.displayName, contextId: null, contexts: [], total: 252, learned: 0 } }));
    await page.goto(source);
    await page.evaluate(() => {
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = update => {
        const started = performance.now();
        const transition = start(async () => {
          await update?.();
          const profile = document.querySelector('.learner-profile');
          profile?.setAttribute('data-test-snapshot', JSON.stringify({
            elapsed: performance.now() - started,
            flow: document.documentElement.dataset.oceanProfileFlow,
            form: Boolean(profile.querySelector('.profile-form')),
            error: Boolean(profile.querySelector('.profile-personal-status [role=alert]')),
            gallery: Boolean(profile.querySelector('.profile-collection-section')),
          }));
        });
        return transition;
      };
    });

    await page.getByRole('button', { name: 'Hồ sơ', exact: true }).click();
    const profile = page.getByTestId('learner-profile-page');
    await expect(profile).toHaveAttribute('data-test-snapshot', /elapsed/);
    const { elapsed, ...snapshot } = JSON.parse((await profile.getAttribute('data-test-snapshot'))!);
    expect(snapshot).toEqual({ flow: 'enter', form: !fails, error: fails, gallery: false });
    expect(elapsed).toBeLessThan(600);
  });
}

test('selectors view history without changing the recording class and keep full content lists accessible', async ({ page }) => {
  const account = { id:'layout-learner', role:'student', displayName:'Nguyễn Minh An', avatarKey:'turtle' };
  const contexts = [
    { id:'class-a',school:'Tiểu học Hải Âu',schoolYear:'2026–2027',className:'3A' },
    { id:'class-b',school:'Tiểu học Hải Âu',schoolYear:'2025–2026',className:'2B' },
  ];
  let name=account.displayName;
  let recording='class-a';
  const writes:string[]=[];
  await page.route('**/api/v1/auth/session',route=>route.fulfill({json:{account}}));
  await page.route('**/api/v1/learner-ocean/enrollments',route=>route.fulfill({json:{items:[]}}));
  await page.route('**/api/v1/learner-ocean/profile*',async route=>{
    if(route.request().method()!=='GET')writes.push(route.request().method());
    await route.fulfill({json:{name,contextId:recording,contexts,total:252,learned:1}});
  });
  await page.route('**/api/v1/learner-ocean/name',async route=>{
    name=route.request().postDataJSON().name;await route.fulfill({json:{name}});
  });
  await page.route('**/api/v1/learner-ocean/active-class',async route=>{
    recording=route.request().postDataJSON().contextId;await route.fulfill({json:{ok:true}});
  });
  await page.route('**/api/v1/learner-ocean/evidence*',async route=>{
    const old=new URL(route.request().url()).searchParams.get('contextId')==='class-b';
    const species=old?[]:Array.from({length:49},(_,index)=>({id:'species-'+index,title:index?'Sinh vật '+(index+1):'Cá heo mũi chai',image:null,at:'2026-11-09T03:00:00Z',family:'explore'}));
    await route.fulfill({json:{species,games:[],creations:[],timeline:species,resourceCount:old?0:4,achievementCount:old?0:3}});
  });
  await page.goto('/profile');
  await expect(page.getByRole('textbox',{name:'Họ tên',exact:true})).toHaveValue(name);
  await expect(page.getByRole('combobox',{name:'Trường',exact:true})).toContainText(contexts[0].school);
  await expect(page.getByRole('combobox',{name:'Lớp',exact:true})).toContainText('3A');
  const speciesPanel=page.getByRole('region',{name:'Nội dung đã học',exact:true});
  await speciesPanel.getByRole('button',{name:/Xem thêm/}).click();
  const records=page.getByRole('dialog',{name:'Nội dung đã học'});
  await expect(records.locator('li')).toHaveCount(6);
  await records.getByRole('button',{name:'Tiếp',exact:true}).click();
  await expect(records.locator('footer[aria-label="Phân trang"]')).toContainText('7–12 / 49');
  await records.getByRole('searchbox').fill('sinh vat 49');
  await expect(records.locator('li')).toHaveText(/Sinh vật 49/);
  await records.getByRole('button',{name:'Đóng',exact:true}).click();
  await expect(speciesPanel.locator('ul li')).toHaveCount(2);
  await expect(page.getByRole('region',{name:'Thành tích',exact:true})).toContainText('3đã đạt');
  await expect(page.getByRole('region',{name:'Thành tích',exact:true}).getByRole('button')).toHaveCount(0);
  await expect(page.getByText(/huy hiệu/i)).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('textbox',{name:'Họ tên',exact:true}).fill('Nguyễn Minh Anh');
  await page.getByRole('button',{name:'Lưu họ tên',exact:true}).click();
  await expect(page.locator('header[data-role="learner"]')).toContainText('Nguyễn Minh Anh');
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('textbox',{name:'Họ tên',exact:true}).fill('Tên chưa lưu');
  const year=page.getByRole('combobox',{name:'Năm học',exact:true});
  await year.press('ArrowDown');
  const years=page.getByRole('listbox',{name:'Năm học',exact:true});
  await expect(years).toBeVisible();
  const triggerBox=(await year.boundingBox())!;
  const menuBox=(await years.boundingBox())!;
  expect(Math.abs(triggerBox.width-menuBox.width)).toBeLessThan(2);
  expect(Math.abs(triggerBox.x-menuBox.x)).toBeLessThan(2);
  await year.press('End');
  await year.press('Enter');
  await expect(years).toBeHidden();
  await expect(year).toBeFocused();
  await expect(page.getByRole('combobox',{name:'Lớp',exact:true})).toContainText('2B');
  await expect(page.getByText(/Đang xem lịch sử/)).toBeVisible();
  await expect(page.getByRole('textbox',{name:'Họ tên',exact:true})).toHaveValue('Tên chưa lưu');
  await expect(page.getByRole('heading',{name:'Nội dung đã học',exact:true})).toBeVisible();
  await expect(page.getByText('Cá heo mũi chai',{exact:true})).toHaveCount(0);
  expect(recording).toBe('class-a');expect(writes).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.getByRole('progressbar')).toHaveCount(0);
});

test('an unassigned child can see the full profile before and after requesting a class',async({page})=>{
  const account={id:'unassigned-child',role:'student',displayName:'Bé An',avatarKey:'turtle'};
  await page.route('**/api/v1/auth/session',route=>route.fulfill({json:{account}}));
  await page.route('**/api/v1/learner-ocean/profile*',route=>route.fulfill({json:{name:'Bé An',contextId:null,contexts:[],total:252,learned:8}}));
  await page.route('**/api/v1/learner-ocean/evidence*',route=>route.fulfill({json:{species:[],games:[],creations:[],timeline:[],resourceCount:12,achievementCount:3}}));
  await page.route('**/api/v1/learner-ocean/enrollments',route=>route.fulfill({json:{items:[]}}));
  let code='';
  await page.route('**/api/v1/learner-ocean/join-class',async route=>{code=route.request().postDataJSON().code;await route.fulfill({json:{id:'pending',status:'pending'}});});
  await page.goto('/profile');
  await expect(page.getByRole('combobox',{name:'Trường',exact:true})).toBeDisabled();
  await expect(page.getByRole('textbox',{name:'Họ tên',exact:true})).toBeEnabled();
  const sections = ['Tiến trình học tập', 'Thành tích', 'Nội dung đã học', 'Game đã chơi', 'Sản phẩm đã tạo', 'Hành trình học tập'];
  for (const name of sections) await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
  await expect(page.getByText(/mở hành trình của bé/)).toHaveCount(0);
  const progress = page.getByRole('region',{name:'Tiến trình học tập',exact:true});
  await expect(progress.locator('strong')).toHaveText(['8','12']);
  await expect(page.getByRole('region',{name:'Thành tích',exact:true}).locator('strong')).toHaveText('3');
  await expect(page.getByRole('region',{name:'Thành tích',exact:true}).getByRole('button')).toHaveCount(0);
  await expect(page.getByText(/huy hiệu/i)).toHaveCount(0);
  await expect(page.getByRole('textbox',{name:'Mã tham gia lớp',exact:true})).toBeHidden();
  await page.getByRole('button',{name:'Tham gia bằng mã',exact:true}).click();
  await page.getByRole('textbox',{name:'Mã tham gia lớp',exact:true}).fill('ABC12345');
  await page.getByRole('button',{name:'Gửi yêu cầu vào lớp',exact:true}).click();
  await expect(page.getByText(/Đã gửi yêu cầu/)).toBeVisible();expect(code).toBe('abc12345');
  for (const name of sections) await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveCount(0);
});
