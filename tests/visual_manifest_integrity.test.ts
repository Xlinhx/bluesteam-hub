import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateVisualManifest } from '../scripts/validate-visual-manifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

describe('BlueSTEAM v2 — Visual Review Manifest Integrity (Rules K, L, M)', () => {
  const sceneManifestPath = path.join(REPO_ROOT, 'docs', 'design', 'bluesteam-v2', 'scene-manifest.json');
  const visualManifestPath = path.join(REPO_ROOT, 'docs', 'design', 'bluesteam-v2', 'visual-review-manifest.json');

  it('should have visual-review-manifest.json present and readable', () => {
    expect(fs.existsSync(visualManifestPath)).toBe(true);
    const content = fs.readFileSync(visualManifestPath, 'utf8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('should pass all automated validation checks against scene-manifest.json', () => {
    const sceneManifest = JSON.parse(fs.readFileSync(sceneManifestPath, 'utf8'));
    const visualManifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));

    const result = validateVisualManifest(visualManifest, sceneManifest, REPO_ROOT);

    if (!result.valid) {
      console.error('Validation errors:', result.errors);
    }

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.summary.missingScenes).toHaveLength(0);
    expect(result.summary.referenceCoverage).toBe('35 / 35');
    expect(result.summary.totalRecords).toBeGreaterThanOrEqual(35);
  });

  it('should ensure all reviewIds are unique', () => {
    const visualManifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));
    const ids = visualManifest.records.map((r: any) => r.reviewId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should ensure any claimed screenshotPath exists on disk and is never mockup reference', () => {
    const visualManifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));
    for (const rec of visualManifest.records) {
      if (rec.screenshotPath !== null) {
        expect(rec.screenshotPath).not.toContain('Downloads/ocean');
        const fullPath = path.isAbsolute(rec.screenshotPath) ? rec.screenshotPath : path.join(REPO_ROOT, rec.screenshotPath);
        expect(fs.existsSync(fullPath)).toBe(true);
      }
    }
  });

  it('should enforce null scores for RESPONSIVE_SPEC and SPEC_ONLY', () => {
    const visualManifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));
    for (const rec of visualManifest.records) {
      if (rec.basis === 'RESPONSIVE_SPEC' || rec.basis === 'SPEC_ONLY') {
        expect(rec.scores).toBeNull();
      }
    }
  });
});
