import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { importSeed } from '../server/src/database/seeds/import-seed';

const ROOT_DIR = process.cwd();
const ARCHIVE_DIR = path.join(ROOT_DIR, 'server', 'seed-data');
const MANIFEST_PATH = path.join(ARCHIVE_DIR, 'source-manifest.json');
const DATA_PATH = path.join(ARCHIVE_DIR, 'data.json');
const README_PATH = path.join(ARCHIVE_DIR, 'README.md');

function sha256File(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

describe('Task 1 — Seed Archive & Traceable Importer', () => {
  it('creates archive README, source-manifest.json, data.json, and raw source copies', () => {
    expect(fs.existsSync(README_PATH)).toBe(true);
    expect(fs.existsSync(MANIFEST_PATH)).toBe(true);
    expect(fs.existsSync(DATA_PATH)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    expect(Array.isArray(manifest.sources)).toBe(true);
    expect(manifest.sources.length).toBeGreaterThanOrEqual(14);

    for (const src of manifest.sources) {
      const archivedFile = path.join(ARCHIVE_DIR, 'sources', src.archivePath);
      expect(fs.existsSync(archivedFile), `Missing archived source: ${src.archivePath}`).toBe(true);
      expect(sha256File(archivedFile)).toBe(src.sha256);
      expect(src.bytes).toBeGreaterThan(0);
      expect(Array.isArray(src.exports)).toBe(true);
      expect(Array.isArray(src.entityIds)).toBe(true);
    }
  });

  it('classifies reusable content, demo fixtures, retired curriculum, and fake learning results', () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

    expect(manifest.summary.totalSources).toBe(manifest.sources.length);
    expect(Array.isArray(data.reusableContent.topics)).toBe(true);
    expect(Array.isArray(data.reusableContent.resources)).toBe(true);
    expect(Array.isArray(data.reusableContent.activities)).toBe(true);
    expect(Array.isArray(data.reusableContent.models3d)).toBe(true);
    expect(Array.isArray(data.reusableContent.creativeTemplates)).toBe(true);
    expect(Array.isArray(data.reusableContent.creativeMaterials)).toBe(true);

    expect(Array.isArray(data.retiredCurriculum.units)).toBe(true);
    expect(Array.isArray(data.retiredCurriculum.lessons)).toBe(true);
    expect(Array.isArray(data.retiredCurriculum.classes)).toBe(true);
    expect(Array.isArray(data.fakeLearningResults.sessionStudents)).toBe(true);
    expect(data.fakeLearningResults.sessionStudents.length).toBeGreaterThan(0);
  });

  it('verifies all public assets referenced in reusable content exist on disk and excludes dirty crops', () => {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    const forbiddenAssets = ['s1_turtle_clean.png', 's4_three_sheets_clean.png'];

    const checkAssetUrl = (url: string | undefined | null, context: string) => {
      if (!url) return;
      for (const forbidden of forbiddenAssets) {
        expect(url.includes(forbidden), `Forbidden non-alpha crop ${forbidden} in ${context}`).toBe(false);
      }
      if (url.startsWith('/assets/')) {
        const diskPath = path.join(ROOT_DIR, 'public', url.replace(/^\//, ''));
        expect(fs.existsSync(diskPath), `Referenced asset missing on disk: ${url} (${context})`).toBe(true);
      }
    };

    for (const res of data.reusableContent.resources) {
      checkAssetUrl(res.coverUrl, `resource:${res.sourceKey}`);
      checkAssetUrl(res.mediaUrl, `resource-media:${res.sourceKey}`);
    }
    for (const act of data.reusableContent.activities) {
      checkAssetUrl(act.coverUrl, `activity:${act.sourceKey}`);
    }
    for (const mod of data.reusableContent.models3d) {
      checkAssetUrl(mod.coverUrl, `model3d:${mod.sourceKey}`);
    }
    for (const tpl of data.reusableContent.creativeTemplates) {
      checkAssetUrl(tpl.previewUrl, `template:${tpl.sourceKey}`);
    }
  });

  it('supports dryRun for content and demo modes, keeping production content free of demo rooms, scores, or passwords', async () => {
    const contentPlan = await importSeed({ mode: 'content', dryRun: true });
    expect(contentPlan.mode).toBe('content');
    expect(contentPlan.dryRun).toBe(true);
    expect(contentPlan.counts.resources).toBeGreaterThanOrEqual(12);
    expect(contentPlan.counts.activities).toBeGreaterThanOrEqual(8);
    expect(contentPlan.counts.models3d).toBeGreaterThanOrEqual(4);
    expect('rooms' in contentPlan.counts).toBe(false);
    expect('pointEvents' in contentPlan.counts).toBe(false);
    expect(contentPlan.counts.artworks).toBe(0);
    expect(contentPlan.counts.demoTeachers).toBe(0);

    const demoPlan = await importSeed({ mode: 'demo', dryRun: true });
    expect(demoPlan.mode).toBe('demo');
    expect(demoPlan.counts.resources).toBeGreaterThanOrEqual(contentPlan.counts.resources);
    expect('rooms' in demoPlan.counts).toBe(false);
    expect('participants' in demoPlan.counts).toBe(false);
    expect('pointEvents' in demoPlan.counts).toBe(false);
    expect(demoPlan.counts.artworks).toBeGreaterThanOrEqual(4);

    // Repeating dryRun yields identical deterministic target IDs
    const contentPlan2 = await importSeed({ mode: 'content', dryRun: true });
    expect(contentPlan2.mappings).toEqual(contentPlan.mappings);
  });

  it('rejects sourceKey collisions when importing normalized seed data', async () => {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    const duplicateData = structuredClone(data);
    duplicateData.reusableContent.resources.push({
      ...duplicateData.reusableContent.resources[0],
      title: 'Conflicting Resource With Same Source Key',
    });

    await expect(
      importSeed({ mode: 'content', dryRun: true, overrideData: duplicateData })
    ).rejects.toThrow(/collision|duplicate/i);
  });

  it('ensures no runtime file in src/ imports from server/seed-data', () => {
    const srcDir = path.join(ROOT_DIR, 'src');
    const walk = (dir: string): string[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      return entries.flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
      });
    };

    const files = walk(srcDir).filter((f) => /\.(ts|tsx|js|jsx)$/.test(f));
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content.includes('frontend-mock-v1'), `Forbidden archive import in ${file}`).toBe(false);
    }
  });
});
