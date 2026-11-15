import {test,expect} from '@playwright/test';
import { openDeviceProfileCollection } from './fixtures/local-profile';
import fs from 'node:fs';
const out='artifacts/verification/creative-depth';
const learner={role:'student',email:`creative-proof-${Date.now()}@example.test`,password:'Creative-proof-123',displayName:'Bé kiểm tra sáng tạo'};
test.beforeAll(async({request})=>{expect((await request.post('/api/v1/auth/register',{data:learner})).ok()).toBeTruthy();});
test.beforeEach(async({page},info)=>{if(!info.title.startsWith('paper scan'))expect((await page.request.post('/api/v1/auth/login',{data:learner})).ok()).toBeTruthy();});
test.beforeAll(()=>fs.mkdirSync(out,{recursive:true}));

test('progress stays in creative resume and a separate revision preserves the readonly original',async({page})=>{
 await page.goto('/creative/drawing?template=turtle');
 await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('Đã lưu tiến trình');
 const originalId=new URL(page.url()).searchParams.get('draft')!;
 await page.goto('/creative');await expect(page.locator('.creative-progress-item')).toHaveCount(1);
 await page.locator('.creative-progress-item').click();
 await page.getByRole('button',{name:'Hoàn thành',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'Đã hoàn thành'})).toBeVisible();
 await expect(page.getByTestId('drawing-tool-brush')).toBeDisabled();
 const read=()=>page.evaluate(async(id)=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('ocean_creative_db');r.onsuccess=()=>resolve(r.result);r.onerror=reject;});return await new Promise<any>((resolve,reject)=>{const r=db.transaction('ocean_artworks').objectStore('ocean_artworks').get(id);r.onsuccess=()=>{db.close();resolve(r.result);};r.onerror=reject;});},originalId);
 const original=await read();expect(original.isDraft).toBe(false);
 await page.goto('/creative');await expect(page.locator('.creative-progress-item')).toHaveCount(0);
 await page.goto('/profile'); await openDeviceProfileCollection(page);await page.getByRole('heading',{name:original.title,exact:true}).click();
 await expect(page.getByRole('button',{name:'Chỉnh sửa bản mới',exact:true})).toHaveCount(0);
 await page.keyboard.press('Escape');
 // A separate working revision is fixture setup; profile has no editor action.
 await page.evaluate(async source=>{const next={...source,id:'drawing-'+crypto.randomUUID(),isDraft:true,completedAt:undefined,sourceArtworkId:source.id};const db=await new Promise<IDBDatabase>((res,rej)=>{const r=indexedDB.open('ocean_creative_db');r.onsuccess=()=>res(r.result);r.onerror=rej;});await new Promise<void>((res,rej)=>{const tx=db.transaction('ocean_artworks','readwrite');tx.objectStore('ocean_artworks').put(next);tx.oncomplete=()=>{db.close();res();};tx.onerror=rej;});},original);
 await page.goto('/creative');await page.locator('.creative-progress-item').click();
 await expect(page.getByRole('button',{name:'Lưu tiến trình',exact:true})).toBeEnabled();
 expect(new URL(page.url()).searchParams.get('id')).not.toBe(originalId);
 await expect.poll(read).toEqual(original);
 await page.goto('/creative');await expect(page.locator('.creative-progress-item')).toHaveCount(1);
});
test('paper scan, durable teacher delivery, moderation, and display',async({browser,page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 expect((await page.request.post('/api/v1/auth/login',{data:{email:'colinh@bluesteam.edu.vn',password:'daiduong2026'}})).status()).toBe(200);
 await page.goto('/teacher/creative');await expect(page.getByRole('heading',{name:'Sáng tạo cùng bé'})).toBeVisible();await page.screenshot({path:`${out}/C01-teacher-overview.png`,fullPage:true});
 await page.getByRole('button',{name:'Tạo phiên quét',exact:true}).click();await page.getByRole('textbox',{name:'Tên hoạt động'}).fill('Đối chiếu sáng tạo '+Date.now());await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Tạo mã nhận bài',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Tranh vừa nhận'})).toBeVisible();const sessionId=new URL(page.url()).searchParams.get('session')!;const detail=await (await page.request.get('/api/v1/teacher/creative-sessions/'+sessionId)).json();const code=detail.session.code;
 const child=await browser.newContext({viewport:{width:1440,height:1000}}),scan=await child.newPage();expect((await scan.request.post('/api/v1/auth/login',{data:learner})).ok()).toBeTruthy();
 await scan.goto('/creative');await scan.screenshot({path:`${out}/C02-learner-overview.png`,fullPage:true});await scan.getByRole('button',{name:'Quét tranh của bé',exact:true}).click();
 await scan.getByRole('button',{name:'Vào phiên bằng mã',exact:true}).click();await scan.getByLabel('Mã phiên của cô').fill(code);await scan.getByRole('button',{name:'Vào phiên',exact:true}).click();await scan.getByLabel('Tên người vẽ').fill('Bé nét trắng');
 const fixture=await scan.evaluate(()=>{const c=document.createElement('canvas');c.width=400;c.height=300;const ctx=c.getContext('2d')!;ctx.fillStyle='white';ctx.fillRect(0,0,400,300);ctx.strokeStyle='#ed7c32';ctx.lineWidth=14;ctx.beginPath();ctx.ellipse(200,150,90,65,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#12384b';ctx.beginPath();ctx.arc(240,135,9,0,Math.PI*2);ctx.fill();return c.toDataURL().split(',')[1];});
 await scan.locator('input[type=file]').last().setInputFiles({name:'net-trang.png',mimeType:'image/png',buffer:Buffer.from(fixture,'base64')});await expect(scan.getByRole('status')).toContainText('Đã lưu tiến trình');const captureId=new URL(scan.url()).searchParams.get('draft');await scan.reload();await expect(scan.getByAltText('Ảnh gốc của bé',{exact:true})).toBeVisible();expect(new URL(scan.url()).searchParams.get('draft')).toBe(captureId);await scan.getByLabel('Tên người vẽ').fill('Bé nét trắng');await scan.getByRole('button',{name:'Tách nền và xem lại'}).click();await expect(scan.getByRole('heading',{name:'Xem lại con vật của bé'})).toBeVisible();
 const pixel=await scan.locator('canvas').evaluate((c:HTMLCanvasElement)=>{const x=c.getContext('2d')!;return {outside:x.getImageData(0,0,1,1).data[3],belly:Array.from(x.getImageData(200,150,1,1).data)};});expect(pixel.outside).toBe(0);expect(pixel.belly).toEqual([255,255,255,255]);
 await scan.getByLabel('Đã xem lại nét vẽ và phần trắng trong con vật').check();await scan.screenshot({path:`${out}/C06-scan-review.png`,fullPage:true});await scan.getByRole('button',{name:'Xác nhận và gửi cho cô'}).click();await expect(scan.getByRole('status')).toContainText('Cô đã nhận tranh');
 await expect(page.getByRole('button',{name:/Bé nét trắng/})).toBeVisible({timeout:12000});await page.screenshot({path:`${out}/C07-teacher-console.png`,fullPage:true});await page.getByRole('button',{name:/Bé nét trắng/}).click();await page.getByRole('button',{name:'Thả vào biển',exact:true}).click();await expect(page.getByRole('status')).toContainText('Đã lưu');await page.getByRole('button',{name:'Đóng',exact:true}).click();
 const after=await (await page.request.get('/api/v1/teacher/creative-sessions/'+sessionId)).json();expect(after.counts.total).toBe(1);expect(after.counts.released).toBe(1);
 await page.request.post(`/api/v1/teacher/creative-sessions/${sessionId}/state`,{data:{state:'ended'}});await scan.getByLabel('Tên người vẽ').fill('Bé nét trắng thử lại');await scan.getByRole('button',{name:'Xác nhận và gửi cho cô'}).click();await expect(scan.getByRole('alert')).toBeVisible();await expect(scan.getByRole('button',{name:'Hoàn thành',exact:true})).toBeEnabled();await scan.getByLabel('Tên tác phẩm',{exact:true}).fill('Tranh quét của Bé nét trắng');await scan.getByRole('button',{name:'Hoàn thành',exact:true}).click();await expect(scan.getByRole('status')).toContainText('Đã hoàn thành');await scan.reload();
 await scan.goto('/profile'); await openDeviceProfileCollection(scan);await expect(scan.getByRole('heading',{name:'Tranh quét của Bé nét trắng',exact:true})).toBeVisible();
 await page.request.post(`/api/v1/teacher/creative-sessions/${sessionId}/state`,{data:{state:'ended'}});await child.close();expect(errors).toEqual([]);
});
test('color palette cancel, paint layers, erase, reload, and mobile targets',async({page})=>{
 await page.goto('/creative/drawing?template=turtle');const paint=page.getByTestId('drawing-canvas');await expect(page.getByRole('button',{name:'Lưu tiến trình',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Thêm màu',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('.drawing-shades .drawing-swatch')).toHaveCount(24);await page.locator('.drawing-shades .drawing-swatch').nth(5).click();await page.getByRole('button',{name:'Hủy',exact:true}).click();await expect(page.getByTestId('drawing-color-1E7E48')).toHaveAttribute('aria-pressed','true');
 const r=await paint.boundingBox();expect(r).toBeTruthy();await page.mouse.move(r!.x+r!.width*.5,r!.y+r!.height*.5);await page.mouse.down();await page.mouse.move(r!.x+r!.width*.6,r!.y+r!.height*.5,{steps:10});await page.mouse.up();
 const template=await page.locator('.drawing-template-layer').evaluate((c:HTMLCanvasElement)=>c.toDataURL());await page.getByTestId('drawing-tool-eraser').click();await page.mouse.move(r!.x+r!.width*.5,r!.y+r!.height*.5);await page.mouse.down();await page.mouse.move(r!.x+r!.width*.6,r!.y+r!.height*.5,{steps:10});await page.mouse.up();expect(await page.locator('.drawing-template-layer').evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(template);
 await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();await expect(page.getByRole('status')).toContainText('Đã lưu');const before=await paint.evaluate((c:HTMLCanvasElement)=>c.toDataURL());await page.reload();await expect(page.getByRole('button',{name:'Lưu tiến trình',exact:true})).toBeEnabled();await expect.poll(()=>paint.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(before);
 await page.getByRole('button',{name:'Thêm màu',exact:true}).click();await page.screenshot({path:`${out}/C04-color-palette.png`,fullPage:true});await page.setViewportSize({width:768,height:900});await expect.poll(()=>page.evaluate(()=>document.body.style.overflow)).toBe('hidden');await page.setViewportSize({width:1440,height:900});await expect.poll(()=>page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');await page.getByRole('button',{name:'Hủy',exact:true}).click();
 for(const width of [768,390,375]){await page.setViewportSize({width,height:900});expect(await page.getByRole('button',{name:'Cỡ nét 8',exact:true}).evaluate(e=>e.getBoundingClientRect().width>=44)).toBe(true);await page.getByRole('button',{name:'Thêm màu',exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect.poll(()=>page.locator('.drawing-shades .drawing-swatch').evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return r.width>=44&&r.height>=44;}))).toBe(true);expect(await paint.evaluate(n=>n.getBoundingClientRect().top)).toBeLessThan(await page.getByRole('dialog').evaluate(n=>n.getBoundingClientRect().top));if(width===390)await page.screenshot({path:`${out}/C09-mobile-palette.png`,fullPage:true});await page.getByRole('button',{name:'Hủy',exact:true}).click();}
});
test('habitat instances remain distinct across scenes, filters and run mode',async({page})=>{
 await page.goto('/creative/habitat');await expect(page.getByRole('button',{name:'Lưu tiến trình',exact:true})).toBeEnabled();const library=page.getByRole('region',{name:'Thư viện vật thể'});await library.locator('[data-testid^=habitat-select]').first().click();await page.getByRole('button',{name:'Thêm vào cảnh',exact:true}).click();await page.getByRole('button',{name:'Thêm vào cảnh',exact:true}).click();await page.locator('.creative-placed-items summary').click();const names=await page.locator('[data-testid^=habitat-placed]').allTextContents();expect(new Set(names).size).toBe(names.length);
 await page.getByRole('button',{name:'Thêm cảnh',exact:true}).click();await page.getByRole('button',{name:'Tạo cảnh',exact:true}).click();await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();await expect(page.getByRole('status')).toContainText('Đã lưu');
 const read=()=>page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((res,rej)=>{const r=indexedDB.open('ocean_creative_db');r.onsuccess=()=>res(r.result);r.onerror=rej;});return await new Promise<any>(res=>{const q=db.transaction('ocean_artworks').objectStore('ocean_artworks').get(new URL(location.href).searchParams.get('draft')!);q.onsuccess=()=>{db.close();res(q.result.habitatData.project);};});});const before=await read();expect(before.scenes).toHaveLength(2);await page.getByRole('button',{name:'Chạy thử',exact:true}).click();await page.getByRole('button',{name:'Sửa thiết kế',exact:true}).click();await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();await expect.poll(read).toEqual(before);await page.reload();await expect(page.getByRole('button',{name:'Lưu tiến trình',exact:true})).toBeEnabled();expect(await read()).toEqual(before);
 await page.getByLabel('Cảnh đang mở').selectOption({index:0});await page.screenshot({path:`${out}/C05-habitat-library.png`,fullPage:true});await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('button',{name:/Thư viện vật thể ·/}).click();await expect(page.getByRole('dialog',{name:'Thư viện vật thể'})).toBeVisible();await library.locator('[data-testid^=habitat-select]').first().click();await expect(page.getByRole('button',{name:'Thêm vào cảnh',exact:true})).toBeInViewport();expect(await page.getByTestId('habitat-board').evaluate(n=>n.getBoundingClientRect().top)).toBeLessThan(await page.getByRole('dialog',{name:'Thư viện vật thể'}).evaluate(n=>n.getBoundingClientRect().top));await page.screenshot({path:`${out}/C10-mobile-habitat.png`,fullPage:true});
});


test('coloring catalog uses the linked outline and returns to the same search',async({page})=>{
 await page.goto('/resources?kind=coloring&q=Rùa');
 const tile=page.locator('.coloring-resource-tile').first();
 await expect(tile.locator('img')).toHaveAttribute('src',/turtle_coloring_lineart/);
 await page.screenshot({path:`${out}/C03-coloring-catalog.png`,fullPage:true});
 await tile.getByRole('button',{name:/Tô tranh:/}).click();
 await expect(page.getByRole('heading',{name:'Rùa biển xanh',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Lưu tiến trình',exact:true})).toBeEnabled();
 expect(await page.locator('.drawing-template-layer').evaluate((c:HTMLCanvasElement)=>{const d=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=4)if(d[i])return true;return false;})).toBe(true);
 await page.getByRole('button',{name:'Quay lại',exact:true}).click();
 await expect(page.getByRole('searchbox')).toHaveValue('Rùa');
 await expect(page.locator('.coloring-resource-tile')).toHaveCount(1);
});

test('habitat sends every scene and teacher observes a read-only snapshot',async({browser,page})=>{
 const teacherContext=await browser.newContext(),teacher=await teacherContext.newPage();
 expect((await teacher.request.post('/api/v1/auth/login',{data:{email:'colinh@bluesteam.edu.vn',password:'daiduong2026'}})).ok()).toBeTruthy();
 const create=await teacher.request.post('/api/v1/teacher/creative-sessions',{data:{kind:'habitat',title:'Kiểm tra gửi nơi sống '+Date.now()}});expect(create.ok()).toBeTruthy();const session=await create.json();
 try{
 await page.goto('/creative/habitat');await expect(page.getByRole('button',{name:'Lưu tiến trình',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Thêm cảnh',exact:true}).click();await page.getByRole('button',{name:'Tạo cảnh',exact:true}).click();
 await page.getByRole('button',{name:'Gửi nơi sống cho cô',exact:true}).click();await page.getByLabel('Mã nhận bài của cô').fill(session.code);await page.getByLabel('Tên người tạo').fill('Bé hai cảnh');await page.getByRole('button',{name:'Xác nhận gửi cho cô'}).click();
 await expect(page.getByRole('dialog').getByRole('status')).toContainText('Cô đã nhận phiên bản');
 const detail=await(await teacher.request.get('/api/v1/teacher/creative-sessions/'+session.id)).json();expect(detail.items).toHaveLength(1);expect(detail.items[0].document.scenes).toHaveLength(2);
 await teacher.goto('/teacher/creative?tab=habitat&session='+session.id);await teacher.getByRole('button',{name:/Bé hai cảnh/}).click();await expect(teacher.getByLabel('Cảnh đang xem').locator('option')).toHaveCount(2);await teacher.getByLabel('Ghi chú riêng').fill('Quan sát kiểm tra: đủ hai cảnh.');await teacher.getByRole('button',{name:'Lưu ghi chú',exact:true}).click();await expect(teacher.getByRole('region',{name:'Tác phẩm của Bé hai cảnh'}).getByRole('status')).toContainText('Đã lưu');
 await teacher.screenshot({path:`${out}/C08-teacher-observation.png`,fullPage:true});
 }finally{await teacher.request.post('/api/v1/teacher/creative-sessions/'+session.id+'/state',{data:{state:'ended'}});await teacherContext.close();}
});

// A UI-only catalog fixture exercises the second row and cursor controls without changing seed data.
test('many coloring items paginate and remain readable across target widths',async({page})=>{
 const response=await page.request.get('/api/v1/resources?kind=coloring&limit=6');expect(response.ok()).toBeTruthy();const actual=await response.json();
 const assets=['turtle_coloring_lineart_v2','octopus_coloring_lineart_v2','clownfish_coloring_lineart','starfish_coloring_lineart','coral_coloring_lineart_v2','turtle_coloring_lineart_v2'];
 const fixture=Array.from({length:12},(_,i)=>({...actual.items[0],id:'visual-fixture-'+i,content:{...actual.items[0].content,drawingTemplateKey:undefined},title:'Tranh minh họa '+(i+1),coverUrl:'/assets/generated/craft/'+assets[i%6]+'.png',mediaUrl:'/assets/generated/craft/'+assets[i%6]+'.png'}));
 await page.route(url=>url.pathname==='/api/v1/resources',route=>{const url=new URL(route.request().url());const from=Number(url.searchParams.get('cursor')||0),limit=Number(url.searchParams.get('limit')||6);const list=fixture.filter(item=>item.title.toLowerCase().includes((url.searchParams.get('q')||'').toLowerCase()));return route.fulfill({json:{items:list.slice(from,from+limit),total:list.length,nextCursor:from+limit<list.length?String(from+limit):null}});});
 await page.goto('/resources?kind=coloring');await expect(page.locator('.coloring-resource-tile')).toHaveCount(6);
 await page.getByRole('button',{name:'Trang sau'}).click();await expect(page.locator('.coloring-resource-tile h3').first()).toHaveText('Tranh minh họa 7');
 await page.getByRole('button',{name:'Trang trước'}).click();await expect(page.locator('.coloring-resource-tile h3').first()).toHaveText('Tranh minh họa 1');
 for(const width of [1440,1366,768,390,375]){await page.setViewportSize({width,height:1000});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);if(width===1440)await page.screenshot({path:out+'/C03-many-items-UI-fixture.png',fullPage:true});}
});

test('completion failure preserves the draft and a retry completes without duplication',async({page})=>{
 await page.goto('/creative/drawing?template=turtle');await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();await expect(page.getByRole('status')).toContainText('Đã lưu tiến trình');
 await page.evaluate(()=>{const put=IDBObjectStore.prototype.put;(window as any).__restorePut=()=>{IDBObjectStore.prototype.put=put;};IDBObjectStore.prototype.put=function(){throw new DOMException('Dung lượng thiết bị đã đầy','QuotaExceededError');};});
 await page.getByRole('button',{name:'Hoàn thành',exact:true}).click();await expect(page.getByRole('status')).toContainText(/đầy|lưu|dung lượng/i);await expect(page.locator('.creative-finished')).toHaveCount(0);await expect(page.getByTestId('drawing-tool-brush')).toBeEnabled();
 await page.evaluate(()=>(window as any).__restorePut());await page.goto('/creative');await expect(page.locator('.creative-progress-item')).toHaveCount(1);await page.locator('.creative-progress-item').click();await page.getByRole('button',{name:'Hoàn thành',exact:true}).click();await expect(page.locator('.creative-finished')).toBeVisible();await page.goto('/creative');await expect(page.locator('.creative-progress-item')).toHaveCount(0);
});

test('eight full scenes preserve 100 distinct instances each on completion',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/creative/habitat');await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();await expect(page.getByRole('status')).toContainText('Đã lưu tiến trình');
 const id=new URL(page.url()).searchParams.get('draft')!;
 await page.evaluate(async id=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('ocean_creative_db');r.onsuccess=()=>resolve(r.result);r.onerror=reject;});await new Promise<void>((resolve,reject)=>{const tx=db.transaction('ocean_artworks','readwrite'),store=tx.objectStore('ocean_artworks'),r=store.get(id);r.onsuccess=()=>{const art=r.result,base=art.habitatData.items;const scenes=Array.from({length:8},(_,s)=>({id:'scene-'+s,title:'Cảnh '+(s+1),items:Array.from({length:100},(_,i)=>({...base[i%base.length],id:'scene-'+s+'-item-'+i,x:(i%10-4.5)*1.1,z:(Math.floor(i/10)-4.5)*.65}))}));store.put({...art,habitatData:{items:scenes[0].items,project:{version:1,activeSceneId:'scene-0',scenes}}});};tx.oncomplete=()=>{db.close();resolve();};tx.onerror=reject;});},id);
 await page.reload();await expect(page.getByLabel('Cảnh đang mở').locator('option')).toHaveCount(8);await expect(page.getByRole('button',{name:'Thêm cảnh',exact:true})).toBeDisabled();await page.locator('[data-testid^=habitat-select]').first().click();await expect(page.getByRole('button',{name:'Thêm vào cảnh',exact:true})).toBeDisabled();
 await page.getByLabel('Cảnh đang mở').selectOption('scene-7');await expect(page.locator('canvas')).toHaveCount(1);await page.screenshot({path:out+'/C05-full-project-100.png',fullPage:true});await page.getByRole('button',{name:'Hoàn thành',exact:true}).click();await expect(page.locator('.creative-finished')).toBeVisible();
 const result=await page.evaluate(async id=>{const db=await new Promise<IDBDatabase>(resolve=>{const r=indexedDB.open('ocean_creative_db');r.onsuccess=()=>resolve(r.result);});return await new Promise<any>(resolve=>{const r=db.transaction('ocean_artworks').objectStore('ocean_artworks').get(id);r.onsuccess=()=>{db.close();resolve(r.result);};});},id);expect(result.isDraft).toBe(false);expect(result.habitatData.project.scenes.map((s:any)=>s.items.length)).toEqual(Array(8).fill(100));expect(new Set(result.habitatData.project.scenes.flatMap((s:any)=>s.items.map((i:any)=>i.id))).size).toBe(800);
});

test('scan review is invalidated by crop changes and mobile steps resume correctly',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/creative/scan');
 const data=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=400;c.height=300;const x=c.getContext('2d')!;x.fillStyle='white';x.fillRect(0,0,400,300);x.strokeStyle='blue';x.lineWidth=10;x.beginPath();x.ellipse(200,150,70,50,0,0,Math.PI*2);x.stroke();return c.toDataURL().split(',')[1];});
 await page.locator('input[type=file]').last().setInputFiles({name:'review.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')});await page.getByRole('button',{name:'Tách nền và xem lại'}).click();
 await page.getByRole('button',{name:'Hoàn thành',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Xác nhận');await expect(page.locator('.creative-finished')).toHaveCount(0);
 await page.getByLabel('Đã xem lại nét vẽ và phần trắng trong con vật').check();await page.getByRole('button',{name:/Chụp tranh/}).first().click();await page.getByLabel('Chiều rộng').fill('80');await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();await page.reload();await expect(page.getByAltText('Ảnh gốc của bé',{exact:true})).toBeVisible();await expect(page.getByLabel('Chiều rộng')).toHaveValue('80');
 await page.getByRole('button',{name:'Tách nền và xem lại'}).click();await expect(page.getByLabel('Đã xem lại nét vẽ và phần trắng trong con vật')).not.toBeChecked();await page.getByLabel('Đã xem lại nét vẽ và phần trắng trong con vật').check();await page.getByRole('button',{name:'Chọn nơi thả',exact:true}).click();await page.getByRole('button',{name:'Vịnh xanh',exact:true}).click();await page.getByRole('button',{name:'Lưu tiến trình',exact:true}).click();await page.reload();await expect(page.getByRole('button',{name:'Vịnh xanh',exact:true})).toHaveAttribute('aria-pressed','true');await page.screenshot({path:out+'/C06-mobile-step-three.png',fullPage:true});await page.getByRole('button',{name:'Hoàn thành',exact:true}).click();await expect(page.locator('.creative-finished')).toBeVisible();
});
