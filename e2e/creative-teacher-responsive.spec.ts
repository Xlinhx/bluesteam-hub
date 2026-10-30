import {test,expect} from '@playwright/test';
test('two teacher tabs and environment catalogue fit desktop/tablet/mobile without changing shared navigation',async({page})=>{
 await page.request.post('/api/v1/auth/login',{data:{email:'creative-e2e@test.local',password:'Testing123!'}});
 for(const [width,height]of [[1500,1045],[1366,768],[768,1024],[390,844],[320,800]]){
  await page.setViewportSize({width,height});await page.goto('/teacher/creative');await expect(page.getByRole('heading',{name:'Sáng tạo cùng bé',exact:true})).toBeVisible();await expect(page.getByRole('navigation',{name:'Sáng tạo của cô'}).getByRole('button')).toHaveCount(2);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('.ct-active-sea,.ct-sea-empty-hero')).toBeVisible();await page.evaluate(async()=>{await document.fonts.ready;await Promise.allSettled([...document.images].map(im=>im.decode()));});await page.screenshot({path:`artifacts/creative-teacher-sea-sessions-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Mở biển chung',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();expect(await page.evaluate(()=>Boolean(document.elementFromPoint(5,95)?.closest('.ocean-modal-backdrop')))).toBe(true);
  await expect(page.getByRole('button',{name:'Để sau',exact:true})).toBeVisible();await page.getByRole('dialog').evaluate(async el=>{await Promise.allSettled(el.getAnimations({subtree:true}).map(a=>a.finished));});await page.screenshot({path:`artifacts/creative-teacher-open-sea-${width}.png`});
  await page.getByRole('button',{name:'Rạn san hô',exact:true}).click();await page.getByRole('searchbox',{name:'Tìm môi trường'}).fill('bien sau');await expect(page.locator('[data-environment-option]')).toHaveCount(1);await page.getByRole('button',{name:'Biển sâu',exact:true}).click();await expect(page.getByRole('searchbox',{name:'Tìm môi trường'})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('navigation',{name:'Sáng tạo của cô'}).getByRole('button',{name:'Tô màu',exact:true}).click();await expect(page.getByRole('heading',{name:'Khảo sát tô màu'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`artifacts/creative-teacher-coloring-overview-${width}.png`,fullPage:true});
 }
});
test('retired teacher habitat entry redirects while learner keeps local free building',async({page})=>{
 await page.request.post('/api/v1/auth/login',{data:{email:'creative-e2e@test.local',password:'Testing123!'}});await page.goto('/teacher/creative?tab=habitat');await expect(page).toHaveURL(/tab=sea/);await expect(page.getByText('Xây nơi sống',{exact:true})).toHaveCount(0);
 await page.request.post('/api/v1/auth/login',{data:{role:'student',email:'creative-child@test.local',password:'Testing123!'}});await page.goto('/creative');await expect(page.getByRole('button',{name:'Bắt đầu xây'})).toBeVisible();await expect(page.getByText('Vào thử thách bằng mã',{exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Bắt đầu xây'}).click();await expect(page.getByTestId('creative-habitat-stage')).toBeVisible();await expect(page.getByRole('button',{name:'Gửi phương án',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Lưu tiến trình',exact:true})).toBeVisible();
});
