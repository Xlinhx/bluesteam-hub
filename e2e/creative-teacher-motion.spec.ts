import {test,expect} from '@playwright/test';
const teacher={email:'creative-e2e@test.local',password:'Testing123!'};

test('recent sea keeps its environment preview when an old artwork image is unavailable',async({page})=>{
 await page.request.post('/api/v1/auth/login',{data:teacher});
 await page.route('**/api/v1/teacher/creative-sessions?*',route=>route.fulfill({json:{total:1,items:[{id:'old-sea',title:'Biển cũ',kind:'scan',code:'123456',state:'closed',environment_id:'reef',created_at:new Date().toISOString(),expires_at:new Date().toISOString(),previews:['/missing-creative-thumbnail.png']}]}}));
 await page.goto('/teacher/creative');const thumbnail=page.locator('.ct-sea-thumbnail');await expect(thumbnail).toBeVisible();
 await expect(thumbnail.locator('img')).toHaveCSS('visibility','hidden');expect(await thumbnail.evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('/assets/');await expect(page.getByRole('button',{name:'Xem lại',exact:true})).toBeEnabled();
});
test('creative water motion stays bounded, stops immediately, and does not replay creature entry on polling',async({page})=>{
 await page.addInitScript(()=>{const original=Element.prototype.animate;(window as any).__creativeAnimations=[];Element.prototype.animate=function(frames,options){(window as any).__creativeAnimations.push({sea:this.parentElement?.getAttribute('data-sea-creature'),cls:this.className,frames,options});return original.call(this,frames,options);};});
 await page.request.post('/api/v1/auth/login',{data:teacher});
 const sea={id:'motion-sea',title:'Biển chuyển động',kind:'scan',code:'123456',state:'open',environment_id:'reef',motion_paused:false,created_at:new Date().toISOString(),expires_at:new Date(Date.now()+86400000).toISOString()};
 let paused=false;let version=0;
 const response=()=>({session:{...sea,motion_paused:paused},counts:{total:40,released:40,ready:0,needs_retry:0,participants:40},filteredTotal:0,items:[],seaTotal:40,seaItems:Array.from({length:40},(_,i)=>({id:i===0?'new-'+version:'c'+i,alias:'Bé '+i,preview:'/assets/generated/creative/crayon-fish-v2.png',motion:i%3===0?'floor':'swim'}))});
 await page.route('**/api/v1/teacher/creative-sessions/motion-sea?*',route=>route.fulfill({json:response()}));
 await page.route('**/api/v1/teacher/creative-sessions/motion-sea/state',async route=>{paused=route.request().postDataJSON().motionPaused;await route.fulfill({json:{...sea,motion_paused:paused}});});
 await page.goto('/teacher/creative?session=motion-sea');await expect(page.locator('[data-sea-creature]')).toHaveCount(40);
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:844});await expect.poll(()=>page.locator('.creative-water-stage').evaluate(host=>{const box=host.getBoundingClientRect();return [...host.querySelectorAll('[data-sea-creature]')].every(el=>{const r=el.getBoundingClientRect();return r.left>=box.left-1&&r.top>=box.top-1&&r.right<=box.right+1&&r.bottom<=box.bottom+1;});})).toBe(true);}
 await page.getByRole('button',{name:'Tạm dừng chuyển động',exact:true}).click();await expect(page.locator('.creative-water-stage')).toHaveAttribute('data-paused','true');
 expect(await page.locator('[data-sea-creature]').first().evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('paused');
 await page.getByRole('button',{name:'Tiếp tục chuyển động',exact:true}).click();await expect(page.locator('.creative-water-stage')).toHaveAttribute('data-paused','false');
 version=1;await expect.poll(()=>page.locator('[data-sea-creature="new-1"]').count(),{timeout:8000}).toBe(1);
 const count=await page.evaluate(()=>(window as any).__creativeAnimations.filter((x:any)=>x.sea==='new-1').length);expect(count).toBe(1);
 await page.waitForTimeout(4200);expect(await page.evaluate(()=>(window as any).__creativeAnimations.filter((x:any)=>x.sea==='new-1').length)).toBe(count);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.creative-water-stage')).toHaveAttribute('data-paused','true');expect(await page.locator('[data-sea-creature]').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
test('sea modal has its own choreography, remains interruptible, and works with reduced motion',async({page})=>{
 await page.addInitScript(()=>{const original=Element.prototype.animate;(window as any).__creativeAnimations=[];Element.prototype.animate=function(frames,options){(window as any).__creativeAnimations.push({cls:this.className,frames,options});return original.call(this,frames,options);};});
 await page.request.post('/api/v1/auth/login',{data:teacher});await page.goto('/teacher/creative');await page.getByRole('button',{name:'Mở biển chung',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
 expect(await page.evaluate(()=>(window as any).__creativeAnimations.some((x:any)=>String(x.cls).includes('ocean-modal')&&x.frames[0].clipPath))).toBe(true);
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Mở biển chung',exact:true}).click();await expect(page.getByRole('textbox',{name:'Tên biển'})).toBeEditable();await page.getByRole('button',{name:'Rạn san hô',exact:true}).click();await page.getByRole('searchbox',{name:'Tìm môi trường'}).fill('bien sau');await page.getByRole('button',{name:'Biển sâu',exact:true}).click();await page.getByRole('button',{name:'Để sau',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('learner motion follows actual paper geometry and leaves crop/edit/save usable',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,viewport:{width:1280,height:900},recordVideo:{dir:'artifacts/creative-motion-preview',size:{width:1280,height:900}}});const page=await context.newPage();
 await page.addInitScript(()=>{const original=Element.prototype.animate;(window as any).__creativeAnimations=[];Element.prototype.animate=function(frames,options){(window as any).__creativeAnimations.push({cls:this.className,tag:this.tagName,frames,options});return original.call(this,frames,options);};});
 await page.request.post('/api/v1/auth/login',{data:{role:'student',email:'creative-child@test.local',password:'Testing123!'}});await page.goto('/creative');await expect(page.getByRole('heading',{name:'Đại dương mang dấu ấn của bé'})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>(window as any).__creativeAnimations.some((x:any)=>String(x.cls).includes('scan-life-fish-water')&&x.frames[0].transform))).toBe(true);
 await page.getByRole('button',{name:'Quét tranh của bé',exact:true}).click();await page.locator('input[type=file]').first().setInputFiles('public/assets/generated/craft/artwork_crayon_clownfish.png');await page.getByRole('button',{name:'Tách nền và xem lại',exact:true}).click();await expect(page.getByRole('checkbox',{name:'Đã xem lại nét vẽ và phần trắng trong con vật'})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>(window as any).__creativeAnimations.some((x:any)=>x.tag==='CANVAS'&&x.frames[0].transform))).toBe(true);
 const actual=page.locator('canvas[aria-label="Chỉnh nền con vật"]');await actual.click({position:{x:20,y:20}});expect(await actual.evaluate(el=>el.getAnimations().length)).toBe(0);
 await page.getByRole('checkbox',{name:'Đã xem lại nét vẽ và phần trắng trong con vật'}).check();await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Đã lưu tiến trình'})).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Xem thử chuyển động',exact:true}).click();await expect(page.locator('.creative-water-stage')).toHaveAttribute('data-paused','true');
 await page.screenshot({path:'artifacts/creative-motion-learner-final.png',fullPage:true});const video=page.video();await context.close();if(video){const {copyFileSync}=await import('node:fs');copyFileSync(await video.path(),'artifacts/creative-motion-learner.webm');}
});
test('creative page journeys use layered forward/back transitions without replaying on filters',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,viewport:{width:1366,height:900},recordVideo:{dir:'artifacts/creative-motion-preview-v2',size:{width:1366,height:900}}});const page=await context.newPage();
 await page.addInitScript(()=>{const animate=Element.prototype.animate;(window as any).__entrances=[];Element.prototype.animate=function(frames,options){(window as any).__entrances.push(String(this.className));return animate.call(this,frames,options);};const doc=document as any;if(doc.startViewTransition){const original=doc.startViewTransition.bind(doc);(window as any).__journeys=[];doc.startViewTransition=(update:any)=>{(window as any).__journeys.push({direction:document.documentElement.dataset.creativeJourney,audience:document.documentElement.dataset.creativeAudience});return original(update);};}});
 await page.request.post('/api/v1/auth/login',{data:teacher});await page.goto('/teacher/creative');await expect(page.locator('.ct-active-sea,.ct-sea-empty-hero')).toBeVisible();await page.getByRole('navigation',{name:'Sáng tạo của cô'}).getByRole('button',{name:'Tô màu',exact:true}).click();await expect(page.locator('.ct-coloring-table')).toBeVisible();
 expect(await page.evaluate(()=>(window as any).__journeys.some((x:any)=>x.direction==='forward'&&x.audience==='teacher'))).toBe(true);
 await page.getByRole('textbox',{name:'Tìm mẫu tranh'}).fill('Rùa');const count=await page.evaluate(()=>(window as any).__journeys.length);await page.getByRole('textbox',{name:'Tìm mẫu tranh'}).fill('Rùa xanh');expect(await page.evaluate(()=>(window as any).__journeys.length)).toBe(count);
 await page.goBack();await expect(page.locator('.ct-active-sea,.ct-sea-empty-hero')).toBeVisible();expect(await page.evaluate(()=>(window as any).__journeys.some((x:any)=>x.direction==='back'))).toBe(true);
 await page.request.post('/api/v1/auth/login',{data:{role:'student',email:'creative-child@test.local',password:'Testing123!'}});await page.goto('/creative');await expect(page.getByRole('button',{name:'Quét tranh của bé',exact:true})).toBeVisible();await page.getByRole('button',{name:'Quét tranh của bé',exact:true}).click();await expect(page.getByRole('button',{name:'Chọn ảnh',exact:true})).toBeVisible();await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.creativeJourney||'')).toBe('');
 expect(await page.evaluate(()=>(window as any).__journeys.some((x:any)=>x.audience==='learner'))).toBe(true);
 await page.evaluate(()=>(window as any).__entrances=[]);
 await page.goBack();await expect(page.getByRole('heading',{name:'Đại dương mang dấu ấn của bé'})).toBeVisible();await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.creativeJourney||'')).toBe('');
 expect(await page.evaluate(()=>(window as any).__entrances.filter((cls:string)=>/scan-life|creative-hub-heading|creative-hub-badge|habitat-entry/.test(cls)))).toEqual([]);
 await page.screenshot({path:'artifacts/creative-motion-v2-hub.png',fullPage:true});
 const video=page.video();await context.close();if(video){const {copyFileSync}=await import('node:fs');copyFileSync(await video.path(),'artifacts/creative-motion-page-journeys.webm');}
});

test('drawing and habitat tools remain usable through desktop panels, mobile sheets and completion',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,viewport:{width:1366,height:900},recordVideo:{dir:'artifacts/creative-workspaces-preview',size:{width:1366,height:900}}});const page=await context.newPage();
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.request.post('/api/v1/auth/login',{data:{role:'student',email:'creative-child@test.local',password:'Testing123!'}});
 await page.goto('/creative/drawing');await expect(page.getByTestId('drawing-canvas')).toBeVisible();
 await page.getByRole('button',{name:'Thêm màu',exact:true}).click();await expect(page.locator('.drawing-shade-panel .creative-tool-panel')).toBeVisible();
 await page.getByRole('button',{name:'Chọn màu Xanh bọt biển',exact:true}).click();await page.getByRole('button',{name:'Dùng màu này',exact:true}).click();await expect(page.locator('.drawing-shade-panel')).toBeHidden();
 await page.getByTestId('drawing-tool-brush').click();const canvas=page.getByTestId('drawing-canvas'),box=await canvas.boundingBox();expect(box).not.toBeNull();
 await page.mouse.move(box!.x+box!.width*.3,box!.y+box!.height*.4);await page.mouse.down();await page.mouse.move(box!.x+box!.width*.6,box!.y+box!.height*.55,{steps:12});await page.mouse.up();
 await expect(page.getByRole('button',{name:'Hoàn tác',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Đã lưu'})).toBeVisible();
 await page.screenshot({path:'artifacts/creative-final-drawing-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Thêm màu',exact:true}).click();await expect(page.getByRole('dialog',{name:'Thêm màu'})).toBeVisible();
 await expect.poll(()=>page.getByRole('dialog').evaluate(el=>el.getAnimations().length)).toBe(0);await page.screenshot({path:'artifacts/creative-final-color-sheet.png'});await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByRole('button',{name:'Thêm màu',exact:true})).toBeFocused();
 await page.goto('/creative/habitat');await expect(page.getByTestId('habitat-board')).toBeVisible();await page.getByRole('button',{name:/Mở thư viện vật thể/}).click();await expect(page.getByRole('dialog',{name:'Thư viện vật thể'})).toBeVisible();
 await page.locator('[data-testid^="habitat-select-"]').first().click();await page.locator('[data-testid^="habitat-add-"]').click();await expect(page.locator('.habitat-instance-inspector')).toBeVisible();
 await expect.poll(()=>page.getByRole('dialog').evaluate(el=>el.getAnimations().length)).toBe(0);await page.screenshot({path:'artifacts/creative-final-habitat-sheet.png'});await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.setViewportSize({width:1366,height:900});await page.getByRole('button',{name:'Chạy thử',exact:true}).click();await expect(page.getByRole('button',{name:'Sửa thiết kế',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Tạm dừng chuyển động',exact:true}).click();await expect(page.getByRole('button',{name:'Tiếp tục chuyển động',exact:true})).toBeVisible();await page.getByRole('button',{name:'Sửa thiết kế',exact:true}).click();
 await page.getByRole('button',{name:'Thêm cảnh',exact:true}).click();await page.getByRole('button',{name:'Tạo cảnh',exact:true}).click();await expect(page.getByRole('combobox',{name:'Cảnh đang mở'}).locator('option')).toHaveCount(2);
 await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Đã lưu'})).toBeVisible();await page.getByRole('button',{name:'Hoàn thành',exact:true}).click();await expect(page.locator('.creative-finished')).toBeVisible();
 await page.screenshot({path:'artifacts/creative-final-habitat-desktop.png',fullPage:true});expect(errors).toEqual([]);
 const video=page.video();await context.close();if(video){const {copyFileSync}=await import('node:fs');copyFileSync(await video.path(),'artifacts/creative-motion-workspaces.webm');}
});
