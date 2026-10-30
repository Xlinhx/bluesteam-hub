import {afterAll,beforeAll,describe,it,expect} from 'vitest';
import {createDatabasePool,assertTestDatabaseUrl} from '../src/database/pool';
import {runMigrations} from '../src/database/migrate';
import {createServerApp} from '../src/bootstrap';
import {AuthService} from '../src/auth/auth.service';
const url=process.env.TEST_DATABASE_URL||'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_test';
describe('creative scan-only durable delivery',()=>{
 const pool=createDatabasePool(url);let api='',owner='',other='',close:(()=>Promise<void>)|undefined;
 const request=async(path:string,body?:unknown,cookie=owner,token='')=>fetch(api+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',cookie,'x-participant-token':token},body:body?JSON.stringify(body):undefined});
 beforeAll(async()=>{assertTestDatabaseUrl(url);await runMigrations(pool);const app=await createServerApp({databaseUrl:url,port:0});api=app.url+'/api/v1';close=app.close;for(const name of ['scan-owner','scan-other'])await app.app.get(AuthService).upsertTeacherAccount({email:name+'@test.local',password:'Testing123!',displayName:name});const login=async(name:string)=>{const r=await request('/auth/login',{email:name+'@test.local',password:'Testing123!'},'');return r.headers.get('set-cookie')!.split(';')[0];};owner=await login('scan-owner');other=await login('scan-other');});
 afterAll(async()=>{await close?.();await pool.end();});
 it('acks one durable record for concurrent retry and protects private data across roles',async()=>{
  const create=await request('/teacher/creative-sessions',{title:'Một biển chung',kind:'scan'});expect(create.status).toBe(201);const session=await create.json();
  expect((await request('/teacher/creative-sessions/'+session.id,undefined,other)).status).toBe(404);
  const join=await request('/creative-sessions/join',{code:session.code},'');expect(join.status).toBe(201);const {token}=await join.json();
  const payload={clientSubmissionId:'test-'+crypto.randomUUID(),editVersion:1,alias:'Bé A',kind:'scan',preview:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aO1cAAAAASUVORK5CYII=',document:{schemaVersion:1,originalDataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aO1cAAAAASUVORK5CYII=',cutoutDataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aO1cAAAAASUVORK5CYII=',environmentId:'reef',motion:'swim',crop:{x:0,y:0,width:100,height:100}}};
  const results=await Promise.all([request('/creative-sessions/submissions',payload,'',token),request('/creative-sessions/submissions',payload,'',token)]);for(const r of results)expect(r.status).toBe(201);const a=await results[0].json(),b=await results[1].json();expect(a.id).toBe(b.id);expect((await pool.query('SELECT count(*)::int n FROM creative_submissions WHERE session_id=$1',[session.id])).rows[0].n).toBe(1);
  expect((await request('/teacher/creative-sessions/'+session.id,undefined,'',token)).status).toBe(401);
  const privateState=await (await request('/teacher/creative-sessions/'+session.id)).json();expect(privateState.counts.total).toBe(1);
  await request('/teacher/creative-sessions/'+session.id+'/state',{state:'paused'});expect((await request('/creative-sessions/submissions',{...payload,clientSubmissionId:'second'},'',token)).status).toBe(409);
  await request('/teacher/creative-sessions/'+session.id+'/state',{state:'ended'});expect((await request('/creative-sessions/join',{code:session.code},'')).status).toBe(410);
 });
});
