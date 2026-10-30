import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { hashSync } from '@node-rs/argon2';
import { createDatabasePool, assertTestDatabaseUrl } from '../src/database/pool.js';
import { runMigrations } from '../src/database/migrate.js';
import { importSeed } from '../src/database/seeds/import-seed.js';
import { createServerApp } from '../src/bootstrap.js';
import { ModelsService } from '../src/content/models/models.service.js';
import { ActivitiesService } from '../src/content/activities/activities.service.js';

const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_test';

describe('Task 4 — Content Catalogs (Topics, Resources, 3D Models) & Teacher CRUD Integration', () => {
  const tempMediaDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bluesteam-content-test-'));
  let appUrl = '';
  let closeApp: (() => Promise<void>) | null = null;
  let teacherACookie = '';
  let teacherBCookie = '';
  const pool = createDatabasePool(TEST_DB_URL);

  beforeAll(async () => {
    assertTestDatabaseUrl(TEST_DB_URL);
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await runMigrations(pool);

    const repoRoot = path.resolve(process.cwd(), '..');
    await importSeed({
      mode: 'demo',
      dryRun: false,
      archiveDir: path.join(repoRoot, 'server', 'seed-data'),
      dbClient: pool,
    });

    // Insert a second teacher B to test cross-owner authorization
    await pool.query(
      `INSERT INTO teachers (email, password_hash, display_name, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (email) DO NOTHING`,
      ['co.minh@mamnon.edu.vn', hashSync('passwordB123'), 'Cô Minh'],
    );

    const started = await createServerApp({
      databaseUrl: TEST_DB_URL,
      mediaStorageDir: tempMediaDir,
      port: 0,
    });
    appUrl = started.url;
    closeApp = started.close;

    const loginA = await fetch(`${appUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'colinh@bluesteam.edu.vn', password: 'daiduong2026' }),
    });
    teacherACookie = (loginA.headers.get('set-cookie') || '').split(';')[0];

    const loginB = await fetch(`${appUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'co.minh@mamnon.edu.vn', password: 'passwordB123' }),
    });
    teacherBCookie = (loginB.headers.get('set-cookie') || '').split(';')[0];
  });

  afterAll(async () => {
    if (closeApp) await closeApp();
    await pool.end();
    fs.rmSync(tempMediaDir, { recursive: true, force: true });
  });

  it('retires drafts in resources and groups, keeps copies hidden and only deletes unreferenced hidden content', async () => {
    const headers={Cookie:teacherACookie,'Content-Type':'application/json'};
    for(const endpoint of ['resources','resource-groups']) {
      const body=endpoint==='resources'?{title:'Cá',kind:'flashcard',visibility:'draft'}:{title:'Nhóm',visibility:'draft'};
      expect((await fetch(`${appUrl}/api/v1/teacher/${endpoint}`,{method:'POST',headers,body:JSON.stringify(body)})).status).toBe(400);
    }
    const item=await (await fetch(`${appUrl}/api/v1/teacher/resources`,{method:'POST',headers,body:JSON.stringify({title:'Học liệu ẩn',kind:'flashcard'})})).json();
    expect(item.visibility).toBe('hidden');
    const linkedSource=await (await fetch(`${appUrl}/api/v1/teacher/resources`,{method:'POST',headers,body:JSON.stringify({title:'Nguồn liên kết ẩn',kind:'flashcard',linkedVariantIds:[item.id]})})).json();
    expect(linkedSource.variants[0].visibility).toBe('hidden');
    const group=await (await fetch(`${appUrl}/api/v1/teacher/resource-groups`,{method:'POST',headers,body:JSON.stringify({title:'Nhóm ẩn'})})).json();
    expect((await (await fetch(`${appUrl}/api/v1/teacher/resource-groups/${group.id}`,{headers})).json()).visibility).toBe('hidden');
    const copy=await (await fetch(`${appUrl}/api/v1/teacher/resources/${item.id}/duplicate`,{method:'POST',headers})).json();
    expect(copy.visibility).toBe('hidden');
    expect((await fetch(`${appUrl}/api/v1/teacher/resources/${copy.id}`,{method:'DELETE',headers})).status).toBe(200);
    expect((await fetch(`${appUrl}/api/v1/teacher/resources/${copy.id}`,{headers})).status).toBe(404);
    await expect(pool.query("UPDATE resources SET visibility='draft' WHERE id=$1",[item.id])).rejects.toThrow();
    await expect(pool.query("UPDATE resource_groups SET visibility='draft' WHERE id=$1",[group.id])).rejects.toThrow();
  });

  it('migrates existing draft rows to hidden without changing their identities or relationships', async () => {
    const client=await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`CREATE TEMP TABLE resources(id int PRIMARY KEY,visibility text DEFAULT 'draft' CHECK(visibility IN ('seed','draft','published','hidden'))) ON COMMIT DROP;
        CREATE TEMP TABLE resource_groups(id int PRIMARY KEY,visibility text DEFAULT 'draft' CHECK(visibility IN ('draft','published','hidden'))) ON COMMIT DROP;
        CREATE TEMP TABLE resource_group_members(group_id int REFERENCES resource_groups(id),resource_id int REFERENCES resources(id)) ON COMMIT DROP;
        INSERT INTO resources VALUES(1,'draft'),(2,'published'),(3,'hidden');
        INSERT INTO resource_groups VALUES(1,'draft'),(2,'published');
        INSERT INTO resource_group_members VALUES(1,1),(2,2);`);
      await client.query(fs.readFileSync(path.resolve('src/database/migrations/009_resource_visibility_without_drafts.sql'),'utf8'));
      expect((await client.query('SELECT * FROM resources ORDER BY id')).rows).toEqual([{id:1,visibility:'hidden'},{id:2,visibility:'published'},{id:3,visibility:'hidden'}]);
      expect((await client.query('SELECT * FROM resource_groups ORDER BY id')).rows).toEqual([{id:1,visibility:'hidden'},{id:2,visibility:'published'}]);
      expect((await client.query('SELECT * FROM resource_group_members ORDER BY group_id')).rows).toEqual([{group_id:1,resource_id:1},{group_id:2,resource_id:2}]);
    } finally { await client.query('ROLLBACK');client.release(); }
  });

  it('keeps group pagination totals beyond the last page and rejects retired resource filters', async () => {
    const title=`Nhóm phân trang ${randomUUID()}`;
    const owner=(await pool.query("SELECT id FROM teachers WHERE email='colinh@bluesteam.edu.vn'")).rows[0].id;
    for(let index=0;index<13;index++)await pool.query("INSERT INTO resource_groups(owner_id,title,visibility) VALUES($1,$2,'hidden')",[owner,title]);
    const headers={Cookie:teacherACookie};
    const read=async(cursor:number)=>(await (await fetch(`${appUrl}/api/v1/teacher/resource-groups?q=${encodeURIComponent(title)}&limit=6&cursor=${cursor}`,{headers})).json());
    const first=await read(0),second=await read(6),last=await read(12),empty=await read(18);
    expect([first.items.length,second.items.length,last.items.length,empty.items.length]).toEqual([6,6,1,0]);
    expect(new Set([...first.items,...second.items,...last.items].map(item=>item.id)).size).toBe(13);
    expect(empty.total).toBe(13);
    expect((await fetch(`${appUrl}/api/v1/teacher/resources?visibility=draft`,{headers})).status).toBe(400);
    await pool.query('DELETE FROM resource_groups WHERE title=$1',[title]);
  });

  it('makes demo resources and groups manageable by their teacher without granting another teacher write access, and preserves edits on reseed', async () => {
    const headers={Cookie:teacherACookie,'Content-Type':'application/json'};
    const group=(await (await fetch(`${appUrl}/api/v1/teacher/resource-groups`,{headers})).json()).items.find((g:any)=>g.title==='Rạn san hô');
    expect(group.isSeed).toBe(false);
    const original=await (await fetch(`${appUrl}/api/v1/teacher/resources?groupId=${group.id}`,{headers})).json();
    const resource=original.items.find((r:any)=>r.kind==='flashcard');
    expect(resource.ownerId).toBe(group.ownerId);
    expect((await fetch(`${appUrl}/api/v1/teacher/resources/${resource.id}`,{method:'PATCH',headers,body:JSON.stringify({title:'Nội dung cô đã sửa'})})).status).toBe(200);
    expect((await fetch(`${appUrl}/api/v1/teacher/resource-groups/${group.id}`,{method:'PATCH',headers,body:JSON.stringify({title:'Nhóm cô đã sửa'})})).status).toBe(200);
    expect((await fetch(`${appUrl}/api/v1/teacher/resource-groups/${group.id}`,{method:'PATCH',headers:{...headers,Cookie:teacherBCookie},body:JSON.stringify({title:'Không được sửa'})})).status).toBe(403);
    await importSeed({mode:'demo',dryRun:false,archiveDir:path.resolve(process.cwd(),'..','server/seed-data'),dbClient:pool});
    expect((await pool.query('SELECT title FROM resources WHERE id=$1',[resource.id])).rows[0].title).toBe('Nội dung cô đã sửa');
    expect((await pool.query('SELECT title FROM resource_groups WHERE id=$1',[group.id])).rows[0].title).toBe('Nhóm cô đã sửa');
    await pool.query('UPDATE resources SET title=$2 WHERE id=$1',[resource.id,resource.title]);
    await pool.query('UPDATE resource_groups SET title=$2 WHERE id=$1',[group.id,group.title]);
  });

  it('keeps published creative content stable while saving drafts, rejects stale edits and hidden dependencies', async () => {
    const headers = { Cookie: teacherACookie, 'Content-Type': 'application/json' };
    const create = await fetch(`${appUrl}/api/v1/teacher/creative-templates`, { method: 'POST', headers, body: JSON.stringify({ kind: 'drawing', title: 'Bản công khai', payload: { blankPaper: true, narrationUrl: '/audio/test.mp3' }, visibility: 'published' }) });
    expect(create.status).toBe(201);
    const original = await create.json();
    const save = await fetch(`${appUrl}/api/v1/teacher/creative-templates/${original.id}`, { method: 'PATCH', headers, body: JSON.stringify({ title: 'Bản đang sửa', payload: { instructionText: 'Giữ audio' }, visibility: 'draft', expectedVersion: original.version }) });
    expect(save.status).toBe(200);
    const draft = await save.json();
    expect(draft.hasDraft).toBe(true);
    expect(draft.payload.narrationUrl).toBe('/audio/test.mp3');
    const publicPage = await (await fetch(`${appUrl}/api/v1/creative-templates?q=Bản công khai`)).json();
    expect(publicPage.items.find((i: any) => i.id === original.id)?.title).toBe('Bản công khai');
    const stale = await fetch(`${appUrl}/api/v1/teacher/creative-templates/${original.id}`, { method: 'PATCH', headers, body: JSON.stringify({ title: 'Ghi đè', expectedVersion: original.version }) });
    expect(stale.status).toBe(409);
    const materialRes = await fetch(`${appUrl}/api/v1/teacher/creative-materials`, { method: 'POST', headers, body: JSON.stringify({ title: 'Sao', kind: 'stamp', payload: { stampId: 'starfish' }, visibility: 'hidden' }) });
    const material = await materialRes.json();
    const invalid = await fetch(`${appUrl}/api/v1/teacher/creative-templates/${original.id}`, { method: 'PATCH', headers, body: JSON.stringify({ payload: { materialIds: [material.id] }, visibility: 'published', expectedVersion: draft.version }) });
    expect(invalid.status).toBe(400);
    const publish = await fetch(`${appUrl}/api/v1/teacher/creative-templates/${original.id}`, { method: 'PATCH', headers, body: JSON.stringify({ visibility: 'published', expectedVersion: draft.version }) });
    expect(publish.status).toBe(200);
    const refreshed = await (await fetch(`${appUrl}/api/v1/creative-templates?q=Bản đang sửa`)).json();
    expect(refreshed.items.find((i: any) => i.id === original.id)?.payload.instructionText).toBe('Giữ audio');
    const forbidden = await fetch(`${appUrl}/api/v1/teacher/creative-templates/${original.id}`, { method: 'PATCH', headers: { ...headers, Cookie: teacherBCookie }, body: JSON.stringify({ title: 'Không có quyền' }) });
    expect(forbidden.status).toBe(403);
  });

  it('manages groups without confusing membership with linked media, enforces ownership and preserves resources', async () => {
    const headers = { Cookie: teacherACookie, 'Content-Type': 'application/json' };
    const seeded = await (await fetch(`${appUrl}/api/v1/resource-groups`)).json();
    expect(seeded.items.some((g: any) => g.title === 'Rạn san hô')).toBe(true);
    const created = await fetch(`${appUrl}/api/v1/teacher/resource-groups`, {
      method: 'POST', headers, body: JSON.stringify({ title: 'Nhóm thử nghiệm', visibility: 'hidden' }),
    });
    expect(created.status).toBe(201);
    const group = await created.json();
    const imageFile = fs.readFileSync(path.resolve(process.cwd(),'..','public/assets/generated/r2-cutouts/starfish_cutout.png'));
    const uploadBody = new FormData(); uploadBody.append('file',new Blob([imageFile],{type:'image/png'}),'group.png');
    const uploaded = await (await fetch(`${appUrl}/api/v1/teacher/media`, {method:'POST',headers:{Cookie:teacherACookie},body:uploadBody})).json();
    const crop = {x:.25,y:.75,scale:1.8};
    expect((await fetch(`${appUrl}/api/v1/teacher/resource-groups/${group.id}`,{method:'PATCH',headers,body:JSON.stringify({coverMediaId:uploaded.id,coverCrop:crop})})).status).toBe(200);
    const readGroups = await (await fetch(`${appUrl}/api/v1/teacher/resource-groups`,{headers})).json();
    const persisted = readGroups.items.find((g:any)=>g.id===group.id);
    expect(persisted.coverCrop).toEqual(crop);
    expect(persisted.coverUrl).toBe(`/api/v1/media/${uploaded.id}`);
    const resources = await (await fetch(`${appUrl}/api/v1/resources?limit=2`)).json();
    const ids = resources.items.map((r: any) => r.id);
    const put = await fetch(`${appUrl}/api/v1/teacher/resource-groups/${group.id}/members`, {
      method: 'POST', headers, body: JSON.stringify({ resourceIds: [...ids, ids[0]] }),
    });
    expect(put.status).toBe(201);
    const members = await (await fetch(`${appUrl}/api/v1/teacher/resources?groupId=${group.id}`, { headers })).json();
    expect(members.total).toBe(2);
    expect(members.items.map((r: any) => r.id).sort()).toEqual(ids.sort());
    const hidden = await (await fetch(`${appUrl}/api/v1/resources?groupId=${group.id}`)).json();
    expect(hidden.total).toBe(0);
    const forbidden = await fetch(`${appUrl}/api/v1/teacher/resource-groups/${group.id}`, {
      method: 'PATCH', headers: { ...headers, Cookie: teacherBCookie }, body: JSON.stringify({ title: 'Chiếm quyền' }),
    });
    expect(forbidden.status).toBe(403);
    expect((await fetch(`${appUrl}/api/v1/teacher/resource-groups/${group.id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ visibility: 'published' }),
    })).status).toBe(200);
    const published = await (await fetch(`${appUrl}/api/v1/resources?groupId=${group.id}&limit=1`)).json();
    expect(published.total).toBe(2);
    expect(published.nextCursor).toBeTruthy();
    await fetch(`${appUrl}/api/v1/teacher/resource-groups/${group.id}/members`, {
      method: 'DELETE', headers, body: JSON.stringify({ resourceIds: [ids[0]] }),
    });
    expect((await (await fetch(`${appUrl}/api/v1/resources?groupId=${group.id}`)).json()).total).toBe(1);
    expect((await fetch(`${appUrl}/api/v1/resources/${ids[0]}`)).status).toBe(200);
    await fetch(`${appUrl}/api/v1/teacher/resource-groups/${group.id}`, { method: 'DELETE', headers });
    expect((await fetch(`${appUrl}/api/v1/resources/${ids[1]}`)).status).toBe(200);
  });

  it('copies common groups, moves members atomically and rejects unauthorized or missing members', async () => {
    const headers = { Cookie: teacherACookie,'Content-Type':'application/json' };
    const shared = await (await fetch(`${appUrl}/api/v1/resource-groups`)).json();
    const common = shared.items[0];
    const copy = await (await fetch(`${appUrl}/api/v1/teacher/resource-groups/${common.id}/duplicate`,{method:'POST',headers})).json();
    const second = await (await fetch(`${appUrl}/api/v1/teacher/resource-groups`,{method:'POST',headers,body:JSON.stringify({title:'Nhóm nhận'})})).json();
    const before = await (await fetch(`${appUrl}/api/v1/teacher/resources?groupId=${copy.id}`,{headers})).json();
    expect(before.total).toBe(common.memberCount);
    const ids = [before.items[0].id];
    const moved = await fetch(`${appUrl}/api/v1/teacher/resource-groups/${second.id}/members`,{method:'POST',headers,body:JSON.stringify({resourceIds:ids,moveFromGroupId:copy.id})});
    expect(moved.status).toBe(201);
    expect((await (await fetch(`${appUrl}/api/v1/teacher/resources?groupId=${copy.id}`,{headers})).json()).total).toBe(before.total-1);
    const foreign=(await pool.query("INSERT INTO resource_groups(owner_id,title) SELECT id,'Nhóm giáo viên B' FROM teachers WHERE email='co.minh@mamnon.edu.vn' RETURNING id")).rows[0];
    const badMove = await fetch(`${appUrl}/api/v1/teacher/resource-groups/${second.id}/members`,{method:'POST',headers,body:JSON.stringify({resourceIds:[before.items[1].id],moveFromGroupId:foreign.id})});
    expect(badMove.status).toBe(403);
    const badMembers = await fetch(`${appUrl}/api/v1/teacher/resource-groups/${second.id}/members`,{method:'POST',headers,body:JSON.stringify({resourceIds:[before.items[1].id,'00000000-0000-4000-8000-000000000001']})});
    expect(badMembers.status).toBe(409);
    expect((await (await fetch(`${appUrl}/api/v1/teacher/resources?groupId=${second.id}`,{headers})).json()).total).toBe(1);
  });

  it('uses an authored flashcard as the group entry point while media filters and the teacher catalog keep variants', async () => {
    const groups = await (await fetch(`${appUrl}/api/v1/resource-groups?q=${encodeURIComponent('Bãi cát')}`)).json();
    const group = groups.items[0];
    expect(group).toBeTruthy();
    const roots = await (await fetch(`${appUrl}/api/v1/resources?groupId=${group.id}&limit=50`)).json();
    const crab = roots.items.find((item: any) => item.title === 'Cua biển' && item.kind === 'flashcard');
    expect(crab).toBeTruthy();
    const detail = await (await fetch(`${appUrl}/api/v1/resources/${crab.id}`)).json();
    const variantIds = detail.variants.map((item: any) => item.id);
    expect(variantIds.length).toBeGreaterThan(1);
    expect(roots.items.filter((item: any) => variantIds.includes(item.id))).toHaveLength(0);
    expect(group.previews.filter((item: any) => variantIds.includes(item.id))).toHaveLength(0);
      const coloring = await (await fetch(`${appUrl}/api/v1/resources?groupId=${group.id}&kind=coloring`)).json();
      expect(coloring.items.some((item: any) => variantIds.includes(item.id))).toBe(true);
      const videos = await (await fetch(`${appUrl}/api/v1/resources?groupId=${group.id}&kind=video`)).json();
      expect(videos.items).toHaveLength(0); // Archived JPEG previews are not playable videos.
    const managed = await (await fetch(`${appUrl}/api/v1/teacher/resources?groupId=${group.id}&limit=50`, {headers:{Cookie:teacherACookie}})).json();
    expect(managed.items.some((item: any) => variantIds.includes(item.id))).toBe(true);
  });

  it('saves linked media independently, supports removing links and rejects inaccessible targets', async () => {
    const headers = { Cookie: teacherACookie, 'Content-Type': 'application/json' };
    const seed = await (await fetch(`${appUrl}/api/v1/resources?limit=2`)).json();
    const created = await (await fetch(`${appUrl}/api/v1/teacher/resources`, { method:'POST',headers,body:JSON.stringify({title:'Thẻ liên kết',kind:'flashcard',visibility:'hidden'}) })).json();
    const updated = await fetch(`${appUrl}/api/v1/teacher/resources/${created.id}`, {method:'PATCH',headers,body:JSON.stringify({linkedVariantIds: seed.items.map((r: any) => r.id)})});
    expect(updated.status).toBe(200);
    const linked = await updated.json();
    expect(linked.variants.map((r: any) => r.id)).toEqual(seed.items.map((r: any) => r.id));
    const removed = await (await fetch(`${appUrl}/api/v1/teacher/resources/${created.id}`, {method:'PATCH',headers,body:JSON.stringify({linkedVariantIds:[]})})).json();
    expect(removed.variants).toEqual([]);
    const other = await (await fetch(`${appUrl}/api/v1/teacher/resources`, {method:'POST',headers:{...headers,Cookie:teacherBCookie},body:JSON.stringify({title:'Riêng cô B',kind:'audio',visibility:'hidden'})})).json();
    const denied = await fetch(`${appUrl}/api/v1/teacher/resources/${created.id}`, {method:'PATCH',headers,body:JSON.stringify({title:'Không được lưu', linkedVariantIds:[other.id]})});
    expect(denied.status).toBe(400);
    const reread = await (await fetch(`${appUrl}/api/v1/teacher/resources/${created.id}`, {headers})).json();
    expect(reread.title).toBe('Thẻ liên kết');
  });

  it('lists public topics and filters public resources by kind, topic, search, and savedIds without leaking draft/hidden', async () => {
    const topicsRes = await fetch(`${appUrl}/api/v1/topics`);
    expect(topicsRes.status).toBe(200);
    const topicsBody = await topicsRes.json();
    expect(topicsBody.items.length).toBeGreaterThanOrEqual(3);

    const allRes = await fetch(`${appUrl}/api/v1/resources?limit=12`);
    expect(allRes.status).toBe(200);
    const allPage = await allRes.json();
    expect(allPage.total).toBeGreaterThanOrEqual(10);
    expect(allPage.items.every((item: any) => item.visibility === 'published')).toBe(true);

    // Filter by kind=flashcard and topic=species independently
    const flashRes = await fetch(`${appUrl}/api/v1/resources?kind=flashcard&topicIds=species`);
    expect(flashRes.status).toBe(200);
    const flashPage = await flashRes.json();
    expect(flashPage.items.length).toBeGreaterThanOrEqual(4);
    expect(flashPage.items.every((item: any) => item.kind === 'flashcard')).toBe(true);
    expect(flashPage.items.every((item: any) => item.topicSlugs.includes('species'))).toBe(true);

    // Empty result for non-matching query
    const zeroRes = await fetch(`${appUrl}/api/v1/resources?q=khong_ton_tai_xyz_999`);
    expect(zeroRes.status).toBe(200);
    const zeroPage = await zeroRes.json();
    expect(zeroPage.total).toBe(0);
    expect(zeroPage.items).toEqual([]);
  });

  it('saves resource group membership atomically without changing content links', async () => {
    const headers = { Cookie: teacherACookie, 'Content-Type': 'application/json' };
    const supported = await (await fetch(`${appUrl}/api/v1/teacher/resources?kind=supported`, {headers})).json();
    expect(supported.items.length).toBeGreaterThan(0);
    expect(supported.items.some((r: any)=>r.kind==='worksheet')).toBe(false);
    const group = await (await fetch(`${appUrl}/api/v1/teacher/resource-groups`, {method:'POST',headers,body:JSON.stringify({title:'Editor membership'})})).json();
    const resource = await (await fetch(`${appUrl}/api/v1/teacher/resources`, {method:'POST',headers,body:JSON.stringify({title:'Grouped card',kind:'flashcard',groupIds:[group.id]})})).json();
    expect(resource.groups.map((g: any)=>g.id)).toContain(group.id);
    const picker = await (await fetch(`${appUrl}/api/v1/teacher/resources?membershipGroupId=${group.id}&q=Grouped`, {headers})).json();
    expect(picker.items.find((r: any)=>r.id===resource.id)?.isGroupMember).toBe(true);
    const rejected = await fetch(`${appUrl}/api/v1/teacher/resources/${resource.id}`, {method:'PATCH',headers,body:JSON.stringify({title:'Should roll back',groupIds:[randomUUID()]})});
    expect(rejected.status).toBe(400);
    const unchanged = await (await fetch(`${appUrl}/api/v1/teacher/resources/${resource.id}`, {headers})).json();
    expect(unchanged.title).toBe('Grouped card');
    expect(unchanged.groups.map((g: any)=>g.id)).toContain(group.id);
    const removed = await (await fetch(`${appUrl}/api/v1/teacher/resources/${resource.id}`, {method:'PATCH',headers,body:JSON.stringify({groupIds:[]})})).json();
    expect(removed.groups).toEqual([]);
  });

  it('preserves links authored by another teacher when editing a shared target', async () => {
    const headersA = { Cookie: teacherACookie, 'Content-Type': 'application/json' };
    const headersB = { Cookie: teacherBCookie, 'Content-Type': 'application/json' };
    const imageId = (await pool.query("SELECT media_id FROM resources WHERE kind='flashcard' AND media_id IS NOT NULL LIMIT 1")).rows[0].media_id;
    const target = await (await fetch(`${appUrl}/api/v1/teacher/resources`, { method:'POST', headers:headersB, body:JSON.stringify({title:'Shared target',kind:'flashcard',coverMediaId:imageId,visibility:'published',content:{narrationText:'A shared card'}}) })).json();
    expect(target.id).toBeTruthy();
    const source = await (await fetch(`${appUrl}/api/v1/teacher/resources`, { method:'POST', headers:headersA, body:JSON.stringify({title:'Authored parent',kind:'flashcard',linkedVariantIds:[target.id]}) })).json();
    const update = await fetch(`${appUrl}/api/v1/teacher/resources/${target.id}`, {method:'PATCH',headers:headersB,body:JSON.stringify({title:'Updated target',linkedVariantIds:[]})});
    expect(update.status).toBe(200);
    const reread = await (await fetch(`${appUrl}/api/v1/teacher/resources/${source.id}`, {headers:headersA})).json();
    expect(reread.variants.map((v: any) => v.id)).toContain(target.id);
  });

  it('resolves resource detail by ID with linked existing variants and returns 404 for unknown or hidden IDs', async () => {
    const listRes = await fetch(`${appUrl}/api/v1/resources?q=Cua%20bi%E1%BB%83n&kind=flashcard`);
    const listBody = await listRes.json();
    const crabCard = listBody.items[0];
    expect(crabCard).toBeDefined();

    const detailRes = await fetch(`${appUrl}/api/v1/resources/${crabCard.id}`);
    expect(detailRes.status).toBe(200);
    const detail = await detailRes.json();
    expect(detail.id).toBe(crabCard.id);
    expect(detail.title).toContain('Cua biển');
    expect(Array.isArray(detail.variants)).toBe(true);
    expect(detail.variants.length).toBeGreaterThanOrEqual(2);

    const missingRes = await fetch(
      `${appUrl}/api/v1/resources/00000000-0000-4000-8000-000000000999`,
    );
    expect(missingRes.status).toBe(404);
  });

  it('requires actual media before publishing and preserves incomplete hidden resources', async () => {
    const headers = { Cookie: teacherACookie, 'Content-Type': 'application/json' };
    for (const kind of ['video','audio','flashcard','image']) {
      const draft = await (await fetch(`${appUrl}/api/v1/teacher/resources`, {method:'POST',headers,body:JSON.stringify({title:'Thiếu tệp',kind,visibility:'hidden',content:{narrationText:'Lời đọc không thay thế tệp ghi âm hoặc video.'}})})).json();
      const publish = await fetch(`${appUrl}/api/v1/teacher/resources/${draft.id}`, {method:'PATCH',headers,body:JSON.stringify({visibility:'published'})});
      expect(publish.status).toBe(400);
      const unchanged = await (await fetch(`${appUrl}/api/v1/teacher/resources/${draft.id}`, {headers})).json();
      expect(unchanged.visibility).toBe('hidden');
    }
  });

  it('supports seed duplication -> hidden edit -> publish -> hide lifecycle and blocks teacher B from editing teacher A content', async () => {
    const listRes = await fetch(`${appUrl}/api/v1/teacher/resources?limit=20`, {
      headers: { Cookie: teacherACookie },
    });
    expect(listRes.status).toBe(200);
    const teacherList = await listRes.json();
    // Explicit system template fixture: demo library now belongs to its teacher.
    const template=await pool.query("INSERT INTO resources(kind,title,visibility,cover_media_id) SELECT 'flashcard','Mẫu hệ thống kiểm thử','published',cover_media_id FROM resources WHERE cover_media_id IS NOT NULL LIMIT 1 RETURNING id");
    const seedItem={id:template.rows[0].id};
    expect(teacherList.items.length).toBeGreaterThan(0);

    // Direct PATCH on read-only system seed is forbidden
    const patchSeedRes = await fetch(`${appUrl}/api/v1/teacher/resources/${seedItem.id}`, {
      method: 'PATCH',
      headers: { Cookie: teacherACookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Sửa trực tiếp seed' }),
    });
    expect(patchSeedRes.status).toBe(403);

    // Duplicate seed into Teacher A's draft
    const dupRes = await fetch(
      `${appUrl}/api/v1/teacher/resources/${seedItem.id}/duplicate`,
      {
        method: 'POST',
        headers: { Cookie: teacherACookie },
      },
    );
    expect(dupRes.status).toBe(201);
    const draft = await dupRes.json();
    expect(draft.visibility).toBe('hidden');
    expect(draft.ownerId).toBeTruthy();

    // Draft is not visible in public learner catalog yet
    const pubDraftRes = await fetch(`${appUrl}/api/v1/resources/${draft.id}`);
    expect(pubDraftRes.status).toBe(404);

    // Teacher B cannot edit Teacher A's draft
    const crossEditRes = await fetch(`${appUrl}/api/v1/teacher/resources/${draft.id}`, {
      method: 'PATCH',
      headers: { Cookie: teacherBCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Cô Minh sửa trộm' }),
    });
    expect(crossEditRes.status).toBe(403);

    // Teacher A edits and publishes the draft
    const editRes = await fetch(`${appUrl}/api/v1/teacher/resources/${draft.id}`, {
      method: 'PATCH',
      headers: { Cookie: teacherACookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Thẻ hình Cua biển (Bản cô Linh)',
        visibility: 'published',
      }),
    });
    expect(editRes.status).toBe(200);
    const published = await editRes.json();
    expect(published.visibility).toBe('published');
    expect(published.title).toBe('Thẻ hình Cua biển (Bản cô Linh)');

    // Now visible on public learner endpoint
    const pubAfterRes = await fetch(`${appUrl}/api/v1/resources/${draft.id}`);
    expect(pubAfterRes.status).toBe(200);

    // Hide resource -> no longer visible on public learner endpoint
    const hideRes = await fetch(`${appUrl}/api/v1/teacher/resources/${draft.id}`, {
      method: 'PATCH',
      headers: { Cookie: teacherACookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility: 'hidden' }),
    });
    expect(hideRes.status).toBe(200);

    const pubHiddenRes = await fetch(`${appUrl}/api/v1/resources/${draft.id}`);
    expect(pubHiddenRes.status).toBe(404);
  });

  it('keeps rows sharing a PostgreSQL microsecond timestamp across page boundaries', async () => {
    const title=`Microsecond cursor ${randomUUID()}`;
    const ids=[randomUUID(),randomUUID(),randomUUID()].sort().reverse();
    for(const id of ids)await pool.query(`INSERT INTO resources(id,kind,title,description,visibility,content,updated_at)
      VALUES($1,'flashcard',$2,'','published','{}','2026-10-21T10:00:00.123456Z')`,[id,title]);
    const first=await (await fetch(`${appUrl}/api/v1/resources?q=${encodeURIComponent(title)}&limit=2`)).json();
    expect(first.items.map((item:any)=>item.id)).toEqual(ids.slice(0,2));
    const second=await (await fetch(`${appUrl}/api/v1/resources?q=${encodeURIComponent(title)}&limit=2&cursor=${encodeURIComponent(first.nextCursor)}`)).json();
    expect(second.items.map((item:any)=>item.id)).toEqual(ids.slice(2));
    expect(second.nextCursor).toBeNull();
  });

  it('paginates stably across 200 resources without duplicates or missing rows', async () => {
    // Bulk insert 185 extra published resources to exceed 200 total
    for (let i = 1; i <= 185; i++) {
      await pool.query(
        `INSERT INTO resources (kind, title, description, visibility, content)
         VALUES ('flashcard', $1, 'Mô tả kiểm thử phân trang', 'published', '{"shortFacts":[]}'::jsonb)`,
        [`Thẻ thử nghiệm phân trang #${String(i).padStart(3, '0')}`],
      );
    }

    const seenIds = new Set<string>();
    let cursor: string | null = null;
    let pagesFetched = 0;

    do {
      const url = new URL(`${appUrl}/api/v1/resources`);
      url.searchParams.set('limit', '50');
      if (cursor) url.searchParams.set('cursor', cursor);

      const res = await fetch(url);
      expect(res.status).toBe(200);
      const page = await res.json();
      for (const item of page.items) {
        expect(seenIds.has(item.id)).toBe(false);
        seenIds.add(item.id);
      }
      cursor = page.nextCursor;
      pagesFetched++;
    } while (cursor && pagesFetched < 10);

    expect(seenIds.size).toBeGreaterThanOrEqual(200);
  });

  it('manages 3D Sketchfab models with host/UID validation and rejects arbitrary iframe HTML or untrusted hosts', async () => {
    const publicModelsRes = await fetch(`${appUrl}/api/v1/models`);
    expect(publicModelsRes.status).toBe(200);
    const publicModels = await publicModelsRes.json();
    // 4 published in seed (stingray is draft)
    expect(publicModels.items.length).toBe(4);
    expect(
      publicModels.items.every((m: any) => m.visibility === 'published'),
    ).toBe(true);

    // Reject untrusted URL or raw iframe HTML
    const badModelRes = await fetch(`${appUrl}/api/v1/teacher/models`, {
      method: 'POST',
      headers: { Cookie: teacherACookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Mô hình giả',
        sketchfabUrl: 'https://evil.example.com/3d-models/fake-1234567890abcdef1234567890abcdef',
        topicSlugs: ['species'],
      }),
    });
    expect(badModelRes.status).toBe(403);
    expect((await badModelRes.json()).code).toBe('INTERACTIVE_CONTENT_READ_ONLY');
    const owner = (await pool.query('SELECT id FROM teachers LIMIT 1')).rows[0].id;
    const models = new ModelsService(pool);
    await expect(models.createTeacherModel(owner, { title:'Sai host', sketchfabUrl:'https://evil.example.com/model' })).rejects.toBeDefined();

    // The public HTTP write is retired; internal import validation stays available.
    const createdModel = await models.createTeacherModel(owner, {
      title:'Cá heo mũi chai 3D', sketchfabUrl:'https://sketchfab.com/3d-models/bottlenose-dolphin-7b4d2390b19b4a0ea2b9d7236e2f7e99',
      visibility:'published', viewerVerified:true,
    });
    expect(createdModel.modelUid).toBe('7b4d2390b19b4a0ea2b9d7236e2f7e99');
    expect(createdModel.visibility).toBe('published');
  });

  it('manages interactive activities (games, scenarios, simulations) and creative templates/materials with server-side graph validation', async () => {
    const actsRes = await fetch(`${appUrl}/api/v1/activities`);
    expect(actsRes.status).toBe(200);
    const actsPage = await actsRes.json();
    expect(actsPage.items.length).toBeGreaterThanOrEqual(8);

    // Reject creating a custom simulation (dedicated runtime only)
    const simCreateRes = await fetch(`${appUrl}/api/v1/teacher/activities`, {
      method: 'POST',
      headers: { Cookie: teacherACookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'simulation',
        templateKey: 'rescue-mission',
        title: 'Mô phỏng tự chế',
      }),
    });
    expect(simCreateRes.status).toBe(403);

    // Reject scenario with a cycle
    const cyclicScenarioRes = await fetch(`${appUrl}/api/v1/teacher/activities`, {
      method: 'POST',
      headers: { Cookie: teacherACookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'scenario',
        templateKey: 'scenario',
        title: 'Tình huống lặp vô hạn',
        config: {
          templateKey: 'scenario',
          startSceneId: 's1',
          scenes: [
            {
              id: 's1',
              title: 'Cảnh 1',
              choices: [{ id: 'c1', label: 'Sang 2', nextSceneId: 's2', feedbackText: 'OK' }],
            },
            {
              id: 's2',
              title: 'Cảnh 2',
              choices: [{ id: 'c2', label: 'Quay lại 1', nextSceneId: 's1', feedbackText: 'Loop' }],
            },
          ],
        },
      }),
    });
    expect(cyclicScenarioRes.status).toBe(403);
    const cyclicBody = await cyclicScenarioRes.json();
    expect(cyclicBody.code).toBe('INTERACTIVE_CONTENT_READ_ONLY');
    const owner = (await pool.query('SELECT id FROM teachers LIMIT 1')).rows[0].id;
    const activities = new ActivitiesService(pool);
    await expect(activities.createTeacherActivity(owner, {kind:'scenario',templateKey:'scenario',title:'Vòng lặp',config:{startSceneId:'s1',scenes:[{id:'s1',choices:[{id:'c1',label:'Lặp',nextSceneId:'s1'}]}]}})).rejects.toMatchObject({code:'INVALID_SCENARIO_GRAPH'});

    // Valid scenario creation succeeds
    const validScenarioRes = await fetch(`${appUrl}/api/v1/teacher/activities`, {
      method: 'POST',
      headers: { Cookie: teacherACookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'scenario',
        templateKey: 'scenario',
        title: 'Bảo vệ tổ rùa biển',
        visibility: 'published',
        topicSlugs: ['conservation'],
        config: {
          templateKey: 'scenario',
          startSceneId: 's1',
          scenes: [
            {
              id: 's1',
              title: '1. Thấy tổ trứng rùa trên cát',
              narrationText: 'Bé thấy tổ trứng rùa trên bãi cát, bé làm gì?',
              choices: [
                {
                  id: 'c1',
                  label: 'Báo cho cô giáo và giữ khoảng cách an toàn',
                  nextSceneId: 's2',
                  feedbackText: 'Đúng rồi! Rùa con sẽ nở an toàn.',
                  isCorrect: true,
                },
              ],
            },
            {
              id: 's2',
              title: '2. Rùa con nở ra biển',
              narrationText: 'Các bạn rùa con khỏe mạnh bò ra biển xanh!',
              isEnd: true,
              choices: [],
            },
          ],
        },
      }),
    });
    expect(validScenarioRes.status).toBe(403);
    expect((await validScenarioRes.json()).code).toBe('INTERACTIVE_CONTENT_READ_ONLY');

    // Creative templates & materials list and create
    const tplRes = await fetch(`${appUrl}/api/v1/creative-templates`);
    expect(tplRes.status).toBe(200);
    const tplPage = await tplRes.json();
    expect(tplPage.items.length).toBeGreaterThanOrEqual(4);

    const createTplRes = await fetch(`${appUrl}/api/v1/teacher/creative-templates`, {
      method: 'POST',
      headers: { Cookie: teacherACookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'drawing',
        title: 'Tô màu Cá heo vui nhộn',
        visibility: 'published',
        topicSlugs: ['species'],
        payload: { svgTemplate: 'dolphin', instructionText: 'Tô màu bạn cá heo xanh.' },
      }),
    });
    expect(createTplRes.status).toBe(201);

    const createMatRes = await fetch(`${appUrl}/api/v1/teacher/creative-materials`, {
      method: 'POST',
      headers: { Cookie: teacherACookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'stamp',
        title: 'Tem hình Cá heo',
        visibility: 'published',
        payload: { stampId: 'dolphin', defaultScale: 1 },
      }),
    });
    expect(createMatRes.status).toBe(201);
  });
});
