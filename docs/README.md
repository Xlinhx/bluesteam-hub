# BlueSTEAM v2 — Hệ Thống Tài Liệu Kỹ Thuật Dự Án (Documentation Index)

Chào mừng bạn đến với tài liệu kỹ thuật của dự án **Ocean Immersive Learning (BlueSTEAM v2)**.
Hệ thống tài liệu được chuẩn hóa và đánh số tuần tự từ `01` đến `13` theo tiến trình nhận thức: từ bối cảnh và triết lý, mô hình sản phẩm/dữ liệu, kiến trúc giao diện người dùng, đến đặc tả chi tiết, nghiên cứu, quyết định kiến trúc, quy chuẩn nghiệm thu và bộ mockups thiết kế tham chiếu.

---

## Mục Lục Đọc Tuần Tự (Reading Order)

### 1. Bối Cảnh & Triết Lý Cốt Lõi
- **[01-PROJECT_CONTEXT.md](./01-PROJECT_CONTEXT.md)**: Bối cảnh dự án cốt lõi — Mục tiêu giáo dục STEAM, đối tượng học sinh (bao gồm trẻ chưa biết chữ), giáo viên, các năng lực then chốt và quy tắc diễn giải nội dung.
- **[02-PHILOSOPHY.md](./02-PHILOSOPHY.md)**: Triết lý kiến trúc & sư phạm — Nguyên tắc không trẻ con hóa, thao tác xúc giác (tactile), chuyển động định hướng và các bất biến sư phạm.

### 2. Mô Hình Sản Phẩm & Nội Dung
- **[03-PRODUCT_MODEL.md](./03-PRODUCT_MODEL.md)**: Bản chất các khái niệm sản phẩm — Định nghĩa rõ ràng vai trò Khám phá, Hành trình, Lớp học, Trải nghiệm, Trình chiếu.
- **[04-CONTENT_MODEL.md](./04-CONTENT_MODEL.md)**: Mô hình nội dung & dữ liệu khoa học — Bài học, bộ sưu tập sinh vật, trạm quan sát, mô phỏng sinh thái và tính toàn vẹn khoa học biển.

### 3. Kiến Trúc UX & Hệ Thống Thiết Kế
- **[05-UX_ARCHITECTURE.md](./05-UX_ARCHITECTURE.md)**: Kiến trúc trải nghiệm người dùng — Mật độ bề mặt, cây định tuyến chính thống (Học liệu, Tương tác, Sáng tạo, Hồ sơ) và 4 shell chuyên biệt.
- **[06-DESIGN_SYSTEM_CONTRACT.md](./06-DESIGN_SYSTEM_CONTRACT.md)**: Quy chuẩn thiết kế giao diện & Anti-AI-slop — Bảng màu OKLCH, Typography Inter/Cabinet, thiết kế chuẩn Living Ocean và danh sách cấm tuyệt đối phong cách AI rẻ tiền.
- **[07-EXPERIENCE_CONTRACT.md](./07-EXPERIENCE_CONTRACT.md)**: Hợp đồng trải nghiệm tương tác — Trạng thái runtime, mô phỏng 3D WebGL, engine âm thanh Web Audio và khả năng trình chiếu.
- **[08-DEMO_AND_SYNC_CONTRACT.md](./08-DEMO_AND_SYNC_CONTRACT.md)**: Giao thức lưu trữ & đồng bộ — Lưu trữ cục bộ LocalStorage và đồng bộ thời gian thực giữa Giáo viên - Học sinh qua BroadcastChannel.

### 4. Đặc Tả Chi Tiết (Specifications)
- **[09-SPECIFICATIONS/](./09-SPECIFICATIONS/)**: Thư mục đặc tả kỹ thuật chi tiết:
  - **[09-01-PAGE_SPECS.md](./09-SPECIFICATIONS/09-01-PAGE_SPECS.md)**: Đặc tả chi tiết 35 màn hình thuộc tất cả các phân hệ.
  - **[09-02-COMPONENT_SPEC.md](./09-SPECIFICATIONS/09-02-COMPONENT_SPEC.md)**: Đặc tả thư viện component, props, variants và accessibility.
  - **[09-03-MOTION_SPEC.md](./09-SPECIFICATIONS/09-03-MOTION_SPEC.md)**: Đặc tả vi chuyển động, spring physics, chuyển cảnh và phản hồi xúc giác.
  - **[09-04-ASSET_SPEC.md](./09-SPECIFICATIONS/09-04-ASSET_SPEC.md)**: Quy chuẩn asset đồ họa, tỷ lệ khung hình, định dạng và tối ưu nén.
  - **[09-05-REFERENCE_RULES.md](./09-SPECIFICATIONS/09-05-REFERENCE_RULES.md)**: Quy tắc đối chiếu màn hình chạy thực tế với bản thiết kế.
  - **[09-06-REFERENCE_CORRECTIONS.md](./09-SPECIFICATIONS/09-06-REFERENCE_CORRECTIONS.md)**: Bảng các điều chỉnh chuẩn hóa khi mockup gốc có sai lệch.

### 5. Nghiên Cứu Chuyên Sâu (Research)
- **[10-RESEARCH/](./10-RESEARCH/)**: Các báo cáo nghiên cứu làm cơ sở ra quyết định:
  - **[10-01-child-ux.md](./10-RESEARCH/10-01-child-ux.md)**: Nghiên cứu UX cho trẻ mầm non và tiểu học chưa biết đọc.
  - **[10-02-web-3d-performance.md](./10-RESEARCH/10-02-web-3d-performance.md)**: Khảo sát hiệu năng WebGL/Three.js trên thiết bị cấu hình thấp.
  - **[10-03-whole-class-simulation.md](./10-RESEARCH/10-03-whole-class-simulation.md)**: Mô phỏng tương tác đồng thời trên màn hình chung của cả lớp.
  - **[10-04-video-rendering-options.md](./10-RESEARCH/10-04-video-rendering-options.md)**: Khảo sát các giải pháp phát media và player sinh học.

### 6. Quyết Định Kiến Trúc (Architecture Decision Records - ADRs)
- **[11-DECISIONS/](./11-DECISIONS/)**: Nhật ký các quyết định kiến trúc quan trọng:
  - **[11-01-001-experience-domain-model.md](./11-DECISIONS/11-01-001-experience-domain-model.md)**: ADR-001 — Phân tách miền dữ liệu trải nghiệm.
  - **[11-02-002-local-demo-transport.md](./11-DECISIONS/11-02-002-local-demo-transport.md)**: ADR-002 — Cơ chế đồng bộ cục bộ BroadcastChannel.
  - **[11-03-003-presentation-capability.md](./11-DECISIONS/11-03-003-presentation-capability.md)**: ADR-003 — Trình chiếu như một năng lực độc lập.
  - **[11-04-004-single-living-ocean-style.md](./11-DECISIONS/11-04-004-single-living-ocean-style.md)**: ADR-004 — Thống nhất duy nhất một phong cách Living Ocean.

### 7. Thẩm Định & Nghiệm Thu (Verification)
- **[12-VERIFICATION/](./12-VERIFICATION/)**: Thư mục tiêu chuẩn kiểm chứng chất lượng:
  - **[12-01-ACCEPTANCE.md](./12-VERIFICATION/12-01-ACCEPTANCE.md)**: Tiêu chuẩn nghiệm thu các cột mốc Milestone M1 đến M6.
  - **[12-02-SCENE_INDEX.md](./12-VERIFICATION/12-02-SCENE_INDEX.md)**: Chỉ mục 35 cảnh chuẩn kèm mã định danh tham chiếu.
  - **[12-03-REVIEW_GUIDE.md](./12-VERIFICATION/12-03-REVIEW_GUIDE.md)**: Hướng dẫn thẩm định thị giác theo thang điểm 5 tiêu chí Rubric.

### 8. Mockups Thiết Kế Nội Bộ (Internal Design Mockups)
- **[mockups/](./mockups/)**: Thư mục chứa toàn bộ 33 ảnh mockup thiết kế chuẩn hóa được đánh số tuần tự `01-33` (trong đó toàn bộ các màn giáo viên và trình chiếu được xếp ở các số cuối cùng `27-33`), cùng bảng tra cứu chi tiết:
  - **[mockups/README.md](./mockups/README.md)**: Bảng tra cứu ánh xạ chi tiết 33 mockups theo Route URL và chức năng.

### 9. Lưu Trữ Lịch Sử (Archive)
- **[archive/bluesteam-v2-milestones/](./archive/bluesteam-v2-milestones/)**: Lưu trữ các tài liệu vận hành và nhật ký của các cột mốc trước đây (`START_HERE.md`, `PLAN_INTAKE.md`, `PROGRESS.md`, `GENERATION_LOG.md`...).
