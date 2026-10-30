import { createServerApp } from './bootstrap.js';
import { createDatabasePool } from './database/pool.js';
import { runMigrations } from './database/migrate.js';

async function main() {
  const pool = createDatabasePool();
  try {
    await runMigrations(pool);
  } finally {
    await pool.end();
  }

  const port = Number(process.env.PORT || process.env.API_PORT || 8010);
  const host = process.env.HOST || '0.0.0.0';
  const server = await createServerApp({ port, host });
  console.log(`[bluesteam-api] Listening on http://${host}:${server.port}`);
}

main().catch((err) => {
  console.error('[bluesteam-api] Failed to start:', err);
  process.exit(1);
});
