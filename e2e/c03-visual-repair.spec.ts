import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {resolveTemplateReference} from '../src/shared/creative/templateReference';

const art='/assets/generated/craft/turtle_coloring_lineart_v2.png';
const groups=['Bạn dưới biển','Rạn san hô','Bên bờ biển'].map((title,i)=>({id:`group-${i}`,title,coverUrl:null,previews:[],memberCount:24}));
const names=['Rùa biển xanh','Bạch tuộc vui vẻ','Cá hề','Cá voi','Sứa biển','Bạn cua'];
const outlines=[art,'/assets/generated/craft/octopus_coloring_lineart_v2.png','/assets/generated/craft/clownfish_coloring_lineart.png',art,art,art];
const resources=names.map((title,i)=>({id:`picture-${i}`,title,kind:'coloring',description:'Tranh tô màu đại dương',coverUrl:outlines[i],mediaUrl:outlines[i],mediaMimeType:'image/png',topicSlugs:[],variants:[],content:{drawingTemplateKey:`template:drawing-proof-${i}`}}));

test.beforeEach(async({page})=>{
 await page.route('**/api/v1/auth/session',r=>r.fulfill({json:{account:{id:'c03-fixture',role:'student',displayName:'Bé An'}}}));
 await page.route('**/api/v1/resource-groups?*',r=>r.fulfill({json:{items:groups,nextCursor:null,total:3}}));
 await page.route('**/api/v1/resource-groups/*',r=>r.fulfill({json:groups.find(g=>r.request().url().endsWith(g.id))||groups[0]}));
 await page.route('**/api/v1/resources?*',r=>r.fulfill({json:{items:resources,nextCursor:new URL(r.request().url()).searchParams.has('cursor')?null:'next-page',total:24}}));
 await page.route('**/api/v1/resources/picture-*',r=>r.fulfill({json:resources.find(item=>r.request().url().endsWith(item.id))||resources[0]}));
 const templateIds=await Promise.all(resources.map(r=>resolveTemplateReference(r.content.drawingTemplateKey)));
 await page.route('**/api/v1/creative-templates/*',r=>{const i=Math.max(0,templateIds.findIndex(id=>r.request().url().endsWith(id)));return r.fulfill({json:{id:templateIds[i],kind:'drawing',title:names[i],payload:{outlineUrl:outlines[i]}}});});
 fs.mkdirSync('artifacts/c03-repair',{recursive:true});
});

for(const width of [1920,1440,768,390,320]){
 test(`C03 ${width}: complete backdrop, button geometry and creative return`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:1000});
  await page.goto('/creative/coloring?group=group-0');
  await expect(page.getByRole('button',{name:'Tô tranh: Rùa biển xanh',exact:true})).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  const controls=page.locator('.coloring-capabilities button');
  await expect(controls).toHaveCount(2);
  const geometry=await controls.evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect(),s=getComputedStyle(n);return {width:b.width,height:b.height,radius:s.borderRadius,color:s.color,bg:s.backgroundImage};}));
  for(const b of geometry){expect(b.height).toBeGreaterThanOrEqual(44);expect(b.radius).toBe('999px');expect(b.width).toBeGreaterThan(b.height*2);}
  expect(geometry[0].color).toBe('rgb(255, 255, 255)');expect(geometry[0].bg).toContain('linear-gradient');
  expect(await page.locator('.learner-creative-backdrop').evaluate(n=>getComputedStyle(n).backgroundImage)).toContain(width>800?'c03-reef-complete.webp':'c03-reef-mobile.webp');
  const broken=await page.locator('img').evaluateAll(nodes=>nodes.filter(n=>!n.complete||n.naturalWidth===0).map(n=>n.src));expect(broken).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('.resource-group-heading')).toHaveCount(0);
  expect(await page.locator('.resource-section-heading h2').evaluate(n=>parseFloat(getComputedStyle(n).fontSize))).toBeGreaterThanOrEqual(30);
  await page.screenshot({path:`artifacts/c03-repair/${width}.png`,fullPage:true});
  const print=page.getByRole('button',{name:'Có bản in',exact:true});await print.click();
  await expect(page).toHaveURL(/\/creative\/coloring\?.*capability=print/);await expect(print).toHaveAttribute('aria-pressed','true');
  await print.click();await expect(print).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button',{name:'Mở bản in: Rùa biển xanh'}).click();
  await expect(page).toHaveURL(/\/creative\/coloring\/picture-0/);
  await page.getByRole('button',{name:'Tranh tô màu',exact:true}).click();
  await expect(page).toHaveURL(/\/creative\/coloring\?/);
  await page.getByRole('button',{name:'Tô tranh: Rùa biển xanh',exact:true}).click();
  await expect(page).toHaveURL(/\/creative\/drawing\?.*fromCreative=1/);
  await expect(page.getByRole('button',{name:'Chọn tranh',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Chọn tranh',exact:true}).click();
  await expect(page).toHaveURL(/\/creative\/coloring\?/);
  await expect(page.getByRole('button',{name:'Tô tranh: Rùa biển xanh',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
 });
}
