# 01 — Sản phẩm và phạm vi

BlueSTEAM giúp trẻ khám phá đại dương bằng hình ảnh, thao tác, âm thanh và phản hồi trực tiếp; giáo viên tổ chức nội dung và xem đúng dữ liệu phát sinh. Hạn chế văn bản bắt buộc trong hoạt động dành cho trẻ; không đánh giá năng lực từ số lần bấm hoặc từ tranh.

## Bề mặt đang chạy

- Công cộng: landing, chọn vai trò, đăng nhập/đăng ký.
- Học sinh: trang chủ, học liệu, atlas/3D, tương tác, xưởng sáng tạo và hồ sơ tác phẩm.
- Giáo viên: trang chủ, quản lý học liệu, xem thử và số liệu tương tác; Biển chung và Khảo sát tô màu.
- Biển chung: nhận tranh giấy quét hoặc bản tô đã lưu, xem lại tách nền, đưa vào môi trường biển, cô duyệt/ẩn và ghi chú riêng.

Phòng học cũ đã gỡ khỏi luồng chính. Không khôi phục danh sách lớp, thi đua, dashboard kết quả giả hoặc thử thách nơi sống cho cô chỉ vì chúng xuất hiện trong fixture/migration/API lịch sử. Bé vẫn xây và lưu nơi sống tự do. Các route `/student/*`, `/teacher/builder` và showcase còn được dispatcher hỗ trợ để tương thích; không phải sản phẩm mới cần mở rộng.

## Dữ liệu thật

Tài khoản có role teacher/student; API thực thi quyền sở hữu. Draft local không đồng nghĩa đã lưu server. Dữ liệu seed content phục vụ catalog; demo seed chỉ dùng môi trường kiểm thử/trình diễn. Số đếm, trạng thái, phiên bản và CSV tính từ API, không chép số trong mockup. Giữ trạng thái rỗng, loading, lỗi, nhiều dữ liệu và khả năng thử lại.
