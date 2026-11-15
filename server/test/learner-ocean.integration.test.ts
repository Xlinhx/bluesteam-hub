import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createServerApp } from '../src/bootstrap.js';
import { runMigrations } from '../src/database/migrate.js';
import { assertTestDatabaseUrl, createDatabasePool } from '../src/database/pool.js';
import { installLearnerPack } from '../src/database/seeds/install-learner-pack.js';

const databaseUrl = process.env.LEARNER_OCEAN_TEST_DATABASE_URL
  || 'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_learner_ocean_test';
const pool = createDatabasePool(databaseUrl);
let base = '';
let close: (() => Promise<void>) | undefined;

const request = (path: string, cookie = '', method = 'GET', body?: unknown) => fetch(`${base}/api/v1/${path}`, {
  method, headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const ocean = (path: string, cookie?: string, method?: string, body?: unknown) =>
  request('learner-ocean/' + path, cookie, method, body);
const form = { name:'Bé Na', school:'Trường Xanh', schoolYear:'2026–2027', className:'1A' };

beforeAll(async () => {
  assertTestDatabaseUrl(databaseUrl);
  const admin = createDatabasePool(databaseUrl.replace(/\/[^/]+$/, '/postgres'));
  try {
    if (!(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', ['bluesteam_learner_ocean_test'])).rowCount)
      await admin.query('CREATE DATABASE bluesteam_learner_ocean_test');
  } finally { await admin.end(); }
  await runMigrations(pool);
  const dir = fileURLToPath(new URL('../seed-data', import.meta.url));
  const first = await installLearnerPack(pool, dir);
  expect(await installLearnerPack(pool, dir)).toEqual(first);
  const started = await createServerApp({ databaseUrl, port: 0 });
  base = started.url;
  close = started.close;
}, 30000);

afterAll(async () => { await close?.(); await pool.end(); });

async function register() {
  const response = await request('auth/register', '', 'POST', {
    role: 'student', email: `${crypto.randomUUID()}@example.test`, password: 'Ocean-test-123', displayName: 'Bé Na',
  });
  expect(response.status).toBe(201);
  return response.headers.get('set-cookie')!.split(';')[0];
}

it('keeps personal activity private and separates the learner totals from classroom evidence', async () => {
  const teacher = async () => {
    const response = await request('auth/register', '', 'POST', {
      role:'teacher',email:`${crypto.randomUUID()}@example.test`,password:'Ocean-test-123',displayName:'Cô kiểm thử',
    });
    expect(response.status).toBe(201);
    return response.headers.get('set-cookie')!.split(';')[0];
  };
  const [owner, outsider, pupil] = await Promise.all([teacher(),teacher(),register()]);
  const outsiderEmail=(await (await request('auth/me',outsider)).json()).teacher.email;
  const schoolResponse = await request('teacher/classroom/schools',owner,'POST',{name:'Trường kiểm thử'});
  expect(schoolResponse.status).toBe(201);
  const school = await schoolResponse.json();
  const createClass = async (name:string) => {
    const response = await request('teacher/classroom/classes',owner,'POST',{schoolId:school.id,year:'2026–2027',name,ageGroup:'5–6 tuổi'});
    expect(response.status).toBe(201);
    return (await response.json()).id;
  };
  const [first,second] = await Promise.all([createClass('Lá 1'),createClass('Lá 2')]);
  const calendar={name:'Lá 2',ageGroup:'5–6 tuổi',archived:false,startDate:'2026-09-05',endDate:'2027-05-31'};
  expect((await request(`teacher/classroom/classes/${second}`,owner,'PATCH',calendar)).status).toBe(200);
  expect((await request(`teacher/classroom/classes/${second}`,owner,'PATCH',{...calendar,endDate:'2026-01-01'})).status).toBe(400);
  expect((await request(`teacher/classroom/classes/${second}`,owner,'PATCH',{...calendar,startDate:'2026-02-30'})).status).toBe(400);
  const nextYear=await request('teacher/classroom/classes',owner,'POST',{schoolId:school.id,year:'2027–2028',name:'Lá 2',ageGroup:'5–6 tuổi'});
  expect(nextYear.status).toBe(201);
  expect((await (await request(`teacher/classroom/classes/${(await nextYear.json()).id}`,owner)).json()).members).toEqual([]);
  expect((await request(`teacher/classroom/classes/${first}`,outsider)).status).toBe(404);
  expect((await request(`teacher/classroom/classes/${first}`,pupil)).status).toBe(401);
  expect((await request(`teacher/classroom/classes/${first}/teachers`,owner,'POST',{email:outsiderEmail,role:'assistant'})).status).toBe(201);
  expect((await request(`teacher/classroom/classes/${first}`,outsider)).status).toBe(200);
  expect((await request(`teacher/classroom/classes/${first}/teachers`,outsider,'POST',{email:outsiderEmail,role:'lead'})).status).toBe(403);
  expect((await request(`teacher/classroom/classes/${first}/teachers`,owner,'POST',{email:outsiderEmail,role:'remove'})).status).toBe(201);
  expect((await request(`teacher/classroom/classes/${first}`,outsider)).status).toBe(404);
  const join = async (id:string) => {
    const detail = await (await request(`teacher/classroom/classes/${id}`,owner)).json();
    const response = await ocean('join-class',pupil,'POST',{code:detail.classroom.invite_code});
    expect(response.status).toBe(201);
    return (await response.json()).id;
  };
  const enrollment = await join(first);
  const classEvidence = async (id:string) =>
    (await (await request(`teacher/classroom/classes/${id}`,owner)).json()).evidence;
  const sourceView = { kind:'source', id:'upper-2' };
  const open = () => ocean('resource-views',pupil,'POST',sourceView);
  const study = () => ocean('studied/upper-2',pupil,'POST');
  for (const response of await Promise.all([open(),study(),open(),study()])) expect(response.status).toBe(201);
  expect((await classEvidence(first)).resources).toEqual([]);
  const personal = await (await ocean('profile',pupil)).json();
  expect(personal).toMatchObject({contextId:null, contexts:[], learned:1});
  const personalJourney = await (await ocean('evidence',pupil)).json();
  expect(personalJourney).toMatchObject({resourceCount:1,achievementCount:1,species:[expect.objectContaining({id:'upper-2'})]});
  expect(personalJourney).not.toHaveProperty('badges');
  expect(await (await ocean('history',pupil)).json()).toMatchObject({items:[expect.objectContaining({id:'upper-2'})]});
  const approve = () => request(`teacher/classroom/classes/${first}/enrollments/${enrollment}`,owner,'POST',{action:'approve'});
  const approvals = await Promise.all([approve(),approve()]);
  expect(approvals.map(response=>response.status)).toEqual([201,201]);
  const context1 = (await (await ocean('profile',pupil)).json()).contextId;
  expect((await ocean('studied/upper-2',pupil,'POST')).status).toBe(201);
  expect((await ocean('studied/upper-2',pupil,'POST')).status).toBe(201);
  const opens = await Promise.all([
    ocean('resource-views',pupil,'POST',sourceView),
    ocean('resource-views',pupil,'POST',sourceView),
    ocean('resource-views',pupil,'POST',{...sourceView,id:'missing-source'}),
    ocean('resource-views',owner,'POST',sourceView),
  ]);
  expect(opens.map(response=>response.status)).toEqual([201,201,201,201]);
  const overview = await classEvidence(first);
  expect(overview.resources).toEqual([expect.objectContaining({id:'source:upper-2'})]);
  expect(overview.badges).toEqual([expect.objectContaining({badge_id:'species-1',rule_version:1})]);
  let evidence = await (await ocean(`evidence?contextId=${context1}`,pupil)).json();
  expect(evidence.species).toHaveLength(1);
  expect(evidence).toMatchObject({achievementCount:1,resourceCount:1});
  expect(evidence).not.toHaveProperty('badges');
  const again = await (await ocean(`evidence?contextId=${context1}`,pupil)).json();
  expect(again).toEqual(evidence);
  expect((await classEvidence(first)).badges).toEqual(overview.badges);
  const teacherEvidence = await (await request(`teacher/classroom/classes/${first}/learners/${(await pool.query('SELECT learner_id FROM class_enrollments WHERE id=$1',[enrollment])).rows[0].learner_id}`,owner)).json();
  expect(teacherEvidence.species).toEqual(again.species);
  expect(teacherEvidence.badges.filter((badge:{earnedAt:string|null})=>badge.earnedAt)).toHaveLength(1);
  const session = await (await request('teacher/creative-sessions',owner,'POST',{title:'Biển của lớp',kind:'scan'})).json();
  const participant = await (await request('creative-sessions/join',pupil,'POST',{code:session.code})).json();
  const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aO1cAAAAASUVORK5CYII=';
  const artwork={clientSubmissionId:crypto.randomUUID(),editVersion:1,alias:'Tên tùy chọn không dùng để nhận diện',kind:'scan',preview:image,
    document:{schemaVersion:1,originalDataUrl:image,cutoutDataUrl:image,environmentId:'reef',motion:'swim',crop:{x:0,y:0,width:100,height:100}}};
  const send = (cookie:string,editVersion:number) => fetch(`${base}/api/v1/creative-sessions/submissions`,{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json','x-participant-token':participant.token},body:JSON.stringify({...artwork,editVersion})});
  expect((await send(pupil,1)).status).toBe(201);
  expect((await send(pupil,1)).status).toBe(201);
  expect((await send(pupil,2)).status).toBe(201);
  evidence=await (await ocean(`evidence?contextId=${context1}`,pupil)).json();
  expect(evidence.creations).toHaveLength(1);
  expect(evidence.achievementCount).toBe(2);
  const other=await register();
  expect(await (await ocean('evidence',other)).json()).toMatchObject({resourceCount:0,achievementCount:0,species:[]});
  expect((await ocean(`evidence?contextId=${personal.personalContextId}`,other)).status).toBe(404);
  expect(await (await ocean(`evidence?contextId=${personal.personalContextId}`,pupil)).json()).toEqual(personalJourney);
  expect((await send(other,3)).status).toBe(403);
  const secondEnrollment = await join(second);
  expect((await request(`teacher/classroom/classes/${second}/enrollments/${secondEnrollment}`,owner,'POST',{action:'approve'})).status).toBe(201);
  const contexts = (await (await ocean('profile',pupil)).json()).contexts;
  const context2 = contexts.find((value:{classId:string})=>value.classId===second).id;
  expect((await ocean('active-class',pupil,'POST',{contextId:context2})).status).toBe(201);
  expect((await classEvidence(second)).resources).toEqual([]);
  expect((await ocean('resource-views',pupil,'POST',sourceView)).status).toBe(201);
  expect((await classEvidence(second)).resources).toHaveLength(1);
  expect((await classEvidence(first)).resources).toEqual(overview.resources);
  const viewing = await (await ocean(`profile?contextId=${context1}`,pupil)).json();
  expect(viewing.contextId).toBe(context2);
  expect(viewing.learned).toBe(1);
  expect((await (await ocean('profile',pupil)).json()).learned).toBe(0);
  expect((await ocean('profile',pupil,'PUT',{...form,editId:context1})).status).toBe(409);
  expect((await ocean('name',pupil,'PUT',{name:'Bé tên mới'})).status).toBe(200);
  expect((await request(`teacher/classroom/classes/${second}`,owner,'PATCH',{name:'Lá 2 mới',ageGroup:'5–6 tuổi',archived:true})).status).toBe(200);
  const archivedClass=(await (await request(`teacher/classroom/classes/${second}`,owner)).json()).classroom;
  expect(archivedClass.start_date).toBe('2026-09-05');
  expect(archivedClass.end_date).toBe('2027-05-31');
  expect((await ocean('studied/upper-2',pupil,'POST')).status).toBe(409);
  expect((await ocean('active-class',pupil,'POST',{contextId:context2})).status).toBe(404);
  expect((await (await ocean('study-context',pupil)).json()).contextId).toBeNull();
  expect((await (await ocean(`evidence?contextId=${context1}`,pupil)).json()).achievementCount).toBe(evidence.achievementCount);
  expect((await ocean(`evidence?contextId=${context1}`,other)).status).toBe(404);
  expect((await request('teacher/classroom/profile',owner,'PATCH',{name:'Cô',birthDate:'2026-02-30'})).status).toBe(400);
  expect((await request(`teacher/classroom/classes/${first}/enrollments/${enrollment}`,owner,'POST',{action:'end'})).status).toBe(201);
  expect((await ocean('active-class',pupil,'POST',{contextId:context1})).status).toBe(404);
  expect((await (await ocean(`evidence?contextId=${context1}`,pupil)).json()).species).toHaveLength(1);
});

it('publishes exact axes and leaves the unclassified offshore zone empty', async () => {
  const zones = await (await ocean('zones')).json();
  expect(zones.zones.filter((zone: {axis: string}) => zone.axis === 'vertical')).toHaveLength(5);
  expect(zones.zones.filter((zone: {axis: string}) => zone.axis === 'horizontal')).toHaveLength(6);
  expect(await (await ocean('groups?zone=offshore')).json()).toEqual({items:[]});
  const search = await (await ocean('items?zone=upper&q=ca+heo+mui+chai')).json();
  expect(search.items).toEqual([expect.objectContaining({id:'upper-2', learned:false})]);
});

it('publishes the PDF flashcards exactly once in the shared resource catalog', async () => {
  const groups = await (await request('resource-groups')).json();
  expect(groups.items.map((group: {title: string}) => group.title)).toEqual(['Thẻ học liệu 2']);
  const group = groups.items[0];
  expect(group.memberCount).toBe(27);
  const page = await (await request(`resources?kind=flashcard&groupId=${group.id}&limit=50`)).json();
  expect(page.total).toBe(27);
  expect(page.items[0].id).toBe(group.previews[0].id);
  const paged = `resources?library=1&kind=flashcard&groupId=${group.id}&limit=12`;
  const first = await (await request(paged)).json();
  const second = await (await request(paged + '&cursor=' + first.nextCursor)).json();
  const third = await (await request(paged + '&cursor=' + second.nextCursor)).json();
  const back = await (await request(paged + '&before=' + third.previousCursor)).json();
  expect(first.previousCursor).toBeNull();
  expect(third.items).toHaveLength(3);
  expect(back.items).toEqual(second.items);
  const numbered = `resources?library=1&kind=flashcard&groupId=${group.id}&limit=5`;
  const [thirdNumbered, lastNumbered, beyond] = await Promise.all([3, 6, 7].map(async page =>
    (await request(`${numbered}&page=${page}`)).json()));
  expect(thirdNumbered.items.map((item: {id: string}) => item.id)).toEqual(page.items.slice(10,15).map((item: {id: string}) => item.id));
  expect(lastNumbered.items).toHaveLength(2);
  expect(beyond).toMatchObject({items:[],total:27});
  const original = await (await request('resources/flashcards-1')).json();
  expect(original.id).toBe(page.items[0].id);
  expect(original.content.albumUrls).toHaveLength(2);
  expect(original.content.sourcePages).toEqual([1, 2]);
});

it('pages a selected format in both directions without splitting it into shelves', async () => {
  const list = async (params = '') => (await (await ocean('items?kind=flashcard&limit=12' + params)).json());
  const first = await list();
  expect(first.items).toHaveLength(12);
  expect(first.previousCursor).toBeNull();
  const second = await list('&cursor=' + first.nextCursor);
  expect(second.items).toHaveLength(12);
  expect(second.items.every((item: {kind: string; id: string}) => item.kind === 'flashcard' &&
    !first.items.some((previous: {id: string}) => previous.id === item.id))).toBe(true);
  const previous = await list('&before=' + second.previousCursor);
  expect(previous.items).toEqual(first.items);
  expect(previous.previousCursor).toBeNull();
  expect(previous.nextCursor).toBe(first.nextCursor);
  const last = await list('&cursor=' + second.nextCursor);
  expect(last.items).toHaveLength(3);
  expect(last.nextCursor).toBeNull();
  const numbered = await (await ocean('items?kind=flashcard&limit=5&page=6')).json();
  expect(numbered).toMatchObject({items:last.items.slice(-2),total:27,nextCursor:null});
  const found = await list('&q=c%C3%A1+h%E1%BB%81');
  expect(found.items.map((item: {title: string}) => item.title)).toEqual(['Cá hề', 'Cá heo']);
  expect(found.nextCursor).toBeNull();
  expect((await list('&group=missing')).items).toEqual([]);
});

it('retires imported formats without removing the reef narration or flashcards', async () => {
  expect((await (await ocean('zones')).json()).version).toBe('ocean-v7');
  for (const kind of ['image','audio','video','coloring','worksheet','poster','download']) {
    expect(await (await ocean('items?kind=' + kind + '&allZones=1')).json()).toEqual({
      items: [], nextCursor: null, previousCursor: null,
    });
    expect(await (await ocean('groups?kind=' + kind + '&allZones=1')).json()).toEqual({items:[]});
  }
  for (const id of ['audio-reef-2', 'video-book-6', 'coloring-book-21', 'book']) {
    expect((await ocean('items/' + id)).status).toBe(404);
  }
  const reef = await (await ocean('items/reef-2')).json();
  expect(reef.facts[0].audio).toMatch(/\.mp3$/);
  expect(reef.variants).toEqual([]);
  expect((await ocean('items/flashcards-1')).ok).toBe(true);
});

it('isolates a learner’s study log by account and class and prevents duplicate points', async () => {
  const first = await register();
  const second = await register();
  expect((await ocean('studied/upper-2', '', 'POST')).status).toBe(401);
  expect((await ocean('profile', first, 'PUT', form)).status).toBe(200);
  expect((await ocean('profile', second, 'PUT', form)).status).toBe(200);
  for (const response of await Promise.all([ocean('studied/upper-2', first, 'POST'), ocean('studied/upper-2', first, 'POST')])) {
    expect(response.ok).toBe(true);
    expect(await response.json()).toEqual({learned:true});
  }
  expect((await (await ocean('profile', first)).json()).learned).toBe(1);
  expect((await (await ocean('profile', second)).json()).learned).toBe(0);
  expect((await ocean('profile', first, 'PUT', {...form, className:'2A'})).status).toBe(200);
  expect((await (await ocean('history', first)).json()).items).toEqual([]);
  expect((await ocean('profile', first, 'PUT', form)).status).toBe(200);
  expect((await (await ocean('history', first)).json()).items).toEqual([expect.objectContaining({id:'upper-2'})]);

  const start = async (mode: string) => {
    const response = await ocean('model-runs', first, 'POST', {modelId:'digitallife-72b', mode});
    expect(response.ok).toBe(true);
    return (await response.json()).id as string;
  };
  const claim = (id: string, cookie = first) => ocean(`model-runs/${id}/award`, cookie, 'POST');
  const [one, two] = await Promise.all([start('inspector'), start('inspector')]);
  expect((await claim(one, second)).status).toBe(409);
  const results = await Promise.all([claim(one), claim(two)].map(async promise => (await (await promise).json()).awarded));
  expect(results.sort()).toEqual([false,true]);
  expect((await ocean('model-runs', first, 'POST', {modelId:'digitallife-72b', mode:'vr'})).status).toBe(403);
  expect((await (await ocean('profile', first)).json()).points).toBe(100);
  expect((await (await ocean('profile', second)).json()).points).toBe(0);

  for (const id of ['upper-23', 'reef-19']) {
    expect((await ocean('studied/' + id, first, 'POST')).status).toBe(201);
  }
  expect((await (await ocean('profile', first)).json()).learned).toBe(2);
  expect((await (await ocean('history', first)).json()).items).toHaveLength(2);
});
