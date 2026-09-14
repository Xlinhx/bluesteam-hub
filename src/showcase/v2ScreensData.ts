// BlueSTEAM v2 — 39 Screens Canonical Showcase Registry
// Generated from docs/design/bluesteam-v2/visual-review-manifest.json

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

export const BLUESTEAM_V2_SCREENS: V2ScreenMeta[] = [
  {
    "index": 1,
    "reviewId": "learner-home-overview-desktop-vi",
    "name": "Trang chủ Học sinh (Desktop)",
    "route": "/home",
    "squad": "Squad 3",
    "squadName": "Learner Core & Atlas",
    "category": "learner",
    "categoryName": "Học sinh & Bản đồ",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/learner-home-desktop-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-learner-home-overview.png",
    "setupSteps": [
      "Chọn hồ sơ học sinh bé An",
      "Vào route /home",
      "Kiểm tra Hero card, con đường hành trình 3 trạm sóng, dock sáng tạo"
    ],
    "appliedCorrections": [
      "Không Duolingo streak/mạng",
      "Nhân vật dẫn đường, lối vào Xưởng vẽ",
      "Avatar và header chuẩn LearnerShell, không tự sinh layout",
      "3 trạm mẫu đại diện cho lộ trình mở, không hardcode"
    ]
  },
  {
    "index": 2,
    "reviewId": "learner-home-overview-mobile-vi",
    "name": "Trang chủ Học sinh (Mobile 390x844)",
    "route": "/home",
    "squad": "Squad 3",
    "squadName": "Learner Core & Atlas",
    "category": "learner",
    "categoryName": "Học sinh & Bản đồ",
    "viewport": {
      "width": 390,
      "height": 844,
      "deviceScaleFactor": 3
    },
    "score": null,
    "basis": "RESPONSIVE_SPEC",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/learner-home-mobile-390x844.png",
    "referencePath": null,
    "setupSteps": [
      "Mở route /home trên viewport iPhone 12/13/14 (390x844)",
      "Kiểm tra Bottom Navigation 5 icon, đường hành trình cuộn dọc"
    ],
    "appliedCorrections": [
      "Bottom navigation 5 mục chuẩn mobile",
      "Đường hành trình chuyển sang cuộn dọc mượt mà",
      "Touch targets >= 56px cho ngón tay trẻ em"
    ]
  },
  {
    "index": 3,
    "reviewId": "resources-catalog-desktop-vi",
    "name": "Kho Học liệu (Lưới tổng quan)",
    "route": "/resources",
    "squad": "Squad 5",
    "squadName": "Kho học liệu & Media Hub",
    "category": "resources",
    "categoryName": "Kho học liệu & Media",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/resources-catalog-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-resources-catalog.png",
    "setupSteps": [
      "Mở route /resources",
      "Chuyển sang chế độ lưới duyệt toàn diện",
      "Kiểm tra thanh tìm kiếm, bộ lọc chủ đề và danh sách thẻ học liệu"
    ],
    "appliedCorrections": [
      "Thống nhất taxonomy và LearnerShell",
      "Nội dung mẫu không phải dataset thô",
      "Hỗ trợ trạng thái ít/nhiều/rỗng và tìm không thấy"
    ]
  },
  {
    "index": 4,
    "reviewId": "public-landing-overview-desktop-vi",
    "name": "Trang chủ Landing Page (7 nhịp đại dương)",
    "route": "/",
    "squad": "Squad 2",
    "squadName": "Public Onboarding & Auth",
    "category": "onboarding",
    "categoryName": "Onboarding & Đăng nhập",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 99,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/landing-desktop-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-public-landing-overview.png",
    "setupSteps": [
      "Mở route / ở chế độ khách chưa đăng nhập",
      "Kiểm tra Hero beat 1, tiêu đề Living Ocean, nút Khám phá ngay"
    ],
    "appliedCorrections": [
      "Bỏ An/Hồ sơ đăng nhập khỏi header public",
      "Giữ trọn vẹn 7 nhịp đại dương",
      "Kiểm soát vật liệu chai nhựa, giảm slogan tự sinh vô nghĩa"
    ]
  },
  {
    "index": 5,
    "reviewId": "public-landing-beat2-beat3-desktop-vi",
    "name": "Landing Page — Nhịp 2 & 3 (Chi tiết)",
    "route": "/",
    "squad": "Squad 2",
    "squadName": "Public Onboarding & Auth",
    "category": "onboarding",
    "categoryName": "Onboarding & Đăng nhập",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 96,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/landing-beat2-beat3-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-public-landing-overview.png",
    "setupSteps": [
      "Mở route /",
      "Cuộn xuống beat 2 (Khám phá đại dương) và beat 3 (Sân chơi tương tác)"
    ],
    "appliedCorrections": [
      "Tách riêng đoạn nhịp 2 và 3 theo Rule K.3 trang dài",
      "Độ sâu ánh sáng chuyển tiếp mượt mà"
    ]
  },
  {
    "index": 6,
    "reviewId": "public-landing-beat3-3d-turtle-desktop-vi",
    "name": "Landing Page — WebGL 3D Turtle Canvas",
    "route": "/",
    "squad": "Squad 2",
    "squadName": "Public Onboarding & Auth",
    "category": "onboarding",
    "categoryName": "Onboarding & Đăng nhập",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/landing-beat3-3d-turtle-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-public-landing-overview.png",
    "setupSteps": [
      "Mở route /",
      "Cuộn đến vị trí nhúng mô hình 3D Rùa Xanh tại beat 3"
    ],
    "appliedCorrections": [
      "Nhúng trực tiếp Three.js canvas thật",
      "Khung tương tác orbit điều khiển góc nhìn"
    ]
  },
  {
    "index": 7,
    "reviewId": "public-landing-overview-mobile-vi",
    "name": "Landing Page Mobile (390x844)",
    "route": "/",
    "squad": "Squad 2",
    "squadName": "Public Onboarding & Auth",
    "category": "onboarding",
    "categoryName": "Onboarding & Đăng nhập",
    "viewport": {
      "width": 390,
      "height": 844,
      "deviceScaleFactor": 3
    },
    "score": null,
    "basis": "RESPONSIVE_SPEC",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/landing-mobile-390x844.png",
    "referencePath": null,
    "setupSteps": [
      "Mở route / trên màn hình di động 390x844",
      "Kiểm tra responsive 7 nhịp co giãn tự nhiên, không tràn ngang"
    ],
    "appliedCorrections": [
      "Kiểm tra không bị ngang/bể layout trên mobile",
      "Touch target các nút khám phá >= 48px"
    ]
  },
  {
    "index": 8,
    "reviewId": "public-role-and-access-desktop-vi",
    "name": "Cổng chọn vai trò & Vào lớp (Role Gateway)",
    "route": "/entry",
    "squad": "Squad 2",
    "squadName": "Public Onboarding & Auth",
    "category": "onboarding",
    "categoryName": "Onboarding & Đăng nhập",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 96,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/public-role-and-access-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-public-role-and-access.png",
    "setupSteps": [
      "Mở route /entry",
      "Kiểm tra 3 thẻ vai trò (Trẻ em / Giáo viên / Khách) và ô nhập mã lớp 6 ký tự"
    ],
    "appliedCorrections": [
      "Không hiển thị như người dùng đã đăng nhập",
      "Bỏ mẫu danh tính giả khỏi trạng thái chưa xác thực"
    ]
  },
  {
    "index": 9,
    "reviewId": "public-adult-login-desktop-vi",
    "name": "Đăng nhập Người lớn & Giáo viên",
    "route": "/login",
    "squad": "Squad 2",
    "squadName": "Public Onboarding & Auth",
    "category": "onboarding",
    "categoryName": "Onboarding & Đăng nhập",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 96,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/public-adult-login-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-public-adult-login.png",
    "setupSteps": [
      "Mở route /login",
      "Kiểm tra form đăng nhập người lớn/giáo viên với demo credentials"
    ],
    "appliedCorrections": [
      "Validation theo đặc tả, không giữ slogan vô nghĩa",
      "Xác thực local, form sạch, không giả lập email/SMS server"
    ]
  },
  {
    "index": 10,
    "reviewId": "resources-library-overview-desktop-vi",
    "name": "Thư viện Học liệu (Overview dọc 1024x1536)",
    "route": "/resources",
    "squad": "Squad 5",
    "squadName": "Kho học liệu & Media Hub",
    "category": "resources",
    "categoryName": "Kho học liệu & Media",
    "viewport": {
      "width": 1024,
      "height": 1536,
      "deviceScaleFactor": 1
    },
    "score": 96,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/resources-library-overview-1024x1536.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-resources-library-overview.png",
    "setupSteps": [
      "Mở route /resources",
      "Kiểm tra danh mục tuyển chọn: Rạn san hô, Tầng nước sâu, Động vật biển"
    ],
    "appliedCorrections": [
      "Dùng chung taxonomy với catalog",
      "Active menu Học liệu"
    ]
  },
  {
    "index": 11,
    "reviewId": "resources-flashcard-detail-desktop-vi",
    "name": "Chi tiết Thẻ Flashcard 3D sinh vật",
    "route": "/resources/flashcard",
    "squad": "Squad 5",
    "squadName": "Kho học liệu & Media Hub",
    "category": "resources",
    "categoryName": "Kho học liệu & Media",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/resources-flashcard-detail-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-resources-flashcard-detail.png",
    "setupSteps": [
      "Mở route /resources/flashcard",
      "Chọn thẻ Rùa Xanh",
      "Kiểm tra hình ảnh, nút lật thẻ 2 mặt và nút phát âm"
    ],
    "appliedCorrections": [
      "Active menu Học liệu",
      "Sidebar không tự sinh",
      "Mở rộng đặc điểm sinh học theo nhu cầu"
    ]
  },
  {
    "index": 12,
    "reviewId": "resources-media-player-desktop-vi",
    "name": "Trình phát Video & Quiz tương tác",
    "route": "/resources/media",
    "squad": "Squad 5",
    "squadName": "Kho học liệu & Media Hub",
    "category": "resources",
    "categoryName": "Kho học liệu & Media",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/resources-media-player-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-resources-media-player.png",
    "setupSteps": [
      "Mở route /resources/media",
      "Xem video bài học đại dương",
      "Kiểm tra thanh điều khiển tua/dừng/phóng to và mô tả sinh học"
    ],
    "appliedCorrections": [
      "Phát media thật hoặc placeholder trung thực",
      "Bỏ video hoạt hình Big Buck Bunny không liên quan"
    ]
  },
  {
    "index": 13,
    "reviewId": "resources-print-preview-desktop-vi",
    "name": "Xem trước In ấn Tài liệu STEAM A4",
    "route": "/resources/print",
    "squad": "Squad 5",
    "squadName": "Kho học liệu & Media Hub",
    "category": "resources",
    "categoryName": "Kho học liệu & Media",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/resources-print-preview-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-resources-print-preview.png",
    "setupSteps": [
      "Mở route /resources/print",
      "Kiểm tra khung xem trước tranh tô màu Rùa Xanh A4 và nút In ấn"
    ],
    "appliedCorrections": [
      "Bỏ mục cộng đồng tự sinh",
      "Xuất PDF/in trực tiếp từ trình duyệt"
    ]
  },
  {
    "index": 14,
    "reviewId": "ocean-horizontal-atlas-desktop-vi",
    "name": "Bản đồ Đại dương Atlas (Dạng ngang)",
    "route": "/learn/atlas",
    "squad": "Squad 3",
    "squadName": "Learner Core & Atlas",
    "category": "learner",
    "categoryName": "Học sinh & Bản đồ",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/ocean-atlas-horizontal-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-ocean-horizontal-atlas.png",
    "setupSteps": [
      "Mở route /learn/atlas",
      "Chọn chế độ bản đồ ngang",
      "Kiểm tra cảnh quan cồn cát, thảm cỏ biển, rạn san hô và lớp đánh bắt"
    ],
    "appliedCorrections": [
      "Active menu Học tập",
      "Cồn cát thuộc đất liền, đánh bắt là lớp hoạt động độc lập",
      "Tránh chữ quá dày cho trẻ"
    ]
  },
  {
    "index": 15,
    "reviewId": "ocean-vertical-atlas-desktop-vi",
    "name": "Bản đồ Đại dương Atlas (Dạng dọc)",
    "route": "/learn/atlas",
    "squad": "Squad 3",
    "squadName": "Learner Core & Atlas",
    "category": "learner",
    "categoryName": "Học sinh & Bản đồ",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/ocean-atlas-vertical-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-ocean-vertical-atlas.png",
    "setupSteps": [
      "Mở route /learn/atlas",
      "Chuyển sang chế độ bản đồ dọc (5 tầng nước)",
      "Kiểm tra tầng ánh sáng, hoàng hôn, nửa đêm, vực thẳm và rãnh sâu"
    ],
    "appliedCorrections": [
      "Không gán sứa cho mọi tầng nước",
      "Thông số áp suất và ánh sáng chính xác về khoa học"
    ]
  },
  {
    "index": 16,
    "reviewId": "ocean-creature-viewer-desktop-vi",
    "name": "Khám phá Sinh vật biển 3D (Rùa biển)",
    "route": "/learn/turtle",
    "squad": "Squad 3",
    "squadName": "Learner Core & Atlas",
    "category": "learner",
    "categoryName": "Học sinh & Bản đồ",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/viewer-3d-turtle-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-ocean-creature-viewer.png",
    "setupSteps": [
      "Mở route /learn/turtle",
      "Tải scene Three.js Rùa Xanh 3D",
      "Kiểm tra các điểm chạm Hotspot trên mai và vây rùa"
    ],
    "appliedCorrections": [
      "Active menu Học tập",
      "Dùng Three.js 3D thật xoay/zoom, không dùng ảnh phẳng",
      "Hotspot gắn trên mai và vây kèm thuyết minh"
    ]
  },
  {
    "index": 17,
    "reviewId": "game-lab-overview-desktop-vi",
    "name": "Game Lab — Tổng quan Phòng thí nghiệm",
    "route": "/interactive",
    "squad": "Squad 4",
    "squadName": "Game Lab & Ghép nơi sống",
    "category": "game",
    "categoryName": "Game Lab & Tương tác",
    "viewport": {
      "width": 1024,
      "height": 1536,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/game-lab-overview-1024x1536.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-game-lab-overview.png",
    "setupSteps": [
      "Mở route /interactive",
      "Kiểm tra 3 phân nhóm: Nhận biết, Thấu hiểu, Vận dụng"
    ],
    "appliedCorrections": [
      "Active menu Tương tác",
      "Đưa lối tiếp tục rõ, giảm dày thẻ cho trẻ",
      "Thẻ tương tác trực quan"
    ]
  },
  {
    "index": 18,
    "reviewId": "game-lab-recognition-round-desktop-vi",
    "name": "Game Lab — Vòng nhận diện sinh vật",
    "route": "/interactive/habitat-placement",
    "squad": "Squad 4",
    "squadName": "Game Lab & Ghép nơi sống",
    "category": "game",
    "categoryName": "Game Lab & Tương tác",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/game-lab-recognition-round-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-game-lab-recognition-round.png",
    "setupSteps": [
      "Mở trò chơi nhận biết sinh vật biển",
      "Nghe câu hỏi nhận dạng",
      "Kiểm tra các lựa chọn sinh vật biển hình tròn"
    ],
    "appliedCorrections": [
      "Áp dụng immersive shell chuẩn từ ảnh habitat-placement mới",
      "Tối thiểu 3 lượt, không phạt mạng, phản hồi trực quan"
    ]
  },
  {
    "index": 19,
    "reviewId": "game-habitat-placement-desktop-vi",
    "name": "Game Lab — Kéo thả Ghép nơi sống",
    "route": "/interactive/habitat-placement",
    "squad": "Squad 4",
    "squadName": "Game Lab & Ghép nơi sống",
    "category": "game",
    "categoryName": "Game Lab & Tương tác",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/game-habitat-placement-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-game-lab-habitat-placement.png",
    "setupSteps": [
      "Mở hoạt động với phiên chơi mới tại route /interactive/habitat-placement",
      "Chuyển đến bước đặt, chưa chọn nơi đặt"
    ],
    "appliedCorrections": [
      "Shell tập trung Immersive, nút nghe lại/tạm dừng",
      "3 vùng đặt rõ ràng: Rừng ngập mặn, Thảm cỏ biển nông, Vực sâu",
      "Rùa xanh trong dock thao tác, nút Quan sát disabled trước placement",
      "Vùng cát trái không chìm nước vô lý; hướng dẫn Chạm nơi muốn đặt"
    ]
  },
  {
    "index": 20,
    "reviewId": "game-habitat-feedback-desktop-vi",
    "name": "Game Lab — Bảng Chẩn đoán & Phản hồi",
    "route": "/interactive/habitat-placement",
    "squad": "Squad 4",
    "squadName": "Game Lab & Ghép nơi sống",
    "category": "game",
    "categoryName": "Game Lab & Tương tác",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/game-habitat-feedback-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-game-lab-habitat-feedback.png",
    "setupSteps": [
      "Kéo/thả Rùa Xanh vào Thảm cỏ biển nông",
      "Quan sát hiệu ứng rùa bơi đến ăn cỏ và hộp thoại giải thích sinh học"
    ],
    "appliedCorrections": [
      "Dùng shell/camera/đối tượng thống nhất của placement mới",
      "Không nhân đôi vật đã đặt trong dock",
      "Cho phép thử lại tự do không trừ điểm"
    ]
  },
  {
    "index": 21,
    "reviewId": "simulations-catalog-desktop-vi",
    "name": "Thư viện Mô phỏng Đại dương",
    "route": "/interactive/simulations",
    "squad": "Squad 6",
    "squadName": "Interactive Simulations",
    "category": "simulations",
    "categoryName": "Mô phỏng Đại dương",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/simulations-catalog-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-simulations-catalog.png",
    "setupSteps": [
      "Mở route /interactive/simulations",
      "Kiểm tra 3 thẻ mô phỏng khoa học: Hành động của em, Hành trình rác nhựa, Nhiệm vụ giải cứu"
    ],
    "appliedCorrections": [
      "Active menu Tương tác",
      "Không tự thêm simulation ngoài yêu cầu",
      "Thẻ mô phỏng khoa học"
    ]
  },
  {
    "index": 22,
    "reviewId": "simulations-my-action-choice-desktop-vi",
    "name": "Mô phỏng — Lựa chọn Hành động (Action Choice)",
    "route": "/interactive/my-action",
    "squad": "Squad 6",
    "squadName": "Interactive Simulations",
    "category": "simulations",
    "categoryName": "Mô phỏng Đại dương",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/simulations-my-action-choice-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-simulations-my-action-choice.png",
    "setupSteps": [
      "Mở route /interactive/my-action",
      "Tại điểm quyết định xử lý chai nhựa: Vứt bừa bãi / Bỏ thùng rác / Tái chế"
    ],
    "appliedCorrections": [
      "Active menu Tương tác",
      "Phân biệt rõ điểm chọn với kết quả hệ quả"
    ]
  },
  {
    "index": 23,
    "reviewId": "simulations-my-action-compare-desktop-vi",
    "name": "Mô phỏng — So sánh Tác động môi trường",
    "route": "/interactive/my-action",
    "squad": "Squad 6",
    "squadName": "Interactive Simulations",
    "category": "simulations",
    "categoryName": "Mô phỏng Đại dương",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/simulations-my-action-compare-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-simulations-my-action-compare.png",
    "setupSteps": [
      "Hoàn thành 2 lần lựa chọn",
      "Xem màn so sánh song song hệ quả 2 hành động"
    ],
    "appliedCorrections": [
      "Cùng camera/object ban đầu",
      "Bước hiện tại phải là kết quả/so sánh trực quan"
    ]
  },
  {
    "index": 24,
    "reviewId": "simulations-plastic-journey-desktop-vi",
    "name": "Mô phỏng — Hành trình rác thải nhựa (5 nhịp)",
    "route": "/interactive/plastic-journey",
    "squad": "Squad 6",
    "squadName": "Interactive Simulations",
    "category": "simulations",
    "categoryName": "Mô phỏng Đại dương",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/simulations-plastic-journey-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-simulations-plastic-journey.png",
    "setupSteps": [
      "Mở route /interactive/plastic-journey",
      "Kiểm tra 5 chặng hành trình mảnh nhựa và điểm can thiệp thu gom"
    ],
    "appliedCorrections": [
      "Bỏ header/sidebar tự chế",
      "Theo shell simulation thống nhất",
      "Có điểm dự đoán và can thiệp dọn rác, không phải video tuyến tính"
    ]
  },
  {
    "index": 25,
    "reviewId": "simulations-rescue-mission-desktop-vi",
    "name": "Mô phỏng — Nhiệm vụ cứu hộ sinh vật NOAA",
    "route": "/interactive/rescue-mission",
    "squad": "Squad 6",
    "squadName": "Interactive Simulations",
    "category": "simulations",
    "categoryName": "Mô phỏng Đại dương",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/simulations-rescue-mission-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-simulations-rescue-mission.png",
    "setupSteps": [
      "Mở route /interactive/rescue-mission",
      "Chọn nhiệm vụ cứu rùa biển vướng lưới",
      "Kiểm tra thao tác hỗ trợ an toàn: Báo người lớn / Gọi trung tâm bảo tồn"
    ],
    "appliedCorrections": [
      "Không hướng dẫn trẻ tự tiếp cận/cắt lưới động vật",
      "Logic an toàn: Báo người lớn hoặc gọi cứu hộ bảo tồn biển"
    ]
  },
  {
    "index": 26,
    "reviewId": "creative-studio-desktop-vi",
    "name": "Xưởng Sáng Tạo — Trung tâm sáng tạo (Hub)",
    "route": "/creative",
    "squad": "Squad 7",
    "squadName": "Xưởng Sáng Tạo",
    "category": "creative",
    "categoryName": "Xưởng Sáng Tạo",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/creative-studio-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-creative-studio.png",
    "setupSteps": [
      "Mở route /creative",
      "Kiểm tra khay trưng bày sản phẩm thực tế và 2 nút tạo mới: Vẽ tranh 2D, Xây sinh cảnh 3D"
    ],
    "appliedCorrections": [
      "Ô rỗng dùng tạo mới, không để nút Mở tác phẩm vô nghĩa",
      "Bỏ slogan tự sinh",
      "Hiển thị tác phẩm đã lưu thực tế từ IndexedDB"
    ]
  },
  {
    "index": 27,
    "reviewId": "creative-drawing-desktop-vi",
    "name": "Xưởng Sáng Tạo — Vẽ sáp màu Crayon Canvas",
    "route": "/creative/drawing",
    "squad": "Squad 7",
    "squadName": "Xưởng Sáng Tạo",
    "category": "creative",
    "categoryName": "Xưởng Sáng Tạo",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/creative-drawing-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-creative-drawing.png",
    "setupSteps": [
      "Mở route /creative/drawing",
      "Vẽ nét cọ màu Living Ocean trên canvas",
      "Kiểm tra thanh công cụ cọ, màu, tẩy, undo/redo và nút lưu tranh"
    ],
    "appliedCorrections": [
      "Công cụ thật 100% hoạt động",
      "Lưu và mở giữ nguyên tác phẩm qua IndexedDB",
      "Canvas thích ứng tự nhiên với màn hình"
    ]
  },
  {
    "index": 28,
    "reviewId": "creative-habitat-build-desktop-vi",
    "name": "Xưởng Sáng Tạo — Sa bàn 3D (Chế độ Xây dựng)",
    "route": "/creative/habitat",
    "squad": "Squad 7",
    "squadName": "Xưởng Sáng Tạo",
    "category": "creative",
    "categoryName": "Xưởng Sáng Tạo",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/creative-habitat-build-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-creative-habitat-build.png",
    "setupSteps": [
      "Mở route /creative/habitat ở chế độ Dựng (Build Mode)",
      "Kéo thả rạn san hô, cỏ biển, cá lên nền cát Three.js isometric"
    ],
    "appliedCorrections": [
      "Cùng objectId/transform với chế độ Run",
      "Phân biệt rõ trạng thái Edit và Run",
      "Bỏ công cụ dư thừa không tương tác"
    ]
  },
  {
    "index": 29,
    "reviewId": "creative-habitat-run-desktop-vi",
    "name": "Xưởng Sáng Tạo — Sa bàn 3D (Chế độ Vận hành)",
    "route": "/creative/habitat",
    "squad": "Squad 7",
    "squadName": "Xưởng Sáng Tạo",
    "category": "creative",
    "categoryName": "Xưởng Sáng Tạo",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 99,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/creative-habitat-run-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-creative-habitat-run.png",
    "setupSteps": [
      "Nhấn nút \"Chạy thử sinh cảnh\"",
      "Kích hoạt sinh vật bơi lội tuần hoàn và bọt khí động",
      "Kiểm tra nút Quay lại sửa sinh cảnh"
    ],
    "appliedCorrections": [
      "Không tự đổi hình học khi chuyển từ Build sang Run",
      "Cùng dữ liệu vật thể và vị trí toạ độ với bản dựng"
    ]
  },
  {
    "index": 30,
    "reviewId": "profile-learner-profile-desktop-vi",
    "name": "Hồ sơ Học sinh (Thành tích & Tác phẩm)",
    "route": "/profile",
    "squad": "Squad 9",
    "squadName": "Presentation & Profile",
    "category": "presentation",
    "categoryName": "Hồ sơ & Trình chiếu",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/profile-learner-profile-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-profile-learner-profile.png",
    "setupSteps": [
      "Mở route /profile",
      "Kiểm tra tiến trình học tập, vỏ sò tích lũy, huy hiệu đạt được và tranh vẽ đã lưu"
    ],
    "appliedCorrections": [
      "Bỏ sidebar không chuẩn LearnerShell",
      "Không dựng thành tích giả, lấy dữ liệu thực từ demoStore & IndexedDB"
    ]
  },
  {
    "index": 31,
    "reviewId": "teacher-dashboard-desktop-vi",
    "name": "Bảng điều khiển Giáo viên (Dashboard)",
    "route": "/teacher",
    "squad": "Squad 8",
    "squadName": "Teacher Suite",
    "category": "teacher",
    "categoryName": "Sư phạm & Quản trị",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/teacher-dashboard-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-teacher-dashboard.png",
    "setupSteps": [
      "Đăng nhập tài khoản giáo viên Cô Linh",
      "Mở route /teacher",
      "Kiểm tra bàn làm việc, tổng quan lớp học mầm non, giáo án gần đây"
    ],
    "appliedCorrections": [
      "Mật độ công cụ người lớn chuyên nghiệp",
      "Danh tính giáo viên Cô Linh, đồng nhất TeacherShell"
    ]
  },
  {
    "index": 32,
    "reviewId": "teacher-resource-library-desktop-vi",
    "name": "Thư viện Giáo án & Học liệu sư phạm",
    "route": "/teacher/library",
    "squad": "Squad 8",
    "squadName": "Teacher Suite",
    "category": "teacher",
    "categoryName": "Sư phạm & Quản trị",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 98,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/teacher-resource-library-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-teacher-resource-library.png",
    "setupSteps": [
      "Mở route /teacher/library",
      "Kiểm tra danh mục giáo cụ STEAM dành riêng cho lứa tuổi 5-6 tuổi"
    ],
    "appliedCorrections": [
      "Bỏ Tiểu học/THCS/THPT sai phạm vi lứa tuổi mầm non",
      "Active menu Học liệu trong TeacherShell"
    ]
  },
  {
    "index": 33,
    "reviewId": "teacher-lesson-plan-desktop-vi",
    "name": "Kế hoạch Bài giảng STEAM chi tiết",
    "route": "/teacher/builder",
    "squad": "Squad 8",
    "squadName": "Teacher Suite",
    "category": "teacher",
    "categoryName": "Sư phạm & Quản trị",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/teacher-lesson-plan-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-teacher-lesson-plan.png",
    "setupSteps": [
      "Mở chi tiết giáo án Khám phá Rạn san hô",
      "Kiểm tra cấu trúc sư phạm 5 bước và mục tiêu đầu ra"
    ],
    "appliedCorrections": [
      "Cấu trúc giáo án chuẩn mực sư phạm STEAM",
      "Nội dung giáo án thực tế, không lorem ipsum"
    ]
  },
  {
    "index": 34,
    "reviewId": "teacher-lesson-builder-desktop-vi",
    "name": "Trình tạo Bài học 5 bước (Lesson Builder)",
    "route": "/teacher/builder",
    "squad": "Squad 8",
    "squadName": "Teacher Suite",
    "category": "teacher",
    "categoryName": "Sư phạm & Quản trị",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 97,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/teacher-lesson-builder-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-teacher-lesson-builder.png",
    "setupSteps": [
      "Mở trình soạn bài giảng /teacher/builder",
      "Kiểm tra ghép nối hoạt động vào tiến trình tiết học và khung preview"
    ],
    "appliedCorrections": [
      "Selection bước phải khớp chính xác với preview",
      "Đồng bộ số bước khi chuyển sang Live Console"
    ]
  },
  {
    "index": 35,
    "reviewId": "teacher-live-console-desktop-vi",
    "name": "Bàn điều khiển Lớp học trực tiếp (Live Console)",
    "route": "/teacher/live",
    "squad": "Squad 8",
    "squadName": "Teacher Suite",
    "category": "teacher",
    "categoryName": "Sư phạm & Quản trị",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 99,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/teacher-live-console-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-teacher-live-console.png",
    "setupSteps": [
      "Mở bàn điều khiển tiết học trực tiếp /teacher/live",
      "Kiểm tra nút chuyển bước, thăm dò và đồng bộ BroadcastChannel với Presentation"
    ],
    "appliedCorrections": [
      "Đồng bộ tức thì với Presentation qua BroadcastChannel",
      "Điều khiển bước, phát media, quản lý trạng thái học sinh"
    ]
  },
  {
    "index": 36,
    "reviewId": "teacher-presentation-desktop-vi",
    "name": "Chế độ Thuyết trình Toàn cảnh (Presentation 16:9)",
    "route": "/presentation",
    "squad": "Squad 9",
    "squadName": "Presentation & Profile",
    "category": "presentation",
    "categoryName": "Hồ sơ & Trình chiếu",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": 99,
    "basis": "REFERENCE",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/teacher-presentation-1536x1024.png",
    "referencePath": "C:/Users/ADMIN/Downloads/ocean/bluesteam-v2-teacher-presentation.png",
    "setupSteps": [
      "Mở màn trình chiếu /presentation trên tab riêng",
      "Kiểm tra giao diện toàn màn hình, chữ cực to, không có menu cá nhân hay thanh công cụ giáo viên"
    ],
    "appliedCorrections": [
      "Chỉ dùng cảnh làm tham khảo",
      "Loại bỏ hoàn toàn menu trẻ, avatar An và công cụ giáo viên riêng tư",
      "Chữ cực to dễ đọc từ cuối lớp học"
    ]
  },
  {
    "index": 37,
    "reviewId": "teacher-session-results-desktop-vi",
    "name": "Báo cáo Phân tích Kết quả Buổi học (24 học sinh)",
    "route": "/teacher/results",
    "squad": "Squad 9",
    "squadName": "Presentation & Profile",
    "category": "presentation",
    "categoryName": "Hồ sơ & Trình chiếu",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": null,
    "basis": "SPEC_ONLY",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/teacher-session-results-1536x1024.png",
    "referencePath": null,
    "setupSteps": [
      "Mở route /teacher/results sau khi kết thúc buổi dạy",
      "Kiểm tra thống kê số hoạt động hoàn thành, mức độ tương tác và tác phẩm tiêu biểu của học sinh"
    ],
    "appliedCorrections": [
      "Đặc tả trong Plan: Báo cáo kết quả buổi học",
      "Thống kê số hoạt động hoàn thành, tác phẩm tiêu biểu"
    ]
  },
  {
    "index": 38,
    "reviewId": "system-loading-retry-desktop-vi",
    "name": "Màn hình Tải hệ thống Biển sâu & Thử lại",
    "route": "/home?loading=true",
    "squad": "Squad 9",
    "squadName": "Presentation & Profile",
    "category": "presentation",
    "categoryName": "Hồ sơ & Trình chiếu",
    "viewport": {
      "width": 1536,
      "height": 1024,
      "deviceScaleFactor": 1
    },
    "score": null,
    "basis": "SPEC_ONLY",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/system-loading-retry-1536x1024.png",
    "referencePath": null,
    "setupSteps": [
      "Kích hoạt trạng thái tải chậm > 300ms hoặc ngắt kết nối WebGL",
      "Kiểm tra rùa nhỏ bơi chờ và nút Thử lại"
    ],
    "appliedCorrections": [
      "Rùa nhỏ bơi chờ (chỉ hiện khi tải > 300ms)",
      "Nút Thử lại rõ ràng khi WebGL lỗi hoặc mạng ngắt"
    ]
  },
  {
    "index": 39,
    "reviewId": "responsive-tablet-creative-vi",
    "name": "Trải nghiệm Vẽ trên Tablet (1024x768)",
    "route": "/creative/drawing",
    "squad": "Squad 7",
    "squadName": "Xưởng Sáng Tạo",
    "category": "creative",
    "categoryName": "Xưởng Sáng Tạo",
    "viewport": {
      "width": 1024,
      "height": 768,
      "deviceScaleFactor": 2
    },
    "score": null,
    "basis": "RESPONSIVE_SPEC",
    "status": "VERIFIED",
    "screenshotPath": "artifacts/bluesteam-v2/verification/responsive-tablet-creative-1024x768.png",
    "referencePath": null,
    "setupSteps": [
      "Mở /creative/drawing trên tablet 1024x768",
      "Kiểm tra dock công cụ dưới chân, vùng vẽ co giãn, touch target >= 56px"
    ],
    "appliedCorrections": [
      "Khay công cụ dock chân màn hình cho tay trẻ em",
      "Touch target >= 56px"
    ]
  }
];

export function getV2ScreenByIndex(index: number): V2ScreenMeta | undefined {
  return BLUESTEAM_V2_SCREENS.find((s) => s.index === index);
}

export function getV2ScreenByRoute(route: string): V2ScreenMeta | undefined {
  const clean = (route || '/').split('?')[0];
  return BLUESTEAM_V2_SCREENS.find((s) => s.route === clean);
}
