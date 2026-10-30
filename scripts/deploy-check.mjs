import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CORS_ORIGINS',
  'MEDIA_STORAGE_DIR',
  'SEED_TEACHER_PASSWORD',
];

const rootDir = process.cwd();
const envExamplePath = path.join(rootDir, 'deploy', 'environment.example');

if (!fs.existsSync(envExamplePath)) {
  console.error('[deploy-check] Missing deploy/environment.example');
  process.exit(1);
}

const exampleText = fs.readFileSync(envExamplePath, 'utf8');
for (const key of REQUIRED_VARS) {
  if (!exampleText.includes(`${key}=`)) {
    console.error(`[deploy-check] deploy/environment.example missing key: ${key}`);
    process.exit(1);
  }
}

const serverDockerfile = fs.readFileSync(path.join(rootDir, 'server', 'Dockerfile'), 'utf8');
if (serverDockerfile.includes('tsx src/main.ts') || !serverDockerfile.includes('server/dist/main.js')) {
  console.error('[deploy-check] server/Dockerfile must run compiled server/dist/main.js in production');
  process.exit(1);
}

const nginxConf = fs.readFileSync(path.join(rootDir, 'deploy', 'nginx.conf'), 'utf8');
if (!nginxConf.includes('client_max_body_size 210m')) {
  console.error('[deploy-check] deploy/nginx.conf must configure client_max_body_size 210m');
  process.exit(1);
}

if (process.argv.includes('--live')) {
  const requiredContainers = ['bluesteam_db', 'bluesteam_backend', 'bluesteam_frontend'];
  for (const name of requiredContainers) {
    const state = execSync(`docker inspect -f "{{.State.Running}}" ${name}`, {
      encoding: 'utf8',
    }).trim();
    if (state !== 'true') {
      console.error(`[deploy-check] Container ${name} is not running (state=${state})`);
      process.exit(1);
    }
  }

  const checkUrl = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }
  };

  await checkUrl('http://127.0.0.1:8010/api/v1/health/ready');
  await checkUrl('http://127.0.0.1:3010/api/v1/health/ready');
  console.log('[deploy-check] PASS: Live 3-container Docker stack (bluesteam_db, bluesteam_backend, bluesteam_frontend) healthy on 8010 & 3010.');
} else {
  console.log('[deploy-check] PASS: Static deployment contracts verified.');
}
