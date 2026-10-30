# 06 — Sáng tạo và biển chung


Nguồn thiết kế: ảnh T01–T06 và T13. Quyết định mới của người dùng ngày 30/10 thay thế phần thử thách nơi sống trong thiết kế/plan ngày 29/10: **bỏ phía giáo viên, giữ bé xây và lưu tự do**. Đã bỏ sáu mockup T07–T12 khỏi bộ hiện hành.

[Mockup hiện hành](mockups/README.md) · [Provenance ảnh](mockups/provenance.json).

## Phạm vi hiện hành

1. **Biển chung:** mở phiên nhận cả tranh quét giấy và tranh tô màu. Tự thả mặc định hoặc cô xem trước. Mã/QR, trạm quét hộ, xem ảnh gốc/kết quả tách, xem thử chuyển động, thả/ẩn/yêu cầu gửi lại, ghi chú riêng theo bản gửi, tạm ngừng/kết thúc, đổi môi trường.
2. **Tô màu:** khảo sát tổng hợp theo mẫu, phiên bản, thời gian và cách nhập. Phân biệt mở/có thao tác/có lưu/hoàn thành, công cụ và hoàn tác; CSV cùng bộ lọc. Không suy diễn năng lực, không đọc tranh riêng của bé.

Không còn tab Xây nơi sống, preset thử thách, mở mã nơi sống, gom phương án/lịch sử dự án cho cô. Không còn nút tham gia thử thách hoặc gửi sa bàn ở phía bé. Bộ dựng, nhiều cảnh, nguồn mẫu, công cụ, bản lưu và hoàn thành của bé được giữ. Các bản ghi cũ trên server và metadata của bản local cũ không bị xóa; backend tương thích dữ liệu lịch sử, không còn giao diện tạo/nhận thử thách.

## Các ảnh còn dùng để đối chiếu

- **T01:** hero minh họa đàn sinh vật sáp màu, tên/trạng thái/mã/hạn dùng/số đếm thật; nút mở mới màu san hô ở phần đầu; các biển gần đây là hàng có thumbnail và số đếm, không phải bảng.
- **T02:** modal giữa màn hình; tiêu đề giữa, tên biển, môi trường, checkbox xem trước, hạn mã, footer Để sau/Mở biển. Theo yêu cầu mới, trường môi trường mở catalogue ảnh preview có tìm kiếm và phân trang sáu ảnh/trang; chọn xong thu gọn. Cô và bé dùng chung catalogue, ảnh preview cũng là nền thật khi mở biển.
- **T03:** bảng điều khiển với tiêu đề/trạng thái, thao tác tạm ngừng/kết thúc, QR/mã/trạm quét/màn biển, bốn số đếm, biển bên trái và hàng chờ bên phải. Lọc nguồn/tên/trạng thái trước phân trang. Chỉ hiện chuyển lượt khi có trên 40 tranh.
- **T04:** xem tranh theo trang, hai cột ảnh gốc/kết quả tách, xem thử trong biển; nút xử lý theo trạng thái và ghi chú riêng. Chuyển động xem thử không sửa bản gốc. Nút tải ảnh không nằm trong luồng duyệt.
- **T05:** tiêu đề + lọc/CSV; hai số tổng và bảng mẫu tranh; icon, nhãn và số đếm tách rõ.
- **T06:** breadcrumb, tên/phiên bản/ngữ cảnh lọc/CSV; ảnh mẫu bên trái, số đếm/công cụ/hoàn tác/thời gian bên phải. Không ẩn ảnh mẫu trên mobile; dữ liệu chưa thu thập hiển thị đúng giới hạn.
- **T13:** bản tô đã lưu tạo một bản scan độc lập; bé vẫn xem crop/nền trắng và xác nhận trước khi gửi. Môi trường dùng catalogue chung.

## Quy phạm chống drift

- Giữ `AppHeader`, `RoleNavigation`, `TeacherShell`, `ActivityShell`, logo manta, ngôn ngữ, âm thanh và nhận diện tài khoản thật. Không ép avatar ảnh demo trong PNG vào dữ liệu thật.
- Hai tab cục bộ **Biển chung / Tô màu**, Lucide **Waves / Palette**. Tab thứ ba còn trong PNG gốc đã bị loại khỏi phạm vi; không sao chép lại.
- Lead: “Nhận tranh quét và tranh tô màu trong cùng một biển.” Trang xem tranh dùng tên/trạng thái/bản gửi thật.
- Kiểu chữ Be Vietnam Pro của hệ thống; không tự đổi thành serif hay phông khác theo chữ AI. Khung trung tâm 1260px trên desktop; chữ/icon/shape/nút/màu phải được kiểm qua screenshot runtime.
- Số trong mockup là fixture; số trên web lấy từ API. Thumbnail gần đây dựng từ môi trường và tối đa ba ảnh đã thả, không chèn bài của bé khác hay giả số đếm.
- Không tạo lớp học, điểm số, bảng xếp hạng, cue, câu hỏi/nhắc riêng, “buổi chia sẻ”, editor mẫu tô trùng Học liệu hoặc bộ dựng cho cô.

## Minh họa được dùng

`public/assets/generated/creative/teacher-sea-hero-v1.png` được tạo bằng built-in image_gen ngày 30/10 từ ảnh T01 người dùng đính kèm, chỉ tạo minh họa đàn sinh vật ở bên phải hero, không sinh lại giao diện. Prompt: tái hiện cá hề cam, cá heo xanh, rùa xanh, sứa hồng, cua cam/sao biển hồng cùng rong và san hô; nét sáp màu trẻ em trên nền watercolor xanh nhạt; khung ngang, không chữ/nút/viền. File gốc còn ở thư mục generated_images của Codex.

Các PNG thiết kế không bị sửa để hợp thức hóa implementation. Screenshot `artifacts/creative-teacher-*.png` là ảnh web chạy thật, không thay thế ảnh tham chiếu. Kiểm thử chức năng và 39 baseline VERIFIED không phải bằng chứng khớp từng pixel.

## Phía học sinh

Hub, thư viện tô màu, palette và object library hỗ trợ tìm kiếm/phân trang. Chọn thumbnail khác hành động thêm instance. Giữ nhiều scene, transform, nguồn mẫu và trạng thái đã lưu. Mở rộng thư viện không được tải mọi model vào scene.

Bản tô lưu có thể tạo một bản scan độc lập. Bé xem lại crop/nền trắng và xác nhận trước khi gửi; lỗi mạng hoặc đổi mã phiên làm mất hiệu lực hành động gửi cho tới khi xác minh lại. Không dùng AI sinh lại nét vẽ gốc. Local metadata của thử thách cũ vẫn đọc được, nhưng UI gửi/tham gia thử thách nơi sống đã gỡ.

Bản hoàn thành và bản đang sửa tách biệt. Xem hồ sơ hoặc tiếp tục chỉnh sửa không tự đổi thành phẩm. API kiểm role/ownership; preview không được ghi usage hoặc phát sinh bản gửi thành công giả.
