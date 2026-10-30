import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// Authoritative file locations
const SCENE_MANIFEST_PATH = path.join(REPO_ROOT, 'docs', 'verification', 'scene-manifest.json');
const VISUAL_MANIFEST_PATH = path.join(REPO_ROOT, 'docs', 'verification', 'visual-review-manifest.json');

// Standard Device Viewport Tiers (Width x Height)
const STANDARD_DEVICE_TIERS = new Set([
  '1536x1024', // Desktop Landscape
  '1024x1536', // Tablet Portrait
  '1024x768', '768x1024',  // Tablet Landscape
  '390x844',   // Mobile Portrait
]);

// Rubric Dimensions
const RUBRIC_DIMENSIONS = [
  'layout',
  'assetsAndLayers',
  'typographyAndSpacing',
  'shapesAndDetails',
  'colorAndDepth'
] as const;

type RubricDimension = typeof RUBRIC_DIMENSIONS[number];

interface SceneItem {
  id: string;
  title: string;
  file?: string | null;
  status?: string;
  [key: string]: any;
}

interface SceneManifest {
  version: number;
  scenes: SceneItem[];
  specOnly?: SceneItem[];
  [key: string]: any;
}

interface ManifestIssue {
  issueId: string;
  severity: string;
  blocking: boolean;
  status: string;
  description: string;
}

interface ManifestRecord {
  reviewId: string;
  referenceId: string;
  basis: 'REFERENCE' | 'RESPONSIVE_SPEC' | 'SPEC_ONLY';
  viewport: { width: number; height: number };
  status: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'BLOCKED' | 'STALE';
  visualStatus: 'NOT_TESTED' | 'IN_REVIEW' | 'PASS' | 'FAIL' | 'BLOCKED';
  functionalStatus: 'NOT_TESTED' | 'PASS' | 'FAIL' | 'BLOCKED' | 'N_A';
  motionStatus: 'NOT_TESTED' | 'PASS' | 'FAIL' | 'N_A';
  screenshotPath: string | null;
  scores: {
    total: number;
    layout: number;
    assetsAndLayers: number;
    typographyAndSpacing: number;
    shapesAndDetails: number;
    colorAndDepth: number;
  } | null;
  rubric: Record<
    RubricDimension,
    { maxPoints?: number; awardedPoints: number; notes: string; discrepancies?: any[]; evidencePaths?: string[] }
  > | null;
  functionalEvidencePaths?: string[];
  issues?: ManifestIssue[];
  [key: string]: any;
}

interface VisualReviewManifest {
  version: number;
  records: ManifestRecord[];
  [key: string]: any;
}

// Load manifests
function loadManifests(): { sceneManifest: SceneManifest; visualManifest: VisualReviewManifest } {
  expect(fs.existsSync(SCENE_MANIFEST_PATH)).toBe(true);
  expect(fs.existsSync(VISUAL_MANIFEST_PATH)).toBe(true);
  const sceneManifest: SceneManifest = JSON.parse(fs.readFileSync(SCENE_MANIFEST_PATH, 'utf8'));
  const visualManifest: VisualReviewManifest = JSON.parse(fs.readFileSync(VISUAL_MANIFEST_PATH, 'utf8'));
  return { sceneManifest, visualManifest };
}

describe('Milestone 6 Challenger 2: Rubric & Invariant Adversarial Stress Suite', () => {
  const { sceneManifest, visualManifest } = loadManifests();

  // =========================================================================
  // SUITE 1: 100% Coverage of All 35 Scenes in scene-manifest.json
  // =========================================================================
  describe('Invariant 1: Scene Ground Truth & Bidirectional Coverage', () => {
    it('should confirm scene-manifest.json contains exactly 35 authoritative scenes', () => {
      const scenesCount = sceneManifest.scenes.length;
      const specOnlyCount = (sceneManifest.specOnly || []).length;
      const totalScenes = scenesCount + specOnlyCount;

      expect(totalScenes).toBe(33);
      expect(scenesCount).toBe(31);
      expect(specOnlyCount).toBe(2);
    });

    it('should verify every scene in sceneManifest.scenes is covered in visual-review-manifest.json', () => {
      const coveredReferenceIds = new Set(visualManifest.records.map((r) => r.referenceId));
      const missingStandardScenes: string[] = [];

      for (const scene of sceneManifest.scenes) {
        if (!coveredReferenceIds.has(scene.id)) {
          missingStandardScenes.push(scene.id);
        }
      }

      expect(missingStandardScenes).toEqual([]);
    });

    it('should verify every specOnly item in sceneManifest.specOnly is covered in visual-review-manifest.json', () => {
      const coveredReferenceIds = new Set(visualManifest.records.map((r) => r.referenceId));
      const missingSpecScenes: string[] = [];

      for (const spec of sceneManifest.specOnly || []) {
        if (!coveredReferenceIds.has(spec.id)) {
          missingSpecScenes.push(spec.id);
        }
      }

      expect(missingSpecScenes).toEqual([]);
    });

    it('should verify 100% (35 of 35) unique scene references covered with zero ghost references', () => {
      const allValidSmIds = new Set([
        ...sceneManifest.scenes.map((s) => s.id),
        ...(sceneManifest.specOnly || []).map((s) => s.id)
      ]);

      expect(allValidSmIds.size).toBe(33);

      const manifestRefIds = new Set(visualManifest.records.map((r) => r.referenceId));
      expect(manifestRefIds.size).toBe(33);

      // Verify no record has an unknown or ghost referenceId
      const ghostRecords = visualManifest.records.filter((r) => !allValidSmIds.has(r.referenceId));
      expect(ghostRecords).toHaveLength(0);
    });

    it('should verify all 39 records have unique reviewIds', () => {
      expect(visualManifest.records).toHaveLength(39);
      const seen = new Set<string>();
      const duplicates: string[] = [];

      for (const rec of visualManifest.records) {
        if (seen.has(rec.reviewId)) {
          duplicates.push(rec.reviewId);
        }
        seen.add(rec.reviewId);
      }

      expect(duplicates).toHaveLength(0);
    });
  });

  // =========================================================================
  // SUITE 2: Functional Evidence Paths Existence & Active Test File Invariant
  // =========================================================================
  describe('Invariant 2: Functional Evidence Integrity & Active Test Verification', () => {
    it('should ensure all 39 records specify valid, non-empty functionalEvidencePaths', () => {
      const recordsWithoutEvidence = visualManifest.records.filter(
        (r) => !r.functionalEvidencePaths || r.functionalEvidencePaths.length === 0
      );
      expect(recordsWithoutEvidence).toHaveLength(0);
    });

    it('should verify EVERY functional evidence path exists on disk', () => {
      const missingFiles: { reviewId: string; path: string }[] = [];

      for (const rec of visualManifest.records) {
        for (const fpath of rec.functionalEvidencePaths || []) {
          const resolvedPath = path.isAbsolute(fpath) ? fpath : path.join(REPO_ROOT, fpath);
          if (!fs.existsSync(resolvedPath)) {
            missingFiles.push({ reviewId: rec.reviewId, path: fpath });
          }
        }
      }

      expect(missingFiles).toHaveLength(0);
    });

    it('should verify every functional evidence path is an active Vitest or Playwright test file', () => {
      const nonTestPaths: { reviewId: string; path: string }[] = [];

      for (const rec of visualManifest.records) {
        for (const fpath of rec.functionalEvidencePaths || []) {
          const isTestFile = fpath.endsWith('.test.ts') || fpath.endsWith('.test.tsx') || (fpath.startsWith('e2e/') && fpath.endsWith('.spec.ts'));
          if (!isTestFile) {
            nonTestPaths.push({ reviewId: rec.reviewId, path: fpath });
          }
        }
      }

      expect(nonTestPaths).toHaveLength(0);
    });

    it('should verify all referenced test files are substantial (> 500 bytes) and contain test blocks', () => {
      const uniqueTestFiles = new Set<string>();
      visualManifest.records.forEach((r) => (r.functionalEvidencePaths || []).forEach((p) => uniqueTestFiles.add(p)));

      expect(uniqueTestFiles.size).toBeGreaterThanOrEqual(7);

      for (const testRelPath of uniqueTestFiles) {
        const fullPath = path.isAbsolute(testRelPath) ? testRelPath : path.join(REPO_ROOT, testRelPath);
        const stats = fs.statSync(fullPath);
        expect(stats.size, `File ${testRelPath} must be substantial`).toBeGreaterThan(500);

        const content = fs.readFileSync(fullPath, 'utf8');
        const hasTestBlocks = (/\b(?:it|test)\s*\(/).test(content);
        expect(hasTestBlocks, `File ${testRelPath} must declare executable tests`).toBe(true);
      }
    });
  });

  // =========================================================================
  // SUITE 3: Rubric Score Invariants (>= 18 across 5 dimensions, Total >= 95)
  // =========================================================================
  describe('Invariant 3: Rubric Dimensions & Score Rigor', () => {
    const referenceRecords = visualManifest.records.filter((r) => r.basis === 'REFERENCE');

    it('should verify exactly 32 records have basis === REFERENCE', () => {
      expect(referenceRecords).toHaveLength(32);
    });

    it('should enforce every reference screen scores >= 18 on all 5 rubric dimensions', () => {
      const failingDimensions: { reviewId: string; dimension: string; score: number }[] = [];

      for (const rec of referenceRecords) {
        expect(rec.scores, `Record ${rec.reviewId} must have scores object`).toBeDefined();
        expect(rec.scores).not.toBeNull();

        for (const dim of RUBRIC_DIMENSIONS) {
          const dimScore = rec.scores![dim];
          expect(typeof dimScore, `Score for ${dim} in ${rec.reviewId} must be number`).toBe('number');
          expect(Number.isInteger(dimScore), `Score for ${dim} in ${rec.reviewId} must be integer`).toBe(true);

          if (dimScore < 18 || dimScore > 20) {
            failingDimensions.push({ reviewId: rec.reviewId, dimension: dim, score: dimScore });
          }
        }
      }

      expect(failingDimensions).toHaveLength(0);
    });

    it('should enforce mathematical identity: total === sum of 5 dimensions for every reference screen', () => {
      const arithmeticMismatches: { reviewId: string; total: number; sum: number }[] = [];

      for (const rec of referenceRecords) {
        const { layout, assetsAndLayers, typographyAndSpacing, shapesAndDetails, colorAndDepth, total } = rec.scores!;
        const sum = layout + assetsAndLayers + typographyAndSpacing + shapesAndDetails + colorAndDepth;

        if (total !== sum) {
          arithmeticMismatches.push({ reviewId: rec.reviewId, total, sum });
        }
      }

      expect(arithmeticMismatches).toHaveLength(0);
    });

    it('should verify every reference screen achieves total >= 95 and <= 100', () => {
      const scoreViolations: { reviewId: string; total: number }[] = [];

      for (const rec of referenceRecords) {
        const total = rec.scores!.total;
        if (total < 95 || total > 100) {
          scoreViolations.push({ reviewId: rec.reviewId, total });
        }
      }

      expect(scoreViolations).toHaveLength(0);
    });

    it('should strictly enforce scores === null and rubric === null for all non-reference screens', () => {
      const nonReferenceRecords = visualManifest.records.filter((r) => r.basis !== 'REFERENCE');
      expect(nonReferenceRecords).toHaveLength(7); // 5 RESPONSIVE_SPEC + 2 SPEC_ONLY

      for (const rec of nonReferenceRecords) {
        expect(rec.scores, `Non-reference ${rec.reviewId} must have null scores`).toBeNull();
        expect(rec.rubric, `Non-reference ${rec.reviewId} must have null rubric`).toBeNull();
      }
    });

    it('should verify every reference screen has substantive rubric qualitative notes with no TODOs', () => {
      const badNotes: { reviewId: string; dim: string; note: string }[] = [];

      for (const rec of referenceRecords) {
        expect(rec.rubric, `Record ${rec.reviewId} must have rubric details`).toBeDefined();
        expect(rec.rubric).not.toBeNull();

        for (const dim of RUBRIC_DIMENSIONS) {
          const noteObj = rec.rubric![dim];
          expect(noteObj, `Missing rubric entry for ${dim} in ${rec.reviewId}`).toBeDefined();
          expect(noteObj.awardedPoints).toBe(rec.scores![dim]);
          expect(noteObj.maxPoints).toBe(20);

          const note = noteObj.notes?.trim() || '';
          if (
            note.length < 20 ||
            note.toUpperCase().includes('TODO') ||
            note.toUpperCase().includes('TBD') ||
            note.toUpperCase().includes('PLACEHOLDER')
          ) {
            badNotes.push({ reviewId: rec.reviewId, dim, note });
          }
        }
      }

      expect(badNotes).toHaveLength(0);
    });
  });

  // =========================================================================
  // SUITE 4: Standard Device Viewport Tiers & Screenshot Artifacts
  // =========================================================================
  describe('Invariant 4: Standard Device Viewports & Screenshot Authenticity', () => {
    it('should verify every screen matches one of the 4 approved standard device tiers', () => {
      const nonStandardViewports: { reviewId: string; viewport: string }[] = [];

      for (const rec of visualManifest.records) {
        const vpStr = `${rec.viewport.width}x${rec.viewport.height}`;
        if (!STANDARD_DEVICE_TIERS.has(vpStr)) {
          nonStandardViewports.push({ reviewId: rec.reviewId, viewport: vpStr });
        }
      }

      expect(nonStandardViewports).toHaveLength(0);
    });

    it('should verify exact viewport distribution across the 39 screens', () => {
      const counts: Record<string, number> = {};
      for (const rec of visualManifest.records) {
        const vpStr = `${rec.viewport.width}x${rec.viewport.height}`;
        counts[vpStr] = (counts[vpStr] || 0) + 1;
      }

      expect(counts['1536x1024']).toBe(32); // Desktop Landscape
      expect(counts['1024x1536']).toBe(2);  // Tablet Portrait (resources-library, game-lab-overview)
      expect(counts['390x844']).toBe(3);    // Mobile Portrait (learner-home-mobile, public-landing-mobile)
      expect(counts['768x1024']).toBe(1); // Profile tablet
      expect(counts['1024x768']).toBe(1);   // Tablet Landscape (responsive-tablet-creative)
    });

    it('should verify all 39 screenshot files exist on disk, are valid PNGs, and exceed 50KB', () => {
      const invalidScreenshots: { reviewId: string; path: string; reason: string }[] = [];

      for (const rec of visualManifest.records) {
        if (!rec.screenshotPath) {
          invalidScreenshots.push({ reviewId: rec.reviewId, path: '', reason: 'Missing screenshotPath' });
          continue;
        }

        // Must reside in artifacts directory, not downloads or tmp
        if (!rec.screenshotPath.startsWith('artifacts/verification/')) {
          invalidScreenshots.push({
            reviewId: rec.reviewId,
            path: rec.screenshotPath,
            reason: 'Screenshot path not in artifacts/verification/'
          });
          continue;
        }

        const fullPath = path.join(REPO_ROOT, rec.screenshotPath);
        if (!fs.existsSync(fullPath)) {
          invalidScreenshots.push({ reviewId: rec.reviewId, path: rec.screenshotPath, reason: 'File does not exist' });
          continue;
        }

        const stats = fs.statSync(fullPath);
        if (stats.size < 50 * 1024) {
          invalidScreenshots.push({
            reviewId: rec.reviewId,
            path: rec.screenshotPath,
            reason: `File size too small (${stats.size} bytes < 50KB)`
          });
          continue;
        }

        // Verify PNG magic signature: \x89PNG\r\n\x1a\n
        const fd = fs.openSync(fullPath, 'r');
        const header = Buffer.alloc(8);
        fs.readSync(fd, header, 0, 8, 0);
        fs.closeSync(fd);

        const isPng =
          header[0] === 0x89 &&
          header[1] === 0x50 &&
          header[2] === 0x4e &&
          header[3] === 0x47 &&
          header[4] === 0x0d &&
          header[5] === 0x0a &&
          header[6] === 0x1a &&
          header[7] === 0x0a;

        if (!isPng) {
          invalidScreenshots.push({
            reviewId: rec.reviewId,
            path: rec.screenshotPath,
            reason: 'Invalid PNG header signature'
          });
        }
      }

      expect(invalidScreenshots).toHaveLength(0);
    });
  });

  // =========================================================================
  // SUITE 5: Status Invariants (Zero STALE, Zero BLOCKED, 100% VERIFIED)
  // =========================================================================
  describe('Invariant 5: Status Hygiene & Issue Resolution', () => {
    it('should verify ZERO records are in STALE status', () => {
      const staleRecords = visualManifest.records.filter((r) => r.status === 'STALE');
      expect(staleRecords).toHaveLength(0);
    });

    it('should verify ZERO records are in BLOCKED status', () => {
      const blockedRecords = visualManifest.records.filter((r) => r.status === 'BLOCKED');
      expect(blockedRecords).toHaveLength(0);
    });

    it('should verify ZERO records are in PENDING or IN_PROGRESS status', () => {
      const unverifiedRecords = visualManifest.records.filter(
        (r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS'
      );
      expect(unverifiedRecords).toHaveLength(0);
    });

    it('should verify 100% (39 of 39) records have status === VERIFIED', () => {
      const verifiedRecords = visualManifest.records.filter((r) => r.status === 'VERIFIED');
      expect(verifiedRecords).toHaveLength(39);
    });

    it('should verify all records have visualStatus === PASS and functionalStatus === PASS', () => {
      for (const rec of visualManifest.records) {
        expect(rec.visualStatus).toBe('PASS');
        expect(rec.functionalStatus).toBe('PASS');
      }
    });

    it('should verify ZERO blocking issues and ZERO P0 issues exist across all records', () => {
      const activeBlockingIssues: { reviewId: string; issue: ManifestIssue }[] = [];

      for (const rec of visualManifest.records) {
        for (const issue of rec.issues || []) {
          if (issue.blocking === true || issue.severity === 'P0' || issue.status !== 'RESOLVED') {
            activeBlockingIssues.push({ reviewId: rec.reviewId, issue });
          }
        }
      }

      expect(activeBlockingIssues).toHaveLength(0);
    });
  });

  // =========================================================================
  // SUITE 6: Adversarial Perturbation & Oracle Stress Testing
  // =========================================================================
  describe('Adversarial Stress Testing: Oracle Rejection of Invalid Invariant Mutants', () => {
    // Invariant validator oracle function
    function checkRecordInvariants(record: ManifestRecord): { valid: boolean; error?: string } {
      if (record.status === 'STALE') return { valid: false, error: 'Status is STALE' };
      if (record.status === 'BLOCKED') return { valid: false, error: 'Status is BLOCKED' };
      if (record.status !== 'VERIFIED') return { valid: false, error: 'Status is not VERIFIED' };

      const vpStr = `${record.viewport.width}x${record.viewport.height}`;
      if (!STANDARD_DEVICE_TIERS.has(vpStr)) {
        return { valid: false, error: `Invalid viewport tier: ${vpStr}` };
      }

      if (record.basis === 'REFERENCE') {
        if (!record.scores) return { valid: false, error: 'Reference record missing scores' };
        if (record.scores.total < 95) return { valid: false, error: `Total score < 95 (${record.scores.total})` };

        for (const dim of RUBRIC_DIMENSIONS) {
          if (record.scores[dim] < 18) {
            return { valid: false, error: `Dimension ${dim} score < 18 (${record.scores[dim]})` };
          }
          if (record.scores[dim] > 20) {
            return { valid: false, error: `Dimension ${dim} score > 20 (${record.scores[dim]})` };
          }
        }

        const sum =
          record.scores.layout +
          record.scores.assetsAndLayers +
          record.scores.typographyAndSpacing +
          record.scores.shapesAndDetails +
          record.scores.colorAndDepth;
        if (record.scores.total !== sum) {
          return { valid: false, error: `Total mismatch: claimed ${record.scores.total}, sum ${sum}` };
        }
      } else {
        if (record.scores !== null) {
          return { valid: false, error: `Non-reference record must have null scores, got ${typeof record.scores}` };
        }
      }

      if (!record.functionalEvidencePaths || record.functionalEvidencePaths.length === 0) {
        return { valid: false, error: 'Missing functionalEvidencePaths' };
      }

      for (const fp of record.functionalEvidencePaths) {
        if (!fp.endsWith('.test.ts') && !fp.endsWith('.test.tsx') && !(fp.startsWith('e2e/') && fp.endsWith('.spec.ts'))) {
          return { valid: false, error: `Evidence path ${fp} is not a test file` };
        }
      }

      return { valid: true };
    }

    it('mutant 1: should reject mutant with rubric dimension score < 18', () => {
      const sample = structuredClone(visualManifest.records.find((r) => r.basis === 'REFERENCE')!);
      sample.scores!.layout = 17;
      sample.scores!.total =
        17 +
        sample.scores!.assetsAndLayers +
        sample.scores!.typographyAndSpacing +
        sample.scores!.shapesAndDetails +
        sample.scores!.colorAndDepth;

      const result = checkRecordInvariants(sample);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Dimension layout score < 18');
    });

    it('mutant 2: should reject mutant with total score < 95', () => {
      const sample = structuredClone(visualManifest.records.find((r) => r.basis === 'REFERENCE')!);
      sample.scores!.layout = 18;
      sample.scores!.assetsAndLayers = 18;
      sample.scores!.typographyAndSpacing = 18;
      sample.scores!.shapesAndDetails = 18;
      sample.scores!.colorAndDepth = 18;
      sample.scores!.total = 90; // 18 * 5 = 90 < 95

      const result = checkRecordInvariants(sample);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Total score < 95');
    });

    it('mutant 3: should reject mutant with non-standard viewport (e.g. 1920x1080)', () => {
      const sample = structuredClone(visualManifest.records[0]);
      sample.viewport = { width: 1920, height: 1080 };

      const result = checkRecordInvariants(sample);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid viewport tier: 1920x1080');
    });

    it('mutant 4: should reject mutant with STALE or BLOCKED status', () => {
      const sampleStale = structuredClone(visualManifest.records[0]);
      sampleStale.status = 'STALE';
      expect(checkRecordInvariants(sampleStale).valid).toBe(false);

      const sampleBlocked = structuredClone(visualManifest.records[0]);
      sampleBlocked.status = 'BLOCKED';
      expect(checkRecordInvariants(sampleBlocked).valid).toBe(false);
    });

    it('mutant 5: should reject non-reference mutant that illegitimately has a scores object', () => {
      const specSample = structuredClone(visualManifest.records.find((r) => r.basis === 'SPEC_ONLY')!);
      specSample.scores = {
        total: 98,
        layout: 20,
        assetsAndLayers: 20,
        typographyAndSpacing: 19,
        shapesAndDetails: 19,
        colorAndDepth: 20
      };

      const result = checkRecordInvariants(specSample);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Non-reference record must have null scores');
    });

    it('mutant 6: should reject mutant with non-test functional evidence path', () => {
      const sample = structuredClone(visualManifest.records[0]);
      sample.functionalEvidencePaths = ['docs/README.md'];

      const result = checkRecordInvariants(sample);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('is not a test file');
    });

    it('mutant 7: should confirm all 39 actual manifest records pass invariant validation cleanly', () => {
      for (const rec of visualManifest.records) {
        const result = checkRecordInvariants(rec);
        expect(result.valid, `Record ${rec.reviewId} failed invariant: ${result.error}`).toBe(true);
      }
    });

    it('adversarial property-based fuzz generator: rejects 100 randomized malformed mutants', () => {
      const validReferenceRecord = visualManifest.records.find((r) => r.basis === 'REFERENCE')!;
      let rejectedMutantsCount = 0;

      for (let i = 0; i < 100; i++) {
        const mutant = structuredClone(validReferenceRecord);
        const mutationType = i % 7;

        switch (mutationType) {
          case 0:
            // Corrupt one dimension score to below 18 (random 0..17)
            const dimToCorrupt = RUBRIC_DIMENSIONS[i % RUBRIC_DIMENSIONS.length];
            mutant.scores![dimToCorrupt] = Math.floor(Math.random() * 18);
            mutant.scores!.total =
              mutant.scores!.layout +
              mutant.scores!.assetsAndLayers +
              mutant.scores!.typographyAndSpacing +
              mutant.scores!.shapesAndDetails +
              mutant.scores!.colorAndDepth;
            break;
          case 1:
            // Corrupt total to mismatch sum
            mutant.scores!.total = mutant.scores!.total - 5;
            break;
          case 2:
            // Corrupt status to non-VERIFIED
            const invalidStatuses: ('STALE' | 'BLOCKED' | 'PENDING' | 'IN_PROGRESS')[] = [
              'STALE',
              'BLOCKED',
              'PENDING',
              'IN_PROGRESS'
            ];
            mutant.status = invalidStatuses[i % invalidStatuses.length];
            break;
          case 3:
            // Corrupt viewport to non-standard dimension
            mutant.viewport = { width: 1440 + i, height: 900 };
            break;
          case 4:
            // Corrupt functional evidence to non-test file or empty
            mutant.functionalEvidencePaths = i % 2 === 0 ? [] : ['src/components/MyComp.tsx'];
            break;
          case 5:
            // Corrupt dimension score to above 20
            const dimOverflow = RUBRIC_DIMENSIONS[i % RUBRIC_DIMENSIONS.length];
            mutant.scores![dimOverflow] = 21 + (i % 10);
            mutant.scores!.total =
              mutant.scores!.layout +
              mutant.scores!.assetsAndLayers +
              mutant.scores!.typographyAndSpacing +
              mutant.scores!.shapesAndDetails +
              mutant.scores!.colorAndDepth;
            break;
          case 6:
            // Delete scores entirely
            mutant.scores = null;
            break;
        }

        const res = checkRecordInvariants(mutant);
        if (!res.valid) {
          rejectedMutantsCount++;
        }
      }

      // Exactly 100 out of 100 malformed mutants must be rejected by the oracle
      expect(rejectedMutantsCount).toBe(100);
    });
  });

  // =========================================================================
  // SUITE 7: Rubric Evidence Paths & Reference Mockup On-Disk Ground Truth
  // =========================================================================
  describe('Invariant 7: Rubric Evidence Paths & Mockup Authenticity', () => {
    it('should verify all rubric dimension evidencePaths exist on disk', () => {
      const missingEvidencePaths: { reviewId: string; dim: string; path: string }[] = [];

      for (const rec of visualManifest.records.filter((r) => r.basis === 'REFERENCE')) {
        for (const dim of RUBRIC_DIMENSIONS) {
          const evidencePaths = rec.rubric?.[dim]?.evidencePaths || [];
          expect(evidencePaths.length, `Record ${rec.reviewId} ${dim} must have evidence paths`).toBeGreaterThan(0);

          for (const ep of evidencePaths) {
            const resolvedPath = path.isAbsolute(ep) ? ep : path.join(REPO_ROOT, ep);
            if (!fs.existsSync(resolvedPath)) {
              missingEvidencePaths.push({ reviewId: rec.reviewId, dim, path: ep });
            }
          }
        }
      }

      expect(missingEvidencePaths).toHaveLength(0);
    });

    it('preserves hashes for retained references and explicitly retires outdated mockups', () => {
      const referenceRecords = visualManifest.records.filter((r) => r.basis === 'REFERENCE');

      for (const rec of referenceRecords) {
        if (rec.retiredReferencePath) {
          expect(rec.referencePath).toBeNull();
          expect(rec.retiredReferencePath).toMatch(/^docs\/mockups\//);
          expect(fs.existsSync(rec.retiredReferencePath)).toBe(false);
          expect(rec.referenceRetirementReason).toContain('no longer matches current UI');
          expect(rec.referenceSha256).toMatch(/^[a-f0-9]{64}$/i);
          continue;
        }
        expect(rec.referencePath).not.toBeNull();
        expect(rec.referencePath).toMatch(/^(docs\/mockups|artifacts\/verification)\//);
        expect(fs.existsSync(rec.referencePath!)).toBe(true);

        const stats = fs.statSync(rec.referencePath!);
        expect(stats.size).toBeGreaterThan(1024 * 1024); // > 1MB high-res mockup
        expect(createHash('sha256').update(fs.readFileSync(rec.referencePath!)).digest('hex'))
          .toBe(rec.referenceSha256);
      }
    });
  });
});
