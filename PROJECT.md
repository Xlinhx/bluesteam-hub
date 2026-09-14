# Project: BlueSTEAM v2 39-Screen High-Fidelity Upgrade

## Architecture
- **Framework & Core**: Vite 4.3 + React 19 + TypeScript 5.7 + Tailwind CSS v4 + Three.js 0.180.
- **Routing**: In-memory HTML5 History router (`src/app/router.tsx`) dispatching paths to canonical shell layouts and screen pages.
- **5 Canonical Shells (`src/shells/`)**:
  - `LearnerShell`: 72px sticky header + mobile 68px bottom nav, 5 items (`resources`, `learn`, `interactive`, `creative`, `profile`), avatar "An".
  - `TeacherShell`: 72px sticky header, "Teacher Suite" badge, live sync broadcast indicator, avatar "Cô Linh".
  - `PublicShell`: 72px sticky header, unauthenticated navigation, language toggle, login, and "Vào lớp" button; mobile hamburger menu drawer.
  - `ActivityShell`: Focused immersion bar with back navigation, step progress beads, scallop hint trigger, audio control, pause button.
  - `PresentationShell`: Fullscreen dark canvas (`#041624`) with top presentation bar, room code pill, topic title, and `BlueSteamLogo`.
- **Design Tokens**:
  - Deep oceanic navy (`#102A38`, `#12384B`), teal (`#17657A`), coral CTA (`#F67650`), gold (`#E5A93C`), sand (`#EAE4D5`).
  - Typography: Noto Serif / Playfair Display headings (`letter-spacing: -0.02em`), Be Vietnam Pro body (no system font fallbacks).
  - Tactile seaside studio materials, 3D aquatic glassmorphism, soft multi-layer diffuse shadows, 28px–32px Apple/iPadOS standard rounded corners.
- **Verification Engine**:
  - 39 records in `docs/design/bluesteam-v2/visual-review-manifest.json` mapped to 35 scenes in `scene-manifest.json` and 32 reference mockups in `C:/Users/ADMIN/Downloads/ocean/`.
  - Continuous validation via `npm test` (12 suites, 60 tests) and `npm run validate:visual` enforcing Rules K, L, M.

---

## Feature Inventory

Every screen and cross-cutting requirement is enumerated below with its assigned milestone and squad:

| # | Feature / Screen Review ID | Screen Title & Route | Viewport | Squad | Milestone | Source |
|---|---|---|---|---|---|---|
| F0 | Global Design Tokens & Typography Fix | `tokens.ts`, `index.css`, `tailwind.config.js` | All | Squad 1 | M1 | R1, Survey |
| F1 | `learner-home-overview-desktop-vi` | Trang nhà tổng thể (`/home`) | 1536x1024 | Squad 3 | M2 | R2, Scene 01 |
| F2 | `learner-home-overview-mobile-vi` | Trang nhà tổng thể mobile (`/home`) | 390x844 | Squad 3 | M2 | R2, Scene 01 |
| F3 | `resources-catalog-desktop-vi` | Kho học liệu lưới (`/resources`) | 1536x1024 | Squad 5 | M4 | R2, Scene 02 |
| F4 | `public-landing-overview-desktop-vi` | Landing Beat 1 Hero (`/`) | 1536x1024 | Squad 2 | M2 | R2, Scene 03 |
| F5 | `public-landing-beat2-beat3-desktop-vi` | Landing Beat 2 & 3 (`/`) | 1536x1024 | Squad 2 | M2 | R2, Scene 03 |
| F6 | `public-landing-beat3-3d-turtle-desktop-vi` | Landing Beat 3 3D Rùa (`/`) | 1536x1024 | Squad 2 | M2 | R2, Scene 03 |
| F7 | `public-landing-overview-mobile-vi` | Landing di động 7 nhịp (`/`) | 390x844 | Squad 2 | M2 | R2, Scene 03 |
| F8 | `public-role-and-access-desktop-vi` | Chọn vai trò & vào lớp (`/entry`) | 1536x1024 | Squad 2 | M2 | R2, Scene 04 |
| F9 | `public-adult-login-desktop-vi` | Đăng nhập giáo viên (`/login`) | 1536x1024 | Squad 2 | M2 | R2, Scene 05 |
| F10 | `resources-library-overview-desktop-vi` | Học liệu tuyển chọn dọc (`/resources`) | 1024x1536 | Squad 5 | M4 | R2, Scene 06 |
| F11 | `resources-flashcard-detail-desktop-vi` | Chi tiết thẻ hình 2 mặt (`/resources/flashcard`) | 1536x1024 | Squad 5 | M4 | R2, Scene 07 |
| F12 | `resources-media-player-desktop-vi` | Trình phát video học liệu (`/resources/media`) | 1536x1024 | Squad 5 | M4 | R2, Scene 08 |
| F13 | `resources-print-preview-desktop-vi` | Xem & tải tài liệu in A4 (`/resources/print`) | 1536x1024 | Squad 5 | M4 | R2, Scene 09 |
| F14 | `ocean-horizontal-atlas-desktop-vi` | Bản đồ đại dương ngang (`/learn/atlas`) | 1536x1024 | Squad 3 | M2 | R2, Scene 10 |
| F15 | `ocean-vertical-atlas-desktop-vi` | Bản đồ dọc 5 tầng nước (`/learn/atlas?mode=vertical`) | 1536x1024 | Squad 3 | M2 | R2, Scene 11 |
| F16 | `ocean-creature-viewer-desktop-vi` | Quan sát Rùa Xanh 3D (`/learn/turtle`) | 1536x1024 | Squad 3 | M2 | R2, Scene 12 |
| F17 | `game-lab-overview-desktop-vi` | Game Lab tổng quan dọc (`/interactive`) | 1024x1536 | Squad 4 | M3 | R2, Scene 13 |
| F18 | `game-lab-recognition-round-desktop-vi` | Nhận biết sinh vật biển (`/interactive/habitat-placement`) | 1536x1024 | Squad 4 | M3 | R2, Scene 14 |
| F19 | `game-habitat-placement-desktop-vi` | Ghép nơi sống thao tác (`/interactive/habitat-placement`) | 1536x1024 | Squad 4 | M3 | R2, Scene 15 |
| F20 | `game-habitat-feedback-desktop-vi` | Ghép nơi sống phản hồi (`/interactive/habitat-placement`) | 1536x1024 | Squad 4 | M3 | R2, Scene 16 |
| F21 | `simulations-catalog-desktop-vi` | Kho mô phỏng sinh thái (`/interactive/simulations`) | 1536x1024 | Squad 6 | M3 | R2, Scene 17 |
| F22 | `simulations-my-action-choice-desktop-vi` | Hành động của em: Lựa chọn (`/interactive/my-action`) | 1536x1024 | Squad 6 | M3 | R2, Scene 18 |
| F23 | `simulations-my-action-compare-desktop-vi` | Hành động của em: So sánh (`/interactive/my-action`) | 1536x1024 | Squad 6 | M3 | R2, Scene 19 |
| F24 | `simulations-plastic-journey-desktop-vi` | Hành trình mảnh nhựa (`/interactive/plastic-journey`) | 1536x1024 | Squad 6 | M3 | R2, Scene 20 |
| F25 | `simulations-rescue-mission-desktop-vi` | Giải cứu sinh vật biển (`/interactive/rescue-mission`) | 1536x1024 | Squad 6 | M3 | R2, Scene 21 |
| F26 | `creative-studio-desktop-vi` | Xưởng sáng tạo tổng quan (`/creative`) | 1536x1024 | Squad 7 | M4 | R2, Scene 22 |
| F27 | `creative-drawing-desktop-vi` | Vẽ & tô màu sáp 2D (`/creative/drawing`) | 1536x1024 | Squad 7 | M4 | R2, Scene 23 |
| F28 | `creative-habitat-build-desktop-vi` | Xây môi trường 3D (`/creative/habitat`) | 1536x1024 | Squad 7 | M4 | R2, Scene 24 |
| F29 | `creative-habitat-run-desktop-vi` | Xây môi trường 3D chạy thử (`/creative/habitat?mode=run`) | 1536x1024 | Squad 7 | M4 | R2, Scene 25 |
| F30 | `profile-learner-profile-desktop-vi` | Hồ sơ & hành trình của bé (`/profile`) | 1536x1024 | Squad 9 | M5 | R2, Scene 26 |
| F31 | `teacher-dashboard-desktop-vi` | Giáo viên bàn làm việc (`/teacher`) | 1536x1024 | Squad 8 | M5 | R2, Scene 27 |
| F32 | `teacher-resource-library-desktop-vi` | Giáo viên thư viện giáo cụ (`/teacher/library`) | 1536x1024 | Squad 8 | M5 | R2, Scene 28 |
| F33 | `teacher-lesson-plan-desktop-vi` | Giáo án mẫu 5 bước (`/teacher/builder?mode=plan`) | 1536x1024 | Squad 8 | M5 | R2, Scene 29 |
| F34 | `teacher-lesson-builder-desktop-vi` | Soạn bài giảng tương tác (`/teacher/builder`) | 1536x1024 | Squad 8 | M5 | R2, Scene 30 |
| F35 | `teacher-live-console-desktop-vi` | Điều khiển lớp học (`/teacher/live`) | 1536x1024 | Squad 8 | M5 | R2, Scene 31 |
| F36 | `teacher-presentation-desktop-vi` | Màn trình chiếu lớp học (`/presentation`) | 1536x1024 | Squad 9 | M5 | R2, Scene 32 |
| F37 | `teacher-session-results-desktop-vi` | Báo cáo kết quả buổi học (`/teacher/results`) | 1536x1024 | Squad 9 | M5 | R2, Scene 33 |
| F38 | `system-loading-retry-desktop-vi` | Chuyển cảnh & thử lại (`/home?loading=true`) | 1536x1024 | Squad 9 | M5 | R2, Scene 34 |
| F39 | `responsive-tablet-creative-vi` | Tablet xưởng sáng tạo (`/creative/drawing`) | 1024x768 | Squad 7 | M4 | R2, Scene 35 |
| F40 | Master Visual Audit & Integrity Gate | Rubric >= 95 on all 39 screens, Vitest 60/60, manifest PASS | All | Squad 10 | M6 | R3, R4 |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| **M1** | Global Design Tokens & Shells | Squad 1: Fix runtime font overwrite in `tokens.ts`, add `#102A38` navy, `Playfair Display`, Apple 28-32px radiuses, heading letter-spacing `-0.02em`. Standardize 5 canonical shells (`LearnerShell`, `TeacherShell`, `PublicShell`, `ActivityShell`, `PresentationShell`) and core UI primitives (`CoralButton`, `ScallopHintButton`, `BlueSteamLogo`). | none | DONE |
| **M2** | Public Onboarding, Auth & Learner Core | Squad 2 (Screens 4, 5, 6, 7, 8, 9) + Squad 3 (Screens 1, 2, 14, 15, 16). Public landing 7-beat, mobile drawer, role gateway, login; Learner home desktop/mobile, horizontal & vertical atlas (5 depth layers), 3D sea turtle viewer. | M1 | DONE |
| **M3** | Game Lab & Interactive Ocean Simulations | Squad 4 (Screens 17, 18, 19, 20) + Squad 6 (Screens 21, 22, 23, 24, 25). Portrait Game Lab, specimen recognition, habitat placement, diagnostic feedback; ecological simulations catalog, my-action choice/compare, plastic journey, marine rescue mission. | M1 | DONE |
| **M4** | Learning Resources, Media Hub & Creative Studio | Squad 5 (Screens 3, 10, 11, 12, 13) + Squad 7 (Screens 26, 27, 28, 29, 39). Catalog grid, portrait library, 2-sided 3D flashcard, ocean video player, printable A4; creative studio hub, crayon canvas 2D, 3D habitat builder & simulation run, tablet drawing. | M1 | DONE |
| **M5** | Teacher Suite, Presentation & Profile | Squad 8 (Screens 31, 32, 33, 34, 35) + Squad 9 (Screens 30, 36, 37, 38). Teacher dashboard, pedagogical resource library, 5-step lesson plan, interactive lesson builder, live classroom console; learner profile, fullscreen presentation, session results report, turtle loading/retry. | M1 | DONE |
| **M6** | Master Audit, Visual Verification & Final Pass | Squad 10: Master Auditor. Capture/refresh all 39 screenshots, side-by-side rubric verification against `C:/Users/ADMIN/Downloads/ocean/` (every screen >= 95/100, 0 P0 issues), transition manifest to `VERIFIED`, verify Vitest 60/60 and `npm run validate:visual` exit 0. | M2, M3, M4, M5 | DONE |

---

## Interface Contracts

### Tokens & Shells (Squad 1) ↔ All Feature Pages (Squads 2–9)
- **Typography CSS Variables**:
  - `--font-editorial-serif`: `"Noto Serif", "Playfair Display", Georgia, serif` (MUST NOT be overwritten by system-ui at runtime).
  - `--font-sans`: `"Be Vietnam Pro", system-ui, -apple-system, sans-serif`.
  - Headings class: `.font-editorial` or `font-serif` with `tracking-[-0.02em]` and color `text-[#102A38]` or `text-[#12384B]`.
- **Corner Radiuses**:
  - `--radius-3xl: 28px;` / `rounded-[28px]` or `rounded-[32px]` for major cards, modals, and sheets.
- **5 Canonical Shells**:
  - `LearnerShell`: Wraps student views (`/home`, `/learn/*`, `/resources/*`, `/interactive/*`, `/creative/*`, `/profile`).
  - `TeacherShell`: Wraps teacher management views (`/teacher`, `/teacher/library`, `/teacher/builder`, `/teacher/live`).
  - `PublicShell`: Wraps public pages (`/`, `/entry`, `/login`) with unauthenticated actions and mobile drawer.
  - `ActivityShell`: Wraps focused immersion experiences (interactive games, simulations, drawing canvas).
  - `PresentationShell`: Wraps fullscreen presentation mode (`/presentation`) with dark oceanic background and `BlueSteamLogo`.

### Query Parameter Contracts for Multi-State Routes
- `/`: Beat navigation (`#beat1`, `#beat2`, `#beat3`)
- `/learn/atlas`: `?mode=horizontal` (default) vs `?mode=vertical` (5 depth layers)
- `/interactive/habitat-placement`: `?step=recognition` vs `?step=placement` vs `?step=feedback`
- `/interactive/my-action`: `?mode=choice` vs `?mode=compare`
- `/creative/habitat`: `?mode=build` vs `?mode=run`
- `/teacher/builder`: `?mode=plan` vs `?mode=builder`
- `/home`: `?loading=true` displays turtle swimmer loader and "Thử lại" button.

---

## Code Layout

- `src/themes/`:
  - `tokens.ts`: Global theme token definitions and runtime CSS variable injection.
  - `ThemeProvider.tsx`: React theme context provider.
- `src/index.css`: Root styling, typography definitions, radius CSS variables, glassmorphism utilities.
- `tailwind.config.js`: Tailwind v4 theme extensions, color tokens, and font families.
- `src/shells/`:
  - `LearnerShell.tsx`: Student shell layout.
  - `TeacherShell.tsx`: Educator shell layout.
  - `PublicShell.tsx`: Landing, role gateway, and login shell.
  - `ActivityShell.tsx`: Focused immersion activities shell.
  - `PresentationShell.tsx`: Classroom presentation display shell.
- `src/pages/`:
  - Public & Auth: `LivingOceanLandingPage.tsx`, `RoleGatewayPage.tsx`, `TeacherLoginPage.tsx`.
  - Learner & Atlas: `LearnerHomePage.tsx`, `OceanAtlasPage.tsx`, `OceanCreatureViewerPage.tsx`.
  - Game Lab: `GameLabPage.tsx`, `HabitatPlacementGamePage.tsx`.
  - Resources & Media: `ResourcesLibraryPage.tsx`, `FlashcardDetailPage.tsx`, `VideoPlayerPage.tsx`, `PrintPreviewPage.tsx`.
  - Simulations: `SimulationsCatalogPage.tsx`, `MyActionSimulationPage.tsx`, `PlasticJourneySimulationPage.tsx`, `RescueMissionSimulationPage.tsx`.
  - Creative Studio: `CreativeStudioPage.tsx`, `CreativeDrawingPage.tsx`, `HabitatStudioPage.tsx`.
  - Teacher Suite: `TeacherDashboardPage.tsx`, `TeacherLibraryPage.tsx`, `TeacherLessonBuilderPage.tsx`, `TeacherLiveConsolePage.tsx`.
  - Presentation & Profile: `LearnerProfilePage.tsx`, `PresentationPage.tsx`, `SessionResultsPage.tsx`.
- `docs/design/bluesteam-v2/`:
  - `visual-review-manifest.json`: Authoritative 39-record review manifest.
  - `scene-manifest.json`: Authoritative scene ground truth.
  - `REFERENCE_RULES.md`: Rules K, L, M specification.
  - `REFERENCE_CORRECTIONS.md`: Documented mockup defects to override.
- `artifacts/bluesteam-v2/verification/`: Directory of captured screen evidence PNGs.
- `tests/`: 12 Vitest regression test suites guarding domain logic, shells, storage, and manifest integrity.
