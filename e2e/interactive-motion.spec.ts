import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const output='screenshots/interactive-motion';
test.setTimeout(45_000);
test.use({trace:'off',video:process.env.INTERACTIVE_RECORD_MOTION==='1'?{mode:'on',size:{width:1200,height:800}}:'off'});
test.beforeEach(async({page})=>{
  mkdirSync(output,{recursive:true});
  await page.addInitScript(()=>{
    (window as any).__motionCalls=[];
    const original=Element.prototype.animate;
    Element.prototype.animate=function(frames,options){
      (window as any).__motionCalls.push({target:this.getAttribute('class'),resident:this.getAttribute('data-resident-id'),frames,options});
      return original.call(this,frames,options);
    };
  });
});
test.afterEach(async({page,context},info)=>{
  const video=page.video();
  if(video){await page.close();await video.saveAs(`${output}/${info.title.replace(/[^a-z0-9]+/gi,'-')}.webm`);}
});

test('teacher preview and mode switch remain interruptible',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  let previewWrites=0;
  page.on('request',request=>{if(request.method()==='POST'&&request.url().includes('/interactive-usage/runs'))previewWrites++;});
  expect((await page.request.post('/api/v1/auth/login',{data:{email:'colinh@bluesteam.edu.vn',password:'daiduong2026'}})).ok()).toBeTruthy();
  await page.setViewportSize({width:1200,height:800});
  await page.goto('/teacher/interactive?kind=game');
  await expect(page.locator('.curated-card').first()).toBeVisible();
  await page.getByRole('button',{name:'Xu hướng',exact:true}).click();
  await page.getByRole('button',{name:'Hoạt động',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>((window as any).__motionCalls as any[]).filter(x=>x.target==='interactive-view-current').length)).toBeGreaterThan(0);
  await expect.poll(()=>page.locator('.interactive-view-current').evaluate(el=>{
    const a=el.getBoundingClientRect(),b=el.parentElement!.querySelector('[aria-pressed=true]')!.getBoundingClientRect();return Math.abs(a.left-b.left)+Math.abs(a.width-b.width);
  })).toBeLessThan(2);
  const preview=page.locator('.curated-card').filter({has:page.getByRole('heading',{name:'Về đúng nhà',exact:true})}).first().getByRole('button',{name:'Xem thử',exact:true});
  await preview.click();await expect(page.getByRole('dialog')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>((window as any).__motionCalls as any[]).some(x=>x.target==='curated-preview'&&x.frames[0].clipPath))).toBeTruthy();
  await page.getByRole('dialog').evaluate(el=>el.getAnimations().forEach(animation=>{animation.pause();animation.currentTime=140;}));
  await page.screenshot({path:`${output}/teacher-preview-midpoint.png`});
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(preview).toBeFocused();
  await preview.click();await page.getByRole('button',{name:'Đóng xem thử'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>{(window as any).__motionCalls=[];});
  await preview.click();await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.getByRole('dialog').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(()=>((window as any).__motionCalls as any[]).some(x=>x.target==='curated-preview'))).toBeFalsy();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:390,height:844});
  await preview.click();await page.getByRole('button',{name:'Đóng xem thử'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(preview).toBeFocused();
  expect(await page.locator('#root').evaluate(el=>el.inert)).toBeFalsy();
  expect(previewWrites).toBe(0);expect(errors).toEqual([]);
});

test('matching choice and scenario feedback keep their semantic states on mobile',async({page})=>{
  expect((await page.request.post('/api/v1/auth/login',{data:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
  await page.route('**/api/v1/interactive-usage/**',route=>route.request().method()==='POST'?route.fulfill({json:{runId:'motion-test',token:'fixture',expiresAt:'2099-01-01',openedAt:'2026-10-28'}}):route.continue());
  const image='/assets/generated/interactive/v5/creature-starfish-cutout-v1.webp';
  const configs={
    matching:{pairs:[{id:'a',left:{label:'Sao biển',imageUrl:image},right:{label:'Bóng sao',imageUrl:image,isSilhouette:true}},{id:'b',left:{label:'Bạn sao',imageUrl:image},right:{label:'Bóng bạn',imageUrl:image,isSilhouette:true}}]},
    choice:{questions:[{id:'a',promptText:'Chọn sao biển',correctOptionId:'yes',options:[{id:'yes',label:'Sao biển',imageUrl:image},{id:'no',label:'Khác',imageUrl:image}]},{id:'b',promptText:'Câu tiếp theo',correctOptionId:'next',options:[{id:'next',label:'Sao',imageUrl:image}]}]},
    scenario:{startSceneId:'start',scenes:[{id:'start',title:'Bờ biển',backgroundUrl:image,narrationText:'Cùng giúp biển',choices:[{id:'help',label:'Nhặt rác',nextSceneId:'end',feedbackText:'Biển sạch hơn'}]},{id:'end',title:'Kết quả',backgroundUrl:image,narrationText:'Biển sạch',isEnd:true,choices:[]}]},
  };
  await page.setViewportSize({width:390,height:844});
  for(const template of ['matching','choice','scenario'] as const){
    await page.route(`**/api/v1/activities/motion-${template}`,route=>route.fulfill({json:{id:`motion-${template}`,version:1,kind:template==='scenario'?'scenario':'game',templateKey:template,title:'Minh họa motion',config:configs[template]}}));
    await page.goto(`/interactive/activities/motion-${template}`);
    if(template==='matching'){
      await page.getByTestId('matching-left-a').click();
      await page.getByTestId('matching-right-b').click();await expect(page.getByTestId('matching-feedback')).toHaveAttribute('data-feedback','retry');
      await page.getByTestId('matching-right-a').click();await expect(page.getByTestId('matching-feedback')).toHaveAttribute('data-feedback','correct');
      await expect(page.getByTestId('matching-left-a')).toBeDisabled();
    }else if(template==='choice'){
      await page.getByTestId('choice-option-no').click();await expect(page.getByTestId('choice-feedback')).toHaveAttribute('data-feedback','retry');
      await page.getByTestId('choice-option-yes').click();await expect(page.getByTestId('choice-feedback')).toHaveAttribute('data-feedback','correct');
      await page.getByTestId('choice-next-question').click();await expect(page.getByTestId('choice-option-next')).toBeVisible();
    }else{
      await page.getByTestId('scenario-choice-help').click();
      await expect(page.getByTestId('scenario-feedback')).toContainText('Biển sạch hơn');
      await page.getByTestId('scenario-feedback').getByRole('button').click();
      await expect(page.getByTestId('scenario-runtime')).toHaveAttribute('data-scene-id','end');
      expect(await page.evaluate(()=>((window as any).__motionCalls as any[]).some(x=>x.frames[0].opacity===.6))).toBeTruthy();
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
});

test('learner placement follows geometry and respects reduced motion',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  expect((await page.request.post('/api/v1/auth/login',{data:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
  await page.route('**/api/v1/interactive-usage/**',route=>route.request().method()==='POST'?route.fulfill({json:{runId:'motion-test',token:'fixture',expiresAt:'2099-01-01',openedAt:'2026-10-28'}}):route.continue());
  const image='/assets/generated/interactive/v5/creature-starfish-cutout-v1.webp';
  await page.route('**/api/v1/activities/motion-fixture',route=>route.fulfill({json:{id:'motion-fixture',version:1,kind:'game',templateKey:'sorting',title:'Motion fixture',config:{instructionText:'Chọn bạn rồi chọn nơi sống.',backgroundUrl:'/assets/generated/interactive/v5/activity-sorting-v4.webp',targets:[{id:'sand',label:'Cát',bounds:{x:.05,y:.52,width:.35,height:.2}}],objects:[{id:'star',label:'Sao biển',imageUrl:image,acceptedTargetIds:['sand']},{id:'star2',label:'Bạn sao',imageUrl:image,acceptedTargetIds:['sand']}]}}}));
  for(const reduced of [false,true]){
    await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
    await page.setViewportSize(reduced?{width:390,height:844}:{width:1200,height:900});
    await page.goto('/interactive/activities/motion-fixture');
    await page.getByRole('button',{name:'Bắt đầu tìm nhà'}).click();
    await page.getByTestId('sorting-item-star').click();
    const source=await page.getByTestId('sorting-item-star').locator('img').boundingBox();
    await page.getByTestId('sorting-zone-sand').click();
    await expect(page.locator('[data-resident-id="star"]')).toBeVisible();
    const calls=await page.evaluate(()=>((window as any).__motionCalls as any[]).filter(x=>x.resident==='star'));
    expect(calls.length).toBe(reduced?0:1);
    if(!reduced){
      expect(calls[0].frames[0].translate).not.toBe('0px 0px');
      const start=await page.locator('[data-resident-id="star"]').evaluate(el=>{
        el.getAnimations().forEach(a=>{a.pause();a.currentTime=0;});
        const rect=el.getBoundingClientRect();return {left:rect.left,top:rect.top,width:rect.width,height:rect.height};
      });
      expect(Math.abs(start.left-source!.x)).toBeLessThan(2);
      expect(Math.abs(start.top-source!.y)).toBeLessThan(2);
      expect(Math.abs(start.width-source!.width)).toBeLessThan(2);
      await page.locator('[data-resident-id="star"]').evaluate(el=>el.getAnimations().forEach(a=>{a.pause();a.currentTime=200;}));
      await page.screenshot({path:`${output}/learner-placement-midpoint.png`});
      await page.setViewportSize({width:1180,height:880});
      expect(await page.locator('[data-resident-id="star"]').evaluate(el=>el.getAnimations().length)).toBe(0);
    }
    await expect(page.getByTestId('sorting-feedback')).toContainText('về đúng nhà');
    if(reduced)await page.screenshot({path:`${output}/learner-reduced-mobile.png`});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
  expect(errors).toEqual([]);
});

test('simulation comparison responds immediately and reverses safely',async({page})=>{
  expect((await page.request.post('/api/v1/auth/login',{data:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
  await page.route('**/api/v1/activities/sim-my-action',route=>route.fulfill({json:{id:'sim-my-action',version:1,kind:'simulation',templateKey:'my-action',title:'Hành động của em',config:{}}}));
  await page.route('**/api/v1/interactive-usage/**',route=>route.request().method()==='POST'?route.fulfill({json:{runId:'motion-test',token:'fixture',expiresAt:'2099-01-01',openedAt:'2026-10-28'}}):route.continue());
  await page.setViewportSize({width:1200,height:900});
  await page.goto('/interactive/my-action');
  await page.getByRole('button',{name:'Bỏ vào thùng',exact:true}).click();
  await expect(page).toHaveURL(/mode=compare/);
  await expect(page.locator('[data-comparison-image]')).toHaveCount(2);
  expect(await page.evaluate(()=>((window as any).__motionCalls as any[]).filter(x=>x.frames[0].clipPath).length)).toBe(2);
  await page.screenshot({path:`${output}/simulation-comparison.png`});
  await page.getByRole('button',{name:'Thử lựa chọn khác',exact:true}).click();
  await expect(page.getByRole('button',{name:'Bỏ vào thùng',exact:true})).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('button',{name:'Bỏ vào thùng',exact:true}).click();
  expect(await page.locator('[data-comparison-image]').first().evaluate(el=>el.getAnimations().length)).toBe(0);
});

test('plastic journey marker follows the chosen waypoint and stops on pause',async({page})=>{
  expect((await page.request.post('/api/v1/auth/login',{data:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
  await page.route('**/api/v1/activities/sim-plastic-journey',route=>route.fulfill({json:{id:'sim-plastic-journey',version:1,kind:'simulation',templateKey:'plastic-journey',title:'Hành trình mảnh nhựa',config:{}}}));
  await page.route('**/api/v1/interactive-usage/**',route=>route.request().method()==='POST'?route.fulfill({json:{runId:'motion-test',token:'fixture',expiresAt:'2099-01-01',openedAt:'2026-10-28'}}):route.continue());
  await page.setViewportSize({width:1200,height:900});
  await page.goto('/interactive/plastic-journey');
  await page.getByRole('button',{name:'Gần nơi sống',exact:true}).click();
  await expect(page.locator('[data-waypoint-current]')).toHaveAttribute('data-waypoint-current','habitat');
  expect(await page.locator('[data-waypoint-current]').evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
  await page.getByRole('button',{name:/Tạm dừng/,exact:false}).last().click();
  expect(await page.locator('[data-waypoint-current]').evaluate(el=>el.getAnimations().length)).toBe(0);
  await page.screenshot({path:`${output}/plastic-journey-paused.png`});
});


test('layered ocean and catalog journeys stay continuous on desktop and mobile',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  expect((await page.request.post('/api/v1/auth/login',{data:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
  await page.setViewportSize({width:1440,height:960});
  await page.goto('/interactive?kind=game&view=all');
  await expect(page.locator('.ocean-activity-card').first()).toBeVisible();
  await expect(page.locator('.interactive-reef-fish')).toHaveCount(12);
  await expect.poll(()=>page.locator('.interactive-ocean-life').evaluate(el=>el.getAnimations({subtree:true}).length)).toBeGreaterThan(15);
  // This capture is intentional motion evidence: allow the layered entrance and ambient cycle to play.
  await page.waitForTimeout(1800);
  await page.screenshot({path:`${output}/layered-ocean-desktop.png`});
  await page.locator('.ocean-activity-card').first().getByRole('button',{name:'Chơi ngay'}).click();
  await expect(page.locator('.interactive-activity-motion')).toBeVisible();
  await expect.poll(()=>page.locator('html').getAttribute('data-interactive-journey')).toBe('forward');
  await expect.poll(()=>page.locator('html').getAttribute('data-interactive-journey')).toBeNull();
  await page.goBack();await expect(page.locator('.ocean-activity-card').first()).toBeVisible();
  await expect.poll(()=>page.locator('html').getAttribute('data-interactive-journey')).toBeNull();
  await page.getByTestId('interactive-tab-simulation').click();await expect(page).toHaveURL(/kind=simulation/);
  await expect.poll(()=>page.locator('html').getAttribute('data-interactive-journey')).toBeNull();
  await page.getByTestId('interactive-tab-game').click();await expect(page).toHaveURL(/kind=game/);
  await expect.poll(()=>page.locator('html').getAttribute('data-interactive-journey')).toBeNull();
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(1300);
  await page.screenshot({path:`${output}/layered-ocean-mobile.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.emulateMedia({reducedMotion:'reduce'});
  expect(await page.locator('.interactive-ocean-life').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
  await page.getByTestId('interactive-tab-simulation').click();await expect(page).toHaveURL(/kind=simulation/);
  expect(await page.locator('html').getAttribute('data-interactive-journey')).toBeNull();
  expect(errors).toEqual([]);
});


test('artwork entrance waits for its bitmap and the tidal shelf remains visible',async({page})=>{
  expect((await page.request.post('/api/v1/auth/login',{data:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
  let release!:()=>void;const held=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/world-game.webp',async route=>{await held;await route.continue();});
  await page.goto('/interactive?kind=game&view=all',{waitUntil:'domcontentloaded'});
  await expect(page.getByTestId('interactive-tab-game')).toBeVisible();
  expect(await page.locator('.interactive-world--game .interactive-world__light').evaluate(el=>getComputedStyle(el).display)).toBe('block');
  expect(await page.locator('.interactive-world--game .interactive-world__art').evaluate(el=>el.getAnimations().length)).toBe(0);
  release();
  await expect.poll(()=>page.locator('.interactive-world--game .interactive-world__art').evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
  await page.emulateMedia({reducedMotion:'reduce'});
  expect(await page.locator('.interactive-world--game .interactive-world__art').evaluate(el=>el.getAnimations().length)).toBe(0);
});


test('worlds animate separate actors and artwork follows its own activity',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  expect((await page.request.post('/api/v1/auth/login',{data:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
  await page.goto('/interactive?kind=game&view=all');
  await expect(page.locator('.interactive-world-scene[data-ready=true]')).toHaveCount(4);
  await expect(page.locator('.ocean-activity-card').first()).toBeVisible();
  const art=page.locator('.interactive-world--game .interactive-world-scene__actor');
  expect(await art.evaluate(el=>getComputedStyle(el).animationName)).toBe('world-fish-bob');
  expect(await art.evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('running');
  await page.evaluate(()=>window.scrollTo(0,900));
  await expect(page.locator('.interactive-world--game .interactive-world-scene')).toHaveAttribute('data-in-view','false');
  expect(await art.evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('paused');
  await page.evaluate(()=>window.scrollTo(0,0));
  const thumbnail=page.locator('.ocean-activity-card').first().locator('.activity-thumbnail');
  const id=await thumbnail.getAttribute('data-motion-content-id');
  await page.locator('.ocean-activity-card').first().getByRole('button',{name:'Chơi ngay'}).click();
  await expect(page.locator('.interactive-activity-motion')).toHaveAttribute('data-motion-content-id',id!);
  await expect.poll(()=>page.evaluate(()=>[...document.querySelectorAll<HTMLElement>('[data-motion-content-id],.sorting-journey__backdrop')].some(el=>el.style.viewTransitionName==='interactive-artwork'))).toBeTruthy();
  await expect.poll(()=>page.locator('html').getAttribute('data-interactive-journey')).toBeNull();
  expect(await page.evaluate(()=>document.querySelectorAll('[style*=interactive-artwork]').length)).toBe(0);
  await page.goBack();await expect(page.locator('.ocean-activity-card').first()).toBeVisible();
  await expect.poll(()=>page.locator('html').getAttribute('data-interactive-journey')).toBeNull();
  await page.emulateMedia({reducedMotion:'reduce'});
  expect(await art.evaluate(el=>el.getAnimations().length)).toBe(0);
  expect(errors).toEqual([]);
});


test('finished learner motion tour shows four layered worlds and a reversible artwork journey',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  expect((await page.request.post('/api/v1/auth/login',{data:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
  await page.setViewportSize({width:1440,height:960});
  await page.goto('/interactive?kind=game&view=all');
  await expect(page.locator('.interactive-world-scene[data-ready=true]')).toHaveCount(4);
  await expect(page.locator('.ocean-activity-card').first()).toBeVisible();
  await page.evaluate(()=>Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.decode().catch(()=>{}))));
  await page.waitForTimeout(1300);
  await page.screenshot({path:`${output}/finished-learner-desktop.png`});
  for(const kind of ['model3d','game','simulation','scenario']){
    await page.getByTestId(`interactive-tab-${kind}`).hover();await page.waitForTimeout(1100);
  }
  const card=page.locator('.ocean-activity-card').filter({has:page.getByRole('heading',{name:'Về đúng nhà',exact:true})}).first();
  await card.getByRole('button',{name:'Chơi ngay'}).click();
  await expect(page.locator('.interactive-activity-motion')).toBeVisible();
  await page.waitForTimeout(1300);
  await page.goBack();await expect(card).toBeVisible();
  await expect.poll(()=>page.locator('html').getAttribute('data-interactive-journey')).toBeNull();
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
  await page.screenshot({path:`${output}/finished-learner-mobile.png`});
  await page.getByTestId('interactive-tab-simulation').click();
  await expect(page).toHaveURL(/kind=simulation/);
  await expect.poll(()=>page.locator('html').getAttribute('data-interactive-journey')).toBeNull();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  expect(errors).toEqual([]);
});

test('finished teacher motion tour opens the actual card artwork into preview',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  let writes=0;page.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/interactive-usage/runs'))writes++;});
  expect((await page.request.post('/api/v1/auth/login',{data:{email:'colinh@bluesteam.edu.vn',password:'daiduong2026'}})).ok()).toBeTruthy();
  await page.setViewportSize({width:1440,height:960});
  await page.goto('/teacher/interactive?kind=game');
  await expect(page.locator('.interactive-world-scene[data-ready=true]')).toHaveCount(4);
  await expect(page.locator('.curated-card').first()).toBeVisible();
  await page.evaluate(()=>Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.decode().catch(()=>{}))));
  await page.waitForTimeout(1200);
  await page.screenshot({path:`${output}/finished-teacher-desktop.png`});
  for(const kind of ['model3d','game','simulation','scenario']){
    await page.getByTestId(`interactive-tab-${kind}`).hover();await page.waitForTimeout(900);
  }
  await page.locator('.curated-card').first().getByRole('button',{name:'Xem thử',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect.poll(()=>page.locator('.interactive-preview-flight').evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
  await page.locator('.interactive-preview-flight').evaluate(el=>el.getAnimations().forEach(a=>{a.pause();a.currentTime=500;}));
  await page.screenshot({path:`${output}/finished-preview-artwork-midpoint.png`});
  await page.locator('.interactive-preview-flight').evaluate(el=>el.getAnimations().forEach(a=>a.play()));
  await page.waitForTimeout(1000);
  await page.getByRole('button',{name:'Đóng xem thử'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'Xu hướng',exact:true}).click();
  await expect(page.locator('.usage-summary')).toBeVisible();
  await expect.poll(()=>page.locator('html').getAttribute('data-interactive-journey')).toBeNull();
  await page.screenshot({path:`${output}/finished-teacher-trends.png`});
  expect(writes).toBe(0);expect(errors).toEqual([]);
});
