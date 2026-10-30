const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8010/api/v1';
const WEB_BASE = process.env.WEB_BASE_URL || 'http://127.0.0.1:3010';

async function checkJson(url, label) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${label} failed with HTTP ${res.status}`);
  }
  const body = await res.json();
  console.log(`[release-smoke] PASS ${label}: HTTP ${res.status}`);
  return body;
}

async function main() {
  await checkJson(`${API_BASE}/health/live`, 'API Liveness (/api/v1/health/live)');
  const readiness = await checkJson(`${API_BASE}/health/ready`, 'API Readiness (/api/v1/health/ready)');
  if (readiness?.checks?.database !== 'up' || readiness?.checks?.mediaStorage !== 'writable') {
    throw new Error('Expected a connected database and writable media storage');
  }
  const topics = await checkJson(`${API_BASE}/topics`, 'Topics Catalog (/api/v1/topics)');
  if (!Array.isArray(topics?.items) || topics.items.length < 3) {
    throw new Error('Expected at least 3 canonical topics in /api/v1/topics');
  }
  const resources = await checkJson(`${API_BASE}/resources`, 'Resources Catalog (/api/v1/resources)');
  if (!Array.isArray(resources?.items) || resources.items.length === 0) {
    throw new Error('Expected published resources in /api/v1/resources');
  }

  const webRes = await fetch(`${WEB_BASE}/home`);
  if (!webRes.ok) {
    throw new Error(`Web /home failed with HTTP ${webRes.status}`);
  }
  console.log(`[release-smoke] PASS Web Frontend (/home): HTTP ${webRes.status}`);
  console.log('[release-smoke] ALL CHECKS PASSED.');
}

main().catch((err) => {
  console.error('[release-smoke] FAILED:', err.message);
  process.exit(1);
});
