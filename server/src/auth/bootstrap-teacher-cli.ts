import { createDatabasePool } from '../database/pool.js';
import { runMigrations } from '../database/migrate.js';
import { hashSync } from '@node-rs/argon2';

async function main() {
  const email = (process.env.BOOTSTRAP_TEACHER_EMAIL || '').trim().toLowerCase();
  const password = process.env.BOOTSTRAP_TEACHER_PASSWORD || '';
  const displayName = (process.env.BOOTSTRAP_TEACHER_NAME || 'Giáo viên BlueSTEAM').trim();

  if (!email || !password || password.length < 8) {
    console.error(
      'Usage: BOOTSTRAP_TEACHER_EMAIL=... BOOTSTRAP_TEACHER_PASSWORD=... (min 8 chars) [BOOTSTRAP_TEACHER_NAME=...] npm --workspace @bluesteam/server run bootstrap:teacher',
    );
    process.exit(1);
  }

  const pool = createDatabasePool();
  try {
    await runMigrations(pool);
    const passwordHash = hashSync(password);
    const res = await pool.query(
      `INSERT INTO teachers (email, password_hash, display_name, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         display_name = EXCLUDED.display_name,
         status = 'active',
         updated_at = NOW()
       RETURNING id, email, display_name`,
      [email, passwordHash, displayName],
    );
    console.log('[bootstrap:teacher] Upserted teacher account:', res.rows[0]);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[bootstrap:teacher] Failed:', err);
  process.exit(1);
});
