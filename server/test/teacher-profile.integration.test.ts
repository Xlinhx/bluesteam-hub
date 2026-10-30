import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServerApp } from '../src/bootstrap';
import { createDatabasePool, assertTestDatabaseUrl } from '../src/database/pool';
import { runMigrations } from '../src/database/migrate';
import { AuthService } from '../src/auth/auth.service';

const url = process.env.TEST_DATABASE_URL || 'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_profile_room_test';
describe('Persistent account identity and full room pagination', () => {
  const pool = createDatabasePool(url);
  let api = '', cookie = '', teacherId = '';
  let close: (() => Promise<void>) | undefined;
  beforeAll(async () => {
    assertTestDatabaseUrl(url);
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await runMigrations(pool);
    const started = await createServerApp({ databaseUrl: url, port: 0 });
    close = started.close; api = `${started.url}/api/v1`;
    const auth = started.app.get(AuthService);
    await auth.upsertTeacherAccount({ email: 'profile@test.local', password: 'Testing123!', displayName: 'Cô Linh' });
    const login = await fetch(`${api}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'profile@test.local', password: 'Testing123!' }) });
    expect(login.status).toBe(200); cookie = login.headers.get('set-cookie')!.split(';')[0]; teacherId = (await login.json()).teacher.id;
  });
  afterAll(async () => { await close?.(); await pool.end(); });
  it('persists names and presets, rejects foreign media, and requires a signed-in teacher', async () => {
    const patch = async (body: unknown, authenticated = true) => fetch(`${api}/auth/me`, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(authenticated ? { cookie } : {}) }, body: JSON.stringify(body) });
    const body = { displayName: 'Cô Hải', avatarKey: 'octopus', avatarMediaId: null };
    expect((await patch(body, false)).status).toBe(401);
    const saved = await patch(body); expect(saved.status).toBe(200);
    const me = await fetch(`${api}/auth/me`, { headers: { cookie } });
    expect((await me.json()).teacher).toMatchObject({ displayName: 'Cô Hải', avatarKey: 'octopus', avatarMediaId: null });
    expect((await patch({ ...body, avatarKey: null, avatarMediaId: '11111111-1111-4111-8111-111111111111' })).status).toBe(400);
    expect((await patch({ ...body, displayName: '   ' })).status).toBe(400);
    expect((await patch({ ...body, avatarKey: null })).status).toBe(200);
  });

});
