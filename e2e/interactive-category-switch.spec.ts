import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const output='screenshots/interactive-category-fix';
test.use({trace:'off',video:process.env.INTERACTIVE_RECORD_MOTION==='1'?{mode:'on',size:{width:1440,height:900}}:'off'});
test.afterEach(async({page},info)=>{const video=page.video();if(video){await page.close();await video.saveAs(`${output}/${info.title.replace(/[^a-z0-9]+/gi,'-')}.webm`);}});
for(const role of ['teacher','student'] as const){
 test(`${role} category switch preserves the page and only refreshes results`,async({page})=>{
  mkdirSync(output,{recursive:true});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   (window as any).__categorySnapshots=0;(window as any).__categoryEntrances=[];
   if(document.startViewTransition){const start=document.startViewTransition.bind(document);document.startViewTransition=((...args:any[])=>{(window as any).__categorySnapshots++;return (start as any)(...args);}) as any;}
   const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){(window as any).__categoryEntrances.push(this.className);return animate.call(this,frames,options);};
  });
  const teacher=role==='teacher';
  expect((await page.request.post('/api/v1/auth/login',{data:teacher?{email:'colinh@bluesteam.edu.vn',password:'daiduong2026'}:{email:'hocsinh',password:'hocsinh',role:'student'}})).ok()).toBe(true);
  await page.goto(teacher?'/teacher/interactive?kind=game':'/interactive?kind=game&view=all');
  await expect(page.locator(teacher?'.curated-card':'.ocean-activity-card').first()).toBeVisible();
  await page.evaluate(()=>Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.decode().catch(()=>{}))));
  await page.waitForTimeout(1400);
  await page.evaluate(()=>{(window as any).__categoryNodes=[document.querySelector('.interactive-worlds'),document.querySelector('.interactive-seascape__artwork'),document.querySelector('h1')];(window as any).__categorySnapshots=0;(window as any).__categoryEntrances=[];});
  for(const kind of ['simulation','model3d','scenario','game']){
   await page.getByTestId(`interactive-tab-${kind}`).click();
   await expect(page.getByTestId(`interactive-tab-${kind}`)).toHaveAttribute('aria-pressed','true');
   await expect(page.locator(teacher?'section[aria-label="Hoạt động trong thư viện"]':'.ocean-play-catalog__results')).toHaveAttribute('aria-busy','false');
   expect(await page.evaluate(()=>(window as any).__categorySnapshots)).toBe(0);
   expect(await page.evaluate(()=>{const before=(window as any).__categoryNodes;return before[0]===document.querySelector('.interactive-worlds')&&before[1]===document.querySelector('.interactive-seascape__artwork')&&before[2]===document.querySelector('h1');})).toBe(true);
   const entrances=await page.evaluate(()=>(window as any).__categoryEntrances as string[]);
   expect(entrances.filter(c=>typeof c==='string'&&/interactive-world__art$|interactive__intro|catalog__intro|catalog-toolbar|interactive__filters/.test(c))).toEqual([]);
   await page.waitForTimeout(250);
  }
  await page.getByTestId('interactive-tab-simulation').click();await page.getByTestId('interactive-tab-game').click();
  await expect(page.getByTestId('interactive-tab-game')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator(teacher?'.curated-card':'.ocean-activity-card').first()).toBeVisible();
  await page.screenshot({path:`${output}/${role}-stable.png`});
  expect(errors).toEqual([]);
 });
}
