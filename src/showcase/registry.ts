export type ScreenId =
  | 'landingpage'
  | 'studenthome'
  | 'studentjourney'
  | 'learningunit'
  | 'simulation'
  | 'studentprogress'
  | 'teacherdashboard'
  | 'teacherlibrary'
  | 'lessonbuilder'
  | 'liveclass'
  | 'presentation'
  | 'sessionresults'
  | 'joinclass'
  | 'login';

export type RoleGroup = 'student' | 'teacher' | 'classroom' | 'access';

export type ConceptKey = 'a' | 'b' | 'c' | 'single';

export interface ScreenVariantMeta {
  key: ConceptKey;
  label: string;
  themeTitle: string; // e.g. "Cinematic Discovery" or "Scientific Atlas"
  referenceCropFile: string;
}

export interface ScreenMeta {
  id: ScreenId;
  index: number; // 1 to 14
  code: string; // e.g. "01", "02", ... "14"
  name: string; // Vietnamese title
  description: string;
  roleGroup: RoleGroup;
  roleGroupName: string;
  route: string;
  variants: ScreenVariantMeta[];
  defaultVariant: ConceptKey;
  viewport: {
    width: number;
    height: number;
  };
}

export const ROLE_GROUP_LABELS: Record<RoleGroup, string> = {
  student: 'Học sinh',
  teacher: 'Giáo viên',
  classroom: 'Lớp học & Trình chiếu',
  access: 'Truy cập & Công cộng',
};

export const SCREENS_REGISTRY: ScreenMeta[] = [
  {
    id: 'landingpage',
    index: 1,
    code: '01',
    name: 'Trang chủ Landing Page',
    description: 'Trang giới thiệu tổng quan trải nghiệm học tập đại dương sống động.',
    roleGroup: 'access',
    roleGroupName: 'Truy cập & Công cộng',
    route: '/',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery', referenceCropFile: 'references/landingpage_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas', referenceCropFile: 'references/landingpage_b.png' },
      { key: 'c', label: 'Phương án C', themeTitle: 'Living Learning System', referenceCropFile: 'references/landingpage_c.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'studenthome',
    index: 2,
    code: '02',
    name: 'Trang chủ của bé An',
    description: 'Trang nhà học sinh với lối vào bài học, lớp học Sao Biển, thẻ khám phá và bộ sưu tập.',
    roleGroup: 'student',
    roleGroupName: 'Học sinh',
    route: '/student',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery', referenceCropFile: 'references/studenthome_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas', referenceCropFile: 'references/studenthome_b.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'studentjourney',
    index: 3,
    code: '03',
    name: 'Hành trình bài học',
    description: 'Lộ trình 5 chặng bài học: Xem, Khám phá, Dự đoán, Thử nghiệm, Chia sẻ.',
    roleGroup: 'student',
    roleGroupName: 'Học sinh',
    route: '/student/journey',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery', referenceCropFile: 'references/studentjourney_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas', referenceCropFile: 'references/studentjourney_b.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'learningunit',
    index: 4,
    code: '04',
    name: 'Hoạt động học tập (Unit)',
    description: 'Không gian chuẩn bị trước thử nghiệm, chọn hướng gió, nghe giọng cô Linh.',
    roleGroup: 'student',
    roleGroupName: 'Học sinh',
    route: '/student/unit',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery', referenceCropFile: 'references/learningunit_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas', referenceCropFile: 'references/learningunit_b.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'simulation',
    index: 5,
    code: '05',
    name: 'Mô phỏng hải lưu tương tác',
    description: 'Mô phỏng dòng chảy đại dương: đổi hướng gió, cường độ, quan sát phao di chuyển.',
    roleGroup: 'student',
    roleGroupName: 'Học sinh',
    route: '/student/simulation',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery (Mặt cắt bên)', referenceCropFile: 'references/simulation_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas (Hình chiếu trên cao)', referenceCropFile: 'references/simulation_b.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'studentprogress',
    index: 6,
    code: '06',
    name: 'Tiến trình & Kỷ vật bé An',
    description: 'Hồ sơ hoàn thành 100%, huy hiệu Nhà khám phá, kỷ vật Dòng chảy, nghe chia sẻ âm thanh 15s.',
    roleGroup: 'student',
    roleGroupName: 'Học sinh',
    route: '/student/progress',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery', referenceCropFile: 'references/studentprogress_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas', referenceCropFile: 'references/studentprogress_b.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'teacherdashboard',
    index: 7,
    code: '07',
    name: 'Bảng điều khiển giáo viên',
    description: 'Tổng quan lịch dạy hôm nay của cô Linh, lớp Sao Biển, checklist và giáo án.',
    roleGroup: 'teacher',
    roleGroupName: 'Giáo viên',
    route: '/teacher',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery', referenceCropFile: 'references/teacherdashboard_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas', referenceCropFile: 'references/teacherdashboard_b.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'teacherlibrary',
    index: 8,
    code: '08',
    name: 'Thư viện bài giảng',
    description: 'Kho bài giảng & tài nguyên đại dương phong phú, bộ lọc theo chủ đề và xem trước chi tiết.',
    roleGroup: 'teacher',
    roleGroupName: 'Giáo viên',
    route: '/teacher/library',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery', referenceCropFile: 'references/teacherlibrary_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas', referenceCropFile: 'references/teacherlibrary_b.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'lessonbuilder',
    index: 9,
    code: '09',
    name: 'Soạn bài học tương tác',
    description: 'Công cụ biên soạn 5 hoạt động, xem trước mô phỏng, thiết lập hướng dẫn và âm thanh.',
    roleGroup: 'teacher',
    roleGroupName: 'Giáo viên',
    route: '/teacher/builder',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery', referenceCropFile: 'references/lessonbuilder_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas', referenceCropFile: 'references/lessonbuilder_b.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'liveclass',
    index: 10,
    code: '10',
    name: 'Điều phối lớp học trực tiếp',
    description: 'Bảng điều khiển trực tiếp cho cô Linh: quản lý 24 học sinh, khảo sát dự đoán 20/4, chạy mô phỏng.',
    roleGroup: 'classroom',
    roleGroupName: 'Lớp học & Trình chiếu',
    route: '/teacher/live',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery', referenceCropFile: 'references/liveclass_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas', referenceCropFile: 'references/liveclass_b.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'presentation',
    index: 11,
    code: '11',
    name: 'Màn hình trình chiếu chung',
    description: 'Màn hình 16:9 sắc nét hiển thị cho cả lớp, không thanh công cụ quản trị, đồng bộ với cô.',
    roleGroup: 'classroom',
    roleGroupName: 'Lớp học & Trình chiếu',
    route: '/presentation',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery', referenceCropFile: 'references/presentation_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas', referenceCropFile: 'references/presentation_b.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1920, height: 1080 },
  },
  {
    id: 'sessionresults',
    index: 12,
    code: '12',
    name: 'Kết quả buổi học',
    description: 'Báo cáo tổng kết buổi học lớp Sao Biển: 24 học sinh, bảng phân tích, nghe lại giọng chia sẻ, lưu báo cáo.',
    roleGroup: 'teacher',
    roleGroupName: 'Giáo viên',
    route: '/teacher/results',
    variants: [
      { key: 'a', label: 'Phương án A', themeTitle: 'Cinematic Discovery', referenceCropFile: 'references/sessionresults_a.png' },
      { key: 'b', label: 'Phương án B', themeTitle: 'Scientific Atlas', referenceCropFile: 'references/sessionresults_b.png' },
    ],
    defaultVariant: 'a',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'joinclass',
    index: 13,
    code: '13',
    name: 'Vào lớp học bằng mã',
    description: 'Giao diện bàn phím số thân thiện cho trẻ mầm non nhập mã 482915 để vào lớp.',
    roleGroup: 'access',
    roleGroupName: 'Truy cập & Công cộng',
    route: '/join',
    variants: [
      { key: 'single', label: 'Phương án Duy nhất', themeTitle: 'Giao diện vào lớp trẻ thơ', referenceCropFile: 'references/joinclass_single.png' },
    ],
    defaultVariant: 'single',
    viewport: { width: 1440, height: 900 },
  },
  {
    id: 'login',
    index: 14,
    code: '14',
    name: 'Đăng nhập giáo viên',
    description: 'Cổng đăng nhập cho giáo viên với lớp học thực tế và lối vào nhanh cho học sinh.',
    roleGroup: 'access',
    roleGroupName: 'Truy cập & Công cộng',
    route: '/login',
    variants: [
      { key: 'single', label: 'Phương án Duy nhất', themeTitle: 'Cổng đăng nhập giáo viên', referenceCropFile: 'references/login_single.png' },
    ],
    defaultVariant: 'single',
    viewport: { width: 1440, height: 900 },
  },
];

// Helper methods
export function getScreenById(id: ScreenId): ScreenMeta | undefined {
  return SCREENS_REGISTRY.find((s) => s.id === id);
}

export function getScreenByIndex(index: number): ScreenMeta | undefined {
  return SCREENS_REGISTRY.find((s) => s.index === index);
}

export function getScreenByRoute(pathname: string): ScreenMeta | undefined {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/landing' || clean.startsWith('/concept-')) {
    return SCREENS_REGISTRY[0]; // landingpage
  }
  if (clean === '/showcase' || clean === '/showcase/index') {
    return undefined; // Showcase index overview
  }
  return SCREENS_REGISTRY.find((s) => s.route === clean);
}

const memoryConceptStore: Record<string, ConceptKey> = {};

export function getStoredConcept(screenId: ScreenId): ConceptKey {
  const screen = getScreenById(screenId);
  if (!screen) return 'a';
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(`ocean_showcase_concept_${screenId}`) as ConceptKey | null;
      if (stored && screen.variants.some((v) => v.key === stored)) {
        return stored;
      }
    }
  } catch {
    // fallback to memoryConceptStore
  }
  if (memoryConceptStore[screenId] && screen.variants.some((v) => v.key === memoryConceptStore[screenId])) {
    return memoryConceptStore[screenId];
  }
  return screen.defaultVariant;
}

export function setStoredConcept(screenId: ScreenId, concept: ConceptKey): void {
  const screen = getScreenById(screenId);
  if (screen && screen.variants.some((v) => v.key === concept)) {
    memoryConceptStore[screenId] = concept;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`ocean_showcase_concept_${screenId}`, concept);
      }
    } catch {
      // ignore storage restrictions
    }
  }
}

// Tour paths
export interface TourStep {
  screenId: ScreenId;
  concept?: ConceptKey;
  stepHint: string;
}

export const STUDENT_TOUR: TourStep[] = [
  { screenId: 'landingpage', concept: 'a', stepHint: '1. Khám phá trang chủ và chọn "Học sinh khám phá"' },
  { screenId: 'studenthome', concept: 'a', stepHint: '2. Bé An xem bài học và nhấn "Học tiếp"' },
  { screenId: 'studentjourney', concept: 'a', stepHint: '3. Chọn Chặng 4: Thử nghiệm trên dòng chảy' },
  { screenId: 'learningunit', concept: 'a', stepHint: '4. Nghe giọng cô Linh, xem dự đoán và mở mô phỏng' },
  { screenId: 'simulation', concept: 'a', stepHint: '5. Đổi hướng gió sang phải, nhấn Chạy thử để quan sát phao' },
  { screenId: 'studentprogress', concept: 'a', stepHint: '6. Xem thành tích 100%, huy hiệu Dòng chảy và nghe chia sẻ' },
];

export const TEACHER_TOUR: TourStep[] = [
  { screenId: 'login', concept: 'single', stepHint: '1. Đăng nhập với tư cách Cô Linh' },
  { screenId: 'teacherdashboard', concept: 'a', stepHint: '2. Xem lịch dạy Lớp Sao Biển và chuẩn bị bài học' },
  { screenId: 'teacherlibrary', concept: 'a', stepHint: '3. Khám phá thư viện tài nguyên đại dương' },
  { screenId: 'lessonbuilder', concept: 'a', stepHint: '4. Kiểm tra 5 hoạt động trong giáo án và nhấn "Dùng cho lớp"' },
  { screenId: 'liveclass', concept: 'a', stepHint: '5. Điều phối lớp học, theo dõi 20/4 dự đoán và mở màn hình chung' },
  { screenId: 'presentation', concept: 'a', stepHint: '6. Màn hình 16:9 chiếu cho cả lớp đồng bộ với cô Linh' },
  { screenId: 'sessionresults', concept: 'a', stepHint: '7. Xem kết quả buổi học, kiểm tra 24 học sinh và lưu báo cáo' },
];
