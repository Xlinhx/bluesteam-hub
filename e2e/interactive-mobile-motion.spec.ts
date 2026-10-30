import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const output='screenshots/interactive-mobile-motion';
test.use({isMobile:true,hasTouch:true,viewport:{width:390,height:844},trace:'off',video:process.env.INTERACTIVE_RECORD_MOTION==='1'?{mode:'on',size:{width:430,height:932}}:'off'});
test.setTimeout(90_000);
test.beforeEach(()=>mkdirSync(output,{recursive:true}));
test.afterEach(async({page},info)=>{const video=page.video();if(video){await page.close();await video.saveAs(`${output}/${info.title.replace(/[^a-z0-9]+/gi,'-')}.webm`);}});
for(const role of ['student','teacher'] as const){
 test(`${role} touch motion keeps the selected world alive across sizes and navigation`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const teacher=role==='teacher';
  expect((await page.request.post('/api/v1/auth/login',{data:teacher?{email:'colinh@bluesteam.edu.vn',password:'daiduong2026'}:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
  await page.goto(teacher?'/teacher/interactive?kind=game':'/interactive?kind=game&view=all');
  await expect(page.locator('.interactive-world-scene[data-ready=true]')).toHaveCount(4);
  expect(await page.evaluate(()=>matchMedia('(hover:none) and (pointer:coarse)').matches)).toBe(true);
  for(const size of [{width:360,height:800},{width:390,height:844},{width:430,height:932},{width:844,height:390}]){
   await page.setViewportSize(size);
   await page.evaluate(()=>scrollTo(0,0));
   await expect.poll(()=>page.getByTestId('interactive-tab-game').locator('.interactive-world-scene__actor').evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('running');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   const actor=page.getByTestId('interactive-tab-game').locator('.interactive-world-scene__actor');
   expect(parseFloat(await actor.evaluate(el=>getComputedStyle(el).getPropertyValue('--world-motion-distance')))).toBe(size.height<500?.5:.62);
   if(size.height<500){const box=await page.getByTestId('interactive-tab-game').boundingBox();expect(box!.y+box!.height).toBeLessThan(size.height-48);}
   await page.screenshot({path:`${output}/${role}-${size.width}.png`});
  }
  await page.setViewportSize({width:390,height:844});
  for(const kind of ['model3d','simulation','scenario','game']){
   const button=page.getByTestId(`interactive-tab-${kind}`);await button.tap();
   await expect(button).toHaveAttribute('aria-pressed','true');
   await expect.poll(()=>page.locator('html').getAttribute('data-interactive-journey')).toBeNull();
   await expect.poll(()=>button.locator('.interactive-world-scene__actor').evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('running');
   expect(await page.locator('.interactive-world:not([aria-pressed=true]) .interactive-world-scene__actor').evaluateAll(els=>els.every(el=>getComputedStyle(el).animationPlayState==='paused'))).toBe(true);
   await page.waitForTimeout(550);
  }
  // A scroll gesture must not switch a world or leave its idle animations running offscreen.
  await page.evaluate(()=>scrollTo(0,850));
  await expect(page.getByTestId('interactive-tab-game').locator('.interactive-world-scene')).toHaveAttribute('data-in-view','false');
  expect(await page.getByTestId('interactive-tab-game').locator('.interactive-world-scene__actor').evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('paused');
  const card=page.locator(teacher?'.curated-card':'.ocean-activity-card').first();
  await card.getByRole('button',{name:teacher?'Xem thử':'Chơi ngay',exact:true}).tap();
  await expect(page.locator('.interactive-activity-motion')).toBeVisible();
  await page.waitForTimeout(1100);
  if(teacher){await page.getByRole('button',{name:'Đóng xem thử'}).tap();await expect(page.getByRole('dialog')).toHaveCount(0);}
  else{await page.goBack();await expect(page.locator('.ocean-activity-card').first()).toBeVisible();}
  await page.evaluate(()=>scrollTo(0,0));
  const search=page.getByRole('textbox',{name:'Tìm hoạt động',exact:true});await search.tap();await search.fill('cá');
  await page.setViewportSize({width:390,height:510});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await search.fill('');await search.blur();await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  expect(await page.locator('.interactive-world-scene').evaluateAll(els=>els.every(el=>el.getAnimations({subtree:true}).length===0))).toBe(true);
  expect(await page.locator('.interactive-ocean-life').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
  expect(errors).toEqual([]);
 });
}
test('mobile ambient motion stays restrained during a throttled scroll sample',async({page,context})=>{
 expect((await page.request.post('/api/v1/auth/login',{data:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBeTruthy();
 await page.goto('/interactive?kind=game&view=all');
 await expect(page.locator('.interactive-world-scene[data-ready=true]')).toHaveCount(4);
 await page.waitForTimeout(1300);
 const mobileCount=await page.locator('.interactive-ocean-life').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length);
 expect(mobileCount).toBeLessThan(26);expect(mobileCount).toBeGreaterThan(4);
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const sample=await page.evaluate(()=>new Promise<{frames:number;p95:number;over50:number}>(resolve=>{
  const deltas:number[]=[];let start=0,last=0;
  const step=(now:number)=>{if(!start)start=now;if(last)deltas.push(now-last);last=now;
   scrollTo(0,(1-Math.cos((now-start)/1800*Math.PI))*220);
   if(now-start<1800)requestAnimationFrame(step);else{deltas.sort((a,b)=>a-b);resolve({frames:deltas.length,p95:deltas[Math.floor(deltas.length*.95)],over50:deltas.filter(v=>v>50).length});}
  };requestAnimationFrame(step);
 }));
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await cdp.detach();
 console.log('Mobile Chrome emulation, 4x CPU sample:',JSON.stringify({mobileCount,...sample}));
 expect(sample.frames).toBeGreaterThan(25);expect(sample.p95).toBeLessThan(100);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
