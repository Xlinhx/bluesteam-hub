import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const backupDir = path.resolve(process.env.BACKUP_OUT_DIR || path.join(process.cwd(), 'backups'));
const manifestArg = process.argv[2] || process.env.BACKUP_MANIFEST;

function findLatestManifest() {
  if (manifestArg) {
    return path.resolve(manifestArg);
  }
  if (!fs.existsSync(backupDir)) {
    throw new Error(`Backup directory does not exist: ${backupDir}`);
  }
  const manifests = fs
    .readdirSync(backupDir)
    .filter((f) => f.endsWith('.manifest.json'))
    .sort();
  if (manifests.length === 0) {
    throw new Error(`No backup manifest found in ${backupDir}`);
  }
  return path.join(backupDir, manifests[manifests.length - 1]);
}

const manifestPath = findLatestManifest();
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const baseDir = path.dirname(manifestPath);

const sqlPath = path.join(baseDir, manifest.database.sqlFile);
const mediaArchivePath = path.join(baseDir, manifest.media.archiveFile);

const dbContainer = process.env.POSTGRES_CONTAINER || 'bluesteam_db';
const backendContainer = process.env.BACKEND_CONTAINER || 'bluesteam_backend';
const dbUser = process.env.POSTGRES_USER || 'bluesteam';
const targetDb = process.env.RESTORE_TARGET_DB || process.env.POSTGRES_DB || 'bluesteam';
const targetMediaDir = process.env.RESTORE_TARGET_MEDIA_DIR || '';

console.log(`[restore] Restoring SQL dump ${sqlPath} into database "${targetDb}"...`);
const sqlDump = fs.readFileSync(sqlPath, 'utf8');
execSync(`docker exec -i ${dbContainer} psql -U ${dbUser} -d ${targetDb}`, {
  input: sqlDump,
  stdio: ['pipe', 'pipe', 'pipe'],
  maxBuffer: 100 * 1024 * 1024,
});

if (targetMediaDir) {
  const resolvedMediaDir = path.resolve(targetMediaDir);
  fs.mkdirSync(resolvedMediaDir, { recursive: true });
  console.log(`[restore] Extracting media archive ${mediaArchivePath} into "${resolvedMediaDir}"...`);
  execSync(`tar -xzf "${mediaArchivePath}" -C "${resolvedMediaDir}"`, { stdio: 'pipe' });
} else {
  try {
    const running = execSync(
      `docker inspect -f "{{.State.Running}}" ${backendContainer}`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
    ).trim();
    if (running === 'true') {
      console.log(
        `[restore] Extracting media archive ${mediaArchivePath} into container "${backendContainer}:/data/uploads"...`,
      );
      const archiveBuf = fs.readFileSync(mediaArchivePath);
      execSync(`docker exec -i ${backendContainer} tar -xzf - -C /data/uploads`, {
        input: archiveBuf,
        stdio: ['pipe', 'pipe', 'pipe'],
        maxBuffer: 500 * 1024 * 1024,
      });
    }
  } catch {
    const fallbackDir = path.resolve(process.cwd(), 'storage', 'media');
    fs.mkdirSync(fallbackDir, { recursive: true });
    console.log(`[restore] Extracting media archive into local fallback "${fallbackDir}"...`);
    execSync(`tar -xzf "${mediaArchivePath}" -C "${fallbackDir}"`, { stdio: 'pipe' });
  }
}

console.log('[restore] Complete.');
