import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const backupDir = path.resolve(process.env.BACKUP_OUT_DIR || path.join(process.cwd(), 'backups'));
fs.mkdirSync(backupDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const sqlOutPath = path.join(backupDir, `bluesteam-db-${timestamp}.sql`);
const mediaArchivePath = path.join(backupDir, `bluesteam-media-${timestamp}.tar.gz`);
const manifestPath = path.join(backupDir, `bluesteam-backup-${timestamp}.manifest.json`);

const dbContainer = process.env.POSTGRES_CONTAINER || 'bluesteam_db';
const backendContainer = process.env.BACKEND_CONTAINER || 'bluesteam_backend';
const dbUser = process.env.POSTGRES_USER || 'bluesteam';
const dbName = process.env.POSTGRES_DB || 'bluesteam';
const localMediaDir =
  process.env.MEDIA_STORAGE_DIR ||
  process.env.UPLOAD_DIR ||
  path.resolve(process.cwd(), 'storage', 'media');

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function isContainerRunning(containerName) {
  try {
    const out = execSync(
      `docker inspect -f "{{.State.Running}}" ${containerName}`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
    ).trim();
    return out === 'true';
  } catch {
    return false;
  }
}

console.log(`[backup] 1. Dumping PostgreSQL database "${dbName}" from container "${dbContainer}"...`);
const sqlDump = execSync(
  `docker exec ${dbContainer} pg_dump -U ${dbUser} -d ${dbName} --clean --if-exists --no-owner`,
  { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 },
);
fs.writeFileSync(sqlOutPath, sqlDump, 'utf8');
console.log(`[backup] Saved SQL dump (${Buffer.byteLength(sqlDump)} bytes) to ${sqlOutPath}`);

let mediaSource = 'none';
if (isContainerRunning(backendContainer)) {
  console.log(
    `[backup] 2. Archiving media directory (/data/uploads) from container "${backendContainer}"...`,
  );
  const tarBuf = execSync(
    `docker exec ${backendContainer} tar -czf - -C /data/uploads .`,
    { maxBuffer: 500 * 1024 * 1024 },
  );
  fs.writeFileSync(mediaArchivePath, tarBuf);
  mediaSource = `container:${backendContainer}:/data/uploads`;
} else if (fs.existsSync(localMediaDir)) {
  console.log(`[backup] 2. Archiving local media directory "${localMediaDir}"...`);
  execSync(`tar -czf "${mediaArchivePath}" -C "${localMediaDir}" .`, {
    stdio: 'pipe',
  });
  mediaSource = `host:${localMediaDir}`;
} else {
  fs.mkdirSync(localMediaDir, { recursive: true });
  execSync(`tar -czf "${mediaArchivePath}" -C "${localMediaDir}" .`, {
    stdio: 'pipe',
  });
  mediaSource = `host-empty:${localMediaDir}`;
}

const mediaBytes = fs.statSync(mediaArchivePath).size;
console.log(`[backup] Saved media archive (${mediaBytes} bytes) to ${mediaArchivePath}`);

const manifest = {
  createdAt: new Date().toISOString(),
  database: {
    container: dbContainer,
    dbName,
    sqlFile: path.basename(sqlOutPath),
    byteSize: fs.statSync(sqlOutPath).size,
    sha256: sha256File(sqlOutPath),
  },
  media: {
    source: mediaSource,
    archiveFile: path.basename(mediaArchivePath),
    byteSize: mediaBytes,
    sha256: sha256File(mediaArchivePath),
  },
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`[backup] Saved backup manifest to ${manifestPath}`);
