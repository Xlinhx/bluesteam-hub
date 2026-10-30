# 09 — Kiểm chứng và giới hạn

## Gate bắt buộc

- `npm test`: toàn bộ suite frontend/contract trong `tests/`.
- `npm run validate:visual`: manifest baseline đủ 39 records VERIFIED, không có lỗi.
- `npm run build:all`: TypeScript, contracts, API và frontend build sạch.
- `npm --workspace @bluesteam/server test`: backend unit tests.
- `npm run test:server`: integration trên database test tách biệt.

CI tạo các database `bluesteam_test`, `bluesteam_accounts_test`, `bluesteam_interactive_test`, `bluesteam_interactive_usage_test` trên PostgreSQL tạm. Không chạy integration vào database production hoặc dùng chung phiên database đang nghiệm thu. Các biến `TEST_DATABASE_URL`, `INTERACTIVE_TEST_DATABASE_URL`, `INTERACTIVE_USAGE_TEST_DATABASE_URL` điều khiển từng nhóm; bộ account test hiện vẫn dùng địa chỉ local mặc định.

## Browser và runtime

Playwright configs tại root chọn browser/scope phù hợp. `playwright.creative.config.ts` kiểm quy trình sáng tạo; các config mobile/WebKit/profile kiểm vùng tương ứng. Không restart dịch vụ dùng chung khi chat khác đang nghiệm thu. Trước phát hành cần build Docker images, kiểm API readiness (database up/media writable), API qua Nginx, SPA entry và HTTPS domain thật.

## Bằng chứng baseline

`verification/scene-manifest.json` và `visual-review-manifest.json` là baseline lịch sử. Các file tại `artifacts/verification/` và ảnh tham chiếu được giữ vì validator và showcase đọc chúng. Chúng không chứng minh giao diện hoặc tính năng mới đã được nghiệm thu hôm nay. Không đổi thời gian, score hay trạng thái VERIFIED chỉ để gate xanh; không thay mockup bằng ảnh implementation.

Khi thay UI, thu bằng chứng mới cho phần bị ảnh hưởng. Báo riêng test pass, runtime đã kiểm, phạm vi chưa kiểm và hạn chế. Chỉ exit 0 không đủ để tuyên bố production đã hoạt động.

Mockup lỗi thời đã xóa theo yêu cầu: manifest giữ đường dẫn cũ tại `retiredReferencePath`, checksum và lý do loại bỏ; `referencePath=null` nên showcase không hiển thị ảnh không còn tồn tại. Không cập nhật score, capture time hoặc nhận định lịch sử thành bằng chứng mới. Tests kiểm riêng cả checksum ảnh còn giữ và trạng thái loại bỏ rõ ràng, không yêu cầu khôi phục ảnh đã bị thay thế.
