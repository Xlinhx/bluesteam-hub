# BlueSTEAM — bộ tham chiếu cho bước lập plan
Ngày chuẩn hóa: 2026-09-14.

Đây là SETUP đầu vào cho Plan mode, chưa phải kế hoạch triển khai chi tiết và chưa cho phép sửa code theo bộ ảnh. Người dùng sẽ chuyển sang Plan mode sau khi setup.

## Đọc theo thứ tự
1. requirements-source.txt — bản phác thảo người dùng.
2. DESIGN_CONTRACT.md — yêu cầu sản phẩm; DECISIONS.md — quyết định mới nhất, ưu tiên khi tài liệu cũ mâu thuẫn.
3. REFERENCE_RULES.md — điều hướng, vai trò, asset và giới hạn ảnh.
4. SCENE_INDEX.md + scene-manifest.json — bộ ảnh đang dùng.
5. REFERENCE_CORRECTIONS.md — lỗi đã biết, bắt buộc xử lý trong plan.
6. CONTINUITY.md, REVIEW.md — tính liên tục và bằng chứng cần có.
7. PLAN_INTAKE.md — phần phải hoàn thiện trong Plan mode.
8. PROGRESS.md — trạng thái bàn giao thực tế.

Ảnh PNG nằm trực tiếp tại C:\Users\ADMIN\Downloads\ocean. Tài liệu/manifest ở P:\ocean-immerserve-learning\docs\design\bluesteam-v2. Thư mục cũ được bảo tồn ngoài ocean tại C:\Users\ADMIN\Downloads\ocean-archive-2026-09-14.

Một style Living Ocean; không còn lựa chọn concept A/B/C. Bộ tham chiếu 32 ảnh, gồm hai ảnh thay thế. Ba mục kết quả giáo viên, loading/retry, tablet được chuyển sang đặc tả trong plan; không phải thiếu ảnh cần gen bù.

Ảnh là mockup tham chiếu, không phải production asset hoặc chứng cứ chức năng. Chưa có user approval cho hai ảnh mới. Không đọc archive làm chuẩn; không dùng lỗi trong ảnh để ghi đè hợp đồng. Không tự tiếp tục implement sau setup.

