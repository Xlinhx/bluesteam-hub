// Real API/database flow; the final callback tests isolate only runtime ACK handling.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.env.INTERACTIVE_UI_URL || 'http://127.0.0.1:3010';
const skipComponentFixtures = process.env.INTERACTIVE_SKIP_COMPONENT_FIXTURES === '1' || new URL(base).port === '3010';
const browser = await chromium.launch({ channel:'chrome', headless:true });
const context = await browser.newContext({viewport:{width:1440,height:900}});
const page = await context.newPage();
page.setDefaultTimeout(20000);
page.setDefaultNavigationTimeout(60000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
fs.mkdirSync('screenshots/interactive-verification',{recursive:true});
const shot = async name => {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => { image.loading='eager'; return image.decode().catch(() => {}); })); });
  await page.screenshot({path:`screenshots/interactive-verification/${name}.png`,fullPage:true});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),false,`${name}: horizontal overflow`);
  assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src)),[],`${name}: broken images`);
};
let createdId, createdScenarioId;
try {
  await page.goto(`${base}/interactive?kind=game`,{waitUntil:"domcontentloaded"});
  await page.getByRole('heading',{name:'Ngôi nhà đại dương',exact:true}).waitFor();
  for (const name of ['Sinh vật','Môi trường','Bảo vệ biển']) assert.equal(await page.getByRole('button',{name,exact:true}).count(),0);
  await shot('04-learner-desktop');
  await page.getByRole('button',{name:'Tất cả hoạt động',exact:true}).click();
  const catalog = await (await page.request.get(`${base}/api/v1/activities?kind=game&limit=100`)).json();
  assert.equal(await page.locator('.ocean-activity-card').count(),catalog.total);
  await page.goto(`${base}/interactive?kind=game&view=all&topics=conservation`,{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Mở Về đúng nhà',exact:true}).last().waitFor();
  assert.equal(await page.locator('.ocean-activity-card').count(),catalog.total,'legacy learner topics must not apply an invisible filter');
  await page.getByRole('button',{name:'Mở Về đúng nhà',exact:true}).last().click();
  await page.getByTestId('sorting-game-runtime').waitFor();
  await shot('P09-recognition');
  await page.getByRole('button',{name:'Bắt đầu tìm nhà',exact:true}).click();
  assert.equal(await page.locator('.sorting-ocean__object').count(),6);
  await shot('P09a-habitat');
  await page.getByTestId('sorting-item-obj-clownfish').click();
  await page.getByTestId('sorting-zone-zone-rock').click();
  await page.getByTestId('sorting-feedback').filter({hasText:'thích một nơi khác'}).waitFor();
  assert.equal(await page.locator('.sorting-ocean__residents img').count(),0);
  const activityId = new URL(page.url()).pathname.split('/').at(-1);
  const activity = await (await page.request.get(`${base}/api/v1/activities/${activityId}`)).json();
  for (const object of activity.config.objects) {
    await page.getByTestId(`sorting-item-${object.id}`).click();
    await page.getByTestId(`sorting-zone-${object.acceptedTargetIds[0]}`).click();
  }
  await page.getByTestId('sorting-complete-banner').waitFor();
  await shot('P09b-feedback');
  await page.getByRole('button',{name:'1 Quan sát',exact:true}).click();
  await page.getByRole('button',{name:'2 Thử đặt',exact:true}).click();
  await page.getByTestId('sorting-complete-banner').waitFor();
  await page.goto(`${base}/interactive/habitat-placement?step=feedback`,{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Bắt đầu tìm nhà',exact:true}).waitFor();
  assert.equal(await page.getByTestId('sorting-complete-banner').count(),0,'legacy feedback URL cannot invent completion');
  await page.setViewportSize({width:390,height:844});
  await page.goto(`${base}/interactive?kind=game`,{waitUntil:"domcontentloaded"});
  await page.getByRole('heading',{name:'Ngôi nhà đại dương',exact:true}).waitFor();
  await shot('04-learner-mobile');
  await page.setViewportSize({width:1440,height:900});
  for (const kind of ['model3d','simulation','scenario']) {
    await page.goto(`${base}/interactive?kind=${kind}`,{waitUntil:'domcontentloaded'});
    await page.locator('.ocean-activity-card').first().waitFor();
    await shot(`04-learner-${kind}`);
  }
  const login = await page.request.post(`${base}/api/v1/auth/login`,{data:{email:'linh.nguyen@mamnon.edu.vn',password:process.env.SEED_TEACHER_PASSWORD || 'daiduong2026'}});
  assert.equal(login.status(),200,'seed teacher login');
  await page.goto(`${base}/teacher/interactive?kind=game`,{waitUntil:"domcontentloaded"});
  await page.getByRole('heading',{name:'Nhóm hoạt động',exact:true}).waitFor();
  await page.locator('tbody').getByText('Về đúng nhà',{exact:true}).first().waitFor();
  const topicFilters = page.locator('.teacher-topic-filters');
  assert.equal(await topicFilters.getAttribute('open'),null);
  await topicFilters.locator('summary').click();
  await topicFilters.getByRole('button',{name:'Bảo vệ biển',exact:true}).click();
  await page.waitForURL(/topics=conservation/);
  await page.locator('tbody').getByText('Nhặt rác biển',{exact:true}).waitFor();
  assert.equal(await page.locator('tbody').getByText('Về đúng nhà',{exact:true}).count(),0);
  await topicFilters.getByRole('button',{name:'Tất cả',exact:true}).click();
  await page.locator('tbody').getByText('Về đúng nhà',{exact:true}).first().waitFor();
  await shot('09-teacher-catalog');
  for (const kind of ['model3d','simulation','scenario']) {
    await page.goto(`${base}/teacher/interactive?kind=${kind}`,{waitUntil:'domcontentloaded'});
    await page.locator('tbody tr').first().waitFor();
    await shot(`09-teacher-${kind}`);
  }
  const scenarios = await (await page.request.get(`${base}/api/v1/activities?kind=scenario&limit=20`)).json();
  const sourceScenario = scenarios.items.find(item => item.isSeed);
  assert.ok(sourceScenario,'a published scenario seed is available');
  const scenarioResponse = await page.request.post(`${base}/api/v1/teacher/activities`,{data:{kind:'scenario',templateKey:'scenario',title:'Kiểm chứng nhánh tình huống',config:sourceScenario.config,visibility:'draft'}});
  assert.equal(scenarioResponse.status(),201);
  createdScenarioId=(await scenarioResponse.json()).id;
  await page.goto(`${base}/teacher/interactive/scenarios/${createdScenarioId}`,{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'Kiểm chứng nhánh tình huống',exact:true}).waitFor();
  await page.getByRole('textbox',{name:'Phản hồi lựa chọn 1',exact:true}).fill('Bé đã chọn cách giữ biển sạch.');
  await page.getByTestId('scenario-editor-save-draft').click();
  await page.getByText('Đã cập nhật bản nháp tình huống.',{exact:true}).waitFor();
  await shot('11-scenario-editor');
  await page.getByTestId('scenario-editor-publish').click();
  await page.getByText('Đã hiển thị tình huống cho bé trong danh mục Tương tác!',{exact:true}).waitFor();
  const publishedScenario=await (await page.request.get(`${base}/api/v1/activities/${createdScenarioId}`)).json();
  assert.equal(publishedScenario.config.scenes.length,sourceScenario.config.scenes.length);
  assert.equal(publishedScenario.config.scenes[0].choices[0].feedbackText,'Bé đã chọn cách giữ biển sạch.');
  const response = await page.request.post(`${base}/api/v1/teacher/activities`,{data:{kind:'game',templateKey:'sorting',title:'Kiểm chứng tương tác',config:activity.config,visibility:'draft'}});
  assert.equal(response.status(),201);
  createdId = (await response.json()).id;
  await page.goto(`${base}/teacher/interactive/games/${createdId}`,{waitUntil:"domcontentloaded"});
  await page.getByTestId('game-editor-save-draft').waitFor();
  await page.getByRole('button',{name:'Chỉnh vùng đích',exact:true}).waitFor();
  await shot('10-editor-scene');
  await page.getByRole('button',{name:'Chơi thử',exact:true}).click();
  await page.getByTestId('sorting-game-runtime').waitFor();
  await shot('10-editor-play');
  await page.getByTestId('game-editor-save-draft').click();
  await page.getByText('Đã cập nhật bản nháp trò chơi.',{exact:true}).waitFor();
  await page.reload();
  await page.getByRole('button',{name:'Chỉnh vùng đích',exact:true}).waitFor();
  const saved = await (await page.request.get(`${base}/api/v1/teacher/activities/${createdId}`)).json();
  assert.equal(saved.config.objects.length,6);
  assert.deepEqual(saved.config.targets.map(target => target.bounds),activity.config.targets.map(target => target.bounds));
  await page.getByRole('button',{name:'Chỉnh vật thể Sao biển',exact:true}).click();
  await page.locator('.sorting-fields input[type="range"]').fill('1.4');
  await shot('10a-object-editor');
  await page.getByRole('button',{name:'Di chuyển vùng Rạn san hô',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  await shot('10b-target-editor');
  await page.getByRole('button',{name:'Đổi ảnh đại diện vùng',exact:true}).click();
  await page.getByRole('dialog',{name:'Chọn hình ảnh',exact:true}).waitFor();
  await page.locator('.media-picker__grid button').first().waitFor();
  const availableMedia = page.locator('.media-picker__grid button').filter({has:page.locator('img[src^="/assets/"]')}).first();
  await availableMedia.click();
  assert.equal(await availableMedia.getAttribute('aria-pressed'),'true');
  assert.equal(await page.getByRole('dialog',{name:'Chọn hình ảnh',exact:true}).evaluate(dialog => { const box=dialog.getBoundingClientRect(); return dialog.contains(document.elementFromPoint(box.x+box.width/2,box.y+box.height/2)); }),true,'preview must not cover the media dialog');
  await shot('10c-media-picker');
  await page.getByRole('button',{name:'Dùng tệp này',exact:true}).click();
  await page.getByTestId('game-editor-publish').click();
  await page.getByText('Đã xuất bản trò chơi ra danh mục Tương tác của bé!',{exact:true}).waitFor();
  const published = await (await page.request.get(`${base}/api/v1/activities/${createdId}`)).json();
  assert.equal(published.config.objects.find(item => item.id === 'obj-starfish').scale,1.4);
  assert.ok(Math.abs(published.config.targets[0].bounds.x-activity.config.targets[0].bounds.x-.01)<1e-6);
  await page.getByTestId('game-editor-title-input').fill('Bản sửa chưa xuất bản');
  await page.getByTestId('game-editor-save-draft').click();
  await page.getByText('Đã cập nhật bản nháp trò chơi.',{exact:true}).waitFor();
  await page.reload();
  await page.getByRole('button',{name:'Chỉnh vùng đích',exact:true}).waitFor();
  assert.equal(await page.getByTestId('game-editor-title-input').inputValue(),'Bản sửa chưa xuất bản');
  assert.equal((await (await page.request.get(`${base}/api/v1/activities/${createdId}`)).json()).title,'Kiểm chứng tương tác');
  // Return this isolated fixture to draft before removing it during cleanup.
  assert.equal((await page.request.patch(`${base}/api/v1/teacher/activities/${createdId}`,{data:{visibility:'draft'}})).status(),200);
  // Mount actual components with a controlled ACK callback to test pending/rejected/accepted states.
  if (!skipComponentFixtures) {
  await page.goto(`${base}/interactive?kind=game`,{waitUntil:"domcontentloaded"});
  for (const template of ['sorting','matching','choice','scenario']) {
    await page.evaluate(async template => {
      const ReactModule = await import('/node_modules/.vite/deps/react.js'); const React = ReactModule.default || ReactModule;
      const ReactDOM = await import('/node_modules/.vite/deps/react-dom_client.js'); const createRoot = ReactDOM.createRoot || ReactDOM.default.createRoot;
      const {ActivityRuntime} = await import('/src/shared/activities/ActivityRuntime.tsx');
      const config = template === 'sorting' ? {targets:[{id:'reef',label:'Rạn san hô'}],objects:[{id:'fish',label:'Cá',imageUrl:'/assets/generated/creatures/clownfish_isolated.png',acceptedTargetIds:['reef']}]} : template === 'matching' ? {pairs:[{id:'fish',left:{id:'left',label:'Cá',imageUrl:'/assets/generated/creatures/clownfish_isolated.png'},right:{id:'right',label:'Rạn',imageUrl:'/assets/generated/creatures/clownfish_isolated.png'}}]} : template === 'scenario' ? {startSceneId:'start',scenes:[{id:'start',title:'Bờ biển',choices:[{id:'help',label:'Báo cô',nextSceneId:'end',feedbackText:'Đã báo cô',isCorrect:true}]},{id:'end',title:'An toàn',isEnd:true,choices:[]},{id:'unused',title:'Nhánh khác',isEnd:true,choices:[]}]} : {questions:[{id:'fish',promptText:'Chọn cá',options:[{id:'yes',label:'Cá',imageUrl:'/assets/generated/creatures/clownfish_isolated.png'},{id:'no',label:'Khác',imageUrl:'/assets/generated/r2-cutouts/starfish_cutout.png'}],correctOptionId:'yes'}]};
      window.__completions = [];
      window.__attempts = [];
      const host = document.createElement('div');host.id='ack-test';document.body.replaceChildren(host);
      createRoot(host).render(React.createElement(ActivityRuntime,{context:'room',activityId:`proof-${template}`,title:'Kiểm chứng ACK',templateKey:template,config,onAnswer:submission => {window.__attempts.push(submission);return new Promise(resolve => {window.__resolveAck=resolve;});},onComplete:summary => window.__completions.push(summary)}));
    },template);
    const answer = template === 'sorting' ? page.getByTestId('sorting-zone-reef') : template === 'matching' ? page.locator('[data-testid="matching-game-runtime"] button').filter({hasText:'Rạn'}) : template === 'scenario' ? page.getByTestId('scenario-choice-help') : page.locator('[data-testid="choice-game-runtime"] button').filter({hasText:/^Cá$/});
    await answer.click();
    assert.equal(await page.evaluate(() => window.__completions.length),0,`${template}: pending must not complete`);
    await page.evaluate(() => window.__resolveAck({ok:false,errorMessage:'Mạng chưa sẵn sàng'}));
    await page.getByText('Mạng chưa sẵn sàng',{exact:true}).waitFor();
    assert.equal(await page.evaluate(() => window.__completions.length),0);
    await answer.click();
    await page.evaluate(() => window.__resolveAck({ok:true,result:'correct',pointsAwarded:1}));
    await page.waitForFunction(() => window.__completions.length === 1);
    assert.equal(await page.evaluate(() => window.__completions[0].earnedPoints),1);
    if (template === 'scenario') {
      assert.equal(await page.evaluate(() => window.__completions[0].completedItems),2,'unvisited branches must not be counted as completed');
      await answer.click();
      assert.equal(await page.evaluate(() => window.__completions.length),1,'completion is emitted once');
    }
    const attempts = await page.evaluate(() => window.__attempts);
    assert.equal(attempts[0].clientEventId,attempts[1].clientEventId,'retry must reuse the unacknowledged attempt ID');
  }
  assert.deepEqual(errors,[]);
  }
  // A loaded iframe is not proof that its 3D engine is usable.
  await page.route('**/sketchfab-viewer-1.12.1.js',route => route.abort());
  await page.route('https://sketchfab.com/models/**/embed**',route => route.fulfill({contentType:'text/html',body:'<p>Frame loaded without a viewer engine</p>'}));
  const models = await (await page.request.get(`${base}/api/v1/models?limit=1`)).json();
  await page.goto(`${base}/interactive/models/${models.items[0].id}`,{waitUntil:'domcontentloaded'});
  await page.getByText('Chưa sẵn sàng hiển thị',{exact:true}).waitFor({timeout:15000});
  assert.equal(await page.getByText('Đã tải mô hình 3D sẵn sàng',{exact:true}).count(),0);
  await shot('P07-model-unavailable');
  if (!skipComponentFixtures) await page.evaluate(async () => {
    const R=await import('/node_modules/.vite/deps/react.js'); const D=await import('/node_modules/.vite/deps/react-dom_client.js'); const V=await import('/src/shared/ui/media/SketchfabViewer.tsx');
    window.__viewerStates=[];
    const host=document.createElement('div');document.body.replaceChildren(host);
    (D.createRoot||D.default.createRoot)(host).render((R.default||R).createElement(V.SketchfabViewer,{title:'Kiểm chứng iframe',modelUid:'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',onStatusChange:status=>window.__viewerStates.push(status)}));
  });
  if (!skipComponentFixtures) {
    await page.locator('iframe').waitFor({state:'attached'});
    await page.locator('iframe').dispatchEvent('load');
    assert.equal(await page.evaluate(() => window.__viewerStates.includes('ready')),false,'iframe load cannot certify an operational engine');
  }
  await page.getByRole('button',{name:'Thử tải lại',exact:true}).click();
  await page.getByText('Chưa sẵn sàng hiển thị',{exact:true}).waitFor();
  assert.deepEqual(errors,[]);
  console.log(`PASS: four real catalogs, seeded gameplay, three persistent stages, legacy link, desktop/mobile, teacher draft/publish isolation, viewer error/retry${!skipComponentFixtures ? '; sorting/matching/choice/scenario ACK contracts' : ''}.`);
} finally {
  for (const id of [createdId,createdScenarioId].filter(Boolean)) { await page.request.patch(`${base}/api/v1/teacher/activities/${id}`,{data:{visibility:'draft'}}); const result = await page.request.delete(`${base}/api/v1/teacher/activities/${id}`); assert.equal(result.status(),200,'remove only the fixture created by this check'); }
  await browser.close();
}
