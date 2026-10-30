# CI/CD BlueSTEAM trên VPS

## Cấu hình đã chuẩn bị

- Repository: `initforge/ocean-immerseve-learning`, nhánh production `main`.
- VPS: `36.50.26.70:22`, SSH user `bluesteam-deploy`, xác thực bằng key riêng.
- GitHub Actions secrets đã cấu hình: `VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`, `PRODUCTION_ENV`.
- `PRODUCTION_ENV` chứa mật khẩu PostgreSQL, JWT secret và seed password ngẫu nhiên; CORS cho `https://bluesteam.webinprogress.click`. Không chứa mật khẩu root VPS.
- Repository variable `ENABLE_PRODUCTION_DEPLOY=true`: push đầy đủ lên `main` sẽ deploy sau khi CI pass.
- VPS đã có user, SSH authorized key và các thư mục `/srv/bluesteam/{releases,shared,backups,media}`. User thuộc nhóm Docker, có quyền quản lý Docker trên host; chỉ cấp key cho người được tin cậy.
- Nginx vhost riêng đã cài cho `bluesteam.webinprogress.click`; Let's Encrypt đã cấp chứng chỉ, có certbot timer và hook reload Nginx sau gia hạn. Đã kiểm tra TLS trực tiếp origin và HTTPS qua Cloudflare. Trong khi chưa có app, hostname trả HTTP 503 với thông báo chờ deploy.
- Chưa commit/push app hoặc workflow local; chưa chạy app, tạo database hay cài runtime env trên VPS. Các website đang có được giữ nguyên.

## Luồng workflow

`.github/workflows/ci.yml` chạy trên pull request, push `main`/`master` và thao tác thủ công. CI dùng PostgreSQL tạm, chạy migrate, seed demo chỉ trong CI, frontend tests, backend unit/integration tests, visual validation và build toàn bộ workspace.

Khi bật deploy, chỉ push `main` hoặc thao tác thủ công trên `main` với input `deploy=true` được triển khai, sau khi CI pass. Artifact chứa source của đúng commit vừa kiểm tra; máy chủ không cần GitHub PAT hay repo deploy key.

Release nằm tại `/srv/bluesteam/releases/<sha>-<run>-<attempt>`. Workflow kiểm tra SSH host key cố định, truyền runtime env bằng SCP và chạy `deploy/deploy.sh`. Script khóa phiên deploy, build images trước, sao lưu database đang có, rồi chạy Compose và kiểm tra API trực tiếp, API qua frontend, trang chủ. API chạy migrations theo cơ chế hiện có; đợt đầu khôi phục snapshot database/media local đã được chuẩn bị riêng trên VPS; những đợt sau không seed lại.

Uploads nằm tại `/srv/bluesteam/media`, database ở volume `bluesteam-prod_bluesteam_pgdata`. Không chạy `docker compose down -v`, không xóa release hoặc backup tự động. Trước khi thay container, script sao lưu database đang có và media nếu không rỗng. Release đã kiểm tra thành công được đánh dấu bằng symlink `/srv/bluesteam/current`; symlink này không tự rollback container hay schema nếu deploy sau bị lỗi. Khi lỗi, kiểm tra logs trước khi phục hồi; không tự phục hồi database vì có thể mất dữ liệu mới. Backup hiện nằm cùng VPS, chưa có bản sao ngoài host.

## DNS và HTTPS khi sẵn sàng xuất bản

Trong zone `webinprogress.click`, tạo record:

- Type: `A`
- Name: `bluesteam`
- IPv4: `36.50.26.70`
- Proxy status: `Proxied`
- TTL: `Auto`

Tên đầy đủ là `bluesteam.webinprogress.click`; record đã phân giải qua Cloudflare. `deploy/nginx-host.conf.example` là cấu hình đang cài trên host: HTTP phục vụ ACME challenge và redirect HTTPS; HTTPS proxy đến `127.0.0.1:3010`, có thông báo 503 khi chưa có app. Chứng chỉ origin hợp lệ cho hostname, sẵn sàng dùng Cloudflare SSL/TLS `Full (strict)`; chưa đọc hoặc thay đổi thiết lập SSL/TLS toàn zone trong Cloudflare.

## Điều kiện bật triển khai

1. Đưa bản app hoàn chỉnh lên GitHub theo phạm vi được chủ repo duyệt, bao gồm backend, contracts, Dockerfiles, compose, deploy scripts, source/assets và toàn bộ fixture/evidence mà test/visual manifest yêu cầu. Các file chưa commit ở máy local không có trên GitHub runner. Không commit credentials hoặc runtime env.
2. Chạy `npm test`, `npm run validate:visual`, `npm run build:all`, backend unit/integration trên database riêng và smoke Docker/HTTPS. Các kết quả của bản trước không thay thế kiểm chứng commit chuẩn bị phát hành.
3. Push lên `main` sẽ chạy CI và tự deploy khi pass; variable đã bật. Lần chạy GitHub Actions và deploy production đầu tiên vẫn cần kiểm chứng sau khi code đầy đủ được push.
4. Có thể chạy workflow thủ công trên `main` với `deploy=true` khi workflow đã có trên GitHub.
5. Đợt đầu sao chép dữ liệu local và media server; auth sessions không chuyển. Những đợt sau chỉ chạy migration và giữ dữ liệu production.

Có thể dừng các lần deploy tiếp theo bằng cách đặt lại `ENABLE_PRODUCTION_DEPLOY=false`. Thao tác này không dừng workflow đã chạy hoặc container đang phục vụ.

## Kiểm chứng gói phát hành

CI build cả hai Docker images từ source đã giải nén trong release archive, trước khi upload artifact. Deploy khôi phục snapshot local đúng một lần, sau đó tạo lại Nginx frontend để phân giải đúng IP backend mới. Nginx bên trong giữ header HTTPS do reverse proxy trên host gửi xuống để cookie production có thuộc tính Secure.

## Khởi tạo một lần từ local

`/srv/bluesteam/bootstrap/` chứa `local.dump`, `media.tar.gz` và `SHA256SUMS`, được truyền qua SSH, không vào Git/Actions artifact. `deploy/bootstrap-local.sh` chỉ khôi phục khi database và thư mục media trống; PostgreSQL restore dùng một transaction. Marker `/srv/bluesteam/shared/local-bootstrap-complete` lưu checksum sau thành công. Các lần deploy sau thấy marker sẽ bỏ qua hoàn toàn bootstrap, không chạy content/demo seed. Không xóa marker để ép nạp lại lên dữ liệu đang dùng.

Snapshot giữ nội dung và tài khoản local, không chuyển `auth_sessions`. Draft trong IndexedDB/localStorage của trình duyệt không nằm trong database server nên không di chuyển. Nếu lần restore đầu bị gián đoạn giữa database/media, script từ chối ghi đè và cần xử lý có chủ đích trước khi thử lại.
