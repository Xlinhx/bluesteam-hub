import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-ignore
import { validateVisualManifest } from '../scripts/validate-visual-manifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('Milestone 6 Empirical Quality Gate & Master Stress Suite (M6 Challenger 1)', () => {
  const visualManifestPath = path.join(REPO_ROOT, 'docs', 'verification', 'visual-review-manifest.json');
  const sceneManifestPath = path.join(REPO_ROOT, 'docs', 'verification', 'scene-manifest.json');
  const appTsxPath = path.join(REPO_ROOT, 'src', 'app', 'App.tsx');

  const rawVisualManifest = fs.readFileSync(visualManifestPath, 'utf8');
  const visualManifest = JSON.parse(rawVisualManifest);
  const rawSceneManifest = fs.readFileSync(sceneManifestPath, 'utf8');
  const sceneManifest = JSON.parse(rawSceneManifest);
  const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

  // =========================================================================
  // 1. MANIFEST CARDINALITY & TRANSITION INTEGRITY
  // =========================================================================
  describe('1. Manifest Cardinality & Transition Integrity', () => {
    it('contains exactly 39 review records in visual-review-manifest.json', () => {
      expect(visualManifest.records).toHaveLength(39);
    });

    it('all 39 records have status === "VERIFIED"', () => {
      const nonVerified = visualManifest.records.filter((r: any) => r.status !== 'VERIFIED');
      expect(nonVerified).toHaveLength(0);
      for (const rec of visualManifest.records) {
        expect(rec.status).toBe('VERIFIED');
      }
    });

    it('all 39 records have visualStatus === "PASS" and functionalStatus === "PASS"', () => {
      for (const rec of visualManifest.records) {
        expect(rec.visualStatus).toBe('PASS');
        expect(rec.functionalStatus).toBe('PASS');
        expect(rec.motionStatus).toBe('PASS');
      }
    });

    it('all 39 reviewIds are unique non-empty strings', () => {
      const ids = visualManifest.records.map((r: any) => r.reviewId);
      expect(ids.every((id: any) => typeof id === 'string' && id.trim().length > 0)).toBe(true);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(39);
    });

    it('strictly partitions into 32 REFERENCE, 5 RESPONSIVE_SPEC, and 2 SPEC_ONLY records', () => {
      const refRecords = visualManifest.records.filter((r: any) => r.basis === 'REFERENCE');
      const respRecords = visualManifest.records.filter((r: any) => r.basis === 'RESPONSIVE_SPEC');
      const specRecords = visualManifest.records.filter((r: any) => r.basis === 'SPEC_ONLY');

      expect(refRecords).toHaveLength(32);
      expect(respRecords).toHaveLength(5);
      expect(specRecords).toHaveLength(2);
      expect(refRecords.length + respRecords.length + specRecords.length).toBe(39);
    });

    it('completely covers all 35 scenes and spec-only entries in scene-manifest.json', () => {
      const coveredRefIds = new Set(visualManifest.records.map((r: any) => r.referenceId));
      for (const scene of sceneManifest.scenes) {
        expect(coveredRefIds.has(scene.id)).toBe(true);
      }
      for (const spec of (sceneManifest.specOnly || [])) {
        expect(coveredRefIds.has(spec.id)).toBe(true);
      }
    });
  });

  // =========================================================================
  // 2. RUBRIC SCORING & MATHEMATICAL INTEGRITY (RULES K.8, K.9, M.3)
  // =========================================================================
  describe('2. Rubric Scoring & Mathematical Integrity', () => {
    const categories = [
      'layout',
      'assetsAndLayers',
      'typographyAndSpacing',
      'shapesAndDetails',
      'colorAndDepth'
    ] as const;

    it('all 32 REFERENCE records have scores.total >= 95 and <= 100', () => {
      const refRecords = visualManifest.records.filter((r: any) => r.basis === 'REFERENCE');
      for (const rec of refRecords) {
        expect(rec.scores).toBeDefined();
        expect(rec.scores).not.toBeNull();
        expect(typeof rec.scores.total).toBe('number');
        expect(rec.scores.total).toBeGreaterThanOrEqual(95);
        expect(rec.scores.total).toBeLessThanOrEqual(100);
      }
    });

    it('all 32 REFERENCE records have all 5 rubric categories scored between 18 and 20 pts', () => {
      const refRecords = visualManifest.records.filter((r: any) => r.basis === 'REFERENCE');
      for (const rec of refRecords) {
        let categorySum = 0;
        for (const cat of categories) {
          const score = rec.scores[cat];
          expect(typeof score).toBe('number');
          expect(score).toBeGreaterThanOrEqual(18);
          expect(score).toBeLessThanOrEqual(20);
          categorySum += score;
        }
        // Mathematical consistency: sum of categories must exactly equal total
        expect(categorySum).toBe(rec.scores.total);
      }
    });

    it('all 32 REFERENCE records have complete rubric documentation matching scores', () => {
      const refRecords = visualManifest.records.filter((r: any) => r.basis === 'REFERENCE');
      for (const rec of refRecords) {
        expect(rec.rubric).toBeDefined();
        expect(rec.rubric).not.toBeNull();
        for (const cat of categories) {
          expect(rec.rubric[cat]).toBeDefined();
          expect(rec.rubric[cat].maxPoints).toBe(20);
          expect(rec.rubric[cat].awardedPoints).toBe(rec.scores[cat]);
          expect(typeof rec.rubric[cat].notes).toBe('string');
          expect(rec.rubric[cat].notes.trim().length).toBeGreaterThan(15);
        }
      }
    });

    it('all 7 responsive/spec-only records strictly enforce scores === null and rubric === null (Rules K.9 & M.3)', () => {
      const nonRefRecords = visualManifest.records.filter(
        (r: any) => r.basis === 'RESPONSIVE_SPEC' || r.basis === 'SPEC_ONLY'
      );
      expect(nonRefRecords).toHaveLength(7);
      for (const rec of nonRefRecords) {
        expect(rec.scores).toBeNull();
        expect(rec.rubric).toBeNull();
      }
    });
  });

  // =========================================================================
  // 3. ZERO BLOCKING P0 ISSUES ADVERSARIAL AUDIT
  // =========================================================================
  describe('3. Adversarial Issues & Blockers Audit', () => {
    it('has zero records with blocking === true or severity === "P0"', () => {
      for (const rec of visualManifest.records) {
        if (rec.issues && Array.isArray(rec.issues)) {
          for (const issue of rec.issues) {
            expect(issue.blocking).toBe(false);
            expect(issue.severity).not.toBe('P0');
            expect(issue.status).toBe('RESOLVED');
          }
        }
        if (rec.assetIssues && Array.isArray(rec.assetIssues)) {
          for (const assetIssue of rec.assetIssues) {
            expect(assetIssue.status).toBe('RESOLVED');
          }
        }
      }
    });
  });

  // =========================================================================
  // 4. SCREENSHOT PHYSICAL EVIDENCE STRESS AUDIT
  // =========================================================================
  describe('4. Physical Screenshot Files Empirical Stress Verification', () => {
    it('all 39 records have valid non-null screenshotPath in artifacts/verification/', () => {
      for (const rec of visualManifest.records) {
        expect(rec.screenshotPath).toBeDefined();
        expect(rec.screenshotPath).not.toBeNull();
        expect(typeof rec.screenshotPath).toBe('string');
        expect(rec.screenshotPath).toContain('artifacts/verification/');
        // Negative test: never reference raw mockup downloads
        expect(rec.screenshotPath).not.toContain('Downloads/ocean');
      }
    });

    it('all 39 screenshot files physically exist on disk and exceed 50 KB (51,200 bytes)', () => {
      const checkedFiles = new Set<string>();

      for (const rec of visualManifest.records) {
        const fullPath = path.isAbsolute(rec.screenshotPath)
          ? rec.screenshotPath
          : path.join(REPO_ROOT, rec.screenshotPath);

        expect(fs.existsSync(fullPath)).toBe(true);

        const stats = fs.statSync(fullPath);
        expect(stats.isFile()).toBe(true);
        expect(stats.size).toBeGreaterThan(50 * 1024);

        checkedFiles.add(fullPath);
      }

      expect(checkedFiles.size).toBe(39);
    });

    it('all 39 screenshot files are authentic valid PNG binaries (valid magic header bytes)', () => {
      for (const rec of visualManifest.records) {
        const fullPath = path.isAbsolute(rec.screenshotPath)
          ? rec.screenshotPath
          : path.join(REPO_ROOT, rec.screenshotPath);

        const buffer = fs.readFileSync(fullPath);
        expect(buffer.length).toBeGreaterThan(24);

        const header = buffer.subarray(0, 8);
        expect(header.equals(PNG_MAGIC)).toBe(true);
      }
    });
  });

  // =========================================================================
  // 5. APP.TSX CANONICAL ROUTING & IMPORTS AUDIT
  // =========================================================================
  describe('5. App.tsx Canonical V2 Architecture & Routing Integrity', () => {
    it('imports canonical v2 PresentationPage from domains/teacher/presentation/PresentationPage', () => {
      expect(appTsxContent).toContain("import { PresentationPage } from '../domains/teacher/presentation/PresentationPage'");
      // Negative constraint: must not import legacy session mock
      expect(appTsxContent).not.toContain("import { PresentationPage } from '../pages/session/PresentationPage'");
    });

    it('imports canonical v2 TeacherResourceLibraryPage from pages/teacher/TeacherResourceLibraryPage', () => {
      expect(appTsxContent).toContain(
        "import { TeacherResourceLibraryPage } from '../domains/teacher/resources/TeacherResourceLibraryPage'"
      );
      // Negative constraint: must not import legacy TeacherLibraryPage
      expect(appTsxContent).not.toContain(
        "import { TeacherLibraryPage } from '../pages/teacher/TeacherLibraryPage'"
      );
    });

    it('routes /presentation directly to <PresentationPage />', () => {
      expect(appTsxContent).toMatch(/cleanPath === '\/presentation'[\s\S]*?return <PresentationPage \/>/);
    });

    it('routes /teacher/library directly to <TeacherResourceLibraryPage />', () => {
      expect(appTsxContent).toMatch(/cleanPath === '\/teacher\/library'[\s\S]*?return <TeacherResourceLibraryPage \/>/);
    });

    it('routes student and classroom core routes correctly', () => {
      const coreRoutes = [
        "cleanPath === '/home'",
        "cleanPath === '/learn/atlas'",
        "cleanPath === '/learn/turtle'",
        "cleanPath === '/interactive/habitat-placement'",
        "cleanPath === '/interactive/my-action'",
        "cleanPath === '/interactive/plastic-journey'",
        "cleanPath === '/interactive/rescue-mission'",
        "cleanPath === '/interactive/simulations'",
        "cleanPath === '/resources'",
        "cleanPath === '/creative/drawing'",
        "cleanPath === '/creative/habitat'",
        "cleanPath === '/profile'",
        "cleanPath === '/teacher'",
        "cleanPath === '/teacher/builder'",
      ];

      for (const route of coreRoutes) {
        expect(appTsxContent).toContain(route);
      }
    });
  });

  // =========================================================================
  // 6. AUTOMATED MANIFEST VALIDATOR SUITE INTEGRATION
  // =========================================================================
  describe('6. Automated Visual Manifest Validation Script Pass', () => {
    it('executes validateVisualManifest and achieves 100% PASS with 0 errors', () => {
      const result = validateVisualManifest(visualManifest, sceneManifest, REPO_ROOT);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.summary.belowThresholdCount).toBe(0);
      expect(result.summary.blockedCount).toBe(0);
      expect(result.summary.staleCount).toBe(0);
      expect(result.summary.totalRecords).toBe(39);
      expect(result.summary.statusCounts.VERIFIED).toBe(39);
      expect(result.summary.existingScreenshotsCount).toBe(39);
    });
  });
});
