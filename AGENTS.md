# Architectural Guidelines & Domain-Driven Structure for BlueSTEAM v2

> **Document Type**: AI Architectural Contract & Developer Guide
> **Applicability**: All AI coding assistants (Antigravity, Cursor, Claude Code, Copilot) and human developers.

---

## 1. Triết Lý Cốt Lõi (Core Philosophy)

> **"Xử lý theo tư duy về chức năng và vai trò — không phải là số dòng code."**

1. **Ranh giới trách nhiệm là tối thượng (Bounded Contexts)**:
   - Một module/file/folder tồn tại vì nó có **một vai trò rõ ràng và duy nhất** trong hệ sinh thái BlueSTEAM.
   - Không chia nhỏ file cơ học chỉ vì "file quá 200 dòng". Một màn hình tương tác giàu tính năng có thể dài 600 dòng nếu toàn bộ logic gắn liền mật thiết với trải nghiệm người dùng tại màn hình đó.
   - Ngược lại, không bao giờ nhồi nhét nhiều vai trò khác nhau vào cùng một file hoặc một folder (chống "Ôm đồm quá nhiều" & "God File").

2. **Tổ chức theo Domain + Concept (Domain-Driven Organization)**:
   - Toàn bộ mã nguồn nghiệp vụ được phân bổ vào các **Domain** (phân hệ lớn) và chia nhỏ thành các **Concept** (ngữ cảnh cụ thể).
   - Tên thư mục và vị trí file phải **đọc là hiểu ngay vai trò**: chỉ cần nhìn cấu trúc folder là người đọc và AI nhớ ra chức năng tức thì mà không cần tra cứu.

3. **Quy về Shared cho các thành phần dùng chung (Shared Primitives)**:
   - Các UI buttons, badges, visual effects, layout shells, audio engine, realtime stores... được dùng ở từ 2 domain trở lên **phải được đặt tại `src/shared/`**.
   - Không được duplicate các component hiệu ứng (như caustics, wave divider) ở rải rác các page.

4. **Tuyệt đối không lưu luyến mã lỗi thời (Zero Dead Code)**:
   - Các file mồ côi (không được import), prototype cũ, barrel re-export thừa phải được dọn dẹp triệt để.
   - Khi tạo mới hoặc tái cấu trúc, dọn sạch dấu vết cũ, không để code "chết lâm sàng" trong repository.

---

## 2. Bản Đồ Cây Thư Mục (System Mental Map)

```
src/
├── app/                                # Khởi chạy & Điều hướng toàn cục
│   ├── App.tsx                         # Dispatcher điều hướng các màn hình theo domain
│   └── router.tsx                      # In-memory history router & context
│
├── domains/                            # CÁC PHÂN HỆ NGHIỆP VỤ CHÍNH
│   │
│   ├── public/                         # Phân hệ: Công cộng & Khách vãng lai
│   │   ├── landing/                    # Concept: Living Ocean 7-beat narrative hero
│   │   ├── onboarding/                 # Concept: Role gateway (Bé / Thầy Cô / Phụ Huynh)
│   │   ├── auth/                       # Concept: Teacher login & Join session code
│   │   └── concepts-preview/           # Concept: 3 phương án A/B/C phục vụ thẩm định
│   │
│   ├── learner/                        # Phân hệ: Trải nghiệm Học sinh (Bé khám phá đại dương)
│   │   ├── home/                       # Concept: Trang chủ học sinh & nhiệm vụ ngày
│   │   ├── atlas/                      # Concept: Bản đồ đại dương 5 tầng nước & 3D space
│   │   ├── creature-viewer/            # Concept: Đài quan sát sinh vật biển 3D chuyên sâu
│   │   ├── game-lab/                   # Concept: Thí nghiệm trò chơi phân loại & ghép nơi sống
│   │   ├── simulations/                # Concept: Các mô phỏng sinh thái học đại dương
│   │   ├── resources/                  # Concept: Thư viện học liệu, thẻ hình 3D, video & tranh in A4
│   │   ├── creative-studio/            # Concept: Xưởng sáng tạo mỹ thuật sáp màu & sa bàn 3D
│   │   ├── profile/                    # Concept: Hồ sơ bé, huy hiệu đạt được & hành trình học
│   │   └── legacy-journey/             # Concept: Các hành trình học sinh phiên bản cũ (v1)
│   │
│   ├── teacher/                        # Phân hệ: Quản lý Giảng dạy & Điều phối Lớp học
│   │   ├── dashboard/                  # Concept: Bàn làm việc & tổng quan lớp học
│   │   ├── lesson-builder/             # Concept: Soạn bài giảng & kế hoạch sư phạm 5 bước
│   │   ├── live-console/               # Concept: Bàn điều khiển lớp học thời gian thực (chuông báo)
│   │   ├── presentation/               # Concept: Màn hình trình chiếu 4K lớp học
│   │   ├── session-results/            # Concept: Báo cáo kết quả buổi học & đánh giá học sinh
│   │   ├── resources/                  # Concept: Thư viện giáo cụ sư phạm & kit giảng dạy
│   │   └── classroom/                  # Concept: Chi tiết lớp học & danh sách học sinh
│   │
│   └── showcase/                       # Phân hệ: Thẩm định & Đối chiếu Mockup Thiết kế
│       ├── ShowcaseIndexPage.tsx       # Hub tổng quan 39 màn hình
│       ├── CompareMatrix.tsx           # Ma trận so sánh 6 biến thể
│       ├── ShowcaseToolbar.tsx         # Thanh công cụ nổi duyệt màn hình
│       ├── ScreenCompareModal.tsx      # Modal soi ảnh gốc đối chiếu
│       └── registry.ts                 # Registry ánh xạ màn hình & concept
│
├── shared/                             # CÁC THÀNH PHẦN DÙNG CHUNG TOÀN HỆ THỐNG
│   ├── ui/                             # UI Primitives & Visual Components
│   │   ├── buttons/                    # CoralButton, PebbleButton, ScallopHintButton
│   │   ├── cards/                      # TiltCard
│   │   ├── badges/                     # BlueSteamLogo, AudioControlButton, LanguageToggle, JourneyNode
│   │   ├── visuals/                    # UnderwaterCaustics (hợp nhất), OceanMotesCanvas, WaveDivider, Ocean3DSvgs
│   │   ├── feedback/                   # SystemLoadingRetry
│   │   └── navigation/                 # InteractiveSubNav
│   ├── shells/                         # 5 Canonical Shells (Learner, Teacher, Public, Activity, Presentation)
│   ├── audio/                          # oceanAudio (Web Audio synth & speech synthesis)
│   ├── realtime/                       # teacherSyncStore, demoStore, oceanShowcaseStore, transport
│   ├── i18n/                           # I18nContext, translations, types
│   ├── theme/                          # tokens, ThemeProvider
│   ├── types/                          # Core domain entity types
│   └── data/                           # Seed datasets
│
├── index.css
├── main.tsx
└── vite-env.d.ts
```

---

## 3. Quy Tắc Dành Cho AI Khi Phát Triển Tiếp (AI Development Invariants)

1. **Khi thêm một màn hình hoặc tính năng mới**:
   - Xác định chính xác thuộc **Domain** nào (`public`, `learner`, `teacher`, `showcase`).
   - Tìm **Concept** tương ứng bên trong Domain đó (hoặc tạo một Concept folder mới nếu nó là một chủ đề nghiệp vụ hoàn toàn mới).
   - Đặt file Page, components con, types, logic hỗ trợ ngay trong Concept folder đó.
   - Không được tự ý tạo thư mục ngang hàng vô tội vạ ở `src/`.

2. **Khi thêm một component tái sử dụng**:
   - Nếu component chỉ dùng trong 1 Concept: Đặt trong thư mục Concept đó.
   - Nếu component chỉ dùng trong 1 Domain: Đặt trong `domains/<domain>/components/`.
   - Nếu component mang tính chất UI Primitive hoặc dùng xuyên Domain: Đặt trong `src/shared/ui/`.

3. **Ngăn chặn God Files**:
   - Tuyệt đối không tạo file chứa hàng tá chức năng không liên quan.
   - Giữ các stores và dispatchers tập trung vào đúng nhiệm vụ điều phối dữ liệu, không nhét mã render UI vào store.

4. **Kiểm tra tự động bắt buộc (Verification Gate)**:
   - Mọi thay đổi phải đảm bảo:
     1. `npm test` -> 100% tests PASS (không được làm gãy bất kỳ test suite nào).
     2. `npm run validate:visual` -> 39/39 records VERIFIED, 0 errors.
     3. `npm run build` -> `tsc` biên dịch sạch, Vite build thành công.
