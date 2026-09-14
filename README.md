# Nền Tảng Học Tập Trực Quan Đại Dương (Ocean Immersive Learning)

Nền tảng học tập khoa học trực quan, tương tác cao cấp dành cho học sinh nhỏ tuổi (bao gồm trẻ chưa biết đọc/viết) và giáo viên.

## Các Trụ Cột Cốt Lõi
- **Ưu tiên trẻ chưa biết đọc, nhưng không trẻ con hóa**: Trẻ tiếp thu quy luật tự nhiên thông qua thao tác trực tiếp, mối quan hệ không gian, hình ảnh triển lãm chân thực, chuyển động và âm thanh chỉ dẫn — không dùng những đoạn văn bản dài dòng hay hình vẽ hoạt hình ngô nghê.
- **Giáo viên tự tin & chuẩn xác**: Công cụ nhanh, chuyên nghiệp, mật độ thông tin cao giúp giáo viên chuẩn bị bài dạy, xem trước góc nhìn học sinh, điều phối nhịp độ lớp học và trình chiếu dễ dàng.
- **Phân tách theo trách nhiệm (Modular by responsibility)**: Ranh giới rõ ràng giữa Khám phá (chiều rộng nội dung), Hành trình (tiến trình dẫn dắt), Lớp học (điều phối trực tiếp), Trải nghiệm (mô phỏng, video, thử thách) và Trình chiếu (năng lực hiển thị).
- **Trình chiếu là một năng lực, không phải máy chiếu**: Bất kỳ mô phỏng hay bài học nào đều có thể trình chiếu sạch sẽ ra màn hình lớn mà không bị trói buộc vào tư duy phần cứng.
- **Sáu giả thuyết thiết kế (6 Variants)**: Đối chiếu giữa 3 trục cấu trúc thông tin (Hành trình, Khám phá, Lớp học) và 2 phong cách thị giác (Scientific Editorial và Tactile Lab) trên cùng một nền tảng mã nguồn dùng chung.

## Danh Mục Tài Liệu Đặc Tả
- [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) — Bối cảnh dự án cốt lõi (Mục tiêu, Đối tượng, Năng lực, Quy tắc diễn giải).
- [`docs/PHILOSOPHY.md`](docs/PHILOSOPHY.md) — Triết lý kiến trúc, sư phạm và nguyên tắc bất biến.
- [`docs/PRODUCT_MODEL.md`](docs/PRODUCT_MODEL.md) — Phân loại bản chất các khái niệm sản phẩm.
- [`docs/UX_ARCHITECTURE.md`](docs/UX_ARCHITECTURE.md) — Ma trận 6 biến thể, mật độ bề mặt và cây định tuyến.
- [`docs/DESIGN_CONTRACT.md`](docs/DESIGN_CONTRACT.md) — Quy chuẩn thị giác, danh sách cấm Anti-AI-slop và hệ thống token.
- [`docs/EXPERIENCE_CONTRACT.md`](docs/EXPERIENCE_CONTRACT.md) — Hợp đồng runtime mô phỏng và năng lực trình chiếu.
- [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md) — Mô hình dữ liệu bài học, bộ sưu tập và nguồn gốc tư liệu.
- [`docs/DEMO_CONTRACT.md`](docs/DEMO_CONTRACT.md) — Lưu trữ cục bộ và giao thức đồng bộ BroadcastChannel.

## Lệnh Chạy Dự Án
```bash
npm install      # Cài đặt thư viện
npm run dev      # Khởi động server phát triển cục bộ
npm run build    # Biên dịch kiểm tra lỗi TypeScript và đóng gói
npm test         # Chạy bộ kiểm thử tự động
```
