# Điểm vào Plan mode — chưa phải plan triển khai
Mục tiêu của lượt tiếp theo: đọc repo và bộ tham chiếu đã chuẩn hóa, lập kế hoạch chi tiết cho Gemini. Chưa implement.

Các phần plan cần giải quyết:
- Audit routes, component/shell, showcase, dữ liệu và code hiện tại; lập danh mục CREATE/MODIFY/REPLACE/RETIRE/MIGRATE/PRESERVE có phụ thuộc.
- Đặc tả từng màn với entry/action/feedback/exit, states, image IDs và corrections; mapping yêu cầu nguồn không bỏ sót.
- Chốt tokens và hình dạng component/icon, mọi trạng thái và responsive; không lấy mỗi ảnh một menu.
- Asset/layer manifest riêng cho production: prompt, tệp, camera, alpha, anchor, z-order, 2D/2.5D/3D và phương án fallback.
- Motion có trigger, thời lượng dự kiến, interrupt/pause/replay/reduced motion; không suy ra animation từ ảnh tĩnh.
- Hoạt động nhiều vòng, state continuity, lưu/mở, nội dung nhiều quy mô và simulation mở rộng.
- Ba mục SPEC_IN_PLAN: kết quả/hồ sơ giáo viên, loading/retry, tablet creative; không đặt việc gen ảnh làm phụ thuộc bắt buộc.
- Giải quyết nguồn media, mô hình 3D và dữ liệu thật; kiểm lại bằng source trước khi kết luận. Những phát hiện trước như video sai chủ đề, background lặp, localStorage/BroadcastChannel chưa chứng minh đa thiết bị cần xác minh lại.
- Các chặng Gemini: nền tảng chung, một luồng hoàn chỉnh, rồi mở rộng; mỗi chặng có bằng chứng và điều kiện thoát.
- Vòng đối chiếu screenshot đúng viewport, chi tiết nút/SVG, tương tác thực và lỗi; chốt cách ghi thiếu sót thay vì tự chấm phần trăm.
- Bảo tồn thay đổi code chưa commit. Gỡ showcase có kiểm phụ thuộc, không làm mất nghiệp vụ.
- Viết prompt khởi động portable tham chiếu đúng path và thứ tự tài liệu sau khi plan hoàn chỉnh.

Setup không quyết định thay người dùng về backend, thư viện 3D, thông số motion hoặc lịch triển khai. Không tự coi các mục trên là quyết định kiến trúc đã duyệt.

