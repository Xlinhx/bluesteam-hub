# Nền Tảng Học Tập Trực Quan Đại Dương (Ocean Immersive Learning)

Nền tảng học tập khoa học trực quan, tương tác cao cấp dành cho học sinh nhỏ tuổi (bao gồm trẻ chưa biết đọc/viết) và giáo viên.

## Các Trụ Cột Cốt Lõi
- **Ưu tiên trẻ chưa biết đọc, nhưng không trẻ con hóa**: Trẻ tiếp thu quy luật tự nhiên thông qua thao tác trực tiếp, mối quan hệ không gian, hình ảnh triển lãm chân thực, chuyển động và âm thanh chỉ dẫn — không dùng những đoạn văn bản dài dòng hay hình vẽ hoạt hình ngô nghê.
- **Giáo viên tự tin & chuẩn xác**: Công cụ nhanh, chuyên nghiệp, mật độ thông tin cao giúp giáo viên chuẩn bị bài dạy, xem trước góc nhìn học sinh, điều phối nhịp độ lớp học và trình chiếu dễ dàng.
- **Phân tách theo trách nhiệm (Modular by responsibility)**: Ranh giới rõ ràng giữa Khám phá (chiều rộng nội dung), Hành trình (tiến trình dẫn dắt), Lớp học (điều phối trực tiếp), Trải nghiệm (mô phỏng, video, thử thách) và Trình chiếu (năng lực hiển thị).
- **Trình chiếu là một năng lực, không phải máy chiếu**: Bất kỳ mô phỏng hay bài học nào đều có thể trình chiếu sạch sẽ ra màn hình lớn mà không bị trói buộc vào tư duy phần cứng.
- **Sáu giả thuyết thiết kế (6 Variants)**: Đối chiếu giữa 3 trục cấu trúc thông tin (Hành trình, Khám phá, Lớp học) và 2 phong cách thị giác (Scientific Editorial và Tactile Lab) trên cùng một nền tảng mã nguồn dùng chung.

## Danh Mục Tài Liệu Đặc Tả (Xem chi tiết tại [docs/README.md](docs/README.md))
- [`docs/01-PROJECT_CONTEXT.md`](docs/01-PROJECT_CONTEXT.md) — Bối cảnh dự án cốt lõi (Mục tiêu, Đối tượng, Năng lực, Quy tắc diễn giải).
- [`docs/02-PHILOSOPHY.md`](docs/02-PHILOSOPHY.md) — Triết lý kiến trúc, sư phạm và nguyên tắc bất biến.
- [`docs/03-PRODUCT_MODEL.md`](docs/03-PRODUCT_MODEL.md) — Phân loại bản chất các khái niệm sản phẩm.
- [`docs/04-CONTENT_MODEL.md`](docs/04-CONTENT_MODEL.md) — Mô hình dữ liệu bài học, bộ sưu tập và nguồn gốc tư liệu.
- [`docs/05-UX_ARCHITECTURE.md`](docs/05-UX_ARCHITECTURE.md) — Cây định tuyến, mật độ bề mặt và phân hệ shell.
- [`docs/06-DESIGN_SYSTEM_CONTRACT.md`](docs/06-DESIGN_SYSTEM_CONTRACT.md) — Quy chuẩn thị giác Living Ocean, danh sách cấm Anti-AI-slop và hệ thống token.
- [`docs/07-EXPERIENCE_CONTRACT.md`](docs/07-EXPERIENCE_CONTRACT.md) — Hợp đồng runtime mô phỏng, âm thanh và năng lực trình chiếu.
- [`docs/08-DEMO_AND_SYNC_CONTRACT.md`](docs/08-DEMO_AND_SYNC_CONTRACT.md) — Lưu trữ cục bộ và giao thức đồng bộ BroadcastChannel.
- [`docs/09-SPECIFICATIONS/`](docs/09-SPECIFICATIONS/) — Thư mục đặc tả chi tiết 35 màn hình, component, motion, asset và reference rules.
- [`docs/10-RESEARCH/`](docs/10-RESEARCH/) — Các báo cáo nghiên cứu UX trẻ em, WebGL performance, mô phỏng lớp học.
- [`docs/11-DECISIONS/`](docs/11-DECISIONS/) — Nhật ký quyết định kiến trúc (ADRs 001 - 004).
- [`docs/12-VERIFICATION/`](docs/12-VERIFICATION/) — Tiêu chuẩn nghiệm thu, chỉ mục 35 scene và hướng dẫn rubric thẩm định.
- [`docs/mockups/`](docs/mockups/) — Thư viện mockup thiết kế nội bộ và bảng tra cứu route URL.

## Lệnh Chạy Dự Án
```bash
npm install      # Cài đặt thư viện
npm run dev      # Khởi động server phát triển cục bộ
npm run build    # Biên dịch kiểm tra lỗi TypeScript và đóng gói
npm test         # Chạy bộ kiểm thử tự động
```
