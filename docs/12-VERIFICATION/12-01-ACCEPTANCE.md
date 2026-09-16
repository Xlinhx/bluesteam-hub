# Ma Trận Nghiệm Thu & Kiểm Chứng — BlueSTEAM v2 (ACCEPTANCE.md)

Phong cách: Living Ocean (duy nhất)
Ngày cập nhật: 2026-09-14

---

## 1. Ma Trận Tiêu Chí Nghiệm Thu Cốt Lõi

| Nhóm Tiêu Chí | Yêu Cầu Cụ Thể | Cách Kiểm Tra | Trạng Thái | Bằng Chứng / Ghi Chú |
|---|---|---|---|---|
| **Visual & Brand** | • Một phong cách Living Ocean (Ivory/Navy/Teal/Coral).<br>• Không còn Concept A/B/C hay toolbar showcase trong luồng chính.<br>• Logo sóng BlueSTEAM đồng nhất. | Kiểm tra trực quan trên các màn hình; xác nhận hệ thống tokens Tailwind Living Ocean. | **IN_PROGRESS** | `tailwind.config.js` đã tích hợp tokens `living.*`; logo `BlueSteamLogo.tsx` đồng nhất. Đang sinh ảnh thật và chụp browser 5 viewports để đối chiếu >= 95/100. |
| **5 Shells Chuẩn** | • Public, Learner, Teacher, Activity, Presentation.<br>• Đúng thứ tự mục menu, đúng nhận diện người dùng.<br>• Bottom Navigation 5 mục dưới 1024px cho Learner. | Render test trên viewports 1536px và 390px; kiểm thử `tests/shells_and_i18n.test.ts`. | **PASS (Code) / IN_PROGRESS (Visual)** | 5 canonical shells trong `src/shells/` với responsive bottom nav 5 mục >= 56px; 55 unit tests pass. Đang capture screenshot browser để nghiệm thu thị giác. |
| **Bản Đồ Hành Trình** | • Home dẫn dắt theo con đường hành trình rõ ràng.<br>• Một nút CTA tiếp tục nổi bật, có lối vào xưởng vẽ.<br>• Không streak, không trừ mạng sống, không leaderboard. | Kiểm tra màn `learner-home-overview` (`/home`). | **IN_PROGRESS** | `LearnerHomePage.tsx` serpentine 5 trạm, CTA "Tiếp tục khám phá". Cần ảnh nền hải trình thực tế và screenshot đối chiếu mockups. |
| **Viewer 3D Rùa Xanh** | • Three.js render mô hình rùa xanh giải phẫu chuẩn.<br>• Xoay quanh, zoom giới hạn, reset góc, hotspot mai/vây.<br>• Fallback 2D nếu WebGL không khả dụng. | Tương tác trực tiếp trên canvas 3D; fallback 2D thông báo nhẹ. | **IN_PROGRESS** | Three.js scene đã code với flipper motion & audio; cần kiểm chứng WebGL canvas rendering trên Chrome browser thực tế. |
| **Ghép Nơi Sống (Game)** | • Thức ăn rùa xanh là cỏ biển/rong tảo (chuẩn NOAA).<br>• Tối thiểu 3 lượt chơi khác nhau.<br>• Gợi ý quan sát khi chọn sai, không trừ mạng. | Chơi thử vòng game; cố tình chọn sai để xem phản hồi gợi ý. | **IN_PROGRESS** | `HabitatPlacementGamePage.tsx` 3 rounds; đang sinh ảnh nền môi trường thực tế (seagrass, mangrove, abyss) và kiểm chứng game loop trên browser. |
| **Landing Page 7 Nhịp** | • Đầy đủ 7 nhịp đại dương liền mạch.<br>• Tích hợp viewer rùa 3D nhúng tương tác.<br>• Không dùng ảnh screenshot chắp vá. | Cuộn trang từ Hero đến Chân trang; kiểm thử `tests/landing_concepts.test.ts`. | **IN_PROGRESS** | `LivingOceanLandingPage.tsx` 7 nhịp Living Ocean; đang sinh ảnh nền đại dương góc rộng và chụp screenshot so sánh reference. |
| **3 Kịch Bản Mô Phỏng** | • Hành động của em (3 lựa chọn & so sánh).<br>• Plastic → Ocean (5 chặng, có điểm can thiệp).<br>• Giải cứu (4 loài, chọn báo đội hỗ trợ an toàn). | Chạy từng kịch bản, kiểm thử `tests/resources_and_simulations.test.ts`. | **IN_PROGRESS** | 3 simulation engines tuân thủ chuẩn NOAA; đang sinh ảnh item minh họa (chai nhựa, túi rác, lưới ma) và test browser. |
| **Xưởng Sáng Tạo 2D/3D**| • Vẽ canvas 2D: nét vẽ, màu, tẩy, undo/redo, lưu/mở.<br>• Xây sinh cảnh 3D: thêm/đặt/xoay/xóa, chạy thử bơi lội.<br>• Dữ liệu lưu vào IndexedDB không mất sau reload. | Kiểm thử `tests/creative_studio.test.ts`. | **IN_PROGRESS** | Code logic hoàn tất; đang kiểm chứng runtime vẽ trên 2D canvas, IndexedDB data persistence thực sự và Three.js 3D sandbox trên browser. |
| **Đồng Bộ Giáo Viên** | • Console giáo viên và Presentation chạy song song.<br>• BroadcastChannel đồng bộ bước giảng ngay lập tức.<br>• Màn chiếu không lộ thông tin riêng tư giáo viên. | Kiểm thử `tests/teacher_suite_sync.test.ts`. | **IN_PROGRESS** | Code BroadcastChannel hoàn tất; đang mở dual tabs trên browser để kiểm chứng đồng bộ real-time và zero UI leakage. |
| **Song Ngữ VI / EN** | • 100% văn bản giao diện và học liệu dịch bằng key.<br>• Đổi ngôn ngữ không mất trạng thái hay reset game. | Kiểm thử từ điển song ngữ trong `src/shared/i18n/`. | **PASS (Code) / IN_PROGRESS (Visual)** | Từ điển song ngữ đầy đủ trong `translations.ts`; toggle ngôn ngữ tức thì không gián đoạn state; unit test pass. Đang verify trực quan trên browser. |
| **Tránh Sai Lệch Cũ** | • Loại bỏ hoàn toàn video Big Buck Bunny.<br>• Sửa registry fallback sai mô phỏng.<br>• Xử lý quota IndexedDB trung thực. | Quét mã nguồn không còn bunny; kiểm thử `tests/responsive_and_acceptance.test.ts`. | **PASS** | BigBuckBunny đã loại bỏ 100%; `registry.tsx` có fallback trung thực; quota xử lý thông báo rõ ràng. Đã kiểm chứng static scan & unit tests. |
| **Responsive & Devices** | • Hoàn hảo trên 1536x1024, 1366x768, 768x1024, 390x844, 360x800.<br>• Vùng chạm >= 56px cho trẻ, >= 44px cho người lớn. | Kiểm thử `tests/responsive_and_acceptance.test.ts`. | **UNVERIFIED** | Bố cục CSS đã thiết kế; cần screenshot thực tế trên 5 viewports từ dev server để kiểm tra overflow/overlap. |
| **Test Suite Tự Động** | • `npm test` vượt qua 100% tests.<br>• `npm run build` biên dịch sạch sẽ không cảnh báo type. | Chạy `npm test` (55 tests pass) và `npm run build` (exit 0). | **PASS** | 55/55 unit tests passed; TypeScript + Vite production bundle biên dịch thành công 100%. |

---

## 2. Quy Định Đánh Giá Kết Quả Bàn Giao
- **PASS:** Toàn bộ tiêu chí đạt yêu cầu, có bằng chứng ảnh chụp / log chạy thực tế.
- **PARTIAL:** Tính năng đang chạy ổn định nhưng còn phần việc phụ trợ chưa hoàn tất.
- **BLOCKED:** Gặp trở ngại khách quan từ môi trường hoặc công cụ (nêu rõ lý do và giải pháp thay thế).
- **PRE-EXISTING:** Lỗi tồn tại từ trước (phải chứng minh bằng lịch sử commit).
