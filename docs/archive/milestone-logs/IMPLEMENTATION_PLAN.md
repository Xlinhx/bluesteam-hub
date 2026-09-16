# BlueSTEAM v2 — Kế Hoạch Triển Khai và Bảng Trạng Thái

Ngày khởi tạo: 2026-09-14
Cập nhật: 2026-09-14 (Thu hồi trạng thái PASS sớm; chuyển sang IN_PROGRESS / UNVERIFIED cho đến khi có đầy đủ ảnh gen và bằng chứng browser thực tế)
Phong cách: Living Ocean (duy nhất)
Đối tượng chính: Trẻ 5–6 tuổi; giáo viên & phụ huynh hỗ trợ

## 1. Trạng Thái Các Chặng Triển Khai

| Chặng | Nhiệm vụ chính | Trạng thái | Ghi chú & Bằng chứng |
|---|---|---|---|
| **Chặng 0** | Đối chiếu đầu vào, lập bảng 35 màn hình, khởi tạo 6 tài liệu vận hành | **PASS** | 6 tài liệu vận hành chuẩn xác đã khởi tạo tại docs/design/bluesteam-v2/ |
| **Chặng 1** | Nền tảng: Tokens, 5 Shells, Shapes/SVG, i18n VI/EN, Audio chuẩn | **PARTIAL** | Tokens Living Ocean, 5 Shells, Shapes, từ điển song ngữ, audio engine hoàn thành trong mã nguồn; 55 unit tests pass. Đang chờ ảnh sinh thực tế và kiểm chứng giao diện browser. |
| **Chặng 2** | Luồng trẻ đại diện: Home → Atlas → Rùa 3D → Ghép nơi sống → Lưu tiến trình | **IN_PROGRESS** | Mã nguồn hoàn tất, Three.js 3D & logic game ghép nối hoàn chỉnh. Đang thực thi sinh ảnh (background, mascot rùa, habitat) và chụp screenshot kiểm chứng browser. |
| **Chặng 3** | Landing Page: Đầy đủ 7 nhịp Living Ocean, viewer 3D nhúng | **IN_PROGRESS** | Đầy đủ 7 nhịp Living Ocean trong mã nguồn. Đang sinh ảnh nền biển thực tế và chụp màn hình browser 5 viewports để đối chiếu reference >= 95/100. |
| **Chặng 4** | Kho học liệu, Flashcard, Media & 3 Kịch bản mô phỏng | **IN_PROGRESS** | Logic Catalog, Flashcard 3D flip, Print preview A4, Media player chuẩn hóa & 3 simulation engines đã code xong. Đang sinh minh họa học liệu và kiểm chứng browser. |
| **Chặng 5** | Xưởng sáng tạo: Vẽ/tô canvas 2D, xây sinh cảnh 3D & Hồ sơ năng lực | **IN_PROGRESS** | Xưởng vẽ 2D và Xưởng 3D Three.js isometric sandbox hoàn tất logic code; đang kiểm chứng runtime thực tế trên browser (vẽ nét, IndexedDB persistence, touch gestures). |
| **Chặng 6** | Bộ công cụ giáo viên & Trình chiếu lớp học đồng bộ BroadcastChannel | **IN_PROGRESS** | Bộ công cụ Teacher Suite và Presentation đã code; đang mở 2 tab browser song song để kiểm chứng đồng bộ BroadcastChannel thực tế và chống rò rỉ UI. |
| **Chặng 7** | Kiểm thử mở rộng, responsive matrix, hiệu năng, nghiệm thu bàn giao | **UNVERIFIED** | Unit test 55/55 pass, build clean. Đang thực hiện chạy dev server, sinh toàn bộ ảnh sản xuất, chụp screenshot 5 viewports, chấm điểm so sánh >= 95/100. |

## 2. Kế Hoạch Chạy Kiểm Chứng Thực Tế
1. Khởi chạy Vite dev server trên `http://localhost:5173/`.
2. Sinh toàn bộ ảnh raster sản xuất qua `generate_image`, lưu vào `public/assets/ocean/`.
3. Tích hợp ảnh vào giao diện và chụp ảnh màn hình browser trên 5 viewports chuẩn (1536x1024, 1366x768, 768x1024, 390x844, 360x800).
4. So sánh trực quan với reference trong `C:\Users\ADMIN\Downloads\ocean` theo rubric 100 điểm (>= 95/100).
5. Thực hiện kiểm chứng tương tác runtime: WebGL 3D, Canvas 2D + IndexedDB, Dual-tab BroadcastChannel, song ngữ VI/EN.
6. Cập nhật bằng chứng và cấp lại PASS khi có đủ bằng chứng thực nghiệm.

