import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDatabasePool, assertTestDatabaseUrl } from '../src/database/pool.js';
import { runMigrations } from '../src/database/migrate.js';
import { createServerApp } from '../src/bootstrap.js';
import { hash } from '@node-rs/argon2';

const databaseUrl = 'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_accounts_test';
describe('Registration and role-separated sessions', () => {
  const pool = createDatabasePool(databaseUrl);
  let api = '', close: (() => Promise<void>) | undefined;
  const email = `parent-${Date.now()}@example.test`;
  const password = 'Ocean-test-123';
  const post = (path: string, body: unknown, cookie = '') => fetch(`${api}/api/v1/auth/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(body),
  });
  const me = (cookie: string) => fetch(`${api}/api/v1/auth/session`, { headers: { Cookie: cookie } });
  const cookieOf = (response: Response) => (response.headers.get('set-cookie') || '').split(';')[0];
  beforeAll(async () => {
    assertTestDatabaseUrl(databaseUrl);
    const admin = createDatabasePool(databaseUrl.replace(/\/[^/]+$/, '/postgres'));
    try {
      if (!(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', ['bluesteam_accounts_test'])).rowCount)
        await admin.query('CREATE DATABASE bluesteam_accounts_test');
    } finally { await admin.end(); }
    await runMigrations(pool);
    const started = await createServerApp({ databaseUrl, port: 0 });
    api = started.url; close = started.close;
  });
  afterAll(async () => { await close?.(); await pool.end(); });

  it('logs test aliases into real seeded accounts, checks passwords and preserves role separation', async () => {
    for (const [role, alias, table] of [['teacher', 'giaovien', 'teachers'], ['student', 'hocsinh', 'learners']]) {
      await pool.query(`INSERT INTO ${table}(email,password_hash,display_name) VALUES($1,$2,$3)
        ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash`,
        [`${alias}@bluesteam.local`, await hash(alias), alias]);
      const login = await post('login', { role, email: alias, password: alias });
      expect(login.status).toBe(200);
      expect((await login.json()).account).toMatchObject({ role, email: `${alias}@bluesteam.local` });
      expect((await me(cookieOf(login))).status).toBe(200);
      expect((await post('login', { role, email: alias, password: 'wrong-password' })).status).toBe(401);
      expect((await post('login', { role: role === 'teacher' ? 'student' : 'teacher', email: alias, password: alias })).status).toBe(401);
      expect((await post('register', { role, email: alias, password: 'Valid-pass-123', displayName: 'Test' })).status).toBe(400);
    }
    expect((await post('login', { role: 'teacher', email: 'arbitrary', password: 'arbitrary' })).status).toBe(400);
  });

  it('registers both roles with the same email, hashes passwords, and restores the right identity', async () => {
    for (const role of ['teacher', 'student']) {
      const response = await post('register', { role, email: ` ${email.toUpperCase()} `, password, displayName: role === 'teacher' ? 'Thầy Minh' : 'Bé Na' });
      expect(response.status).toBe(201);
      expect(response.headers.get('set-cookie')).toContain('HttpOnly');
      const body = await response.json();
      expect(body.account).toMatchObject({ role, email });
      expect(body.account).not.toHaveProperty('password');
      const restored = await me(cookieOf(response));
      expect(restored.status).toBe(200);
      expect((await restored.json()).account).toEqual(body.account);
      const table = role === 'teacher' ? 'teachers' : 'learners';
      const stored = await pool.query(`SELECT password_hash FROM ${table} WHERE email=$1`, [email]);
      expect(stored.rows[0].password_hash).toMatch(/^\$argon2/);
    }
  });
  it('rejects duplicate registration without overwriting the existing password or name', async () => {
    const duplicate = await post('register', { role: 'student', email, password: 'Different-123', displayName: 'Khác' });
    expect(duplicate.status).toBe(409);
    const login = await post('login', { role: 'student', email, password });
    expect(login.status).toBe(200);
    expect((await login.json()).account.displayName).toBe('Bé Na');
  });
  it('rejects malformed registration and wrong passwords', async () => {
    for (const override of [{ email: 'bad' }, { password: '123' }, { displayName: ' ' }, { role: 'admin' }]) {
      expect((await post('register', { role: 'student', email, password, displayName: 'Bé Na', ...override })).status).toBe(400);
    }
    expect((await post('login', { role: 'student', email, password: 'Wrong-123' })).status).toBe(401);
  });
  it('does not treat a learner session as a teacher, and revokes it on logout', async () => {
    const login = await post('login', { role: 'student', email, password });
    expect(login.status).toBe(200);
    const cookie = cookieOf(login);
    expect((await fetch(`${api}/api/v1/auth/me`, { headers: { Cookie: cookie } })).status).toBe(401);
    expect((await post('logout', {}, cookie)).status).toBe(200);
    expect((await me(cookie)).status).toBe(401);
  });
  it('rejects expired learner sessions and does not authenticate a missing role as a learner', async () => {
    const login = await post('login', { role: 'student', email, password });
    const cookie = cookieOf(login);
    await pool.query("UPDATE auth_sessions SET expires_at=NOW()-INTERVAL '1 minute' WHERE learner_id IN (SELECT id FROM learners WHERE email=$1)", [email]);
    expect((await me(cookie)).status).toBe(401);
    const onlyChildEmail = `only-child-${Date.now()}@example.test`;
    await post('register', { role: 'student', email: onlyChildEmail, password, displayName: 'Bé' });
    expect((await post('login', { email: onlyChildEmail, password })).status).toBe(401);
  });
});
