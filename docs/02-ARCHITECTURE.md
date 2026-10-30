# 02 — Kiến trúc và dữ liệu

## Ranh giới

- `src/app/`: bootstrap UI, dispatcher và history router.
- `src/domains/public`, `learner`, `teacher`, `showcase`: màn hình và logic theo concept.
- `src/shared/`: API client, auth, activities runtime, creative, audio, i18n, shells và UI dùng chung.
- `packages/contracts/`: schema/validator và kiểu dữ liệu chia sẻ; build trước consumers.
- `server/src/`: NestJS modules theo nghiệp vụ, database pool/migrations và seed importer.
- `server/seed-data/`: dataset và provenance nguồn của importer. `sources/` là bản lưu checksum, không phải code runtime.
- `deploy/`, Dockerfiles và compose: cấu hình chạy local/production; `.github/workflows/ci.yml` điều phối CI/CD.
- `tests/`, `server/test/`, `e2e/`: kiểm chứng frontend, backend và browser.

File tồn tại vì một trách nhiệm. Thành phần xuyên domain thuộc shared; không chia nhỏ theo số dòng hoặc nhân bản hiệu ứng. Store giữ vai trò dữ liệu, không chứa UI. Tôn trọng public routes và dữ liệu lịch sử đang có consumer.

## Luồng dữ liệu

UI → shared API client → NestJS controller/service → PostgreSQL và media storage. Activities dùng schema trong contracts và snapshot nội dung/version để report không bị đổi nghĩa khi catalog cập nhật. Sáng tạo có bản đang sửa, bản lưu và thành phẩm; không ghi đè thành phẩm bằng draft chưa hoàn tất.

API startup chạy migrations với advisory lock và checksum. Không sửa SQL đã áp dụng trên database đang dùng; thêm migration mới nếu cần. Không xóa bảng/API lịch sử chỉ vì đã gỡ nút khỏi UI. Seed content và demo tách biệt; importer kiểm nguồn và giữ chỉnh sửa đã có theo contract.

BroadcastChannel/local storage chỉ giải quyết trạng thái trong browser/thiết bị; không dùng chúng làm bằng chứng đồng bộ nhiều máy. Dữ liệu bền vững và quyền phải được kiểm ở backend.
