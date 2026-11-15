import { test,expect } from '@playwright/test';
import { openDeviceProfileCollection } from './fixtures/local-profile';

test.use({ viewport:{width:390,height:844},hasTouch:true,isMobile:true });
for(const teacher of [false,true])test(`${teacher?'teacher':'learner'} touch journeys keep dialogs and return focus across browser engines`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  expect((await page.request.post('/api/v1/auth/login',{data:teacher?{role:'teacher',email:'colinh@bluesteam.edu.vn',password:'daiduong2026'}:{role:'student',email:'hocsinh',password:'hocsinh'}})).ok()).toBe(true);
  await page.goto(teacher?'/teacher/resources':'/resources');
  if(teacher){
    await expect(page.locator('.teacher-resource-table-wrap')).toHaveAttribute('aria-busy','false');
    const format = page.getByRole('combobox',{name:'Định dạng',exact:true});
    const formatList = page.getByRole('listbox',{name:'Định dạng',exact:true});
    await format.tap();
    await formatList.getByRole('option',{name:'Video',exact:true}).tap();
    await expect(format).toHaveText('Video');
    await format.tap();
    await formatList.getByRole('option',{name:'Định dạng',exact:true}).tap();
    const create=page.getByRole('button',{name:'Thêm học liệu',exact:true});await create.tap();
    const editor=page.getByRole('dialog',{name:'Thêm học liệu',exact:true});await expect(editor).toBeVisible();
    const previewTrigger=editor.getByRole('button',{name:'Xem trước',exact:true});await previewTrigger.tap();
    const preview=page.getByRole('dialog',{name:'Xem học liệu',exact:true});await expect(preview).toBeVisible();
    await preview.getByRole('button',{name:'Đóng',exact:true}).tap();await expect(preview).toHaveCount(0);await expect(previewTrigger).toBeFocused();
    await editor.getByRole('tab',{name:'Nhóm & liên kết',exact:true}).tap();
    const linkTrigger=editor.getByRole('button',{name:'Liên kết học liệu',exact:true});await linkTrigger.tap();
    const picker=page.getByRole('dialog',{name:'Chọn nội dung liên quan',exact:true});await expect(picker).toBeVisible();
    await picker.getByRole('button',{name:'Đóng',exact:true}).tap();await expect(picker).toHaveCount(0);await expect(linkTrigger).toBeFocused();
    await editor.getByRole('button',{name:'Hủy',exact:true}).tap();await expect(editor).toHaveCount(0);await expect(create).toBeFocused();
    const rowPreview=page.locator('.teacher-resource-row-actions>button').first();await rowPreview.tap();
    await expect(preview).toBeVisible();await preview.getByRole('button',{name:'Đóng',exact:true}).tap();await expect(preview).toHaveCount(0);await expect(rowPreview).toBeFocused();
    const account=page.getByRole('button',{name:'Đổi tên và ảnh giáo viên',exact:true});await account.tap();
    const identity=page.getByRole('dialog',{name:'Hồ sơ giáo viên',exact:true});await expect(identity).toBeVisible();
    await identity.getByRole('button',{name:'Hủy',exact:true}).tap();await expect(identity).toHaveCount(0);await expect(account).toBeFocused();
  }else{
    await expect(page.getByRole('navigation',{name:'Phân loại học liệu'}).getByRole('button')).toHaveCount(8);
    await expect(page.locator('.resource-group-section').first()).toBeVisible();
    await page.getByRole('button',{name:'Flashcards',exact:true}).tap();
    const choose=page.getByRole('combobox',{name:'Nhóm học liệu'});
    await choose.tap();
    await page.getByRole('option',{name:'Thẻ học liệu 2',exact:true}).tap();
    await expect(page.getByRole('heading',{name:'Nghe · Xem · Khám phá'})).toBeVisible();
    const firstCard=page.locator('.source-tile').first();
    await firstCard.tap();
    await expect(page.getByRole('complementary',{name:'Xem học liệu'}).locator('img')).toBeVisible();
    await page.getByRole('button',{name:'Đóng học liệu'}).tap();
    await expect(firstCard).toBeFocused();
    await expect(choose).toHaveText('Thẻ học liệu 2');
    await page.getByRole('button',{name:'Hồ sơ',exact:true}).tap();await openDeviceProfileCollection(page);await expect(page.locator('.profile-collection-section')).toHaveCount(3);
    await expect(page.getByRole('heading', { name: 'Thông tin cá nhân', level: 1 })).toBeVisible();
    const edit=page.getByRole('button',{name:'Đổi tên và hình',exact:true});await edit.tap();
    const identity=page.getByRole('dialog',{name:'Tên và hình của bé',exact:true});await expect(identity).toBeVisible();
    await identity.getByRole('button',{name:'Hủy',exact:true}).tap();await expect(identity).toHaveCount(0);await expect(edit).toBeFocused();
  }
  expect(errors).toEqual([]);
});
