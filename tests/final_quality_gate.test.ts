import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-ignore
import { validateVisualManifest } from '../scripts/validate-visual-manifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

describe('Milestone 6 Final Quality Gate & Master Audit Verification', () => {
  const appTsxPath = path.join(REPO_ROOT, 'src', 'app', 'App.tsx');
  const visualManifestPath = path.join(REPO_ROOT, 'docs', '12-VERIFICATION', 'visual-review-manifest.json');
  const sceneManifestPath = path.join(REPO_ROOT, 'docs', '12-VERIFICATION', 'scene-manifest.json');

  // =========================================================================
  // GATE 1: App.tsx Canonical V2 Wiring & Routing Architecture
  // =========================================================================
  describe('Gate 1: App.tsx Canonical Routing Architecture', () => {
    it('should exist and contain source content', () => {
      expect(fs.existsSync(appTsxPath)).toBe(true);
      const content = fs.readFileSync(appTsxPath, 'utf8');
      expect(content.length).toBeGreaterThan(1000);
    });

    it('should route /presentation to canonical v2 PresentationPage from pages/teacher', () => {
      const content = fs.readFileSync(appTsxPath, 'utf8');
      expect(content).toContain("import { PresentationPage } from '../pages/teacher/PresentationPage'");
      expect(content).toMatch(/cleanPath === '\/presentation'[\s\S]*?return <PresentationPage \/>/);
    });

    it('should route /teacher/results to canonical v2 TeacherSessionResultsPage', () => {
      const content = fs.readFileSync(appTsxPath, 'utf8');
      expect(content).toContain("import { TeacherSessionResultsPage } from '../pages/teacher/TeacherSessionResultsPage'");
      expect(content).toMatch(/cleanPath === '\/teacher\/results'[\s\S]*?return <TeacherSessionResultsPage \/>/);
    });

    it('should route /teacher/library to canonical v2 TeacherResourceLibraryPage', () => {
      const content = fs.readFileSync(appTsxPath, 'utf8');
      expect(content).toContain("import { TeacherResourceLibraryPage } from '../pages/teacher/TeacherResourceLibraryPage'");
      expect(content).toMatch(/cleanPath === '\/teacher\/library'[\s\S]*?return <TeacherResourceLibraryPage \/>/);
    });

    it('should cleanly route all learner, interactive, creative, and teacher paths to v2 high-fidelity pages', () => {
      const content = fs.readFileSync(appTsxPath, 'utf8');
      const requiredRouteHandlers = [
        "cleanPath === '/home'",
        "cleanPath === '/learn/atlas'",
        "cleanPath === '/learn/turtle'",
        "cleanPath === '/interactive/habitat-placement'",
        "cleanPath === '/interactive/my-action'",
        "cleanPath === '/interactive/plastic-journey'",
        "cleanPath === '/interactive/rescue-mission'",
        "cleanPath === '/interactive/simulations'",
        "cleanPath === '/interactive'",
        "cleanPath === '/resources'",
        "cleanPath === '/creative/drawing'",
        "cleanPath === '/creative/habitat'",
        "cleanPath === '/creative'",
        "cleanPath === '/profile'",
        "cleanPath === '/teacher'",
        "cleanPath === '/teacher/builder'",
        "cleanPath === '/teacher/live'",
      ];

      for (const handler of requiredRouteHandlers) {
        expect(content).toContain(handler);
      }
    });
  });

  // =========================================================================
  // GATE 2: Visual Review Manifest 39-Screen Status & Coverage
  // =========================================================================
  describe('Gate 2: 39-Screen Manifest Transition to VERIFIED', () => {
    it('should have exactly 39 records in visual-review-manifest.json', () => {
      const manifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));
      expect(manifest.records).toHaveLength(39);
    });

    it('should have 100% of records in VERIFIED status', () => {
      const manifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));
      const nonVerified = manifest.records.filter((r: any) => r.status !== 'VERIFIED');
      expect(nonVerified).toHaveLength(0);
      expect(manifest.records.every((r: any) => r.status === 'VERIFIED')).toBe(true);
    });

    it('should have 100% visualStatus === PASS and functionalStatus === PASS', () => {
      const manifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));
      for (const rec of manifest.records) {
        expect(rec.visualStatus).toBe('PASS');
        expect(rec.functionalStatus).toBe('PASS');
      }
    });

    it('should have ZERO blocking or P0 issues across all 39 screens', () => {
      const manifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));
      for (const rec of manifest.records) {
        if (rec.issues && rec.issues.length > 0) {
          const blockingIssues = rec.issues.filter((i: any) => i.blocking === true || i.severity === 'P0');
          expect(blockingIssues).toHaveLength(0);
        }
      }
    });
  });

  // =========================================================================
  // GATE 3: Rubric Threshold Verification (Rule K.8: Total >= 95 for REFERENCE)
  // =========================================================================
  describe('Gate 3: Rubric Score Standards & Null Enforcement', () => {
    it('should award >= 95/100 points for every REFERENCE screen', () => {
      const manifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));
      const referenceScreens = manifest.records.filter((r: any) => r.basis === 'REFERENCE');

      expect(referenceScreens.length).toBe(34);

      for (const rec of referenceScreens) {
        expect(rec.scores).toBeDefined();
        expect(rec.scores).not.toBeNull();
        expect(rec.scores.total).toBeGreaterThanOrEqual(95);

        // Verify all 5 dimensions are >= 18 points each
        const { layout, assetsAndLayers, typographyAndSpacing, shapesAndDetails, colorAndDepth } = rec.scores;
        expect(layout).toBeGreaterThanOrEqual(18);
        expect(assetsAndLayers).toBeGreaterThanOrEqual(18);
        expect(typographyAndSpacing).toBeGreaterThanOrEqual(18);
        expect(shapesAndDetails).toBeGreaterThanOrEqual(18);
        expect(colorAndDepth).toBeGreaterThanOrEqual(18);

        // Sum matches total
        const sum = layout + assetsAndLayers + typographyAndSpacing + shapesAndDetails + colorAndDepth;
        expect(rec.scores.total).toBe(sum);

        // Rubric details are populated with domain-specific notes
        expect(rec.rubric).toBeDefined();
        expect(rec.rubric.layout.notes.length).toBeGreaterThan(15);
        expect(rec.rubric.assetsAndLayers.notes.length).toBeGreaterThan(15);
        expect(rec.rubric.typographyAndSpacing.notes.length).toBeGreaterThan(15);
        expect(rec.rubric.shapesAndDetails.notes.length).toBeGreaterThan(15);
        expect(rec.rubric.colorAndDepth.notes.length).toBeGreaterThan(15);
      }
    });

    it('should enforce scores === null for all RESPONSIVE_SPEC and SPEC_ONLY screens (Rule K.9 & M.3)', () => {
      const manifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));
      const nonReferenceScreens = manifest.records.filter((r: any) => r.basis === 'RESPONSIVE_SPEC' || r.basis === 'SPEC_ONLY');

      expect(nonReferenceScreens.length).toBe(5);

      for (const rec of nonReferenceScreens) {
        expect(rec.scores).toBeNull();
        expect(rec.rubric).toBeNull();
        expect(rec.status).toBe('VERIFIED');
      }
    });
  });

  // =========================================================================
  // GATE 4: Screenshot & Artifact Authenticity (No Cheats, Real Files on Disk)
  // =========================================================================
  describe('Gate 4: Screenshot Evidence Integrity', () => {
    it('should ensure all 39 screenshotPaths exist on disk with valid file size (> 50KB)', () => {
      const manifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));

      for (const rec of manifest.records) {
        expect(rec.screenshotPath).toBeDefined();
        expect(rec.screenshotPath).not.toBeNull();

        // Must never reference raw downloads folder directly
        expect(rec.screenshotPath).not.toContain('Downloads/ocean');

        const fullPath = path.isAbsolute(rec.screenshotPath)
          ? rec.screenshotPath
          : path.join(REPO_ROOT, rec.screenshotPath);

        expect(fs.existsSync(fullPath)).toBe(true);

        const stats = fs.statSync(fullPath);
        expect(stats.size).toBeGreaterThan(50 * 1024); // at least 50KB
      }
    });

    it('should pass full automated validator suite validateVisualManifest with zero errors', () => {
      const sceneManifest = JSON.parse(fs.readFileSync(sceneManifestPath, 'utf8'));
      const visualManifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));

      const result = validateVisualManifest(visualManifest, sceneManifest, REPO_ROOT);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.summary.belowThresholdCount).toBe(0);
      expect(result.summary.blockedCount).toBe(0);
      expect(result.summary.staleCount).toBe(0);
      expect(result.summary.referenceCoverage).toBe('35 / 35');
      expect(result.summary.existingScreenshotsCount).toBe(39);
    });
  });
});
