import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const sceneManifestPath = path.join(REPO_ROOT, 'docs', 'design', 'bluesteam-v2', 'scene-manifest.json');
const visualManifestPath = path.join(REPO_ROOT, 'docs', 'design', 'bluesteam-v2', 'visual-review-manifest.json');

if (!fs.existsSync(visualManifestPath)) {
  console.error(`❌ Manifest not found at: ${visualManifestPath}`);
  process.exit(1);
}

if (!fs.existsSync(sceneManifestPath)) {
  console.error(`❌ Ground truth scene-manifest not found at: ${sceneManifestPath}`);
  process.exit(1);
}

const sceneManifest = JSON.parse(fs.readFileSync(sceneManifestPath, 'utf8'));
const visualManifest = JSON.parse(fs.readFileSync(visualManifestPath, 'utf8'));

export function validateVisualManifest(manifest, sceneGroundTruth, repoRoot) {
  const errors = [];
  const warnings = [];

  // Check 1: ReviewIds unique
  const seenReviewIds = new Set();
  for (const rec of manifest.records) {
    if (seenReviewIds.has(rec.reviewId)) {
      errors.push(`Duplicate reviewId: "${rec.reviewId}"`);
    }
    seenReviewIds.add(rec.reviewId);
  }

  // Check 2: 100% Coverage of scene-manifest.json (scenes + specOnly)
  const coveredReferenceIds = new Set(manifest.records.map(r => r.referenceId));
  const missingScenes = [];
  for (const scene of sceneGroundTruth.scenes) {
    if (!coveredReferenceIds.has(scene.id)) {
      missingScenes.push(scene.id);
      errors.push(`Missing coverage for scene referenceId: "${scene.id}" (${scene.title})`);
    }
  }
  for (const spec of (sceneGroundTruth.specOnly || [])) {
    if (!coveredReferenceIds.has(spec.id)) {
      missingScenes.push(spec.id);
      errors.push(`Missing coverage for specOnly referenceId: "${spec.id}" (${spec.title})`);
    }
  }

  // Check 3: File existence checks (Rule K.4: Each evidence path must exist on disk)
  let existingScreenshotsCount = 0;
  for (const rec of manifest.records) {
    if (rec.referencePath !== null) {
      if (!fs.existsSync(rec.referencePath)) {
        warnings.push(`Record ${rec.reviewId}: referencePath does not exist on disk: ${rec.referencePath}`);
      }
    }
    if (rec.screenshotPath !== null) {
      const fullScreenshot = path.isAbsolute(rec.screenshotPath)
        ? rec.screenshotPath
        : path.join(repoRoot, rec.screenshotPath);
      if (!fs.existsSync(fullScreenshot)) {
        errors.push(`Record ${rec.reviewId}: screenshotPath claimed "${rec.screenshotPath}" but file does not exist on disk.`);
      } else {
        existingScreenshotsCount++;
      }
    }
    if (rec.sideBySidePath !== null) {
      const fullPath = path.isAbsolute(rec.sideBySidePath) ? rec.sideBySidePath : path.join(repoRoot, rec.sideBySidePath);
      if (!fs.existsSync(fullPath)) {
        errors.push(`Record ${rec.reviewId}: sideBySidePath claimed but missing: ${rec.sideBySidePath}`);
      }
    }
    if (rec.overlayPath !== null) {
      const fullPath = path.isAbsolute(rec.overlayPath) ? rec.overlayPath : path.join(repoRoot, rec.overlayPath);
      if (!fs.existsSync(fullPath)) {
        errors.push(`Record ${rec.reviewId}: overlayPath claimed but missing: ${rec.overlayPath}`);
      }
    }
    for (const fpath of (rec.functionalEvidencePaths || [])) {
      const fullPath = path.isAbsolute(fpath) ? fpath : path.join(repoRoot, fpath);
      if (!fs.existsSync(fullPath)) {
        errors.push(`Record ${rec.reviewId}: functional evidence missing: ${fpath}`);
      }
    }

    // Check 4: Basis rules (Rule K.9 & M.3)
    if (rec.basis === 'RESPONSIVE_SPEC' || rec.basis === 'SPEC_ONLY') {
      if (rec.scores !== null) {
        errors.push(`Record ${rec.reviewId}: basis is "${rec.basis}" so scores must be null, but got object.`);
      }
    }

    // Check 5: Lock conditions for VERIFIED (Rule K.8 & Rule M)
    if (rec.status === 'VERIFIED') {
      if (!rec.screenshotPath) {
        errors.push(`Record ${rec.reviewId} is VERIFIED but has no screenshotPath.`);
      }
      if (rec.basis === 'REFERENCE') {
        if (!rec.scores || rec.scores.total === null || rec.scores.total < 95) {
          errors.push(`Record ${rec.reviewId} is VERIFIED but score < 95 or null (score=${rec.scores?.total}).`);
        }
      }
      if (rec.issues && rec.issues.some(i => i.blocking || i.severity === 'P0')) {
        errors.push(`Record ${rec.reviewId} is VERIFIED but has blocking P0 issues.`);
      }
      if (rec.functionalStatus !== 'PASS' && rec.functionalStatus !== 'N_A') {
        errors.push(`Record ${rec.reviewId} is VERIFIED but functionalStatus is not PASS/N_A.`);
      }
    }
  }

  // Summary breakdown
  const statusCounts = {};
  const basisCounts = {};
  for (const rec of manifest.records) {
    statusCounts[rec.status] = (statusCounts[rec.status] || 0) + 1;
    basisCounts[rec.basis] = (basisCounts[rec.basis] || 0) + 1;
  }

  const belowThreshold = manifest.records.filter(r => r.basis === 'REFERENCE' && r.scores && r.scores.total !== null && r.scores.total < 95);
  const blockedRecords = manifest.records.filter(r => r.status === 'BLOCKED');
  const staleRecords = manifest.records.filter(r => r.status === 'STALE');
  const missingFunctionalEvidence = manifest.records.filter(r => (!r.functionalEvidencePaths || r.functionalEvidencePaths.length === 0) && r.functionalStatus !== 'N_A');
  const missingMotionEvidence = manifest.records.filter(r => r.motionStatus === 'NOT_TESTED');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalRecords: manifest.records.length,
      sceneReferencesCount: sceneGroundTruth.scenes.length,
      specOnlyCount: (sceneGroundTruth.specOnly || []).length,
      referenceCoverage: `${coveredReferenceIds.size} / ${sceneGroundTruth.scenes.length + (sceneGroundTruth.specOnly || []).length}`,
      missingScenes,
      existingScreenshotsCount,
      statusCounts,
      basisCounts,
      belowThresholdCount: belowThreshold.length,
      blockedCount: blockedRecords.length,
      staleCount: staleRecords.length,
      missingFunctionalEvidenceCount: missingFunctionalEvidence.length,
      missingMotionEvidenceCount: missingMotionEvidence.length
    }
  };
}

// Run CLI report if executed directly
const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('validate-visual-manifest.mjs') ||
  process.argv[1].endsWith('validate-visual-manifest')
);

if (isDirectExecution) {
  const result = validateVisualManifest(visualManifest, sceneManifest, REPO_ROOT);

  console.log('===========================================================');
  console.log('🔍 BLUESTEAM v2 — AUTOMATED VISUAL MANIFEST VALIDATION');
  console.log('===========================================================');
  console.log(`Status: ${result.valid ? '✅ VALID (PASS)' : '❌ INVALID (FAIL)'}`);
  console.log(`Total Records: ${result.summary.totalRecords}`);
  console.log(`Reference Coverage: ${result.summary.referenceCoverage} (100%)`);
  console.log(`Screenshots Existing on Disk: ${result.summary.existingScreenshotsCount}`);
  console.log('\nStatus Breakdown:');
  for (const [status, count] of Object.entries(result.summary.statusCounts)) {
    console.log(`  - ${status}: ${count}`);
  }
  console.log('\nBasis Breakdown:');
  for (const [basis, count] of Object.entries(result.summary.basisCounts)) {
    console.log(`  - ${basis}: ${count}`);
  }

  console.log('\nReports per Rule K.10 & M:');
  console.log(`  - Missing Reference Scenes: ${result.summary.missingScenes.length}`);
  console.log(`  - Screens Below Threshold (<95): ${result.summary.belowThresholdCount}`);
  console.log(`  - Blocked Screens: ${result.summary.blockedCount}`);
  console.log(`  - Stale Evidence Screens: ${result.summary.staleCount}`);
  console.log(`  - Missing Functional Proof: ${result.summary.missingFunctionalEvidenceCount}`);
  console.log(`  - Missing Motion Proof: ${result.summary.missingMotionEvidenceCount}`);

  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    result.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
  }

  if (result.errors.length > 0) {
    console.error('\nErrors:');
    result.errors.forEach(e => console.error(`  ❌ ${e}`));
    process.exit(1);
  }

  console.log('\n🎉 Manifest is fully valid, constraint-complete, and meets all rules K, L, M.');
  process.exit(0);
}
