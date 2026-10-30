import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { createDatabasePool, assertTestDatabaseUrl } from '../src/database/pool';
import { runMigrations } from '../src/database/migrate';
import { importSeed } from '../src/database/seeds/import-seed';
import { createServerApp } from '../src/bootstrap';
import { AuthService } from '../src/auth/auth.service';

const url = process.env.TEST_DATABASE_URL || 'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_test';
describe('Standalone artwork ownership after retiring rooms', () => {
  const pool = createDatabasePool(url);
  let api = '', owner = '', other = '', close: (() => Promise<void>) | undefined;
  beforeAll(async () => {
    assertTestDatabaseUrl(url);
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public');
    await runMigrations(pool);
    const options = { mode: 'demo' as const, dbClient: pool, archiveDir: path.resolve('../server/seed-data') };
    await importSeed(options);
    const before = await pool.query('SELECT id,owner_id,author_name,scene_payload FROM artworks ORDER BY id');
    await importSeed(options);
    expect((await pool.query('SELECT id,owner_id,author_name,scene_payload FROM artworks ORDER BY id')).rows).toEqual(before.rows);
    const started = await createServerApp({ databaseUrl: url, port: 0 });
    close = started.close; api = started.url + '/api/v1';
    await started.app.get(AuthService).upsertTeacherAccount({ email: 'other@test.local', password: 'Testing123!', displayName: 'Cô khác' });
    const login = async (email: string, password: string) => {
      const res = await fetch(api + '/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({email,password}) });
      expect(res.status).toBe(200); return res.headers.get('set-cookie')!.split(';')[0];
    };
    owner = await login('colinh@bluesteam.edu.vn', 'daiduong2026');
    other = await login('other@test.local', 'Testing123!');
  });
  afterAll(async () => { await close?.(); await pool.end(); });
  it('has no room tables or endpoints while keeping seeded artwork and author identity', async () => {
    expect((await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND (tablename LIKE 'room%' OR tablename IN ('point_events','display_sessions','round_submissions'))")).rows).toEqual([]);
    for (const route of ['/teacher/rooms','/rooms/123/snapshot','/rooms/join']) expect((await fetch(api + route, {headers:{cookie:owner}})).status).toBe(404);
    const res = await fetch(api + '/teacher/artworks?limit=100', {headers:{cookie:owner}});
    expect(res.status).toBe(200); const body = await res.json();
    expect(body.items.length).toBeGreaterThanOrEqual(7);
    expect(body.items[0].participantAlias).toBeTruthy();
    expect(body.items[0]).not.toHaveProperty('roomId');
  });
  it('preserves private notes and prevents another teacher or anonymous visitor from reading them', async () => {
    const {items} = await (await fetch(api + '/teacher/artworks', {headers:{cookie:owner}})).json();
    const route = api + '/teacher/artworks/' + items[0].id;
    expect((await fetch(route)).status).toBe(401);
    expect((await fetch(route, {headers:{cookie:other}})).status).toBe(403);
    const note = 'Ghi chú riêng được giữ sau khi bỏ phòng';
    expect((await fetch(route + '/note', {method:'PUT',headers:{cookie:owner,'content-type':'application/json'},body:JSON.stringify({note})})).status).toBe(200);
    expect((await (await fetch(route, {headers:{cookie:owner}})).json()).item.teacherNote).toBe(note);
    expect((await fetch(route + '/download', {headers:{cookie:other}})).status).toBe(403);
    expect((await fetch(route + '/note', {method:'PUT',headers:{cookie:other,'content-type':'application/json'},body:JSON.stringify({note:'x'})})).status).toBe(403);
  });
});
