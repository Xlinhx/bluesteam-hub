# Original User Request

## 2026-09-14T14:09:56Z

# Teamwork Project Prompt

> Requested team: 10 Squads (Squad 1: Global Design Tokens & Shells, Squad 2: Public Onboarding & Auth, Squad 3: Learner Core & Atlas, Squad 4: Game Lab, Squad 5: Kho học liệu & Media Hub, Squad 6: Interactive Simulations, Squad 7: Xưởng Sáng Tạo, Squad 8: Teacher Suite, Squad 9: Presentation & Profile, Squad 10: Master Auditor)

Upgrade all 39 screens of the BlueSTEAM v2 ocean immersive learning application to reach full visual and aesthetic fidelity matching the original reference mockups, achieving a rubric score of >= 95/100 on every screen.

Working directory: p:/ocean-immerserve-learning
Integrity mode: development

Reference material:
- Reference Mockups: `C:/Users/ADMIN/Downloads/ocean/`
- Progress & Visual Manifest: `docs/12-VERIFICATION/visual-review-manifest.json`
- Scene Ground Truth: `docs/12-VERIFICATION/scene-manifest.json`
- Local Vite Server: `http://localhost:5173`

## Requirements

### R1. Global Visual & Aesthetic System Alignment
- Implement typography hierarchy: high-contrast headings using Noto Serif / Playfair Display in deep oceanic navy (`#102A38`, `#12384B`) with `letter-spacing: -0.02em`, and soft rounded body/UI using Be Vietnam Pro. No fallback to default Times New Roman or Segoe UI.
- Implement optical depth & shadows: multi-layer soft diffuse shadows, 1px translucent subtle borders, and smooth rounded corners (28px - 32px Apple/iPadOS standard).
- Implement bespoke materials: tactile seaside creative studio aesthetic, 3D aquatic glassmorphism, and immersive panoramic full-bleed ocean backdrops.
- No direct cropping of reference mockups; visual assets must be generated via image tools, vector SVGs, or procedural shaders.

### R2. 39-Screen High-Fidelity Refinement Across All Sections
Refine and polish all 39 application screens categorized across the functional sections:
- **Global Shells**: LearnerShell, TeacherShell, Navigation & Mode switches.
- **Public Onboarding & Auth**: 7-beat Landing Page, Mobile Landing, Role Gateway, Login.
- **Learner Core & Atlas**: Learner Home (Desktop/Mobile), Atlas (Horizontal/Vertical views), 3D Interactive Turtle.
- **Game Lab & Ecosystem Placement**: Lab Overview, Specimen Recognition, Habitat Placement, Diagnostic Feedback.
- **Learning Resources & Media Hub**: Resource Catalog, Flashcard Detail, Video Interactive Quiz, Print Material Preview.
- **Interactive Ocean Simulations**: Simulation Catalog, Action Choice, Action Impact Comparison, Plastic Journey, Marine Rescue Mission.
- **Creative Studio**: Studio Hub, Crayon Drawing Canvas, Habitat Builder, Habitat Simulation Run, Tablet Drawing Experience.
- **Teacher Suite**: Classroom Dashboard, Resource Repository, Lesson Plan Designer, Lesson Builder, Live Classroom Console.
- **Presentation & Profile**: Fullscreen Presentation Mode, Session Analytics Results, Learner Profile, System Loading.

### R3. Autonomous Verification & Multi-Squad Loop
- Execute an iterative repair cycle: after code refinement, capture running screenshots at `http://localhost:5173` for the exact viewport configured in `visual-review-manifest.json`.
- Compare each captured screen side-by-side against the corresponding reference mockup in `C:/Users/ADMIN/Downloads/ocean/` using the 5 rubric criteria:
  1. `layout` (20 pts)
  2. `assetsAndLayers` (20 pts)
  3. `typographyAndSpacing` (20 pts)
  4. `shapesAndDetails` (20 pts)
  5. `colorAndDepth` (20 pts)
- Re-iterate any screen scoring below 95 until >= 95/100 is achieved and verified.

### R4. Test & Manifest Integrity
- Maintain 100% pass rate on all existing Vitest test suites (`npm test`).
- Ensure `npm run validate:visual` passes with zero errors, satisfying all integrity rules K, L, and M.

## Acceptance Criteria

### Visual Parity & Rubric Score
- [ ] All 34 REFERENCE screens in `docs/12-VERIFICATION/visual-review-manifest.json` have high-resolution captured screenshots under `artifacts/verification/`.
- [ ] Every reference screen achieves a rubric total score >= 95/100 with zero blocking (P0) issues.
- [ ] All 39 records in `docs/12-VERIFICATION/visual-review-manifest.json` are transitioned to `VERIFIED` status with valid evidence paths.

### Code & Test Integrity
- [ ] All tests pass: `npm test` exits 0 with 6Pass / 0 Fail across all test suites.
- [ ] Visual manifest validation: `npm run validate:visual` exits 0 with valid status and 100% reference coverage.
- [ ] Typography and design tokens strictly adhere to font specifications (Noto Serif/Playfair Display headings, Be Vietnam Pro body, oceanic palette, no system font fallbacks).
