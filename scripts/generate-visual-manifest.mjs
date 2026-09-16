import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const sceneManifestPath = path.join(REPO_ROOT, 'docs', '12-VERIFICATION', 'scene-manifest.json');
const sceneManifest = JSON.parse(fs.readFileSync(sceneManifestPath, 'utf8'));

const currentRevision = 'd5a60ba+dirty';
const verificationDir = path.join(REPO_ROOT, 'artifacts', 'bluesteam-v2', 'verification');

function getExistingScreenshot(filename) {
  const fullPath = path.join(verificationDir, filename);
  if (fs.existsSync(fullPath)) {
    return `artifacts/verification/${filename}`;
  }
  return null;
}

const records = [
  // 1. learner-home-overview
  {
    reviewId: 'learner-home-overview-desktop-vi',
    referenceId: 'learner-home-overview',
    referencePath: 'docs/mockups/03-home.png',
    basis: 'REFERENCE',
    route: '/home',
    state: 'default-journey-overview',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Chọn hồ sơ học sinh bé An',
      'Vào route /home',
      'Kiểm tra Hero card, con đường hành trình 3 trạm sóng, dock sáng tạo'
    ],
    screenshotPath: getExistingScreenshot('learner-home-desktop-1536x1024.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Không Duolingo streak/mạng',
      'Nhân vật dẫn đường, lối vào Xưởng vẽ',
      'Avatar và header chuẩn LearnerShell, không tự sinh layout',
      '3 trạm mẫu đại diện cho lộ trình mở, không hardcode'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: 'Hero + con đường uốn lượn + dock sáng tạo', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: 'Lớp sóng Living Ocean và icon trạm vỏ sò', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: 'Typography chuẩn trẻ em, chữ to rõ', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: 'Node trạm hoàn thành / hiện tại / khóa', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: 'Màu xanh đại dương Living Ocean gradient', discrepancies: [], evidencePaths: [] }
    },
    issues: [
          {
                "id": "lh-layout-01",
                "category": "LAYOUT",
                "severity": "P1",
                "description": "Bố cục hiện tại là hộp phẳng màu be, thiếu nền toàn cảnh đại dương chia đôi mặt nước (split-view) nhiệt đới full-bleed; 3 trạm sóng cần đặt nổi trực tiếp trên làn nước theo đường cong mềm mại.",
                "blocking": false
          },
          {
                "id": "lh-asset-01",
                "category": "ASSET",
                "severity": "P1",
                "description": "Thiếu 2 thẻ góc bàn thủ công bên dưới (Góc thủ công, Vẽ tranh); linh vật rùa dẫn đường cần có bóng đổ và biểu cảm thân thiện.",
                "blocking": false
          }
    ],
    assetIssues: [
          {
                "assetId": "learner-home-split-water-bg",
                "cause": "ASSET_CONTENT",
                "resolutionPlan": "Tự sinh ảnh nền biển nhiệt đới chia đôi mặt nước tỉ lệ 16:9 full-bleed",
                "status": "OPEN"
          },
          {
                "assetId": "craft-desk-cards",
                "cause": "ASSET_CONTENT",
                "resolutionPlan": "Tạo 2 thẻ bàn gỗ thủ công với chất liệu giấy mộc và bút màu",
                "status": "OPEN"
          }
    ],
    functionalEvidencePaths: ['tests/learner_journey.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['learner-home-overview-mobile-vi'],
    iterations: []
  },
  {
    reviewId: 'learner-home-overview-mobile-vi',
    referenceId: 'learner-home-overview',
    referencePath: null,
    basis: 'RESPONSIVE_SPEC',
    route: '/home',
    state: 'mobile-vertical-journey',
    locale: 'vi',
    viewport: { width: 390, height: 844, deviceScaleFactor: 3 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /home trên viewport iPhone 12/13/14 (390x844)',
      'Kiểm tra Bottom Navigation 5 icon, đường hành trình cuộn dọc'
    ],
    screenshotPath: getExistingScreenshot('learner-home-mobile-390x844.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Bottom navigation 5 mục chuẩn mobile',
      'Đường hành trình chuyển sang cuộn dọc mượt mà',
      'Touch targets >= 56px cho ngón tay trẻ em'
    ],
    scores: null,
    rubric: null,
    issues: [
          {
                "id": "lhm-layout-01",
                "category": "LAYOUT",
                "severity": "P2",
                "description": "Giao diện mobile cần đồng bộ phong cách với desktop: giữ linh vật rùa và dock sáng tạo tinh gọn theo trục dọc.",
                "blocking": false
          }
    ],
    assetIssues: [],
    functionalEvidencePaths: ['tests/responsive_and_acceptance.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['learner-home-overview-desktop-vi'],
    iterations: []
  },

  // 2. resources-catalog
  {
    reviewId: 'resources-catalog-desktop-vi',
    referenceId: 'resources-catalog',
    referencePath: 'docs/mockups/05-resources-catalog.png',
    basis: 'REFERENCE',
    route: '/resources',
    state: 'catalog-grid-view',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /resources',
      'Chuyển sang chế độ lưới duyệt toàn diện',
      'Kiểm tra thanh tìm kiếm, bộ lọc chủ đề và danh sách thẻ học liệu'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Thống nhất taxonomy và LearnerShell',
      'Nội dung mẫu không phải dataset thô',
      'Hỗ trợ trạng thái ít/nhiều/rỗng và tìm không thấy'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/resources_and_simulations.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['resources-library-overview-desktop-vi'],
    iterations: []
  },

  // 3. public-landing-overview
  {
    reviewId: 'public-landing-overview-desktop-vi',
    referenceId: 'public-landing-overview',
    referencePath: 'docs/mockups/01-landing.png',
    basis: 'REFERENCE',
    route: '/',
    state: 'hero-beat1-viewport',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route / ở chế độ khách chưa đăng nhập',
      'Kiểm tra Hero beat 1, tiêu đề Living Ocean, nút Khám phá ngay'
    ],
    screenshotPath: getExistingScreenshot('landing-desktop-1536x1024.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Bỏ An/Hồ sơ đăng nhập khỏi header public',
      'Giữ trọn vẹn 7 nhịp đại dương',
      'Kiểm soát vật liệu chai nhựa, giảm slogan tự sinh vô nghĩa'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: 'Hero thoáng đãng, logo và CTA cân đối', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: 'Mặt nước phản chiếu caustics', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: 'Typography rõ ràng, song ngữ VI', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: 'Nút CTA Coral nổi bật', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: 'Màu xanh nước biển trong trẻo', discrepancies: [], evidencePaths: [] }
    },
    issues: [
          {
                "id": "pl-shell-01",
                "category": "LAYOUT",
                "severity": "P1",
                "description": "Thanh navbar công khai đang để lộ avatar học sinh An; cần navbar công khai độc lập.",
                "blocking": false
          },
          {
                "id": "pl-hero-01",
                "category": "ASSET",
                "severity": "P1",
                "description": "Nền đại dương hero cần luồng sáng xuyên nước (light rays) Living Ocean tráng lệ.",
                "blocking": false
          }
    ],
    assetIssues: [
          {
                "assetId": "landing-hero-cinematic-bg",
                "cause": "ASSET_CONTENT",
                "resolutionPlan": "Tự sinh ảnh nền đại dương xanh thẳm với luồng sáng xuyên nước",
                "status": "OPEN"
          }
    ],
    functionalEvidencePaths: ['tests/landing_concepts.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['public-landing-beat2-beat3-desktop-vi', 'public-landing-beat3-3d-turtle-desktop-vi', 'public-landing-overview-mobile-vi'],
    iterations: []
  },
  {
    reviewId: 'public-landing-beat2-beat3-desktop-vi',
    referenceId: 'public-landing-overview',
    referencePath: 'docs/mockups/01-landing.png',
    basis: 'REFERENCE',
    route: '/',
    state: 'beat-2-and-3-depths',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /',
      'Cuộn xuống beat 2 (Khám phá đại dương) và beat 3 (Sân chơi tương tác)'
    ],
    screenshotPath: getExistingScreenshot('landing-beat2-beat3-1536x1024.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Tách riêng đoạn nhịp 2 và 3 theo Rule K.3 trang dài',
      'Độ sâu ánh sáng chuyển tiếp mượt mà'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: 'Thẻ tính năng xếp lưới 3 cột cân đối', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: 'Hình ảnh đại dương Living Ocean', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: 'Phân cấp heading và body chuẩn', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: 'Bo góc thẻ mềm mại chuẩn trẻ thơ', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: 'Gradient chuyển sắc xanh thẩm', discrepancies: [], evidencePaths: [] }
    },
    issues: [
          {
                "id": "pl-b2b3-01",
                "category": "LAYOUT",
                "severity": "P2",
                "description": "Nhịp chuyển đổi giữa hệ sinh thái học tập và khối 3D tương tác cần mượt mà và đúng tỷ lệ.",
                "blocking": false
          }
    ],
    assetIssues: [],
    functionalEvidencePaths: ['tests/landing_concepts.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['public-landing-overview-desktop-vi'],
    iterations: []
  },
  {
    reviewId: 'public-landing-beat3-3d-turtle-desktop-vi',
    referenceId: 'public-landing-overview',
    referencePath: 'docs/mockups/01-landing.png',
    basis: 'REFERENCE',
    route: '/',
    state: 'beat-3-3d-turtle-interactive',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /',
      'Cuộn đến vị trí nhúng mô hình 3D Rùa Xanh tại beat 3'
    ],
    screenshotPath: getExistingScreenshot('landing-beat3-3d-turtle-1536x1024.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Nhúng trực tiếp Three.js canvas thật',
      'Khung tương tác orbit điều khiển góc nhìn'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: 'Khung 3D tương tác trung tâm beat 3', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: 'Mô hình rùa biển Three.js chân thực', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: 'Nhãn chú thích hotspot', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: 'Nút điều khiển xoay và thu phóng', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: 'Độ sâu ánh sáng caustics WebGL', discrepancies: [], evidencePaths: [] }
    },
    issues: [
          {
                "id": "pl-3d-01",
                "category": "3D_MODEL",
                "severity": "P2",
                "description": "Khung 3D rùa biển nhúng cần hiệu ứng caustics và điều khiển xoay chuột mượt mà.",
                "blocking": false
          }
    ],
    assetIssues: [],
    functionalEvidencePaths: ['tests/landing_concepts.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['public-landing-overview-desktop-vi'],
    iterations: []
  },
  {
    reviewId: 'public-landing-overview-mobile-vi',
    referenceId: 'public-landing-overview',
    referencePath: null,
    basis: 'RESPONSIVE_SPEC',
    route: '/',
    state: 'mobile-landing-full',
    locale: 'vi',
    viewport: { width: 390, height: 844, deviceScaleFactor: 3 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route / trên màn hình di động 390x844',
      'Kiểm tra responsive 7 nhịp co giãn tự nhiên, không tràn ngang'
    ],
    screenshotPath: getExistingScreenshot('landing-mobile-390x844.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Kiểm tra không bị ngang/bể layout trên mobile',
      'Touch target các nút khám phá >= 48px'
    ],
    scores: null,
    rubric: null,
    issues: [
          {
                "id": "plm-layout-01",
                "category": "LAYOUT",
                "severity": "P2",
                "description": "Loại bỏ avatar học sinh khỏi navbar mobile công khai; căn chỉnh các khối thẻ xếp dọc tự nhiên.",
                "blocking": false
          }
    ],
    assetIssues: [],
    functionalEvidencePaths: ['tests/responsive_and_acceptance.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['public-landing-overview-desktop-vi'],
    iterations: []
  },

  // 4. public-role-and-access
  {
    reviewId: 'public-role-and-access-desktop-vi',
    referenceId: 'public-role-and-access',
    referencePath: 'docs/mockups/02-entry.png',
    basis: 'REFERENCE',
    route: '/entry',
    state: 'role-selection-default',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /entry',
      'Kiểm tra 3 thẻ vai trò (Trẻ em / Giáo viên / Khách) và ô nhập mã lớp 6 ký tự'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Không hiển thị như người dùng đã đăng nhập',
      'Bỏ mẫu danh tính giả khỏi trạng thái chưa xác thực'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/shells_and_i18n.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['public-adult-login-desktop-vi'],
    iterations: []
  },

  // 5. public-adult-login
  {
    reviewId: 'public-adult-login-desktop-vi',
    referenceId: 'public-adult-login',
    referencePath: 'docs/mockups/27-login.png',
    basis: 'REFERENCE',
    route: '/login',
    state: 'teacher-login-form',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /login',
      'Kiểm tra form đăng nhập người lớn/giáo viên với demo credentials'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Validation theo đặc tả, không giữ slogan vô nghĩa',
      'Xác thực local, form sạch, không giả lập email/SMS server'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/shells_and_i18n.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['teacher-dashboard-desktop-vi'],
    iterations: []
  },

  // 6. resources-library-overview
  {
    reviewId: 'resources-library-overview-desktop-vi',
    referenceId: 'resources-library-overview',
    referencePath: 'docs/mockups/06-resources-library-overview.png',
    basis: 'REFERENCE',
    route: '/resources',
    state: 'curated-collections-overview',
    locale: 'vi',
    viewport: { width: 1024, height: 1536, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /resources',
      'Kiểm tra danh mục tuyển chọn: Rạn san hô, Tầng nước sâu, Động vật biển'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Dùng chung taxonomy với catalog',
      'Active menu Học liệu'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/resources_and_simulations.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['resources-catalog-desktop-vi', 'resources-flashcard-detail-desktop-vi'],
    iterations: []
  },

  // 7. resources-flashcard-detail
  {
    reviewId: 'resources-flashcard-detail-desktop-vi',
    referenceId: 'resources-flashcard-detail',
    referencePath: 'docs/mockups/07-resources-flashcard.png',
    basis: 'REFERENCE',
    route: '/resources/flashcard',
    state: 'flashcard-green-turtle-front',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /resources/flashcard',
      'Chọn thẻ Rùa Xanh',
      'Kiểm tra hình ảnh, nút lật thẻ 2 mặt và nút phát âm'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Active menu Học liệu',
      'Sidebar không tự sinh',
      'Mở rộng đặc điểm sinh học theo nhu cầu'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/resources_and_simulations.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['resources-library-overview-desktop-vi'],
    iterations: []
  },

  // 8. resources-media-player
  {
    reviewId: 'resources-media-player-desktop-vi',
    referenceId: 'resources-media-player',
    referencePath: 'docs/mockups/08-resources-media.png',
    basis: 'REFERENCE',
    route: '/resources/media',
    state: 'player-ocean-currents',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /resources/media',
      'Xem video bài học đại dương',
      'Kiểm tra thanh điều khiển tua/dừng/phóng to và mô tả sinh học'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Phát media thật hoặc placeholder trung thực',
      'Bỏ video hoạt hình Big Buck Bunny không liên quan'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/resources_and_simulations.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['resources-library-overview-desktop-vi'],
    iterations: []
  },

  // 9. resources-print-preview
  {
    reviewId: 'resources-print-preview-desktop-vi',
    referenceId: 'resources-print-preview',
    referencePath: 'docs/mockups/09-resources-print.png',
    basis: 'REFERENCE',
    route: '/resources/print',
    state: 'turtle-coloring-preview',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /resources/print',
      'Kiểm tra khung xem trước tranh tô màu Rùa Xanh A4 và nút In ấn'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Bỏ mục cộng đồng tự sinh',
      'Xuất PDF/in trực tiếp từ trình duyệt'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/resources_and_simulations.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['resources-library-overview-desktop-vi'],
    iterations: []
  },

  // 10. ocean-horizontal-atlas
  {
    reviewId: 'ocean-horizontal-atlas-desktop-vi',
    referenceId: 'ocean-horizontal-atlas',
    referencePath: 'docs/mockups/10-learn-atlas-horizontal.png',
    basis: 'REFERENCE',
    route: '/learn/atlas',
    state: 'horizontal-panoramic-view',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /learn/atlas',
      'Chọn chế độ bản đồ ngang',
      'Kiểm tra cảnh quan cồn cát, thảm cỏ biển, rạn san hô và lớp đánh bắt'
    ],
    screenshotPath: getExistingScreenshot('ocean-atlas-horizontal-1536x1024.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Active menu Học tập',
      'Cồn cát thuộc đất liền, đánh bắt là lớp hoạt động độc lập',
      'Tránh chữ quá dày cho trẻ'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: 'Cảnh panorama ngang trải rộng từ bờ biển ra khơi', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: 'Minh họa sinh thái Living Ocean', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: 'Nhãn vùng sinh thái ngắn gọn thân thiện', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: 'Các điểm chạm tương tác sinh vật', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: 'Phối màu nước biển nông sang sâu', discrepancies: [], evidencePaths: [] }
    },
    issues: [
          {
                "id": "oha-layout-01",
                "category": "LAYOUT",
                "severity": "P1",
                "description": "Toàn cảnh đại dương cần mở rộng ngang với các trạm ghim nhấp nháy phát sáng và nút gạt lớp hoạt động con người.",
                "blocking": false
          }
    ],
    assetIssues: [
          {
                "assetId": "atlas-horizontal-panoramic-bg",
                "cause": "ASSET_CONTENT",
                "resolutionPlan": "Tự sinh ảnh toàn cảnh đại dương trải dài 2400px từ ven bờ ra biển sâu",
                "status": "OPEN"
          }
    ],
    functionalEvidencePaths: ['tests/learner_journey.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['ocean-vertical-atlas-desktop-vi'],
    iterations: []
  },

  // 11. ocean-vertical-atlas
  {
    reviewId: 'ocean-vertical-atlas-desktop-vi',
    referenceId: 'ocean-vertical-atlas',
    referencePath: 'docs/mockups/11-learn-atlas-vertical.png',
    basis: 'REFERENCE',
    route: '/learn/atlas',
    state: 'vertical-5-layers-depth',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /learn/atlas',
      'Chuyển sang chế độ bản đồ dọc (5 tầng nước)',
      'Kiểm tra tầng ánh sáng, hoàng hôn, nửa đêm, vực thẳm và rãnh sâu'
    ],
    screenshotPath: getExistingScreenshot('ocean-atlas-vertical-1536x1024.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Không gán sứa cho mọi tầng nước',
      'Thông số áp suất và ánh sáng chính xác về khoa học'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: 'Mặt cắt đứng 5 tầng đại dương', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: 'Sinh vật phân bố theo độ sâu sinh thái chuẩn', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: 'Chỉ số độ sâu mét và áp suất', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: 'Thang đo độ sâu trực quan', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: 'Độ tối gradient từ xanh ngọc đến xanh đen vực thẳm', discrepancies: [], evidencePaths: [] }
    },
    issues: [
          {
                "id": "ova-layout-01",
                "category": "LAYOUT",
                "severity": "P1",
                "description": "Thước đo độ sâu cần vạch chia rõ từ 0m đến 6000m+, đồng hồ đo ánh sáng và áp suất; silhouette sinh vật từng tầng.",
                "blocking": false
          }
    ],
    assetIssues: [],
    functionalEvidencePaths: ['tests/learner_journey.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['ocean-horizontal-atlas-desktop-vi'],
    iterations: []
  },

  // 12. ocean-creature-viewer
  {
    reviewId: 'ocean-creature-viewer-desktop-vi',
    referenceId: 'ocean-creature-viewer',
    referencePath: 'docs/mockups/12-learn-turtle.png',
    basis: 'REFERENCE',
    route: '/learn/turtle',
    state: 'interactive-3d-sea-turtle',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /learn/turtle',
      'Tải scene Three.js Rùa Xanh 3D',
      'Kiểm tra các điểm chạm Hotspot trên mai và vây rùa'
    ],
    screenshotPath: getExistingScreenshot('viewer-3d-turtle-1536x1024.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Active menu Học tập',
      'Dùng Three.js 3D thật xoay/zoom, không dùng ảnh phẳng',
      'Hotspot gắn trên mai và vây kèm thuyết minh'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: 'Bố cục toàn màn hình đại dương Three.js', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: 'Mô hình Rùa Xanh 3D bơi lội tuần hoàn', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: 'Thẻ thông tin sinh học popup khi chạm', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: 'Điểm chạm phát xung sóng nhẹ', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: 'Ánh nắng khúc xạ caustics dưới nước', discrepancies: [], evidencePaths: [] }
    },
    issues: [
          {
                "id": "ocv-layout-01",
                "category": "LAYOUT",
                "severity": "P1",
                "description": "Thiếu bảng thông tin sinh học 4 tab bên phải (\"Cách bơi\", \"Nơi sống\", \"Thức ăn\", \"Mối đe dọa\") và thanh dock công cụ đáy (Đặt lại camera, X-Ray, Bơi).",
                "blocking": false
          }
    ],
    assetIssues: [
          {
                "assetId": "turtle-3d-model-rig",
                "cause": "MODEL_ANIMATION",
                "resolutionPlan": "Hoàn thiện Three.js rig vây trước và vây sau cho chu kỳ bơi tự nhiên",
                "status": "OPEN"
          }
    ],
    functionalEvidencePaths: ['tests/learner_journey.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['learner-home-overview-desktop-vi'],
    iterations: []
  },

  // 13. game-lab-overview
  {
    reviewId: 'game-lab-overview-desktop-vi',
    referenceId: 'game-lab-overview',
    referencePath: 'docs/mockups/13-interactive.png',
    basis: 'REFERENCE',
    route: '/interactive',
    state: 'game-modes-selection',
    locale: 'vi',
    viewport: { width: 1024, height: 1536, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /interactive',
      'Kiểm tra 3 phân nhóm: Nhận biết, Thấu hiểu, Vận dụng'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Active menu Tương tác',
      'Đưa lối tiếp tục rõ, giảm dày thẻ cho trẻ',
      'Thẻ tương tác trực quan'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/resources_and_simulations.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['game-lab-recognition-round-desktop-vi', 'game-lab-habitat-placement-desktop-vi'],
    iterations: []
  },

  // 14. game-lab-recognition-round
  {
    reviewId: 'game-lab-recognition-round-desktop-vi',
    referenceId: 'game-lab-recognition-round',
    referencePath: 'docs/mockups/14-interactive-habitat-recognition.png',
    basis: 'REFERENCE',
    route: '/interactive/habitat-placement',
    state: 'recognition-round-options',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở trò chơi nhận biết sinh vật biển',
      'Nghe câu hỏi nhận dạng',
      'Kiểm tra các lựa chọn sinh vật biển hình tròn'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Áp dụng immersive shell chuẩn từ ảnh habitat-placement mới',
      'Tối thiểu 3 lượt, không phạt mạng, phản hồi trực quan'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/learner_journey.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['game-lab-habitat-placement-desktop-vi'],
    iterations: []
  },

  // 15. game-lab-habitat-placement
  {
    reviewId: 'game-habitat-placement-desktop-vi',
    referenceId: 'game-lab-habitat-placement',
    referencePath: 'docs/mockups/15-interactive-habitat-placement.png',
    basis: 'REFERENCE',
    route: '/interactive/habitat-placement',
    state: 'round-1-before-placement',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở hoạt động với phiên chơi mới tại route /interactive/habitat-placement',
      'Chuyển đến bước đặt, chưa chọn nơi đặt'
    ],
    screenshotPath: getExistingScreenshot('game-habitat-placement-1536x1024.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Shell tập trung Immersive, nút nghe lại/tạm dừng',
      '3 vùng đặt rõ ràng: Rừng ngập mặn, Thảm cỏ biển nông, Vực sâu',
      'Rùa xanh trong dock thao tác, nút Quan sát disabled trước placement',
      'Vùng cát trái không chìm nước vô lý; hướng dẫn Chạm nơi muốn đặt'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: 'Bố cục 3 vùng đặt ở trên, khay dock động vật ở dưới', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: 'Hình ảnh sinh cảnh cỏ biển, rừng đước và vực sâu', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: 'Câu hỏi dẫn dắt chữ lớn, rõ ràng', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: 'Vùng thả có viền nét đứt phát sáng nhẹ', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: 'Độ tương phản cao giữa vùng cạn và vùng sâu', discrepancies: [], evidencePaths: [] }
    },
    issues: [
          {
                "id": "ghp-layout-01",
                "category": "LAYOUT",
                "severity": "P1",
                "description": "3 vùng thả đang là các hộp tối phẳng, cần chuyển thành 3 hình bầu dục nét đứt phát sáng trực tiếp trên địa hình bãi cát/thảm cỏ/san hô; dock đáy cần chứa sinh vật có thể kéo thả.",
                "blocking": false
          }
    ],
    assetIssues: [
          {
                "assetId": "habitat-split-seabed-bg",
                "cause": "ASSET_CONTENT",
                "resolutionPlan": "Tự sinh ảnh nền đáy biển chia 3 vùng bãi cát ven bờ, thảm cỏ biển, rạn san hô",
                "status": "OPEN"
          },
          {
                "assetId": "creature-cutout-sprites",
                "cause": "ASSET_CONTENT",
                "resolutionPlan": "Tự sinh bộ 3 sinh vật cô lập phông trắng sạch: Cua, Cá hề, Rùa biển",
                "status": "OPEN"
          }
    ],
    functionalEvidencePaths: ['tests/learner_journey.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['game-habitat-feedback-desktop-vi'],
    iterations: []
  },

  // 16. game-lab-habitat-feedback
  {
    reviewId: 'game-habitat-feedback-desktop-vi',
    referenceId: 'game-lab-habitat-feedback',
    referencePath: 'docs/mockups/16-interactive-habitat-feedback.png',
    basis: 'REFERENCE',
    route: '/interactive/habitat-placement',
    state: 'round-1-after-placement-feedback',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Kéo/thả Rùa Xanh vào Thảm cỏ biển nông',
      'Quan sát hiệu ứng rùa bơi đến ăn cỏ và hộp thoại giải thích sinh học'
    ],
    screenshotPath: getExistingScreenshot('game-habitat-feedback-1536x1024.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Dùng shell/camera/đối tượng thống nhất của placement mới',
      'Không nhân đôi vật đã đặt trong dock',
      'Cho phép thử lại tự do không trừ điểm'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: 'Hộp thoại phản hồi mở nhẹ nhàng không che cảnh vật', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: 'Rùa bơi vào đúng vị trí sinh cảnh', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: 'Lời chúc mừng và giải thích khoa học NOAA', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: 'Bọt nước nổi lên sinh động', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: 'Ánh nắng mặt trời rọi xuống thảm cỏ biển', discrepancies: [], evidencePaths: [] }
    },
    issues: [
          {
                "id": "ghf-layout-01",
                "category": "LAYOUT",
                "severity": "P1",
                "description": "Modal phản hồi sinh học cần hiển thị rõ giải thích sinh thái vì sao rùa biển thích nghi với thảm cỏ biển, hiệu ứng sao chúc mừng.",
                "blocking": false
          }
    ],
    assetIssues: [],
    functionalEvidencePaths: ['tests/learner_journey.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['game-habitat-placement-desktop-vi'],
    iterations: []
  },

  // 17. simulations-catalog
  {
    reviewId: 'simulations-catalog-desktop-vi',
    referenceId: 'simulations-catalog',
    referencePath: 'docs/mockups/17-interactive-simulations.png',
    basis: 'REFERENCE',
    route: '/interactive/simulations',
    state: 'simulations-list',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /interactive/simulations',
      'Kiểm tra 3 thẻ mô phỏng khoa học: Hành động của em, Hành trình rác nhựa, Nhiệm vụ giải cứu'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Active menu Tương tác',
      'Không tự thêm simulation ngoài yêu cầu',
      'Thẻ mô phỏng khoa học'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/resources_and_simulations.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['simulations-my-action-choice-desktop-vi', 'simulations-plastic-journey-desktop-vi', 'simulations-rescue-mission-desktop-vi'],
    iterations: []
  },

  // 18. simulations-my-action-choice
  {
    reviewId: 'simulations-my-action-choice-desktop-vi',
    referenceId: 'simulations-my-action-choice',
    referencePath: 'docs/mockups/18-interactive-my-action-choice.png',
    basis: 'REFERENCE',
    route: '/interactive/my-action',
    state: 'step-1-choice-point',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /interactive/my-action',
      'Tại điểm quyết định xử lý chai nhựa: Vứt bừa bãi / Bỏ thùng rác / Tái chế'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Active menu Tương tác',
      'Phân biệt rõ điểm chọn với kết quả hệ quả'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/resources_and_simulations.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['simulations-my-action-compare-desktop-vi'],
    iterations: []
  },

  // 19. simulations-my-action-compare
  {
    reviewId: 'simulations-my-action-compare-desktop-vi',
    referenceId: 'simulations-my-action-compare',
    referencePath: 'docs/mockups/19-interactive-my-action-compare.png',
    basis: 'REFERENCE',
    route: '/interactive/my-action',
    state: 'step-2-compare-consequences',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Hoàn thành 2 lần lựa chọn',
      'Xem màn so sánh song song hệ quả 2 hành động'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Cùng camera/object ban đầu',
      'Bước hiện tại phải là kết quả/so sánh trực quan'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/resources_and_simulations.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['simulations-my-action-choice-desktop-vi'],
    iterations: []
  },

  // 20. simulations-plastic-journey
  {
    reviewId: 'simulations-plastic-journey-desktop-vi',
    referenceId: 'simulations-plastic-journey',
    referencePath: 'docs/mockups/20-interactive-plastic-journey.png',
    basis: 'REFERENCE',
    route: '/interactive/plastic-journey',
    state: 'journey-5-stages-interactive',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /interactive/plastic-journey',
      'Kiểm tra 5 chặng hành trình mảnh nhựa và điểm can thiệp thu gom'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Bỏ header/sidebar tự chế',
      'Theo shell simulation thống nhất',
      'Có điểm dự đoán và can thiệp dọn rác, không phải video tuyến tính'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/resources_and_simulations.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['simulations-catalog-desktop-vi'],
    iterations: []
  },

  // 21. simulations-rescue-mission
  {
    reviewId: 'simulations-rescue-mission-desktop-vi',
    referenceId: 'simulations-rescue-mission',
    referencePath: 'docs/mockups/21-interactive-rescue-mission.png',
    basis: 'REFERENCE',
    route: '/interactive/rescue-mission',
    state: 'rescue-sea-turtle-net',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /interactive/rescue-mission',
      'Chọn nhiệm vụ cứu rùa biển vướng lưới',
      'Kiểm tra thao tác hỗ trợ an toàn: Báo người lớn / Gọi trung tâm bảo tồn'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Không hướng dẫn trẻ tự tiếp cận/cắt lưới động vật',
      'Logic an toàn: Báo người lớn hoặc gọi cứu hộ bảo tồn biển'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/resources_and_simulations.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['simulations-catalog-desktop-vi'],
    iterations: []
  },

  // 22. creative-studio
  {
    reviewId: 'creative-studio-desktop-vi',
    referenceId: 'creative-studio',
    referencePath: 'docs/mockups/23-creative.png',
    basis: 'REFERENCE',
    route: '/creative',
    state: 'studio-overview-shelves',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /creative',
      'Kiểm tra khay trưng bày sản phẩm thực tế và 2 nút tạo mới: Vẽ tranh 2D, Xây sinh cảnh 3D'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Ô rỗng dùng tạo mới, không để nút Mở tác phẩm vô nghĩa',
      'Bỏ slogan tự sinh',
      'Hiển thị tác phẩm đã lưu thực tế từ IndexedDB'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/creative_studio.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['creative-drawing-desktop-vi', 'creative-habitat-build-desktop-vi'],
    iterations: []
  },

  // 23. creative-drawing
  {
    reviewId: 'creative-drawing-desktop-vi',
    referenceId: 'creative-drawing',
    referencePath: 'docs/mockups/24-creative-drawing.png',
    basis: 'REFERENCE',
    route: '/creative/drawing',
    state: 'drawing-canvas-active',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /creative/drawing',
      'Vẽ nét cọ màu Living Ocean trên canvas',
      'Kiểm tra thanh công cụ cọ, màu, tẩy, undo/redo và nút lưu tranh'
    ],
    screenshotPath: getExistingScreenshot('creative-drawing-1536x1024.png'),
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: '2026-09-14T07:20:00.000Z',
    sourceRevision: currentRevision,
    appliedCorrections: [
      'Công cụ thật 100% hoạt động',
      'Lưu và mở giữ nguyên tác phẩm qua IndexedDB',
      'Canvas thích ứng tự nhiên với màn hình'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: 'Khung vẽ canvas trung tâm, khay cọ màu bên hông', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: 'Bảng màu Living Ocean 8 sắc thái sinh vật biển', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: 'Nhãn công cụ vẽ dễ nhìn', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: 'Độ mượt mà nét vẽ trên canvas 2D', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: 'Độ trong sáng và rực rỡ màu vẽ', discrepancies: [], evidencePaths: [] }
    },
    issues: [
          {
                "id": "cd-layout-01",
                "category": "LAYOUT",
                "severity": "P1",
                "description": "Bàn vẽ cần bảng công cụ chất liệu gỗ mộc bên trái, bảng màu gốm bên phải, thanh công cụ cọ vẽ tự nhiên.",
                "blocking": false
          }
    ],
    assetIssues: [
          {
                "assetId": "craft-drawing-tools",
                "cause": "ASSET_CONTENT",
                "resolutionPlan": "Tự sinh bộ icon công cụ cọ sáp, màu nước và đĩa màu gốm",
                "status": "OPEN"
          }
    ],
    functionalEvidencePaths: ['tests/creative_studio.test.ts'],
    visualStatus: 'FAIL',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NEEDS_FIX',
    usedByReviewIds: ['creative-studio-desktop-vi', 'responsive-tablet-creative'],
    iterations: []
  },

  // 24. creative-habitat-build
  {
    reviewId: 'creative-habitat-build-desktop-vi',
    referenceId: 'creative-habitat-build',
    referencePath: 'docs/mockups/25-creative-habitat-build.png',
    basis: 'REFERENCE',
    route: '/creative/habitat',
    state: 'build-mode-placing-elements',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /creative/habitat ở chế độ Dựng (Build Mode)',
      'Kéo thả rạn san hô, cỏ biển, cá lên nền cát Three.js isometric'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Cùng objectId/transform với chế độ Run',
      'Phân biệt rõ trạng thái Edit và Run',
      'Bỏ công cụ dư thừa không tương tác'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/creative_studio.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['creative-habitat-run-desktop-vi'],
    iterations: []
  },

  // 25. creative-habitat-run
  {
    reviewId: 'creative-habitat-run-desktop-vi',
    referenceId: 'creative-habitat-run',
    referencePath: 'docs/mockups/26-creative-habitat-run.png',
    basis: 'REFERENCE',
    route: '/creative/habitat',
    state: 'run-mode-simulation-active',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Nhấn nút "Chạy thử sinh cảnh"',
      'Kích hoạt sinh vật bơi lội tuần hoàn và bọt khí động',
      'Kiểm tra nút Quay lại sửa sinh cảnh'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Không tự đổi hình học khi chuyển từ Build sang Run',
      'Cùng dữ liệu vật thể và vị trí toạ độ với bản dựng'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/creative_studio.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['creative-habitat-build-desktop-vi'],
    iterations: []
  },

  // 26. profile-learner-profile
  {
    reviewId: 'profile-learner-profile-desktop-vi',
    referenceId: 'profile-learner-profile',
    referencePath: 'docs/mockups/04-profile.png',
    basis: 'REFERENCE',
    route: '/profile',
    state: 'learner-achievements-and-gallery',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /profile',
      'Kiểm tra tiến trình học tập, vỏ sò tích lũy, huy hiệu đạt được và tranh vẽ đã lưu'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Bỏ sidebar không chuẩn LearnerShell',
      'Không dựng thành tích giả, lấy dữ liệu thực từ demoStore & IndexedDB'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/learner_journey.test.ts', 'tests/creative_studio.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['learner-home-overview-desktop-vi'],
    iterations: []
  },

  // 27. teacher-dashboard
  {
    reviewId: 'teacher-dashboard-desktop-vi',
    referenceId: 'teacher-dashboard',
    referencePath: 'docs/mockups/28-teacher.png',
    basis: 'REFERENCE',
    route: '/teacher',
    state: 'teacher-workspace-overview',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Đăng nhập tài khoản giáo viên Cô Linh',
      'Mở route /teacher',
      'Kiểm tra bàn làm việc, tổng quan lớp học mầm non, giáo án gần đây'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Mật độ công cụ người lớn chuyên nghiệp',
      'Danh tính giáo viên Cô Linh, đồng nhất TeacherShell'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/teacher_suite_sync.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['teacher-resource-library-desktop-vi', 'teacher-lesson-plan-desktop-vi', 'teacher-live-console-desktop-vi'],
    iterations: []
  },

  // 28. teacher-resource-library
  {
    reviewId: 'teacher-resource-library-desktop-vi',
    referenceId: 'teacher-resource-library',
    referencePath: 'docs/mockups/29-teacher-library.png',
    basis: 'REFERENCE',
    route: '/teacher/library',
    state: 'teacher-materials-catalog',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /teacher/library',
      'Kiểm tra danh mục giáo cụ STEAM dành riêng cho lứa tuổi 5-6 tuổi'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Bỏ Tiểu học/THCS/THPT sai phạm vi lứa tuổi mầm non',
      'Active menu Học liệu trong TeacherShell'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/teacher_suite_sync.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['teacher-dashboard-desktop-vi'],
    iterations: []
  },

  // 29. teacher-lesson-plan
  {
    reviewId: 'teacher-lesson-plan-desktop-vi',
    referenceId: 'teacher-lesson-plan',
    referencePath: 'docs/mockups/31-teacher-builder-plan.png',
    basis: 'REFERENCE',
    route: '/teacher/builder',
    state: 'lesson-plan-detail-view',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở chi tiết giáo án Khám phá Rạn san hô',
      'Kiểm tra cấu trúc sư phạm 5 bước và mục tiêu đầu ra'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Cấu trúc giáo án chuẩn mực sư phạm STEAM',
      'Nội dung giáo án thực tế, không lorem ipsum'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/teacher_suite_sync.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['teacher-lesson-builder-desktop-vi'],
    iterations: []
  },

  // 30. teacher-lesson-builder
  {
    reviewId: 'teacher-lesson-builder-desktop-vi',
    referenceId: 'teacher-lesson-builder',
    referencePath: 'docs/mockups/30-teacher-builder.png',
    basis: 'REFERENCE',
    route: '/teacher/builder',
    state: 'builder-editing-flow',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở trình soạn bài giảng /teacher/builder',
      'Kiểm tra ghép nối hoạt động vào tiến trình tiết học và khung preview'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Selection bước phải khớp chính xác với preview',
      'Đồng bộ số bước khi chuyển sang Live Console'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/teacher_suite_sync.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['teacher-live-console-desktop-vi'],
    iterations: []
  },

  // 31. teacher-live-console
  {
    reviewId: 'teacher-live-console-desktop-vi',
    referenceId: 'teacher-live-console',
    referencePath: 'docs/mockups/32-teacher-live.png',
    basis: 'REFERENCE',
    route: '/teacher/live',
    state: 'live-control-session',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở bàn điều khiển tiết học trực tiếp /teacher/live',
      'Kiểm tra nút chuyển bước, thăm dò và đồng bộ BroadcastChannel với Presentation'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Đồng bộ tức thì với Presentation qua BroadcastChannel',
      'Điều khiển bước, phát media, quản lý trạng thái học sinh'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/teacher_suite_sync.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['teacher-presentation-desktop-vi'],
    iterations: []
  },

  // 32. teacher-presentation
  {
    reviewId: 'teacher-presentation-desktop-vi',
    referenceId: 'teacher-presentation',
    referencePath: 'docs/mockups/33-presentation.png',
    basis: 'REFERENCE',
    route: '/presentation',
    state: 'fullscreen-class-presentation',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở màn trình chiếu /presentation trên tab riêng',
      'Kiểm tra giao diện toàn màn hình, chữ cực to, không có menu cá nhân hay thanh công cụ giáo viên'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Chỉ dùng cảnh làm tham khảo',
      'Loại bỏ hoàn toàn menu trẻ, avatar An và công cụ giáo viên riêng tư',
      'Chữ cực to dễ đọc từ cuối lớp học'
    ],
    scores: {
      layout: null,
      assetsAndLayers: null,
      typographyAndSpacing: null,
      shapesAndDetails: null,
      colorAndDepth: null,
      total: null
    },
    rubric: {
      layout: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      assetsAndLayers: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      typographyAndSpacing: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      shapesAndDetails: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] },
      colorAndDepth: { maxPoints: 20, awardedPoints: null, notes: '', discrepancies: [], evidencePaths: [] }
    },
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/teacher_suite_sync.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['teacher-live-console-desktop-vi'],
    iterations: []
  },

  // 33. teacher-session-results (Spec Only)
  {
    reviewId: 'teacher-session-results-desktop-vi',
    referenceId: '09-teacher/07-results-and-profile',
    referencePath: null,
    basis: 'SPEC_ONLY',
    route: '/teacher/results',
    state: 'class-session-summary-report',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở route /teacher/results sau khi kết thúc buổi dạy',
      'Kiểm tra thống kê số hoạt động hoàn thành, mức độ tương tác và tác phẩm tiêu biểu của học sinh'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Đặc tả trong Plan: Báo cáo kết quả buổi học',
      'Thống kê số hoạt động hoàn thành, tác phẩm tiêu biểu'
    ],
    scores: null,
    rubric: null,
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/teacher_suite_sync.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['teacher-dashboard-desktop-vi'],
    iterations: []
  },

  // 34. system-loading-retry (Spec Only)
  {
    reviewId: 'system-loading-retry-desktop-vi',
    referenceId: '10-system/01-loading-and-retry',
    referencePath: null,
    basis: 'SPEC_ONLY',
    route: '/home?loading=true',
    state: 'turtle-loading-and-error-fallback',
    locale: 'vi',
    viewport: { width: 1536, height: 1024, deviceScaleFactor: 1 },
    captureMode: 'viewport',
    setupSteps: [
      'Kích hoạt trạng thái tải chậm > 300ms hoặc ngắt kết nối WebGL',
      'Kiểm tra rùa nhỏ bơi chờ và nút Thử lại'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Rùa nhỏ bơi chờ (chỉ hiện khi tải > 300ms)',
      'Nút Thử lại rõ ràng khi WebGL lỗi hoặc mạng ngắt'
    ],
    scores: null,
    rubric: null,
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/shells_and_i18n.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['learner-home-overview-desktop-vi'],
    iterations: []
  },

  // 35. responsive-tablet-creative (Responsive Spec)
  {
    reviewId: 'responsive-tablet-creative-vi',
    referenceId: '10-system/02-tablet-creative',
    referencePath: null,
    basis: 'RESPONSIVE_SPEC',
    route: '/creative/drawing',
    state: 'tablet-landscape-drawing-layout',
    locale: 'vi',
    viewport: { width: 1024, height: 768, deviceScaleFactor: 2 },
    captureMode: 'viewport',
    setupSteps: [
      'Mở /creative/drawing trên tablet 1024x768',
      'Kiểm tra dock công cụ dưới chân, vùng vẽ co giãn, touch target >= 56px'
    ],
    screenshotPath: null,
    sideBySidePath: null,
    overlayPath: null,
    capturedAt: null,
    sourceRevision: null,
    appliedCorrections: [
      'Khay công cụ dock chân màn hình cho tay trẻ em',
      'Touch target >= 56px'
    ],
    scores: null,
    rubric: null,
    issues: [],
    assetIssues: [],
    functionalEvidencePaths: ['tests/responsive_and_acceptance.test.ts'],
    visualStatus: 'NOT_CAPTURED',
    functionalStatus: 'PASS',
    motionStatus: 'NOT_TESTED',
    status: 'NOT_CAPTURED',
    usedByReviewIds: ['creative-drawing-desktop-vi'],
    iterations: []
  }
];

const manifestData = {
  version: '2.0.0',
  title: 'BlueSTEAM v2 Visual Review Manifest (Reference vs Implementation)',
  updatedAt: new Date().toISOString(),
  sourceRevision: currentRevision,
  referenceDirectory: 'docs/mockups',
  verificationDirectory: 'artifacts/verification',
  rubricCriteria: {
    layout: { maxPoints: 20, description: 'Bố cục, căn lề, lưới, tỷ lệ các khối, đáp ứng viewport' },
    assetsAndLayers: { maxPoints: 20, description: 'Chất lượng sinh vật, asset Living Ocean, tách lớp z-index' },
    typographyAndSpacing: { maxPoints: 20, description: 'Phông chữ, phân cấp heading/body, khoảng cách breathing room' },
    shapesAndDetails: { maxPoints: 20, description: 'Bo góc, icon, viền nút, chi tiết tương tác' },
    colorAndDepth: { maxPoints: 20, description: 'Bảng màu Living Ocean, gradient độ sâu, độ tương phản WCAG 2.1 AA' }
  },
  records
};

const targetFile = path.join(REPO_ROOT, 'docs', '12-VERIFICATION', 'visual-review-manifest.json');
fs.writeFileSync(targetFile, JSON.stringify(manifestData, null, 2), 'utf8');
console.log('✅ Generated visual-review-manifest.json with', records.length, 'records.');
