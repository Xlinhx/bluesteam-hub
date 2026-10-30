# 03 — Khởi chạy và phát triển

## Yêu cầu

Node.js 22, npm, Docker Compose. Không ghi credentials thật vào source hoặc `deploy/environment.example`.

## Frontend/API dev

```sh
npm ci
npm --workspace @bluesteam/contracts run build
docker compose -f compose.yaml up -d bluesteam_db
npm --workspace @bluesteam/server run db:migrate
npm run db:seed:content
npm run dev:api
```

Terminal thứ hai: `npm run dev`. Frontend ở cổng 3010, API ở 8010. Vite proxy `/api` sang API. Database local mặc định: `postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam`. API dùng `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `MEDIA_STORAGE_DIR`/`UPLOAD_DIR`; override bằng env của phiên shell khi cần.

Compose local cần external volume `bluesteam_postgres_data`: nếu là máy mới chưa có volume, tạo bằng `docker volume create bluesteam_postgres_data` trước khi chạy. Không tạo lại hoặc xóa volume đang có dữ liệu.

`npm run db:seed:demo` chỉ cho môi trường demo/test, không chạy trên production. Để bootstrap giáo viên, dùng `npm --workspace @bluesteam/server run bootstrap:teacher` với `BOOTSTRAP_TEACHER_EMAIL`, `BOOTSTRAP_TEACHER_PASSWORD` (ít nhất 8 ký tự) và tùy chọn `BOOTSTRAP_TEACHER_NAME` trong env. Lệnh này có thể cập nhật mật khẩu tài khoản đã có.

## Build

`npm run build:all` build contracts, API rồi frontend. `npm run build` chỉ build frontend, cần contracts đã build. Dockerfiles production tự build workspace cần thiết và chạy JavaScript đã biên dịch.

## Dữ liệu phát sinh

`node_modules`, `dist`, `.vite`, artifacts browser và kết quả test là output tái tạo; không đưa vào production bundle hoặc commit tùy tiện. `storage/` và `backups/` có thể chứa dữ liệu thật, luôn bỏ khỏi Git; kiểm tra người sở hữu/dữ liệu trước khi dọn.
