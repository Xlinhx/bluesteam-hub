import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDatabasePool } from '../pool.js';
import { importSeed } from './import-seed.js';

async function main() {
  const args = process.argv.slice(2);
  const modeArg = args.find((a) => a.startsWith('--mode='))?.split('=')[1];
  const mode = modeArg === 'demo' ? 'demo' : 'content';
  const dryRun = args.includes('--dry-run');

  if (mode === 'demo' && process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run demo seed in production environment.');
  }

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(currentDir, '../../../..');
  const archiveDir = path.join(repoRoot, 'server', 'seed-data');

  if (dryRun) {
    const result = await importSeed({ mode, dryRun: true, archiveDir });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const pool = createDatabasePool();
  try {
    const result = await importSeed({
      mode,
      dryRun: false,
      archiveDir,
      dbClient: pool,
    });
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Seed import failed:', err);
  process.exit(1);
});
