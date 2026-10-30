import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';

const ADVISORY_LOCK_KEY = 80102026;

function sha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export async function runMigrations(
  pool: pg.Pool,
  migrationsDir?: string,
): Promise<{ applied: string[]; skipped: string[] }> {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidateDirs = [
    migrationsDir,
    path.join(currentDir, 'migrations'),
    path.resolve(currentDir, '../../src/database/migrations'),
    path.resolve(process.cwd(), 'server/src/database/migrations'),
    path.resolve(process.cwd(), 'src/database/migrations'),
  ].filter((d): d is string => Boolean(d));
  const resolvedDir =
    candidateDirs.find((d) => fs.existsSync(d)) || path.join(currentDir, 'migrations');

  const client = await pool.connect();
  const applied: string[] = [];
  const skipped: string[] = [];

  try {
    await client.query('SELECT pg_advisory_lock($1)', [ADVISORY_LOCK_KEY]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const files = fs
      .readdirSync(resolvedDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const filename of files) {
      const fullPath = path.join(resolvedDir, filename);
      const sql = fs.readFileSync(fullPath, 'utf8');
      const checksum = sha256(sql);

      const existing = await client.query(
        'SELECT checksum FROM schema_migrations WHERE filename = $1',
        [filename],
      );

      if (existing.rowCount && existing.rowCount > 0) {
        const recordedChecksum = existing.rows[0].checksum;
        if (recordedChecksum !== checksum) {
          throw new Error(
            `Migration checksum mismatch for ${filename}: expected ${recordedChecksum}, got ${checksum}`,
          );
        }
        skipped.push(filename);
        continue;
      }

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
          [filename, checksum],
        );
        await client.query('COMMIT');
        applied.push(filename);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    return { applied, skipped };
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK_KEY]);
    } catch {
      // ignore unlock error on disconnect
    }
    client.release();
  }
}
