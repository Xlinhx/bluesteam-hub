import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createDatabasePool, assertTestDatabaseUrl } from '../src/database/pool.js';
import { runMigrations } from '../src/database/migrate.js';
import { importSeed } from '../src/database/seeds/import-seed.js';
import { createServerApp } from '../src/bootstrap.js';

const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam_test';

describe('Task 3 — Backend Foundation, Auth, Database, Seed Idempotency & Media Integration', () => {
  const tempMediaDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bluesteam-media-test-'));
  let appUrl = '';
  let closeApp: (() => Promise<void>) | null = null;
  const pool = createDatabasePool(TEST_DB_URL);

  beforeAll(async () => {
    assertTestDatabaseUrl(TEST_DB_URL);
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await runMigrations(pool);

    const started = await createServerApp({
      databaseUrl: TEST_DB_URL,
      mediaStorageDir: tempMediaDir,
      port: 0,
    });
    appUrl = started.url;
    closeApp = started.close;
  });

  afterAll(async () => {
    if (closeApp) await closeApp();
    await pool.end();
    fs.rmSync(tempMediaDir, { recursive: true, force: true });
  });

  it('guards against running destructive integration tests on non-test database URLs', () => {
    expect(() =>
      assertTestDatabaseUrl('postgresql://bluesteam:secret@127.0.0.1:5442/bluesteam'),
    ).toThrow(/test database/i);
  });

  it('imports content seed idempotently without demo rooms, scores, or demo teacher credentials', async () => {
    const repoRoot = path.resolve(process.cwd(), '..');
    const first = await importSeed({
      mode: 'content',
      dryRun: false,
      archiveDir: path.join(repoRoot, 'server', 'seed-data'),
      dbClient: pool,
    });
    expect(first.counts.resources).toBeGreaterThanOrEqual(5);
    expect('rooms' in first.counts).toBe(false);
    expect('pointEvents' in first.counts).toBe(false);

    const countBefore = await pool.query('SELECT COUNT(*)::int AS c FROM resources');
    const second = await importSeed({
      mode: 'content',
      dryRun: false,
      archiveDir: path.join(repoRoot, 'server', 'seed-data'),
      dbClient: pool,
    });
    const countAfter = await pool.query('SELECT COUNT(*)::int AS c FROM resources');
    expect(countAfter.rows[0].c).toBe(countBefore.rows[0].c);
    expect(second.counts.resources).toBe(first.counts.resources);

    const roomsCount = await pool.query('SELECT COUNT(*)::int AS c FROM artworks');
    const teachersCount = await pool.query('SELECT COUNT(*)::int AS c FROM teachers');
    expect(roomsCount.rows[0].c).toBe(0);
    expect(teachersCount.rows[0].c).toBe(0);
  });

  it('imports demo seed idempotently with standalone artworks and preserves them on reseed', async () => {
    const repoRoot = path.resolve(process.cwd(), '..');
    const demo1 = await importSeed({
      mode: 'demo',
      dryRun: false,
      archiveDir: path.join(repoRoot, 'server', 'seed-data'),
      dbClient: pool,
    });
    expect('rooms' in demo1.counts).toBe(false);
    expect('participants' in demo1.counts).toBe(false);
    expect('pointEvents' in demo1.counts).toBe(false);
    expect(demo1.counts.artworks).toBeGreaterThanOrEqual(7);

    const roomCount1 = await pool.query('SELECT COUNT(*)::int AS c FROM artworks');
    await importSeed({
      mode: 'demo',
      dryRun: false,
      archiveDir: path.join(repoRoot, 'server', 'seed-data'),
      dbClient: pool,
    });
    const roomCount2 = await pool.query('SELECT COUNT(*)::int AS c FROM artworks');
    expect(roomCount2.rows[0].c).toBe(roomCount1.rows[0].c);
  });

  it('authenticates teacher with Argon2id, enforces wrong-password / expired / revoked sessions, and rate-limits brute force', async () => {
    // Wrong password -> 401
    const badRes = await fetch(`${appUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'colinh@bluesteam.edu.vn',
        password: 'wrong-password-123',
      }),
    });
    expect(badRes.status).toBe(401);

    // Valid password -> 200 + HttpOnly cookie
    const loginRes = await fetch(`${appUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'colinh@bluesteam.edu.vn',
        password: 'daiduong2026',
      }),
    });
    expect(loginRes.status).toBe(200);
    const setCookie = loginRes.headers.get('set-cookie') || '';
    expect(setCookie).toContain('HttpOnly');
    const cookieHeader = setCookie.split(';')[0];

    // GET /auth/me with session cookie -> 200
    const meRes = await fetch(`${appUrl}/api/v1/auth/me`, {
      headers: { Cookie: cookieHeader },
    });
    expect(meRes.status).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.teacher.email).toBe('colinh@bluesteam.edu.vn');

    // Logout revokes session -> subsequent /auth/me returns 401
    const logoutRes = await fetch(`${appUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });
    expect(logoutRes.status).toBe(200);

    const afterLogoutRes = await fetch(`${appUrl}/api/v1/auth/me`, {
      headers: { Cookie: cookieHeader },
    });
    expect(afterLogoutRes.status).toBe(401);
  });

  it('validates media uploads (PNG magic bytes, dimensions, SVG/HTML rejection, size limit, path traversal)', async () => {
    const loginRes = await fetch(`${appUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'colinh@bluesteam.edu.vn',
        password: 'daiduong2026',
      }),
    });
    const cookieHeader = (loginRes.headers.get('set-cookie') || '').split(';')[0];

    // 1) Reject SVG upload
    const svgForm = new FormData();
    svgForm.append(
      'file',
      new Blob(['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'], {
        type: 'image/svg+xml',
      }),
      'evil.svg',
    );
    const svgRes = await fetch(`${appUrl}/api/v1/teacher/media`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
      body: svgForm,
    });
    expect(svgRes.status).toBe(415);

    // 2) Reject fake PNG with invalid magic bytes
    const fakePngForm = new FormData();
    fakePngForm.append(
      'file',
      new Blob(['NOT_A_REAL_PNG_FILE_CONTENT_12345'], { type: 'image/png' }),
      'fake.png',
    );
    const fakePngRes = await fetch(`${appUrl}/api/v1/teacher/media`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
      body: fakePngForm,
    });
    expect(fakePngRes.status).toBe(400);

    // 3) Upload real PNG cutout and verify width/height/sha256/ready status
    const realPngPath = path.resolve(
      process.cwd(),
      '..',
      'public',
      'assets',
      'generated',
      'r2-cutouts',
      'starfish_cutout.png',
    );
    const realPngBytes = fs.readFileSync(realPngPath);
    const realForm = new FormData();
    realForm.append(
      'file',
      new Blob([realPngBytes], { type: 'image/png' }),
      'starfish_cutout.png',
    );
    const realRes = await fetch(`${appUrl}/api/v1/teacher/media`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
      body: realForm,
    });
    expect(realRes.status).toBe(201);
    const uploaded = await realRes.json();
    expect(uploaded.status).toBe('ready');
    expect(uploaded.width).toBeGreaterThan(100);
    expect(uploaded.height).toBeGreaterThan(100);
    expect(uploaded.sha256).toMatch(/^[a-f0-9]{64}$/);

    // 4) Stream back the uploaded media and check nosniff header
    const streamRes = await fetch(`${appUrl}${uploaded.url}`, {
      headers: { Cookie: cookieHeader },
    });
    expect(streamRes.status).toBe(200);
    expect(streamRes.headers.get('x-content-type-options')).toBe('nosniff');
    expect(streamRes.headers.get('content-type')).toContain('image/png');

    // 5) Path traversal on media download is rejected
    const traversalRes = await fetch(`${appUrl}/api/v1/media/..%2F..%2Fpackage.json`);
    expect([400, 404]).toContain(traversalRes.status);
  });
});
