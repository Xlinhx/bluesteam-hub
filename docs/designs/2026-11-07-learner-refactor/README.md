# Blue STEAM Hub — Mockup góc học sinh

Bộ thiết kế tĩnh cho mục 3–7. Học liệu, Tương tác, Sáng tạo và Hồ sơ dùng khung trắng–xanh và chibi ở điểm nhấn. Cảnh Học tập có ánh sáng và tỷ lệ sinh vật tự nhiên. Ảnh dưới đây dùng để duyệt bố cục và luồng. Xem [plan triển khai](../../superpowers/plans/2026-11-07-learner-content-refactor.md) và [đặc tả giao diện](design-spec.md).

| Yêu cầu | Ảnh để duyệt | Đối chiếu khi dựng |
| --- | --- | --- |
| **3. Học liệu** | [01 — Tổng quan và Flashcards](mockups/01-resources.png) | Hero trắng với vỏ ốc chibi, tám mục có SVG ngay dưới hero, lọc theo chủ đề/tầng và nhóm trên các thẻ nhỏ. Giữ Tìm học liệu và Đã lưu. |
| | [09 — Chi tiết Rạn san hô](mockups/09-resources-reef-detail.png) | Thẻ San hô cành, loa toàn bài và loa riêng ở Đặc điểm, Nơi ở, Cần gì. Mẫu “Cần gì?” là câu hỏi để nghe. |
| | [10 — Audio và Video](mockups/10-resources-media.png) | Danh sách và trình phát chính; nút nghe độc lập. Dùng cùng bố cục cho tab Audio khi không có khung video. |
| | [16 — Hình ảnh và bản in](mockups/16-resources-visual-print.png) | Phiếu học tập làm mẫu bố cục danh sách và phần đọc cho Hình ảnh, Tranh tô màu, Phiếu học tập và Poster. Mỗi loại chỉ hiện tác vụ phù hợp. |
| | [11 — Kho học liệu tải về](mockups/11-resources-downloads.png) | Danh sách file và preview từng trang, Xem bản in và Tải PDF. |
| **4. Học tập** | [02 — Bản đồ dọc](mockups/02-learning-map-vertical.png) · [03 — Bản đồ ngang](mockups/03-learning-map-horizontal.png) | Năm tầng dọc, sáu điểm ngang theo Excel. |
| | [12 — Giới thiệu vùng](mockups/12-learning-zone-intro.png) | Nghe, xem và Chọn nhóm. Dùng cùng màn cho cả hai trục. |
| | [13 — Nhóm, sinh vật và mục lục](mockups/13-learning-species-index.png) · [17 — Mục lục trên điện thoại](mockups/17-learning-mobile-catalog.png) | Chọn nhóm → tìm, lọc và tải thêm sinh vật → xem trước → vào cảnh hoặc mở thẻ trực tiếp. |
| | [07 — Chuyến lặn](mockups/07-learning-dive.png) | Cảnh quan sát cá heo, Độ sâu, Thu phóng, Quan sát, âm thanh và tạm dừng. |
| | [08 — Sổ đã ghi](mockups/08-learning-notebook.png) · [18 — Thẻ chưa ghi và lối vào 3D](mockups/18-learning-model-entry.png) | Sổ có ảnh, nghe, Ghi vào sổ hoặc Đã học, Mục lục và Bơi tiếp. 18 có đường Quan sát 3D vì mẫu rùa có model ứng viên. |
| **5. Tương tác** | [04 — Tổng quan Tương tác](mockups/04-interactive.png) | Bốn lối vào có loa riêng, icon mới và nền san hô chibi. Game mới chờ danh sách. |
| | [18 → 14 — Từ thẻ đến viewer 3D](mockups/14-learning-model-inspector.png) | Viewer thuộc luồng Học tập, có VR và Model Inspector. Ảnh 14 minh họa phản hồi +100 sau khi Inspector được ghi nhận, chưa sử dụng VR. |
| **6. Sáng tạo** | [05 — Góc sáng tạo](mockups/05-creative.png) | Đúng hai câu giới thiệu, nền chibi và các đường quét, tô, xây, làm tiếp. |
| **7. Hồ sơ** | [06 — Thông tin cá nhân](mockups/06-personal-profile.png) · [15 — Chi tiết các bộ sưu tập](mockups/15-profile-collections.png) | Bốn trường tự nhập. Tổng quan và màn xem thêm cho tiến trình, thành tích, sinh vật đã học, game đã chơi và sản phẩm. 15 dùng Sản phẩm đã tạo làm mẫu có dữ liệu và bộ lọc. |

## Nguồn cần mở cùng ảnh

- **Học liệu.** Flashcard mẫu lấy từ Thẻ học liệu 2 p1, p3, p5, p7. Bìa xem tải về từ Sách học liệu 3 p1. Phiếu minh họa từ Sách p17 và p9. Trang bảng mẫu từ Bảng Học liệu 3 p1. Các hình trong mockup tái hiện bố cục, khi triển khai dùng bản trích nguyên từ PDF. Media của 10 chờ xác minh tệp ngoài. [Bộ thẻ](references/cards-contact-1.jpg) · [Sách](references/book-contact-1.jpg) · [Bộ bảng](references/boards-contact-1.jpg)
- **Học tập và Rạn san hô.** Excel quyết định tầng, vùng, nhóm và membership. Phần chưa phân để trống. 12 lấy mẫu từ Sheet1 D4 của workbook ngang. 13/17 dùng Vùng thượng tầng B2:G4, 08 dùng B2:H2, 18 dùng B5:H5. 09 dùng sheet Rạn san hô B4:F4. [Kiểm kê nguồn](source-audit.md) · [Ảnh cá heo gốc](references/learning-source/upper-row-2-image-1.png) · [Ảnh San hô cành gốc](references/learning-source/reef-row-4-image-1.jpeg)
- **Hồ sơ và thưởng.** Trường, Năm học, Lớp do bé tự nhập. Tác phẩm và số liệu trên ảnh là mẫu. +100 một lần cho mỗi bé, mỗi chế độ và mỗi mô hình, sau khi mở chế độ thật và server xác nhận. Model Rùa biển xanh là ứng viên, cần kiểm provider, quyền dùng và đúng loài trước khi bật.
- **Dựng và kiểm.** Tái dùng khung khi các màn chỉ đổi format hoặc trạng thái nhỏ. Giữ shell học sinh hiện tại ở các màn thường. Dùng asset tách lớp, ảnh nguồn, SVG và chữ thật. Kiểm chuyển động, giọng, tiến trình, VR, tải file và seed/CI/CD bằng proof riêng khi triển khai. [Năm file nguồn và hash](source-files.json) · [QR ứng viên](qr-media-candidates.json) · [Prompt và checksum ảnh](generation-records.json)
