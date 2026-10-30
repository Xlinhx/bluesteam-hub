# Dữ liệu seed và provenance

`data.json` là input của `server/src/database/seeds/import-seed.ts`. `source-manifest.json` và `sources/` giữ checksum nguồn; không import các bản source lưu trữ vào ứng dụng.

- `reusableContent`: nội dung cho content/demo seed, được các adapter hiện tại chuẩn hóa trước khi ghi DB.
- `demoFixtures`: dữ liệu thử; production không tạo giáo viên, lịch sử hoặc điểm mẫu từ nhóm này.
- `retiredCurriculum`, `fakeLearningResults`: dữ liệu lịch sử được phân loại để importer loại trừ, không phải tính năng đang chạy.

Nội dung nguồn và checksum được giữ nguyên khi chuyển từ docs sang server. Một số tên/đường dẫn trong nguồn là dấu vết lịch sử, không phải đường dẫn runtime. Không chạy lại generator cũ để ghi đè dữ liệu đã chuẩn hóa. Kiểm bằng `tests/seed_archive.test.ts`, backend seed unit và integration tests.
