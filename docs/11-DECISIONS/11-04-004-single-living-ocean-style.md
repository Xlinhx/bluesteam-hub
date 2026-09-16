# Quyết định đã chốt cho bước tiếp theo
## Phạm vi lượt setup
CREATE: hai mockup thay thế (home hành trình và game ghép nơi sống); tài liệu nền, manifest kiểm chứng.
REPLACE: ảnh home và habitat-placement trong bộ hiện hành, bản cũ bảo tồn ngoài ocean.
MODIFY: tên file, index, trạng thái và quy tắc tham chiếu.
RETIRE khỏi bộ hiện hành: các bản cũ, yêu cầu gen ba ảnh còn thiếu, nhãn nhiều concept.
PRESERVE: source code, thay đổi chưa commit, dữ liệu, yêu cầu nghiệp vụ và bản gốc.
Chưa lập kế hoạch triển khai chi tiết, chưa sửa code.

## Sản phẩm và UX
- Một style đại dương tự nhiên: ivory/navy/teal/coral, đa dạng toàn cảnh/cận cảnh/bàn sáng tạo nhưng cùng hệ thống.
- Trẻ 5–6: home dẫn theo hành trình, một hành động tiếp tục rõ, hướng dẫn hình/âm thanh, vùng chạm lớn. Học nguyên tắc dẫn dắt Duolingo/ABC, không sao chép nhận diện hoặc ép streak/mạng sống/đua điểm.
- Không biến toàn bộ sản phẩm thành đường học bắt buộc. Sáng tạo giữ khám phá tự do; kho học liệu vẫn cần duyệt/tìm/lọc.
- Giáo viên giữ công cụ cho người lớn. Landing và khám phá của trẻ có journey/motion có mục đích; không thêm hoạt cảnh cản thao tác người lớn.
- Trình chiếu có điều khiển phát/dừng/thử lại theo giáo viên, khác console riêng tư.
- Một game gồm nhiều vòng quan sát, dự đoán, thao tác, phản hồi, điều chỉnh và thử mới; một ảnh không đại diện toàn bộ logic.
- Tăng học liệu qua catalog có cấu trúc; cơ chế simulation mới có thể cần sân chơi riêng.
- Chỉ gen thêm hai ảnh. Các khác biệt nhỏ, kết quả giáo viên, loading, responsive tablet xử lý trong plan.
- Cơ chế showcase/concept switching cần rút khỏi luồng sản phẩm khi triển khai; trước đó kiểm tra phụ thuộc, giữ route và chức năng thật. Không gỡ code ở lượt setup.

## Quyền ưu tiên
Yêu cầu người dùng mới nhất > quyết định và hợp đồng chuẩn > đặc tả màn được chốt ở Plan mode > ảnh.
Ảnh mới chưa được người dùng duyệt từng chi tiết. Plan phải phân biệt điều đã chốt với thông số còn cần quyết định.

