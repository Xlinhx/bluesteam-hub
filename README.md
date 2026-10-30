# BlueSTEAM

Nền tảng khám phá đại dương cho học sinh nhỏ tuổi và giáo viên: học liệu, hoạt động tương tác, vẽ/tô màu, xây nơi sống và biển chung từ tranh quét.

React 19, TypeScript, Vite 5, Tailwind CSS 4, Three.js; backend NestJS, PostgreSQL 16. Source chia theo domain và concept, dùng chung contracts trong `packages/contracts`.

## Bắt đầu

Cần Node.js 22, npm và Docker Compose. Chạy `npm ci`, `npm --workspace @bluesteam/contracts run build`. Xem [khởi chạy](docs/03-DEVELOPMENT.md) để tạo database local và chạy API/frontend.

## Tài liệu

[Mục lục](docs/README.md) · [Sản phẩm](docs/01-PRODUCT.md) · [Kiến trúc](docs/02-ARCHITECTURE.md) · [Vận hành và CI/CD](docs/08-OPERATIONS.md) · [Kiểm chứng](docs/09-QUALITY.md).

Trước phát hành: `npm test`, `npm run validate:visual`, `npm run build:all` và backend integration trên database test. Mockup hiện hành nằm phẳng tại `docs/mockups/`; ảnh bằng chứng baseline được giữ riêng tại `artifacts/verification/`.

Production chỉ deploy commit trên `main` đã pass CI. Secrets ở GitHub Actions, không commit runtime env. Việc chuẩn bị hạ tầng không chứng minh app đã được phát hành.
