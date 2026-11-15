import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'node:crypto';
import { createDatabasePool, assertTestDatabaseUrl } from '../src/database/pool.js';
import { runMigrations } from '../src/database/migrate.js';
import { DatabaseService } from '../src/database/database.service.js';
import { ActivitiesService } from '../src/content/activities/activities.service.js';
import { ModelsService } from '../src/content/models/models.service.js';
import { readLearnerProfileJourney } from '../src/content/learner/learner-profile-journey.js';
import { InteractiveUsageService } from '../src/interactive-usage/interactive-usage.service.js';
import { InteractiveUsageReportService } from '../src/interactive-usage/interactive-usage-report.service.js';
const url=process.env.INTERACTIVE_USAGE_TEST_DATABASE_URL || 'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_interactive_usage_test';
const pool=createDatabasePool(url), activities=new ActivitiesService(pool), models=new ModelsService(pool);
const usage=new InteractiveUsageService(pool,activities,models), reports=new InteractiveUsageReportService(pool);
let activity:any;
describe('Standalone usage database truth',()=>{
  beforeAll(async()=>{
    assertTestDatabaseUrl(url);
    const admin=createDatabasePool(url.replace(/\/[^/]+$/,'/postgres'));
    try { if(!(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1',[new URL(url).pathname.slice(1)])).rowCount)await admin.query('CREATE DATABASE bluesteam_interactive_usage_test'); } finally{await admin.end();}
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public');
    await runMigrations(pool);
    const teacher=(await pool.query("INSERT INTO teachers(email,password_hash,display_name,status) VALUES('usage@test.local','test-only','Cô thử','active') RETURNING id")).rows[0].id;
    activity=await activities.createTeacherActivity(teacher,{kind:'game',title:'Bài dùng thật',templateKey:'sorting',visibility:'published',config:{instructionText:'Chọn một bạn rồi chọn nơi sống.',targets:[{id:'reef',label:'Rạn'},{id:'sand',label:'Cát'}],objects:[{id:'fish',label:'Cá',imageUrl:'/fish.png',acceptedTargetIds:['reef']},{id:'shell',label:'Sò',imageUrl:'/shell.png',acceptedTargetIds:['sand']}]}});
  });
  afterAll(()=>pool.end());
  it('opens the selected published content detail even before its first usage',async()=>{
    const report=await reports.report({kind:'game',contentId:activity.id});
    expect(report.rows).toHaveLength(1);
    expect(report.rows[0]).toMatchObject({contentId:activity.id,title:activity.title,opens:0,lastOpenedAt:null});
    expect(report.summary.usedActivities.value).toBe(0);
    const detail=await reports.detail(activity.id,{...report.meta.filter,contentType:'activity',version:activity.version});
    expect(detail.opens).toBe(0);expect(detail.sections).toEqual([]);
  });
  it('deduplicates concurrent opens/events and rejects reused keys with changed payload',async()=>{
    const input={contentType:'activity',contentId:activity.id,version:activity.version,openKey:crypto.randomUUID()};
    const [a,b]=await Promise.all([usage.open(input),usage.open(input)]);
    expect(a.runId).toBe(b.runId);expect(a.token).toBe(b.token);
    const event={clientEventId:crypto.randomUUID(),payload:{type:'game_answer',itemId:'fish',answerId:'sand'}};
    const result=await Promise.all([usage.record(a.runId,a.token,event),usage.record(b.runId,b.token,event)]);
    expect(result.filter(x=>x.duplicate)).toHaveLength(1);
    await expect(usage.record(a.runId,'wrong',event)).rejects.toMatchObject({code:'INVALID_USAGE_TOKEN'});
    await expect(usage.record(a.runId,a.token,{...event,payload:{...event.payload,answerId:'reef'}})).rejects.toMatchObject({code:'EVENT_KEY_CONFLICT'});
    await usage.record(a.runId,a.token,{...event,clientEventId:crypto.randomUUID(),payload:{...event.payload,answerId:'reef'}});
    const filter={kind:'game',from:new Date(Date.now()-60000).toISOString(),to:new Date(Date.now()+60000).toISOString()};
    const report=await reports.report(filter);
    expect(report.summary.opens.value).toBe(1);expect(report.summary.interactedRuns.value).toBe(1);expect(report.summary.usedActivities.value).toBe(1);
    expect(report.daily.reduce((sum,x)=>sum+(x.opens||0),0)).toBe(1);
    const detail=await reports.detail(activity.id,{...filter,contentType:'activity',version:activity.version,asOf:report.meta.filter.asOf});
    expect(detail.sections[0].denominator).toBe(1);expect(detail.sections[0].values[0].count).toBe(1);
    expect(detail.analysis).toMatchObject({type:'game_first_answer',mechanic:'sorting',definitionVersion:1});
    expect(detail.analysis?.items.find((item:any)=>item.id==='fish')).toMatchObject({answeredRuns:1,firstIncorrectRuns:1});
    const csv=await reports.csv({...filter,asOf:report.meta.filter.asOf});expect(csv).toContain('Bài dùng thật');expect(csv).not.toContain(a.runId);expect(csv).not.toContain(a.token);
  });
  it('keeps coverage distinct and rejects wrong canonical items',async()=>{
    const a=await usage.open({contentType:'activity',contentId:activity.id,version:activity.version,openKey:crypto.randomUUID()});
    await expect(usage.record(a.runId,a.token,{clientEventId:crypto.randomUUID(),payload:{type:'game_answer',itemId:'invented',answerId:'reef'}})).rejects.toMatchObject({code:'INVALID_USAGE_INTERACTION'});
    const old=await reports.report({kind:'game',from:'2020-01-01T00:00:00Z',to:'2020-01-02T00:00:00Z'});
    expect(old.summary.opens.value).toBeNull();expect(old.daily.every(x=>x.opens===null)).toBe(true);
    const model=await reports.report({kind:'model3d'});expect(model.summary.interactedRuns.value).toBeNull();
    expect((await runMigrations(pool)).applied).toHaveLength(0);
  });
  it('records canonical simulation, scenario and 3D snapshots without inferring learning outcomes',async()=>{
    const sim=(await pool.query("INSERT INTO activities(kind,title,template_key,config,visibility) VALUES('simulation','Nhựa','plastic-journey','{}','published') RETURNING id,version")).rows[0];
    const scenario=(await pool.query(`INSERT INTO activities(kind,title,template_key,config,visibility) VALUES('scenario','Lựa chọn','scenario',$1,'published') RETURNING id,version`,[{startSceneId:'beach',scenes:[{id:'beach',title:'Bờ biển',choices:[{id:'bin',label:'Bỏ vào thùng',nextSceneId:'end'}]},{id:'end',title:'Biển sạch',isEnd:true,choices:[]}]}])).rows[0];
    const model=(await pool.query("INSERT INTO models_3d(title,model_uid,canonical_url,visibility) VALUES('Rùa','c92be549c8194136914883309a13a6b5','https://sketchfab.com/3d-models/c92be549c8194136914883309a13a6b5','published') RETURNING id,version")).rows[0];
    for(const [item,kind,payload] of [[sim,'simulation',{type:'simulation_step',stepId:'microplastics'}],[scenario,'scenario',{type:'scenario_choice',sceneId:'beach',choiceId:'bin'}],[model,'model3d',null]] as const){
      const run=await usage.open({contentType:kind==='model3d'?'model3d':'activity',contentId:item.id,version:item.version,openKey:crypto.randomUUID()});
      if(payload)await usage.record(run.runId,run.token,{clientEventId:crypto.randomUUID(),payload});
      const report=await reports.report({kind,contentId:item.id});
      expect(report.summary.opens.value).toBe(1);expect(report.summary.interactedRuns.value).toBe(payload?1:null);
      const detail=await reports.detail(item.id,{...report.meta.filter,version:item.version,contentType:kind==='model3d'?'model3d':'activity'});
      expect(detail.sections.length).toBe(payload?1:0);
      const csv=await reports.csv({...report.meta.filter});expect(csv).toContain(item===sim?'Nhựa':item===scenario?'Lựa chọn':'Rùa');
      expect(JSON.stringify(report)).not.toMatch(/studentCount|completion|score/);
    }
  });
  it('keeps first-answer denominators, version snapshots, day boundaries and cutoff stable',async()=>{
    const fixture=(await pool.query("INSERT INTO activities(kind,title,template_key,config,visibility) VALUES('game','Cùng tên','sorting',$1,'published') RETURNING id,version",[activity.config])).rows[0];
    const runs=[];
    for(let i=0;i<2;i++)runs.push(await usage.open({contentType:'activity',contentId:fixture.id,version:1,openKey:crypto.randomUUID()}));
    await pool.query("UPDATE interactive_usage_runs SET opened_at='2026-10-20T17:05:00Z' WHERE id=ANY($1::uuid[])",[runs.map(r=>r.runId)]);
    for(const run of runs)await usage.record(run.runId,run.token,{clientEventId:crypto.randomUUID(),payload:{type:'game_answer',itemId:'fish',answerId:'sand'}});
    await usage.record(runs[0].runId,runs[0].token,{clientEventId:crypto.randomUUID(),payload:{type:'game_answer',itemId:'shell',answerId:'sand'}});
    await pool.query("UPDATE interactive_usage_interactions SET received_at='2026-10-20T17:06:00Z' WHERE run_id=ANY($1::uuid[])",[runs.map(r=>r.runId)]);
    await pool.query("UPDATE activities SET version=2,config='{}' WHERE id=$1",[fixture.id]);
    await usage.record(runs[0].runId,runs[0].token,{clientEventId:crypto.randomUUID(),payload:{type:'game_answer',itemId:'fish',answerId:'reef'}});
    const filter={kind:'game',contentId:fixture.id,from:'2026-10-20T17:00:00Z',to:'2026-10-21T17:00:00Z',asOf:'2026-10-21T16:00:00Z'};
    const detail=await reports.detail(fixture.id,{...filter,contentType:'activity',version:1});
    expect(detail.opens).toBe(2);expect(detail.interactedRuns).toBe(2);
    expect(detail.sections.find(s=>s.id==='fish')).toMatchObject({denominator:2,values:[{count:2}]});
    expect(detail.sections.find(s=>s.id==='shell')).toMatchObject({denominator:1,values:[{count:0}]});
    expect((await reports.detail(fixture.id,{...filter,contentType:'activity',version:2})).opens).toBe(0);
    const prior=await reports.report({...filter,to:'2026-10-20T17:05:00Z'});
    expect(prior.rows).toHaveLength(0);
    await pool.query("UPDATE interactive_usage_runs SET expires_at=now()-interval '1 minute' WHERE id=$1",[runs[0].runId]);
    await expect(usage.record(runs[0].runId,runs[0].token,{clientEventId:crypto.randomUUID(),payload:{type:'game_answer',itemId:'fish',answerId:'reef'}})).rejects.toMatchObject({code:'INVALID_USAGE_TOKEN'});
  });
  it('records a played game once in a signed-in child’s personal journey before joining a class', async () => {
    const { id: learnerId } = (await pool.query(`INSERT INTO learners(email,password_hash,display_name)
      VALUES('personal-game@example.test','test-only','Bé An') RETURNING id`)).rows[0];
    const run = await usage.open({contentType:'activity',contentId:activity.id,version:activity.version,openKey:crypto.randomUUID()}, learnerId);
    const context = (await pool.query('SELECT id,personal FROM learner_study_contexts WHERE learner_id=$1', [learnerId])).rows[0];
    expect(context).toMatchObject({personal:true});
    const db = new DatabaseService(pool);
    expect((await readLearnerProfileJourney(db, learnerId, context.id)).games).toEqual([]);
    for (const answerId of ['sand','reef']) {
      await usage.record(run.runId, run.token, {clientEventId:crypto.randomUUID(),payload:{type:'game_answer',itemId:'fish',answerId}}, learnerId);
    }
    const journey = await readLearnerProfileJourney(db, learnerId, context.id);
    expect(journey.games).toEqual([expect.objectContaining({id:activity.id})]);
    expect(journey.achievementCount).toBe(1);
    expect(journey).not.toHaveProperty('badges');
  });
});
