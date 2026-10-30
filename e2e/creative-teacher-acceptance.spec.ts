import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
test('review stays open after release from pending filter, reloads, and returns to the correct queue',async({page})=>{
 await page.request.post('/api/v1/auth/login',{data:{email:'creative-e2e@test.local',password:'Testing123!'}});
 const sea=await(await page.request.post('/api/v1/teacher/creative-sessions',{data:{title:'Biển nghiệm thu',kind:'scan',reviewRequired:true}})).json();
 const join=await(await page.request.post('/api/v1/creative-sessions/join',{data:{code:sea.code}})).json();
 const image='data:image/png;base64,'+readFileSync('public/assets/generated/creative/crayon-fish-v2.png').toString('base64');
 const sent=await page.request.post('/api/v1/creative-sessions/submissions',{headers:{'x-participant-token':join.token},data:{clientSubmissionId:'acceptance-'+Date.now(),editVersion:1,alias:'Hà',kind:'scan',preview:image,document:{schemaVersion:1,originalDataUrl:image,cutoutDataUrl:image,motion:'swim',environmentId:'reef',crop:{x:0,y:0,width:100,height:100}}}});expect(sent.ok()).toBe(true);
 await page.goto(`/teacher/creative?tab=sea&session=${sea.id}&seaStatus=ready`);await page.locator('.creative-submission-tile').first().click();await page.getByRole('button',{name:'Thả vào biển',exact:true}).click();await expect(page.getByRole('textbox',{name:'Ghi chú riêng'})).toBeVisible();await expect(page.getByRole('button',{name:'Ẩn khỏi biển',exact:true})).toBeVisible();await page.reload();await expect(page.getByRole('button',{name:'Ẩn khỏi biển',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Ẩn khỏi biển',exact:true}).click();await expect(page.getByRole('button',{name:'Hiện lại',exact:true})).toBeVisible();await page.getByRole('button',{name:'Cần gửi lại',exact:true}).click();await page.getByRole('button',{name:'Thả vào biển',exact:true}).click();await expect(page.getByRole('button',{name:'Ẩn khỏi biển',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Biển chung / Tranh của Hà'}).click();await expect(page.getByText('Không có tranh khớp bộ lọc.',{exact:false})).toBeVisible();await expect(page.locator('.scanned-creature-stage figure')).toHaveCount(1);
});
