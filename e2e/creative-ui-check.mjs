// Browser UI proof with explicit API fixtures. This does not verify the database.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { withCreativeDesignSeed } from '../server/dist/database/seeds/creative-design.js';
import { deterministicUuid as uuid } from '../server/dist/database/seeds/import-seed.js';
const data=withCreativeDesignSeed(JSON.parse(fs.readFileSync('server/seed-data/data.json','utf8')),uuid,'demo');
const teacherId=uuid(data.demoFixtures.teacherUser.sourceKey);
const templates=data.reusableContent.creativeTemplates.map(t=>({...t,id:uuid(t.sourceKey),ownerId:t.demoOwned?teacherId:null,canEdit:!!t.demoOwned,isSeed:!t.demoOwned,mediaId:null,version:1,publishedVersion:1,publishedVisibility:t.visibility,hasDraft:false,topicSlugs:['species']}));
const materials=data.reusableContent.creativeMaterials.map(t=>({...t,id:uuid(t.sourceKey),ownerId:t.demoOwned?teacherId:null,canEdit:!!t.demoOwned,isSeed:!t.demoOwned,mediaId:null,version:1,publishedVisibility:t.visibility,usageCount:3,usedBy:[]}));
const room=data.demoFixtures.rooms[0];
const artworks=room.artworks.map(a=>({...a,id:uuid(a.sourceKey),roomId:uuid(room.sourceKey),roomName:room.name,previewUrl:a.previewUrl,teacherNote:a.note || '',participantAlias:room.participants.find(p=>p.sourceKey===a.participantSourceKey).alias,participantAvatarKey:'turtle',createdAt:room.createdAt,scenePayload:a.scenePayload || null}));
const base=process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3010';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
fs.mkdirSync('screenshots/creative-verification',{recursive:true});
let failUpload=false;
await page.route('**/api/v1/**',async route=>{
  const request=route.request(),url=new URL(request.url()),endpoint=url.pathname.replace('/api/v1/','');
  const reply=(json,status=200)=>route.fulfill({status,json});
  if(endpoint==='auth/me')return reply({teacher:{id:teacherId,email:data.demoFixtures.teacherUser.email,displayName:'Cô Linh'}});
  if(endpoint==='topics')return reply({items:[{id:uuid('topic:species'),slug:'species',title:'Sinh vật biển'}]});
  if(endpoint==='teacher/rooms')return reply({items:[{id:uuid(room.sourceKey),name:room.name}]});
  if(endpoint==='teacher/artworks')return reply({items:artworks,total:artworks.length});
  if(/^teacher\/artworks\/[^/]+$/.test(endpoint))return reply({item:artworks.find(a=>endpoint.endsWith(a.id))});
  if(endpoint.endsWith('/note')){const a=artworks.find(a=>endpoint.includes(a.id));a.teacherNote=request.postDataJSON().note;return reply({item:a});}
  if(endpoint==='teacher/media'){if(failUpload){failUpload=false;return reply({message:'Mất kết nối kiểm thử'},503);}return reply({id:crypto.randomUUID(),url:'/assets/generated/craft/starfish_coloring_lineart.png',kind:'image',status:'ready',mimeType:'image/png',byteSize:1024});}
  const templateMatch=/^(?:teacher\/)?creative-templates(?:\/([^/]+))?$/.exec(endpoint);
  if(templateMatch){if(templateMatch[1]){const t=templates.find(t=>t.id===templateMatch[1]);if(request.method()==='PATCH'){const update=request.postDataJSON();Object.assign(t,update,{version:t.version+1,hasDraft:update.visibility==='draft'});}return reply(t || {message:'Không có mẫu'},t?200:404);}let values=templates.filter(t=>endpoint.startsWith('teacher/')||t.visibility==='published');if(url.searchParams.get('source')==='owned')values=values.filter(t=>t.canEdit);const kind=url.searchParams.get('kind'),q=url.searchParams.get('q');if(kind)values=values.filter(t=>t.kind===kind);if(q)values=values.filter(t=>t.title.toLowerCase().includes(q.toLowerCase()));const start=Number(url.searchParams.get('cursor')||0),limit=Number(url.searchParams.get('limit')||6);return reply({items:values.slice(start,start+limit),total:values.length,nextCursor:start+limit<values.length?String(start+limit):null});}
  if(endpoint==='teacher/creative-materials'){let values=materials;const kind=url.searchParams.get('kind');if(kind)values=values.filter(m=>m.kind===kind);const start=Number(url.searchParams.get('cursor')||0),limit=Number(url.searchParams.get('limit')||6);return reply({items:values.slice(start,start+limit),total:values.length,nextCursor:start+limit<values.length?String(start+limit):null});}
  return reply({items:[],total:0,nextCursor:null});
});
const shot=async(name)=>{await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).map(img=>img.decode().catch(()=>{})));});await page.screenshot({path:`screenshots/creative-verification/${name}.png`,fullPage:true});};
try{
  await page.goto(`${base}/teacher/creative?tab=templates&kind=drawing&source=owned`);
  await page.getByRole('button',{name:'Trang sau'}).waitFor();await page.locator('.creative-template').first().waitFor();
  assert.equal(await page.locator('.creative-template').count(),6);await shot('13a-templates');await page.getByRole('button',{name:'Trang sau',exact:true}).click();await page.getByText('Sao biển trên cát',{exact:true}).waitFor();assert.equal(await page.locator('.creative-template').count(),1);
  const turtle=templates.find(t=>t.demoOwned&&t.title==='Rùa biển xanh');
  await page.goto(`${base}/teacher/creative/editor?id=${turtle.id}`);await page.getByRole('textbox',{name:'Tên mẫu',exact:true}).waitFor();
  await shot('13b-drawing-editor');
  await page.getByRole('textbox',{name:'Tên mẫu',exact:true}).fill('Rùa biển xanh · bản nháp');
  await page.getByRole('button',{name:'Lưu nháp',exact:true}).click();await page.getByText('Đã lưu bản nháp.',{exact:true}).waitFor();
  await page.reload();assert.equal(await page.getByRole('textbox',{name:'Tên mẫu',exact:true}).inputValue(),'Rùa biển xanh · bản nháp');
  await page.getByRole('button',{name:/Xem thử/}).first().click();await page.locator('canvas').waitFor();await shot('13g-preview');
  await page.goto(`${base}/teacher/creative?tab=materials`);await page.locator('.creative-table tbody tr').first().waitFor();await shot('13d-materials');
  await page.getByRole('button',{name:'Thêm nhãn dán',exact:true}).click();await page.getByRole('button',{name:'Thay ảnh nhãn dán',exact:true}).click();
  failUpload=true;await page.getByLabel('Chọn file tải lên').setInputFiles('public/assets/generated/craft/starfish_coloring_lineart.png');await page.getByLabel('Thử lại starfish_coloring_lineart.png').waitFor();await page.getByLabel('Thử lại starfish_coloring_lineart.png').click();await page.getByText('Đã tải xong',{exact:true}).waitFor();await shot('13f-media-picker');await page.getByRole('button',{name:'Dùng file này',exact:true}).click();await shot('13e-material-editor');
  page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'Đóng vật liệu',exact:true}).click();
  const habitat=templates.find(t=>t.demoOwned&&t.kind==='habitat');await page.goto(`${base}/teacher/creative/editor?id=${habitat.id}`);await page.locator('canvas').waitFor();await page.waitForTimeout(1200);await shot('13c-habitat-editor');
  const initialX=await page.getByLabel('X',{exact:true}).inputValue();await page.getByLabel('X',{exact:true}).fill('-2.3');assert.equal(await page.getByLabel('X',{exact:true}).inputValue(),'-2.3');
  await page.getByRole('button',{name:'Hoàn tác',exact:true}).click();assert.equal(await page.getByLabel('X',{exact:true}).inputValue(),initialX);
  await page.getByRole('button',{name:'Nhân bản',exact:true}).click();await page.getByText('13 vật thể',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Hoàn tác',exact:true}).click();await page.getByText('12 vật thể',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Chạy thử',exact:true}).click();await page.waitForTimeout(300);if(process.argv.includes('--capture-seed'))await page.locator('.creative-scene canvas').screenshot({path:'public/assets/generated/craft/artwork_habitat_seed.png'});
  await page.getByRole('button',{name:'Bố trí',exact:true}).click();await page.locator('summary').filter({hasText:'Thông tin mẫu'}).click();assert.equal(await page.getByRole('textbox',{name:'Tên mẫu',exact:true}).inputValue(),habitat.title);
  await page.goto(`${base}/teacher/creative?tab=artworks`);await page.locator('.creative-template').first().waitFor();await page.locator('.creative-template button').first().click();await page.getByText('Ghi chú riêng của cô',{exact:true}).waitFor();await page.locator('textarea').fill('Ghi chú kiểm thử riêng');await page.getByRole('button',{name:'Lưu ghi chú',exact:true}).click();await page.getByText('Đã lưu ghi chú của cô.',{exact:true}).waitFor();await shot('13h-artwork-detail');
  await page.setViewportSize({width:390,height:844});await page.goto(`${base}/teacher/creative?tab=templates`);await page.locator('.creative-template').first().waitFor();await shot('mobile-templates');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow on mobile catalog');
  await page.goto(`${base}/teacher/creative/editor?id=${habitat.id}`);await page.locator('canvas').waitFor();await page.waitForTimeout(1000);await shot('mobile-habitat-editor');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow in mobile habitat editor');
  assert.deepEqual(errors,[]);console.log('PASS: explicit-fixture UI: catalog pagination, draft reload, interactive preview, upload failure/retry, 3D render, private note save, mobile overflow. Screenshots are UI-only evidence.');
}finally{await browser.close();}
