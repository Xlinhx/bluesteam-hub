import {beforeAll,afterAll,it,expect} from 'vitest';
import {createDatabasePool,assertTestDatabaseUrl} from '../src/database/pool';
import {runMigrations} from '../src/database/migrate';
import {createServerApp} from '../src/bootstrap';
import {AuthService} from '../src/auth/auth.service';
const url=process.env.TEST_DATABASE_URL||'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_test';const pool=createDatabasePool(url);let api='',cookie='',close:()=>Promise<void>;
const req=(p:string,b?:unknown,t='')=>fetch(api+p,{method:b?'POST':'GET',headers:{'content-type':'application/json',cookie,'x-participant-token':t},body:b?JSON.stringify(b):undefined});
beforeAll(async()=>{assertTestDatabaseUrl(url);await runMigrations(pool);const app=await createServerApp({databaseUrl:url,port:0});api=app.url+'/api/v1';close=app.close;await app.app.get(AuthService).upsertTeacherAccount({email:'sea-source@test.local',password:'Testing123!',displayName:'Sea'});cookie=(await req('/auth/login',{email:'sea-source@test.local',password:'Testing123!'})).headers.get('set-cookie')!.split(';')[0];});afterAll(async()=>{await close?.();await pool.end();});
it('keeps latest released revision visible when a new revision waits, filters before paging and handles more than 40 paintings',async()=>{
 const s=await(await req('/teacher/creative-sessions',{title:'Hai nguồn',kind:'scan',reviewRequired:true,environmentId:'lagoon'})).json();const {token}=await(await req('/creative-sessions/join',{code:s.code})).json();
 const participant=(await pool.query('SELECT participant_id FROM creative_scan_tokens WHERE session_id=$1 LIMIT 1',[s.id])).rows[0].participant_id;
 const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aO1cAAAAASUVORK5CYII=';
 for(let i=0;i<45;i++)await pool.query("INSERT INTO creative_submissions(session_id,participant_id,client_submission_id,edit_version,alias,kind,status,preview,document,content_hash) VALUES($1,$2,$3,1,$4,'scan','released',$5,$6,'fixture')",[s.id,participant,'p'+i,'Bé '+i,image,{schemaVersion:1,motion:'swim'}]);
 const doc={schemaVersion:2,origin:{kind:'coloring',artworkId:'a',editVersion:2},originalDataUrl:image,cutoutDataUrl:image,environmentId:'reef',motion:'float',crop:{x:0,y:0,width:100,height:100}};
 const wait=await req('/creative-sessions/submissions',{clientSubmissionId:'p0',editVersion:2,alias:'Bé 0',kind:'scan',preview:image,document:doc},token);expect(wait.status).toBe(201);
 const d=await(await req(`/teacher/creative-sessions/${s.id}?source=coloring`)).json();expect(d.items).toHaveLength(1);expect(d.filteredTotal).toBe(1);expect(d.counts.total).toBe(46);expect(d.seaTotal).toBe(45);expect(d.seaItems).toHaveLength(40);
 const listed=await(await req('/teacher/creative-sessions?kind=scan')).json();const row=listed.items.find((x:any)=>x.id===s.id);expect(row.counts).toEqual({total:46,released:45,ready:1,needs_retry:0});expect(row.previews.length).toBeLessThanOrEqual(3);
 const invite=await(await req(`/teacher/creative-sessions/${s.id}/invite`,{role:'display'})).json();const display=await(await req('/creative-sessions/display',undefined,invite.token)).json();expect(display.total).toBe(45);expect(display.items).toHaveLength(40);expect(display.items[0].teacher_note).toBeUndefined();expect((await(await req('/creative-sessions/display?offset=40',undefined,invite.token)).json()).items).toHaveLength(5);
 expect((await req('/creative-sessions/display',undefined,token)).status).toBe(403);
 const received=await wait.json();await req(`/teacher/creative-submissions/${received.id}`,{status:'released'});
 const reviewed=await(await req(`/teacher/creative-sessions/${s.id}?status=ready&selected=${received.id}`)).json();
 expect(reviewed.items).toHaveLength(0);expect(reviewed.selectedSubmission.id).toBe(received.id);expect(reviewed.selectedSubmission.status).toBe('released');
 const other=await(await req('/teacher/creative-sessions',{title:'Biển khác',kind:'scan'})).json();
 expect((await(await req(`/teacher/creative-sessions/${other.id}?selected=${received.id}`)).json()).selectedSubmission).toBeNull();

});
