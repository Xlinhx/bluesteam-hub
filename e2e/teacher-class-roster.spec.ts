import { expect, test } from '@playwright/test';

test('class roster invitation, account avatars, group transfers and promotion stay consistent across roles', async ({page, browser, baseURL})=>{
  const tag=crypto.randomUUID();
  const teacher=await page.request.post('/api/v1/auth/register',{data:{
    role:'teacher',email:'roster-teacher-'+tag+'@example.test',password:'Ocean-test-123',displayName:'Cô thử danh sách lớp',
  }});
  expect(teacher.ok()).toBeTruthy();
  const school=await page.request.post('/api/v1/teacher/classroom/schools',{data:{name:'Trường Hải Âu kiểm thử'}});
  expect(school.ok()).toBeTruthy();
  const {id:schoolId}=await school.json();
  const first=await page.request.post('/api/v1/teacher/classroom/classes',{data:{schoolId,year:'2026–2027',name:'Lá 1',ageGroup:'5–6 tuổi'}});
  expect(first.ok()).toBeTruthy();
  const {id:classId}=await first.json();
  const peerClass=await page.request.post('/api/v1/teacher/classroom/classes',{data:{schoolId,year:'2026–2027',name:'Lá 2',ageGroup:'5–6 tuổi'}});
  expect(peerClass.ok()).toBeTruthy();
  const {id:peerClassId}=await peerClass.json();
  const pupil=await browser.newContext({baseURL,reducedMotion:'reduce'});
  const account={role:'student',email:'roster-learner-'+tag+'@example.test',password:'Ocean-test-123',displayName:'Bé Sao Biển'};
  try {
    const signUp=await pupil.request.post('/api/v1/auth/register',{data:account});
    expect(signUp.ok()).toBeTruthy();
    const {account:{avatarKey:initialAvatar}}=await signUp.json();
    expect(initialAvatar).toBeTruthy();
    await page.goto('/teacher/profile');
    await page.getByRole('button',{name:'Danh sách học sinh',exact:true}).click();
    await expect(page.getByRole('button',{name:'Nhập danh sách',exact:true})).toHaveCount(0);
    await expect(page.getByRole('button',{name:/^Chờ duyệt/})).toHaveCount(0);
    await expect(page.locator('.teacher-invite-code')).toHaveText(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    await expect(page.getByAltText('QR tham gia lớp')).toBeVisible();
    const invite=await page.getByRole('link',{name:'Mở liên kết mời bé vào lớp'}).getAttribute('href');
    expect(invite).toBeTruthy();
    const code=await page.locator('.teacher-invite-code').innerText();
    await pupil.request.post('/api/v1/auth/logout');
    const child=await pupil.newPage();
    await child.goto(invite!);
    await expect(child).toHaveURL(/\/login\?.*join=/);
    await child.locator('input[name="email"]').fill(account.email);
    await child.locator('input[name="password"]').fill(account.password);
    await child.locator('button[type="submit"]').click();
    await expect(child.getByRole('textbox',{name:'Mã tham gia lớp'})).toHaveValue(code);
    await child.getByRole('button',{name:'Gửi yêu cầu vào lớp'}).click();
    await expect(child.getByText('Chờ cô xác nhận',{exact:true})).toBeVisible();

    await page.reload();
    await page.getByRole('button',{name:'Danh sách học sinh',exact:true}).click();
    await expect(page.locator('.teacher-member-request img')).toHaveAttribute('data-avatar',initialAvatar);
    await page.getByRole('button',{name:'Xem thông tin Bé Sao Biển'}).click();
    await expect(page.getByRole('dialog')).toContainText('Xin vào lớp bằng mã');
    await page.getByRole('dialog').getByRole('button',{name:'Duyệt vào lớp',exact:true}).click();
    const roster=page.getByRole('table',{name:'Học sinh lớp Lá 1'});
    const row=roster.getByRole('row',{name:/Bé Sao Biển/});
    await expect(row).toBeVisible();
    const changedAvatar=initialAvatar==='octopus'?'turtle':'octopus';
    expect((await pupil.request.put('/api/v1/learner-ocean/avatar',{data:{avatarKey:changedAvatar}})).ok()).toBeTruthy();
    await child.reload();
    await expect(child.locator('.profile-portrait img')).toHaveAttribute('data-avatar',changedAvatar);
    await page.reload();
    await page.getByRole('button',{name:'Danh sách học sinh',exact:true}).click();
    await expect(row.locator('[data-avatar]')).toHaveAttribute('data-avatar',changedAvatar);
    const studentCode=await row.locator('.roster-student-code').innerText();
    await page.getByRole('searchbox',{name:'Tìm tên hoặc mã học sinh'}).fill(studentCode.toLowerCase());
    await expect(row).toBeVisible();
    await page.getByRole('searchbox').fill('be sao bien');
    await expect(row).toBeVisible();
    await page.getByRole('searchbox').clear();

    const extraEmails=['roster-single-'+tag+'@example.test','roster-batch-'+tag+'@example.test'];
    const extra=await browser.newContext({baseURL});
    try {
      for (const [index,email] of extraEmails.entries()) {
        const registration=await extra.request.post('/api/v1/auth/register',{data:{...account,email,displayName:'Bé nhập '+index}});
        expect(registration.ok()).toBeTruthy();
        const unrelated=await page.request.post('/api/v1/teacher/classroom/classes/'+classId+'/roster',{data:{emails:[email]}});
        expect(unrelated.status()).toBe(404);
        expect((await extra.request.post('/api/v1/learner-ocean/join-class',{data:{code}})).ok()).toBeTruthy();
      }
    } finally {await extra.close();}
    await page.getByRole('button',{name:'Thêm học sinh',exact:true}).click();
    await page.getByRole('dialog').getByRole('textbox',{name:'Email tài khoản học sinh'}).fill(extraEmails[0]);
    await page.getByRole('dialog').getByRole('button',{name:'Thêm học sinh'}).click();
    await expect(roster.getByText('Bé nhập 0')).toBeVisible();
    await page.getByRole('button',{name:'Cấp lại mã',exact:true}).click();
    await page.getByRole('dialog',{name:'Cấp lại mã mời'}).getByRole('button',{name:'Cấp lại mã',exact:true}).click();
    await expect(page.locator('.teacher-invite-code')).not.toHaveText(code);
    expect((await pupil.request.post('/api/v1/learner-ocean/join-class',{data:{code}})).status()).toBe(404);

    await expect((await pupil.request.post('/api/v1/learner-ocean/studied/upper-2')).ok()).toBeTruthy();
    const enrollmentRows=(await (await page.request.get('/api/v1/teacher/classroom/classes/'+classId)).json()).members;
    const subject=enrollmentRows.find((member:{name:string})=>member.name===account.displayName);
    const pending=enrollmentRows.find((member:{status:string})=>member.status==='pending');
    const invalid=await page.request.post('/api/v1/teacher/classroom/classes/'+classId+'/transfers',{data:{
      destinationId:peerClassId,mode:'transfer',enrollmentIds:[subject.id,pending.id],
    }});
    expect(invalid.status()).toBe(409);
    await expect(row).toBeVisible();

    await row.getByLabel('Thao tác với Bé Sao Biển').click();
    await row.getByRole('button',{name:'Chuyển lớp'}).click();
    const transfer=page.getByRole('dialog',{name:'Chuyển lớp'});
    await expect(transfer.getByRole('checkbox',{name:/Bé Sao Biển/})).toBeChecked();
    await transfer.getByRole('searchbox').fill('be nhap');
    await transfer.getByRole('checkbox',{name:/Bé nhập 0/}).check();
    await transfer.getByRole('button',{name:'Tiếp',exact:true}).click();
    await transfer.getByRole('radio',{name:/Lá 2.*2026/}).check();
    await transfer.getByRole('button',{name:'Tiếp',exact:true}).click();
    await expect(transfer).toContainText('2 học sinh');
    await transfer.getByRole('button',{name:'Xác nhận chuyển lớp'}).click();
    await expect(row).toHaveCount(0);
    await page.getByRole('button',{name:'Đã chuyển 2'}).click();
    await expect(row).toBeVisible();
    await expect(row.locator('.roster-student-code')).toHaveText(studentCode);
    await row.getByRole('button',{name:'Xem hành trình của Bé Sao Biển',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Hành trình của Bé Sao Biển'})).toBeVisible();
    const classDetail=await page.request.get('/api/v1/teacher/classroom/classes/'+classId);
    const prior=(await classDetail.json()).members.find((member:{name:string})=>member.name===account.displayName);
    expect(prior.species).toBe(1);
    const currentClass=page.getByRole('combobox',{name:'Giáo viên lớp'});
    await currentClass.click();
    await page.getByRole('option',{name:'Lá 2',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Danh sách lớp Lá 2'})).toBeVisible();
    await page.getByRole('button',{name:'Lên năm học',exact:true}).click();
    const promotion=page.getByRole('dialog',{name:'Lên năm học'});
    await promotion.getByRole('checkbox',{name:/Bé Sao Biển/}).check();
    await promotion.getByRole('checkbox',{name:/Bé nhập 0/}).check();
    await promotion.getByRole('button',{name:'Tiếp',exact:true}).click();
    await expect(promotion.getByText('2027–2028',{exact:true})).toBeVisible();
    await promotion.getByLabel('Tên lớp mới').fill('Lá 3');
    await promotion.getByRole('button',{name:'Tạo lớp đích'}).click();
    await expect(promotion.getByRole('radio',{name:/Lá 3.*2027/})).toBeChecked();
    await promotion.getByRole('button',{name:'Tiếp',exact:true}).click();
    await promotion.getByRole('button',{name:'Xác nhận lên năm học'}).click();
    await expect(promotion).toHaveCount(0);
    const enrollments=await pupil.request.get('/api/v1/learner-ocean/enrollments');
    expect((await enrollments.json()).items).toEqual(expect.arrayContaining([
      expect.objectContaining({className:'Lá 1',status:'ended'}),expect.objectContaining({className:'Lá 2',status:'ended'}),
      expect.objectContaining({className:'Lá 3',schoolYear:'2027–2028',status:'active'}),
    ]));
    await page.setViewportSize({width:390,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  } finally {await pupil.close();}
});
