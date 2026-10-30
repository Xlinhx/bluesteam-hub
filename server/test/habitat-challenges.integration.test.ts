import {afterAll,beforeAll,describe,it,expect} from 'vitest';
import {createDatabasePool,assertTestDatabaseUrl} from '../src/database/pool';
import {runMigrations} from '../src/database/migrate';
import {createServerApp} from '../src/bootstrap';
import {AuthService} from '../src/auth/auth.service';
const url=process.env.TEST_DATABASE_URL||'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_test';
describe('habitat challenges durable lifecycle',()=>{
 const pool=createDatabasePool(url);let api='',cookie='',other='',close:()=>Promise<void>;
 const req=(path:string,body?:unknown,auth=cookie,token='')=>fetch(api+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',cookie:auth,'x-participant-token':token},body:body?JSON.stringify(body):undefined});
 beforeAll(async()=>{assertTestDatabaseUrl(url);await runMigrations(pool);await runMigrations(pool);const app=await createServerApp({databaseUrl:url,port:0});api=app.url+'/api/v1';close=app.close;for(const name of ['challenge-owner','challenge-other'])await app.app.get(AuthService).upsertTeacherAccount({email:name+'@test.local',password:'Testing123!',displayName:name});const login=async(name:string)=>(await req('/auth/login',{email:name+'@test.local',password:'Testing123!'},'')).headers.get('set-cookie')!.split(';')[0];cookie=await login('challenge-owner');other=await login('challenge-other');});
 afterAll(async()=>{await close?.();await pool.end();});
 it('opens once, protects context, groups projects independently of aliases and preserves revisions',async()=>{
  const input={title:'Hai cách',kind:'habitat',clientRequestId:crypto.randomUUID(),challenge:{title:'Hai cách',prompt:'Thử hai cách bố trí.',starterRef:{kind:'empty'}}};
  const responses=await Promise.all([req('/teacher/creative-sessions',input),req('/teacher/creative-sessions',input)]);
  expect(responses.map(r=>r.status)).toEqual([201,201]);const s=await responses[0].json();expect((await responses[1].json()).id).toBe(s.id);expect(s.challenge.starter.project.scenes[0].items).toEqual([]);
  expect((await req('/teacher/creative-sessions',{...input,title:'Khác'})).status).toBe(409);
  const joined=await(await req('/creative-sessions/join',{code:s.code},'')).json();expect(joined.challenge.prompt).toBe('Thử hai cách bố trí.');
  const context=await(await req('/creative-sessions/context',undefined,'',joined.token)).json();expect(context.teacherDisplayName).toBe('challenge-owner');expect(context.owner_id).toBeUndefined();
  const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aO1cAAAAASUVORK5CYII=';
  for(let i=0;i<20;i++){const payload={clientSubmissionId:'project-'+i%12,editVersion:i<12?1:2,alias:'Tên trùng',kind:'habitat',preview:image,document:{version:1,activeSceneId:'one',scenes:[{id:'one',title:'Cảnh 1',items:[]}]}};expect((await req('/creative-sessions/submissions',payload,'',joined.token)).status).toBe(201);}
  const projects=await(await req(`/teacher/creative-sessions/${s.id}/projects`)).json();expect(projects.totalProjects).toBe(12);expect(projects.totalSubmissions).toBe(20);expect(projects.items).toHaveLength(6);
  const next=await(await req(`/teacher/creative-sessions/${s.id}/projects?offset=6`)).json();expect(new Set([...projects.items,...next.items].map(p=>p.projectKey)).size).toBe(12);
  const group=[...projects.items,...next.items].find(p=>p.revisionCount===2);const history=await(await req(`/teacher/creative-sessions/${s.id}/projects/${group.projectKey}/revisions`)).json();expect(history.items.map(r=>r.edit_version)).toEqual([2,1]);
  expect((await req(`/teacher/creative-sessions/${s.id}/projects`,undefined,other)).status).toBe(404);
  const invite=await(await req(`/teacher/creative-sessions/${s.id}/invite`,{role:'display'})).json();expect((await req('/creative-sessions/context',undefined,'',invite.token)).status).toBe(403);
  await req(`/teacher/creative-sessions/${s.id}/state`,{state:'paused'});expect((await(await req('/creative-sessions/context',undefined,'',joined.token)).json()).effectiveState).toBe('paused');
  const reuse=await(await req('/teacher/creative-sessions',{title:s.title,kind:'habitat',sourceSessionId:s.id,clientRequestId:crypto.randomUUID()})).json();expect(reuse.code).not.toBe(s.code);expect(reuse.challenge).toEqual(s.challenge);
  await req('/teacher/creative-submissions/'+group.latestSubmission.id,{note:'Ghi chú giữ sau khởi động lại'});
  await close();const restarted=await createServerApp({databaseUrl:url,port:0});api=restarted.url+'/api/v1';close=restarted.close;
  const after=await(await req(`/teacher/creative-sessions/${s.id}/projects`)).json();expect(after.totalProjects).toBe(12);expect(after.totalSubmissions).toBe(20);const versions=await(await req(`/teacher/creative-sessions/${s.id}/projects/${group.projectKey}/revisions`)).json();expect(versions.items[0].teacher_note).toBe('Ghi chú giữ sau khởi động lại');
 });
 it('preserves starter snapshots when the public template changes and rejects hidden/wrong-version sources',async()=>{
  const template=crypto.randomUUID();await pool.query("INSERT INTO creative_templates(id,kind,title,payload,visibility,version) VALUES($1,'habitat','Cát v2','{\"items\":[]}', 'published',2)",[template]);
  const payload={kind:'habitat',title:'Từ mẫu v2',challenge:{title:'Từ mẫu v2',prompt:'Tạo chỗ trú',starterRef:{kind:'template',contentId:template,publishedVersion:2}}};const res=await req('/teacher/creative-sessions',payload);expect(res.status).toBe(201);const s=await res.json();expect(s.challenge.starter.ref.publishedVersion).toBe(2);
  await pool.query("UPDATE creative_templates SET version=3,title='Đổi mẫu',visibility='hidden' WHERE id=$1",[template]);
  expect((await req('/teacher/creative-sessions',payload)).status).toBe(409);const reused=await(await req('/teacher/creative-sessions',{kind:'habitat',title:s.title,sourceSessionId:s.id})).json();expect(reused.challenge).toEqual(s.challenge);
  await pool.query('DELETE FROM creative_templates WHERE id=$1',[template]);
 });
});
