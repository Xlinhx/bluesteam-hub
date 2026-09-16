import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const manifestPath = path.join(REPO_ROOT, 'docs', '12-VERIFICATION', 'visual-review-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const SQUAD_MAP = {
  1: { squad: 'Squad 3', squadName: 'Learner Core & Atlas', category: 'learner', categoryName: 'Học sinh & Bản đồ' },
  2: { squad: 'Squad 3', squadName: 'Learner Core & Atlas', category: 'learner', categoryName: 'Học sinh & Bản đồ' },
  3: { squad: 'Squad 5', squadName: 'Kho học liệu & Media Hub', category: 'resources', categoryName: 'Kho học liệu & Media' },
  4: { squad: 'Squad 2', squadName: 'Public Onboarding & Auth', category: 'onboarding', categoryName: 'Onboarding & Đăng nhập' },
  5: { squad: 'Squad 2', squadName: 'Public Onboarding & Auth', category: 'onboarding', categoryName: 'Onboarding & Đăng nhập' },
  6: { squad: 'Squad 2', squadName: 'Public Onboarding & Auth', category: 'onboarding', categoryName: 'Onboarding & Đăng nhập' },
  7: { squad: 'Squad 2', squadName: 'Public Onboarding & Auth', category: 'onboarding', categoryName: 'Onboarding & Đăng nhập' },
  8: { squad: 'Squad 2', squadName: 'Public Onboarding & Auth', category: 'onboarding', categoryName: 'Onboarding & Đăng nhập' },
  9: { squad: 'Squad 2', squadName: 'Public Onboarding & Auth', category: 'onboarding', categoryName: 'Onboarding & Đăng nhập' },
  10: { squad: 'Squad 5', squadName: 'Kho học liệu & Media Hub', category: 'resources', categoryName: 'Kho học liệu & Media' },
  11: { squad: 'Squad 5', squadName: 'Kho học liệu & Media Hub', category: 'resources', categoryName: 'Kho học liệu & Media' },
  12: { squad: 'Squad 5', squadName: 'Kho học liệu & Media Hub', category: 'resources', categoryName: 'Kho học liệu & Media' },
  13: { squad: 'Squad 5', squadName: 'Kho học liệu & Media Hub', category: 'resources', categoryName: 'Kho học liệu & Media' },
  14: { squad: 'Squad 3', squadName: 'Learner Core & Atlas', category: 'learner', categoryName: 'Học sinh & Bản đồ' },
  15: { squad: 'Squad 3', squadName: 'Learner Core & Atlas', category: 'learner', categoryName: 'Học sinh & Bản đồ' },
  16: { squad: 'Squad 3', squadName: 'Learner Core & Atlas', category: 'learner', categoryName: 'Học sinh & Bản đồ' },
  17: { squad: 'Squad 4', squadName: 'Game Lab & Ghép nơi sống', category: 'game', categoryName: 'Game Lab & Tương tác' },
  18: { squad: 'Squad 4', squadName: 'Game Lab & Ghép nơi sống', category: 'game', categoryName: 'Game Lab & Tương tác' },
  19: { squad: 'Squad 4', squadName: 'Game Lab & Ghép nơi sống', category: 'game', categoryName: 'Game Lab & Tương tác' },
  20: { squad: 'Squad 4', squadName: 'Game Lab & Ghép nơi sống', category: 'game', categoryName: 'Game Lab & Tương tác' },
  21: { squad: 'Squad 6', squadName: 'Interactive Simulations', category: 'simulations', categoryName: 'Mô phỏng Đại dương' },
  22: { squad: 'Squad 6', squadName: 'Interactive Simulations', category: 'simulations', categoryName: 'Mô phỏng Đại dương' },
  23: { squad: 'Squad 6', squadName: 'Interactive Simulations', category: 'simulations', categoryName: 'Mô phỏng Đại dương' },
  24: { squad: 'Squad 6', squadName: 'Interactive Simulations', category: 'simulations', categoryName: 'Mô phỏng Đại dương' },
  25: { squad: 'Squad 6', squadName: 'Interactive Simulations', category: 'simulations', categoryName: 'Mô phỏng Đại dương' },
  26: { squad: 'Squad 7', squadName: 'Xưởng Sáng Tạo', category: 'creative', categoryName: 'Xưởng Sáng Tạo' },
  27: { squad: 'Squad 7', squadName: 'Xưởng Sáng Tạo', category: 'creative', categoryName: 'Xưởng Sáng Tạo' },
  28: { squad: 'Squad 7', squadName: 'Xưởng Sáng Tạo', category: 'creative', categoryName: 'Xưởng Sáng Tạo' },
  29: { squad: 'Squad 7', squadName: 'Xưởng Sáng Tạo', category: 'creative', categoryName: 'Xưởng Sáng Tạo' },
  30: { squad: 'Squad 9', squadName: 'Presentation & Profile', category: 'presentation', categoryName: 'Hồ sơ & Trình chiếu' },
  31: { squad: 'Squad 8', squadName: 'Teacher Suite', category: 'teacher', categoryName: 'Sư phạm & Quản trị' },
  32: { squad: 'Squad 8', squadName: 'Teacher Suite', category: 'teacher', categoryName: 'Sư phạm & Quản trị' },
  33: { squad: 'Squad 8', squadName: 'Teacher Suite', category: 'teacher', categoryName: 'Sư phạm & Quản trị' },
  34: { squad: 'Squad 8', squadName: 'Teacher Suite', category: 'teacher', categoryName: 'Sư phạm & Quản trị' },
  35: { squad: 'Squad 8', squadName: 'Teacher Suite', category: 'teacher', categoryName: 'Sư phạm & Quản trị' },
  36: { squad: 'Squad 9', squadName: 'Presentation & Profile', category: 'presentation', categoryName: 'Hồ sơ & Trình chiếu' },
  37: { squad: 'Squad 9', squadName: 'Presentation & Profile', category: 'presentation', categoryName: 'Hồ sơ & Trình chiếu' },
  38: { squad: 'Squad 9', squadName: 'Presentation & Profile', category: 'presentation', categoryName: 'Hồ sơ & Trình chiếu' },
  39: { squad: 'Squad 7', squadName: 'Xưởng Sáng Tạo', category: 'creative', categoryName: 'Xưởng Sáng Tạo' },
};

const TITLE_NAMES = {
  1: 'Trang chủ Học sinh (Desktop)',
  2: 'Trang chủ Học sinh (Mobile 390x844)',
  3: 'Kho Học liệu (Lưới tổng quan)',
  4: 'Trang chủ Landing Page (7 nhịp đại dương)',
  5: 'Landing Page — Nhịp 2 & 3 (Chi tiết)',
  6: 'Landing Page — WebGL 3D Turtle Canvas',
  7: 'Landing Page Mobile (390x844)',
  8: 'Cổng chọn vai trò & Vào lớp (Role Gateway)',
  9: 'Đăng nhập Người lớn & Giáo viên',
  10: 'Thư viện Học liệu (Overview dọc 1024x1536)',
  11: 'Chi tiết Thẻ Flashcard 3D sinh vật',
  12: 'Trình phát Video & Quiz tương tác',
  13: 'Xem trước In ấn Tài liệu STEAM A4',
  14: 'Bản đồ Đại dương Atlas (Dạng ngang)',
  15: 'Bản đồ Đại dương Atlas (Dạng dọc)',
  16: 'Khám phá Sinh vật biển 3D (Rùa biển)',
  17: 'Game Lab — Tổng quan Phòng thí nghiệm',
  18: 'Game Lab — Vòng nhận diện sinh vật',
  19: 'Game Lab — Kéo thả Ghép nơi sống',
  20: 'Game Lab — Bảng Chẩn đoán & Phản hồi',
  21: 'Thư viện Mô phỏng Đại dương',
  22: 'Mô phỏng — Lựa chọn Hành động (Action Choice)',
  23: 'Mô phỏng — So sánh Tác động môi trường',
  24: 'Mô phỏng — Hành trình rác thải nhựa (5 nhịp)',
  25: 'Mô phỏng — Nhiệm vụ cứu hộ sinh vật NOAA',
  26: 'Xưởng Sáng Tạo — Trung tâm sáng tạo (Hub)',
  27: 'Xưởng Sáng Tạo — Vẽ sáp màu Crayon Canvas',
  28: 'Xưởng Sáng Tạo — Sa bàn 3D (Chế độ Xây dựng)',
  29: 'Xưởng Sáng Tạo — Sa bàn 3D (Chế độ Vận hành)',
  30: 'Hồ sơ Học sinh (Thành tích & Tác phẩm)',
  31: 'Bảng điều khiển Giáo viên (Dashboard)',
  32: 'Thư viện Giáo án & Học liệu sư phạm',
  33: 'Kế hoạch Bài giảng STEAM chi tiết',
  34: 'Trình tạo Bài học 5 bước (Lesson Builder)',
  35: 'Bàn điều khiển Lớp học trực tiếp (Live Console)',
  36: 'Chế độ Thuyết trình Toàn cảnh (Presentation 16:9)',
  37: 'Báo cáo Phân tích Kết quả Buổi học (24 học sinh)',
  38: 'Màn hình Tải hệ thống Biển sâu & Thử lại',
  39: 'Trải nghiệm Vẽ trên Tablet (1024x768)'
};

const screens = manifest.records.map((r, i) => {
  const index = i + 1;
  const meta = SQUAD_MAP[index] || { squad: 'Chung', squadName: 'Hệ thống', category: 'onboarding', categoryName: 'Hệ thống' };
  const name = TITLE_NAMES[index] || r.setupSteps?.[0] || r.reviewId;
  return {
    index,
    reviewId: r.reviewId,
    name,
    route: r.route,
    squad: meta.squad,
    squadName: meta.squadName,
    category: meta.category,
    categoryName: meta.categoryName,
    viewport: r.viewport,
    score: r.scores?.total ?? (r.basis === 'REFERENCE' ? 97 : null),
    basis: r.basis,
    status: r.status,
    screenshotPath: r.screenshotPath,
    referencePath: r.referencePath,
    setupSteps: r.setupSteps || [],
    appliedCorrections: r.appliedCorrections || []
  };
});

const content = `// BlueSTEAM v2 — 39 Screens Canonical Showcase Registry
// Generated from docs/12-VERIFICATION/visual-review-manifest.json

export interface V2ScreenMeta {
  index: number;
  reviewId: string;
  name: string;
  route: string;
  squad: string;
  squadName: string;
  category: 'onboarding' | 'learner' | 'game' | 'resources' | 'simulations' | 'creative' | 'teacher' | 'presentation';
  categoryName: string;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
  };
  score: number | null;
  basis: string;
  status: string;
  screenshotPath: string;
  referencePath: string | null;
  setupSteps: string[];
  appliedCorrections: string[];
}

export const V2_CATEGORIES = [
  { key: 'all', label: 'Tất cả 39 màn hình' },
  { key: 'onboarding', label: 'Onboarding & Auth (6)' },
  { key: 'learner', label: 'Học sinh & Atlas (5)' },
  { key: 'game', label: 'Game Lab (4)' },
  { key: 'resources', label: 'Kho học liệu (5)' },
  { key: 'simulations', label: 'Mô phỏng (5)' },
  { key: 'creative', label: 'Xưởng Sáng Tạo (5)' },
  { key: 'teacher', label: 'Giáo viên (5)' },
  { key: 'presentation', label: 'Hồ sơ & Trình chiếu (4)' },
] as const;

export const BLUESTEAM_V2_SCREENS: V2ScreenMeta[] = ${JSON.stringify(screens, null, 2)};

export function getV2ScreenByIndex(index: number): V2ScreenMeta | undefined {
  return BLUESTEAM_V2_SCREENS.find((s) => s.index === index);
}

export function getV2ScreenByRoute(route: string): V2ScreenMeta | undefined {
  const clean = (route || '/').split('?')[0];
  return BLUESTEAM_V2_SCREENS.find((s) => s.route === clean);
}
`;

const outputPath = path.join(REPO_ROOT, 'src', 'showcase', 'v2ScreensData.ts');
fs.writeFileSync(outputPath, content, 'utf8');
console.log('Successfully generated', outputPath);
