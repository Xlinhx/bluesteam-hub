# Đặc Tả 35 Màn Hình — BlueSTEAM v2 (PAGE_SPECS.md)

Phong cách: Living Ocean (duy nhất)
Tổng số màn: 32 màn có mockup tham chiếu + 3 màn đặc tả trong kế hoạch

---

## 1. Danh Mục Nhóm Màn Hình

| STT | Screen ID (Suffix sau `bluesteam-v2-`) | Vai Trò & Shell | Tên Màn Hình & Nhiệm Vụ Cốt Lõi | Mockup Reference & Corrections |
|---|---|---|---|---|
| 1 | `public-landing-overview` | PublicShell | Landing giới thiệu đầy đủ 7 nhịp đại dương | Giữ 7 nhịp; bỏ avatar An/đăng nhập học sinh khi chưa chọn hồ sơ |
| 2 | `public-role-and-access` | PublicShell | Cửa ngõ chọn vai trò (Trẻ em / Giáo viên / Khách) & vào lớp | Không hiện như đã đăng nhập; phân vai rõ ràng |
| 3 | `public-adult-login` | PublicShell | Đăng nhập cục bộ dành cho người lớn/giáo viên | Xác thực local, form sạch, không giả lập email/SMS server |
| 4 | `learner-home-overview` | LearnerShell | Trang chủ học sinh: Bản đồ hành trình, điểm tiếp tục rõ | Không Duolingo streak/mạng; nhân vật dẫn đường, lối vào Xưởng vẽ |
| 5 | `resources-library-overview` | LearnerShell | Học liệu tuyển chọn: Bộ sưu tập nổi bật, chủ đề chính | Dùng chung taxonomy với catalog; active menu Học liệu |
| 6 | `resources-catalog` | LearnerShell | Kho học liệu duyệt toàn diện: Tìm kiếm, lọc, phân trang/xem thêm | Hỗ trợ trạng thái ít/nhiều/rỗng; card thống nhất |
| 7 | `resources-flashcard-detail` | LearnerShell | Thẻ học sinh vật chi tiết: Lật 2 mặt, nghe phát âm, đặc tính | Active Học liệu; mở rộng đặc điểm sinh học theo nhu cầu |
| 8 | `resources-media-player` | LearnerShell | Trình phát video bài học: Điều khiển chuẩn, giải thích sinh học | Phát media thật hoặc placeholder trung thực; bỏ Big Buck Bunny |
| 9 | `resources-print-preview` | LearnerShell | Xem trước & in ấn: Tranh tô màu, worksheet bài tập thực | Bỏ mục cộng đồng tự sinh; xuất PDF/in trực tiếp từ trình duyệt |
| 10 | `ocean-horizontal-atlas` | LearnerShell | Bản đồ đại dương ngang: Bờ biển, cồn cát đất liền, đánh bắt, biển khơi | Active Học tập; cồn cát thuộc đất liền, đánh bắt là lớp hoạt động |
| 11 | `ocean-vertical-atlas` | LearnerShell | Bản đồ đại dương dọc: Mặt cắt 5 tầng nước sâu | Không gán sứa cho mọi tầng; thông tin áp suất/ánh sáng chính xác |
| 12 | `ocean-creature-viewer` | LearnerShell | Sân quan sát Rùa Xanh 3D: Xoay, zoom giới hạn, hotspot mai/vây | Three.js 3D thật; thuyết minh giọng đọc, reset góc nhìn |
| 13 | `game-lab-overview` | LearnerShell | Game Lab tổng quan: 3 nhóm Nhận biết, Thấu hiểu, Vận dụng | Active Tương tác; điểm tiếp tục nổi bật, ít lựa chọn cản trở |
| 14 | `game-lab-recognition-round` | ActivityShell | Vòng nhận biết sinh vật biển: Nghe tên, nhận diện hình thái | Tối thiểu 3 lượt; phản hồi trực quan, không phạt mạng |
| 15 | `game-lab-habitat-placement` | ActivityShell | Ghép nơi sống phù hợp: Tìm nơi rùa xanh tìm thức ăn (cỏ biển/tảo) | Thao tác chạm/kéo thả; phản hồi gợi ý khi chọn sai, thử lại tự do |
| 16 | `game-lab-habitat-feedback` | ActivityShell | Phản hồi ghép nơi sống: Quan sát hệ quả rùa ăn cỏ biển | Sử dụng camera/đối tượng thống nhất; không nhân đôi vật thể |
| 17 | `simulations-catalog` | LearnerShell | Kho mô phỏng sinh thái: Giới thiệu 3 kịch bản chính | Active Tương tác; thẻ mô phỏng khoa học |
| 18 | `simulations-my-action-choice` | ActivityShell | Mô phỏng "Hành động của em": 3 lựa chọn xử lý rác nhựa | Điểm quyết định tương tác; phân biệt rõ lựa chọn với hệ quả |
| 19 | `simulations-my-action-compare` | ActivityShell | So sánh hệ quả: Đặt 2 lần thử nghiệm cạnh nhau | Cùng góc nhìn và vật thể; hiển thị bài học rút ra |
| 20 | `simulations-plastic-journey` | ActivityShell | Hành trình mảnh nhựa: 5 chặng từ đất liền đến đại dương | Có điểm dự đoán và can thiệp dọn rác; không phải video tuyến tính |
| 21 | `simulations-rescue-mission` | ActivityShell | Nhiệm vụ giải cứu: 4 loài (rùa, mực, cá heo, cá voi) | Chọn cách hỗ trợ an toàn: Báo người lớn / gọi cứu hộ khi vướng lưới |
| 22 | `creative-studio` | LearnerShell | Xưởng sáng tạo tổng quan: Khay sản phẩm, nút tạo tranh/sinh cảnh | Ô rỗng để tạo mới, hiển thị sản phẩm đã lưu thực tế |
| 23 | `creative-drawing` | ActivityShell | Xưởng vẽ & tô màu 2D: Nét cọ, màu Living Ocean, tẩy, undo/redo | Lưu IndexedDB, xuất file, canvas thích ứng màn hình |
| 24 | `creative-habitat-build` | ActivityShell | Xây dựng sinh cảnh 3D: Đặt rạn san hô, cỏ biển, cá trên nền cát | Three.js isometric; chọn/đặt/xoay/xóa trực quan |
| 25 | `creative-habitat-run` | ActivityShell | Chạy thử sinh cảnh: Kích hoạt sinh vật bơi lội, bọt khí | Cùng dữ liệu object/transform với bản build; nút quay lại sửa |
| 26 | `profile-learner-profile` | LearnerShell | Hồ sơ và hành trình của bé: Tiến trình, huy hiệu, tranh đã vẽ | Lấy dữ liệu thực từ demoStore & IndexedDB; mở lại đúng tranh |
| 27 | `teacher-dashboard` | TeacherShell | Bàn làm việc giáo viên: Tổng quan lớp, giáo án gần đây, lối tắt | Mật độ công cụ người lớn chuyên nghiệp, danh tính giáo viên |
| 28 | `teacher-resource-library` | TeacherShell | Kho học liệu giáo viên: Giáo cụ mầm non 5–6 tuổi | Bỏ các phân cấp Tiểu học/THCS/THPT không liên quan |
| 29 | `teacher-lesson-plan` | TeacherShell | Chi tiết giáo án mẫu: Mục tiêu STEAM, tiến trình 5 bước | Kế hoạch giảng dạy đại dương có cấu trúc sư phạm chuẩn |
| 30 | `teacher-lesson-builder` | TeacherShell | Trình soạn bài giảng: Ghép nối hoạt động, xem trước preview | Lựa chọn bước khớp với preview; đồng bộ dữ liệu |
| 31 | `teacher-live-console` | TeacherShell | Điều khiển lớp học trực tiếp: Điều hướng bước, phát media, thăm dò | Đồng bộ tức thì với Presentation qua BroadcastChannel |
| 32 | `teacher-presentation` | PresentationShell | Màn hình chiếu lớp học: Toàn màn hình, hình ảnh lớn, không menu cá nhân | Nhận lệnh điều khiển từ Console giáo viên, chữ cực to cho cả lớp |
| 33 | `teacher-session-results` | TeacherShell | *(Đặc tả trong Plan)* Báo cáo kết quả buổi học: Mức độ tương tác, tổng kết | Thống kê số hoạt động hoàn thành, tác phẩm tiêu biểu của lớp |
| 34 | `system-loading-retry` | Toàn hệ thống | *(Đặc tả trong Plan)* Trạng thái tải & Xử lý lỗi kết nối / WebGL | Rùa nhỏ bơi chờ (chỉ hiện khi tải > 300ms); nút Thử lại rõ ràng |
| 35 | `responsive-tablet-mobile` | Toàn hệ thống | *(Đặc tả trong Plan)* Quy chuẩn bố cục Tablet & Mobile cho 34 màn | Bottom nav 5 mục, dock thao tác dưới, touch target $\ge 56\text{px}$ |

---

## 2. Chi Tiết Các Màn Hình Trọng Yếu

### 2.1. `learner-home-overview` (Trang Chủ Học Sinh)
- **Primary Job:** Tạo cảm hứng, cho trẻ biết ngay bước tiếp theo cần khám phá là gì, và cung cấp lối vào nhanh tới Xưởng sáng tạo / Vào lớp học.
- **Bố cục:**
  - Header: Logo sóng BlueSTEAM, navigation 5 mục chuẩn, avatar bé An góc phải.
  - Hero Card trên cao: "Chào bé An! Hôm nay chúng ta cùng lặn xuống Rạn san hô nhé!", nút CTA Coral lớn "Tiếp tục khám phá" dẫn tới chặng hiện tại.
  - Sân chơi Hành Trình: Con đường lượn sóng mềm mại với các trạm tròn (JourneyNode). Các trạm đã hoàn thành có dấu tích sao vàng vỏ sò; trạm hiện tại phát xung ánh sáng nhẹ; trạm tương lai mờ nhẹ và có icon ổ khóa nhỏ đáng yêu.
  - Floating Dock bên cạnh: Lối tắt vào "Xưởng sáng tạo" và "Nhập mã vào lớp".
- **Responsive:**
  - Desktop: Đường hành trình uốn lượn ngang/xiên rộng mở.
  - Mobile/Tablet: Đường hành trình cuộn dọc mượt mà, các trạm chạm lớn $\ge 64\text{px}$, Bottom Navigation 5 icon lớn ở chân màn hình.

### 2.2. `ocean-creature-viewer` (Sân Quan Sát Rùa Xanh 3D)
- **Primary Job:** Trẻ được trực tiếp tương tác, xoay lật ngắm nhìn chú Rùa Xanh (Chelonia mydas) trong không gian 3D chân thực, chạm vào mai và vây để nghe thuyết minh sinh học.
- **Bố cục:**
  - Toàn màn hình đại dương với ánh nắng khúc xạ (caustics) và bọt nước nhẹ.
  - Trung tâm: Mô hình Rùa Xanh 3D Three.js bơi nhẹ nhàng theo chu trình tuần hoàn.
  - Thanh công cụ nổi bên phải/dưới: Xoay tự do (orbit), Zoom giới hạn, Nút Reset góc nhìn ban đầu.
  - Hotspot gắn trên mai rùa (Carapace) và vây trước (Flipper): Khi chạm vào, phát âm thanh mô tả: "Mai rùa cứng như chiếc áo giáp bảo vệ rùa khỏi cá dữ!" hoặc "Đôi vây to khỏe giúp rùa bơi lướt sóng hàng nghìn cây số!".
  - Chế độ Fallback: Nếu trình duyệt không bật WebGL, tự động chuyển sang ảnh minh họa giải phẫu chi tiết kèm thuyết minh đầy đủ, hiển thị thông báo "Chế độ xem 2D nhẹ".

### 2.3. `game-lab-habitat-placement` (Game Ghép Nơi Sống Phù Hợp)
- **Primary Job:** Dạy trẻ hiểu đặc điểm kiếm ăn và sinh cảnh của rùa xanh trưởng thành (theo tài liệu khoa học NOAA: ăn rong biển và cỏ biển ở vùng nước nông có ánh nắng).
- **Bố cục:**
  - Nửa trên: Cảnh quan đại dương với các vùng sinh cảnh: (A) Rừng ngập mặn rễ chùm, (B) Thảm cỏ biển nước nông đầy nắng, (C) Vực sâu tối tăm.
  - Nửa dưới: Khay sinh vật rùa xanh bơi lội, kèm câu hỏi: "Bé hãy đưa chú Rùa Xanh này đến nơi có nhiều món ăn yêu thích nhất của bạn ấy nhé!".
  - Phản hồi tương tác:
    - Nếu thả vào Thảm cỏ biển: Rùa bơi lại ăn cỏ biển vui vẻ, bọt nước nổi lên, âm thanh chúc mừng nhẹ nhàng: "Đúng rồi! Rùa xanh rất thích ăn cỏ biển và rong rêu ở vùng nước nông đấy!".
    - Nếu thả vào Vực sâu: Rùa lắc đầu bơi ngược trở lại, giọng hướng dẫn gợi ý: "Ở đây tối và lạnh quá, lại không có cỏ biển đâu bé ơi. Bé hãy tìm vùng nước nào ngập tràn ánh nắng xem!". Trẻ không bị phạt điểm hay trừ mạng, tiếp tục thử lại ngay lập tức.
