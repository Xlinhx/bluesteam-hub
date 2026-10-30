import { createDatabasePool } from './pool.js';
import { runMigrations } from './migrate.js';

async function main() {
  const pool = createDatabasePool();
  try {
    const result = await runMigrations(pool);
    console.log(
      JSON.stringify({
        status: 'ok',
        applied: result.applied,
        skipped: result.skipped,
      }),
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
